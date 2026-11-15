/**
 * WHO growth reference calculators (LMS method).
 *
 * Data provenance:
 *  - BMI-for-age 5–19 years, WHO Growth Reference 2007, expanded z-score tables
 *    (`bmi-boys-z-who-2007-exp.xlsx`, `bmi-girls-z-who-2007-exp.xlsx`).
 *  - Weight-for-height 65–120 cm, WHO Child Growth Standards 2006, expanded
 *    z-score tables (`wfh-boys/girls-zscore-expanded-tables.xlsx`).
 *
 * The LMS values are transcribed from the published WHO tables and are not
 * tunable. Interpolation is linear between adjacent published rows; values
 * outside the published domain return null (never an extrapolated number).
 */

import bmiForAgeDoc from '../config/growth/who-bmi-for-age-5-19.json';
import weightForHeightDoc from '../config/growth/who-weight-for-height-65-120.json';

export type GrowthSex = 'male' | 'female';

type LmsRow = [number, number, number, number]; // key, L, M, S

interface GrowthDocument {
  schemaVersion: number;
  documentId: string;
  source: string;
  unit: string;
  rows: Record<GrowthSex, LmsRow[]>;
}

const BMI_DOC = bmiForAgeDoc as unknown as GrowthDocument;
const WFH_DOC = weightForHeightDoc as unknown as GrowthDocument;

function normalizeSex(sex: string): GrowthSex | null {
  const s = sex.toLowerCase();
  if (s === 'male' || s === 'm') return 'male';
  if (s === 'female' || s === 'f') return 'female';
  return null;
}

/** Linear interpolation of L, M and S at a continuous key (month or cm). */
function interpolateLms(rows: LmsRow[], key: number): { L: number; M: number; S: number } | null {
  if (rows.length === 0) return null;
  if (key < rows[0][0] || key > rows[rows.length - 1][0]) return null;
  let lo = 0;
  let hi = rows.length - 1;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (rows[mid][0] <= key) lo = mid;
    else hi = mid;
  }
  const a = rows[lo];
  const b = rows[hi];
  if (a[0] === key || b[0] === key) {
    const row = a[0] === key ? a : b;
    return { L: row[1], M: row[2], S: row[3] };
  }
  const t = (key - a[0]) / (b[0] - a[0]);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return { L: lerp(a[1], b[1]), M: lerp(a[2], b[2]), S: lerp(a[3], b[3]) };
}

function lmsZScore(value: number, L: number, M: number, S: number): number | null {
  if (!Number.isFinite(value) || !Number.isFinite(L) || !Number.isFinite(M) || !Number.isFinite(S)) {
    return null;
  }
  if (value <= 0 || M <= 0 || S <= 0) return null;
  const z =
    Math.abs(L) < 1e-9
      ? Math.log(value / M) / S
      : (Math.pow(value / M, L) - 1) / (L * S);
  return Number.isFinite(z) ? Math.round(z * 100) / 100 : null;
}

/**
 * WHO 2007 BMI-for-age Z-score (5–19 years). Returns null outside the published
 * age domain or for invalid inputs.
 */
export function computeBmiForAgeZ(params: {
  ageMonths: number;
  sex: string;
  bmi: number;
}): number | null {
  const sex = normalizeSex(params.sex);
  if (!sex) return null;
  if (!Number.isFinite(params.ageMonths) || params.ageMonths < 60 || params.ageMonths > 228) {
    return null;
  }
  // The published table starts at month 61 (5 years 1 month); clamp 60 months
  // to the first published row rather than extrapolating.
  const ageKey = Math.max(61, Math.min(228, params.ageMonths));
  const lms = interpolateLms(BMI_DOC.rows[sex], ageKey);
  if (!lms) return null;
  return lmsZScore(params.bmi, lms.L, lms.M, lms.S);
}

/**
 * WHO 2006 weight-for-height Z-score (65–120 cm). Returns null outside the
 * published height domain or for invalid inputs.
 */
export function computeWeightForHeightZ(params: {
  heightCm: number;
  weightKg: number;
  sex: string;
}): number | null {
  const sex = normalizeSex(params.sex);
  if (!sex) return null;
  if (!Number.isFinite(params.heightCm) || params.heightCm < 65 || params.heightCm > 120) {
    return null;
  }
  const lms = interpolateLms(
    WFH_DOC.rows[sex],
    Math.round(params.heightCm * 10) / 10
  );
  if (!lms) return null;
  return lmsZScore(params.weightKg, lms.L, lms.M, lms.S);
}

/** Metadata for governance / transparency. */
export const GROWTH_REFERENCE_METADATA = [
  {
    documentId: BMI_DOC.documentId,
    source: BMI_DOC.source,
    rows: BMI_DOC.rows.male.length + BMI_DOC.rows.female.length,
    domain: '5–19 years (months 61–228)',
  },
  {
    documentId: WFH_DOC.documentId,
    source: WFH_DOC.source,
    rows: WFH_DOC.rows.male.length + WFH_DOC.rows.female.length,
    domain: '65–120 cm',
  },
];
