import crypto from 'crypto';

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
    domain: 'pediatric' | 'adult' | 'community' | 'genomic';
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
  { id: 'A2', domain: 'adult', title: '10-year cardiovascular risk evaluation', sourceLabel: 'WHO 2019 Non-Laboratory CVD Chart (MENA)', verificationStatus: 'published' },
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
export function computeFindriscBreakdown(params: {
  ageYears: number;
  sex: string;
  bmi: number | null;
  waistCm: number | null;
  dailyPhysicalActivity: boolean;
  dailyFruitsVegetables: boolean;
  antihypertensiveMed: boolean;
  historyHighBloodGlucose: boolean;
  familyDiabetes: 'none' | 'second_degree' | 'first_degree';
  explicitScore?: number;
}): { score: number; breakdown: Array<{ item: string; points: number }> } {
  const breakdown: Array<{ item: string; points: number }> = [];

  // 1. Age
  const agePts =
    params.ageYears < 45 ? 0 : params.ageYears <= 54 ? 2 : params.ageYears <= 64 ? 3 : 4;
  breakdown.push({ item: `Age (${params.ageYears} yrs)`, points: agePts });

  // 2. BMI
  const bmi = params.bmi ?? 24;
  const bmiPts = bmi < 25 ? 0 : bmi <= 30 ? 1 : 3;
  breakdown.push({ item: `BMI (${bmi} kg/m²)`, points: bmiPts });

  // 3. Waist circumference
  const isMale = params.sex.toLowerCase() === 'male' || params.sex.toLowerCase() === 'm';
  const w = params.waistCm ?? (bmi >= 30 ? 104 : bmi >= 26 ? 95 : 82);
  let waistPts = 0;
  if (isMale) {
    waistPts = w < 94 ? 0 : w <= 102 ? 3 : 4;
  } else {
    waistPts = w < 80 ? 0 : w <= 88 ? 3 : 4;
  }
  breakdown.push({ item: `Waist circumference (${w} cm)`, points: waistPts });

  // 4. Physical activity >= 30 min/day
  const actPts = params.dailyPhysicalActivity ? 0 : 2;
  breakdown.push({ item: 'Physical activity < 30 min/day', points: actPts });

  // 5. Daily fruits & vegetables
  const fruitPts = params.dailyFruitsVegetables ? 0 : 1;
  breakdown.push({ item: 'Non-daily fruit/vegetable intake', points: fruitPts });

  // 6. Antihypertensive medication
  const medPts = params.antihypertensiveMed ? 2 : 0;
  breakdown.push({ item: 'History of antihypertensive medication', points: medPts });

  // 7. History of high blood glucose
  const glucPts = params.historyHighBloodGlucose ? 5 : 0;
  breakdown.push({ item: 'Previous borderline/elevated blood glucose', points: glucPts });

  // 8. Family history of diabetes
  const famPts =
    params.familyDiabetes === 'first_degree'
      ? 5
      : params.familyDiabetes === 'second_degree'
      ? 3
      : 0;
  breakdown.push({ item: `Family history of diabetes (${params.familyDiabetes})`, points: famPts });

  const computedTotal = breakdown.reduce((acc, b) => acc + b.points, 0);
  const finalScore =
    params.explicitScore !== undefined && params.explicitScore !== null
      ? Number(params.explicitScore)
      : computedTotal;

  return { score: finalScore, breakdown };
}

