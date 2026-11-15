/**
 * Exigence 4 & 5: Local Population Safeguards & Outcome-based Evaluation
 * - 95% Wilson Confidence Intervals on every proportion
 * - Primary small-cell suppression (n < 10 -> "Suppressed (n < 10)")
 * - Secondary complementary suppression on the smallest neighbor in the same row/column
 * - Small sample notice for 10 <= n <= 29 ("Small sample: no conclusion")
 * - Insufficient events notice (< 5 events -> "Insufficient events")
 * - Community & Equity Alerts (C1, C3, C4)
 *
 * All numeric safeguard thresholds (min cell, small-sample band, insufficient-events
 * floor, Wilson z) are read from the versioned privacy thresholds document
 * (src/config/thresholds/privacy.v1.json) via src/server/thresholds.ts — §9.2.
 */

import { PRIVACY_THRESHOLDS } from './thresholds.ts';
import { computeWilson95, type WilsonInterval } from '../lib/wilson.ts';

export { computeWilson95 };
export type { WilsonInterval };

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
  // 1. Identify primary suppressed segments (n < minCellSize)
  const primarySuppressedIds = new Set<string>();
  for (const seg of rawSegments) {
    if (seg.totalEligible < PRIVACY_THRESHOLDS.minCellSize) {
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
    const primaries = list.filter((s) => primarySuppressedIds.has(s.segmentId));
    if (primaries.length === 0) continue;
    // For every primary cell, suppress the smallest non-primary neighbor in
    // the same dimension. With several primary cells, one neighbor each is
    // needed to prevent reconstruction of the primary values.
    const candidates = list
      .filter((s) => !primarySuppressedIds.has(s.segmentId))
      .sort((a, b) => a.totalEligible - b.totalEligible);
    let candidateIndex = 0;
    for (let i = 0; i < primaries.length; i++) {
      while (
        candidateIndex < candidates.length &&
        secondarySuppressedIds.has(candidates[candidateIndex].segmentId)
      ) {
        candidateIndex++;
      }
      if (candidateIndex < candidates.length) {
        secondarySuppressedIds.add(candidates[candidateIndex].segmentId);
        candidateIndex++;
      }
    }
  }

  // 3. Build masked output rows
  const wilson = (successes: number, total: number) =>
    computeWilson95(successes, total, PRIVACY_THRESHOLDS.wilsonZ);

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

    const isSmallSample =
      seg.totalEligible >= PRIVACY_THRESHOLDS.smallSampleMinSize && seg.totalEligible <= PRIVACY_THRESHOLDS.smallSampleMaxSize;
    const reachWilson = wilson(seg.evaluatedComplete, seg.totalEligible);
    const recommendationRateWilson = wilson(seg.recommendedCount, seg.evaluatedComplete);
    const adoptionRateWilson = wilson(seg.confirmedVisitsCount, seg.invitedCount);

    // Anti-deception rule: < insufficientEventsThreshold events -> "Insufficient events"
    const fpDisplay =
      seg.falsePositives < PRIVACY_THRESHOLDS.insufficientEventsThreshold
        ? `Insufficient events (< ${PRIVACY_THRESHOLDS.insufficientEventsThreshold})`
        : `${wilson(seg.falsePositives, seg.falsePositives + seg.trueNegatives).proportion}% [${
            wilson(seg.falsePositives, seg.falsePositives + seg.trueNegatives).lower
          }–${wilson(seg.falsePositives, seg.falsePositives + seg.trueNegatives).upper}%]`;

    const fnDisplay =
      seg.falseNegatives < PRIVACY_THRESHOLDS.insufficientEventsThreshold
        ? `Insufficient events (< ${PRIVACY_THRESHOLDS.insufficientEventsThreshold})`
        : `${wilson(seg.falseNegatives, seg.falseNegatives + seg.truePositives).proportion}% [${
            wilson(seg.falseNegatives, seg.falseNegatives + seg.truePositives).lower
          }–${wilson(seg.falseNegatives, seg.falseNegatives + seg.truePositives).upper}%]`;

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
