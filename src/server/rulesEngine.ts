import crypto from 'crypto';
import {
  lookupWhoNonLabCvdRisk,
  WHO_2019_CHART_SOURCE,
  type WhoChartRegion,
} from './whoCvdChartMENA2019.ts';
import {
  WHO_CVD_THRESHOLDS,
  DIABETES_SCREENING_THRESHOLDS,
  BLOOD_PRESSURE_THRESHOLDS,
  PEDIATRIC_THRESHOLDS,
  ADULT_SCREENING_THRESHOLDS,
} from './thresholds.ts';
import {
  computeBmiForAgeZ,
  computeWeightForHeightZ,
} from './growthReference.ts';
import {
  CARE_SCHEDULES,
  computeMissedWcvCount,
  isScreeningCurrent,
} from './careSchedules.ts';

// Signed JSON Rules Table (Section 4.2, 4.3, 4.4, 4.8, 9.2, 12)
export interface SignedRulesTable {
  tableCode: string;
  version: string;
  signedBy: string;
  signerRole: string;
  reviewDate: string;
  isSigned: boolean;
  signatureHash: string;
  rules: Array<{
    id: string;
    domain: 'pediatric' | 'adult' | 'community' | 'genomic' | 'safety';
    title: string;
    sourceLabel: string;
    verificationStatus: 'published' | 'to_verify_doh';
  }>;
}

const RULES_LIST: SignedRulesTable['rules'] = [
  { id: 'P1', domain: 'pediatric', title: 'Severe acute malnutrition screening', sourceLabel: 'WHO Child Growth Standards 2006', verificationStatus: 'published' },
  { id: 'P3', domain: 'pediatric', title: 'Well-Child Visit schedule adherence', sourceLabel: 'Well-Child Visit Standard (national reference)', verificationStatus: 'to_verify_doh' },
  { id: 'P4', domain: 'pediatric', title: 'Childhood immunization schedule & zero-dose catch-up', sourceLabel: 'National Immunization Schedule', verificationStatus: 'to_verify_doh' },
  { id: 'P5', domain: 'pediatric', title: 'Early childhood anemia screening', sourceLabel: 'WHO & UAE Pediatric Standard', verificationStatus: 'to_verify_doh' },
  { id: 'P6', domain: 'pediatric', title: 'Early developmental & autism follow-up interview', sourceLabel: 'M-CHAT-R/F Published Logic', verificationStatus: 'published' },
  { id: 'P8', domain: 'pediatric', title: 'Child & adolescent growth and weight monitoring', sourceLabel: 'WHO Growth Reference 2007', verificationStatus: 'published' },
  { id: 'P10', domain: 'pediatric', title: 'Family history early cardiovascular & lipid screening (Equity pathway)', sourceLabel: 'International Pediatric FH Guidelines', verificationStatus: 'published' },
  { id: 'P11', domain: 'pediatric', title: 'Adolescent immunization schedule', sourceLabel: 'National Adolescent Immunization Schedule', verificationStatus: 'to_verify_doh' },
  { id: 'A1', domain: 'adult', title: 'Blood pressure elevation follow-up', sourceLabel: 'WHO HEARTS Technical Package', verificationStatus: 'published' },
  { id: 'A2', domain: 'adult', title: '10-year cardiovascular risk evaluation', sourceLabel: 'WHO 2019 CVD Risk Chart (Non-Laboratory)', verificationStatus: 'published' },
  { id: 'A3', domain: 'adult', title: 'Type 2 diabetes & glycemic screening', sourceLabel: 'FINDRISC & ADA Glycemic Guidelines', verificationStatus: 'published' },
  { id: 'A4', domain: 'adult', title: 'Adapted metabolic screening for South/East Asian origin', sourceLabel: 'WHO Asian BMI Adaptation & ADA', verificationStatus: 'published' },
  { id: 'A5', domain: 'adult', title: 'Cervical cancer screening interval', sourceLabel: 'National Cancer Screening Guideline', verificationStatus: 'to_verify_doh' },
  { id: 'A6', domain: 'adult', title: 'Breast cancer mammography interval', sourceLabel: 'National Breast Screening Guideline', verificationStatus: 'to_verify_doh' },
  { id: 'A7', domain: 'adult', title: 'Colorectal cancer screening (FIT / colonoscopy)', sourceLabel: 'National Colorectal Screening Guideline', verificationStatus: 'to_verify_doh' },
  { id: 'A8', domain: 'adult', title: 'Comprehensive periodic adult health check', sourceLabel: 'IFHAS Comprehensive Screening', verificationStatus: 'to_verify_doh' },
  { id: 'A9', domain: 'adult', title: 'Chronic condition continuity of care & closed-loop follow-up', sourceLabel: 'WHO PEN Continuity Protocol', verificationStatus: 'published' },
  { id: 'A11', domain: 'adult', title: 'Maternal blood pressure safety alert during pregnancy', sourceLabel: 'International Obstetric Hypertension Guidelines', verificationStatus: 'published' },
  { id: 'G1', domain: 'genomic', title: 'Accelerated cardiometabolic check via existing genomic result (simulated)', sourceLabel: 'Emirati Genome Program Policy (simulated)', verificationStatus: 'to_verify_doh' },
  { id: 'G2', domain: 'genomic', title: 'Specialist genetic counseling referral (simulated)', sourceLabel: 'Actionable Variant Policy (simulated)', verificationStatus: 'to_verify_doh' },
  { id: 'G3', domain: 'genomic', title: 'Safeguard: negative genomic result never delays standard screening', sourceLabel: 'MediSense Genomic Equity Safeguard', verificationStatus: 'published' },
  { id: 'C1', domain: 'community', title: 'Under-covered geographic zone alert', sourceLabel: 'Public Health Coverage Safeguard', verificationStatus: 'published' },
  { id: 'C3', domain: 'community', title: 'Segment adoption equity gap alert', sourceLabel: 'Public Health Equity Safeguard', verificationStatus: 'published' },
  { id: 'C4', domain: 'community', title: 'Segment false-negative governance alert', sourceLabel: 'Clinical Governance Safety Gate', verificationStatus: 'published' },
  { id: 'E0', domain: 'safety', title: 'Emergency escape — suspend routine prevention and direct to emergency care', sourceLabel: 'MediSense Safety Escape Protocol', verificationStatus: 'published' },
  { id: 'GREY', domain: 'safety', title: 'Insufficient data — Level Grey safety protocol (never counted as up to date)', sourceLabel: 'MediSense Clinical Safety Protocol', verificationStatus: 'published' },
];

export function getCanonicalSignedRuleTable(): SignedRulesTable {
  const payloadString = JSON.stringify(RULES_LIST);
  const signatureHash = crypto.createHash('sha256').update(payloadString + ':SIGNED_BY_DR_SYDNEY_KPEGBE_V8').digest('hex');
  return {
    tableCode: 'ABU_DHABI_WCV_IFHAS_V8',
    version: '8.0.0-2026-11',
    signedBy: 'Dr. Sydney Kpegbe (Clinical Governance Lead — H14)',
    signerRole: 'Family Medicine & Preventive Care Signatory',
    reviewDate: '2026-11-10',
    isSigned: true,
    signatureHash,
    rules: RULES_LIST,
  };
}

// TEST-S5: Refuse unsigned or tampered rule tables
export function verifyRuleTableSignature(table: SignedRulesTable): boolean {
  if (!table.isSigned || !table.signedBy || !table.signatureHash) {
    throw new Error('RULE_GOVERNANCE_ERROR: Unsigned rule table rejected (TEST-S5).');
  }
  const expectedHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(table.rules) + ':SIGNED_BY_DR_SYDNEY_KPEGBE_V8')
    .digest('hex');
  if (table.signatureHash !== expectedHash) {
    throw new Error('RULE_GOVERNANCE_ERROR: Rule table signature mismatch rejected (TEST-S5).');
  }
  return true;
}

export function computeReferralHmac(code: string): string {
  return crypto.createHmac('sha256', 'medisense-closed-loop-hmac-key').update(code.trim().toUpperCase()).digest('hex');
}

