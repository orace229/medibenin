import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFindriscBreakdown, evaluatePatientRules } from './rulesEngine.ts';
const baseline = { ageYears: 36, sex: 'male', bmi: 24, waistCm: 82, dailyFruitsVegetables: true, antihypertensiveMed: false, historyHighBloodGlucose: false, familyDiabetes: 'none' as const };
test('FINDRISC activity: checked at least 30 minutes per day adds no points', () => { const result = computeFindriscBreakdown({ ...baseline, dailyPhysicalActivity: true }); const activity = result.breakdown.find(item => item.item === 'Physical activity < 30 min/day'); assert.equal(activity?.points, 0); });
test('FINDRISC activity: unchecked under 30 minutes per day adds two points', () => { const result = computeFindriscBreakdown({ ...baseline, dailyPhysicalActivity: false }); const activity = result.breakdown.find(item => item.item === 'Physical activity < 30 min/day'); assert.equal(activity?.points, 2); });

// FINDRISC must never invent a healthy answer: a missing item keeps the score null.
test('FINDRISC: a missing item leaves the score null (no default imputation)', () => {
  const result = computeFindriscBreakdown({ ...baseline, dailyPhysicalActivity: null });
  assert.equal(result.score, null);
  assert.ok(result.missingItems.includes('Physical activity < 30 min/day'));
});

// P0 safety: the E0 escape reads `hasEmergencySymptoms`, which the guided form
// now maps from its red-flag toggle.
test('E0: an emergency danger sign produces a Red escape and suspends routine prevention', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-E0',
      ageYears: 50,
      ageMonths: 600,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        systolicBp1: 150,
        diastolicBp1: 95,
        bmi: 29,
        hasEmergencySymptoms: true,
        hasSymptomaticCrisis: true,
      },
    },
    false
  );
  assert.equal(evaluated.overallLevel, 'red');
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'E0' && f.level === 'red'));
});

// P0 ordering: a confirmed Orange must not be hidden by the Grey completeness flag.
test('A confirmed Orange outranks a Grey completeness flag', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-ORANGE-GREY',
      ageYears: 50,
      ageMonths: 600,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        systolicBp1: 150,
        diastolicBp1: 95,
        bmi: 29,
        // FINDRISC items, smoking, colorectal and IFHAS intentionally unknown.
      },
    },
    false
  );
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'A1' && f.level === 'orange'));
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'GREY' && f.level === 'grey'));
  assert.equal(evaluated.overallLevel, 'orange');
});

// P0: unknown data must not become Green when no Orange/Yellow finding exists.
test('Unknown required data produces a Grey level, never a false Green', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-GREY-COMPLETE',
      ageYears: 30,
      ageMonths: 360,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        systolicBp1: 110,
        diastolicBp1: 70,
        bmi: 22,
      },
    },
    false
  );
  assert.equal(evaluated.overallLevel, 'grey');
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'GREY' && f.missingData.length >= 2));
});

test('A7: colorectal screening is not flagged after 75 years', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-A7-80',
      ageYears: 80,
      ageMonths: 960,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        systolicBp1: 120,
        diastolicBp1: 78,
        bmi: 24,
        findriscScore: 6,
        smokingStatus: 'never',
        colorectalScreeningUpToDate: false,
        ifhasFullScreeningDone: true,
        fallOrSensoryRisk: false,
      },
    },
    false
  );
  assert.equal(evaluated.flags.some((f) => f.ruleId === 'A7'), false);
});

test('A11: pregnancy before 20 weeks uses A1, not the preeclampsia rule', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-A11-EARLY',
      ageYears: 30,
      ageMonths: 360,
      sex: 'female',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        isPregnant: true,
        pregnancyWeeks: 16,
        systolicBp1: 150,
        diastolicBp1: 95,
        bmi: 25,
        findriscScore: 10,
      },
    },
    false
  );
  assert.equal(evaluated.flags.some((f) => f.ruleId === 'A11'), false);
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'A1' && f.level === 'orange'));
});

test('A4: a known screening older than 3 years triggers A4; an unknown date stays Grey', () => {
  const baseProfile = {
    systolicBp1: 120,
    diastolicBp1: 78,
    bmi: 24,
    findriscScore: 8,
  };
  const known = evaluatePatientRules(
    {
      id: 'TEST-PT-A4',
      ageYears: 36,
      ageMonths: 432,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'South Asia',
      clinicalProfile: { ...baseProfile, monthsSinceLastGlycemicScreening: 48 },
    },
    false
  );
  assert.ok(known.flags.some((f) => f.ruleId === 'A4' && f.level === 'yellow'));

  const unknown = evaluatePatientRules(
    {
      id: 'TEST-PT-A4-UNKNOWN',
      ageYears: 36,
      ageMonths: 432,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'South Asia',
      clinicalProfile: baseProfile,
    },
    false
  );
  assert.equal(unknown.flags.some((f) => f.ruleId === 'A4'), false);
  assert.ok(unknown.flags.some((f) => f.ruleId === 'GREY' && f.missingData.some((m) => m.includes('glycemic screening'))));
});

