/**
 * WHO 2019 Cardiovascular Disease Risk Charts — NON-LABORATORY-BASED — published lookup tables.
 *
 * Source (official WHO chart set, values transcribed as published, integer percentages):
 *  - "WHO cardiovascular disease risk non-laboratory-based charts — North Africa and Middle East",
 *    https://cdn.who.int/media/docs/default-source/cardiovascular-diseases/north-africa-and-middle-east.pdf (page 2)
 *    [same table, page 23 of https://www.who.int/docs/default-source/ncds/cvd-risk-non-laboratory-based-charts.pdf]
 *  - "…— South Asia", same WHO chart set (page 14 of the 22-region booklet).
 *  - Model & recalibration method: WHO CVD Risk Charts, revised models (Lancet Glob Health 2020;
 *    doi:10.1016/S2214-109X(19)30318-3). The non-laboratory model has NO diabetes variable
 *    (appendix Table 1.6) — the "with diabetes" variant exists only on the laboratory-based charts.
 *  - Transcribed & verified on 2026-11-14: 700 cells per region (2 sexes × smoker/non-smoker
 *    × 7 age bands × 5 SBP bands × 5 BMI bands); monotonicity verified (0 violations across
 *    age/SBP/BMI/smoking gradients). Values are the published WHO chart values and are NOT tunable.
 *
 * Domain (per WHO): ages 40–80 years, SBP bands <120…≥180 mmHg, BMI bands <20…≥35 kg/m².
 * Band centres used for interpolation: age 42/47/52/57/62/67/72, SBP 110/130/150/170/190,
 * BMI 17.5/22/27/32.5/38. Between band centres we use trilinear interpolation (documented
 * implementation choice — the published chart itself is a band lookup); outside the extreme
 * centres the nearest band value is held constant (flat extrapolation).
 */

export type WhoChartRegion = 'mena' | 'southAsia';
type Sex = 'men' | 'women';
type Smoker = 'nonSmoker' | 'smoker';

export const WHO_CHART_BAND_CENTERS = {
  ageYears: [42, 47, 52, 57, 62, 67, 72] as const,
  systolicBp: [110, 130, 150, 170, 190] as const,
  bmi: [17.5, 22, 27, 32.5, 38] as const,
};

