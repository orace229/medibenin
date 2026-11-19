import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReminderPlan, buildScreeningPlan } from './screeningPlan.ts';
import { validateM2MessageSafety } from './mlLogistics.ts';

const ADULT = {
  ageYears: 45,
  ageMonths: 540,
  sex: 'female',
  pathwayType: 'adult',
  clinicalProfile: {
    provenanceMap: { bp: 'M' },
    oldestMeasureMonths: 0,
  } as Record<string, any>,
};

function flag(overrides: Partial<any> = {}) {
  return {
    ruleId: 'A1',
    flagType: 'elevated_risk' as const,
    level: 'orange' as const,
    title: 'Blood pressure follow-up',
    factors: ['Two readings above the target zone.'],
    sourceLabel: 'WHO HEARTS Technical Package',
    missingData: [],
    dueDate: 'Within 14 days',
    certainty: 'high' as const,
    certaintyReason: 'Two measurements',
    isEclipseSuspended: false,
    ...overrides,
  };
}

test('planner: a routine plan is generated for an adult with no recorded screenings', () => {
  const plan = buildScreeningPlan({
    patient: ADULT,
    flags: [],
    recommendation: { dueDate: '2026-11-28', state: 'validated' },
    locale: 'en',
    today: '2026-11-20',
  });

  assert.ok(plan.items.length >= 5);
  assert.ok(plan.items.some((item) => item.ruleId === 'A5'));
  assert.ok(plan.items.some((item) => item.ruleId === 'A6'));
  assert.ok(plan.items.some((item) => item.ruleId === 'A7'));
  assert.ok(plan.summary.needsData >= 3);
  assert.ok(plan.nextAction);
  assert.notEqual(plan.nextAction?.status, 'up_to_date');
});

test('planner: missing data becomes needs_data, never a false up_to_date', () => {
  const plan = buildScreeningPlan({
    patient: { ...ADULT, sex: 'male' },
    flags: [
      flag({
        ruleId: 'GREY',
        level: 'grey',
        title: 'Insufficient data',
        dueDate: 'Within 30 days',
      }),
    ],
    recommendation: { dueDate: '2026-11-28', state: 'created' },
    locale: 'en',
    today: '2026-11-20',
  });

  const grey = plan.items.find((item) => item.ruleId === 'GREY');
  assert.equal(grey?.status, 'needs_data');
  assert.equal(grey?.level, 'grey');
  assert.equal(plan.summary.upToDate, 0);
});

test('planner: a red flag is overdue and becomes the next action', () => {
  const plan = buildScreeningPlan({
    patient: ADULT,
    flags: [
      flag({
        ruleId: 'E0',
        level: 'red',
        title: 'Emergency escape',
        dueDate: 'Immediate (Same day)',
      }),
    ],
    recommendation: { dueDate: '2026-11-28', state: 'created' },
    locale: 'fr',
    today: '2026-11-20',
  });

  assert.equal(plan.nextAction?.ruleId, 'E0');
  assert.equal(plan.nextAction?.status, 'overdue');
  assert.match(plan.nextAction?.dueLabel || '', /retard/i);
});

test('planner: a current IFHAS interval is upcoming and uses the versioned interval', () => {
  const plan = buildScreeningPlan({
    patient: {
      ...ADULT,
      clinicalProfile: { ...ADULT.clinicalProfile, monthsSinceLastIfhas: 6 },
    },
    flags: [],
    recommendation: { dueDate: '2026-11-28', state: 'validated' },
    locale: 'en',
    today: '2026-11-20',
  });

  const ifhas = plan.items.find((item) => item.ruleId === 'A8');
  assert.ok(ifhas);
  assert.equal(ifhas?.status, 'upcoming');
  assert.equal(ifhas?.intervalMonths, 12);
  assert.ok(ifhas?.targetDate && ifhas.targetDate > '2027-01-01');
});

