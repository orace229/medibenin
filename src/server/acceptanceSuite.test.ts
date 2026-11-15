import test from 'node:test';
import assert from 'node:assert/strict';
import { runAllAcceptanceTests } from './acceptanceSuite.ts';
import { computeFindriscBreakdown } from './rulesEngine.ts';

test('MediSense acceptance invariants', async (t) => {
  const report = runAllAcceptanceTests();
  for (const item of report.results) {
    await t.test(`${item.id}: ${item.title}`, () => {
      assert.equal(item.passed, true, `Failed ${item.id}: ${item.evidence}`);
    });
  }
  assert.equal(report.allPassed, true);
  assert.equal(report.passedCount, 19);
  assert.equal(report.totalCount, 19);
});

test('FINDRISC activity checkbox: checked adds zero points and unchecked adds two points', () => {
  const base = { ageYears: 36, sex: 'male', bmi: 24, waistCm: 82, dailyFruitsVegetables: true, antihypertensiveMed: false, historyHighBloodGlucose: false, familyDiabetes: 'none' as const };
  const activityPoints = (dailyPhysicalActivity: boolean) => computeFindriscBreakdown({ ...base, dailyPhysicalActivity }).breakdown.find((item) => item.item === 'Physical activity < 30 min/day')?.points;
  assert.equal(activityPoints(true), 0);
  assert.equal(activityPoints(false), 2);
});
