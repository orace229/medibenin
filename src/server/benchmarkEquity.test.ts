import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCommunityAlerts } from './benchmarkEngine.ts';

function person(overrides: Record<string, any> = {}) {
  return {
    id: 'P',
    ageYears: 50,
    ageMonths: 600,
    sex: 'male',
    pathwayType: 'adult',
    nationalityGroup: 'Emirati',
    region: 'Abu Dhabi',
    language: 'en',
    languageNeedsSupport: false,
    channel: 'WhatsApp',
    accessTimeMinutes: 20,
    ageBand: '40–64 years',
    consentGenomic: false,
    clinicalProfile: {},
    truth: { hasTrueNeed: true },
    overallLevel: 'orange',
    recommended: true,
    invitedMediSense: true,
    attendedMediSense: false,
    ...overrides,
  } as any;
}

function segment(overrides: Record<string, any>) {
  return {
    segmentId: 'S',
    dimension: 'Nationality Group',
    segmentLabel: 'S',
    totalEligible: 50,
    evaluatedComplete: 50,
    levelGreyCount: 0,
    recommendedCount: 50,
    invitedCount: 50,
    confirmedVisitsCount: 0,
    falsePositives: 0,
    trueNegatives: 0,
    falseNegatives: 0,
    truePositives: 0,
    genomicAccCount: 0,
    familyAccCount: 0,
    ...overrides,
  } as any;
}

test('C3: a nationality segment more than 10 points below pooled adoption triggers an alert', () => {
  const people = [
    ...Array.from({ length: 50 }, (_, i) =>
      person({
        id: `SA-${i}`,
        nationalityGroup: 'South Asia',
        invitedMediSense: true,
        attendedMediSense: i < 10, // 10/50 = 20% adoption
      })
    ),
    ...Array.from({ length: 50 }, (_, i) =>
      person({
        id: `EM-${i}`,
        nationalityGroup: 'Emirati',
        invitedMediSense: true,
        attendedMediSense: true, // 50/50 = 100%
      })
    ),
  ];
  const result = computeCommunityAlerts(
    [
      segment({
        segmentId: 'NAT-SA',
        segmentLabel: 'South Asia',
        totalEligible: 50,
        invitedCount: 50,
        confirmedVisitsCount: 10,
      }),
      segment({
        segmentId: 'NAT-EM',
        segmentLabel: 'Emirati',
        totalEligible: 50,
        invitedCount: 50,
        confirmedVisitsCount: 50,
      }),
    ],
    people
  );
  assert.ok(result.alerts.some((a) => a.ruleId === 'C3' && a.zoneOrSegment === 'South Asia'));
});

test('C4: a small-cell false-negative cluster is never disclosed', () => {
  const result = computeCommunityAlerts(
    [
      segment({
        segmentId: 'NAT-TINY',
        segmentLabel: 'Tiny',
        totalEligible: 7,
        invitedCount: 7,
        falseNegatives: 5,
        truePositives: 0,
      }),
      segment({
        segmentId: 'NAT-LARGE',
        segmentLabel: 'Large',
        totalEligible: 100,
        invitedCount: 100,
        falseNegatives: 0,
        truePositives: 100,
      }),
    ],
    [person({ recommended: true, truth: { hasTrueNeed: true } })]
  );
  assert.equal(result.alerts.some((a) => a.ruleId === 'C4' && a.zoneOrSegment === 'Tiny'), false);
});

test('C4: a large segment with a high FN rate still triggers the governance alert', () => {
  const result = computeCommunityAlerts(
    [
      segment({
        segmentId: 'NAT-LARGE-FN',
        segmentLabel: 'Large FN',
        totalEligible: 100,
        invitedCount: 100,
        falseNegatives: 20,
        truePositives: 10,
      }),
    ],
    Array.from({ length: 100 }, (_, i) =>
      person({
        id: `FN-${i}`,
        recommended: i < 80,
        truth: { hasTrueNeed: true },
      })
    )
  );
  assert.ok(result.alerts.some((a) => a.ruleId === 'C4' && a.zoneOrSegment === 'Large FN'));
});