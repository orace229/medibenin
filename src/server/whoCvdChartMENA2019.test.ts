import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lookupWhoNonLabCvdRisk,
  WHO_2019_NONLAB_CHARTS,
  WHO_CHART_BAND_CENTERS,
  type WhoChartRegion,
} from './whoCvdChartMENA2019.ts';
import { computeWho2019NonLabCvd } from './rulesEngine.ts';

// Published chart cells must be reproduced EXACTLY at band centres (no interpolation error):
// MENA, men, non-smoker, 60-64, SBP 140-159, BMI 25-29 → 19% (official WHO 2019 chart value)
test('WHO 2019 chart: band-centre lookup reproduces the published cell exactly', () => {
  assert.equal(lookupWhoNonLabCvdRisk('mena', 'men', 'nonSmoker', 62, 150, 27), 19);
  // MENA, men, smoker, 70-74, SBP ≥180, BMI ≥35 → 60% (official chart value)
  assert.equal(lookupWhoNonLabCvdRisk('mena', 'men', 'smoker', 72, 190, 38), 60);
  // South Asia, women, smoker, 70-74, SBP ≥180, BMI ≥35 → 33% (official chart value)
  assert.equal(lookupWhoNonLabCvdRisk('southAsia', 'women', 'smoker', 72, 190, 38), 33);
});

// The flat layout must contain exactly the 700 published cells per region, with no NaN/gap
test('WHO 2019 chart tables: 700 numeric cells per region', () => {
  const regions: WhoChartRegion[] = ['mena', 'southAsia'];
  for (const region of regions) {
    for (const sex of ['men', 'women'] as const) {
      for (const smoker of ['nonSmoker', 'smoker'] as const) {
        const flat = WHO_2019_NONLAB_CHARTS[region][sex][smoker];
        assert.equal(flat.length, 175);
        assert.ok(flat.every((v) => Number.isFinite(v) && v >= 0 && v <= 100));
      }
    }
  }
});

// Monotonicity of the interpolated surface: risk never decreases with age, SBP, or BMI
test('WHO 2019 chart: interpolated risk is monotonic in age, SBP and BMI', () => {
  const c = WHO_CHART_BAND_CENTERS;
  for (const region of ['mena', 'southAsia'] as const) {
    for (const sex of ['men', 'women'] as const) {
      for (const smoker of ['nonSmoker', 'smoker'] as const) {
        for (let age = 40; age <= 80; age += 2) {
          for (let bmi = 18; bmi <= 40; bmi += 2) {
            for (let sbp = 100; sbp < 200; sbp += 5) {
              const lo = lookupWhoNonLabCvdRisk(region, sex, smoker, age, sbp, bmi);
              const hiSbp = lookupWhoNonLabCvdRisk(region, sex, smoker, age, sbp + 5, bmi);
              assert.ok(hiSbp >= lo - 1e-9, `SBP monotonicity ${region} ${sex} ${smoker} ${age} ${sbp}`);
              const hiAge = lookupWhoNonLabCvdRisk(region, sex, smoker, age + 2, sbp, bmi);
              assert.ok(hiAge >= lo - 1e-9, `age monotonicity ${region} ${sex} ${smoker} ${age} ${sbp}`);
            }
            const lo = lookupWhoNonLabCvdRisk(region, sex, smoker, age, 150, bmi);
            const hiBmi = lookupWhoNonLabCvdRisk(region, sex, smoker, age, 150, bmi + 2);
            assert.ok(hiBmi >= lo - 1e-9, `BMI monotonicity ${region} ${sex} ${smoker} ${age} ${bmi}`);
          }
        }
      }
    }
  }
});

// Estimator contract: region selection, uncertainty interval ordering, counterfactual ordering
test('computeWho2019NonLabCvd: MENA vs South Asia regionUsed and interval consistency', () => {
  const mena = computeWho2019NonLabCvd({
    ageYears: 62, sex: 'male', systolicBp: 152, bmi: 27.4, smoker: true, nationalityGroup: 'Emirati',
  });
  assert.match(mena.regionUsed, /North Africa & Middle East/);
  assert.ok(mena.intervalLowPercent <= mena.riskPercent);
  assert.ok(mena.riskPercent <= mena.intervalHighPercent);
  assert.ok(mena.counterfactuals.length >= 2); // SBP > 120 and smoker
  const sorted = [...mena.counterfactuals].sort((a, b) => b.riskReductionPct - a.riskReductionPct);
  assert.deepEqual(mena.counterfactuals, sorted);

  const southAsia = computeWho2019NonLabCvd({
    ageYears: 62, sex: 'male', systolicBp: 152, bmi: 27.4, smoker: true, nationalityGroup: 'South Asia',
  });
  assert.match(southAsia.regionUsed, /South Asia/);
  assert.ok(southAsia.intervalLowPercent <= southAsia.riskPercent);
  assert.ok(southAsia.riskPercent <= southAsia.intervalHighPercent);

  // Non-smoker with BP ≤ 120 and BMI ≤ 25 → no counterfactual proposed
  const healthy = computeWho2019NonLabCvd({
    ageYears: 45, sex: 'female', systolicBp: 118, bmi: 23, smoker: false, nationalityGroup: 'Emirati',
  });
  assert.deepEqual(healthy.counterfactuals, []);
});
