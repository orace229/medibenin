/**
 * Exigence 4 & 5: Local Population Safeguards & Outcome-based Evaluation
 * - 95% Wilson Confidence Intervals on every proportion
 * - Primary small-cell suppression (n < 10 -> "Suppressed (n < 10)")
 * - Secondary complementary suppression on the smallest neighbor in the same row/column
 * - Small sample notice for 10 <= n <= 29 ("Small sample: no conclusion")
 * - Insufficient events notice (< 5 events -> "Insufficient events")
 * - Community & Equity Alerts (C1, C3, C4)
 */

export interface WilsonInterval {
  proportion: number; // 0 to 100
  lower: number; // 0 to 100
  upper: number; // 0 to 100
}

export function computeWilson95(successes: number, total: number): WilsonInterval {
  if (total <= 0) {
    return { proportion: 0, lower: 0, upper: 0 };
  }
  const z = 1.96;
  const p = successes / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denom;
  const halfWidth =
    (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom;

  return {
    proportion: Math.round(p * 1000) / 10,
    lower: Math.max(0, Math.round((center - halfWidth) * 1000) / 10),
    upper: Math.min(100, Math.round((center + halfWidth) * 1000) / 10),
  };
}

export interface SegmentSafeguardRow {
  segmentId: string;
  dimension: string;
  segmentLabel: string;
  totalEligible: number;
  evaluatedComplete: number;
  levelGreyCount: number;
  recommendedCount: number;
  invitedCount: number;
  confirmedVisitsCount: number;
  suppressedStatus: 'visible' | 'primary_suppressed' | 'secondary_suppressed' | 'small_sample';
  displayNote: string | null;
  reachWilson: WilsonInterval | null;
  recommendationRateWilson: WilsonInterval | null;
  adoptionRateWilson: WilsonInterval | null;
  falsePositiveRateDisplay: string;
  falseNegativeRateDisplay: string;
  genomicAccelerationShare: string;
  familyHistoryAccelerationShare: string;
}

/**
 * Applies API-level primary suppression (n < 10) and secondary suppression
 * before returning any segment statistics to the frontend or export (TEST-E4).
 */
export function buildSafeguardedSegmentTable(
  rawSegments: Array<{
    segmentId: string;
    dimension: string;
    segmentLabel: string;
    totalEligible: number;
    evaluatedComplete: number;
    levelGreyCount: number;
    recommendedCount: number;
    invitedCount: number;
    confirmedVisitsCount: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    truePositives: number;
    genomicAccCount: number;
    familyAccCount: number;
  }>
): SegmentSafeguardRow[] {
  // 1. Identify primary suppressed segments (n < 10)
  const primarySuppressedIds = new Set<string>();
  for (const seg of rawSegments) {
    if (seg.totalEligible < 10) {
      primarySuppressedIds.add(seg.segmentId);
    }
  }

  // 2. Identify secondary complementary suppression within the same dimension
  const secondarySuppressedIds = new Set<string>();
  const byDimension = new Map<string, typeof rawSegments>();
  for (const seg of rawSegments) {
    const list = byDimension.get(seg.dimension) || [];
    list.push(seg);
    byDimension.set(seg.dimension, list);
  }

  for (const [, list] of byDimension.entries()) {
    const hasPrimary = list.some((s) => primarySuppressedIds.has(s.segmentId));
    if (hasPrimary) {
      const candidates = list
        .filter((s) => !primarySuppressedIds.has(s.segmentId))
        .sort((a, b) => a.totalEligible - b.totalEligible);
      if (candidates.length > 0) {
        secondarySuppressedIds.add(candidates[0].segmentId);
      }
    }
  }

  // 3. Build masked output rows
  return rawSegments.map((seg) => {
    if (primarySuppressedIds.has(seg.segmentId)) {
      return {
        segmentId: seg.segmentId,
        dimension: seg.dimension,
        segmentLabel: seg.segmentLabel,
        totalEligible: -1, // Masked in API
        evaluatedComplete: -1,
        levelGreyCount: -1,
        recommendedCount: -1,
        invitedCount: -1,
        confirmedVisitsCount: -1,
        suppressedStatus: 'primary_suppressed',
        displayNote: 'Suppressed (n < 10)',
        reachWilson: null,
        recommendationRateWilson: null,
        adoptionRateWilson: null,
        falsePositiveRateDisplay: 'Suppressed (n < 10)',
        falseNegativeRateDisplay: 'Suppressed (n < 10)',
        genomicAccelerationShare: 'Suppressed (n < 10)',
        familyHistoryAccelerationShare: 'Suppressed (n < 10)',
      };
    }

    if (secondarySuppressedIds.has(seg.segmentId)) {
      return {
        segmentId: seg.segmentId,
        dimension: seg.dimension,
        segmentLabel: seg.segmentLabel,
        totalEligible: -1,
        evaluatedComplete: -1,
        levelGreyCount: -1,
        recommendedCount: -1,
        invitedCount: -1,
        confirmedVisitsCount: -1,
        suppressedStatus: 'secondary_suppressed',
        displayNote: 'Complementary suppression (anti-reconstruction)',
        reachWilson: null,
        recommendationRateWilson: null,
        adoptionRateWilson: null,
        falsePositiveRateDisplay: 'Suppressed (complementary)',
        falseNegativeRateDisplay: 'Suppressed (complementary)',
        genomicAccelerationShare: 'Suppressed (complementary)',
        familyHistoryAccelerationShare: 'Suppressed (complementary)',
      };
    }

    const isSmallSample = seg.totalEligible >= 10 && seg.totalEligible <= 29;
    const reachWilson = computeWilson95(seg.evaluatedComplete, seg.totalEligible);
    const recommendationRateWilson = computeWilson95(seg.recommendedCount, seg.evaluatedComplete);
    const adoptionRateWilson = computeWilson95(seg.confirmedVisitsCount, seg.invitedCount);

    // Anti-deception rule: < 5 events -> "Insufficient events"
    const fpDisplay =
      seg.falsePositives < 5
        ? 'Insufficient events (< 5)'
        : `${computeWilson95(seg.falsePositives, seg.falsePositives + seg.trueNegatives).proportion}% [${
            computeWilson95(seg.falsePositives, seg.falsePositives + seg.trueNegatives).lower
          }–${computeWilson95(seg.falsePositives, seg.falsePositives + seg.trueNegatives).upper}%]`;

    const fnDisplay =
      seg.falseNegatives < 5
        ? 'Insufficient events (< 5)'
        : `${computeWilson95(seg.falseNegatives, seg.falseNegatives + seg.truePositives).proportion}% [${
            computeWilson95(seg.falseNegatives, seg.falseNegatives + seg.truePositives).lower
          }–${computeWilson95(seg.falseNegatives, seg.falseNegatives + seg.truePositives).upper}%]`;

    const totalAcc = Math.max(1, seg.recommendedCount);
    const genShare = `${Math.round((seg.genomicAccCount / totalAcc) * 100)}%`;
    const famShare = `${Math.round((seg.familyAccCount / totalAcc) * 100)}%`;

    return {
      segmentId: seg.segmentId,
      dimension: seg.dimension,
      segmentLabel: seg.segmentLabel,
      totalEligible: seg.totalEligible,
      evaluatedComplete: seg.evaluatedComplete,
      levelGreyCount: seg.levelGreyCount,
      recommendedCount: seg.recommendedCount,
      invitedCount: seg.invitedCount,
      confirmedVisitsCount: seg.confirmedVisitsCount,
      suppressedStatus: isSmallSample ? 'small_sample' : 'visible',
      displayNote: isSmallSample ? 'Small sample (10–29): no comparative conclusion' : null,
      reachWilson,
      recommendationRateWilson,
      adoptionRateWilson,
      falsePositiveRateDisplay: fpDisplay,
      falseNegativeRateDisplay: fnDisplay,
      genomicAccelerationShare: genShare,
      familyHistoryAccelerationShare: famShare,
    };
  });
}
