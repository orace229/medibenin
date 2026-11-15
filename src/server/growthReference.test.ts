import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBmiForAgeZ,
  computeWeightForHeightZ,
} from './growthReference.ts';

test('WHO 2007 BMI-for-age: median BMI gives Z=0 at month 61', () => {
  const z = computeBmiForAgeZ({ ageMonths: 61, sex: 'male', bmi: 15.2641 });
  assert.ok(z !== null);
  assert.ok(Math.abs(z!) < 0.01, `expected 0, got ${z}`);
});

test('WHO 2007 BMI-for-age: the published +2 SD value gives Z≈2', () => {
  const z = computeBmiForAgeZ({ ageMonths: 61, sex: 'male', bmi: 18.259 });
  assert.ok(z !== null);
  assert.ok(Math.abs(z! - 2) < 0.02, `expected 2, got ${z}`);
});

test('WHO 2007 BMI-for-age: female median and out-of-domain handling', () => {
  const median = computeBmiForAgeZ({ ageMonths: 61, sex: 'female', bmi: 15.2441 });
  assert.ok(median !== null);
  assert.ok(Math.abs(median!) < 0.01);
  assert.equal(computeBmiForAgeZ({ ageMonths: 240, sex: 'female', bmi: 20 }), null);
});

test('WHO 2006 weight-for-height: median weight gives Z=0 at 65 cm', () => {
  const z = computeWeightForHeightZ({ heightCm: 65, weightKg: 7.4327, sex: 'male' });
  assert.ok(z !== null);
  assert.ok(Math.abs(z!) < 0.01, `expected 0, got ${z}`);
});

test('WHO 2006 weight-for-height: the published -2 SD value gives Z≈-2', () => {
  const z = computeWeightForHeightZ({ heightCm: 65, weightKg: 6.335, sex: 'male' });
  assert.ok(z !== null);
  assert.ok(Math.abs(z! + 2) < 0.02, `expected -2, got ${z}`);
});

test('WHO 2006 weight-for-height: outside 65–120 cm returns null', () => {
  assert.equal(computeWeightForHeightZ({ heightCm: 50, weightKg: 5, sex: 'female' }), null);
  assert.equal(computeWeightForHeightZ({ heightCm: 130, weightKg: 30, sex: 'male' }), null);
});