test('planner: child WCV schedule is derived from the age milestones', () => {
  const plan = buildScreeningPlan({
    patient: {
      ageYears: 1,
      ageMonths: 18,
      sex: 'male',
      pathwayType: 'child',
      clinicalProfile: { provenanceMap: {} },
    },
    flags: [],
    recommendation: { dueDate: '2026-12-01', state: 'created' },
    locale: 'en',
    today: '2026-11-20',
  });

  const wcv = plan.items.find((item) => item.ruleId === 'P3');
  assert.ok(wcv);
  assert.equal(wcv?.status, 'needs_data');
  assert.ok(wcv?.targetDate && wcv.targetDate > '2026-11-20');
});

test('reminders: consent withdrawal disables all reminders', () => {
  const plan = buildReminderPlan({
    patient: { displayName: 'Tariq', preferredChannel: 'WhatsApp', facilityCenter: 'Centre' },
    recommendation: { dueDate: '2026-11-28', state: 'scheduled', pathwayTitle: 'Visit' },
    notifications: [],
    consentEnabled: false,
    today: '2026-11-20',
  });

  assert.equal(plan.canSend, false);
  assert.ok(plan.safetyMessage);
  assert.equal(plan.upcomingReminders.length, 0);
});

test('reminders: upcoming visit proposes D-7, D-3, D-1 and D0 safely', () => {
  const plan = buildReminderPlan({
    patient: { displayName: 'Tariq', preferredChannel: 'WhatsApp', facilityCenter: 'Centre' },
    recommendation: {
      dueDate: '2026-11-28',
      state: 'scheduled',
      pathwayTitle: 'Preventive visit',
      facilityName: 'Al Bateen',
      remindersSentCount: 0,
    },
    notifications: [],
    consentEnabled: true,
    today: '2026-11-20',
  });

  assert.equal(plan.canSend, true);
  assert.equal(plan.appointment?.status, 'upcoming');
  assert.deepEqual(
    plan.upcomingReminders.map((r) => r.label),
    ['D-7', 'D-3', 'D-1', 'Visit day']
  );
  for (const slot of plan.upcomingReminders) {
    assert.equal(slot.safetyCheckPassed, true);
    assert.equal(validateM2MessageSafety(slot.message).valid, true);
  }
});

test('reminders: a missed visit proposes J+1, J+3 and J+7 without diagnostic terms', () => {
  const plan = buildReminderPlan({
    patient: { displayName: 'Layla', preferredChannel: 'SMS', facilityCenter: 'Centre' },
    recommendation: {
      dueDate: '2026-11-10',
      state: 'scheduled',
      pathwayTitle: 'Preventive visit',
      remindersSentCount: 1,
    },
    notifications: [],
    consentEnabled: true,
    today: '2026-11-20',
  });

  assert.equal(plan.appointment?.status, 'missed');
  assert.equal(plan.canSend, true);
  assert.equal(plan.missedReminders.length, 3);
  for (const slot of plan.missedReminders) {
    assert.equal(validateM2MessageSafety(slot.message).valid, true);
    assert.equal(/diagnos|score|percentile|mutation/i.test(slot.message), false);
  }
});

test('reminders: a refused visit stops every reminder immediately', () => {
  const plan = buildReminderPlan({
    patient: { displayName: 'Tariq', preferredChannel: 'WhatsApp', facilityCenter: 'Centre' },
    recommendation: {
      dueDate: '2026-11-28',
      state: 'refused',
      pathwayTitle: 'Preventive visit',
    },
    notifications: [],
    consentEnabled: true,
    today: '2026-11-20',
  });

  assert.equal(plan.canSend, false);
  assert.equal(plan.upcomingReminders.length, 0);
  assert.equal(plan.missedReminders.length, 0);
  assert.match(plan.safetyMessage || '', /refus|declin/i);
});

test('reminders: the configured reminder limit is enforced', () => {
  const plan = buildReminderPlan({
    patient: { displayName: 'Tariq', preferredChannel: 'WhatsApp', facilityCenter: 'Centre' },
    recommendation: {
      dueDate: '2026-11-28',
      state: 'scheduled',
      pathwayTitle: 'Preventive visit',
      remindersSentCount: 2,
    },
    notifications: [],
    consentEnabled: true,
    today: '2026-11-20',
    maxReminders: 2,
  });

  assert.equal(plan.canSend, false);
  assert.match(plan.safetyMessage || '', /limite|limit/i);
});
