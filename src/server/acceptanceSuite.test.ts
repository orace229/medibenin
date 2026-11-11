import test from 'node:test';
import assert from 'node:assert/strict';
import { runAllAcceptanceTests } from './acceptanceSuite.ts';

test('MediSense Challenge 04 — 15 Acceptance Invariants (TEST-S1..S5, TEST-M1..M5, TEST-E1..E5)', async (t) => {
  const report = runAllAcceptanceTests();

  for (const item of report.results) {
    await t.test(`${item.id}: ${item.title}`, () => {
      assert.equal(item.passed, true, `Failed ${item.id}: ${item.evidence}`);
    });
  }

  assert.equal(report.allPassed, true);
  assert.equal(report.passedCount, 15);
  assert.equal(report.totalCount, 15);
});