test('A9: an Orange orientation not honoured after 14 days becomes a closed-loop flag', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-A9',
      ageYears: 55,
      ageMonths: 660,
      sex: 'male',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        systolicBp1: 120,
        diastolicBp1: 78,
        bmi: 24,
        findriscScore: 6,
        smokingStatus: 'never',
        ifhasFullScreeningDone: true,
        fallOrSensoryRisk: false,
        orientationLevel: 'orange',
        orientationNotAttended: true,
        daysSinceOrientation: 30,
      },
    },
    false
  );
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'A9' && f.level === 'orange'));
});

test('P6: a score 3–7 requires the follow-up interview; a positive follow-up refers', () => {
  const base = {
    id: 'TEST-PT-P6',
    ageYears: 1,
    ageMonths: 18,
    sex: 'male',
    pathwayType: 'child',
    nationalityGroup: 'Emirati',
  };
  const noFollowUp = evaluatePatientRules(
    {
      ...base,
      clinicalProfile: {
        weightForHeightZ: 0,
        muacMm: 140,
        vaccineDelayDays: 0,
        isZeroDoseChild: false,
        anemiaScreeningDone: true,
        mchatScore: 5,
      },
    },
    false
  );
  assert.ok(noFollowUp.flags.some((f) => f.ruleId === 'P6' && f.level === 'yellow'));
  assert.ok(noFollowUp.flags.some((f) => f.ruleId === 'P6' && f.missingData.some((m) => m.includes('follow-up'))));

  const positiveFollowUp = evaluatePatientRules(
    {
      ...base,
      clinicalProfile: {
        weightForHeightZ: 0,
        muacMm: 140,
        vaccineDelayDays: 0,
        isZeroDoseChild: false,
        anemiaScreeningDone: true,
        mchatScore: 5,
        mchatFollowUpScore: 2,
      },
    },
    false
  );
  assert.ok(positiveFollowUp.flags.some((f) => f.ruleId === 'P6' && f.level === 'orange'));
});

test('Growth: BMI-for-age Z is computed from weight/height when not supplied', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-GROWTH',
      ageYears: 10,
      ageMonths: 120,
      sex: 'female',
      pathwayType: 'child',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        weightKg: 60,
        heightCm: 152,
        vaccineDelayDays: 0,
        isZeroDoseChild: false,
        anemiaScreeningDone: true,
        mchatScore: undefined,
        adolescentVaccinesUpToDate: true,
      },
    },
    false
  );
  assert.ok(evaluated.calculations.anthropometry.bmiForAgeZ !== null);
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'P8'));
});

test('P3: the WCV schedule derives two missed visits as Orange when only the last visit age is known', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-P3-SCHEDULE',
      ageYears: 1,
      ageMonths: 18,
      sex: 'male',
      pathwayType: 'child',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        weightForHeightZ: 0,
        muacMm: 140,
        vaccineDelayDays: 0,
        isZeroDoseChild: false,
        anemiaScreeningDone: true,
        mchatScore: 1,
        lastWcvAgeMonths: 12,
      },
    },
    false
  );
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'P3' && f.level === 'orange'));
});

test('A5/A6/A7: screening intervals are computed from months since the last test', () => {
  const evaluated = evaluatePatientRules(
    {
      id: 'TEST-PT-SCREENING-INTERVALS',
      ageYears: 50,
      ageMonths: 600,
      sex: 'female',
      pathwayType: 'adult',
      nationalityGroup: 'Emirati',
      clinicalProfile: {
        systolicBp1: 120,
        diastolicBp1: 78,
        bmi: 24,
        findriscScore: 6,
        smokingStatus: 'never',
        ifhasFullScreeningDone: true,
        fallOrSensoryRisk: false,
        monthsSinceLastCervicalScreening: 40,
        monthsSinceLastMammography: 30,
        monthsSinceLastColorectalScreening: 30,
      },
    },
    false
  );
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'A5' && f.level === 'yellow'));
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'A6' && f.level === 'yellow'));
  assert.ok(evaluated.flags.some((f) => f.ruleId === 'A7' && f.level === 'yellow'));
});
