import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFindriscBreakdown } from './rulesEngine.ts';
const baseline = { ageYears: 36, sex: 'male', bmi: 24, waistCm: 82, dailyFruitsVegetables: true, antihypertensiveMed: false, historyHighBloodGlucose: false, familyDiabetes: 'none' as const };
test('FINDRISC activity: checked at least 30 minutes per day adds no points', () => { const result = computeFindriscBreakdown({ ...baseline, dailyPhysicalActivity: true }); const activity = result.breakdown.find(item => item.item === 'Physical activity < 30 min/day'); assert.equal(activity?.points, 0); });
test('FINDRISC activity: unchecked under 30 minutes per day adds two points', () => { const result = computeFindriscBreakdown({ ...baseline, dailyPhysicalActivity: false }); const activity = result.breakdown.find(item => item.item === 'Physical activity < 30 min/day'); assert.equal(activity?.points, 2); });
