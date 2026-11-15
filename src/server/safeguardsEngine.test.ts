import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSafeguardedSegmentTable,
  computeWilson95,
} from './safeguardsEngine.ts';

const base = {
  dimension: 'Region',
  evaluatedComplete: 0,
  levelGreyCount: 0,
  recommendedCount: 0,
  invitedCount: 0,
  confirmedVisitsCount: 0,
  falsePositives: 0,
  trueNegatives: 0,
  falseNegatives: 0,
  truePositives: 0,
  genomicAccCount: 0,
  familyAccCount: 0,
};

test('Wilson 95% interval contains the point estimate', () => {
  const ci = computeWilson95(880, 1000);
  assert.equal(ci.proportion, 88);
  assert.ok(ci.lower < ci.proportion);
  assert.ok(ci.upper > ci.proportion);
});

test('primary suppression masks n < 10 and secondary suppresses one neighbor per primary', () => {
  const rows = buildSafeguardedSegmentTable([
    { ...base, segmentId: 'A', segmentLabel: 'A', totalEligible: 7, evaluatedComplete: 6 },
    { ...base, segmentId: 'B', segmentLabel: 'B', totalEligible: 8, evaluatedComplete: 7 },
    { ...base, segmentId: 'C', segmentLabel: 'C', totalEligible: 45, evaluatedComplete: 40 },
    { ...base, segmentId: 'D', segmentLabel: 'D', totalEligible: 60, evaluatedComplete: 55 },
    { ...base, segmentId: 'E', segmentLabel: 'E', totalEligible: 100, evaluatedComplete: 90 },
  ]);
  const byId = Object.fromEntries(rows.map((r) => [r.segmentId, r]));
  assert.equal(byId.A.suppressedStatus, 'primary_suppressed');
  assert.equal(byId.B.suppressedStatus, 'primary_suppressed');
  assert.equal(byId.C.suppressedStatus, 'secondary_suppressed');
  assert.equal(byId.D.suppressedStatus, 'secondary_suppressed');
  assert.equal(byId.E.suppressedStatus, 'visible');
  assert.equal(byId.A.totalEligible, -1);
});

test('10–29 cells are flagged small_sample (shown but not comparable)', () => {
  const rows = buildSafeguardedSegmentTable([
    { ...base, segmentId: 'S', segmentLabel: 'Small', totalEligible: 15, evaluatedComplete: 14 },
  ]);
  assert.equal(rows[0].suppressedStatus, 'small_sample');
  assert.match(rows[0].displayNote || '', /Small sample/);
  assert.notEqual(rows[0].totalEligible, -1);
});

test('fewer than 5 false positives/negatives are not published as a percentage', () => {
  const rows = buildSafeguardedSegmentTable([
    {
      ...base,
      segmentId: 'V',
      segmentLabel: 'Visible',
      totalEligible: 100,
      evaluatedComplete: 90,
      falsePositives: 2,
      trueNegatives: 80,
      falseNegatives: 1,
      truePositives: 10,
    },
  ]);
  assert.match(rows[0].falsePositiveRateDisplay, /Insufficient events/);
  assert.match(rows[0].falseNegativeRateDisplay, /Insufficient events/);
});
