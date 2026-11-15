import { db } from '../db/index.ts';
import {
  consents,
  flags,
  notifications,
  patients,
  recommendations,
  ruleTables,
  usageLogs,
  users,
} from '../db/schema.ts';
import {
  computeReferralHmac,
  evaluatePatientRules,
  getCanonicalSignedRuleTable,
} from './rulesEngine.ts';
import { computeLogisticsAndM1, generateCulturallyAdaptedInvitation } from './mlLogistics.ts';
import { count } from 'drizzle-orm';
import { DEMO_SEED, seededUnit } from '../lib/demoData.ts';

/**
 * Deterministic Pseudo-Random Generator (Mulberry32) so that the synthetic cohort
 * and benchmark reproduce identical results for a given seed (TEST-M5).
 */
export function createSeededRng(seed: number) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// Hidden ground truth (Â§7 & Â§8.4) â€” DECOUPLED from the visible panel design.
// The visible panel (isGrey/isOrange/isYellow levels, BP/BMI profiles) uses
// illustrative constants; the hidden truth below is drawn from an INDEPENDENT
// mechanism: a disjoint seeded-unit stream block (salts 200+) plus a documented
// prevalence-shaped risk function that is deliberately DIFFERENT from the rules
// engine's scoring functions (WHO 2019 chart lookup, FINDRISC logistic) so that
// the truth cannot be circularly derived from the engine (Cahier des Charges Â§7
// "VÃ©ritÃ© cachÃ©e â€¦ pour limiter la circularitÃ©" and Â§9.2). These constants are
// documented generator tunables â€” same status as the Â§8.3/Â§8.4 benchmark
// constants in benchmarkEngine.ts â€” and never engine outputs.
// ============================================================================

/** Salt block reserved for hidden-truth streams; panel design uses salts 1â€“4. */
const GROUND_TRUTH_SALT_BASE = 200;

const TRUTH_CONSTANTS = {
  childBasePrevalence: 0.14,
  adultBasePrevalence: 0.12,
  adultAgeRampPerYear: 0.006,
  adultAgeRampStart: 40,
  maleExcess: 0.05,
  maxPrevalence: 0.65,
  MediBeninConfirmProb: 0.78,
  baselineConfirmProb: 0.52,
  visitWindowDays: [5, 30] as [number, number],
};

/** Age/sex-only screening policy threshold of the hypothetical baseline (H-ref). */
const AGE_SEX_ONLY_SCREENING_START_AGE = 45;

export function drawSyntheticGroundTruth(
  seed: number,
  index: number,
  ctx: { ageYears: number; sex: string; pathwayType: string }
): {
  hasTrueUnmetCondition: boolean;
  invitedUnderAgeSexOnly: boolean;
  confirmedVisitUnderMediBenin: boolean;
  confirmedVisitUnderBaseline: boolean;
  daysToVisit: number;
} {
  const u = (salt: number) => seededUnit(seed, index, GROUND_TRUTH_SALT_BASE + salt);
  const { ageYears, sex, pathwayType } = ctx;

  const prevalence =
    pathwayType === 'adult'
      ? TRUTH_CONSTANTS.adultBasePrevalence +
        TRUTH_CONSTANTS.adultAgeRampPerYear *
          Math.max(0, ageYears - TRUTH_CONSTANTS.adultAgeRampStart) +
        (sex.toLowerCase() === 'male' ? TRUTH_CONSTANTS.maleExcess : 0)
      : TRUTH_CONSTANTS.childBasePrevalence;

  const hasTrueUnmetCondition = u(0) < Math.min(TRUTH_CONSTANTS.maxPrevalence, prevalence);
  const invitedUnderAgeSexOnly = ageYears >= AGE_SEX_ONLY_SCREENING_START_AGE;
  const confirmedVisitUnderMediBenin = u(1) < TRUTH_CONSTANTS.MediBeninConfirmProb;
  const confirmedVisitUnderBaseline = u(2) < TRUTH_CONSTANTS.baselineConfirmProb;
  const [lo, hi] = TRUTH_CONSTANTS.visitWindowDays;
  const daysToVisit = lo + Math.round(u(3) * (hi - lo));

  return {
    hasTrueUnmetCondition,
    invitedUnderAgeSexOnly,
    confirmedVisitUnderMediBenin,
    confirmedVisitUnderBaseline,
    daysToVisit,
  };
}

