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
