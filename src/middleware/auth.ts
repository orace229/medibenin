import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; role: string; displayName: string; isDemo: boolean };
}

const DEMO_ACCOUNTS: Record<string, { uid: string; email: string; role: string; displayName: string; preferredLanguage: string; linkedPatientIds: string[] }> = {
  'demo-token-patient': {
    uid: 'demo-patient-tariq',
    email: 'tariq.nadim@demo.medisense.ae',
    role: 'patient',
    displayName: 'Tariq Al-Nadim (36y)',
    preferredLanguage: 'en',
    linkedPatientIds: ['PT-36Y-TARIQ'],
  },
  'demo-token-parent': {
    uid: 'demo-parent-amira',
    email: 'amira.mansoor@demo.medisense.ae',
    role: 'parent',
    displayName: 'Amira Al-Mansoor (Parent)',
    preferredLanguage: 'en',
    linkedPatientIds: ['PT-18M-ZAYED', 'PT-14Y-LAYLA'],
  },
  'demo-token-clinician': {
    uid: 'demo-clinician-sydney',
    email: 'dr.kpegbe@abudhabi-health.demo.ae',
    role: 'clinician',
    displayName: 'Dr. Sydney Kpegbe, MD',
    preferredLanguage: 'en',
    linkedPatientIds: [],
  },
  'demo-token-coordinator': {
    uid: 'demo-coordinator-orace',
    email: 'orace.coord@abudhabi-health.demo.ae',
    role: 'coordinator',
    displayName: 'Orace Attinmawassonou (Care Coordinator)',
    preferredLanguage: 'en',
    linkedPatientIds: [],
  },
  'demo-token-public-health': {
    uid: 'demo-ph-bienderan',
    email: 'bienderan.epi@doh-observatory.demo.ae',
    role: 'public_health',
    displayName: 'Bienderan Egbo (Public Health Lead)',
    preferredLanguage: 'en',
    linkedPatientIds: [],
  },
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Check if token matches a pre-configured Demo Sandbox Role token
  if (DEMO_ACCOUNTS[token]) {
    const demoAccount = DEMO_ACCOUNTS[token];
    try {
      await getOrCreateUser(
        demoAccount.uid,
        demoAccount.email,
        demoAccount.displayName,
        demoAccount.role,
        demoAccount.linkedPatientIds
      );
      req.user = {
        uid: demoAccount.uid,
        email: demoAccount.email,
        role: demoAccount.role,
        displayName: demoAccount.displayName,
        isDemo: true,
      };
      return next();
    } catch (err) {
      console.error('Error syncing demo user to DB:', err);
      return res.status(500).json({ error: 'Failed to initialize demo session' });
    }
  }

  // 2. Otherwise verify real Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || 'user@medisense.ae',
      decodedToken.name || decodedToken.email?.split('@')[0] || 'Authenticated User',
      'clinician',
      ['PT-36Y-TARIQ']
    );
    req.user = {
      ...decodedToken,
      role: dbUser.role,
      displayName: dbUser.displayName,
      isDemo: false,
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
