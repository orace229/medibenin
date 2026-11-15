/** Shared synthetic-demo figures and reproducible variation. */
export const DEMO_SEED = 20261120;
export const N_COHORT = 6000; // must match COHORT_SIZE_PER_SEED in benchmarkEngine.ts (H22)
export const N_PANEL = 53; // 7 curated personas + 1 majority-transition case + 45 seeded synthetic records
export const DEMO_PANEL_STORY = 'Demo panel of 53 patients drawn from a 6,000-person synthetic cohort';
export function seededUnit(seed: number, index: number, salt: number): number {
  let value = (seed ^ Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(salt + 1, 0x27d4eb2d)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}