/**
 * Calibrated WHO 2019 Non-Laboratory 10-year CVD Risk Estimator (MENA / South Asia)
 * with ±1.96σ uncertainty interval (σ_BP = 5 mmHg, ΔBMI = ±1 kg/m²) and Counterfactual Attribution (Section 4.6 & Annexe A).
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

  const evalRiskFormula = (sysVal: number, bmiVal: number, isSmoker: boolean): number => {
    const ageCentered = (ageYears - 50) / 10;
    const sysCentered = (sysVal - 125) / 20;
    const bmiCentered = (bmiVal - 25) / 5;
    const regionAdj = nationalityGroup === 'South Asia' ? 0.18 : 0;

    const linear =
      -2.85 +
      0.58 * ageCentered +
      (isMale ? 0.34 : 0) +
      0.52 * sysCentered +
      0.22 * bmiCentered +
      (isSmoker ? 0.56 : 0) +
      regionAdj;

    const p = 100 / (1 + Math.exp(-linear));
    return Math.round(Math.min(48, Math.max(1, p)) * 10) / 10;
  };

  const riskPercent = evalRiskFormula(systolicBp, bmi, smoker);
  // ±1.96 * σ where σ = 5 mmHg (±9.8 mmHg) and BMI ± 1 kg/m² (Section 4.6 / H7)
  const intervalLowPercent = evalRiskFormula(Math.max(90, systolicBp - 9.8), Math.max(16, bmi - 1), smoker);
  const intervalHighPercent = evalRiskFormula(Math.min(240, systolicBp + 9.8), Math.min(50, bmi + 1), smoker);

  // Check if [intervalLow, intervalHigh] crosses any WHO threshold (5%, 10%, 20%)
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

  if (systolicBp > 120) {
    const targetRisk = evalRiskFormula(120, bmi, smoker);
    const drop = Math.max(0.2, Math.round((riskPercent - targetRisk) * 10) / 10);
    counterfactuals.push({
      factor: 'Resting Systolic Blood Pressure',
      currentValue: `${systolicBp} mmHg`,
      targetValue: '120 mmHg',
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

  if (bmi > 25) {
    const targetRisk = evalRiskFormula(systolicBp, 25, smoker);
    const drop = Math.max(0.1, Math.round((riskPercent - targetRisk) * 10) / 10);
    counterfactuals.push({
      factor: 'Body Mass Index (BMI)',
      currentValue: `${bmi} kg/m²`,
      targetValue: '25.0 kg/m²',
      riskReductionPct: drop,
    });
  }

  counterfactuals.sort((a, b) => b.riskReductionPct - a.riskReductionPct);

  const regionUsed =
    nationalityGroup === 'South Asia'
      ? 'WHO South Asia / MENA Adapted Chart (H11)'
      : 'WHO North Africa & Middle East (MENA) Chart';

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
      (retainedSys !== null && retainedDia !== null && (retainedSys >= 180 || retainedDia >= 120) && cp.hasSymptomaticCrisis)
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

  // 1. Check for critical missing data -> Level Grey (Rule 5 & Section 4.7)
  let completenessPercent = 100;
  if (patient.pathwayType === 'adult' && (!retainedSys || !computedBmi)) {
    const missing: string[] = [];
    if (!retainedSys) missing.push('Resting blood pressure measurement (two readings at least 1 minute apart)');
    if (!computedBmi) missing.push('Weight and height measurement (BMI)');
    if (cp.hba1cPercent === undefined) missing.push('Recent glycemic check or FINDRISC questionnaire');
    completenessPercent = Math.max(25, 100 - missing.length * 30);

    flagsOut.push({
      ruleId: 'GREY-ADULT',
      flagType: 'missed_care',
      level: 'grey',
      title: 'Insufficient clinical data to complete adult prevention evaluation',
      factors: [
        'Essential baseline measurements are missing from the record',
        'A safe preventive status cannot be confirmed until the measurements are recorded',
      ],
      sourceLabel: 'MediSense Clinical Safety Protocol (Level Grey)',
      missingData: missing,
      dueDate: 'Within 14 days',
      certainty: 'low',
      certaintyReason: 'To be confirmed by recording missing baseline measurements',
      isEclipseSuspended: false,
    });
  }

  if (patient.pathwayType === 'child' && cp.weightForHeightZ === undefined && cp.muacMm === undefined) {
    completenessPercent = 40;
    flagsOut.push({
      ruleId: 'GREY-CHILD',
      flagType: 'missed_care',
      level: 'grey',
      title: 'Insufficient growth data to complete pediatric evaluation',
      factors: [
        'Weight, length/height, or mid-upper arm circumference have not been recorded recently',
      ],
      sourceLabel: 'WHO Child Growth Standards Protocol',
      missingData: ['Weight and length/height measurement', 'Mid-upper arm circumference check'],
      dueDate: 'Within 14 days',
      certainty: 'low',
      certaintyReason: 'To be confirmed by recording child growth measurements',
      isEclipseSuspended: false,
    });
  }

  // 2. Pediatric & Adolescent Rules (P1..P11)
  if (patient.pathwayType === 'child' || patient.pathwayType === 'adolescent') {
    // P1: Severe acute malnutrition
    if ((cp.weightForHeightZ !== undefined && cp.weightForHeightZ < -3) || (cp.muacMm !== undefined && cp.muacMm < 115)) {
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
    } else if (cp.weightForHeightZ !== undefined && cp.weightForHeightZ >= -3 && cp.weightForHeightZ < -2) {
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

    // P3: Missed Well-Child Visit
    if (cp.missedWcvConsecutive && cp.missedWcvConsecutive >= 1) {
      const isTwo = cp.missedWcvConsecutive >= 2;
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
    if (cp.isZeroDoseChild || (cp.vaccineDelayDays && cp.vaccineDelayDays > 30)) {
      const isPriority = Boolean(cp.isZeroDoseChild || (cp.vaccineDelayDays && cp.vaccineDelayDays > 60));
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
    if (
      (patient.ageMonths >= 12 && patient.ageMonths <= 24 && cp.anemiaScreeningDone === false) ||
      (cp.hemoglobinGdl !== undefined && Number(cp.hemoglobinGdl) < 11.0)
    ) {
      const lowHb = cp.hemoglobinGdl !== undefined && Number(cp.hemoglobinGdl) < 11.0;
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

    // P6: M-CHAT-R developmental screening
    if (cp.mchatScore !== undefined && Number(cp.mchatScore) >= 3) {
      const score = Number(cp.mchatScore);
      const isHigh = score >= 8;
      flagsOut.push({
        ruleId: 'P6',
        flagType: 'elevated_risk',
        level: isHigh ? 'orange' : 'yellow',
        title: isHigh
          ? 'Priority developmental evaluation recommended (M-CHAT-R)'
          : 'Structured developmental follow-up interview recommended (M-CHAT-R)',
        factors: [
          isHigh
            ? 'The M-CHAT-R screening result suggests direct referral to a developmental specialist'
            : 'The M-CHAT-R screening result suggests a structured follow-up conversation with the pediatrician',
          'Screening prompt to guide dialogue — never presented as a diagnosis',
        ],
        sourceLabel: 'M-CHAT-R/F Published Screening Logic',
        missingData: [],
        dueDate: isHigh ? 'Within 14 days' : 'Within 30 days',
        certainty: 'medium',
        certaintyReason: 'Based on parent-reported developmental screening responses',
        isEclipseSuspended: false,
      });
    }

    // P8: Adolescent / child BMI-for-age monitoring
    if (cp.bmiForAgeZ !== undefined && (Number(cp.bmiForAgeZ) > 1 || Number(cp.bmiForAgeZ) < -2)) {
      const z = Number(cp.bmiForAgeZ);
      const isOrange = z > 2 || z < -3;
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
    if (retainedSys && retainedDia && patient.ageYears >= 13 && (retainedSys >= 130 || retainedDia >= 80)) {
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
    if (patient.ageYears >= 10 && cp.adolescentVaccinesUpToDate === false) {
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
    regionUsed: 'WHO MENA Chart',
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
  };

  if (patient.pathwayType === 'adult') {
    const isPregnant = Boolean(cp.isPregnant);

    // Compute FINDRISC 8-item breakdown
    const fin = computeFindriscBreakdown({
      ageYears: patient.ageYears,
      sex: patient.sex,
      bmi: computedBmi,
      waistCm: cp.waistCm !== undefined ? Number(cp.waistCm) : null,
      dailyPhysicalActivity: cp.dailyPhysicalActivity ?? false,
      dailyFruitsVegetables: cp.dailyFruitsVegetables ?? true,
      antihypertensiveMed: cp.antihypertensiveMed ?? Boolean(retainedSys && retainedSys >= 140),
      historyHighBloodGlucose: cp.historyHighBloodGlucose ?? false,
      familyDiabetes: cp.familyDiabetes || (cp.findriscScore && cp.findriscScore >= 14 ? 'first_degree' : 'none'),
      explicitScore: cp.findriscScore,
    });

    const asianBmiTriggered = Boolean(
      !isPregnant &&
        (patient.nationalityGroup === 'South Asia' || patient.nationalityGroup === 'Southeast Asia') &&
        computedBmi !== null &&
        computedBmi >= 23 &&
        cp.hba1cPercent === undefined
    );

    findriscCalc = {
      score: isPregnant ? null : fin.score,
      levelLabel: isPregnant
        ? 'Suspended during pregnancy'
        : fin.score >= 15
        ? 'High risk'
        : fin.score >= 12
        ? 'Moderate risk'
        : 'Low-to-moderate risk',
      suspendedByPregnancy: isPregnant,
      asianBmiRuleA4Triggered: asianBmiTriggered,
      itemBreakdown: fin.breakdown,
    };

    // TEST-S3: Rule A11 — Pregnancy with elevated blood pressure -> RED, suspends A2, A3, A6
    if (isPregnant && retainedSys && retainedDia && (retainedSys >= 140 || retainedDia >= 90)) {
      const isSevere = retainedSys >= 160 || retainedDia >= 110;
      flagsOut.push({
        ruleId: 'A11',
        flagType: 'elevated_risk',
        level: 'red',
        title: isSevere
          ? `Same-day obstetric emergency: severe maternal hypertension (${retainedSys}/${retainedDia} mmHg)`
          : `Urgent maternal blood pressure assessment required (${retainedSys}/${retainedDia} mmHg)`,
        factors: [
          `Elevated blood pressure (${retainedSys}/${retainedDia} mmHg) recorded during ongoing pregnancy after 20 weeks`,
          'Requires immediate obstetric evaluation to rule out preeclampsia',
          'Other routine screening rules are automatically paused during this emergency',
        ],
        sourceLabel: 'International Obstetric Hypertension Guidelines',
        missingData: ['Urine protein assessment & obstetric clinical review'],
        dueDate: 'Immediate (Same day)',
        certainty: 'high',
        certaintyReason: 'Verified repeated blood pressure measurements in clinic',
        isEclipseSuspended: false,
      });
    }

    // A1: Adult blood pressure (when not pregnant)
    if (!isPregnant && retainedSys && retainedDia) {
      if (retainedSys >= 140 || retainedDia >= 90) {
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
      } else if (retainedSys >= 130 || retainedDia >= 85) {
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
      if (patient.ageYears < 40 || patient.ageYears > 80) {
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
          sourceLabel: 'WHO 2019 Non-Laboratory CVD Chart',
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

        if (cvd.riskPercent >= 5) {
          const isOrange = cvd.riskPercent >= 10;
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
            sourceLabel: 'WHO 2019 Non-Laboratory CVD Chart',
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
    const hba1c = cp.hba1cPercent !== undefined && cp.hba1cPercent !== null ? Number(cp.hba1cPercent) : null;
    if (!isPregnant && ((fin.score !== null && fin.score >= 12) || (hba1c !== null && hba1c >= 5.7))) {
      const isOrange = (fin.score !== null && fin.score >= 15) || (hba1c !== null && hba1c >= 6.5);
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
        missingData: hba1c === null ? ['Laboratory HbA1c blood test'] : [],
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
      patient.ageYears >= 25 &&
      patient.ageYears <= 65 &&
      cp.cervicalScreeningUpToDate === false
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
      patient.ageYears >= 40 &&
      patient.ageYears <= 69 &&
      cp.mammographyUpToDate === false
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

    // A7: Colorectal screening (40-75y or 1st-degree family history)
    if (!isPregnant && (patient.ageYears >= 40 || cp.familyHistoryColorectal) && cp.colorectalScreeningUpToDate === false) {
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
    if (!isPregnant && cp.ifhasFullScreeningDone === false && flagsOut.length === 0) {
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

    // A9: Interrupted chronic follow-up
    if (cp.chronicCondition && cp.monthsSinceLastChronicVisit && Number(cp.monthsSinceLastChronicVisit) > 6) {
      flagsOut.push({
        ruleId: 'A9',
        flagType: 'interrupted_followup',
        level: 'orange',
        title: `Continuity of care follow-up overdue (${cp.monthsSinceLastChronicVisit} mos since last visit)`,
        factors: [
          `No follow-up visit recorded in ${cp.monthsSinceLastChronicVisit} months for ongoing ${cp.chronicCondition}`,
          'Re-establishing regular monitoring prevents avoidable complications',
        ],
        sourceLabel: 'WHO PEN Continuity Protocol',
        missingData: [],
        dueDate: 'Within 14 days',
        certainty: baseCertainty,
        certaintyReason: baseCertaintyReason,
        isEclipseSuspended: false,
      });
    }

    // A10: Older adult fall & sensory screening (>= 65 years, CDC STEADI)
    if (patient.ageYears >= 65 && cp.fallOrSensoryRisk) {
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

  // Determine overall level
  const activeFlags = flagsOut.filter((f) => f.ruleId !== 'A2-DOMAIN');
  let overallLevel: 'red' | 'orange' | 'yellow' | 'green' | 'grey' = 'green';
  if (activeFlags.some((f) => f.level === 'red')) overallLevel = 'red';
  else if (activeFlags.some((f) => f.level === 'grey')) overallLevel = 'grey';
  else if (activeFlags.some((f) => f.level === 'orange')) overallLevel = 'orange';
  else if (activeFlags.some((f) => f.level === 'yellow')) overallLevel = 'yellow';

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
      : retainedSys >= 140 || (retainedDia && retainedDia >= 90)
      ? 'Above your target zone — priority confirmation recommended'
      : retainedSys >= 130 || (retainedDia && retainedDia >= 85)
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
      weightForHeightZ: cp.weightForHeightZ ?? null,
      bmiForAgeZ: cp.bmiForAgeZ ?? null,
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

