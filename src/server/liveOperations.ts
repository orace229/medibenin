/**
 * Live pathway operations (aggregate, de-identified).
 *
 * This computes operational funnel metrics from the *current database*, as
 * opposed to the synthetic benchmark in `benchmarkEngine.ts`. It is deliberately
 * pure (no database access) so it can be unit-tested and reused by the public
 * health observatory.
 *
 * Privacy rules:
 *  - only aggregates leave this module; no patient identifiers are returned;
 *  - the UI labels the source as the demo database.
 *
 * Measurement caveat:
 *  - `recommendations` has no `created_at` column, so time-to-closure is a
 *    proxy measured from the scheduled visit date to the last state update.
 *    This is exposed explicitly in `methodology`.
 */

import { computeWilson95 } from '../lib/wilson.ts';

export interface LiveOpsPatientRow {
  id: string;
  pathwayType: string;
  overallLevel: string;
}

export interface LiveOpsRecommendationRow {
  patientId: string;
  state: string;
  level: string;
  dueDate: string;
  scheduledDate: string | null;
  updatedAt: Date | string | null;
  remindersSentCount: number;
}

export interface LiveOpsNotificationRow {
  patientId: string;
  channel: string;
  sentAt: string;
}

export interface LiveOpsConsentRow {
  patientId: string;
  evaluationAndCalendar: boolean;
  channelReminders: boolean;
  shareWithFacility: boolean;
  anonymousStatistics: boolean;
}

export interface LiveOpsFlagRow {
  patientId: string;
  level: string;
}

export interface LiveOpsInput {
  patients: LiveOpsPatientRow[];
  recommendations: LiveOpsRecommendationRow[];
  notifications: LiveOpsNotificationRow[];
  consents: LiveOpsConsentRow[];
  flags: LiveOpsFlagRow[];
  now?: Date;
}

export interface LiveOpsFunnelStep {
  key: 'cohort' | 'evaluated' | 'flagged' | 'validated' | 'invited' | 'responded' | 'completed';
  count: number;
  total: number;
  ratePct: number;
  wilson: { proportion: number; lower: number; upper: number };
  /** Conversion from the previous funnel step (null for the first step). */
  conversionFromPreviousPct: number | null;
}

export interface LiveOperationsSnapshot {
  generatedAt: string;
  cohort: {
    totalPatients: number;
    adults: number;
    childrenOrAdolescents: number;
    evaluated: number;
    grey: number;
  };
  funnel: LiveOpsFunnelStep[];
  outcomes: {
    completedVisits: number;
    informedRefusals: number;
    scheduledNotYetCompleted: number;
    openCasesPastDue: number;
  };
  stateBreakdown: Array<{ state: string; count: number }>;
  timeToClosure: {
    metric: 'days_from_scheduled_visit_to_last_update';
    medianDays: number | null;
    completedCases: number;
  };
  reminders: {
    totalNotifications: number;
    patientsWithNotification: number;
    totalRemindersSentCount: number;
    patientsWithReminders: number;
    byChannel: Array<{ channel: string; count: number }>;
  };
  consentCoverage: {
    evaluationAndCalendar: number;
    channelReminders: number;
    shareWithFacility: number;
    anonymousStatistics: number;
  };
  methodology: {
    source: 'demo_database';
    closureTimeIsProxy: true;
    consentDefaultsApplied: true;
    syntheticSeedData: true;
    notes: string[];
  };
}

const INVITED_STATES = ['invited', 'scheduled', 'postponed', 'overdue', 'done', 'refused'];
const RESPONDED_STATES = ['scheduled', 'postponed', 'done', 'refused'];
const COMPLETED_STATES = ['done'];

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? round1((sorted[mid - 1] + sorted[mid]) / 2)
    : round1(sorted[mid]);
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayDiff(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / 86_400_000;
}

function latestRecommendationByPatient(
  recommendations: LiveOpsRecommendationRow[]
): Map<string, LiveOpsRecommendationRow> {
  const latest = new Map<string, LiveOpsRecommendationRow>();
  for (const rec of recommendations) {
    const current = latest.get(rec.patientId);
    if (!current) {
      latest.set(rec.patientId, rec);
      continue;
    }
    const currentDate = toDate(current.updatedAt)?.getTime() ?? 0;
    const nextDate = toDate(rec.updatedAt)?.getTime() ?? 0;
    if (nextDate >= currentDate) latest.set(rec.patientId, rec);
  }
  return latest;
}

function buildStep(
  key: LiveOpsFunnelStep['key'],
  count: number,
  total: number,
  previousCount: number | null
): LiveOpsFunnelStep {
  const wilson = computeWilson95(count, total);
  return {
    key,
    count,
    total,
    ratePct: wilson.proportion,
    wilson,
    conversionFromPreviousPct:
      previousCount === null || previousCount === 0
        ? null
        : round1((count / previousCount) * 100),
  };
}

