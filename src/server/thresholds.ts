import crypto from 'crypto';

// ============================================================================
// VERSIONED THRESHOLD DOCUMENTS (§9.2 — one source of truth for thresholds)
//
// Every clinical decision threshold used by the rules engine and the privacy
// safeguards lives in a versioned JSON document under src/config/thresholds/.
// This loader is the ONLY way the engine reads thresholds: it validates each
// document (schemaVersion, required keys), computes a SHA-256 integrity hash
// (same governance pattern as the signed rule table, TEST-S5), and exposes
// typed constants. Threshold VALUES are never computed or tuned in code.
//
// Changing a threshold = shipping a new document version (v2) with a new
// effectiveDate; the hash below makes every deployed value auditable via
// GET /api/governance/thresholds.
// ============================================================================

import whoCvdDoc from '../config/thresholds/who-cvd.v1.json';
import diabetesScreeningDoc from '../config/thresholds/diabetes-screening.v1.json';
import bloodPressureDoc from '../config/thresholds/blood-pressure.v1.json';
import pediatricDoc from '../config/thresholds/pediatric.v1.json';
import adultScreeningDoc from '../config/thresholds/adult-screening.v1.json';
import privacyDoc from '../config/thresholds/privacy.v1.json';

const SCHEMA_VERSION = 1;

interface ThresholdDocument {
  schemaVersion: number;
  documentId: string;
  version: string;
  effectiveDate: string;
  source: string;
  thresholds: Record<string, unknown>;
}

/** Validates one document and returns its canonical SHA-256 hash (16 hex chars). */
function validateAndHash(doc: ThresholdDocument): string {
  if (!doc || doc.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Threshold document "${doc?.documentId ?? '?'}" has unsupported schemaVersion ${doc?.schemaVersion}`);
  }
  if (!doc.documentId || !doc.version || !doc.effectiveDate || !doc.source) {
    throw new Error(`Threshold document "${doc.documentId}" is missing governance metadata (version/effectiveDate/source)`);
  }
  if (!doc.thresholds || typeof doc.thresholds !== 'object') {
    throw new Error(`Threshold document "${doc.documentId}" has no thresholds object`);
  }
  // Canonical hash over the full document content (insertion order is stable for a given file)
  return crypto.createHash('sha256').update(JSON.stringify(doc)).digest('hex').slice(0, 16);
}

export const WHO_CVD_THRESHOLDS = whoCvdDoc.thresholds as {
  riskYellowPercent: number;
  riskOrangePercent: number;
  uncertaintySbpMmHg: number;
  uncertaintyBmiKgM2: number;
  counterfactualSbpTargetMmHg: number;
  counterfactualBmiTargetKgM2: number;
  domainAgeMinYears: number;
  domainAgeMaxYears: number;
};

export const DIABETES_SCREENING_THRESHOLDS = diabetesScreeningDoc.thresholds as {
  findriscScreeningScore: number;
  findriscHighRiskScore: number;
  hba1cPrediabetesPercent: number;
  hba1cDiabetesPercent: number;
  asianAdaptedBmiThresholdKgM2: number;
};

export const BLOOD_PRESSURE_THRESHOLDS = bloodPressureDoc.thresholds as {
  adultElevatedSysMmHg: number;
  adultElevatedDiaMmHg: number;
  adultHighSysMmHg: number;
  adultHighDiaMmHg: number;
  crisisSysMmHg: number;
  crisisDiaMmHg: number;
  adolescentAgeMinYears: number;
  adolescentSysMmHg: number;
  adolescentDiaMmHg: number;
  pregnancySysMmHg: number;
  pregnancyDiaMmHg: number;
  pregnancySevereSysMmHg: number;
  pregnancySevereDiaMmHg: number;
};

export const PEDIATRIC_THRESHOLDS = pediatricDoc.thresholds as {
  severeMalnutritionWhzBelow: number;
  severeMalnutritionMuacBelowMm: number;
  vaccineDelayFollowupDays: number;
  vaccineDelayPriorityDays: number;
  anemiaScreeningWindowMonths: [number, number];
  anemiaHbThresholdGdl: number;
  mchatFollowUpScore: number;
  mchatHighScore: number;
  bmiForAgeZWatchAbove: number;
  bmiForAgeZWatchBelow: number;
  bmiForAgeZOrangeAbove: number;
  bmiForAgeZOrangeBelow: number;
  adolescentVaccinesAgeMinYears: number;
};

export const ADULT_SCREENING_THRESHOLDS = adultScreeningDoc.thresholds as {
  cervicalScreeningAgeMinYears: number;
  cervicalScreeningAgeMaxYears: number;
  mammographyAgeMinYears: number;
  mammographyAgeMaxYears: number;
  colorectalAgeMinYears: number;
  chronicVisitGapMonths: number;
  fallScreeningAgeMinYears: number;
};

export const PRIVACY_THRESHOLDS = privacyDoc.thresholds as {
  minCellSize: number;
  smallSampleMinSize: number;
  smallSampleMaxSize: number;
  insufficientEventsThreshold: number;
  wilsonZ: number;
};

// Fail fast at startup if any document is malformed
const _hashes = new Map<string, string>();
const ALL_THRESHOLD_DOCS = [
  whoCvdDoc,
  diabetesScreeningDoc,
  bloodPressureDoc,
  pediatricDoc,
  adultScreeningDoc,
  privacyDoc,
] as ThresholdDocument[];
for (const doc of ALL_THRESHOLD_DOCS) {
  _hashes.set(doc.documentId, validateAndHash(doc));
}

/** Governance view: every loaded threshold document with its integrity hash. */
export const THRESHOLD_DOCUMENTS: Array<{
  documentId: string;
  version: string;
  effectiveDate: string;
  sha256: string;
  source: string;
}> = ALL_THRESHOLD_DOCS.map((doc) => ({
  documentId: doc.documentId,
  version: doc.version,
  effectiveDate: doc.effectiveDate,
  sha256: _hashes.get(doc.documentId)!,
  source: doc.source,
}));

/** Pure helper for TEST-G2: recompute the hash of a document on demand. */
export function hashThresholdDocument(doc: ThresholdDocument): string {
  return validateAndHash(doc);
}

/**
 * Governance check (TEST-G2): every loaded document re-validates and its
 * recomputed hash must still match the stored one — proves no tampering since
 * module load (same invariant spirit as the signed rule table, TEST-S5).
 */
export function verifyThresholdDocumentIntegrity(): boolean {
  for (const doc of ALL_THRESHOLD_DOCS) {
    if (hashThresholdDocument(doc) !== _hashes.get(doc.documentId)) return false;
  }
  return true;
}

export type { ThresholdDocument };