// Flat layout: index = ((ageIdx * 5 + sbpIdx) * 5) + bmiIdx, one line per age band.
// Each row of 5 within a line is one SBP band × the 5 BMI bands.
export const WHO_2019_NONLAB_CHARTS: Record<WhoChartRegion, Record<Sex, Record<Smoker, number[]>>> = {
  // North Africa and Middle East — Afghanistan, United Arab Emirates, Bahrain, Iran, Iraq, Jordan, Kuwait, Lebanon, Oman, Occupied Palestinian Territory, Qatar, Saudi Arabia, Syrian Arab Republic, Turkey, Yemen, Algeria, Egypt, Libya, Morocco, Sudan, Tunisia.
  mena: {
    men: {
    nonSmoker: [
      2, 3, 3, 4, 4, 3, 4, 4, 5, 6, 4, 5, 6, 7, 9, 6, 7, 8, 10, 12, 9, 10, 12, 14, 17,
      3, 4, 4, 5, 6, 4, 5, 6, 7, 8, 6, 7, 8, 9, 11, 8, 10, 11, 13, 15, 11, 13, 15, 17, 20,
      4, 5, 6, 7, 8, 6, 7, 8, 9, 11, 8, 9, 11, 12, 14, 11, 13, 14, 16, 19, 15, 17, 19, 22, 25,
      6, 7, 8, 9, 11, 9, 10, 11, 12, 14, 11, 13, 14, 16, 18, 15, 16, 18, 21, 23, 19, 21, 24, 27, 30,
      9, 10, 12, 13, 14, 12, 13, 15, 16, 18, 15, 17, 19, 21, 23, 19, 21, 24, 26, 29, 25, 27, 30, 32, 36,
      13, 15, 16, 17, 19, 17, 18, 20, 22, 23, 21, 22, 24, 27, 29, 26, 28, 30, 32, 35, 31, 34, 36, 39, 42,
      19, 20, 22, 23, 25, 23, 25, 26, 28, 30, 28, 30, 32, 34, 36, 33, 35, 38, 40, 42, 40, 42, 44, 47, 50,
    ],
    smoker: [
      4, 5, 7, 8, 10, 6, 8, 9, 11, 13, 9, 11, 13, 15, 18, 12, 15, 17, 21, 25, 17, 20, 24, 28, 33,
      6, 7, 8, 10, 12, 8, 10, 11, 14, 16, 11, 13, 15, 18, 21, 15, 18, 21, 24, 28, 21, 24, 27, 32, 37,
      8, 9, 11, 13, 15, 11, 12, 14, 17, 19, 14, 16, 19, 22, 25, 19, 22, 25, 28, 32, 25, 28, 32, 36, 41,
      11, 12, 14, 16, 18, 14, 16, 18, 20, 23, 18, 20, 23, 26, 29, 23, 26, 29, 33, 37, 30, 33, 37, 41, 45,
      14, 16, 18, 20, 22, 18, 20, 22, 25, 27, 23, 25, 28, 31, 34, 28, 31, 34, 38, 41, 35, 39, 42, 46, 50,
      19, 20, 22, 24, 26, 23, 25, 27, 30, 32, 28, 31, 33, 36, 39, 35, 37, 40, 43, 47, 42, 45, 48, 51, 55,
      24, 26, 28, 30, 32, 29, 31, 33, 36, 38, 35, 37, 40, 42, 45, 42, 44, 47, 49, 52, 49, 51, 54, 57, 60,
    ],
    },
    women: {
    nonSmoker: [
      3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10, 11, 11,
      4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 14,
      5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 15, 15, 16, 17,
      7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 17, 18, 18, 19, 20, 21,
      10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 17, 17, 18, 19, 19, 20, 21, 22, 23, 23, 24, 25,
      13, 14, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 21, 21, 22, 23, 24, 24, 25, 26, 27, 28, 29, 30, 31,
      18, 19, 19, 20, 21, 21, 22, 23, 23, 24, 25, 25, 26, 27, 28, 29, 29, 30, 31, 32, 33, 34, 35, 36, 37,
    ],
    smoker: [
      6, 7, 7, 8, 9, 8, 9, 10, 10, 11, 11, 12, 13, 14, 15, 15, 16, 17, 18, 19, 19, 20, 22, 23, 24,
      8, 9, 9, 10, 11, 10, 11, 12, 13, 14, 13, 14, 15, 16, 17, 17, 18, 19, 21, 22, 22, 23, 25, 26, 28,
      10, 11, 11, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 19, 20, 20, 21, 23, 24, 25, 26, 27, 28, 29, 31,
      13, 13, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 24, 25, 26, 28, 29, 29, 31, 32, 33, 35,
      16, 17, 18, 18, 19, 19, 20, 21, 22, 23, 23, 24, 25, 27, 28, 28, 29, 30, 32, 33, 34, 35, 36, 37, 39,
      20, 21, 22, 22, 23, 24, 25, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43,
      25, 26, 26, 27, 28, 29, 30, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48,
    ],
    },
  },
  // South Asia — same WHO non-laboratory chart set.
  southAsia: {
    men: {
    nonSmoker: [
      2, 2, 2, 2, 3, 2, 2, 3, 3, 4, 3, 3, 4, 5, 5, 4, 5, 5, 6, 7, 5, 6, 7, 9, 10,
      2, 2, 3, 3, 4, 3, 3, 4, 4, 5, 4, 4, 5, 6, 7, 5, 6, 7, 8, 9, 7, 8, 9, 11, 12,
      3, 3, 4, 4, 5, 4, 4, 5, 6, 7, 5, 6, 7, 8, 9, 7, 8, 9, 10, 11, 9, 10, 11, 13, 15,
      4, 5, 5, 6, 7, 5, 6, 7, 8, 9, 7, 8, 9, 10, 11, 9, 10, 11, 13, 14, 11, 13, 14, 16, 18,
      6, 6, 7, 8, 9, 7, 8, 9, 10, 11, 9, 10, 11, 13, 14, 12, 13, 14, 16, 18, 15, 16, 18, 20, 22,
      8, 9, 10, 11, 12, 10, 11, 12, 13, 14, 12, 14, 15, 16, 18, 15, 17, 18, 20, 22, 19, 20, 22, 24, 26,
      11, 12, 13, 14, 15, 14, 15, 16, 17, 18, 17, 18, 19, 21, 22, 20, 22, 23, 25, 27, 24, 26, 28, 30, 32,
    ],
    smoker: [
      3, 3, 4, 5, 6, 4, 5, 6, 7, 8, 5, 6, 8, 9, 11, 8, 9, 11, 13, 15, 10, 12, 14, 17, 20,
      4, 4, 5, 6, 7, 5, 6, 7, 8, 10, 7, 8, 9, 11, 13, 9, 11, 13, 15, 17, 12, 14, 17, 20, 23,
      5, 6, 7, 8, 9, 7, 8, 9, 10, 12, 9, 10, 12, 13, 15, 11, 13, 15, 17, 20, 15, 17, 20, 22, 26,
      7, 7, 8, 10, 11, 9, 10, 11, 12, 14, 11, 12, 14, 16, 18, 14, 16, 18, 20, 23, 18, 20, 23, 26, 29,
      9, 10, 11, 12, 13, 11, 12, 14, 15, 17, 14, 15, 17, 19, 21, 17, 19, 21, 24, 26, 21, 24, 26, 29, 32,
      11, 12, 14, 15, 16, 14, 15, 17, 18, 20, 17, 19, 21, 22, 25, 21, 23, 25, 27, 30, 26, 28, 30, 33, 36,
      15, 16, 17, 18, 20, 18, 19, 21, 22, 24, 22, 23, 25, 27, 28, 26, 28, 30, 32, 34, 31, 33, 35, 37, 40,
    ],
    },
    women: {
    nonSmoker: [
      1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6,
      2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8,
      3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10,
      4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12,
      5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15,
      7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19,
      10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 21, 21, 22, 23, 24,
    ],
    smoker: [
      3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 8, 8, 9, 9, 10, 11, 11, 12, 13, 14, 15,
      4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 9, 10, 10, 10, 11, 12, 13, 13, 14, 15, 16, 17,
      5, 6, 6, 7, 7, 7, 7, 8, 9, 9, 9, 10, 10, 11, 12, 12, 13, 13, 14, 15, 15, 16, 17, 18, 19,
      7, 7, 8, 8, 9, 9, 9, 10, 11, 11, 11, 12, 13, 13, 14, 14, 15, 16, 17, 18, 18, 19, 20, 21, 22,
      9, 9, 10, 11, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 17, 17, 18, 19, 20, 21, 21, 22, 23, 24, 26,
      12, 12, 13, 13, 14, 14, 15, 15, 16, 17, 17, 18, 19, 19, 20, 21, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 22, 22, 23, 24, 25, 26, 26, 27, 28, 29, 30, 31, 32, 33,
    ],
    },
  },
};