export async function ensureSeededDatabase(seed = DEMO_SEED) {
  try {
    const existingCount = await db.select({ value: count() }).from(patients);
    if (existingCount[0] && existingCount[0].value >= 25) {
      return { seeded: false, totalPatients: existingCount[0].value, seed };
    }

    console.log(`Seeding MediBenin PostgreSQL database with deterministic seed ${seed}...`);
    const signedTable = getCanonicalSignedRuleTable();

    // 1. Insert Signed Rules Table
    await db
      .insert(ruleTables)
      .values({
        tableCode: signedTable.tableCode,
        version: signedTable.version,
        signedBy: signedTable.signedBy,
        signerRole: signedTable.signerRole,
        signatureHash: signedTable.signatureHash,
        isSigned: signedTable.isSigned,
        reviewDate: signedTable.reviewDate,
        rulesPayload: signedTable.rules,
      })
      .onConflictDoNothing();

    // 2. Insert Demo Accounts
    const demoUsers = [
      {
        uid: 'demo-patient-tariq',
        email: 'tariq.nadim@demo.MediBenin.ae',
        displayName: 'Tariq Al-Nadim (Adult 36y)',
        role: 'patient',
        preferredLanguage: 'en',
        facilityName: 'Al Bateen Healthcare Centre',
        linkedPatientIds: ['PT-36Y-TARIQ'],
      },
      {
        uid: 'demo-parent-amira',
        email: 'amira.mansoor@demo.MediBenin.ae',
        displayName: 'Amira Al-Mansoor (Parent)',
        role: 'parent',
        preferredLanguage: 'en',
        facilityName: 'Al Bateen Healthcare Centre',
        linkedPatientIds: ['PT-18M-ZAYED', 'PT-14Y-LAYLA'],
      },
      {
        uid: 'demo-clinician-sydney',
        email: 'dr.kpegbe@abudhabi-health.demo.ae',
        displayName: 'Dr. Sydney Kpegbe, MD',
        role: 'clinician',
        preferredLanguage: 'en',
        facilityName: 'Al Bateen Healthcare Centre',
        linkedPatientIds: [],
      },
      {
        uid: 'demo-coordinator-orace',
        email: 'orace.coord@abudhabi-health.demo.ae',
        displayName: 'Orace Attinmawassonou (Coordinator)',
        role: 'coordinator',
        preferredLanguage: 'en',
        facilityName: 'Abu Dhabi Primary Care Network',
        linkedPatientIds: [],
      },
      {
        uid: 'demo-ph-bienderan',
        email: 'bienderan.epi@doh-observatory.demo.ae',
        displayName: 'Bienderan Egbo (Public Health)',
        role: 'public_health',
        preferredLanguage: 'en',
        facilityName: 'Abu Dhabi Public Health Observatory',
        linkedPatientIds: [],
      },
    ];

    for (const u of demoUsers) {
      await db.insert(users).values(u).onConflictDoNothing();
    }

    // 3. Define the 7 curated synthetic clinical cases
    const corePersonas = [
      // Persona 1: 18-month child (Zayed)
      {
        id: 'PT-18M-ZAYED',
        displayName: 'Zayed Al-Mansoor',
        ageYears: 1,
        ageMonths: 18,
        gestationalAgeWeeks: 39,
        sex: 'male',
        pathwayType: 'child',
        isPersona: true,
        parentUserId: 'demo-parent-amira',
        region: 'Abu Dhabi',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'ar',
        preferredChannel: 'WhatsApp',
        preferFemalePractitioner: true,
        accessTimeMinutes: 18,
        missedVisitsCount: 1,
        facilityCenter: 'Al Bateen Healthcare Centre',
        primaryReasonSummary: '18-month Well-Child Visit overdue, anemia check due, and developmental follow-up conversation recommended',
        nextDueDate: '2026-11-24',
        preventionProgressDone: 3,
        preventionProgressTotal: 5,
        referralCode: 'WCV8492Z',
        recommendationState: 'invited',
        consentGenomic: false,
        clinicalProfile: {
          weightKg: 10.8,
          heightCm: 81.5,
          muacMm: 148,
          weightForHeightZ: -0.3,
          bmiForAgeZ: -0.1,
          missedWcvConsecutive: 1,
          vaccineDelayDays: 38,
          isZeroDoseChild: false,
          anemiaScreeningDone: false,
          mchatScore: 5,
          provenanceMap: { growth: 'V', vaccines: 'D', mchat: 'D' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 6,
          growthSeries: [
            { ageLabel: '2m', value: 5.5, refLow: 4.5, refMid: 5.6, refHigh: 6.8 },
            { ageLabel: '6m', value: 7.8, refLow: 6.4, refMid: 7.9, refHigh: 9.5 },
            { ageLabel: '12m', value: 9.5, refLow: 7.8, refMid: 9.6, refHigh: 11.5 },
            { ageLabel: '18m', value: 10.8, refLow: 8.8, refMid: 10.9, refHigh: 13.0 },
          ],
          vaccinesList: [
            { name: 'BCG & HepB (Birth)', status: 'done' as const, dateLabel: 'May 2025' },
            { name: 'Hexavalent & PCV (2â€“6m)', status: 'done' as const, dateLabel: 'Nov 2025' },
            { name: 'MMR Dose 1 (12m)', status: 'done' as const, dateLabel: 'May 2026' },
            { name: '18-Month Booster (DTP-Hib-IPV & MMR 2)', status: 'overdue' as const, dateLabel: 'Due Oct 2026' },
          ],
        },
      },
      // Persona 2: 14-year-old Adolescent (Layla)
      {
        id: 'PT-14Y-LAYLA',
        displayName: 'Layla Al-Mansoor',
        ageYears: 14,
        ageMonths: 168,
        gestationalAgeWeeks: 40,
        sex: 'female',
        pathwayType: 'adolescent',
        isPersona: true,
        parentUserId: 'demo-parent-amira',
        region: 'Abu Dhabi',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'en',
        preferredChannel: 'App',
        preferFemalePractitioner: true,
        accessTimeMinutes: 18,
        missedVisitsCount: 0,
        facilityCenter: 'Al Bateen Healthcare Centre',
        primaryReasonSummary: 'Family history lipid check recommended (equity pathway), adolescent vaccine due, and supportive growth follow-up',
        nextDueDate: '2026-11-22',
        preventionProgressDone: 2,
        preventionProgressTotal: 4,
        referralCode: 'ADL4710L',
        recommendationState: 'invited',
        consentGenomic: false,
        clinicalProfile: {
          weightKg: 66.0,
          heightCm: 158.0,
          bmi: 26.4,
          bmiForAgeZ: 2.3,
          familyHistoryFhOrEarlyCvd: true,
          adolescentVaccinesUpToDate: false,
          provenanceMap: { growth: 'M', familyHistory: 'V', vaccines: 'V' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 3,
          growthSeries: [
            { ageLabel: '11y', value: 19.2, refLow: 14.5, refMid: 17.5, refHigh: 21.0 },
            { ageLabel: '12y', value: 21.5, refLow: 15.0, refMid: 18.2, refHigh: 22.0 },
            { ageLabel: '13y', value: 24.1, refLow: 15.5, refMid: 18.9, refHigh: 23.0 },
            { ageLabel: '14y', value: 26.4, refLow: 16.0, refMid: 19.6, refHigh: 24.0 },
          ],
          vaccinesList: [
            { name: 'Childhood Primary Series', status: 'done' as const, dateLabel: 'Completed' },
            { name: 'Tdap Adolescent Booster', status: 'done' as const, dateLabel: '2024' },
            { name: 'HPV & Meningococcal Conjugate', status: 'overdue' as const, dateLabel: 'Due Nov 2026' },
          ],
        },
      },
      // Persona 3: 36-year-old Adult of South Asian origin (Tariq)
      {
        id: 'PT-36Y-TARIQ',
        displayName: 'Tariq Al-Nadim',
        ageYears: 36,
        ageMonths: 432,
        gestationalAgeWeeks: 40,
        sex: 'male',
        pathwayType: 'adult',
        isPersona: true,
        parentUserId: null,
        region: 'Abu Dhabi',
        nationalityGroup: 'South Asia',
        insuranceCategory: 'Enhanced',
        preferredLanguage: 'en',
        preferredChannel: 'WhatsApp',
        preferFemalePractitioner: false,
        accessTimeMinutes: 35,
        missedVisitsCount: 2,
        facilityCenter: 'Al Bateen Healthcare Centre',
        primaryReasonSummary: 'Borderline blood pressure across two readings, preventive glycemic check recommended, and simulated genomic cardiometabolic eligibility',
        nextDueDate: '2026-11-21',
        preventionProgressDone: 3,
        preventionProgressTotal: 5,
        referralCode: 'TRQ9305A',
        recommendationState: 'invited',
        consentGenomic: true,
        clinicalProfile: {
          systolicBp1: 138,
          diastolicBp1: 89,
          systolicBp2: 136,
          diastolicBp2: 88,
          bpZoneLabel: 'To discuss with your clinician',
          weightKg: 74.0,
          heightCm: 175.5,
          bmi: 24.0,
          waistCm: 96,
          findriscScore: 15,
          monthsSinceLastGlycemicScreening: 48,
          smokingStatus: 'never' as const,
          dailyPhysicalActivity: false,
          dailyFruitsVeg: true,
          antihypertensiveMed: false,
          historyHighGlucose: false,
          familyHistoryDiabetes: 'first_degree' as const,
          ifhasFullScreeningDone: false,
          orientationLevel: 'orange' as const,
          orientationNotAttended: true,
          daysSinceOrientation: 30,
          genomicSignal: {
            type: 'PRS_CAD_T2D_94' as const,
            label: 'Simulated Genomic Information',
            effectSummary: 'Advanced cardiometabolic and lipid panel suggested (eligibility rule without modifying standard clinical risk)',
            simulated: true,
          },
          provenanceMap: { bp: 'M', bmi: 'M', smoking: 'D', familyHistory: 'D', genomic: 'S' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 2,
          bpSeries: [
            { dateLabel: 'May 2026', systolic: 128, diastolic: 82, targetMaxSys: 130, targetMaxDia: 85 },
            { dateLabel: 'Aug 2026', systolic: 134, diastolic: 86, targetMaxSys: 130, targetMaxDia: 85 },
            { dateLabel: 'Oct 2026', systolic: 138, diastolic: 89, targetMaxSys: 130, targetMaxDia: 85 },
            { dateLabel: 'Nov 2026', systolic: 136, diastolic: 88, targetMaxSys: 130, targetMaxDia: 85 },
          ],
        },
      },
      // Persona 4: Level Grey (Incomplete data â€” Mariam, 49y)
      {
        id: 'PT-49Y-MARIAM-GREY',
        displayName: 'Mariam Al-Mazrouei',
        ageYears: 49,
        ageMonths: 588,
        gestationalAgeWeeks: 40,
        sex: 'female',
        pathwayType: 'adult',
        isPersona: true,
        parentUserId: null,
        region: 'Al Ain',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'ar',
        preferredChannel: 'SMS',
        preferFemalePractitioner: true,
        accessTimeMinutes: 25,
        missedVisitsCount: 1,
        facilityCenter: 'Al Towayya Healthcare Centre (Al Ain)',
        primaryReasonSummary: 'Insufficient clinical data â€” resting blood pressure and baseline weight/height required to complete evaluation',
        nextDueDate: '2026-11-19',
        preventionProgressDone: 1,
        preventionProgressTotal: 4,
        referralCode: 'GRY5120M',
        recommendationState: 'created',
        consentGenomic: false,
        clinicalProfile: {
          bpZoneLabel: 'Measurement needed',
          provenanceMap: { familyHistory: 'D' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 26,
        },
      },
      // Persona 5: Level Red (Pregnancy + Elevated BP â€” Fatima, 29y, TEST-S3 & TEST-S2 Eclipse)
      {
        id: 'PT-29Y-FATIMA-RED',
        displayName: 'Fatima Al-Kaabi',
        ageYears: 29,
        ageMonths: 348,
        gestationalAgeWeeks: 40,
        sex: 'female',
        pathwayType: 'adult',
        isPersona: true,
        parentUserId: null,
        region: 'Abu Dhabi',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'ar',
        preferredChannel: 'WhatsApp',
        preferFemalePractitioner: true,
        accessTimeMinutes: 12,
        missedVisitsCount: 0,
        facilityCenter: 'Al Bateen Healthcare Centre',
        primaryReasonSummary: 'Urgent maternal blood pressure assessment required (pregnancy at 24 weeks with elevated readings)',
        nextDueDate: 'Immediate (Same day)',
        preventionProgressDone: 4,
        preventionProgressTotal: 5,
        referralCode: 'RED9911F',
        recommendationState: 'validated',
        consentGenomic: false,
        clinicalProfile: {
          isPregnant: true,
          pregnancyWeeks: 24,
          systolicBp1: 152,
          diastolicBp1: 96,
          systolicBp2: 150,
          diastolicBp2: 95,
          bpZoneLabel: 'To discuss with your clinician immediately',
          weightKg: 68.0,
          heightCm: 162.0,
          bmi: 25.9,
          findriscScore: 14, // Must be suspended by Rule A11 during pregnancy (TEST-S3)
          cervicalScreeningUpToDate: false,
          provenanceMap: { bp: 'M', pregnancy: 'V' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 0,
          bpSeries: [
            { dateLabel: '12w gestation', systolic: 118, diastolic: 74, targetMaxSys: 135, targetMaxDia: 85 },
            { dateLabel: '18w gestation', systolic: 126, diastolic: 80, targetMaxSys: 135, targetMaxDia: 85 },
            { dateLabel: '24w gestation', systolic: 150, diastolic: 95, targetMaxSys: 135, targetMaxDia: 85 },
          ],
        },
      },
      // Persona 6: Level Green (Up to date â€” Omar, 44y)
      {
        id: 'PT-44Y-OMAR-GREEN',
        displayName: 'Omar Al-Suwaidi',
        ageYears: 44,
        ageMonths: 528,
        gestationalAgeWeeks: 40,
        sex: 'male',
        pathwayType: 'adult',
        isPersona: true,
        parentUserId: null,
        region: 'Abu Dhabi',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'en',
        preferredChannel: 'App',
        preferFemalePractitioner: false,
        accessTimeMinutes: 10,
        missedVisitsCount: 0,
        facilityCenter: 'Al Bateen Healthcare Centre',
        primaryReasonSummary: 'All recommended adult preventive screenings and checks are up to date',
        nextDueDate: '2027-06-15',
        preventionProgressDone: 5,
        preventionProgressTotal: 5,
        referralCode: 'GRN2048O',
        recommendationState: 'done',
        consentGenomic: false,
        clinicalProfile: {
          systolicBp1: 118,
          diastolicBp1: 76,
          systolicBp2: 116,
          diastolicBp2: 75,
          bpZoneLabel: 'In target zone',
          weightKg: 76.0,
          heightCm: 178.0,
          bmi: 24.0,
          waistCm: 88,
          findriscScore: 6,
          hba1cPercent: 5.2,
          smokingStatus: 'never' as const,
          colorectalScreeningUpToDate: true,
          ifhasFullScreeningDone: true,
          provenanceMap: { bp: 'V', bmi: 'V', labs: 'V' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 3,
          bpSeries: [
            { dateLabel: '2024', systolic: 120, diastolic: 78, targetMaxSys: 130, targetMaxDia: 85 },
            { dateLabel: '2025', systolic: 118, diastolic: 76, targetMaxSys: 130, targetMaxDia: 85 },
            { dateLabel: '2026', systolic: 116, diastolic: 75, targetMaxSys: 130, targetMaxDia: 85 },
          ],
        },
      },
      // Persona 7: Premature infant (8 months chronological, born at 32 weeks -> 6.2 months corrected age, TEST-S4)
      {
        id: 'PT-08M-NOOR-PREM',
        displayName: 'Noor Al-Hammadi',
        ageYears: 0,
        ageMonths: 8,
        gestationalAgeWeeks: 32,
        sex: 'female',
        pathwayType: 'child',
        isPersona: true,
        parentUserId: null,
        region: 'Al Dhafra',
        nationalityGroup: 'Emirati',
        insuranceCategory: 'Thiqa',
        preferredLanguage: 'ar',
        preferredChannel: 'WhatsApp',
        preferFemalePractitioner: true,
        accessTimeMinutes: 42,
        missedVisitsCount: 1,
        facilityCenter: 'Madinat Zayed Healthcare Centre (Al Dhafra)',
        primaryReasonSummary: 'Premature infant follow-up (evaluated on corrected age of 6.2 months) â€” 6-month Well-Child Visit due',
        nextDueDate: '2026-11-25',
        preventionProgressDone: 3,
        preventionProgressTotal: 4,
        referralCode: 'PRM3208N',
        recommendationState: 'invited',
        consentGenomic: false,
        clinicalProfile: {
          weightKg: 6.9,
          heightCm: 65.0,
          muacMm: 138,
          weightForHeightZ: -0.4,
          missedWcvConsecutive: 1,
          vaccineDelayDays: 15,
          isZeroDoseChild: false,
          provenanceMap: { growth: 'V', vaccines: 'V' } as Record<string, 'V' | 'M' | 'D' | 'S'>,
          oldestMeasureMonths: 2,
        },
      },
    ];

    for (let personaIndex = 0; personaIndex < corePersonas.length; personaIndex++) {
      const p = corePersonas[personaIndex];
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
        p.consentGenomic,
        signedTable
      );

      await db
        .insert(patients)
        .values({
          id: p.id,
          displayName: p.displayName,
          ageYears: p.ageYears,
          ageMonths: p.ageMonths,
          gestationalAgeWeeks: p.gestationalAgeWeeks,
          sex: p.sex,
          pathwayType: p.pathwayType,
          isPersona: true,
          parentUserId: p.parentUserId,
          region: p.region,
          nationalityGroup: p.nationalityGroup,
          insuranceCategory: p.insuranceCategory,
          preferredLanguage: p.preferredLanguage,
          preferredChannel: p.preferredChannel,
          preferFemalePractitioner: p.preferFemalePractitioner,
          accessTimeMinutes: p.accessTimeMinutes,
          missedVisitsCount: p.missedVisitsCount,
          facilityCenter: p.facilityCenter,
          overallLevel: evaluated.overallLevel,
          overallCertainty: evaluated.overallCertainty,
          primaryReasonSummary: p.primaryReasonSummary,
          nextDueDate: p.nextDueDate,
          preventionProgressDone: p.preventionProgressDone,
          preventionProgressTotal: p.preventionProgressTotal,
          clinicalProfile: p.clinicalProfile,
          syntheticGroundTruth: drawSyntheticGroundTruth(seed, personaIndex, {
            ageYears: p.ageYears,
            sex: p.sex,
            pathwayType: p.pathwayType,
          }),
        })
        .onConflictDoNothing();

      await db
        .insert(consents)
        .values({
          patientId: p.id,
          evaluationAndCalendar: true,
          channelReminders: true,
          shareWithFacility: true,
          anonymousStatistics: true,
          existingGenomicResult: p.consentGenomic,
          adolescentAssentGiven: true,
        })
        .onConflictDoNothing();

      // Insert evaluated flags
      for (let idx = 0; idx < evaluated.flags.length; idx++) {
        const f = evaluated.flags[idx];
        await db
          .insert(flags)
          .values({
            id: `FLG-${p.id}-${idx + 1}`,
            patientId: p.id,
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
          })
          .onConflictDoNothing();
      }

      // Compute M1 Logistics & S_prio (stored in recommendations for Coordinator Screen 1)
      const m1 = computeLogisticsAndM1({
        overallLevel: evaluated.overallLevel,
        openGapsCount: evaluated.flags.filter((f) => !f.isEclipseSuspended && f.level !== 'green').length,
        maxOverdueDays: p.missedVisitsCount > 0 ? 45 : 15,
        accessTimeMinutes: p.accessTimeMinutes,
        languageNeedsSupport: p.preferredLanguage !== 'en',
        residesInUnderservedZoneC1: p.region === 'Al Dhafra',
        contextConsentGiven: true,
        missedVisitsCount: p.missedVisitsCount,
        preferredChannel: p.preferredChannel,
        reminderRank: 1,
      });

      const adaptedMsg = generateCulturallyAdaptedInvitation({
        language: (p.preferredLanguage as 'en' | 'fr' | 'ar') || 'en',
        recipientType: p.pathwayType === 'child' ? 'parent' : p.pathwayType === 'adolescent' ? 'adolescent' : 'adult',
        patientDisplayName: p.displayName,
        facilityName: p.facilityCenter,
        dueDate: p.nextDueDate,
        preferFemalePractitioner: p.preferFemalePractitioner,
      });

      await db
        .insert(recommendations)
        .values({
          id: `REC-${p.id}`,
          patientId: p.id,
          pathwayTitle:
            p.pathwayType === 'child'
              ? 'Consolidated Well-Child Follow-Up Visit'
              : p.pathwayType === 'adolescent'
              ? 'Adolescent Preventive & Family Lipid Check'
              : 'Personalized Adult Preventive Care Pathway',
          groupedActions: evaluated.flags
            .filter((f) => !f.isEclipseSuspended)
            .map((f) => ({
              actionTitle: f.title,
              directiveSource: f.sourceLabel,
              category: f.flagType,
            })),
          level: evaluated.overallLevel,
          state: p.recommendationState,
          dueDate: p.nextDueDate,
          scheduledDate: p.recommendationState === 'done' ? '2026-10-12' : null,
          facilityName: p.facilityCenter,
          referralCodeDisplay: p.referralCode,
          referralCodeHmac: computeReferralHmac(p.referralCode),
          decisionAidText: adaptedMsg.decisionAidText,
          remindersSentCount: 1,
          priorityScoreSprio: m1.priorityScoreSprio,
          mlNoShowProbM1: m1.noShowProbability,
          mlTopFactorsM1: m1.topLogisticsFactors,
          mlSuggestedAction: m1.suggestedSupportAction,
        })
        .onConflictDoNothing();

      // Insert notifications & data usage logs
      await db
        .insert(notifications)
        .values({
          id: `NOTIF-${p.id}-1`,
          patientId: p.id,
          recommendationId: `REC-${p.id}`,
          channel: p.preferredChannel,
          language: p.preferredLanguage,
          recipientType: p.pathwayType === 'child' ? 'parent' : 'adult',
          title: adaptedMsg.subject,
          bodyText: adaptedMsg.bodyText,
          decisionAidSummary: adaptedMsg.decisionAidText,
          isRead: false,
          requiresAction: p.recommendationState !== 'done',
          humanValidatedBy: 'Dr. Sydney Kpegbe (Clinical Governance)',
          sentAt: '2026-11-10 09:15',
        })
        .onConflictDoNothing();

      await db
        .insert(usageLogs)
        .values([
          {
            patientId: p.id,
            actorName: 'MediBenin Prevention Engine',
            actorRole: 'Automated Rule Evaluation',
            dataCategory: 'Clinical measurements & preventive calendar',
            purposeDescription: 'Preventive check-up planning',
            ruleVersionRef: 'Signed rules v8',
          },
          {
            patientId: p.id,
            actorName: p.facilityCenter,
            actorRole: 'Primary Care Team',
            dataCategory: 'Referral pathway & 8-character referral pass',
            purposeDescription: 'Care orientation to health centre (Purpose 3)',
            ruleVersionRef: 'Signed rules v8',
          },
        ])
        .onConflictDoNothing();
    }

    // 4. Generate 45 additional diverse synthetic patients for the 53-record panel
    const rng = createSeededRng(seed);
    const variationRng = (index: number, salt: number) => seededUnit(seed, index, salt);
    const regions = ['Abu Dhabi', 'Al Ain', 'Al Dhafra'];
    const natGroups = ['Emirati', 'South Asia', 'Arab World (Non-UAE)', 'Southeast Asia', 'Other'];
    const languages = ['en', 'ar', 'fr'];
    const firstNames = [
      'Rashid', 'Salama', 'Khalid', 'Hessa', 'Saeed', 'Meera', 'Hamdan', 'Aisha',
      'Vikram', 'Ananya', 'Imran', 'Sana', 'Youssef', 'Nadia', 'Mateo', 'Grace',
      'Hassan', 'Latifa', 'Sultan', 'Reem', 'Arjun', 'Priya', 'Kareem', 'Dina',
    ];
    const lastNames = [
      'Al-Dhaheri', 'Al-Nuaimi', 'Al-Shamsi', 'Al-Muhairi', 'Sharma', 'Patel',
      'Khan', 'Haddad', 'Reyes', 'Rahman', 'Al-Zaabi', 'Al-Ketbi', 'Nair', 'Abbas',
    ];

    for (let i = 1; i <= 45; i++) {
      const r1 = rng();
      const r2 = rng();
      const r3 = rng();
      const r4 = rng();

      const region = r1 < 0.55 ? regions[0] : r1 < 0.82 ? regions[1] : regions[2];
      // Keep a small synthetic nationality group to demonstrate privacy suppression.
      const natGroup =
        i <= 6
          ? 'Other'
          : r2 < 0.32
          ? natGroups[0]
          : r2 < 0.65
          ? natGroups[1]
          : r2 < 0.85
          ? natGroups[2]
          : natGroups[3];

      const ageYears = Math.floor(r3 * 72) + 1;
      const ageMonths = ageYears * 12;
      const pathwayType = ageYears < 10 ? 'child' : ageYears < 18 ? 'adolescent' : 'adult';
      const sex = r4 < 0.52 ? 'female' : 'male';
      const lang = natGroup === 'Emirati' || natGroup === 'Arab World (Non-UAE)' ? 'ar' : languages[i % 3];
      const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
      const pid = `PT-SYN-${String(i).padStart(3, '0')}`;

      const isGrey = i % 11 === 0;
      const isOrange = !isGrey && i % 3 === 0;
      const isYellow = !isGrey && !isOrange && i % 2 === 0;
      const level: 'orange' | 'yellow' | 'green' | 'grey' = isGrey
        ? 'grey'
        : isOrange
        ? 'orange'
        : isYellow
        ? 'yellow'
        : 'green';

      const sysBp = isGrey ? undefined : Math.round((isOrange ? 143 : isYellow ? 132 : 114) + variationRng(i, 1) * 15);
      const diaBp = isGrey ? undefined : Math.round((isOrange ? 90 : isYellow ? 82 : 70) + variationRng(i, 2) * 12);
      const bmiVal = isGrey ? undefined : Math.round(((isOrange ? 27.5 : isYellow ? 23.2 : 19.8) + variationRng(i, 3) * 5.5) * 10) / 10;
      const accessMin = (region === 'Al Dhafra' ? 36 : 10) + Math.round(variationRng(i, 4) * 22);
      const missedCount = isOrange ? 2 : isYellow ? 1 : 0;

      const reasonSummary =
        level === 'grey'
          ? 'Insufficient clinical measurements â€” resting blood pressure and BMI needed'
          : level === 'orange'
          ? pathwayType === 'adult'
            ? 'Elevated resting blood pressure and metabolic follow-up recommended'
            : 'Two consecutive Well-Child Visits missed and catch-up vaccine due'
          : level === 'yellow'
          ? pathwayType === 'adult'
            ? 'Periodic adult preventive check-up and colorectal FIT kit due'
            : 'Scheduled childhood immunization booster overdue by 35 days'
          : 'Preventive care pathway up to date';

      const recState =
        level === 'green'
          ? 'done'
          : level === 'grey'
          ? 'created'
          : i % 5 === 0
          ? 'done'
          : i % 4 === 0
          ? 'scheduled'
          : 'invited';

      const refCode = `MS${String(i).padStart(3, '0')}X9`;

      const m1 = computeLogisticsAndM1({
        overallLevel: level,
        openGapsCount: level === 'orange' ? 2 : level === 'yellow' ? 1 : 0,
        maxOverdueDays: level === 'orange' ? 65 : level === 'yellow' ? 35 : 0,
        accessTimeMinutes: accessMin,
        languageNeedsSupport: lang !== 'en',
        residesInUnderservedZoneC1: region === 'Al Dhafra',
        contextConsentGiven: true,
        missedVisitsCount: missedCount,
        preferredChannel: i % 2 === 0 ? 'WhatsApp' : 'SMS',
        reminderRank: 1,
      });

      await db
        .insert(patients)
        .values({
          id: pid,
          displayName: name,
          ageYears,
          ageMonths,
          gestationalAgeWeeks: 40,
          sex,
          pathwayType,
          isPersona: false,
          parentUserId: null,
          region,
          nationalityGroup: natGroup,
          insuranceCategory: natGroup === 'Emirati' ? 'Thiqa' : i % 2 === 0 ? 'Enhanced' : 'Basic',
          preferredLanguage: lang,
          preferredChannel: i % 2 === 0 ? 'WhatsApp' : 'SMS',
          preferFemalePractitioner: sex === 'female',
          accessTimeMinutes: accessMin,
          missedVisitsCount: missedCount,
          facilityCenter:
            region === 'Al Ain'
              ? 'Al Towayya Healthcare Centre'
              : region === 'Al Dhafra'
              ? 'Madinat Zayed Healthcare Centre'
              : 'Al Bateen Healthcare Centre',
          overallLevel: level,
          overallCertainty: level === 'grey' ? 'low' : i % 4 === 0 ? 'medium' : 'high',
          primaryReasonSummary: reasonSummary,
          nextDueDate: level === 'green' ? '2027-05-10' : '2026-11-28',
          preventionProgressDone: level === 'green' ? 5 : 3,
          preventionProgressTotal: 5,
          clinicalProfile: {
            systolicBp2: sysBp,
            diastolicBp2: diaBp,
            bmi: bmiVal,
            bpZoneLabel: sysBp && sysBp >= 130 ? 'To discuss with your clinician' : 'In target zone',
            findriscScore: isOrange ? 16 : 8,
            familyHistoryFhOrEarlyCvd: natGroup !== 'Emirati' && isOrange,
            genomicSignal:
              natGroup === 'Emirati' && isOrange
                ? {
                    type: 'PRS_CAD_T2D_94',
                    label: 'Simulated Genomic Information',
                    effectSummary: 'Advanced cardiometabolic panel suggested',
                    simulated: true,
                  }
                : null,
            provenanceMap: { bp: 'M', bmi: 'M' },
            oldestMeasureMonths: 4,
          },
          syntheticGroundTruth: drawSyntheticGroundTruth(seed, 1000 + i, {
            ageYears,
            sex,
            pathwayType,
          }),
        })
        .onConflictDoNothing();

      await db
        .insert(consents)
        .values({
          patientId: pid,
          evaluationAndCalendar: true,
          channelReminders: true,
          shareWithFacility: true,
          anonymousStatistics: true,
          existingGenomicResult: natGroup === 'Emirati' && isOrange,
          adolescentAssentGiven: true,
        })
        .onConflictDoNothing();

      await db
        .insert(flags)
        .values({
          id: `FLG-${pid}-1`,
          patientId: pid,
          ruleId: level === 'grey' ? 'GREY-ADULT' : pathwayType === 'adult' ? 'A1' : 'P3',
          flagType: level === 'orange' ? 'elevated_risk' : 'missed_care',
          level,
          title: reasonSummary,
          factors: [
            reasonSummary,
            'Consolidated into a single preventive visit at the primary care centre',
          ],
          sourceLabel:
            pathwayType === 'adult'
              ? 'WHO HEARTS & IFHAS Preventive Standard'
              : 'Well-Child Visit Standard (national reference)',
          missingData: level === 'grey' ? ['Resting blood pressure', 'Weight and height'] : [],
          dueDate: level === 'orange' ? 'Within 14 days' : 'Within 30 days',
          certainty: level === 'grey' ? 'low' : 'high',
          certaintyReason:
            level === 'grey'
              ? 'To be confirmed by recording missing measurements'
              : 'Recent and verified clinical measurements',
          isEclipseSuspended: false,
        })
        .onConflictDoNothing();

      await db
        .insert(recommendations)
        .values({
          id: `REC-${pid}`,
          patientId: pid,
          pathwayTitle:
            pathwayType === 'adult'
              ? 'Consolidated Adult Preventive Check'
              : 'Well-Child Growth & Immunization Visit',
          groupedActions: [
            {
              actionTitle: reasonSummary,
              directiveSource: 'Approved Preventive Guideline',
              category: 'prevention',
            },
          ],
          level,
          state: recState,
          dueDate: '2026-11-28',
          facilityName:
            region === 'Al Ain'
              ? 'Al Towayya Healthcare Centre'
              : region === 'Al Dhafra'
              ? 'Madinat Zayed Healthcare Centre'
              : 'Al Bateen Healthcare Centre',
          referralCodeDisplay: refCode,
          referralCodeHmac: computeReferralHmac(refCode),
          decisionAidText:
            'This preventive visit brings together your recommended checks in one appointment. Participation is voluntary and declining has no impact on your access to care.',
          remindersSentCount: 1,
          priorityScoreSprio: m1.priorityScoreSprio,
          mlNoShowProbM1: m1.noShowProbability,
          mlTopFactorsM1: m1.topLogisticsFactors,
          mlSuggestedAction: m1.suggestedSupportAction,
        })
        .onConflictDoNothing();
    }

    const finalCount = await db.select({ value: count() }).from(patients);
    return { seeded: true, totalPatients: finalCount[0]?.value || 53, seed };
  } catch (error) {
    console.error('Error seeding MediBenin database:', error);
    throw new Error('Failed to seed MediBenin database.', { cause: error });
  }
}
