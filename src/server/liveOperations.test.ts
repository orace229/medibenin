import test from 'node:test';
import assert from 'node:assert/strict';
import { computeLiveOperations } from './liveOperations.ts';

const now = new Date('2026-11-19T12:00:00.000Z');

const patients = [
  { id: 'p1', pathwayType: 'adult', overallLevel: 'orange' },
  { id: 'p2', pathwayType: 'adult', overallLevel: 'red' },
  { id: 'p3', pathwayType: 'child', overallLevel: 'yellow' },
  { id: 'p4', pathwayType: 'adult', overallLevel: 'grey' },
  { id: 'p5', pathwayType: 'adult', overallLevel: 'green' },
  { id: 'p6', pathwayType: 'child', overallLevel: 'orange' },
];

const recommendations = [
  {
    patientId: 'p1',
    state: 'done',
    level: 'orange',
    dueDate: '2026-11-05',
    scheduledDate: '2026-11-10',
    updatedAt: '2026-11-12T09:00:00.000Z',
    remindersSentCount: 2,
  },
  {
    patientId: 'p2',
    state: 'refused',
    level: 'red',
    dueDate: '2026-11-01',
    scheduledDate: null,
    updatedAt: '2026-11-03T09:00:00.000Z',
    remindersSentCount: 1,
  },
  {
    patientId: 'p3',
    state: 'invited',
    level: 'yellow',
    dueDate: '2026-11-01',
    scheduledDate: null,
    updatedAt: '2026-11-02T09:00:00.000Z',
    remindersSentCount: 0,
  },
  {
    patientId: 'p4',
    state: 'created',
    level: 'grey',
    dueDate: '2026-11-01',
    scheduledDate: null,
    updatedAt: '2026-11-01T09:00:00.000Z',
    remindersSentCount: 0,
  },
  {
    patientId: 'p5',
    state: 'validated',
    level: 'green',
    dueDate: '2027-01-01',
    scheduledDate: null,
    updatedAt: '2026-11-04T09:00:00.000Z',
    remindersSentCount: 0,
  },
  {
    patientId: 'p6',
    state: 'scheduled',
    level: 'orange',
    dueDate: '2026-12-30',
    scheduledDate: '2026-11-25',
    updatedAt: '2026-11-05T09:00:00.000Z',
    remindersSentCount: 0,
  },
];

const notifications = [
  { patientId: 'p1', channel: 'WhatsApp', sentAt: '2026-11-08 10:00' },
  { patientId: 'p1', channel: 'App', sentAt: '2026-11-09 10:00' },
  { patientId: 'p2', channel: 'SMS', sentAt: '2026-11-02 10:00' },
];

const consents = [
  {
    patientId: 'p1',
    evaluationAndCalendar: true,
    channelReminders: true,
    shareWithFacility: true,
    anonymousStatistics: true,
  },
  {
    patientId: 'p2',
    evaluationAndCalendar: true,
    channelReminders: false,
    shareWithFacility: true,
    anonymousStatistics: true,
  },
];

const flags = [
  { patientId: 'p1', level: 'orange' },
  { patientId: 'p2', level: 'red' },
  { patientId: 'p3', level: 'yellow' },
  { patientId: 'p4', level: 'yellow' },
  { patientId: 'p6', level: 'orange' },
];

const snapshot = computeLiveOperations({
  patients,
  recommendations,
  notifications,
  consents,
  flags,
  now,
});

test('live operations: funnel is monotonic and excludes grey patients from risk steps', () => {
  const byKey = Object.fromEntries(snapshot.funnel.map((step) => [step.key, step]));
  assert.equal(byKey.cohort.count, 6);
  assert.equal(byKey.evaluated.count, 5);
  assert.equal(byKey.flagged.count, 4); // p4 is grey, p5 has no flag
  assert.equal(byKey.validated.count, 4);
  assert.equal(byKey.invited.count, 4);
  assert.equal(byKey.responded.count, 3); // done, refused, scheduled
  assert.equal(byKey.completed.count, 1);

  const counts = snapshot.funnel.map((step) => step.count);
  for (let i = 1; i < counts.length; i += 1) {
    assert.ok(counts[i] <= counts[i - 1], `funnel step ${i} must not exceed the previous step`);
  }
});

test('live operations: outcomes and overdue cases are computed independently of the funnel', () => {
  assert.equal(snapshot.outcomes.completedVisits, 1);
  assert.equal(snapshot.outcomes.informedRefusals, 1);
  assert.equal(snapshot.outcomes.scheduledNotYetCompleted, 1);
  // p3 is past due and still invited; p6 is scheduled for a future due date.
  assert.equal(snapshot.outcomes.openCasesPastDue, 2);
});

test('live operations: closure-time median is a documented proxy', () => {
  assert.equal(snapshot.timeToClosure.metric, 'days_from_scheduled_visit_to_last_update');
  assert.equal(snapshot.timeToClosure.completedCases, 1);
  assert.equal(snapshot.timeToClosure.medianDays, 2.4);
  assert.equal(snapshot.methodology.closureTimeIsProxy, true);
});

test('live operations: reminder and consent aggregates are correct', () => {
  assert.equal(snapshot.reminders.totalNotifications, 3);
  assert.equal(snapshot.reminders.patientsWithNotification, 2);
  assert.equal(snapshot.reminders.totalRemindersSentCount, 3);
  assert.equal(snapshot.reminders.patientsWithReminders, 2);
  assert.deepEqual(snapshot.reminders.byChannel, [
    { channel: 'App', count: 1 },
    { channel: 'SMS', count: 1 },
    { channel: 'WhatsApp', count: 1 },
  ]);
  // Missing consent rows default to opt-in; p2 explicitly withdrew reminders.
  assert.equal(snapshot.consentCoverage.evaluationAndCalendar, 100);
  assert.equal(snapshot.consentCoverage.channelReminders, 83.3);
});

test('live operations: no patient identifier leaks into the aggregate payload', () => {
  const serialized = JSON.stringify(snapshot);
  for (const patient of patients) {
    assert.ok(!serialized.includes(patient.id), `payload must not contain ${patient.id}`);
  }
  // Recommendation HMACs and free-text are not part of the input, but guard the shape anyway.
  assert.ok(!serialized.includes('referralCodeHmac'));
});