const flatIndex = (ageIdx: number, sbpIdx: number, bmiIdx: number) => (ageIdx * 5 + sbpIdx) * 5 + bmiIdx;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function bracket(centers: readonly number[], x: number): [number, number, number, number] {
  // returns [x0, x1, idx0, idx1] with clamping to the extreme centres (flat extrapolation)
  if (x <= centers[0]) return [centers[0], centers[0], 0, 0];
  const last = centers.length - 1;
  if (x >= centers[last]) return [centers[last], centers[last], last, last];
  let i = 0;
  while (x > centers[i + 1]) i++;
  return [centers[i], centers[i + 1], i, i + 1];
}

/**
 * 10-year CVD risk (%) from the published WHO 2019 non-laboratory chart, with trilinear
 * interpolation between band centres. Inputs are clamped to the chart domain.
 */
export function lookupWhoNonLabCvdRisk(
  region: WhoChartRegion,
  sex: Sex,
  smoker: Smoker,
  ageYears: number,
  systolicBp: number,
  bmi: number
): number {
  const c = WHO_CHART_BAND_CENTERS;
  const age = clamp(ageYears, c.ageYears[0], c.ageYears[c.ageYears.length - 1]);
  const sbp = clamp(systolicBp, c.systolicBp[0], c.systolicBp[c.systolicBp.length - 1]);
  const bmiV = clamp(bmi, c.bmi[0], c.bmi[c.bmi.length - 1]);

  const [a0, a1, ai0, ai1] = bracket(c.ageYears, age);
  const [s0, s1, si0, si1] = bracket(c.systolicBp, sbp);
  const [b0, b1, bi0, bi1] = bracket(c.bmi, bmiV);

  const table = WHO_2019_NONLAB_CHARTS[region][sex][smoker];
  const at = (a: number, s: number, b: number) => table[flatIndex(a, s, b)];

  const lerp = (x: number, x0: number, x1: number, y0: number, y1: number) =>
    x1 === x0 ? y0 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);

  // Trilinear: 8 corners
  const c000 = at(ai0, si0, bi0);
  const c100 = at(ai1, si0, bi0);
  const c010 = at(ai0, si1, bi0);
  const c110 = at(ai1, si1, bi0);
  const c001 = at(ai0, si0, bi1);
  const c101 = at(ai1, si0, bi1);
  const c011 = at(ai0, si1, bi1);
  const c111 = at(ai1, si1, bi1);

  const c00 = lerp(age, a0, a1, c000, c100);
  const c10 = lerp(age, a0, a1, c010, c110);
  const c01 = lerp(age, a0, a1, c001, c101);
  const c11 = lerp(age, a0, a1, c011, c111);

  const c0 = lerp(sbp, s0, s1, c00, c10);
  const c1 = lerp(sbp, s0, s1, c01, c11);

  return lerp(bmiV, b0, b1, c0, c1);
}

/** Metadata for display / audit trail. */
export const WHO_2019_CHART_SOURCE = {
  mena: 'WHO 2019 CVD Risk Chart — North Africa & Middle East (non-laboratory)',
  southAsia: 'WHO 2019 CVD Risk Chart — South Asia (non-laboratory)',
} as const;
