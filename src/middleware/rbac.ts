import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { db } from '../db/index.ts';
import { patients } from '../db/schema.ts';

// ============================================================================
// ROLE-BASED ACCESS CONTROL + PATIENT-SCOPE ENFORCEMENT (§6 — accès par rôle,
// scoping par propriété). Every /api route is allow-listed per role (deny by
// default). Personal roles (patient/parent) may only reach patient records in
// their OWNED scope: their linked records plus family members affiliated to
// those records (parentUserId). Professional roles (clinician/coordinator)
// operate at facility scope (demo-wide, documented H-ref). The public_health
// role has NO individual-record access — aggregated observatory only (§7.3).
// ============================================================================

export type Role = 'patient' | 'parent' | 'clinician' | 'coordinator' | 'public_health';

export const ALL_ROLES: Role[] = ['patient', 'parent', 'clinician', 'coordinator', 'public_health'];

/**
 * Documented role → route matrix. Entries are route prefixes; an entry may
 * contain at most one ':id' segment (matched as a concrete segment).
 * Keep this matrix in sync with what the portals actually call:
 *  - ClinicianPortal: /api/clinician/*, /api/family (detachments).
 *  - CoordinatorPortal: /api/coordinator/*, /api/family (search/detachments),
 *    /api/clinician/analyze-patient + invitation (affiliate minors, outreach).
 *  - PatientPortal (patient & parent): /api/patient/*, /api/family (search, OTP,
 *    self-detachment request).
 *  - Observatory (public_health): /api/observatory/* only.
 *  - EvidenceGovernance: /api/governance/* (public), simulator (any auth role).
 */
export const ROLE_ROUTE_MATRIX: Record<Role, string[]> = {
  patient: [
    '/api/auth',
    '/api/patient/profile',
    '/api/patient/family',
    '/api/family/search-parents',
    '/api/governance',
    '/api/coordinator/simulate-logistics',
  ],
  parent: [
    '/api/auth',
    '/api/patient/profile',
    '/api/patient/family',
    '/api/family/search-parents',
    '/api/governance',
    '/api/coordinator/simulate-logistics',
  ],
  clinician: [
    '/api/auth',
    '/api/clinician',
    '/api/family/pending-detachments',
    '/api/family/approve-majority-detachment',
    '/api/governance',
    '/api/coordinator/simulate-logistics',
  ],
  coordinator: [
    '/api/auth',
    '/api/coordinator',
    '/api/family/search-parents',
    '/api/family/pending-detachments',
    '/api/family/approve-majority-detachment',
    '/api/clinician/analyze-patient',
    '/api/clinician/patients/:id/invitation',
    '/api/governance',
  ],
  public_health: ['/api/auth', '/api/observatory', '/api/governance', '/api/coordinator/simulate-logistics'],
};

function matrixEntryToRegex(entry: string): RegExp {
  // allow one ':id' wildcard segment; escape the rest
  const pattern = entry
    .split('/')
    .map((seg) => (seg === ':id' ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${pattern}(/|$)`);
}

const compiledMatrix = Object.fromEntries(
  Object.entries(ROLE_ROUTE_MATRIX).map(([role, entries]) => [role, entries.map(matrixEntryToRegex)])
) as Record<Role, RegExp[]>;

/** Pure route-authorization check (unit-tested in TEST-G1). */
export function isRouteAllowed(role: string, path: string): boolean {
  const entries = compiledMatrix[role as Role];
  if (!entries) return false; // unknown role -> deny
  return entries.some((re) => re.test(path));
}

/** Express middleware factory: allow only the listed roles (deny by default). */
export function requireRole(...allowed: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role as Role)) {
      return res.status(403).json({
        error: 'Forbidden: your role is not authorized for this endpoint',
        role: role ?? null,
        requiredRoles: allowed,
      });
    }
    next();
  };
}

export interface PatientScope {
  mode: 'professional' | 'linked';
  linkedPatientIds: string[];
}

/**
 * Resolves the data-ownership scope of the current user:
 *  - professional roles (clinician/coordinator): facility-wide demo scope.
 *  - personal roles (patient/parent): linked records + affiliated family members.
 *  - public_health / unknown: no individual scope.
 */
export async function resolvePatientScope(req: AuthRequest): Promise<PatientScope | null> {
  const role = req.user?.role as Role | undefined;
  if (role === 'clinician' || role === 'coordinator') {
    return { mode: 'professional', linkedPatientIds: [] };
  }
  if (role !== 'patient' && role !== 'parent') return null;
  // linkedPatientIds are attached at authentication time (demo accounts or the
  // users table row synced from Firebase).
  const linked = req.user?.linkedPatientIds ?? [];
  // Family affiliation: children records whose parentUserId is one of the owned records
  const family: string[] = [];
  if (linked.length > 0) {
    const rows = await db
      .select({ id: patients.id, parentUserId: patients.parentUserId })
      .from(patients);
    for (const row of rows) {
      if (row.parentUserId && linked.includes(row.parentUserId)) family.push(row.id);
    }
  }
  return { mode: 'linked', linkedPatientIds: [...new Set([...linked, ...family])] };
}

/** Pure scope check (unit-tested in TEST-G1). */
export function patientScopeAllows(scope: PatientScope, patientId: string): boolean {
  if (scope.mode === 'professional') return true;
  return scope.linkedPatientIds.includes(patientId);
}

/**
 * Express middleware for /:patientId endpoints: personal roles may only touch
 * records inside their owned scope (own record + affiliated family members).
 */
export function requirePatientScope() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const patientId = req.params.id || req.params.patientId;
      if (!patientId) return res.status(400).json({ error: 'Missing patient id' });
      const scope = await resolvePatientScope(req);
      if (!scope) {
        return res.status(403).json({
          error: 'Forbidden: individual patient records are not accessible with this role',
          role: req.user?.role ?? null,
        });
      }
      if (!patientScopeAllows(scope, patientId)) {
        return res.status(403).json({
          error: 'Forbidden: this patient record is outside your authorized scope',
        });
      }
      next();
    } catch (error) {
      console.error('Error resolving patient scope:', error);
      return res.status(500).json({ error: 'Failed to resolve access scope' });
    }
  };
}

/** One-off scope check usable inside handlers (returns null when access must be denied). */
export async function assertPatientScope(
  req: AuthRequest,
  patientId: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const scope = await resolvePatientScope(req);
  if (!scope) return { ok: false, status: 403, error: 'Forbidden: individual patient records are not accessible with this role' };
  if (!patientScopeAllows(scope, patientId)) return { ok: false, status: 403, error: 'Forbidden: this patient record is outside your authorized scope' };
  return { ok: true };
}