export function computeLiveOperations(input: LiveOpsInput): LiveOperationsSnapshot {
  const now = input.now ?? new Date();
  const today = now.toISOString().slice(0, 10);
  const totalPatients = input.patients.length;
  const evaluated = input.patients.filter((p) => p.overallLevel !== 'grey').length;
  const grey = input.patients.filter((p) => p.overallLevel === 'grey').length;

  const evaluatedIds = new Set(
    input.patients.filter((p) => p.overallLevel !== 'grey').map((p) => p.id)
  );
  const flaggedIds = new Set(
    input.flags.map((f) => f.patientId).filter((id) => evaluatedIds.has(id))
  );
  const latestRecs = latestRecommendationByPatient(input.recommendations);

  let validated = 0;
  let invited = 0;
  let responded = 0;
  let completed = 0;
  let informedRefusals = 0;
  let scheduledNotYetCompleted = 0;
  let openCasesPastDue = 0;
  let completedWithTiming = 0;
  const daysFromScheduledToUpdate: number[] = [];
  const stateCounts = new Map<string, number>();

  for (const [patientId, rec] of latestRecs.entries()) {
    stateCounts.set(rec.state, (stateCounts.get(rec.state) || 0) + 1);
    const inFunnel = flaggedIds.has(patientId);

    if (inFunnel && rec.state !== 'created') validated += 1;
    if (inFunnel && INVITED_STATES.includes(rec.state)) invited += 1;
    if (inFunnel && RESPONDED_STATES.includes(rec.state)) responded += 1;
    if (inFunnel && COMPLETED_STATES.includes(rec.state)) completed += 1;

    if (rec.state === 'refused') informedRefusals += 1;
    if (rec.state === 'scheduled') scheduledNotYetCompleted += 1;
    if (
      rec.dueDate &&
      rec.dueDate < today &&
      !COMPLETED_STATES.includes(rec.state) &&
      rec.state !== 'refused'
    ) {
      openCasesPastDue += 1;
    }

    if (rec.state === 'done') {
      const scheduled = toDate(rec.scheduledDate);
      const updated = toDate(rec.updatedAt);
      if (scheduled && updated) {
        const diff = dayDiff(scheduled, updated);
        if (diff >= 0) {
          completedWithTiming += 1;
          daysFromScheduledToUpdate.push(diff);
        }
      }
    }
  }

  const funnel: LiveOpsFunnelStep[] = [
    buildStep('cohort', totalPatients, totalPatients, null),
    buildStep('evaluated', evaluated, totalPatients, totalPatients),
    buildStep('flagged', flaggedIds.size, totalPatients, evaluated),
    buildStep('validated', validated, totalPatients, flaggedIds.size),
    buildStep('invited', invited, totalPatients, validated),
    buildStep('responded', responded, totalPatients, invited),
    buildStep('completed', completed, totalPatients, responded),
  ];

  const channelCounts = new Map<string, number>();
  const patientsWithNotification = new Set<string>();
  for (const notification of input.notifications) {
    channelCounts.set(notification.channel, (channelCounts.get(notification.channel) || 0) + 1);
    patientsWithNotification.add(notification.patientId);
  }

  const patientsWithReminders = [...latestRecs.values()].filter(
    (rec) => rec.remindersSentCount > 0
  ).length;
  const totalRemindersSentCount = [...latestRecs.values()].reduce(
    (sum, rec) => sum + (rec.remindersSentCount || 0),
    0
  );

  const consentByPatient = new Map(input.consents.map((c) => [c.patientId, c]));
  const consentCount = (key: keyof Omit<LiveOpsConsentRow, 'patientId'>) =>
    input.patients.filter((p) => {
      const consent = consentByPatient.get(p.id);
      // Missing consent rows default to the application's opt-in defaults.
      return consent ? Boolean(consent[key]) : true;
    }).length;
  const consentPct = (value: number) =>
    totalPatients === 0 ? 0 : round1((value / totalPatients) * 100);

  const stateBreakdown = [...stateCounts.entries()]
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));

  return {
    generatedAt: now.toISOString(),
    cohort: {
      totalPatients,
      adults: input.patients.filter((p) => p.pathwayType === 'adult').length,
      childrenOrAdolescents: input.patients.filter((p) => p.pathwayType !== 'adult').length,
      evaluated,
      grey,
    },
    funnel,
    outcomes: {
      completedVisits: completed,
      informedRefusals,
      scheduledNotYetCompleted,
      openCasesPastDue,
    },
    stateBreakdown,
    timeToClosure: {
      metric: 'days_from_scheduled_visit_to_last_update',
      medianDays: median(daysFromScheduledToUpdate),
      completedCases: completedWithTiming,
    },
    reminders: {
      totalNotifications: input.notifications.length,
      patientsWithNotification: patientsWithNotification.size,
      totalRemindersSentCount,
      patientsWithReminders,
      byChannel: [...channelCounts.entries()]
        .map(([channel, count]) => ({ channel, count }))
        .sort((a, b) => b.count - a.count || a.channel.localeCompare(b.channel)),
    },
    consentCoverage: {
      evaluationAndCalendar: consentPct(consentCount('evaluationAndCalendar')),
      channelReminders: consentPct(consentCount('channelReminders')),
      shareWithFacility: consentPct(consentCount('shareWithFacility')),
      anonymousStatistics: consentPct(consentCount('anonymousStatistics')),
    },
    methodology: {
      source: 'demo_database',
      closureTimeIsProxy: true,
      consentDefaultsApplied: true,
      syntheticSeedData: true,
      notes: [
        'Aggregates only: no patient identifiers are returned by this endpoint.',
        'Closure time is a proxy: the latest state-update timestamp minus the scheduled visit date.',
        'Missing consent rows are counted with the application opt-in defaults.',
        'The database is seeded with synthetic personas; this is not a live clinical deployment.',
      ],
    },
  };
}
