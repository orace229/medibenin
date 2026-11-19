import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import {
  listAIGatewayModels,
  getFunctionURL,
  getNeonAuthBaseUrl,
  getNeonAuthJwksUrl,
  sealRealtimeQuery,
} from './src/lib/neon.ts';
import { eq, desc, count } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  accessRequests,
  consents,
  flags,
  notifications,
  patients,
  recommendations,
  ruleTables,
  usageLogs,
  users,
} from './src/db/schema.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  requireRole,
  requirePatientScope,
  assertPatientScope,
  type Role,
} from './src/middleware/rbac.ts';
import { ensureSeededDatabase } from './src/server/seedCohort.ts';
import {
  computeReferralHmac,
  evaluatePatientRules,
  generateReferralCode,
  getCanonicalSignedRuleTable,
  verifyRuleTableSignature,
} from './src/server/rulesEngine.ts';
import {
  computeLogisticsAndM1,
  generateCulturallyAdaptedInvitation,
  validateM2MessageSafety,
} from './src/server/mlLogistics.ts';
import {
  getObservatorySummary,
  BENCHMARK_SCENARIOS,
  COHORT_SIZE_PER_SEED,
  type BenchmarkScenario,
} from './src/server/benchmarkEngine.ts';
import { runAllAcceptanceTests } from './src/server/acceptanceSuite.ts';
import { THRESHOLD_DOCUMENTS } from './src/server/thresholds.ts';
import { CARE_SCHEDULE_METADATA } from './src/server/careSchedules.ts';
import { GROWTH_REFERENCE_METADATA } from './src/server/growthReference.ts';
import { resolvePathwayConflict, type PathwayState } from './src/server/syncConflicts.ts';
import { evaluateInvitationPolicy, isPurposeAllowed } from './src/server/pathwayPolicy.ts';
import { buildReminderPlan, buildScreeningPlan } from './src/server/screeningPlan.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // In-memory store for 6-digit SMS OTP family verification codes
  const familySmsOtpStore = new Map<string, { code: string; expiresAt: number }>();

  // ── Promise-singleton pattern: all callers share the same in-flight promise,
  // so the DB seed only runs once and concurrent requests don't race.
  let initPromise: Promise<void> | null = null;
  const ensureInit = (): Promise<void> => {
    if (!initPromise) {
      initPromise = (async () => {
        await ensureSeededDatabase(20261120);
        // Ensure Zayed (18m) and Layla (14y) are affiliated to Tariq (PT-36Y-TARIQ) for unified Patient Portal
        await Promise.all([
          db.update(patients).set({ parentUserId: 'PT-36Y-TARIQ' }).where(eq(patients.id, 'PT-18M-ZAYED')),
          db.update(patients).set({ parentUserId: 'PT-36Y-TARIQ' }).where(eq(patients.id, 'PT-14Y-LAYLA')),
        ]);

        // Ensure an 18-year-old affiliated child (Youssef Al-Nadim, 18y) exists to demonstrate Majority Detachment validation by the competent service
        const existingYoussef = await db
          .select()
          .from(patients)
          .where(eq(patients.id, 'PT-18Y-YOUSSEF'));
        if (!existingYoussef[0]) {
          await db.insert(patients).values({
            id: 'PT-18Y-YOUSSEF',
            displayName: 'Youssef Al-Nadim',
            ageYears: 18,
            ageMonths: 216,
            gestationalAgeWeeks: 40,
            sex: 'male',
            pathwayType: 'adolescent',
            isPersona: true,
            parentUserId: 'PT-36Y-TARIQ',
            region: 'Abu Dhabi',
            nationalityGroup: 'Emirati',
            insuranceCategory: 'Thiqa',
            preferredLanguage: 'fr',
            preferredChannel: 'SMS',
            preferFemalePractitioner: false,
            accessTimeMinutes: 15,
            missedVisitsCount: 0,
            facilityCenter: 'Al Bateen Healthcare Centre',
            overallLevel: 'green',
            overallCertainty: 'high',
            primaryReasonSummary:
              '18 years reached — Eligible for Majority Detachment & transition from WCV to autonomous Adult IFHAS portal',
            nextDueDate: '2026-12-10',
            preventionProgressDone: 4,
            preventionProgressTotal: 4,
            clinicalProfile: {
              systolicBp1: 118,
              diastolicBp1: 76,
              systolicBp2: 116,
              diastolicBp2: 74,
              bpZoneLabel: 'In target zone',
              weightKg: 68,
              heightCm: 176,
              bmi: 22.0,
              adolescentVaccinesUpToDate: true,
              anemiaScreeningDone: true,
              provenanceMap: { bp: 'V', bmi: 'V' },
              oldestMeasureMonths: 2,
            } as any,
          });

          await db
            .insert(consents)
            .values({
              patientId: 'PT-18Y-YOUSSEF',
              evaluationAndCalendar: true,
              channelReminders: true,
              shareWithFacility: true,
              anonymousStatistics: true,
              existingGenomicResult: false,
              adolescentAssentGiven: true,
            })
            .onConflictDoNothing();

          const refCode = generateReferralCode('PT-18Y-YOUSSEF', 20261120);
          await db
            .insert(recommendations)
            .values({
              id: 'REC-PT-18Y-YOUSSEF',
              patientId: 'PT-18Y-YOUSSEF',
              pathwayTitle: 'Transition Visit: WCV Adolescent to Adult IFHAS Autonomy (18y)',
              groupedActions: [
                {
                  actionTitle: 'Baseline Adult IFHAS Cardiometabolic Check',
                  directiveSource: 'Published National Preventive Schedule',
                  category: 'routine_prevention',
                },
              ],
              level: 'green',
              state: 'invited',
              dueDate: '2026-12-10',
              facilityName: 'Al Bateen Healthcare Centre',
              referralCodeDisplay: refCode,
              referralCodeHmac: computeReferralHmac(refCode),
              decisionAidText:
                'Having reached 18 years of age, your record is eligible for autonomous adult access upon validation by the competent healthcare service.',
              priorityScoreSprio: 22,
              mlNoShowProbM1: 0.12,
              mlTopFactorsM1: ['Transition 18y'],
              mlSuggestedAction: 'Standard reminder',
            })
            .onConflictDoNothing();
        }
      })();
    }
    return initPromise!;
  };

  // Consent helpers: a missing row keeps the historical default (allowed) but an
  // explicit `false` always blocks the corresponding action.
  const getConsentRow = async (patientId: string) => {
    const rows = await db.select().from(consents).where(eq(consents.patientId, patientId));
    return rows[0];
  };

  /**
   * Builds the personalized screening plan from freshly evaluated signed rules.
   * Returns null when the patient withdrew the evaluation consent: the portal
   * must not display a plan computed against a withdrawn purpose.
   */
  const computeScreeningPlanFor = async (
    patientId: string,
    locale: 'en' | 'fr' | 'ar' = 'en'
  ) => {
    const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
    if (!pRows[0]) return null;
    const p = pRows[0];
    const [consentRows, recRows] = await Promise.all([
      db.select().from(consents).where(eq(consents.patientId, patientId)),
      db.select().from(recommendations).where(eq(recommendations.patientId, patientId)),
    ]);
    if (!isPurposeAllowed(consentRows[0], 'evaluationAndCalendar')) return null;

    const evaluated = evaluatePatientRules(
      {
        id: p.id,
        ageYears: p.ageYears,
        ageMonths: p.ageMonths,
        gestationalAgeWeeks: p.gestationalAgeWeeks,
        sex: p.sex,
        pathwayType: p.pathwayType,
        nationalityGroup: p.nationalityGroup,
        clinicalProfile: p.clinicalProfile,
      },
      Boolean(consentRows[0]?.existingGenomicResult)
    );

    return buildScreeningPlan({
      patient: {
        ageYears: p.ageYears,
        ageMonths: p.ageMonths,
        sex: p.sex,
        pathwayType: p.pathwayType,
        clinicalProfile: (p.clinicalProfile || {}) as Record<string, any>,
      },
      flags: evaluated.flags,
      recommendation: recRows[0] || null,
      locale,
    });
  };

  const computeReminderPlanFor = async (
    patientId: string,
    locale: 'en' | 'fr' | 'ar' = 'en'
  ) => {
    const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
    if (!pRows[0]) return null;
    const p = pRows[0];
    const [recRows, notifRows, consentRows] = await Promise.all([
      db.select().from(recommendations).where(eq(recommendations.patientId, patientId)),
      db
        .select()
        .from(notifications)
        .where(eq(notifications.patientId, patientId))
        .orderBy(desc(notifications.sentAt)),
      db.select().from(consents).where(eq(consents.patientId, patientId)),
    ]);

    return buildReminderPlan({
      patient: {
        displayName: p.displayName,
        preferredLanguage: p.preferredLanguage,
        preferredChannel: p.preferredChannel,
        facilityCenter: p.facilityCenter,
        pathwayType: p.pathwayType,
      },
      recommendation: recRows[0] || null,
      notifications: notifRows,
      consentEnabled: isPurposeAllowed(consentRows[0], 'channelReminders'),
      locale,
    });
  };
  // =========================================================================
  // 1. SYSTEM & GOVERNANCE VERIFICATION ENDPOINTS (Public for Phase 0 checks)
  // =========================================================================
  app.get('/api/demo/counts', async (_req, res) => {
    try {
      await ensureInit();
      const total = await db.select({ value: count() }).from(patients);
      const panelSize = total[0]?.value ?? 0;
      const cohortSize = COHORT_SIZE_PER_SEED;
      res.json({ cohortSize, panelSize, story: `Demo panel of ${panelSize} patients drawn from a ${cohortSize.toLocaleString('en-US')}-person synthetic cohort` });
    } catch (error: any) {
      console.error('Failed to load demo counts:', error);
      res.status(500).json({ error: 'Failed to load demo counts' });
    }
  });

  app.get('/api/governance/status', async (_req, res) => {
    try {
      await ensureInit();
      const canonical = getCanonicalSignedRuleTable();
      const signatureValid = verifyRuleTableSignature(canonical);
      const dbRules = await db.select().from(ruleTables);

      res.json({
        tableCode: canonical.tableCode,
        version: canonical.version,
        signedBy: canonical.signedBy,
        signerRole: canonical.signerRole,
        reviewDate: canonical.reviewDate,
        signatureValid,
        rulesCount: canonical.rules.length,
        dbRegistered: dbRules.length > 0,
        rulesSummary: canonical.rules,
        careSchedule: CARE_SCHEDULE_METADATA,
        growthReferences: GROWTH_REFERENCE_METADATA,
      });
    } catch (error: any) {
      console.error('Failed to verify governance status:', error);
      res.status(500).json({ error: error.message || 'Governance check failed' });
    }
  });

  app.get('/api/governance/acceptance-tests', (_req, res) => {
    try {
      const report = runAllAcceptanceTests();
      res.json(report);
    } catch (error: any) {
      console.error('Acceptance suite error:', error);
      res.status(500).json({ error: error.message || 'Acceptance suite failed' });
    }
  });

  // Public, non-PHI governance view of every versioned threshold document
  // (§9.2 — auditable, hash-verified clinical thresholds; same pattern as the
  // signed rule table). Any change to a threshold value must ship as a new
  // document version; this endpoint exposes exactly what is deployed.
  app.get('/api/governance/thresholds', (_req, res) => {
    res.json({
      documents: THRESHOLD_DOCUMENTS,
      note: 'Versioned threshold documents (SHA-256 integrity hashes). Threshold values are governed by these documents, never tuned in code.',
    });
  });

  // =========================================================================
  // 2. AUTH & ACCESS REQUEST ENDPOINTS
  // =========================================================================
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const uid = req.user!.uid;
      const rows = await db.select().from(users).where(eq(users.uid, uid));
      res.json({ user: rows[0] || req.user });
    } catch (error: any) {
      console.error('Failed to fetch user session:', error);
      res.status(500).json({ error: 'Failed to fetch user session' });
    }
  });

  app.post('/api/auth/request-access', async (req, res) => {
    try {
      await ensureInit();
      const { fullName, professionalEmail, profession, facility, licenseNumber, preferredLanguage } = req.body;
      if (!fullName || !professionalEmail || !profession || !facility || !licenseNumber) {
        return res.status(400).json({ error: 'All professional registration fields are required.' });
      }
      const inserted = await db
        .insert(accessRequests)
        .values({
          fullName,
          professionalEmail,
          profession,
          facility,
          licenseNumber,
          preferredLanguage: preferredLanguage || 'en',
          status: 'pending_review',
        })
        .returning();
      res.json({
        status: 'received',
        request: inserted[0],
        message: 'Access request received — pending clinical administrator validation.',
      });
    } catch (error: any) {
      console.error('Error submitting access request:', error);
      res.status(500).json({ error: 'Failed to submit access request' });
    }
  });

  // =========================================================================
  // 3. CLINICIAN PORTAL ENDPOINTS (Screen 2: STRICTLY ZERO S_prio & ZERO M1)
  // =========================================================================
  // TEST-E2 & TEST-M2: Helper that strips any logistics/ML fields before sending to Screen 2
  const mapPatientForClinicianScreen2 = (
    p: typeof patients.$inferSelect,
    patientFlags: Array<typeof flags.$inferSelect>,
    patientRecs: Array<typeof recommendations.$inferSelect>,
    patientConsent?: typeof consents.$inferSelect,
    patientLogs?: Array<typeof usageLogs.$inferSelect>
  ) => {
    // Respect the evaluation purpose even on read: if it is withdrawn, do not
    // run the rules engine and do not expose freshly computed clinical results.
    const evaluationAllowed = patientConsent ? patientConsent.evaluationAndCalendar !== false : true;
    const evaluated = evaluationAllowed
      ? evaluatePatientRules(
          {
            id: p.id,
            ageYears: p.ageYears,
            ageMonths: p.ageMonths,
            gestationalAgeWeeks: p.gestationalAgeWeeks,
            sex: p.sex,
            pathwayType: p.pathwayType,
            nationalityGroup: p.nationalityGroup,
            clinicalProfile: p.clinicalProfile,
          },
          Boolean(patientConsent?.existingGenomicResult)
        )
      : null;

    const sanitizedRecs = patientRecs.map((r) => ({
      id: r.id,
      patientId: r.patientId,
      pathwayTitle: r.pathwayTitle,
      groupedActions: r.groupedActions,
      level: r.level,
      state: r.state,
      dueDate: r.dueDate,
      scheduledDate: r.scheduledDate,
      facilityName: r.facilityName,
      referralCodeDisplay: r.referralCodeDisplay,
      decisionAidText: r.decisionAidText,
      clinicianModifierReason: r.clinicianModifierReason,
      conclusionStatus: r.conclusionStatus,
      conclusionNotes: r.conclusionNotes,
      remindersSentCount: r.remindersSentCount,
      // Explicitly omit priorityScoreSprio, mlNoShowProbM1, mlTopFactorsM1, mlSuggestedAction (TEST-E2 & TEST-M2)
    }));

    const sanitizedProfile = { ...(p.clinicalProfile as Record<string, any>) };
    if (!patientConsent?.existingGenomicResult) {
      delete sanitizedProfile.genomicSignal;
    }
    // A stale G1/G2 row must never be exposed after the genomic purpose is
    // withdrawn, even before the next evaluation replaces the flags.
    const visibleFlags = evaluationAllowed
      ? patientFlags.filter(
          (f) => patientConsent?.existingGenomicResult || (f.ruleId !== 'G1' && f.ruleId !== 'G2')
        )
      : [];

    return {
      id: p.id,
      displayName: p.displayName,
      ageYears: p.ageYears,
      ageMonths: p.ageMonths,
      gestationalAgeWeeks: p.gestationalAgeWeeks,
      correctedAgeMonths: evaluated?.correctedAgeMonths ?? null,
      sex: p.sex,
      nationalityGroup: p.nationalityGroup,
      pathwayType: p.pathwayType,
      isPersona: p.isPersona,
      region: p.region,
      preferredLanguage: p.preferredLanguage,
      preferredChannel: p.preferredChannel,
      preferFemalePractitioner: p.preferFemalePractitioner,
      facilityCenter: p.facilityCenter,
      overallLevel: p.overallLevel,
      overallCertainty: p.overallCertainty,
      primaryReasonSummary: p.primaryReasonSummary,
      nextDueDate: p.nextDueDate,
      preventionProgressDone: p.preventionProgressDone,
      preventionProgressTotal: p.preventionProgressTotal,
      clinicalProfile: sanitizedProfile,
      calculations: evaluated?.calculations ?? null,
      // Expose visual series & zones without raw rule thresholds
      visualIndicators: {
        bpZoneLabel:
          evaluated?.calculations.bpProtocol.bpZoneLabel ||
          p.clinicalProfile.bpZoneLabel ||
          'In target zone',
        growthSeries: p.clinicalProfile.growthSeries || [],
        bpSeries: p.clinicalProfile.bpSeries || [],
        vaccinesList: p.clinicalProfile.vaccinesList || [],
        genomicCard:
          patientConsent?.existingGenomicResult && p.clinicalProfile.genomicSignal
            ? {
                title: 'Genomic Information (Simulated)',
                effectSummary: p.clinicalProfile.genomicSignal.effectSummary,
              }
            : null,
      },
      flags: visibleFlags.map((f) => ({
        id: f.id,
        flagType: f.flagType,
        level: f.level,
        title: f.title,
        factors: f.factors,
        sourceLabel: f.sourceLabel,
        missingData: f.missingData,
        dueDate: f.dueDate,
        certainty: f.certainty,
        certaintyReason: f.certaintyReason,
        isEclipseSuspended: f.isEclipseSuspended,
      })),
      recommendations: sanitizedRecs,
      consents: patientConsent || null,
      usageLogs: patientLogs || [],
    };
  };

  app.get('/api/clinician/patients', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const { level, pathway, state } = req.query;
      const [allPatients, allRecs] = await Promise.all([
        db.select().from(patients),
        db.select().from(recommendations),
      ]);
      const recByPatient = new Map(allRecs.map((r) => [r.patientId, r]));

      let list = allPatients.map((p) => {
        const rec = recByPatient.get(p.id);
        return {
          id: p.id,
          displayName: p.displayName,
          ageYears: p.ageYears,
          ageMonths: p.ageMonths,
          pathwayType: p.pathwayType,
          isPersona: p.isPersona,
          overallLevel: p.overallLevel,
          overallCertainty: p.overallCertainty,
          primaryReasonSummary: p.primaryReasonSummary,
          nextDueDate: p.nextDueDate,
          facilityCenter: p.facilityCenter,
          pathwayState: rec?.state || 'created',
          // Strictly NO priorityScoreSprio or ML fields here (TEST-E2, TEST-M2)
        };
      });

      if (level && level !== 'all') {
        list = list.filter((item) => item.overallLevel === level);
      }
      if (pathway && pathway !== 'all') {
        list = list.filter((item) => item.pathwayType === pathway);
      }
      if (state && state !== 'all') {
        list = list.filter((item) => item.pathwayState === state);
      }

      // Put core personas first for clear evaluation
      list.sort((a, b) => (a.isPersona === b.isPersona ? 0 : a.isPersona ? -1 : 1));

      res.json({ patients: list });
    } catch (error: any) {
      console.error('Error listing clinician patients:', error);
      res.status(500).json({ error: 'Failed to list patients' });
    }
  });

  app.get('/api/clinician/patients/:id', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      const [pFlags, pRecs, pConsents, pLogs] = await Promise.all([
        db.select().from(flags).where(eq(flags.patientId, patientId)),
        db.select().from(recommendations).where(eq(recommendations.patientId, patientId)),
        db.select().from(consents).where(eq(consents.patientId, patientId)),
        db.select().from(usageLogs).where(eq(usageLogs.patientId, patientId)).orderBy(desc(usageLogs.id)),
      ]);

      res.json({
        patient: mapPatientForClinicianScreen2(pRows[0], pFlags, pRecs, pConsents[0], pLogs),
      });
    } catch (error: any) {
      console.error('Error fetching clinician patient detail:', error);
      res.status(500).json({ error: 'Failed to fetch patient detail' });
    }
  });

  // Action 1: Run Prevention Evaluation
  app.post('/api/clinician/patients/:id/evaluate', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Patient not found' });

      const pConsents = await db.select().from(consents).where(eq(consents.patientId, patientId));
      if (!isPurposeAllowed(pConsents[0], 'evaluationAndCalendar')) {
        return res.status(403).json({
          error:
            'Evaluation consent is required: the patient has withdrawn the evaluation purpose. No evaluation was performed.',
        });
      }
      const evaluated = evaluatePatientRules(
        {
          id: pRows[0].id,
          ageYears: pRows[0].ageYears,
          ageMonths: pRows[0].ageMonths,
          gestationalAgeWeeks: pRows[0].gestationalAgeWeeks,
          sex: pRows[0].sex,
          pathwayType: pRows[0].pathwayType,
          nationalityGroup: pRows[0].nationalityGroup,
          clinicalProfile: pRows[0].clinicalProfile,
        },
        Boolean(pConsents[0]?.existingGenomicResult)
      );

      await db
        .update(patients)
        .set({
          overallLevel: evaluated.overallLevel,
          overallCertainty: evaluated.overallCertainty,
          primaryReasonSummary:
            evaluated.flags[0]?.title || 'All recommended preventive screenings are up to date',
        })
        .where(eq(patients.id, patientId));

      await db.delete(flags).where(eq(flags.patientId, patientId));
      for (let idx = 0; idx < evaluated.flags.length; idx++) {
        const f = evaluated.flags[idx];
        await db.insert(flags).values({
          id: `FLG-${patientId}-${Date.now()}-${idx}`,
          patientId,
          ruleId: f.ruleId,
          flagType: f.flagType,
          level: f.level,
          title: f.title,
          factors: f.factors,
          sourceLabel: f.sourceLabel,
          missingData: f.missingData,
          dueDate: f.dueDate,
          certainty: f.certainty,
          certaintyReason: f.certaintyReason,
          isEclipseSuspended: f.isEclipseSuspended,
        });
      }

      await db
        .update(recommendations)
        .set({
          pathwayTitle: evaluated.calculations.consolidatedCarePlan.pathwayTitle,
          groupedActions: evaluated.calculations.consolidatedCarePlan.groupedActions.map((g) => ({
            actionTitle: g.actionTitle,
            directiveSource: g.directiveSource,
            category: g.category,
          })),
          level: evaluated.overallLevel,
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Clinician',
        actorRole: 'Clinician',
        dataCategory: 'Clinical profile & preventive schedule',
        purposeDescription: 'Triggered on-demand prevention evaluation',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      const updatedFlags = await db.select().from(flags).where(eq(flags.patientId, patientId));
      res.json({
        overallLevel: evaluated.overallLevel,
        overallCertainty: evaluated.overallCertainty,
        flags: updatedFlags,
        calculations: evaluated.calculations,
      });
    } catch (error: any) {
      console.error('Error evaluating patient:', error);
      res.status(500).json({ error: 'Evaluation failed' });
    }
  });

  // Action 2: Submit Missing Data (resolves Level Grey -> Level Yellow/Orange/Green)
  app.post('/api/clinician/patients/:id/missing-data', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const {
        systolicBp,
        diastolicBp,
        systolicBp1,
        diastolicBp1,
        systolicBp2,
        diastolicBp2,
        systolicBp3,
        diastolicBp3,
        weightKg,
        heightCm,
        hemoglobinGdl,
        hba1cPercent,
      } = req.body;

      // Blood pressure bounds validation (Section 4.7)
      const bpCheckPairs = [
        [systolicBp, diastolicBp],
        [systolicBp1, diastolicBp1],
        [systolicBp2, diastolicBp2],
        [systolicBp3, diastolicBp3],
      ];
      for (const [s, d] of bpCheckPairs) {
        if (s !== undefined && s !== '' && d !== undefined && d !== '') {
          const sys = Number(s);
          const dia = Number(d);
          if (sys < 60 || sys > 260 || dia < 30 || dia > 160 || dia >= sys) {
            return res.status(400).json({
              error:
                'Blood pressure reading is outside physiological bounds (Sys 60–260, Dia 30–160, Dia < Sys). Please verify cuff placement and re-measure after 5 minutes of rest.',
            });
          }
        }
      }

      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Patient not found' });

      const currentProfile = { ...pRows[0].clinicalProfile };
      if (systolicBp1 && diastolicBp1) {
        currentProfile.systolicBp1 = Number(systolicBp1);
        currentProfile.diastolicBp1 = Number(diastolicBp1);
      }
      if (systolicBp2 && diastolicBp2) {
        currentProfile.systolicBp2 = Number(systolicBp2);
        currentProfile.diastolicBp2 = Number(diastolicBp2);
      } else if (systolicBp && diastolicBp) {
        if (!currentProfile.systolicBp1) {
          currentProfile.systolicBp1 = Number(systolicBp);
          currentProfile.diastolicBp1 = Number(diastolicBp);
        }
        currentProfile.systolicBp2 = Number(systolicBp);
        currentProfile.diastolicBp2 = Number(diastolicBp);
      }
      if (systolicBp3 && diastolicBp3) {
        currentProfile.systolicBp3 = Number(systolicBp3);
        currentProfile.diastolicBp3 = Number(diastolicBp3);
      }
      if (weightKg && heightCm) {
        currentProfile.weightKg = Number(weightKg);
        currentProfile.heightCm = Number(heightCm);
        const hMeters = Number(heightCm) / 100;
        currentProfile.bmi = Math.round((Number(weightKg) / (hMeters * hMeters)) * 10) / 10;
      }
      if (hemoglobinGdl) {
        currentProfile.hemoglobinGdl = Number(hemoglobinGdl);
        currentProfile.anemiaScreeningDone = true;
      }
      if (hba1cPercent) {
        currentProfile.hba1cPercent = Number(hba1cPercent);
      }
      currentProfile.oldestMeasureMonths = 0;
      currentProfile.provenanceMap = { ...currentProfile.provenanceMap, bp: 'M', bmi: 'M' };

      const pConsents = await db.select().from(consents).where(eq(consents.patientId, patientId));
      if (!isPurposeAllowed(pConsents[0], 'evaluationAndCalendar')) {
        return res.status(403).json({
          error:
            'Evaluation consent is required: the patient has withdrawn the evaluation purpose. No measurements were saved or evaluated.',
        });
      }
      const evaluated = evaluatePatientRules(
        {
          id: pRows[0].id,
          ageYears: pRows[0].ageYears,
          ageMonths: pRows[0].ageMonths,
          gestationalAgeWeeks: pRows[0].gestationalAgeWeeks,
          sex: pRows[0].sex,
          pathwayType: pRows[0].pathwayType,
          nationalityGroup: pRows[0].nationalityGroup,
          clinicalProfile: currentProfile,
        },
        Boolean(pConsents[0]?.existingGenomicResult)
      );

      currentProfile.bpZoneLabel = evaluated.calculations.bpProtocol.bpZoneLabel;

      await db
        .update(patients)
        .set({
          clinicalProfile: currentProfile,
          overallLevel: evaluated.overallLevel,
          overallCertainty: evaluated.overallCertainty,
          primaryReasonSummary:
            evaluated.flags[0]?.title || 'Baseline measurements completed — preventive status updated',
        })
        .where(eq(patients.id, patientId));

      await db
        .update(recommendations)
        .set({
          pathwayTitle: evaluated.calculations.consolidatedCarePlan.pathwayTitle,
          groupedActions: evaluated.calculations.consolidatedCarePlan.groupedActions.map((a) => ({
            actionTitle: a.actionTitle,
            directiveSource: a.directiveSource,
            category: a.category,
          })),
          level: evaluated.overallLevel,
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.delete(flags).where(eq(flags.patientId, patientId));
      for (let idx = 0; idx < evaluated.flags.length; idx++) {
        const f = evaluated.flags[idx];
        await db.insert(flags).values({
          id: `FLG-${patientId}-${Date.now()}-${idx}`,
          patientId,
          ruleId: f.ruleId,
          flagType: f.flagType,
          level: f.level,
          title: f.title,
          factors: f.factors,
          sourceLabel: f.sourceLabel,
          missingData: f.missingData,
          dueDate: f.dueDate,
          certainty: f.certainty,
          certaintyReason: f.certaintyReason,
          isEclipseSuspended: f.isEclipseSuspended,
        });
      }

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Clinician',
        actorRole: 'Clinician',
        dataCategory: 'Clinical measurements (Protocol M)',
        purposeDescription: 'Completed missing baseline measurements to resolve Level Grey',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'updated',
        overallLevel: evaluated.overallLevel,
        overallCertainty: evaluated.overallCertainty,
        calculations: evaluated.calculations,
      });
    } catch (error: any) {
      console.error('Error submitting missing data:', error);
      res.status(500).json({ error: 'Failed to submit measurements' });
    }
  });

  // Action 2B: Full Guided Clinical Analysis & Custom Patient Assessment Workbench (U2 + A2 + OMS 2019 + FINDRISC)
  app.post('/api/clinician/analyze-patient', requireAuth, requireRole('clinician', 'coordinator'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const body = req.body || {};
      const isUpdate = Boolean(body.patientId);
      const patientId = body.patientId || `MS-CUSTOM-${Date.now().toString().slice(-5)}`;

      // Validate any provided BP readings (Section 4.7)
      const bpPairs = [
        [body.systolicBp1, body.diastolicBp1],
        [body.systolicBp2, body.diastolicBp2],
        [body.systolicBp3, body.diastolicBp3],
      ];
      for (const [s, d] of bpPairs) {
        if (s !== undefined && s !== '' && s !== null && d !== undefined && d !== '' && d !== null) {
          const sys = Number(s);
          const dia = Number(d);
          if (sys < 60 || sys > 260 || dia < 30 || dia > 160 || dia >= sys) {
            return res.status(400).json({
              error:
                'Blood pressure reading outside physiological bounds (Systolic 60–260 mmHg, Diastolic 30–160 mmHg, Diastolic < Systolic).',
            });
          }
        }
      }

      const existingRows = isUpdate
        ? await db.select().from(patients).where(eq(patients.id, patientId))
        : [];
      const existingPatient = existingRows[0];

      const ageYears = body.ageYears !== undefined ? Number(body.ageYears) : existingPatient?.ageYears ?? 45;
      const ageMonths =
        body.ageMonths !== undefined
          ? Number(body.ageMonths)
          : existingPatient?.ageMonths ?? ageYears * 12;
      const pathwayType: 'child' | 'adolescent' | 'adult' =
        body.pathwayType ||
        existingPatient?.pathwayType ||
        (ageYears < 6 ? 'child' : ageYears < 18 ? 'adolescent' : 'adult');
      const sex = body.sex || existingPatient?.sex || 'female';
      const nationalityGroup =
        body.nationalityGroup || existingPatient?.nationalityGroup || 'Emirati';
      const gestationalAgeWeeks =
        body.gestationalAgeWeeks !== undefined && body.gestationalAgeWeeks !== ''
          ? Number(body.gestationalAgeWeeks)
          : existingPatient?.gestationalAgeWeeks ?? 39;

      const baseProfile: Record<string, any> = existingPatient
        ? { ...(existingPatient.clinicalProfile as Record<string, any>) }
        : {};
      const numOrUndef = (v: any, fallback?: number) =>
        v !== undefined && v !== '' && v !== null ? Number(v) : fallback;

      const weightKg = numOrUndef(body.weightKg, baseProfile.weightKg);
      const heightCm = numOrUndef(body.heightCm, baseProfile.heightCm);
      const computedBmi =
        weightKg && heightCm && heightCm > 30
          ? Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10
          : numOrUndef(body.bmi, baseProfile.bmi);

      const provenanceCode: 'V' | 'M' | 'D' | 'S' = body.provenanceMode || 'M';

      const updatedProfile: Record<string, any> = {
        ...baseProfile,
        systolicBp1: numOrUndef(body.systolicBp1, baseProfile.systolicBp1),
        diastolicBp1: numOrUndef(body.diastolicBp1, baseProfile.diastolicBp1),
        systolicBp2: numOrUndef(body.systolicBp2, baseProfile.systolicBp2),
        diastolicBp2: numOrUndef(body.diastolicBp2, baseProfile.diastolicBp2),
        systolicBp3: numOrUndef(body.systolicBp3, baseProfile.systolicBp3),
        diastolicBp3: numOrUndef(body.diastolicBp3, baseProfile.diastolicBp3),
        weightKg,
        heightCm,
        bmi: computedBmi,
        waistCm: numOrUndef(body.waistCm, baseProfile.waistCm),
        smokingStatus:
          body.smokingStatus === true || body.smokingStatus === 'current'
            ? 'current'
            : body.smokingStatus === false || body.smokingStatus === 'never'
            ? 'never'
            : body.smokingStatus === 'dokha_shisha'
            ? 'dokha_shisha'
            : baseProfile.smokingStatus,
        dailyPhysicalActivity:
          body.dailyPhysicalActivity !== undefined && body.dailyPhysicalActivity !== null
            ? Boolean(body.dailyPhysicalActivity)
            : baseProfile.dailyPhysicalActivity ?? null,
        dailyFruitsVeg:
          body.dailyFruitsVeg !== undefined && body.dailyFruitsVeg !== null
            ? Boolean(body.dailyFruitsVeg)
            : baseProfile.dailyFruitsVeg ?? null,
        antihypertensiveMed:
          body.antihypertensiveMedHistory !== undefined && body.antihypertensiveMedHistory !== null
            ? Boolean(body.antihypertensiveMedHistory)
            : baseProfile.antihypertensiveMed ?? null,
        historyHighGlucose:
          body.highBloodGlucoseHistory !== undefined && body.highBloodGlucoseHistory !== null
            ? Boolean(body.highBloodGlucoseHistory)
            : baseProfile.historyHighGlucose ?? null,
        familyHistoryDiabetes:
          body.familyHistoryDiabetesLevel && body.familyHistoryDiabetesLevel !== 'unknown'
            ? body.familyHistoryDiabetesLevel
            : baseProfile.familyHistoryDiabetes ?? null,
        hba1cPercent: numOrUndef(body.hba1cPercent, baseProfile.hba1cPercent),
        monthsSinceLastGlycemicScreening: numOrUndef(
          body.monthsSinceLastGlycemicScreening,
          baseProfile.monthsSinceLastGlycemicScreening
        ),
        isPregnant:
          body.isPregnant !== undefined ? Boolean(body.isPregnant) : baseProfile.isPregnant ?? false,
        familyHistoryFhOrEarlyCvd:
          body.familyPrematureCvd !== undefined
            ? Boolean(body.familyPrematureCvd)
            : baseProfile.familyHistoryFhOrEarlyCvd ?? false,
        familyHistoryColorectal:
          body.familyBreastOrColorectalCancer !== undefined
            ? Boolean(body.familyBreastOrColorectalCancer)
            : baseProfile.familyHistoryColorectal ?? false,
        colorectalScreeningUpToDate:
          body.colorectalScreeningUpToDate !== undefined
            ? Boolean(body.colorectalScreeningUpToDate)
            : baseProfile.colorectalScreeningUpToDate ?? null,
        cervicalScreeningUpToDate:
          body.cervicalScreeningUpToDate !== undefined
            ? Boolean(body.cervicalScreeningUpToDate)
            : baseProfile.cervicalScreeningUpToDate ?? null,
        mammographyUpToDate:
          body.mammographyUpToDate !== undefined
            ? Boolean(body.mammographyUpToDate)
            : baseProfile.mammographyUpToDate ?? null,
        ifhasFullScreeningDone:
          body.ifhasFullScreeningDone !== undefined
            ? Boolean(body.ifhasFullScreeningDone)
            : baseProfile.ifhasFullScreeningDone ?? null,
        monthsSinceLastColorectalScreening: numOrUndef(
          body.monthsSinceLastColorectalScreening,
          baseProfile.monthsSinceLastColorectalScreening
        ),
        monthsSinceLastCervicalScreening: numOrUndef(
          body.monthsSinceLastCervicalScreening,
          baseProfile.monthsSinceLastCervicalScreening
        ),
        monthsSinceLastMammography: numOrUndef(
          body.monthsSinceLastMammography,
          baseProfile.monthsSinceLastMammography
        ),
        monthsSinceLastIfhas: numOrUndef(
          body.monthsSinceLastIfhas,
          baseProfile.monthsSinceLastIfhas
        ),
        fallOrSensoryRisk:
          body.fallOrSensoryRisk !== undefined
            ? Boolean(body.fallOrSensoryRisk)
            : baseProfile.fallOrSensoryRisk ?? null,
        monthsSinceLastChronicVisit: numOrUndef(
          body.chronicFollowupInterruptedMonths,
          baseProfile.monthsSinceLastChronicVisit ?? 0
        ),
        chronicCondition:
          Number(body.chronicFollowupInterruptedMonths || 0) > 0
            ? baseProfile.chronicCondition || 'cardiometabolic follow-up'
            : baseProfile.chronicCondition ?? null,
        orientationLevel:
          body.orientationLevel === 'red' || body.orientationLevel === 'orange'
            ? body.orientationLevel
            : baseProfile.orientationLevel ?? null,
        orientationNotAttended:
          body.orientationNotAttended !== undefined
            ? Boolean(body.orientationNotAttended)
            : baseProfile.orientationNotAttended ?? null,
        daysSinceOrientation: numOrUndef(
          body.daysSinceOrientation,
          baseProfile.daysSinceOrientation
        ),
        activeSpecialistFollowup:
          body.activeSpecialistFollowup !== undefined
            ? Boolean(body.activeSpecialistFollowup)
            : baseProfile.activeSpecialistFollowup ?? false,
        redFlagWarningSymptom:
          body.redFlagWarningSymptom !== undefined
            ? Boolean(body.redFlagWarningSymptom)
            : baseProfile.redFlagWarningSymptom ?? false,
        redFlagSymptomLabel: body.redFlagSymptomLabel || baseProfile.redFlagSymptomLabel,
        // The emergency escape rule E0 reads these two fields. They are mapped
        // from the guided form's red-flag toggle so the safety escape cannot be
        // silently ignored.
        hasEmergencySymptoms:
          body.hasEmergencySymptoms !== undefined
            ? Boolean(body.hasEmergencySymptoms)
            : body.redFlagWarningSymptom !== undefined
            ? Boolean(body.redFlagWarningSymptom)
            : baseProfile.hasEmergencySymptoms ?? false,
        hasSymptomaticCrisis:
          body.hasSymptomaticCrisis !== undefined
            ? Boolean(body.hasSymptomaticCrisis)
            : body.redFlagWarningSymptom === true
            ? true
            : baseProfile.hasSymptomaticCrisis ?? false,
        // Pediatric & Adolescent parameters
        weightForHeightZ: numOrUndef(
          body.weightForHeightZ,
          numOrUndef(body.weightForAgeZ, baseProfile.weightForHeightZ)
        ),
        heightForAgeZ: numOrUndef(body.heightForAgeZ, baseProfile.heightForAgeZ),
        bmiForAgeZ: numOrUndef(body.bmiForAgeZ, baseProfile.bmiForAgeZ),
        muacMm: numOrUndef(body.muacMm, baseProfile.muacMm),
        mchatScore: numOrUndef(body.mchatScore, baseProfile.mchatScore),
        mchatFollowUpScore: numOrUndef(body.mchatFollowUpScore, baseProfile.mchatFollowUpScore),
        hemoglobinGdl: numOrUndef(body.hemoglobinGdl, baseProfile.hemoglobinGdl),
        anemiaScreeningDone:
          body.hemoglobinGdl !== undefined && body.hemoglobinGdl !== ''
            ? true
            : body.anemiaScreeningDone !== undefined
            ? Boolean(body.anemiaScreeningDone)
            : baseProfile.anemiaScreeningDone ?? null,
        vaccineDelayDays:
          typeof body.missedVaccineDoses === 'string' && body.missedVaccineDoses.trim().length > 0
            ? 60
            : baseProfile.vaccineDelayDays,
        isZeroDoseChild:
          body.isZeroDoseChild !== undefined
            ? Boolean(body.isZeroDoseChild)
            : baseProfile.isZeroDoseChild ?? null,
        adolescentVaccinesUpToDate:
          body.adolescentVaccinesUpToDate !== undefined
            ? Boolean(body.adolescentVaccinesUpToDate)
            : baseProfile.adolescentVaccinesUpToDate ?? null,
        missedWcvConsecutive:
          body.lastWcvAgeMonths !== undefined && body.lastWcvAgeMonths !== ''
            ? undefined
            : body.overdueMonthsWcv !== undefined && body.overdueMonthsWcv !== ''
            ? Number(body.overdueMonthsWcv) >= 3
              ? 1
              : 0
            : baseProfile.missedWcvConsecutive,
        lastWcvAgeMonths: numOrUndef(body.lastWcvAgeMonths, baseProfile.lastWcvAgeMonths),
        pregnancyWeeks: numOrUndef(body.pregnancyWeeks, baseProfile.pregnancyWeeks),
        oldestMeasureMonths: numOrUndef(body.oldestMeasureMonths, 0),
        provenanceMap: {
          ...(baseProfile.provenanceMap || {}),
          bp: provenanceCode,
          bmi: provenanceCode,
          metabolic: provenanceCode,
        },
      };

      if (body.genomicDomain && body.genomicDomain !== 'none') {
        updatedProfile.genomicSignal = {
          type: body.genomicDomain === 'oncology' ? 'BRCA_ACTIONABLE' : 'PRS_CAD_T2D_94',
          label: 'Simulated Genomic Accelerator',
          effectSummary:
            body.genomicEffectSummary ||
            (body.genomicDomain === 'cvd'
              ? 'Advances cardiovascular check-up schedule by 5 years (Accelerator G1)'
              : body.genomicDomain === 'diabetes'
              ? 'Prioritizes annual HbA1c / fasting glucose verification (Accelerator G1)'
              : 'Advances targeted oncology screening schedule (Accelerator G2)'),
          simulated: true,
        };
      }

      // Consent is patient-owned. A clinician may record a clinical profile but
      // may not grant or revoke the patient's genomic purpose (purpose 5). The
      // existing consent row is the only source of truth for G1/G2 eligibility.
      const existingConsents = await db
        .select()
        .from(consents)
        .where(eq(consents.patientId, patientId));
      const evaluationConsent = existingConsents[0]?.evaluationAndCalendar !== false;
      if (!evaluationConsent) {
        return res.status(403).json({
          error:
            'Evaluation consent is required: the patient has withdrawn the evaluation purpose. No clinical evaluation was performed.',
        });
      }
      const existingGenomicConsent = Boolean(existingConsents[0]?.existingGenomicResult);

      const evaluated = evaluatePatientRules(
        {
          id: patientId,
          ageYears,
          ageMonths,
          gestationalAgeWeeks,
          sex,
          pathwayType,
          nationalityGroup,
          clinicalProfile: updatedProfile,
        },
        existingGenomicConsent
      );

      updatedProfile.bpZoneLabel = evaluated.calculations.bpProtocol.bpZoneLabel;
      if (evaluated.calculations.findriscModel.score !== null) {
        updatedProfile.findriscScore = evaluated.calculations.findriscModel.score;
      }

      if (
        evaluated.calculations.bpProtocol.retainedSys &&
        evaluated.calculations.bpProtocol.retainedDia
      ) {
        const prevSeries = Array.isArray(updatedProfile.bpSeries) ? updatedProfile.bpSeries : [];
        updatedProfile.bpSeries = [
          ...prevSeries.slice(-3),
          {
            dateLabel: 'Today (Protocol)',
            systolic: Math.round(evaluated.calculations.bpProtocol.retainedSys),
            diastolic: Math.round(evaluated.calculations.bpProtocol.retainedDia),
            targetMaxSys: 130,
            targetMaxDia: 85,
          },
        ];
      }

      const displayName =
        body.displayName?.trim() || existingPatient?.displayName || `Patient ${patientId}`;
      const region = body.region || existingPatient?.region || 'Abu Dhabi Region';
      const facilityCenter =
        body.facilityCenter || existingPatient?.facilityCenter || 'Abu Dhabi Preventive Health Centre';
      const preferredLanguage: 'en' | 'fr' | 'ar' =
        body.preferredLanguage || existingPatient?.preferredLanguage || 'en';
      const preferredChannel =
        body.preferredChannel || existingPatient?.preferredChannel || 'WhatsApp';
      const preferFemalePractitioner =
        body.preferFemalePractitioner !== undefined
          ? Boolean(body.preferFemalePractitioner)
          : existingPatient?.preferFemalePractitioner ?? false;

      // Enforce mandatory parent affiliation when registering a minor (< 18 years) by the competent service
      const resolvedParentId =
        ageYears < 18
          ? body.parentPatientId?.trim() || existingPatient?.parentUserId || null
          : existingPatient?.parentUserId || null;

      if (!existingPatient && ageYears < 18 && !resolvedParentId) {
        return res.status(400).json({
          error:
            'Parent affiliation required: For any patient under 18 years old, you must search and select an adult parent/guardian from the database.',
        });
      }

      if (existingPatient) {
        await db
          .update(patients)
          .set({
            displayName,
            ageYears,
            ageMonths,
            gestationalAgeWeeks,
            sex,
            pathwayType,
            parentUserId: resolvedParentId,
            nationalityGroup,
            region,
            facilityCenter,
            preferredLanguage,
            preferredChannel,
            preferFemalePractitioner,
            overallLevel: evaluated.overallLevel,
            overallCertainty: evaluated.overallCertainty,
            primaryReasonSummary:
              evaluated.flags[0]?.title || 'All recommended preventive screenings are up to date',
            clinicalProfile: updatedProfile as any,
          })
          .where(eq(patients.id, patientId));
      } else {
        await db.insert(patients).values({
          id: patientId,
          displayName,
          ageYears,
          ageMonths,
          gestationalAgeWeeks,
          sex,
          pathwayType,
          isPersona: false,
          parentUserId: resolvedParentId,
          region,
          nationalityGroup,
          insuranceCategory: 'Thiqa',
          preferredLanguage,
          preferredChannel,
          preferFemalePractitioner,
          accessTimeMinutes: 20,
          missedVisitsCount: 0,
          facilityCenter,
          overallLevel: evaluated.overallLevel,
          overallCertainty: evaluated.overallCertainty,
          primaryReasonSummary:
            evaluated.flags[0]?.title || 'All recommended preventive screenings are up to date',
          nextDueDate: evaluated.flags[0]?.dueDate || 'Within 30 days',
          preventionProgressDone: evaluated.overallLevel === 'green' ? 4 : 2,
          preventionProgressTotal: 4,
          clinicalProfile: updatedProfile as any,
        });
      }

      // Upsert consent record (the genomic purpose is never granted by a clinician;
      // it is only preserved from the existing patient-owned consent row).
      if (existingConsents[0]) {
        await db
          .update(consents)
          .set({ existingGenomicResult: existingGenomicConsent, updatedAt: new Date() })
          .where(eq(consents.patientId, patientId));
      } else {
        await db.insert(consents).values({
          patientId,
          evaluationAndCalendar: true,
          channelReminders: true,
          shareWithFacility: true,
          anonymousStatistics: true,
          existingGenomicResult: existingGenomicConsent,
          adolescentAssentGiven: pathwayType === 'adolescent',
        });
      }

      // Replace flags
      await db.delete(flags).where(eq(flags.patientId, patientId));
      for (let idx = 0; idx < evaluated.flags.length; idx++) {
        const f = evaluated.flags[idx];
        await db.insert(flags).values({
          id: `FLG-${patientId}-${Date.now()}-${idx}`,
          patientId,
          ruleId: f.ruleId,
          flagType: f.flagType,
          level: f.level,
          title: f.title,
          factors: f.factors,
          sourceLabel: f.sourceLabel,
          missingData: f.missingData,
          dueDate: f.dueDate,
          certainty: f.certainty,
          certaintyReason: f.certaintyReason,
          isEclipseSuspended: f.isEclipseSuspended,
        });
      }

      // Compute logistics for Coordinator DB storage (never returned on Screen 2)
      const logistics = computeLogisticsAndM1({
        overallLevel: evaluated.overallLevel,
        openGapsCount: evaluated.flags.length,
        maxOverdueDays: Number(body.overdueMonthsWcv || 0) * 30,
        accessTimeMinutes: 25,
        languageNeedsSupport: preferredLanguage !== 'en',
        residesInUnderservedZoneC1: region.includes('Dhafra'),
        contextConsentGiven: true,
        missedVisitsCount: 0,
        preferredChannel,
        reminderRank: 0,
      });

      const groupedActionsForDb = evaluated.calculations.consolidatedCarePlan.groupedActions.map(
        (a) => ({
          actionTitle: a.actionTitle,
          directiveSource: a.directiveSource,
          category: a.category,
        })
      );

      const existingRecs = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.patientId, patientId));
      if (existingRecs[0]) {
        await db
          .update(recommendations)
          .set({
            pathwayTitle: evaluated.calculations.consolidatedCarePlan.pathwayTitle,
            groupedActions: groupedActionsForDb,
            level: evaluated.overallLevel,
            dueDate: evaluated.flags[0]?.dueDate || 'Within 30 days',
            facilityName: facilityCenter,
            priorityScoreSprio: logistics.priorityScoreSprio,
            mlNoShowProbM1: logistics.noShowProbability,
            mlTopFactorsM1: logistics.topLogisticsFactors,
            mlSuggestedAction: logistics.suggestedSupportAction,
            updatedAt: new Date(),
          })
          .where(eq(recommendations.patientId, patientId));
      } else {
        const refCode = generateReferralCode(patientId, 20261120);
        await db.insert(recommendations).values({
          id: `REC-${patientId}`,
          patientId,
          pathwayTitle: evaluated.calculations.consolidatedCarePlan.pathwayTitle,
          groupedActions: groupedActionsForDb,
          level: evaluated.overallLevel,
          state: 'created',
          dueDate: evaluated.flags[0]?.dueDate || 'Within 30 days',
          facilityName: facilityCenter,
          referralCodeDisplay: refCode,
          referralCodeHmac: computeReferralHmac(refCode),
          decisionAidText:
            'This consolidated preventive visit groups all recommended checks in a single appointment. Participation is voluntary and you may confirm, reschedule, or decline at any time.',
          priorityScoreSprio: logistics.priorityScoreSprio,
          mlNoShowProbM1: logistics.noShowProbability,
          mlTopFactorsM1: logistics.topLogisticsFactors,
          mlSuggestedAction: logistics.suggestedSupportAction,
        });
      }

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Clinician',
        actorRole: 'Clinician',
        dataCategory: 'Guided Clinical Analysis (U2 + A2 Engine)',
        purposeDescription: isUpdate
          ? 'Updated clinical parameters & recalculated WHO 2019 / FINDRISC / WCV-IFHAS rules'
          : 'Created new patient record & executed full preventive clinical analysis',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      const finalP = await db.select().from(patients).where(eq(patients.id, patientId));
      const finalFlags = await db.select().from(flags).where(eq(flags.patientId, patientId));
      const finalRecs = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.patientId, patientId));
      const finalConsents = await db
        .select()
        .from(consents)
        .where(eq(consents.patientId, patientId));
      const finalLogs = await db
        .select()
        .from(usageLogs)
        .where(eq(usageLogs.patientId, patientId))
        .orderBy(desc(usageLogs.id));

      res.json({
        status: isUpdate ? 'updated' : 'created',
        patient: mapPatientForClinicianScreen2(
          finalP[0],
          finalFlags,
          finalRecs,
          finalConsents[0],
          finalLogs
        ),
      });
    } catch (error: any) {
      console.error('Error in /api/clinician/analyze-patient:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze patient clinical data' });
    }
  });

  // Action 3: Generate AI Record Summary (Requires human validation: Validate / Edit / Ignore)
  app.post('/api/clinician/patients/:id/summary', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Patient not found' });
      const pFlags = await db.select().from(flags).where(eq(flags.patientId, patientId));

      const p = pRows[0];
      const activeTitles = pFlags.map((f) => f.title).join('; ');
      const missingItems = pFlags.flatMap((f) => f.missingData);

      const summaryText =
        `${p.displayName} (${p.ageYears > 1 ? `${p.ageYears} years` : `${p.ageMonths} months`}, ${p.pathwayType} pathway) is currently flagged as ${p.overallLevel.toUpperCase()} with ${p.overallCertainty} data certainty. ` +
        `Key preventive items: ${activeTitles || 'All routine checks are up to date'}. ` +
        (missingItems.length > 0
          ? `Recommended measurements to complete during the visit: ${missingItems.join(', ')}. `
          : 'All required baseline measurements are present. ') +
        `Suggested next step: consolidate all pending preventive checks into a single appointment at ${p.facilityCenter}.`;

      res.json({
        label: 'Automatic summary from rules — requires clinician validation',
        summaryText,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error generating summary:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // Action 4: Validate / Adapt / Defer Recommended Care Plan (Mandatory reason for Adapt & Defer)
  app.post('/api/clinician/patients/:id/pathway-action', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const { action, reason } = req.body; // action: 'validate' | 'adapt' | 'defer'
      if (!['validate', 'adapt', 'defer'].includes(action)) {
        return res.status(400).json({ error: 'action must be validate, adapt or defer.' });
      }
      if ((action === 'adapt' || action === 'defer') && (!reason || reason.trim().length < 3)) {
        return res.status(400).json({
          error: 'A clinical reason is mandatory when adapting or deferring a preventive pathway.',
        });
      }

      const newState =
        action === 'validate' ? 'validated' : action === 'defer' ? 'postponed' : 'validated';

      await db
        .update(recommendations)
        .set({
          state: newState,
          clinicianModifierReason: reason || 'Validated according to published guideline',
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Clinician',
        actorRole: 'Clinician',
        dataCategory: 'Preventive Care Plan',
        purposeDescription: `Clinician pathway decision: ${action.toUpperCase()}${reason ? ` (${reason})` : ''}`,
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({ status: 'ok', state: newState });
    } catch (error: any) {
      console.error('Error updating pathway action:', error);
      res.status(500).json({ error: 'Failed to update pathway' });
    }
  });

  // Action 5: Preview & Send Culturally Adapted Invitation (M2 Guardrails + Mandatory Human Validation)
  app.post('/api/clinician/patients/:id/invitation', requireAuth, requireRole('clinician', 'coordinator'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const { mode, language, customBodyText } = req.body; // mode: 'preview' | 'send'
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Patient not found' });
      const p = pRows[0];
      const recRows = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.patientId, patientId));
      const rec = recRows[0];
      if (!rec) return res.status(404).json({ error: 'No care pathway found for this patient' });

      const consentRow = await getConsentRow(patientId);
      const policy = evaluateInvitationPolicy({
        mode,
        level: rec.level,
        state: rec.state,
        consent: consentRow,
      });
      if (!policy.allowed) {
        return res.status(policy.status ?? 400).json({ error: policy.error });
      }

      const lang = (language || p.preferredLanguage || 'en') as 'en' | 'fr' | 'ar';
      const generated = generateCulturallyAdaptedInvitation({
        language: lang,
        recipientType: p.pathwayType === 'child' ? 'parent' : p.pathwayType === 'adolescent' ? 'adolescent' : 'adult',
        patientDisplayName: p.displayName,
        facilityName: p.facilityCenter,
        dueDate: p.nextDueDate,
        preferFemalePractitioner: p.preferFemalePractitioner,
      });

      const finalBody = customBodyText || generated.bodyText;
      const safety = validateM2MessageSafety(finalBody);

      if (!safety.valid) {
        return res.status(400).json({
          error: 'Message blocked by M2 Responsible AI Safety Guardrail (TEST-M3).',
          violations: safety.violations,
        });
      }

      if (mode === 'preview') {
        return res.json({
          preview: {
            language: lang,
            channel: p.preferredChannel,
            recipientType: p.pathwayType === 'child' ? 'Parent / Caregiver' : 'Patient',
            subject: generated.subject,
            bodyText: finalBody,
            decisionAidText: generated.decisionAidText,
            safetyCheckPassed: safety.valid,
          },
        });
      }

      // Mode === 'send' (Human validated)
      await db
        .update(recommendations)
        .set({ state: 'invited', updatedAt: new Date() })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(notifications).values({
        id: `NOTIF-${patientId}-${Date.now()}`,
        patientId,
        recommendationId: `REC-${patientId}`,
        channel: p.preferredChannel,
        language: lang,
        recipientType: p.pathwayType === 'child' ? 'parent' : 'adult',
        title: generated.subject,
        bodyText: finalBody,
        decisionAidSummary: generated.decisionAidText,
        isRead: false,
        requiresAction: true,
        humanValidatedBy: req.user?.displayName || 'Clinician',
        sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });

      res.json({ status: 'sent', state: 'invited', safetyCheckPassed: true });
    } catch (error: any) {
      console.error('Error handling invitation:', error);
      res.status(500).json({ error: 'Failed to process invitation' });
    }
  });

  // Action 6: Confirm Visit via 8-Character Referral Code (TEST-E5 & Section 5.6 HMAC verification)
  app.post('/api/clinician/patients/:id/confirm-visit', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const { referralCode } = req.body;
      if (!referralCode) {
        return res.status(400).json({ error: 'Referral code is required to confirm a completed visit.' });
      }

      const recs = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.patientId, patientId));
      if (!recs[0]) return res.status(404).json({ error: 'Recommendation not found' });

      const providedHmac = computeReferralHmac(referralCode);
      if (providedHmac !== recs[0].referralCodeHmac) {
        return res.status(400).json({
          error: 'Invalid referral code. Visit remains unconfirmed until the matching 8-character centre pass is verified (TEST-E5).',
        });
      }

      // §5.5 — Sync conflict: a centre-confirmed "done" prevails over any other
      // recorded state (e.g. an offline agent's "postponed"); the conflict is
      // resolved by the documented rules and logged for the coordinator.
      const previousState = recs[0].state as PathwayState | undefined;
      const resolution =
        previousState && previousState !== 'done'
          ? resolvePathwayConflict(
              { state: 'done', eventDate: new Date().toISOString(), actor: 'center' },
              { state: previousState, eventDate: (recs[0].updatedAt ?? new Date()).toISOString(), actor: 'agent' }
            )
          : null;

      await db
        .update(recommendations)
        .set({
          state: 'done',
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Health Centre Desk',
        actorRole: 'Clinician / Centre',
        dataCategory: resolution?.conflictDetected
          ? 'Sync Conflict Resolution (§5.5) — centre-confirmed visit prevails'
          : 'HMAC Referral Pass Verification',
        purposeDescription: resolution?.conflictDetected
          ? `Conflict logged: previous state "${previousState}" (agent) vs centre-confirmed "Réalisée" — final state: done (${resolution.reason})`
          : 'Confirmed completed preventive visit at health centre (Closed-loop state: Done)',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({ status: 'confirmed', state: 'done', conflictResolved: resolution?.conflictDetected ? resolution.reason : null });
    } catch (error: any) {
      console.error('Error confirming visit:', error);
      res.status(500).json({ error: 'Failed to confirm visit' });
    }
  });

  // Action 7: Record Visit Conclusion
  app.post('/api/clinician/patients/:id/conclusion', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const { conclusionStatus, conclusionNotes } = req.body;

      await db
        .update(recommendations)
        .set({
          conclusionStatus: conclusionStatus || 'normal',
          conclusionNotes: conclusionNotes || '',
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      res.json({ status: 'recorded' });
    } catch (error: any) {
      console.error('Error recording conclusion:', error);
      res.status(500).json({ error: 'Failed to record conclusion' });
    }
  });

  // Action 8: Export FHIR R4 Bundle (Downloaded as file, never displayed raw in UI)
  app.get('/api/clinician/patients/:id/export-fhir', requireAuth, requireRole('clinician'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Patient not found' });
      const pFlags = await db.select().from(flags).where(eq(flags.patientId, patientId));
      const pRecs = await db.select().from(recommendations).where(eq(recommendations.patientId, patientId));
      const pConsents = await db.select().from(consents).where(eq(consents.patientId, patientId));
      if (!isPurposeAllowed(pConsents[0], 'shareWithFacility')) {
        return res.status(403).json({
          error:
            'Transmission consent is required: the patient has withdrawn the facility-sharing purpose. No FHIR export was generated.',
        });
      }

      const p = pRows[0];
      const fhirBundle = {
        resourceType: 'Bundle',
        type: 'collection',
        timestamp: new Date().toISOString(),
        meta: {
          profile: ['http://hl7.org/fhir/R4/StructureDefinition/Bundle'],
          tag: [{ system: 'https://medisense.example/governance', code: 'SYNTHETIC_DEMO_EXPORT' }],
        },
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: p.id,
              gender: p.sex,
              language: p.preferredLanguage,
            },
          },
          {
            resource: {
              resourceType: 'Consent',
              id: `CONSENT-${p.id}`,
              status: 'active',
              scope: { text: 'MediSense 5-Purpose Granular Prevention Consent' },
              provision: {
                type: pConsents[0]?.shareWithFacility ? 'permit' : 'deny',
              },
            },
          },
          ...pFlags.map((f) => ({
            resource: {
              resourceType: 'RiskAssessment',
              id: f.id,
              status: 'final',
              subject: { reference: `Patient/${p.id}` },
              prediction: [{ qualitativeRisk: { text: f.level.toUpperCase() } }],
              note: [{ text: `${f.title} — Source: ${f.sourceLabel} — Certainty: ${f.certainty}` }],
            },
          })),
          ...pRecs.map((r) => ({
            resource: {
              resourceType: 'ServiceRequest',
              id: r.id,
              status: r.state === 'done' ? 'completed' : r.state === 'refused' ? 'revoked' : 'active',
              intent: 'order',
              identifier: [{ system: 'https://medisense.example/referral-hmac', value: r.referralCodeHmac }],
              subject: { reference: `Patient/${p.id}` },
              code: { text: r.pathwayTitle },
            },
          })),
        ],
      };

      res.setHeader('Content-Type', 'application/fhir+json');
      res.setHeader('Content-Disposition', `attachment; filename="medisense-fhir-${p.id}.json"`);
      res.send(JSON.stringify(fhirBundle, null, 2));
    } catch (error: any) {
      console.error('Error exporting FHIR bundle:', error);
      res.status(500).json({ error: 'Failed to export FHIR bundle' });
    }
  });

  // =========================================================================
  // 4. PATIENT & PARENT PORTAL ENDPOINTS
  // =========================================================================
  app.get('/api/patient/profile/:id', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Profile not found' });

      const [pFlags, pRecs, pConsents, pNotifs, pLogs, familyRows] = await Promise.all([
        db.select().from(flags).where(eq(flags.patientId, patientId)),
        db.select().from(recommendations).where(eq(recommendations.patientId, patientId)),
        db.select().from(consents).where(eq(consents.patientId, patientId)),
        db.select().from(notifications).where(eq(notifications.patientId, patientId)).orderBy(desc(notifications.sentAt)),
        db.select().from(usageLogs).where(eq(usageLogs.patientId, patientId)).orderBy(desc(usageLogs.id)),
        // Fetch family: parent + siblings in one query using parentUserId
        db.select({
          id: patients.id,
          displayName: patients.displayName,
          ageYears: patients.ageYears,
          ageMonths: patients.ageMonths,
          sex: patients.sex,
          pathwayType: patients.pathwayType,
          overallLevel: patients.overallLevel,
          nextDueDate: patients.nextDueDate,
          primaryReasonSummary: patients.primaryReasonSummary,
          parentUserId: patients.parentUserId,
          clinicalProfile: patients.clinicalProfile,
        }).from(patients),
      ]);

      const p = pRows[0];
      const evaluationAllowed = isPurposeAllowed(pConsents[0], 'evaluationAndCalendar');
      const evaluated = evaluationAllowed
        ? evaluatePatientRules(
            {
              id: p.id,
              ageYears: p.ageYears,
              ageMonths: p.ageMonths,
              gestationalAgeWeeks: p.gestationalAgeWeeks,
              sex: p.sex,
              pathwayType: p.pathwayType,
              nationalityGroup: p.nationalityGroup,
              clinicalProfile: p.clinicalProfile,
            },
            Boolean(pConsents[0]?.existingGenomicResult)
          )
        : null;
      const sanitizedProfile = { ...(p.clinicalProfile as Record<string, any>) };
      if (!pConsents[0]?.existingGenomicResult) {
        delete sanitizedProfile.genomicSignal;
      }

      const portalLocale = ['en', 'fr', 'ar'].includes(String(req.query.locale))
        ? (String(req.query.locale) as 'en' | 'fr' | 'ar')
        : ((p.preferredLanguage as 'en' | 'fr' | 'ar') || 'en');
      const [screeningPlan, reminderPlan] = evaluationAllowed
        ? await Promise.all([
            computeScreeningPlanFor(patientId, portalLocale),
            computeReminderPlanFor(patientId, portalLocale),
          ])
        : [null, computeReminderPlanFor(patientId, portalLocale)];

      // Family affiliation context — reuse familyRows from the parallel Promise.all above
      const rootParentId = p.parentUserId || p.id;
      const parentRecord = familyRows.find((row) => row.id === rootParentId) || null;
      const affiliatedChildrenRows = familyRows.filter(
        (row) => row.parentUserId === rootParentId
      );

      const affiliatedChildren = affiliatedChildrenRows.map((child) => {
        const cp = (child.clinicalProfile || {}) as Record<string, any>;
        return {
          id: child.id,
          displayName: child.displayName,
          ageYears: child.ageYears,
          ageMonths: child.ageMonths,
          sex: child.sex,
          pathwayType: child.pathwayType,
          overallLevel: child.overallLevel,
          nextDueDate: child.nextDueDate,
          primaryReasonSummary: child.primaryReasonSummary,
          eligibleForMajorityDetachment: child.ageYears >= 18,
          majorityDetachmentRequested: Boolean(cp.majorityDetachmentRequested),
        };
      });

      // Adolescent confidentiality safeguard (Section 6.4 & D11):
      // Sensitive adolescent notes are never exposed to parent view
      res.json({
        profile: {
          id: p.id,
          displayName: p.displayName,
          ageYears: p.ageYears,
          ageMonths: p.ageMonths,
          gestationalAgeWeeks: p.gestationalAgeWeeks,
          correctedAgeMonths: evaluated?.correctedAgeMonths ?? null,
          sex: p.sex,
          nationalityGroup: p.nationalityGroup,
          pathwayType: p.pathwayType,
          parentUserId: p.parentUserId,
          region: p.region,
          preferredLanguage: p.preferredLanguage,
          preferredChannel: p.preferredChannel,
          preferFemalePractitioner: p.preferFemalePractitioner,
          facilityCenter: p.facilityCenter,
          overallLevel: p.overallLevel,
          overallCertainty: p.overallCertainty,
          primaryReasonSummary: p.primaryReasonSummary,
          nextDueDate: p.nextDueDate,
          preventionProgressDone: p.preventionProgressDone,
          preventionProgressTotal: p.preventionProgressTotal,
          bpZoneLabel:
            evaluated?.calculations.bpProtocol.bpZoneLabel ||
            p.clinicalProfile.bpZoneLabel ||
            'In target zone',
          growthSeries: p.clinicalProfile.growthSeries || [],
          bpSeries: p.clinicalProfile.bpSeries || [],
          vaccinesList: p.clinicalProfile.vaccinesList || [],
          clinicalProfile: sanitizedProfile,
          calculations: evaluated?.calculations ?? null,
          evaluationPaused: !evaluationAllowed,
        },
        familyContext: {
          rootParent: parentRecord
            ? {
                id: parentRecord.id,
                displayName: parentRecord.displayName,
                ageYears: parentRecord.ageYears,
              }
            : null,
          affiliatedChildren,
        },
        nextRecommendation: pRecs[0]
          ? {
              id: pRecs[0].id,
              pathwayTitle: pRecs[0].pathwayTitle,
              groupedActions: pRecs[0].groupedActions,
              state: pRecs[0].state,
              dueDate: pRecs[0].dueDate,
              scheduledDate: pRecs[0].scheduledDate,
              facilityName: pRecs[0].facilityName,
              referralCodeDisplay: pRecs[0].referralCodeDisplay,
              decisionAidText: pRecs[0].decisionAidText,
            }
          : null,
        flags: pFlags.map((f) => ({
          id: f.id,
          ruleId: f.ruleId,
          flagType: f.flagType,
          level: f.level,
          title: f.title,
          factors: f.factors,
          sourceLabel: f.sourceLabel,
          missingData: f.missingData,
          dueDate: f.dueDate,
          certainty: f.certainty,
          certaintyReason: f.certaintyReason,
          isEclipseSuspended: f.isEclipseSuspended,
        })),
        flagsCount: pFlags.length,
        screeningPlan,
        reminderPlan,
        consents: pConsents[0] || null,
        notifications: pNotifs,
        usageLogs: pLogs,
      });
    } catch (error: any) {
      console.error('Error fetching patient portal profile:', error);
      res.status(500).json({ error: 'Failed to load patient profile' });
    }
  });

  // Personalized screening planner (server-computed from signed rules + schedules)
  app.get('/api/patient/profile/:id/screening-plan', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const consentRow = await getConsentRow(patientId);
      const locale = ['en', 'fr', 'ar'].includes(String(req.query.locale))
        ? (String(req.query.locale) as 'en' | 'fr' | 'ar')
        : 'en';
      const plan = await computeScreeningPlanFor(patientId, locale);
      if (plan === null) {
        const exists = await db.select().from(patients).where(eq(patients.id, patientId));
        if (!exists[0]) return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({
        plan,
        evaluationPaused: !isPurposeAllowed(consentRow, 'evaluationAndCalendar'),
      });
    } catch (error: any) {
      console.error('Error building screening plan:', error);
      res.status(500).json({ error: 'Failed to build screening plan' });
    }
  });

  // Smart reminder assistant: upcoming/missed appointment timeline
  app.get('/api/patient/profile/:id/reminders', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const locale = ['en', 'fr', 'ar'].includes(String(req.query.locale))
        ? (String(req.query.locale) as 'en' | 'fr' | 'ar')
        : 'en';
      const plan = await computeReminderPlanFor(patientId, locale);
      if (!plan) return res.status(404).json({ error: 'Profile not found' });
      res.json({ plan });
    } catch (error: any) {
      console.error('Error building reminder plan:', error);
      res.status(500).json({ error: 'Failed to build reminder plan' });
    }
  });

  // Smart reminder assistant: schedule the next preventive visit
  app.post('/api/patient/profile/:id/reminders/schedule', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const date = String(req.body?.date || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'A valid appointment date (YYYY-MM-DD) is required.' });
      }
      const today = new Date().toISOString().slice(0, 10);
      if (date < today) {
        return res.status(400).json({ error: 'The appointment date must be today or later.' });
      }
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Profile not found' });
      const recRows = await db.select().from(recommendations).where(eq(recommendations.patientId, patientId));
      if (!recRows[0]) return res.status(404).json({ error: 'No care pathway found for this patient' });
      if (recRows[0].state === 'refused') {
        return res.status(409).json({
          error:
            'This pathway was refused. Scheduling a new visit requires an explicit patient decision in the portal.',
        });
      }

      await db
        .update(recommendations)
        .set({
          state: 'scheduled',
          scheduledDate: date,
          remindersSentCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || pRows[0].displayName,
        actorRole: 'Patient / Family',
        dataCategory: 'Preventive Appointment Planning',
        purposeDescription: `Patient selected a screening visit date (${date}) from the personalized planner`,
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      const plan = await computeReminderPlanFor(patientId);
      res.json({ status: 'scheduled', scheduledDate: date, plan });
    } catch (error: any) {
      console.error('Error scheduling screening visit:', error);
      res.status(500).json({ error: 'Failed to schedule the screening visit' });
    }
  });

  // Smart reminder assistant: send a consented, safety-checked reminder now
  app.post('/api/patient/profile/:id/reminders/send', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const requestedKind = req.body?.kind === 'missed' ? 'missed' : 'upcoming';
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Profile not found' });

      const consentRow = await getConsentRow(patientId);
      if (!isPurposeAllowed(consentRow, 'channelReminders')) {
        return res.status(403).json({
          error:
            'Reminder consent is required: you withdrew the reminders purpose. No message was generated or sent.',
        });
      }

      const plan = await computeReminderPlanFor(patientId);
      if (!plan) return res.status(404).json({ error: 'Profile not found' });
      if (!plan.canSend) {
        return res.status(409).json({ error: plan.safetyMessage || 'No reminder can be sent right now.' });
      }

      const slots = requestedKind === 'missed' ? plan.missedReminders : plan.upcomingReminders;
      const slot =
        slots.find((s) => s.status === 'to_send') ||
        slots[0] ||
        null;
      if (!slot) {
        return res.status(409).json({ error: 'No scheduled reminder slot is available for this appointment.' });
      }

      const safety = validateM2MessageSafety(slot.message);
      if (!safety.valid) {
        return res.status(400).json({
          error: 'Message blocked by the M2 Responsible AI safety guardrail.',
          violations: safety.violations,
        });
      }

      const notificationId = `NOTIF-${patientId}-REM-${Date.now()}`;
      const sentAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      await db.insert(notifications).values({
        id: notificationId,
        patientId,
        recommendationId: null,
        channel: plan.channel,
        language: plan.language,
        recipientType:
          pRows[0].pathwayType === 'child'
            ? 'parent'
            : pRows[0].pathwayType === 'adolescent'
            ? 'adolescent'
            : 'adult',
        title:
          requestedKind === 'missed'
            ? plan.language === 'fr'
              ? 'Rappel — visite manquée'
              : 'Reminder — missed visit'
            : plan.language === 'fr'
            ? 'Rappel — visite à venir'
            : 'Reminder — upcoming visit',
        bodyText: slot.message,
        decisionAidSummary:
          plan.language === 'fr'
            ? 'Rappel généré par votre assistant, après votre consentement. Aucun diagnostic n’est transmis.'
            : 'Reminder generated by your assistant after your consent. No diagnosis is transmitted.',
        isRead: false,
        requiresAction: true,
        humanValidatedBy: `${req.user?.displayName || pRows[0].displayName} (patient-initiated reminder)`,
        sentAt,
      });

      await db
        .update(recommendations)
        .set({
          remindersSentCount: (plan.remindersSentCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || pRows[0].displayName,
        actorRole: 'Patient / Family',
        dataCategory: 'Smart Reminder Assistant',
        purposeDescription: `Consented ${requestedKind} reminder sent through ${plan.channel} (${slot.label})`,
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      const refreshed = await computeReminderPlanFor(patientId);
      res.json({ status: 'sent', notificationId, channel: plan.channel, slot, plan: refreshed });
    } catch (error: any) {
      console.error('Error sending smart reminder:', error);
      res.status(500).json({ error: 'Failed to send the reminder' });
    }
  });

  // Coordinator outreach actions: call logging, data completion request,
  // clinical review escalation and clinician validation request.
  app.post('/api/coordinator/patients/:id/outreach', requireAuth, requireRole('coordinator'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const action = String(req.body?.action || '');
      const allowedActions = ['call', 'request_data', 'request_validation', 'clinical_review'];
      if (!allowedActions.includes(action)) {
        return res.status(400).json({ error: `action must be one of: ${allowedActions.join(', ')}` });
      }
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Patient not found' });
      const p = pRows[0];
      const recRows = await db.select().from(recommendations).where(eq(recommendations.patientId, patientId));

      if (action === 'request_data' || action === 'request_validation') {
        const consentRow = await getConsentRow(patientId);
        if (!isPurposeAllowed(consentRow, 'channelReminders')) {
          return res.status(403).json({
            error:
              'Reminder consent is required: the patient withdrew the reminders purpose. No message was sent.',
          });
        }
        if (recRows[0]?.state === 'refused') {
          return res.status(409).json({
            error: 'This pathway was refused by the person. Reminders are stopped and require an explicit patient decision.',
          });
        }
        const language = (p.preferredLanguage as 'en' | 'fr' | 'ar') || 'en';
        const bodyText =
          action === 'request_data'
            ? language === 'fr'
              ? `Bonjour ${p.displayName}. Pour finaliser votre bilan de prévention, il manque quelques mesures de base. Vous pouvez les saisir dans votre portail ou les faire mesurer au centre ${p.facilityCenter}. Aucune conséquence sur votre accès aux soins.`
              : `Hello ${p.displayName}. A few baseline measurements are still needed to complete your prevention plan. You can enter them in your portal or have them measured at ${p.facilityCenter}. There is no impact on your access to care.`
            : language === 'fr'
            ? `Bonjour ${p.displayName}. Votre plan de prévention est en cours de validation par l’équipe de soin. Vous serez informé dès qu’il sera prêt. Aucune conséquence sur votre accès aux soins.`
            : `Hello ${p.displayName}. Your prevention plan is being validated by the care team. You will be informed as soon as it is ready. There is no impact on your access to care.`;

        const safety = validateM2MessageSafety(bodyText);
        if (!safety.valid) {
          return res.status(400).json({
            error: 'Message blocked by the M2 Responsible AI safety guardrail.',
            violations: safety.violations,
          });
        }

        await db.insert(notifications).values({
          id: `NOTIF-${patientId}-OUTREACH-${Date.now()}`,
          patientId,
          recommendationId: recRows[0]?.id || null,
          channel: p.preferredChannel,
          language,
          recipientType: p.pathwayType === 'child' ? 'parent' : p.pathwayType === 'adolescent' ? 'adolescent' : 'adult',
          title:
            action === 'request_data'
              ? language === 'fr'
                ? 'Mesures de base à compléter'
                : 'Baseline measurements to complete'
              : language === 'fr'
              ? 'Plan de prévention en validation'
              : 'Prevention plan under validation',
          bodyText,
          decisionAidSummary:
            language === 'fr'
              ? 'Message de coordination validé par un humain. Aucun diagnostic n’est transmis.'
              : 'Human-validated coordination message. No diagnosis is transmitted.',
          isRead: false,
          requiresAction: false,
          humanValidatedBy: req.user?.displayName || 'Care Coordinator',
          sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        });

        await db
          .update(recommendations)
          .set({ remindersSentCount: (recRows[0]?.remindersSentCount || 0) + 1, updatedAt: new Date() })
          .where(eq(recommendations.patientId, patientId));
      }

      const actionLabels: Record<string, string> = {
        call: 'Phone outreach logged',
        request_data: 'Baseline data completion requested',
        request_validation: 'Clinician validation requested',
        clinical_review: 'Urgent clinical review escalated',
      };

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Care Coordinator',
        actorRole: 'Care Coordinator',
        dataCategory: 'Care Coordination Outreach',
        purposeDescription: `${actionLabels[action]}${req.body?.note ? ` — ${String(req.body.note).slice(0, 180)}` : ''}`,
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'logged',
        action,
        label: actionLabels[action],
        loggedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error logging coordinator outreach:', error);
      res.status(500).json({ error: 'Failed to log outreach action' });
    }
  });

  // =========================================================================
  // 4B. FAMILY AFFILIATION, PARENT DB SEARCH, SMS OTP & 18Y MAJORITY DETACHMENT
  // =========================================================================

  // Search Adult Patients (>= 18y) in Database by ID or Name to affiliate a minor (< 18y)
  app.get('/api/family/search-parents', requireAuth, requireRole('clinician', 'coordinator'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const query = String(req.query.q || '').trim().toLowerCase();
      const allRows = await db.select().from(patients);
      const adults = allRows.filter((p) => p.ageYears >= 18 && !p.parentUserId);

      const matches = query
        ? adults.filter(
            (p) =>
              p.id.toLowerCase().includes(query) ||
              p.displayName.toLowerCase().includes(query)
          )
        : adults;

      // Put personas first so Tariq Al-Nadim, Sara, Fatima, Rashid appear immediately
      matches.sort((a, b) => Number(b.isPersona) - Number(a.isPersona));

      res.json({
        parents: matches.slice(0, 12).map((p) => ({
          id: p.id,
          displayName: p.displayName,
          ageYears: p.ageYears,
          sex: p.sex,
          region: p.region,
          facilityCenter: p.facilityCenter,
        })),
      });
    } catch (error: any) {
      console.error('Error searching adult parents:', error);
      res.status(500).json({ error: 'Failed to search parent records' });
    }
  });

  // Request 6-digit SMS OTP to confirm parent access to an affiliated child's portal data
  app.post('/api/patient/family/request-sms-otp', requireAuth, requireRole('patient', 'parent'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const { parentId, childId } = req.body || {};
      if (!parentId || !childId) {
        return res.status(400).json({ error: 'parentId and childId are required.' });
      }
      const childRows = await db.select().from(patients).where(eq(patients.id, childId));
      const child = childRows[0];
      if (!child || child.parentUserId !== parentId) {
        return res.status(403).json({
          error: 'This minor record is not affiliated with your patient account.',
        });
      }
      const scopeCheck = await assertPatientScope(req, childId);
      if (!scopeCheck.ok) {
        return res.status(scopeCheck.status ?? 403).json({ error: scopeCheck.error });
      }

      // Generate deterministic-looking 6-digit SMS OTP code
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      familySmsOtpStore.set(`${parentId}:${childId}`, {
        code: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      res.json({
        status: 'sms_sent',
        childId,
        childName: child.displayName,
        maskedPhone: '+971 50 ••• 8492',
        demoOtpCode: otpCode,
        expiresInSeconds: 300,
      });
    } catch (error: any) {
      console.error('Error requesting family SMS OTP:', error);
      res.status(500).json({ error: 'Failed to send SMS confirmation code' });
    }
  });

  // Verify 6-digit SMS OTP and unlock child's data in the unified Patient Portal
  app.post('/api/patient/family/verify-sms-otp', requireAuth, requireRole('patient', 'parent'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const { parentId, childId, otpCode } = req.body || {};
      if (!parentId || !childId) {
        return res.status(400).json({ error: 'parentId and childId are required.' });
      }
      const scopeCheck = await assertPatientScope(req, String(childId));
      if (!scopeCheck.ok) {
        return res.status(scopeCheck.status ?? 403).json({ error: scopeCheck.error });
      }
      const key = `${parentId}:${childId}`;
      const record = familySmsOtpStore.get(key);

      if (!record || record.expiresAt < Date.now() || record.code !== String(otpCode).trim()) {
        return res.status(400).json({
          error: 'Invalid or expired SMS confirmation code. Please check the 6-digit code sent via SMS.',
        });
      }

      familySmsOtpStore.delete(key);

      await db.insert(usageLogs).values({
        patientId: childId,
        actorName: `Parent (${parentId})`,
        actorRole: 'Affiliated Parent (SMS OTP Verified)',
        dataCategory: 'Affiliated Child Preventive Record',
        purposeDescription: 'Verified 6-digit SMS OTP to access affiliated child preventive portal',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'verified',
        childId,
      });
    } catch (error: any) {
      console.error('Error verifying family SMS OTP:', error);
      res.status(500).json({ error: 'Failed to verify SMS code' });
    }
  });

  // Request Majority Detachment (18y+) — Submitted for validation by the Competent Service
  app.post('/api/patient/family/request-majority-detachment', requireAuth, requireRole('patient', 'parent'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const { childId } = req.body || {};
      const scopeCheck = await assertPatientScope(req, String(childId || ''));
      if (!scopeCheck.ok) {
        return res.status(scopeCheck.status ?? 403).json({ error: scopeCheck.error });
      }
      const rows = await db.select().from(patients).where(eq(patients.id, childId));
      const child = rows[0];
      if (!child) return res.status(404).json({ error: 'Patient not found' });
      if (child.ageYears < 18) {
        return res.status(400).json({
          error: 'Majority detachment is only available once the affiliated child reaches 18 years of age.',
        });
      }

      const cp = { ...(child.clinicalProfile as Record<string, any>), majorityDetachmentRequested: true };
      await db
        .update(patients)
        .set({ clinicalProfile: cp as any })
        .where(eq(patients.id, childId));

      await db.insert(usageLogs).values({
        patientId: childId,
        actorName: child.displayName,
        actorRole: 'Patient (18y Majority Transition)',
        dataCategory: 'Family Affiliation & Majority Autonomy',
        purposeDescription: 'Requested majority detachment (18y+) — awaiting definitive validation by competent service',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'requested',
        message: 'Majority detachment request transmitted to the competent healthcare service for definitive validation.',
      });
    } catch (error: any) {
      console.error('Error requesting majority detachment:', error);
      res.status(500).json({ error: 'Failed to request majority detachment' });
    }
  });

  // Competent Service (Coordinator / Clinician): List affiliated records eligible for 18y Majority Detachment & all family affiliations
  app.get('/api/family/pending-detachments', requireAuth, requireRole('clinician', 'coordinator'), async (_req: AuthRequest, res) => {
    try {
      await ensureInit();
      const allRows = await db.select().from(patients);
      const byId = new Map(allRows.map((r) => [r.id, r]));

      const affiliatedList = allRows
        .filter((r) => Boolean(r.parentUserId))
        .map((r) => {
          const parent = r.parentUserId ? byId.get(r.parentUserId) : null;
          const cp = (r.clinicalProfile || {}) as Record<string, any>;
          return {
            childId: r.id,
            childName: r.displayName,
            ageYears: r.ageYears,
            ageMonths: r.ageMonths,
            pathwayType: r.pathwayType,
            overallLevel: r.overallLevel,
            parentId: r.parentUserId,
            parentName: parent?.displayName || r.parentUserId,
            eligibleForMajority: r.ageYears >= 18,
            majorityDetachmentRequested: Boolean(cp.majorityDetachmentRequested) || r.ageYears >= 18,
          };
        });

      res.json({
        affiliatedRecords: affiliatedList,
        pendingMajorityDetachments: affiliatedList.filter((item) => item.eligibleForMajority),
      });
    } catch (error: any) {
      console.error('Error fetching pending detachments:', error);
      res.status(500).json({ error: 'Failed to load family affiliations' });
    }
  });

  // Competent Service (Coordinator / Clinician): Definitively validate Majority Detachment (18y+)
  app.post('/api/family/approve-majority-detachment', requireAuth, requireRole('clinician', 'coordinator'), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const { childId } = req.body || {};
      const rows = await db.select().from(patients).where(eq(patients.id, childId));
      const child = rows[0];
      if (!child) return res.status(404).json({ error: 'Patient record not found' });
      if (child.ageYears < 18) {
        return res.status(400).json({
          error: 'Only patients aged 18 years or older can be detached for adult autonomy.',
        });
      }

      const previousParentId = child.parentUserId;
      const cp = {
        ...(child.clinicalProfile as Record<string, any>),
        majorityDetachmentRequested: false,
        majorityDetachmentApprovedBy: req.user?.displayName || 'Competent Healthcare Service',
        majorityDetachmentApprovedAt: new Date().toISOString().slice(0, 10),
        previousParentId,
      };

      await db
        .update(patients)
        .set({
          parentUserId: null,
          pathwayType: 'adult',
          primaryReasonSummary:
            'Autonomous Adult IFHAS Portal activated (Validated at 18y majority by competent service)',
          clinicalProfile: cp as any,
        })
        .where(eq(patients.id, childId));

      await db.insert(usageLogs).values({
        patientId: childId,
        actorName: req.user?.displayName || 'Coordinator / Clinician',
        actorRole: 'Competent Healthcare Service',
        dataCategory: 'Majority Detachment Validation (18y+)',
        purposeDescription: `Definitively validated majority detachment from parent (${previousParentId}) and activated autonomous Adult IFHAS account`,
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'approved',
        childId,
        newPathwayType: 'adult',
        autonomousEmail: `${child.displayName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@demo.medisense.ae`,
      });
    } catch (error: any) {
      console.error('Error approving majority detachment:', error);
      res.status(500).json({ error: 'Failed to approve majority detachment' });
    }
  });

  // Patient / Parent Guided Self-Assessment & Home Measurements (Triggers live backend recalculation)
  app.post('/api/patient/profile/:id/self-assessment', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const body = req.body || {};

      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!pRows[0]) return res.status(404).json({ error: 'Profile not found' });
      const p = pRows[0];
      const consentRow = await getConsentRow(patientId);
      if (!isPurposeAllowed(consentRow, 'evaluationAndCalendar')) {
        return res.status(403).json({
          error:
            'Evaluation consent is required: the patient has withdrawn the evaluation purpose. The self-assessment was not evaluated or saved.',
        });
      }

      // Validate BP readings if provided
      const bpPairs = [
        [body.systolicBp1, body.diastolicBp1],
        [body.systolicBp2, body.diastolicBp2],
      ];
      for (const [s, d] of bpPairs) {
        if (s !== undefined && s !== '' && d !== undefined && d !== '') {
          const sys = Number(s);
          const dia = Number(d);
          if (sys < 60 || sys > 260 || dia < 30 || dia > 160 || dia >= sys) {
            return res.status(400).json({
              error:
                'Blood pressure reading outside physiological bounds (Sys 60–260, Dia 30–160, Dia < Sys). Please rest 5 minutes and re-measure.',
            });
          }
        }
      }

      const currentProfile: Record<string, any> = {
        ...(p.clinicalProfile as Record<string, any>),
      };
      const numOrUndef = (v: any, fallback?: number) =>
        v !== undefined && v !== '' && v !== null ? Number(v) : fallback;

      if (body.systolicBp1 && body.diastolicBp1) {
        currentProfile.systolicBp1 = Number(body.systolicBp1);
        currentProfile.diastolicBp1 = Number(body.diastolicBp1);
      }
      if (body.systolicBp2 && body.diastolicBp2) {
        currentProfile.systolicBp2 = Number(body.systolicBp2);
        currentProfile.diastolicBp2 = Number(body.diastolicBp2);
      }
      const weightKg = numOrUndef(body.weightKg, currentProfile.weightKg);
      const heightCm = numOrUndef(body.heightCm, currentProfile.heightCm);
      if (weightKg && heightCm && heightCm > 30) {
        currentProfile.weightKg = weightKg;
        currentProfile.heightCm = heightCm;
        currentProfile.bmi = Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
      }
      if (body.waistCm !== undefined && body.waistCm !== '') {
        currentProfile.waistCm = Number(body.waistCm);
      }
      if (body.smokingStatus !== undefined && body.smokingStatus !== null) {
        currentProfile.smokingStatus = body.smokingStatus ? 'current' : 'never';
      }
      if (body.dailyPhysicalActivity !== undefined && body.dailyPhysicalActivity !== null) {
        currentProfile.dailyPhysicalActivity = Boolean(body.dailyPhysicalActivity);
      }
      if (body.dailyFruitsVeg !== undefined && body.dailyFruitsVeg !== null) {
        currentProfile.dailyFruitsVeg = Boolean(body.dailyFruitsVeg);
      }
      if (body.antihypertensiveMedHistory !== undefined && body.antihypertensiveMedHistory !== null) {
        currentProfile.antihypertensiveMed = Boolean(body.antihypertensiveMedHistory);
      }
      if (body.highBloodGlucoseHistory !== undefined && body.highBloodGlucoseHistory !== null) {
        currentProfile.historyHighGlucose = Boolean(body.highBloodGlucoseHistory);
      }
      if (body.familyHistoryDiabetesLevel) {
        currentProfile.familyHistoryDiabetes = body.familyHistoryDiabetesLevel;
      }
      if (body.familyPrematureCvd !== undefined) {
        currentProfile.familyHistoryFhOrEarlyCvd = Boolean(body.familyPrematureCvd);
      }
      if (body.isPregnant !== undefined) {
        currentProfile.isPregnant = Boolean(body.isPregnant);
      }
      if (body.pregnancyWeeks !== undefined && body.pregnancyWeeks !== '') {
        currentProfile.pregnancyWeeks = Number(body.pregnancyWeeks);
      }
      if (body.monthsSinceLastGlycemicScreening !== undefined && body.monthsSinceLastGlycemicScreening !== '') {
        currentProfile.monthsSinceLastGlycemicScreening = Number(body.monthsSinceLastGlycemicScreening);
      }
      if (body.mchatScore !== undefined && body.mchatScore !== '') {
        currentProfile.mchatScore = Number(body.mchatScore);
      }
      if (body.mchatFollowUpScore !== undefined && body.mchatFollowUpScore !== '') {
        currentProfile.mchatFollowUpScore = Number(body.mchatFollowUpScore);
      }
      if (body.redFlagWarningSymptom !== undefined) {
        currentProfile.redFlagWarningSymptom = Boolean(body.redFlagWarningSymptom);
        currentProfile.redFlagSymptomLabel = body.redFlagSymptomLabel || 'Patient-reported warning symptom';
        // Wire the safety escape E0 as well: a reported danger sign must not be
        // stored as a decorative checkbox.
        currentProfile.hasEmergencySymptoms = Boolean(body.redFlagWarningSymptom);
        currentProfile.hasSymptomaticCrisis = Boolean(body.redFlagWarningSymptom);
      }

      // Self-reported / home-measured provenance ('D')
      currentProfile.oldestMeasureMonths = 0;
      currentProfile.provenanceMap = {
        ...(currentProfile.provenanceMap || {}),
        bp: 'D',
        bmi: 'D',
        lifestyle: 'D',
      };

      const pConsents = await db.select().from(consents).where(eq(consents.patientId, patientId));
      const evaluated = evaluatePatientRules(
        {
          id: p.id,
          ageYears: p.ageYears,
          ageMonths: p.ageMonths,
          gestationalAgeWeeks: p.gestationalAgeWeeks,
          sex: p.sex,
          pathwayType: p.pathwayType,
          nationalityGroup: p.nationalityGroup,
          clinicalProfile: currentProfile,
        },
        Boolean(pConsents[0]?.existingGenomicResult)
      );

      currentProfile.bpZoneLabel = evaluated.calculations.bpProtocol.bpZoneLabel;
      if (evaluated.calculations.findriscModel.score !== null) {
        currentProfile.findriscScore = evaluated.calculations.findriscModel.score;
      }
      if (
        evaluated.calculations.bpProtocol.retainedSys &&
        evaluated.calculations.bpProtocol.retainedDia
      ) {
        const prevSeries = Array.isArray(currentProfile.bpSeries) ? currentProfile.bpSeries : [];
        currentProfile.bpSeries = [
          ...prevSeries.slice(-3),
          {
            dateLabel: 'Self-check',
            systolic: Math.round(evaluated.calculations.bpProtocol.retainedSys),
            diastolic: Math.round(evaluated.calculations.bpProtocol.retainedDia),
            targetMaxSys: 130,
            targetMaxDia: 85,
          },
        ];
      }

      await db
        .update(patients)
        .set({
          clinicalProfile: currentProfile as any,
          overallLevel: evaluated.overallLevel,
          overallCertainty: evaluated.overallCertainty,
          primaryReasonSummary:
            evaluated.flags[0]?.title || 'All recommended preventive screenings are up to date',
        })
        .where(eq(patients.id, patientId));

      await db.delete(flags).where(eq(flags.patientId, patientId));
      for (let idx = 0; idx < evaluated.flags.length; idx++) {
        const f = evaluated.flags[idx];
        await db.insert(flags).values({
          id: `FLG-${patientId}-${Date.now()}-${idx}`,
          patientId,
          ruleId: f.ruleId,
          flagType: f.flagType,
          level: f.level,
          title: f.title,
          factors: f.factors,
          sourceLabel: f.sourceLabel,
          missingData: f.missingData,
          dueDate: f.dueDate,
          certainty: f.certainty,
          certaintyReason: f.certaintyReason,
          isEclipseSuspended: f.isEclipseSuspended,
        });
      }

      await db
        .update(recommendations)
        .set({
          pathwayTitle: evaluated.calculations.consolidatedCarePlan.pathwayTitle,
          groupedActions: evaluated.calculations.consolidatedCarePlan.groupedActions.map((a) => ({
            actionTitle: a.actionTitle,
            directiveSource: a.directiveSource,
            category: a.category,
          })),
          level: evaluated.overallLevel,
          dueDate: evaluated.flags[0]?.dueDate || 'Within 30 days',
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || p.displayName,
        actorRole: 'Patient / Family',
        dataCategory: 'Guided Self-Assessment & Home Vitals (Provenance D)',
        purposeDescription: 'Submitted self-assessment & home measurements — preventive pathway recalculated',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'recalculated',
        overallLevel: evaluated.overallLevel,
        overallCertainty: evaluated.overallCertainty,
        flags: evaluated.flags,
        calculations: evaluated.calculations,
      });
    } catch (error: any) {
      console.error('Error processing patient self-assessment:', error);
      res.status(500).json({ error: error.message || 'Failed to process self-assessment' });
    }
  });

  // Patient Choice: Confirm / Postpone / Refuse (Rule 8 & TEST-E3: Refusal stops reminders immediately)
  app.post('/api/patient/profile/:id/respond', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const { responseType, newDate } = req.body; // 'confirm' | 'postpone' | 'refuse'
      if (!['confirm', 'postpone', 'refuse'].includes(responseType)) {
        return res.status(400).json({ error: 'responseType must be confirm, postpone or refuse.' });
      }

      const nextState =
        responseType === 'confirm'
          ? 'scheduled'
          : responseType === 'postpone'
          ? 'postponed'
          : 'refused';

      await db
        .update(recommendations)
        .set({
          state: nextState,
          scheduledDate:
            responseType === 'postpone'
              ? newDate || '2026-12-05'
              : responseType === 'confirm'
              ? '2026-11-24'
              : null,
          remindersSentCount: responseType === 'refuse' ? 0 : 1,
          updatedAt: new Date(),
        })
        .where(eq(recommendations.patientId, patientId));

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Patient / Parent',
        actorRole: 'Patient / Family',
        dataCategory: 'Preventive Appointment Choice',
        purposeDescription:
          responseType === 'refuse'
            ? 'Declined preventive invitation — all automated reminders immediately halted (TEST-E3)'
            : `Updated preventive appointment response: ${nextState.toUpperCase()}`,
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({
        status: 'updated',
        state: nextState,
        remindersHalted: responseType === 'refuse',
      });
    } catch (error: any) {
      console.error('Error recording patient response:', error);
      res.status(500).json({ error: 'Failed to record response' });
    }
  });

  // Patient Granular Consents Update (5 toggles — immediate recalculation & reminder halt)
  app.put('/api/patient/profile/:id/consents', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const {
        evaluationAndCalendar,
        channelReminders,
        shareWithFacility,
        anonymousStatistics,
        existingGenomicResult,
      } = req.body;

      const currentConsent = await getConsentRow(patientId);
      const nextConsents = {
        evaluationAndCalendar:
          evaluationAndCalendar !== undefined
            ? Boolean(evaluationAndCalendar)
            : currentConsent?.evaluationAndCalendar ?? true,
        channelReminders:
          channelReminders !== undefined
            ? Boolean(channelReminders)
            : currentConsent?.channelReminders ?? true,
        shareWithFacility:
          shareWithFacility !== undefined
            ? Boolean(shareWithFacility)
            : currentConsent?.shareWithFacility ?? true,
        anonymousStatistics:
          anonymousStatistics !== undefined
            ? Boolean(anonymousStatistics)
            : currentConsent?.anonymousStatistics ?? true,
        existingGenomicResult:
          existingGenomicResult !== undefined
            ? Boolean(existingGenomicResult)
            : currentConsent?.existingGenomicResult ?? false,
        updatedAt: new Date(),
      };
      let updated = await db
        .update(consents)
        .set(nextConsents)
        .where(eq(consents.patientId, patientId))
        .returning();
      if (!updated[0]) {
        updated = await db
          .insert(consents)
          .values({ patientId, ...nextConsents })
          .returning();
      }

      // Apply the consent change to the stored pathway immediately. Withdrawing
      // evaluation consent clears the active flags; withdrawing genomic consent
      // re-evaluates and removes G1/G2. Reminder withdrawal resets the counter.
      const pRows = await db.select().from(patients).where(eq(patients.id, patientId));
      const p = pRows[0];

      if (!updated[0]?.channelReminders) {
        await db
          .update(recommendations)
          .set({ remindersSentCount: 0, updatedAt: new Date() })
          .where(eq(recommendations.patientId, patientId));
      }

      if (p && !updated[0]?.evaluationAndCalendar) {
        await db.delete(flags).where(eq(flags.patientId, patientId));
        await db
          .update(patients)
          .set({
            overallLevel: 'grey',
            overallCertainty: 'low',
            primaryReasonSummary:
              'Evaluation paused — the patient withdrew the evaluation and prevention-calendar purpose',
          })
          .where(eq(patients.id, patientId));
        await db
          .update(recommendations)
          .set({ level: 'grey', updatedAt: new Date() })
          .where(eq(recommendations.patientId, patientId));
      } else if (p) {
        const evaluated = evaluatePatientRules(
          {
            id: p.id,
            ageYears: p.ageYears,
            ageMonths: p.ageMonths,
            gestationalAgeWeeks: p.gestationalAgeWeeks,
            sex: p.sex,
            pathwayType: p.pathwayType,
            nationalityGroup: p.nationalityGroup,
            clinicalProfile: p.clinicalProfile,
          },
          Boolean(updated[0]?.existingGenomicResult)
        );

        await db
          .update(patients)
          .set({
            overallLevel: evaluated.overallLevel,
            overallCertainty: evaluated.overallCertainty,
            primaryReasonSummary:
              evaluated.flags[0]?.title || 'All recommended preventive screenings are up to date',
          })
          .where(eq(patients.id, patientId));

        await db.delete(flags).where(eq(flags.patientId, patientId));
        for (let idx = 0; idx < evaluated.flags.length; idx++) {
          const f = evaluated.flags[idx];
          await db.insert(flags).values({
            id: `FLG-${patientId}-${Date.now()}-${idx}`,
            patientId,
            ruleId: f.ruleId,
            flagType: f.flagType,
            level: f.level,
            title: f.title,
            factors: f.factors,
            sourceLabel: f.sourceLabel,
            missingData: f.missingData,
            dueDate: f.dueDate,
            certainty: f.certainty,
            certaintyReason: f.certaintyReason,
            isEclipseSuspended: f.isEclipseSuspended,
          });
        }

        await db
          .update(recommendations)
          .set({
            pathwayTitle: evaluated.calculations.consolidatedCarePlan.pathwayTitle,
            groupedActions: evaluated.calculations.consolidatedCarePlan.groupedActions.map((a) => ({
              actionTitle: a.actionTitle,
              directiveSource: a.directiveSource,
              category: a.category,
            })),
            level: evaluated.overallLevel,
            updatedAt: new Date(),
          })
          .where(eq(recommendations.patientId, patientId));
      }

      await db.insert(usageLogs).values({
        patientId,
        actorName: req.user?.displayName || 'Patient / Parent',
        actorRole: 'Patient / Family',
        dataCategory: 'Consent Preferences (5 Purposes)',
        purposeDescription: !nextConsents.channelReminders
          ? 'Withdrew reminder consent — all outreach immediately stopped'
          : 'Updated granular data use authorizations',
        ruleVersionRef: 'ABU_DHABI_WCV_IFHAS_V8 (Signed)',
      });

      res.json({ consents: updated[0] });
    } catch (error: any) {
      console.error('Error updating consents:', error);
      res.status(500).json({ error: 'Failed to update consents' });
    }
  });

  app.put('/api/patient/profile/:id/preferences', requireAuth, requireRole('patient', 'parent'), requirePatientScope(), async (req: AuthRequest, res) => {
    try {
      await ensureInit();
      const patientId = req.params.id;
      const { preferredLanguage, preferredChannel, preferFemalePractitioner } = req.body;
      const updated = await db
        .update(patients)
        .set({
          preferredLanguage: preferredLanguage || 'en',
          preferredChannel: preferredChannel || 'WhatsApp',
          preferFemalePractitioner: Boolean(preferFemalePractitioner),
        })
        .where(eq(patients.id, patientId))
        .returning();
      res.json({ profile: updated[0] });
    } catch (error: any) {
      console.error('Error updating patient preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  });

  // =========================================================================
  // 5. COORDINATOR PORTAL ENDPOINT (Screen 1: Population Queue + S_prio + M1)
  // =========================================================================

  // Cache the benchmark sensitivity analysis (pure computation, seed-stable).
  // Computed once on first call, reused for the process lifetime.
  let _cachedSensitivity: ReturnType<typeof getObservatorySummary>['sensitivityAnalysis'] | null = null;
  const getCachedSensitivity = () => {
    if (!_cachedSensitivity) {
      _cachedSensitivity = getObservatorySummary(20261120, 'baseline').sensitivityAnalysis;
    }
    return _cachedSensitivity;
  };

  app.get('/api/coordinator/queue', requireAuth, requireRole('coordinator'), async (_req: AuthRequest, res) => {
    try {
      await ensureInit();
      const [allPatients, allRecs] = await Promise.all([
        db.select().from(patients),
        db.select().from(recommendations),
      ]);
      const recMap = new Map(allRecs.map((r) => [r.patientId, r]));

      const items = allPatients.map((p) => {
        const rec = recMap.get(p.id);
        return {
          patientId: p.id,
          displayName: p.displayName,
          ageYears: p.ageYears,
          pathwayType: p.pathwayType,
          region: p.region,
          facilityCenter: p.facilityCenter,
          preferredLanguage: p.preferredLanguage,
          preferredChannel: p.preferredChannel,
          overallLevel: p.overallLevel,
          overallCertainty: p.overallCertainty,
          primaryReasonSummary: p.primaryReasonSummary,
          nextDueDate: p.nextDueDate,
          recommendationState: rec?.state || 'created',
          // Screen 1 ONLY: Logistics S_prio & M1 No-Show probability
          priorityScoreSprio: rec?.priorityScoreSprio ?? 0,
          mlNoShowProbM1: rec?.mlNoShowProbM1 ?? 0.15,
          mlTopFactorsM1: rec?.mlTopFactorsM1 ?? [],
          mlSuggestedAction: rec?.mlSuggestedAction ?? 'Standard reminder',
        };
      });

      // Split into the 3 operational queues (Section 5.3 & Phase 5):
      // 1. Immediate Red Queue (bypasses S_prio)
      const redImmediateQueue = items.filter((i) => i.overallLevel === 'red');
      // 2. Level Grey Queue (missing data to complete)
      const greyCompletionQueue = items.filter((i) => i.overallLevel === 'grey');
      // 3. Prioritized Invitation Queue (Orange & Yellow sorted by S_prio descending)
      const prioritizedInvitationQueue = items
        .filter((i) => (i.overallLevel === 'orange' || i.overallLevel === 'yellow') && i.recommendationState !== 'refused')
        .sort((a, b) => b.priorityScoreSprio - a.priorityScoreSprio);

      // Sensitivity analysis — served from in-process cache (seed-stable computation)
      const benchmarkSensitivity = getCachedSensitivity();
      const stable = benchmarkSensitivity.topKOverlapPercent >= 80;

      res.json({
        dailyCapacityLimit: 25,
        humanContactBudgetB: 8,
        sensitivityAnalysis: {
          weightPerturbationDelta: benchmarkSensitivity.weightPerturbationDelta,
          topKOverlapPercent: benchmarkSensitivity.topKOverlapPercent,
          status: stable
            ? 'Stable under weight perturbation (top-K overlap >= 80%)'
            : `Unstable under weight perturbation (top-K overlap ${benchmarkSensitivity.topKOverlapPercent}%) — flagged for clinical governance review (§5.3)`,
        },
        redImmediateQueue,
        greyCompletionQueue,
        prioritizedInvitationQueue,
      });
    } catch (error: any) {
      console.error('Error loading coordinator queue:', error);
      res.status(500).json({ error: 'Failed to load coordinator queue' });
    }
  });

  // Coordinator Interactive S_prio & M1 Logistics Simulator (Screen 1 ONLY)
  app.post('/api/coordinator/simulate-logistics', requireAuth, requireRole('patient', 'parent', 'clinician', 'coordinator', 'public_health'), async (req: AuthRequest, res) => {
    try {
      const body = req.body || {};
      const result = computeLogisticsAndM1({
        overallLevel: body.overallLevel || 'orange',
        openGapsCount: Number(body.openGapsCount ?? 2),
        maxOverdueDays: Number(body.maxOverdueDays ?? 60),
        accessTimeMinutes: Number(body.accessTimeMinutes ?? 40),
        languageNeedsSupport: Boolean(body.languageNeedsSupport),
        residesInUnderservedZoneC1: Boolean(body.residesInUnderservedZoneC1),
        contextConsentGiven: body.contextConsentGiven !== undefined ? Boolean(body.contextConsentGiven) : true,
        missedVisitsCount: Number(body.missedVisitsCount ?? 1),
        preferredChannel: body.preferredChannel || 'WhatsApp',
        reminderRank: Number(body.reminderRank ?? 1),
      });

      // Also compute baseline without vulnerability to prove TEST-M1 (non-downgrade guarantee)
      const baselineWithoutVuln = computeLogisticsAndM1({
        overallLevel: body.overallLevel || 'orange',
        openGapsCount: Number(body.openGapsCount ?? 2),
        maxOverdueDays: Number(body.maxOverdueDays ?? 60),
        accessTimeMinutes: 10,
        languageNeedsSupport: false,
        residesInUnderservedZoneC1: false,
        contextConsentGiven: false,
        missedVisitsCount: 0,
        preferredChannel: 'WhatsApp',
        reminderRank: 0,
      });

      res.json({
        simulation: result,
        baselinePriorityScoreSprio: baselineWithoutVuln.priorityScoreSprio,
        nonDowngradeVerified: result.priorityScoreSprio >= baselineWithoutVuln.priorityScoreSprio,
      });
    } catch (error: any) {
      console.error('Error simulating logistics:', error);
      res.status(500).json({ error: 'Failed to simulate logistics' });
    }
  });

  // =========================================================================
  // 6. PUBLIC HEALTH OBSERVATORY ENDPOINT (Exigence 4 & 5: Wilson, n<10 Masking, Benchmark)
  // =========================================================================
  app.get('/api/observatory/summary', requireAuth, requireRole('public_health'), async (req: AuthRequest, res) => {
    try {
      // NOTE: everything returned here is COMPUTED LIVE by the benchmark engine
      // (src/server/benchmarkEngine.ts): synthetic cohort with hidden ground truth
      // generated independently of the rules engine, real rule evaluation, real
      // Wilson intervals and masking via the safeguard engine, real benchmark arms
      // at equal invitation capacity, real calibration metrics. No hardcoded figures.
      const seedParam = Number(req.query.seed) || 20261120;
      const scenarioParam = String(req.query.scenario || 'baseline');
      const scenario = (BENCHMARK_SCENARIOS as string[]).includes(scenarioParam)
        ? (scenarioParam as BenchmarkScenario)
        : 'baseline';

      const summary = getObservatorySummary(seedParam, scenario);
      res.json(summary);
    } catch (error: any) {
      console.error('Error building observatory summary:', error);
      res.status(500).json({ error: 'Failed to load observatory data' });
    }
  });
  // =========================================================================
  // NEON SERVICES HEALTH & WIRING ENDPOINTS
  // =========================================================================

  // Health check: Postgres
  app.get('/api/neon/postgres', async (_req, res) => {
    try {
      const { db } = await import('./src/db/index.ts');
      const { sql } = await import('drizzle-orm');
      const rows = await db.execute(sql`SELECT current_database() AS db, now() AS ts`);
      res.json({ ok: true, db: (rows.rows ?? rows)[0] });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Health check: Neon Auth (JWKS reachability)
  app.get('/api/neon/auth', async (_req, res) => {
    try {
      const jwksUrl = getNeonAuthJwksUrl();
      const authBase = getNeonAuthBaseUrl();
      const r = await fetch(jwksUrl);
      const json = await r.json();
      res.json({ ok: r.ok, jwksUrl, authBase, keysCount: (json.keys ?? []).length });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Health check: AI Gateway
  app.get('/api/neon/ai-gateway', async (_req, res) => {
    try {
      const models = await listAIGatewayModels();
      res.json({ ok: true, models });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Health check: Functions (proxy call to deployed hello function)
  app.get('/api/neon/functions', async (_req, res) => {
    try {
      const url = getFunctionURL('hello');
      const r = await fetch(url);
      const text = await r.text();
      res.json({ ok: r.ok, url, response: text });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Realtime: seal a live query token (authenticated endpoint)
  app.post('/api/neon/realtime/seal', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { sql: querySql, params } = req.body as { sql: string; params?: unknown[] };
      if (!querySql) return res.status(400).json({ error: 'sql is required' });
      const sealed = await sealRealtimeQuery(querySql, params ?? []);
      res.json({ ok: true, ...sealed });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Health check: Realtime (seal a simple query to prove signing works)
  app.get('/api/neon/realtime', async (_req, res) => {
    try {
      const wsUrl = process.env.NEON_REALTIME_URL;
      const secret = process.env.NEON_REALTIME_SECRET;
      if (!wsUrl || !secret) throw new Error('NEON_REALTIME_URL / NEON_REALTIME_SECRET not set');
      const sealed = await sealRealtimeQuery('SELECT 1 AS ping', []);
      res.json({ ok: true, wsUrl, tokenLength: sealed.token.length });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Neon overall summary
  app.get('/api/neon/health', async (_req, res) => {
    const checks: Record<string, unknown> = {};
    // Postgres
    try {
      const { db } = await import('./src/db/index.ts');
      const { sql } = await import('drizzle-orm');
      const rows = await db.execute(sql`SELECT current_database() AS db`);
      checks.postgres = { ok: true, db: ((rows.rows ?? rows)[0] as any).db };
    } catch (e: any) { checks.postgres = { ok: false, error: e.message }; }
    // Auth JWKS
    try {
      const r = await fetch(getNeonAuthJwksUrl());
      checks.auth = { ok: r.ok, status: r.status };
    } catch (e: any) { checks.auth = { ok: false, error: e.message }; }
    // AI Gateway
    try {
      const models = await listAIGatewayModels();
      checks.aiGateway = { ok: true, models };
    } catch (e: any) { checks.aiGateway = { ok: false, error: e.message }; }
    // Functions
    try {
      const url = getFunctionURL('hello');
      const r = await fetch(url);
      checks.functions = { ok: r.ok, url };
    } catch (e: any) { checks.functions = { ok: false, error: e.message }; }
    // Realtime
    try {
      const sealed = await sealRealtimeQuery('SELECT 1 AS ping', []);
      checks.realtime = { ok: true, wsUrl: sealed.url };
    } catch (e: any) { checks.realtime = { ok: false, error: e.message }; }

    const allOk = Object.values(checks).every((c: any) => c.ok);
    res.status(allOk ? 200 : 207).json({ allOk, checks });
  });


  // Mount Vite Dev Server or Static Dist
  if (process.env.NODE_ENV !== 'production') {
    // Load Vite only in development. Production must not import the dev server
    // (and must not require Vite/rolldown to be installed at runtime).
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediSense Full-Stack Server listening on http://0.0.0.0:${PORT}`);

    // Warmup: seed DB and pre-compute benchmark cache in background so the
    // first user request is fast (no cold-init penalty on login).
    ensureInit()
      .then(() => {
        getCachedSensitivity(); // pre-warm benchmark computation
        console.log('[warmup] DB seeded & benchmark cache ready');
      })
      .catch((err) => console.error('[warmup] failed:', err));
  });
}

startServer();