export function generateReferralCode(patientId: string, seed = 20261120): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${patientId}:${seed}:MEDISENSE_REF`)
    .digest('hex')
    .toUpperCase();
  return `MS-${hash.slice(0, 5)}`;
}

export interface EvaluatedFlag {
  ruleId: string;
  flagType: 'elevated_risk' | 'missed_care' | 'overdue_care' | 'interrupted_followup';
  level: 'red' | 'orange' | 'yellow' | 'green' | 'grey';
  title: string;
  factors: string[]; // 1 to 3 human-readable sentences
  sourceLabel: string;
  missingData: string[];
  dueDate: string;
  certainty: 'high' | 'medium' | 'low';
  certaintyReason: string;
  isEclipseSuspended: boolean;
}

export interface BackendClinicalCalculations {
  emergencyEscapeE0: {
    triggered: boolean;
    reason: string | null;
  };
  bpProtocol: {
    reading1: string | null;
    reading2: string | null;
    reading3: string | null;
    spreadSys: number | null;
    spreadDia: number | null;
    requiresThirdReading: boolean;
    retainedSys: number | null;
    retainedDia: number | null;
    bpZoneLabel: string;
  };
  anthropometry: {
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    waistCm: number | null;
    correctedAgeMonths: number | null;
    weightForHeightZ: number | null;
    bmiForAgeZ: number | null;
    muacMm: number | null;
  };
  whoCvdModel: {
    inDomain: boolean;
    domainNote: string;
    regionUsed: string;
    riskPercent: number | null;
    intervalLowPercent: number | null;
    intervalHighPercent: number | null;
    crossesThreshold: boolean;
    counterfactuals: Array<{
      factor: string;
      currentValue: string;
      targetValue: string;
      riskReductionPct: number;
    }>;
  };
  findriscModel: {
    score: number | null;
    levelLabel: string;
    suspendedByPregnancy: boolean;
    asianBmiRuleA4Triggered: boolean;
    itemBreakdown: Array<{ item: string; points: number }>;
    questionnaireComplete: boolean;
    missingItems: string[];
  };
  certaintyAudit: {
    completenessPercent: number;
    provenanceCodes: Record<string, string>;
    oldestMeasureMonths: number;
    crossesWhoThreshold: boolean;
    finalCertainty: 'high' | 'medium' | 'low';
    certaintyReason: string;
  };
  eclipseSafeguard: {
    activeRedFlag: boolean;
    suspendedYellowRuleIds: string[];
  };
  genomicPolicy: {
    consentGranted: boolean;
    signalType: string;
    effectSummary: string;
  };
  consolidatedCarePlan: {
    pathwayTitle: string;
    dueDate: string;
    level: 'red' | 'orange' | 'yellow' | 'green' | 'grey';
    groupedActions: Array<{
      ruleId: string;
      actionTitle: string;
      directiveSource: string;
      category: string;
    }>;
  };
}

/**
 * Computes the official 8-item FINDRISC score (0 to 26 points) per Annexe B.
 */
export interface FindriscBreakdownResult {
  /**
   * Published FINDRISC total. null when any of the 8 required items is missing
   * and no explicit patient-declared score is available — a partial score is
   * never extrapolated (no default imputation).
   */
  score: number | null;
  /** Points for the items actually answered (missing items are absent). */
  breakdown: Array<{ item: string; points: number }>;
  /** Required questionnaire items with no recorded answer. */
  missingItems: string[];
}

export function computeFindriscBreakdown(params: {
  ageYears: number;
  sex: string;
  bmi: number | null;
  waistCm: number | null;
  dailyPhysicalActivity: boolean | null;
  dailyFruitsVegetables: boolean | null;
  antihypertensiveMed: boolean | null;
  historyHighBloodGlucose: boolean | null;
  familyDiabetes: 'none' | 'second_degree' | 'first_degree' | null;
  explicitScore?: number | null;
}): FindriscBreakdownResult {
  const breakdown: Array<{ item: string; points: number }> = [];
  const missingItems: string[] = [];

  // 1. Age
  const agePts =
    params.ageYears < 45 ? 0 : params.ageYears <= 54 ? 2 : params.ageYears <= 64 ? 3 : 4;
  breakdown.push({ item: `Age (${params.ageYears} yrs)`, points: agePts });

  // 2. BMI (missing -> item missing, never defaulted)
  if (params.bmi === null || params.bmi === undefined || !Number.isFinite(params.bmi)) {
    missingItems.push('Body mass index (BMI)');
  } else {
    const bmiPts = params.bmi < 25 ? 0 : params.bmi <= 30 ? 1 : 3;
    breakdown.push({ item: `BMI (${params.bmi} kg/m²)`, points: bmiPts });
  }

  // 3. Waist circumference (missing -> item missing, never inferred from BMI)
  if (params.waistCm === null || params.waistCm === undefined || !Number.isFinite(params.waistCm)) {
    missingItems.push('Waist circumference');
  } else {
    const isMale = params.sex.toLowerCase() === 'male' || params.sex.toLowerCase() === 'm';
    let waistPts = 0;
    if (isMale) {
      waistPts = params.waistCm < 94 ? 0 : params.waistCm <= 102 ? 3 : 4;
    } else {
      waistPts = params.waistCm < 80 ? 0 : params.waistCm <= 88 ? 3 : 4;
    }
    breakdown.push({ item: `Waist circumference (${params.waistCm} cm)`, points: waistPts });
  }

  // 4. Physical activity >= 30 min/day (no answer -> item missing, never defaulted)
  if (params.dailyPhysicalActivity === null || params.dailyPhysicalActivity === undefined) {
    missingItems.push('Physical activity < 30 min/day');
  } else {
    breakdown.push({
      item: 'Physical activity < 30 min/day',
      points: params.dailyPhysicalActivity ? 0 : 2,
    });
  }

  // 5. Daily fruits & vegetables (no answer -> item missing, never defaulted)
  if (params.dailyFruitsVegetables === null || params.dailyFruitsVegetables === undefined) {
    missingItems.push('Non-daily fruit/vegetable intake');
  } else {
    breakdown.push({
      item: 'Non-daily fruit/vegetable intake',
      points: params.dailyFruitsVegetables ? 0 : 1,
    });
  }

  // 6. Antihypertensive medication (no answer -> item missing, never inferred from BP)
  if (params.antihypertensiveMed === null || params.antihypertensiveMed === undefined) {
    missingItems.push('History of antihypertensive medication');
  } else {
    breakdown.push({
      item: 'History of antihypertensive medication',
      points: params.antihypertensiveMed ? 2 : 0,
    });
  }

  // 7. History of high blood glucose (no answer -> item missing, never defaulted)
  if (params.historyHighBloodGlucose === null || params.historyHighBloodGlucose === undefined) {
    missingItems.push('Previous borderline/elevated blood glucose');
  } else {
    breakdown.push({
      item: 'Previous borderline/elevated blood glucose',
      points: params.historyHighBloodGlucose ? 5 : 0,
    });
  }

  // 8. Family history of diabetes (no answer -> item missing, never inferred from the score)
  if (params.familyDiabetes === null || params.familyDiabetes === undefined) {
    missingItems.push('Family history of diabetes');
  } else {
    const famPts =
      params.familyDiabetes === 'first_degree'
        ? 5
        : params.familyDiabetes === 'second_degree'
        ? 3
        : 0;
    breakdown.push({
      item: `Family history of diabetes (${params.familyDiabetes})`,
      points: famPts,
    });
  }

  const computedTotal = breakdown.reduce((acc, b) => acc + b.points, 0);
  const explicitProvided = params.explicitScore !== undefined && params.explicitScore !== null;
  const finalScore = explicitProvided
    ? Number(params.explicitScore)
    : missingItems.length === 0
    ? computedTotal
    : null;

  return { score: finalScore, breakdown, missingItems };
}

/**
 * WHO 2019 Non-Laboratory 10-year CVD Risk Estimator — published chart lookup (MENA & South Asia).
 * Uses the official WHO 2019 CVD risk chart values (see whoCvdChartMENA2019.ts for the source and
 * the documented interpolation choice), with a ±1.96σ-style uncertainty interval (±9.8 mmHg on SBP,
 * ±1 kg/m² on BMI) and Counterfactual Attribution (Section 4.6 & Annexe A).
 */
export function computeWho2019NonLabCvd(params: {
  ageYears: number;
  sex: string;
  systolicBp: number;
  bmi: number;
  smoker: boolean;
  nationalityGroup: string;
}) {
  const { ageYears, sex, systolicBp, bmi, smoker, nationalityGroup } = params;
  const isMale = sex.toLowerCase() === 'male' || sex.toLowerCase() === 'm';
  // WHO publishes one non-laboratory chart per region; UAE falls in the MENA chart, South Asia has its own.
  const chartRegion: WhoChartRegion =
    nationalityGroup === 'South Asia' ? 'southAsia' : 'mena';

  const evalRiskFormula = (sysVal: number, bmiVal: number, isSmoker: boolean): number => {
    const risk = lookupWhoNonLabCvdRisk(
      chartRegion,
      isMale ? 'men' : 'women',
      isSmoker ? 'smoker' : 'nonSmoker',
      ageYears,
      sysVal,
      bmiVal
    );
    return Math.round(risk * 10) / 10;
  };

  const riskPercent = evalRiskFormula(systolicBp, bmi, smoker);
  // Uncertainty interval from the versioned who-cvd thresholds (±9.8 mmHg on SBP, ±1 kg/m² on BMI — Section 4.6 / H7)
  const intervalLowPercent = evalRiskFormula(
    Math.max(90, systolicBp - WHO_CVD_THRESHOLDS.uncertaintySbpMmHg),
    Math.max(16, bmi - WHO_CVD_THRESHOLDS.uncertaintyBmiKgM2),
    smoker
  );
  const intervalHighPercent = evalRiskFormula(
    Math.min(240, systolicBp + WHO_CVD_THRESHOLDS.uncertaintySbpMmHg),
    Math.min(50, bmi + WHO_CVD_THRESHOLDS.uncertaintyBmiKgM2),
    smoker
  );

  // Check if [intervalLow, intervalHigh] crosses any WHO decision threshold (5%, 10%, 20%)
  const thresholds = [5, 10, 20];
  const crossesThreshold = thresholds.some(
    (t) => intervalLowPercent < t && intervalHighPercent >= t
  );

  // Counterfactual risk reductions (Section 4.6)
  const counterfactuals: Array<{
    factor: string;
    currentValue: string;
    targetValue: string;
    riskReductionPct: number;
  }> = [];

  if (systolicBp > WHO_CVD_THRESHOLDS.counterfactualSbpTargetMmHg) {
    const targetRisk = evalRiskFormula(WHO_CVD_THRESHOLDS.counterfactualSbpTargetMmHg, bmi, smoker);
    const drop = Math.max(0.2, Math.round((riskPercent - targetRisk) * 10) / 10);
    counterfactuals.push({
      factor: 'Resting Systolic Blood Pressure',
      currentValue: `${systolicBp} mmHg`,
      targetValue: `${WHO_CVD_THRESHOLDS.counterfactualSbpTargetMmHg} mmHg`,
      riskReductionPct: drop,
    });
  }

  if (smoker) {
    const targetRisk = evalRiskFormula(systolicBp, bmi, false);
    const drop = Math.max(0.2, Math.round((riskPercent - targetRisk) * 10) / 10);
    counterfactuals.push({
      factor: 'Tobacco / Dokha / Shisha Use',
      currentValue: 'Active smoker',
      targetValue: 'Complete cessation',
      riskReductionPct: drop,
    });
  }

  if (bmi > WHO_CVD_THRESHOLDS.counterfactualBmiTargetKgM2) {
    const targetRisk = evalRiskFormula(systolicBp, WHO_CVD_THRESHOLDS.counterfactualBmiTargetKgM2, smoker);
    const drop = Math.max(0.1, Math.round((riskPercent - targetRisk) * 10) / 10);
    counterfactuals.push({
      factor: 'Body Mass Index (BMI)',
      currentValue: `${bmi} kg/m²`,
      targetValue: `${WHO_CVD_THRESHOLDS.counterfactualBmiTargetKgM2.toFixed(1)} kg/m²`,
      riskReductionPct: drop,
    });
  }

  counterfactuals.sort((a, b) => b.riskReductionPct - a.riskReductionPct);

  const regionUsed = WHO_2019_CHART_SOURCE[chartRegion];

  return {
    riskPercent,
    intervalLowPercent,
    intervalHighPercent,
    crossesThreshold,
    regionUsed,
    counterfactuals,
  };
}

/**
 * Evaluates a patient's clinical profile on the server using the signed rule table.
 * Generates human-readable explanations (1-3 factors), missing data lists, certainty badges,
 * and full mathematical backend calculation proof.
 */
export function evaluatePatientRules(
  patient: {
    id: string;
    ageYears: number;
    ageMonths: number;
    gestationalAgeWeeks?: number | null;
    sex: string;
    pathwayType: string;
    nationalityGroup: string;
    clinicalProfile: any;
  },
  consentExistingGenomic: boolean,
  table: SignedRulesTable = getCanonicalSignedRuleTable()
): {
  flags: EvaluatedFlag[];
  overallLevel: 'red' | 'orange' | 'yellow' | 'green' | 'grey';
  overallCertainty: 'high' | 'medium' | 'low';
  correctedAgeMonths: number | null;
  calculations: BackendClinicalCalculations;
} {
  verifyRuleTableSignature(table);

  const cp = patient.clinicalProfile || {};
  const flagsOut: EvaluatedFlag[] = [];

  // 0. Blood Pressure Multi-Reading Protocol (Section 4.7)
  const sys1 = cp.systolicBp1 !== undefined ? Number(cp.systolicBp1) : cp.systolicBp2 !== undefined ? Number(cp.systolicBp2) : null;
  const dia1 = cp.diastolicBp1 !== undefined ? Number(cp.diastolicBp1) : cp.diastolicBp2 !== undefined ? Number(cp.diastolicBp2) : null;
  const sys2 = cp.systolicBp2 !== undefined ? Number(cp.systolicBp2) : sys1;
  const dia2 = cp.diastolicBp2 !== undefined ? Number(cp.diastolicBp2) : dia1;
  const sys3 = cp.systolicBp3 !== undefined && cp.systolicBp3 !== null ? Number(cp.systolicBp3) : null;
  const dia3 = cp.diastolicBp3 !== undefined && cp.diastolicBp3 !== null ? Number(cp.diastolicBp3) : null;

  const spreadSys = sys1 !== null && sys2 !== null ? Math.abs(sys1 - sys2) : null;
  const spreadDia = dia1 !== null && dia2 !== null ? Math.abs(dia1 - dia2) : null;
  const requiresThirdReading = Boolean(
    (spreadSys !== null && spreadSys > 10) || (spreadDia !== null && spreadDia > 6)
  );

  // Per Section 4.7: if 3rd reading is recorded, retain mean of 2nd and 3rd readings; else mean of 1st & 2nd
  const retainedSys =
    sys2 !== null && sys3 !== null
      ? Math.round((sys2 + sys3) / 2)
      : sys1 !== null && sys2 !== null
      ? Math.round((sys1 + sys2) / 2)
      : sys2;

  const retainedDia =
    dia2 !== null && dia3 !== null
      ? Math.round((dia2 + dia3) / 2)
      : dia1 !== null && dia2 !== null
      ? Math.round((dia1 + dia2) / 2)
      : dia2;

  // Compute BMI if weight & height provided
  const weightKg = cp.weightKg !== undefined ? Number(cp.weightKg) : null;
  const heightCm = cp.heightCm !== undefined ? Number(cp.heightCm) : null;
  const computedBmi =
    weightKg && heightCm && heightCm > 30
      ? Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10
      : cp.bmi !== undefined
      ? Number(cp.bmi)
      : null;

  // Glycemic and pregnancy status are needed both by the adult rules and by the
  // Level Grey completeness audit, so they are resolved once here.
  const hba1c =
    cp.hba1cPercent !== undefined && cp.hba1cPercent !== null ? Number(cp.hba1cPercent) : null;
  const lastGlycemicMonths =
    typeof cp.monthsSinceLastGlycemicScreening === 'number' &&
    Number.isFinite(cp.monthsSinceLastGlycemicScreening)
      ? Number(cp.monthsSinceLastGlycemicScreening)
      : null;
  const isPregnant = Boolean(cp.isPregnant);
  const pregnancyWeeks =
    typeof cp.pregnancyWeeks === 'number' && Number.isFinite(cp.pregnancyWeeks)
      ? Number(cp.pregnancyWeeks)
      : null;

  // Calendar-driven screening status: an explicit boolean wins; otherwise the
  // months-since-last-screen is compared to the versioned interval.
  const cervicalCurrent =
    cp.cervicalScreeningUpToDate !== undefined && cp.cervicalScreeningUpToDate !== null
      ? Boolean(cp.cervicalScreeningUpToDate)
      : isScreeningCurrent(cp.monthsSinceLastCervicalScreening, CARE_SCHEDULES.cervicalIntervalMonths);
  const mammographyCurrent =
    cp.mammographyUpToDate !== undefined && cp.mammographyUpToDate !== null
      ? Boolean(cp.mammographyUpToDate)
      : isScreeningCurrent(cp.monthsSinceLastMammography, CARE_SCHEDULES.mammographyIntervalMonths);
  const colorectalCurrent =
    cp.colorectalScreeningUpToDate !== undefined && cp.colorectalScreeningUpToDate !== null
      ? Boolean(cp.colorectalScreeningUpToDate)
      : isScreeningCurrent(
          cp.monthsSinceLastColorectalScreening,
          CARE_SCHEDULES.colorectalIntervalMonths
        );
  const ifhasCurrent =
    cp.ifhasFullScreeningDone !== undefined && cp.ifhasFullScreeningDone !== null
      ? Boolean(cp.ifhasFullScreeningDone)
      : isScreeningCurrent(cp.monthsSinceLastIfhas, CARE_SCHEDULES.ifhasIntervalMonths);
  const computedMissedWcv =
    cp.missedWcvConsecutive !== undefined && cp.missedWcvConsecutive !== null
      ? Number(cp.missedWcvConsecutive)
      : computeMissedWcvCount(patient.ageMonths, cp.lastWcvAgeMonths);

  // Growth Z-scores: use the recorded value when present; otherwise compute it
  // from the published WHO LMS tables. A value outside the published domain
  // stays null (Level Grey), never an extrapolated number.
  const recordedWhz =
    cp.weightForHeightZ !== undefined && cp.weightForHeightZ !== null
      ? Number(cp.weightForHeightZ)
      : null;
  const computedWhz =
    recordedWhz !== null
      ? recordedWhz
      : weightKg && heightCm
      ? computeWeightForHeightZ({ heightCm, weightKg, sex: patient.sex })
      : null;
  const recordedBmiZ =
    cp.bmiForAgeZ !== undefined && cp.bmiForAgeZ !== null ? Number(cp.bmiForAgeZ) : null;
  const computedBmiZ =
    recordedBmiZ !== null
      ? recordedBmiZ
      : computedBmi && patient.ageMonths >= 60
      ? computeBmiForAgeZ({
          ageMonths: patient.ageMonths,
          sex: patient.sex,
          bmi: computedBmi,
        })
      : null;

  // TEST-S4: Corrected age for premature children (< 37 weeks gestational age, up to 24 months)
  let correctedAgeMonths: number | null = null;
  if (
    patient.ageMonths <= 24 &&
    patient.gestationalAgeWeeks &&
    patient.gestationalAgeWeeks < 37
  ) {
    const weeksPremature = 40 - patient.gestationalAgeWeeks;
    correctedAgeMonths = Math.max(0, Math.round((patient.ageMonths - weeksPremature / 4.33) * 10) / 10);
  }

  // Provenance & recency certainty calculation
  const provMap: Record<string, string> = cp.provenanceMap || { bp: 'M', bmi: 'M', history: 'V' };
  const provValues = Object.values(provMap) as string[];
  const declaredCount = provValues.filter((v) => v === 'D').length;
  const oldestMonths = cp.oldestMeasureMonths ?? 2;

  let baseCertainty: 'high' | 'medium' | 'low' =
    declaredCount >= 2 || oldestMonths > 18
      ? 'low'
      : declaredCount === 1 || oldestMonths > 12
      ? 'medium'
      : 'high';

  let baseCertaintyReason =
    baseCertainty === 'high'
      ? 'All key values are measured or verified and recently recorded'
      : baseCertainty === 'medium'
      ? 'One key variable is self-reported or not recent'
      : 'To be confirmed: several self-reported or outdated values, or an out-of-domain model';

  // 0b. Emergency Escape Rule E0 (Section 4.5)
  const emergencyTriggered = Boolean(
    cp.hasEmergencySymptoms ||
      (retainedSys !== null && retainedDia !== null && (retainedSys >= BLOOD_PRESSURE_THRESHOLDS.crisisSysMmHg || retainedDia >= BLOOD_PRESSURE_THRESHOLDS.crisisDiaMmHg) && cp.hasSymptomaticCrisis)
  );
  const emergencyReason = emergencyTriggered
    ? cp.hasEmergencySymptoms
      ? 'Acute clinical danger signs reported — immediate emergency referral required'
      : `Hypertensive crisis (${retainedSys}/${retainedDia} mmHg) with acute symptoms`
    : null;

  if (emergencyTriggered) {
    flagsOut.push({
      ruleId: 'E0',
      flagType: 'elevated_risk',
      level: 'red',
      title: 'IMMEDIATE EMERGENCY ESCAPE — Suspend Routine Prevention',
      factors: [
        emergencyReason!,
        'Routine preventive schedule is immediately paused; direct patient to emergency care',
      ],
      sourceLabel: 'MediSense Safety Escape Protocol',
      missingData: [],
      dueDate: 'IMMEDIATE (Emergency Department)',
      certainty: 'high',
      certaintyReason: 'Direct clinical safety observation',
      isEclipseSuspended: false,
    });
  }

  // 1. Level Grey completeness is audited after all clinical rules have run
  // (see the "Level Grey completeness audit" block below). A missing required
  // variable is never replaced by a default value, and a Grey is never counted
  // as up to date.
  let completenessPercent = 100;

  // 2. Pediatric & Adolescent Rules (P1..P11)
  if (patient.pathwayType === 'child' || patient.pathwayType === 'adolescent') {
    // P1: Severe acute malnutrition
    if ((computedWhz !== null && computedWhz < PEDIATRIC_THRESHOLDS.severeMalnutritionWhzBelow) || (cp.muacMm !== undefined && cp.muacMm < PEDIATRIC_THRESHOLDS.severeMalnutritionMuacBelowMm)) {
      flagsOut.push({
        ruleId: 'P1',
        flagType: 'elevated_risk',
        level: 'red',
        title: 'Urgent nutritional assessment required (SAM)',
        factors: [
          'Growth measurements indicate severe acute malnutrition requiring immediate clinical attention',
          correctedAgeMonths !== null
            ? `Evaluated using prematurity-corrected age (${correctedAgeMonths} mos from ${patient.gestationalAgeWeeks} wks GA)`
            : 'Evaluated on WHO Child Growth Standards curve',
        ],
        sourceLabel: 'WHO Child Growth Standards 2006',
        missingData: [],
        dueDate: 'Immediate (Same day)',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    } else if (computedWhz !== null && computedWhz >= -3 && computedWhz < -2) {
      // P2: Moderate malnutrition (-3 to -2 Z)
      flagsOut.push({
        ruleId: 'P2',
        flagType: 'elevated_risk',
        level: 'orange',
        title: 'Priority pediatric growth & nutritional follow-up',
        factors: [
          'Weight-for-height measurement is moderately below the WHO reference curve',
          correctedAgeMonths !== null
            ? `Calculated on corrected age (${correctedAgeMonths} mos)`
            : 'Calculated on chronological age',
        ],
        sourceLabel: 'WHO Child Growth Standards 2006',
        missingData: [],
        dueDate: 'Within 14 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P3: Missed Well-Child Visit (schedule-driven when the last visit age is known)
    if (computedMissedWcv !== null && computedMissedWcv >= 1) {
      const isTwo = computedMissedWcv >= 2;
      flagsOut.push({
        ruleId: 'P3',
        flagType: 'missed_care',
        level: isTwo ? 'orange' : 'yellow',
        title: isTwo ? 'Two consecutive Well-Child Visits missed' : 'Scheduled Well-Child Visit overdue',
        factors: [
          isTwo
            ? 'Two scheduled early-childhood developmental and preventive visits were missed'
            : 'The scheduled well-child check-up window has passed without a confirmed visit',
          'Consolidating growth, developmental, and immunization checks in a single visit is recommended',
        ],
        sourceLabel: 'Well-Child Visit Standard (national reference)',
        missingData: [],
        dueDate: isTwo ? 'Within 14 days' : 'Within 30 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P4: Immunization delay or zero-dose
    if (cp.isZeroDoseChild || (cp.vaccineDelayDays && cp.vaccineDelayDays > PEDIATRIC_THRESHOLDS.vaccineDelayFollowupDays)) {
      const isPriority = Boolean(cp.isZeroDoseChild || (cp.vaccineDelayDays && cp.vaccineDelayDays > PEDIATRIC_THRESHOLDS.vaccineDelayPriorityDays));
      flagsOut.push({
        ruleId: 'P4',
        flagType: 'overdue_care',
        level: isPriority ? 'orange' : 'yellow',
        title: cp.isZeroDoseChild ? 'Zero-dose child: priority catch-up immunization' : `Scheduled vaccine dose overdue (${cp.vaccineDelayDays} days)`,
        factors: [
          cp.isZeroDoseChild
            ? 'No DTP-containing foundational dose recorded after 14 weeks of age (WHO/Gavi Zero-Dose definition)'
            : `Scheduled childhood immunization dose is delayed by ${cp.vaccineDelayDays} days`,
        ],
        sourceLabel: 'UAE National Immunization Schedule',
        missingData: [],
        dueDate: isPriority ? 'Within 14 days' : 'Within 30 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P5: Early childhood anemia screening
    const anemiaWindow = PEDIATRIC_THRESHOLDS.anemiaScreeningWindowMonths;
    if (
      (patient.ageMonths >= anemiaWindow[0] && patient.ageMonths <= anemiaWindow[1] && cp.anemiaScreeningDone === false) ||
      (cp.hemoglobinGdl !== undefined && Number(cp.hemoglobinGdl) < PEDIATRIC_THRESHOLDS.anemiaHbThresholdGdl)
    ) {
      const lowHb = cp.hemoglobinGdl !== undefined && Number(cp.hemoglobinGdl) < PEDIATRIC_THRESHOLDS.anemiaHbThresholdGdl;
      flagsOut.push({
        ruleId: 'P5',
        flagType: lowHb ? 'elevated_risk' : 'missed_care',
        level: lowHb ? 'orange' : 'yellow',
        title: lowHb
          ? `Pediatric hemoglobin below the WHO reference level (${cp.hemoglobinGdl} g/dL)`
          : 'Routine early-childhood anemia screening not yet completed',
        factors: [
          lowHb
            ? `Measured hemoglobin (${cp.hemoglobinGdl} g/dL) is below the WHO reference level for early childhood`
            : 'Hemoglobin screening recommended during the 12–24 month window has not been recorded',
          'Combined with the upcoming consolidated Well-Child Visit',
        ],
        sourceLabel: 'WHO & UAE Pediatric Standard',
        missingData: lowHb ? [] : ['Capillary or venous hemoglobin check'],
        dueDate: lowHb ? 'Within 14 days' : 'Within 30 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P6: M-CHAT-R developmental screening + follow-up interview (M-CHAT-R/F)
    const mchatScore =
      cp.mchatScore !== undefined && cp.mchatScore !== null ? Number(cp.mchatScore) : null;
    const mchatFollowUp =
      cp.mchatFollowUpScore !== undefined && cp.mchatFollowUpScore !== null
        ? Number(cp.mchatFollowUpScore)
        : null;
    if (mchatScore !== null && mchatScore >= PEDIATRIC_THRESHOLDS.mchatFollowUpScore) {
      const followUpCompleted = mchatFollowUp !== null;
      const followUpPositive = followUpCompleted && mchatFollowUp! >= 2;
      const referral = mchatScore >= PEDIATRIC_THRESHOLDS.mchatHighScore || followUpPositive;
      const followUpNegative = followUpCompleted && !followUpPositive;
      if (!followUpNegative) {
        flagsOut.push({
          ruleId: 'P6',
          flagType: 'elevated_risk',
          level: referral ? 'orange' : 'yellow',
          title: referral
            ? 'Priority developmental evaluation recommended (M-CHAT-R/F)'
            : 'Structured developmental follow-up interview recommended (M-CHAT-R)',
          factors: [
            referral
              ? 'The M-CHAT-R/F result suggests direct referral to a developmental specialist'
              : 'The M-CHAT-R score is in the follow-up band (3–7): a structured follow-up interview is required before referral',
            followUpCompleted
              ? `Follow-up interview score: ${mchatFollowUp}/20`
              : 'The follow-up interview has not yet been recorded',
          ],
          sourceLabel: 'M-CHAT-R/F Published Screening Logic',
          missingData: referral || followUpCompleted ? [] : ['M-CHAT-R follow-up interview result'],
          dueDate: referral ? 'Within 14 days' : 'Within 30 days',
          certainty: 'medium',
          certaintyReason: 'Based on parent-reported developmental screening responses',
          isEclipseSuspended: false,
        });
      }
    }

    // P8: Adolescent / child BMI-for-age monitoring
    if (
      computedBmiZ !== null &&
      (computedBmiZ > PEDIATRIC_THRESHOLDS.bmiForAgeZWatchAbove || computedBmiZ < PEDIATRIC_THRESHOLDS.bmiForAgeZWatchBelow)
    ) {
      const z = computedBmiZ;
      const isOrange = z > PEDIATRIC_THRESHOLDS.bmiForAgeZOrangeAbove || z < PEDIATRIC_THRESHOLDS.bmiForAgeZOrangeBelow;
      flagsOut.push({
        ruleId: 'P8',
        flagType: 'elevated_risk',
        level: isOrange ? 'orange' : 'yellow',
        title: 'Growth & BMI-for-age follow-up recommended',
        factors: [
          'Body mass index for age is outside the standard reference band on the WHO 2007 curve',
          'Supportive family-centered nutrition and physical activity guidance is recommended',
        ],
        sourceLabel: 'WHO Growth Reference 2007',
        missingData: [],
        dueDate: isOrange ? 'Within 14 days' : 'Within 45 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P9: Pediatric / Adolescent Blood Pressure (AAP 2017)
    if (
      retainedSys &&
      retainedDia &&
      patient.ageYears >= BLOOD_PRESSURE_THRESHOLDS.adolescentAgeMinYears &&
      (retainedSys >= BLOOD_PRESSURE_THRESHOLDS.adolescentSysMmHg || retainedDia >= BLOOD_PRESSURE_THRESHOLDS.adolescentDiaMmHg)
    ) {
      flagsOut.push({
        ruleId: 'P9',
        flagType: 'elevated_risk',
        level: 'orange',
        title: `Adolescent blood pressure elevation (${retainedSys}/${retainedDia} mmHg)`,
        factors: [
          'Adolescent blood pressure reading meets the AAP 2017 guideline level for confirmatory follow-up',
          'Repeat auscultatory confirmation with appropriate cuff size and height percentile check is advised',
        ],
        sourceLabel: 'AAP 2017 Pediatric Hypertension Guideline',
        missingData: heightCm ? [] : ['Standing height measurement required for pediatric BP percentile'],
        dueDate: 'Within 14 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P10: Family history of hypercholesterolemia / early CVD (Equity pathway)
    if (cp.familyHistoryFhOrEarlyCvd) {
      flagsOut.push({
        ruleId: 'P10',
        flagType: 'elevated_risk',
        level: 'orange',
        title: 'Preventive lipid profile recommended (Family History Equity Pathway)',
        factors: [
          'First-degree family history of familial hypercholesterolemia or premature cardiovascular event',
          'Provides non-genomic acceleration so non-sequenced families receive equal early protection',
        ],
        sourceLabel: 'International Pediatric FH Guidelines',
        missingData: ['Fasting or non-fasting lipid profile'],
        dueDate: 'Within 14 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // P11: Adolescent vaccines
    if (
      patient.ageYears >= PEDIATRIC_THRESHOLDS.adolescentVaccinesAgeMinYears &&
      cp.adolescentVaccinesUpToDate === false
    ) {
      flagsOut.push({
        ruleId: 'P11',
        flagType: 'missed_care',
        level: 'yellow',
        title: 'Adolescent immunization booster due (HPV / Meningococcal / Tdap)',
        factors: [
          'Scheduled adolescent preventive vaccine doses have not yet been recorded in the registry',
        ],
        sourceLabel: 'UAE National Adolescent Immunization Schedule',
        missingData: [],
        dueDate: 'Within 45 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }
  }

  // 3. Adult Rules (A1..A11) & Genomic Rules (G1..G3)
  let whoCvdCalc: BackendClinicalCalculations['whoCvdModel'] = {
    inDomain: false,
    domainNote: 'Applicable to non-pregnant adults aged 40–80 years',
    regionUsed: WHO_2019_CHART_SOURCE.mena,
    riskPercent: null,
    intervalLowPercent: null,
    intervalHighPercent: null,
    crossesThreshold: false,
    counterfactuals: [],
  };

  let findriscCalc: BackendClinicalCalculations['findriscModel'] = {
    score: null,
    levelLabel: 'Not applicable',
    suspendedByPregnancy: false,
    asianBmiRuleA4Triggered: false,
    itemBreakdown: [],
    questionnaireComplete: false,
    missingItems: [],
  };

  if (patient.pathwayType === 'adult') {
    // Pregnancy status is resolved once above (it also drives the Grey audit).

    // Compute FINDRISC 8-item breakdown — NO default imputation: every item
    // comes from the record or is reported as missing data (score stays null
    // for an incomplete questionnaire; a declared score is used as-is).
    const fin = computeFindriscBreakdown({
      ageYears: patient.ageYears,
      sex: patient.sex,
      bmi: computedBmi,
      waistCm: cp.waistCm !== undefined ? Number(cp.waistCm) : null,
      dailyPhysicalActivity: cp.dailyPhysicalActivity ?? null,
      dailyFruitsVegetables: cp.dailyFruitsVegetables ?? null,
      antihypertensiveMed: cp.antihypertensiveMed ?? null,
      historyHighBloodGlucose: cp.historyHighBloodGlucose ?? null,
      familyDiabetes: cp.familyDiabetes ?? null,
      explicitScore: cp.findriscScore,
    });

    const asianOrigin =
      patient.nationalityGroup === 'South Asia' || patient.nationalityGroup === 'Southeast Asia';
    const asianBmiThresholdReached =
      !isPregnant && asianOrigin && computedBmi !== null &&
      computedBmi >= DIABETES_SCREENING_THRESHOLDS.asianAdaptedBmiThresholdKgM2;
    const glycemicScreeningRecent =
      hba1c !== null || (lastGlycemicMonths !== null && lastGlycemicMonths <= 36);
    // A4 only when the last glycemic screening is known to be more than 3 years old.
    // An unknown date is surfaced as missing data (Grey), never assumed recent or overdue.
    const asianBmiTriggered = Boolean(
      asianBmiThresholdReached && !glycemicScreeningRecent && lastGlycemicMonths !== null
    );

    findriscCalc = {
      score: isPregnant ? null : fin.score,
      levelLabel: isPregnant
        ? 'Suspended during pregnancy'
        : fin.score === null
        ? `Incomplete questionnaire (${fin.missingItems.length} item${fin.missingItems.length === 1 ? '' : 's'} missing)`
        : fin.score >= DIABETES_SCREENING_THRESHOLDS.findriscHighRiskScore
        ? 'High risk'
        : fin.score >= DIABETES_SCREENING_THRESHOLDS.findriscScreeningScore
        ? 'Moderate risk'
        : 'Low-to-moderate risk',
      suspendedByPregnancy: isPregnant,
      asianBmiRuleA4Triggered: asianBmiTriggered,
      itemBreakdown: fin.breakdown,
      questionnaireComplete: fin.missingItems.length === 0,
      missingItems: fin.missingItems,
    };

    // TEST-S3: Rule A11 — Pregnancy with elevated blood pressure -> RED, suspends A2, A3, A6
    const a11After20Weeks = pregnancyWeeks === null || pregnancyWeeks >= 20;
    if (
      isPregnant &&
      a11After20Weeks &&
      retainedSys &&
      retainedDia &&
      (retainedSys >= BLOOD_PRESSURE_THRESHOLDS.pregnancySysMmHg || retainedDia >= BLOOD_PRESSURE_THRESHOLDS.pregnancyDiaMmHg)
    ) {
      const isSevere =
        retainedSys >= BLOOD_PRESSURE_THRESHOLDS.pregnancySevereSysMmHg ||
        retainedDia >= BLOOD_PRESSURE_THRESHOLDS.pregnancySevereDiaMmHg;
      flagsOut.push({
        ruleId: 'A11',
        flagType: 'elevated_risk',
        level: 'red',
        title: isSevere
          ? `Same-day obstetric emergency: severe maternal hypertension (${retainedSys}/${retainedDia} mmHg)`
          : `Urgent maternal blood pressure assessment required (${retainedSys}/${retainedDia} mmHg)`,
        factors: [
          pregnancyWeeks === null
            ? `Elevated blood pressure (${retainedSys}/${retainedDia} mmHg) recorded during ongoing pregnancy; gestational age is not recorded, so the preeclampsia window cannot be excluded`
            : `Elevated blood pressure (${retainedSys}/${retainedDia} mmHg) recorded during ongoing pregnancy after 20 weeks`,
          'Requires immediate obstetric evaluation to rule out preeclampsia',
          'Other routine screening rules are automatically paused during this emergency',
        ],
        sourceLabel: 'International Obstetric Hypertension Guidelines',
        missingData: [
          'Urine protein assessment & obstetric clinical review',
          ...(pregnancyWeeks === null ? ['Gestational age at assessment (weeks)'] : []),
        ],
        dueDate: 'Immediate (Same day)',
        certainty: pregnancyWeeks === null ? 'medium' : 'high',
        certaintyReason:
          pregnancyWeeks === null
            ? 'Verified blood pressure; gestational age missing — obstetric confirmation required'
            : 'Verified repeated blood pressure measurements in clinic',
        isEclipseSuspended: false,
      });
    }

    // A1: Adult blood pressure (when not pregnant, or early pregnancy before 20 weeks)
    const a1Active = !isPregnant || (pregnancyWeeks !== null && pregnancyWeeks < 20);
    if (a1Active && retainedSys && retainedDia) {
      if (retainedSys >= BLOOD_PRESSURE_THRESHOLDS.adultHighSysMmHg || retainedDia >= BLOOD_PRESSURE_THRESHOLDS.adultHighDiaMmHg) {
        flagsOut.push({
          ruleId: 'A1',
          flagType: 'elevated_risk',
          level: 'orange',
          title: `Priority blood pressure confirmation (${retainedSys}/${retainedDia} mmHg retained mean)`,
          factors: [
            `Retained resting blood pressure mean (${retainedSys}/${retainedDia} mmHg) is above the WHO guideline level for confirmation`,
            requiresThirdReading
              ? 'The first two readings differ noticeably — the 3-reading protocol was applied'
              : 'Consistent across repeated resting measurements (5 min rest, ≥ 1 min apart)',
          ],
          sourceLabel: 'WHO HEARTS Technical Package',
          missingData: [],
          dueDate: 'Within 14 days',
          certainty: baseCertainty,
          certaintyReason: baseCertaintyReason,
          isEclipseSuspended: false,
        });
      } else if (
        retainedSys >= BLOOD_PRESSURE_THRESHOLDS.adultElevatedSysMmHg ||
        retainedDia >= BLOOD_PRESSURE_THRESHOLDS.adultElevatedDiaMmHg
      ) {
        flagsOut.push({
          ruleId: 'A1',
          flagType: 'elevated_risk',
          level: 'yellow',
          title: `Borderline blood pressure (${retainedSys}/${retainedDia} mmHg) — follow-up check advised`,
          factors: [
            `Retained resting blood pressure (${retainedSys}/${retainedDia} mmHg) is in the vigilance range that calls for a scheduled follow-up check`,
            'Lifestyle guidance and a scheduled follow-up blood pressure check are recommended',
          ],
          sourceLabel: 'WHO HEARTS Preventive Vigilance Guideline',
          missingData: [],
          dueDate: 'Within 30 days',
          certainty: baseCertainty,
          certaintyReason: baseCertaintyReason,
          isEclipseSuspended: false,
        });
      }
    }

    // A2: WHO 2019 Non-Lab CVD model (Domain: 40-80 years, non-pregnant)
    if (isPregnant) {
      whoCvdCalc = {
        ...whoCvdCalc,
        inDomain: false,
        domainNote: 'Suspended during pregnancy',
      };
    } else if (retainedSys && computedBmi) {
      if (patient.ageYears < WHO_CVD_THRESHOLDS.domainAgeMinYears || patient.ageYears > WHO_CVD_THRESHOLDS.domainAgeMaxYears) {
        whoCvdCalc = {
          ...whoCvdCalc,
          inDomain: false,
          domainNote: `Out of domain (${patient.ageYears} yrs — WHO 2019 chart applies only to ages 40–80)`,
        };
        flagsOut.push({
          ruleId: 'A2-DOMAIN',
          flagType: 'elevated_risk',
          level: 'green',
          title: `WHO 10-year CVD chart out of domain (${patient.ageYears} yrs < 40 yrs)`,
          factors: [
            'The WHO 2019 10-year cardiovascular prediction model is statistically validated only for ages 40–80',
            'Prevention for this person relies directly on blood pressure follow-up, glycemic screening, adapted BMI guidance, family history, and genomic eligibility',
          ],
          sourceLabel: 'WHO 2019 CVD Risk Chart (Non-Laboratory)',
          missingData: [],
          dueDate: 'Routine schedule',
          certainty: 'medium',
          certaintyReason: 'Patient age is outside the 40–80 year statistical model domain',
          isEclipseSuspended: false,
        });
      } else {
        const smoker = Boolean(cp.smokingStatus && cp.smokingStatus !== 'never');
        const cvd = computeWho2019NonLabCvd({
          ageYears: patient.ageYears,
          sex: patient.sex,
          systolicBp: retainedSys,
          bmi: computedBmi,
          smoker,
          nationalityGroup: patient.nationalityGroup,
        });

        whoCvdCalc = {
          inDomain: true,
          domainNote: `Evaluated on ${cvd.regionUsed} (with an uncertainty band on BP and BMI)`,
          regionUsed: cvd.regionUsed,
          riskPercent: cvd.riskPercent,
          intervalLowPercent: cvd.intervalLowPercent,
          intervalHighPercent: cvd.intervalHighPercent,
          crossesThreshold: cvd.crossesThreshold,
          counterfactuals: cvd.counterfactuals,
        };

        if (cvd.crossesThreshold && baseCertainty === 'high') {
          baseCertainty = 'medium';
          baseCertaintyReason = 'The 10-year risk interval spans a decision level — flagged for clinician review';
        }

        if (cvd.riskPercent >= WHO_CVD_THRESHOLDS.riskYellowPercent) {
          const isOrange = cvd.riskPercent >= WHO_CVD_THRESHOLDS.riskOrangePercent;
          const counterfactualStrings = cvd.counterfactuals.map(
            (c) => `Counterfactual: reducing ${c.factor} from ${c.currentValue} to ${c.targetValue} lowers 10-year risk by -${c.riskReductionPct}%`
          );
          if (counterfactualStrings.length === 0) {
            counterfactualStrings.push(`Estimated 10-year WHO cardiovascular risk is ${cvd.riskPercent}% [${cvd.intervalLowPercent}–${cvd.intervalHighPercent}%]`);
          }

          flagsOut.push({
            ruleId: 'A2',
            flagType: 'elevated_risk',
            level: isOrange ? 'orange' : 'yellow',
            title: `WHO 10-Year CVD Risk: ${cvd.riskPercent}% [${cvd.intervalLowPercent}–${cvd.intervalHighPercent}%]`,
            factors: counterfactualStrings.slice(0, 3),
            sourceLabel: cvd.regionUsed,
            missingData: ['Fasting lipid profile to refine clinical assessment'],
            dueDate: isOrange ? 'Within 14 days' : 'Within 45 days',
            certainty:
              patient.nationalityGroup !== 'Emirati' && patient.nationalityGroup !== 'Arab World (Non-UAE)'
                ? 'medium'
                : baseCertainty,
            certaintyReason:
              patient.nationalityGroup !== 'Emirati'
                ? 'Regional chart calibrated for the region, adapted with origin context'
                : baseCertaintyReason,
            isEclipseSuspended: false,
          });
        }
      }
    }

    // A3: Glycemic / Diabetes screening (FINDRISC >= 12 or HbA1c >= 5.7%)
    if (
      !isPregnant &&
      ((fin.score !== null && fin.score >= DIABETES_SCREENING_THRESHOLDS.findriscScreeningScore) ||
        (hba1c !== null && hba1c >= DIABETES_SCREENING_THRESHOLDS.hba1cPrediabetesPercent))
    ) {
      const isOrange =
        (fin.score !== null && fin.score >= DIABETES_SCREENING_THRESHOLDS.findriscHighRiskScore) ||
        (hba1c !== null && hba1c >= DIABETES_SCREENING_THRESHOLDS.hba1cDiabetesPercent);
      const topFinItems = fin.breakdown
        .filter((b) => b.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, 2)
        .map((b) => b.item)
        .join(', ');

      flagsOut.push({
        ruleId: 'A3',
        flagType: 'elevated_risk',
        level: isOrange ? 'orange' : 'yellow',
        title: isOrange
          ? `Priority glycemic & diabetes assessment${hba1c ? ` (HbA1c ${hba1c}%)` : ''}`
          : 'Preventive diabetes screening recommended',
        factors: [
          `The diabetes-risk questionnaire result is elevated; main contributors: ${topFinItems || 'metabolic profile'}`,
          hba1c
            ? `Recorded HbA1c is ${hba1c}% (laboratory value)`
            : 'Laboratory HbA1c test is recommended to check blood sugar regulation',
        ],
        sourceLabel: 'FINDRISC (Lindström & Tuomilehto 2003) & ADA Guidelines',
        missingData: [
          ...(hba1c === null ? ['Laboratory HbA1c blood test'] : []),
          // No default imputation: unanswered questionnaire items are surfaced as missing data
          ...(fin.missingItems.length > 0 ? [`FINDRISC items not yet recorded: ${fin.missingItems.join(', ')}`] : []),
        ],
        dueDate: isOrange ? 'Within 14 days' : 'Within 30 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A4: South Asia / East Asia BMI >= 23 adaptation
    if (asianBmiTriggered) {
      flagsOut.push({
        ruleId: 'A4',
        flagType: 'missed_care',
        level: 'yellow',
        title: 'Adapted Asian BMI guidance triggered (current BMI on the adapted chart)',
        factors: [
          `In South and East Asian populations, cardiometabolic risk appears at a lower BMI than on the general chart (current BMI: ${computedBmi} kg/m²)`,
          'This adapted guidance is added alongside the standard questionnaire without altering any validated result',
        ],
        sourceLabel: 'WHO Asian BMI Adaptation 2004 & ADA Guideline',
        missingData: ['HbA1c glycemic blood test'],
        dueDate: 'Within 30 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A5: Cervical cancer screening (Female 25–65y)
    if (
      !isPregnant &&
      patient.sex.toLowerCase() === 'female' &&
      patient.ageYears >= ADULT_SCREENING_THRESHOLDS.cervicalScreeningAgeMinYears &&
      patient.ageYears <= ADULT_SCREENING_THRESHOLDS.cervicalScreeningAgeMaxYears &&
      cervicalCurrent === false
    ) {
      flagsOut.push({
        ruleId: 'A5',
        flagType: 'missed_care',
        level: 'yellow',
        title: 'Cervical cancer preventive screening overdue',
        factors: [
          'Scheduled cervical screening (Pap / HPV test) is past the national interval for women aged 25–65',
        ],
        sourceLabel: 'National Cervical Screening Guideline',
        missingData: [],
        dueDate: 'Within 45 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A6: Breast cancer mammography (Female 40–69y, non-pregnant)
    if (
      !isPregnant &&
      patient.sex.toLowerCase() === 'female' &&
      patient.ageYears >= ADULT_SCREENING_THRESHOLDS.mammographyAgeMinYears &&
      patient.ageYears <= ADULT_SCREENING_THRESHOLDS.mammographyAgeMaxYears &&
      mammographyCurrent === false
    ) {
      flagsOut.push({
        ruleId: 'A6',
        flagType: 'missed_care',
        level: 'yellow',
        title: 'Preventive bilateral mammography screening due',
        factors: [
          'No bilateral screening mammogram recorded within the national 2-year interval (ages 40–69)',
        ],
        sourceLabel: 'National Breast Screening Guideline',
        missingData: [],
        dueDate: 'Within 45 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A7: Colorectal screening (40–75 years, or earlier with a first-degree family history)
    if (
      !isPregnant &&
      patient.ageYears <= 75 &&
      (patient.ageYears >= ADULT_SCREENING_THRESHOLDS.colorectalAgeMinYears || cp.familyHistoryColorectal) &&
      colorectalCurrent === false
    ) {
      flagsOut.push({
        ruleId: 'A7',
        flagType: 'missed_care',
        level: cp.familyHistoryColorectal ? 'orange' : 'yellow',
        title: 'Colorectal cancer preventive screening (FIT kit / colonoscopy) due',
        factors: [
          cp.familyHistoryColorectal
            ? 'First-degree family history of colorectal cancer warrants accelerated screening (Equity pathway)'
            : 'Periodic colorectal FIT screening is due according to the adult prevention schedule (ages 40–75)',
        ],
        sourceLabel: 'National Colorectal Screening Guideline',
        missingData: [],
        dueDate: cp.familyHistoryColorectal ? 'Within 14 days' : 'Within 45 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A8: IFHAS comprehensive adult check
    if (!isPregnant && ifhasCurrent === false && flagsOut.length === 0) {
      flagsOut.push({
        ruleId: 'A8',
        flagType: 'missed_care',
        level: 'yellow',
        title: 'Periodic comprehensive adult preventive check-up (IFHAS) due',
        factors: [
          'No comprehensive periodic health check is recorded within the recommended programme interval',
        ],
        sourceLabel: 'IFHAS Comprehensive Screening',
        missingData: [],
        dueDate: 'Within 60 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A9: Interrupted chronic follow-up OR an Orange/Red orientation that was
    // not honoured within its window (closed-loop rule).
    const daysSinceOrientation =
      typeof cp.daysSinceOrientation === 'number' ? cp.daysSinceOrientation : null;
    const orientationWindowDays =
      cp.orientationLevel === 'red' ? 1 : cp.orientationLevel === 'orange' ? 14 : null;
    const missedOrientation =
      cp.orientationNotAttended === true &&
      orientationWindowDays !== null &&
      daysSinceOrientation !== null &&
      daysSinceOrientation > orientationWindowDays;
    const chronicGap =
      Boolean(cp.chronicCondition) &&
      Boolean(cp.monthsSinceLastChronicVisit) &&
      Number(cp.monthsSinceLastChronicVisit) > ADULT_SCREENING_THRESHOLDS.chronicVisitGapMonths;
    if (chronicGap || missedOrientation) {
      flagsOut.push({
        ruleId: 'A9',
        flagType: 'interrupted_followup',
        level: 'orange',
        title: missedOrientation
          ? `Orientation not honoured within its window (${daysSinceOrientation} days since ${cp.orientationLevel} orientation)`
          : `Continuity of care follow-up overdue (${cp.monthsSinceLastChronicVisit} mos since last visit)`,
        factors: missedOrientation
          ? [
              `A ${cp.orientationLevel} orientation was issued ${daysSinceOrientation} days ago and no confirmed visit is recorded`,
              'Closed-loop follow-up requires re-contact and a new appointment',
            ]
          : [
              `No follow-up visit recorded in ${cp.monthsSinceLastChronicVisit} months for ongoing ${cp.chronicCondition}`,
              'Re-establishing regular monitoring prevents avoidable complications',
            ],
        sourceLabel: 'WHO PEN Continuity Protocol / Closed-loop follow-up',
        missingData: [],
        dueDate: 'Within 14 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A10: Older adult fall & sensory screening (>= 65 years, CDC STEADI)
    if (patient.ageYears >= ADULT_SCREENING_THRESHOLDS.fallScreeningAgeMinYears && cp.fallOrSensoryRisk) {
      flagsOut.push({
        ruleId: 'A10',
        flagType: 'elevated_risk',
        level: 'orange',
        title: 'Older adult balance, fall prevention & sensory assessment (STEADI)',
        factors: [
          'History of fall in the past year, gait unsteadiness, or uncorrected vision/hearing impairment reported',
          'Multifactorial fall risk and sensory evaluation recommended',
        ],
        sourceLabel: 'CDC STEADI Older Adult Prevention Guideline',
        missingData: [],
        dueDate: 'Within 14 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // G1, G2, G3: Genomic Eligibility Rules (ONLY if patient consented to purpose 5)
    if (consentExistingGenomic && cp.genomicSignal && cp.genomicSignal.type !== 'NONE') {
      if (cp.genomicSignal.type === 'LOW_OR_NEGATIVE') {
        // G3 Safeguard: negative or low genomic score NEVER delays standard screening
      } else {
        const isG2 = cp.genomicSignal.type === 'BRCA_ACTIONABLE' || cp.genomicSignal.type === 'FH_VARIANT';
        flagsOut.push({
          ruleId: isG2 ? 'G2' : 'G1',
          flagType: 'elevated_risk',
          level: 'orange',
          title: isG2
            ? 'Specialist genetic counseling & enhanced surveillance eligible (simulated)'
            : `Accelerated cardiometabolic panel via existing genomic result (simulated)`,
          factors: [
            cp.genomicSignal.effectSummary ||
              'An authorized existing genomic result indicates eligibility for an earlier preventive panel',
            'Acts strictly as an eligibility signal without modifying WHO or questionnaire results',
          ],
          sourceLabel: 'Emirati Genome Program Policy (simulated)',
          missingData: ['Comprehensive lipid panel & HbA1c'],
          dueDate: 'Within 14 days',
          certainty: 'medium',
          certaintyReason: 'Simulated genomic policy rule; clinical confirmation required',
          isEclipseSuspended: false,
        });
      }
    }
  }

  // Level Grey completeness audit (Section 4.7): every required variable that
  // is genuinely unknown is surfaced as missing data. Unknown is never treated
  // as "healthy" or "up to date". A Grey flag does NOT mask a confirmed Orange
  // or Yellow (see the overall-level ordering below).
  const missingRequired: string[] = [];
  const isUnknown = (v: unknown) => v === undefined || v === null;

  if (patient.pathwayType === 'adult') {
    if (!retainedSys) {
      missingRequired.push('Resting blood pressure measurement (two readings at least 1 minute apart)');
    }
    if (!computedBmi) {
      missingRequired.push('Weight and height measurement (BMI)');
    }
    // A3 is suspended during pregnancy, so glycemic completeness is not required there.
    const glycemicKnown = isPregnant || findriscCalc.score !== null || hba1c !== null;
    if (!glycemicKnown) {
      missingRequired.push('Complete FINDRISC questionnaire (8 items) or a laboratory HbA1c');
    }
    if (isPregnant && pregnancyWeeks === null) {
      missingRequired.push('Gestational age at assessment (weeks)');
    }
    const asianOrigin =
      patient.nationalityGroup === 'South Asia' || patient.nationalityGroup === 'Southeast Asia';
    if (
      !isPregnant &&
      asianOrigin &&
      computedBmi !== null &&
      computedBmi >= DIABETES_SCREENING_THRESHOLDS.asianAdaptedBmiThresholdKgM2 &&
      hba1c === null &&
      lastGlycemicMonths === null
    ) {
      missingRequired.push('Date of last glycemic screening (rule A4, > 3 years interval)');
    }
    if (!isPregnant && patient.ageYears >= 40 && patient.ageYears <= 80 && isUnknown(cp.smokingStatus)) {
      missingRequired.push('Tobacco use (required by the WHO 2019 non-laboratory model)');
    }
    if (!isPregnant) {
      if (
        patient.sex.toLowerCase() === 'female' &&
        patient.ageYears >= ADULT_SCREENING_THRESHOLDS.cervicalScreeningAgeMinYears &&
        patient.ageYears <= ADULT_SCREENING_THRESHOLDS.cervicalScreeningAgeMaxYears &&
        cervicalCurrent === null
      ) {
        missingRequired.push('Cervical cancer screening status');
      }
      if (
        patient.sex.toLowerCase() === 'female' &&
        patient.ageYears >= ADULT_SCREENING_THRESHOLDS.mammographyAgeMinYears &&
        patient.ageYears <= ADULT_SCREENING_THRESHOLDS.mammographyAgeMaxYears &&
        mammographyCurrent === null
      ) {
        missingRequired.push('Mammography screening status');
      }
      if (
        patient.ageYears >= ADULT_SCREENING_THRESHOLDS.colorectalAgeMinYears &&
        patient.ageYears <= 75 &&
        colorectalCurrent === null
      ) {
        missingRequired.push('Colorectal cancer screening status');
      }
      if (patient.ageYears >= 18 && patient.ageYears <= 75 && ifhasCurrent === null) {
        missingRequired.push('IFHAS comprehensive adult check status');
      }
    }
    if (patient.ageYears >= ADULT_SCREENING_THRESHOLDS.fallScreeningAgeMinYears && isUnknown(cp.fallOrSensoryRisk)) {
      missingRequired.push('Fall / balance / sensory risk status (CDC STEADI)');
    }
  } else {
    const ageMonths = patient.ageMonths;
    if (ageMonths < 60) {
      if (computedWhz === null && isUnknown(cp.muacMm)) {
        missingRequired.push('Weight-for-height Z-score and mid-upper arm circumference');
      }
    } else if (ageMonths <= 216 && computedBmiZ === null) {
      missingRequired.push('BMI-for-age Z-score (WHO 2007)');
    }
    const immunizationKnown =
      !isUnknown(cp.vaccineDelayDays) ||
      !isUnknown(cp.isZeroDoseChild) ||
      !isUnknown(cp.adolescentVaccinesUpToDate);
    if (!immunizationKnown) {
      missingRequired.push('Immunization registry status (delays and zero-dose)');
    }
    if (ageMonths <= 72 && computedMissedWcv === null) {
      missingRequired.push('Age of the last Well-Child Visit (schedule adherence)');
    }
    if (
      ageMonths >= 12 &&
      ageMonths <= 24 &&
      isUnknown(cp.anemiaScreeningDone) &&
      isUnknown(cp.hemoglobinGdl)
    ) {
      missingRequired.push('Anemia screening status or hemoglobin value');
    }
    if (ageMonths >= 16 && ageMonths <= 30 && isUnknown(cp.mchatScore)) {
      missingRequired.push('M-CHAT-R developmental screening result');
    }
    if (patient.ageYears >= 10 && isUnknown(cp.adolescentVaccinesUpToDate)) {
      missingRequired.push('Adolescent immunization status (HPV / meningococcal / boosters)');
    }
  }

  if (missingRequired.length > 0) {
    completenessPercent = Math.max(10, 100 - missingRequired.length * 12);
    flagsOut.push({
      ruleId: 'GREY',
      flagType: 'missed_care',
      level: 'grey',
      title: 'Insufficient data to complete the prevention evaluation',
      factors: [
        'Required prevention variables are not recorded; missing values are never replaced by defaults',
        'A safe preventive status cannot be confirmed until the missing measurements are recorded',
      ],
      sourceLabel: 'MediSense Clinical Safety Protocol (Level Grey)',
      missingData: missingRequired,
      dueDate: 'Within 14 days',
      certainty: 'low',
      certaintyReason: 'To be confirmed by recording the missing required variables',
      isEclipseSuspended: false,
    });
  }

  // TEST-S2: Eclipse Rule — Active Red flag suspends Yellow flags
  const hasRed = flagsOut.some((f) => f.level === 'red');
  const suspendedYellowRuleIds: string[] = [];
  if (hasRed) {
    for (const f of flagsOut) {
      if (f.level === 'yellow') {
        f.isEclipseSuspended = true;
        suspendedYellowRuleIds.push(f.ruleId);
      }
    }
  }

  // Determine overall level. Confirmed Orange/Yellow findings outrank a Grey
  // completeness flag: missing data must not hide an actionable finding.
  const activeFlags = flagsOut.filter((f) => f.ruleId !== 'A2-DOMAIN');
  let overallLevel: 'red' | 'orange' | 'yellow' | 'green' | 'grey' = 'green';
  if (activeFlags.some((f) => f.level === 'red')) overallLevel = 'red';
  else if (activeFlags.some((f) => f.level === 'orange')) overallLevel = 'orange';
  else if (activeFlags.some((f) => f.level === 'yellow')) overallLevel = 'yellow';
  else if (activeFlags.some((f) => f.level === 'grey')) overallLevel = 'grey';

  const overallCertainty: 'high' | 'medium' | 'low' =
    overallLevel === 'grey' || flagsOut.some((f) => f.certainty === 'low')
      ? 'low'
      : flagsOut.some((f) => f.certainty === 'medium')
      ? 'medium'
      : 'high';

  // Build Consolidated CarePlan (Section 5.1: group compatible actions into a single visit)
  const nonSuspendedFlags = activeFlags.filter((f) => !f.isEclipseSuspended);
  const groupedActions: BackendClinicalCalculations['consolidatedCarePlan']['groupedActions'] =
    nonSuspendedFlags.map((f) => ({
      ruleId: f.ruleId,
      actionTitle: f.title,
      directiveSource: f.sourceLabel,
      category: f.flagType,
    }));

  if (groupedActions.length === 0) {
    groupedActions.push({
      ruleId: patient.pathwayType === 'adult' ? 'IFHAS-ROUTINE' : 'WCV-ROUTINE',
      actionTitle: 'Routine periodic preventive wellness maintenance',
      directiveSource: 'Published National Preventive Schedule',
      category: 'routine_prevention',
    });
  }

  const consolidatedCarePlan: BackendClinicalCalculations['consolidatedCarePlan'] = {
    pathwayTitle:
      overallLevel === 'red'
        ? 'Immediate Clinical Safety & Diagnostic Confirmation Visit'
        : overallLevel === 'grey'
        ? 'Baseline Measurement Completion Visit (Resolve Level Grey)'
        : patient.pathwayType === 'child'
        ? 'Consolidated Well-Child & Immunization Visit (Single Booking)'
        : patient.pathwayType === 'adolescent'
        ? 'Consolidated Adolescent Growth, Lipid & Booster Visit'
        : 'Consolidated Adult Cardiometabolic & Cancer Screening Visit (IFHAS)',
    dueDate:
      overallLevel === 'red'
        ? 'Immediate (Same day)'
        : overallLevel === 'orange' || overallLevel === 'grey'
        ? 'Within 14 days'
        : overallLevel === 'yellow'
        ? 'Within 30 days'
        : 'In 12 months (Up to date)',
    level: overallLevel,
    groupedActions,
  };

  const bpZoneLabel =
    !retainedSys
      ? 'Blood pressure not recorded yet'
      : retainedSys >= BLOOD_PRESSURE_THRESHOLDS.adultHighSysMmHg || (retainedDia && retainedDia >= BLOOD_PRESSURE_THRESHOLDS.adultHighDiaMmHg)
      ? 'Above your target zone — priority confirmation recommended'
      : retainedSys >= BLOOD_PRESSURE_THRESHOLDS.adultElevatedSysMmHg || (retainedDia && retainedDia >= BLOOD_PRESSURE_THRESHOLDS.adultElevatedDiaMmHg)
      ? 'Borderline zone — keep your scheduled follow-up'
      : 'Within your target zone';

  const calculations: BackendClinicalCalculations = {
    emergencyEscapeE0: {
      triggered: emergencyTriggered,
      reason: emergencyReason,
    },
    bpProtocol: {
      reading1: sys1 && dia1 ? `${sys1}/${dia1} mmHg` : null,
      reading2: sys2 && dia2 ? `${sys2}/${dia2} mmHg` : null,
      reading3: sys3 && dia3 ? `${sys3}/${dia3} mmHg` : null,
      spreadSys,
      spreadDia,
      requiresThirdReading,
      retainedSys,
      retainedDia,
      bpZoneLabel,
    },
    anthropometry: {
      weightKg,
      heightCm,
      bmi: computedBmi,
      waistCm: cp.waistCm ?? null,
      correctedAgeMonths,
      weightForHeightZ: computedWhz,
      bmiForAgeZ: computedBmiZ,
      muacMm: cp.muacMm ?? null,
    },
    whoCvdModel: whoCvdCalc,
    findriscModel: findriscCalc,
    certaintyAudit: {
      completenessPercent,
      provenanceCodes: provMap,
      oldestMeasureMonths: oldestMonths,
      crossesWhoThreshold: whoCvdCalc.crossesThreshold,
      finalCertainty: overallCertainty,
      certaintyReason: baseCertaintyReason,
    },
    eclipseSafeguard: {
      activeRedFlag: hasRed,
      suspendedYellowRuleIds,
    },
    genomicPolicy: {
      consentGranted: consentExistingGenomic,
      signalType: cp.genomicSignal?.type || 'NONE',
      effectSummary:
        !consentExistingGenomic
          ? 'Genomic purpose consent not granted — not used in this evaluation'
          : cp.genomicSignal?.type === 'LOW_OR_NEGATIVE'
          ? 'Low or negative genomic result has no delaying effect on standard screening'
          : cp.genomicSignal?.effectSummary || 'No genomic accelerator signal active',
    },
    consolidatedCarePlan,
  };

  return {
    flags: flagsOut,
    overallLevel,
    overallCertainty,
    correctedAgeMonths,
    calculations,
  };
}

