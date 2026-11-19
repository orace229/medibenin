/**
 * Personalized screening planner & smart reminder assistant (pure helpers).
 *
 * These functions contain no database access so they can be unit-tested and
 * reused by both the patient portal and the clinician/coordinator workspaces.
 *
 * Design principles:
 *  - Missing data is never interpreted as "healthy": an unknown last screening
 *    produces a `needs_data` item, not an `up_to_date` one.
 *  - The planner never invents a diagnosis. It surfaces the signed-rule flags
 *    and the routine intervals from the versioned care-schedule document.
 *  - Reminder messages go through the M2 safety validator: no diagnostic,
 *    score, or genetic term reaches a family.
 */

import type { EvaluatedFlag } from './rulesEngine.ts';
import { CARE_SCHEDULES } from './careSchedules.ts';
import { validateM2MessageSafety } from './mlLogistics.ts';

export type Locale = 'en' | 'fr' | 'ar';

export type PlanStatus =
  | 'overdue'
  | 'needs_data'
  | 'due_soon'
  | 'upcoming'
  | 'up_to_date';

export type PlanCategory =
  | 'cardiometabolic'
  | 'cancer'
  | 'comprehensive'
  | 'pediatric'
  | 'immunization'
  | 'maternal'
  | 'genomic'
  | 'safety';

export interface ScreeningPlanItem {
  id: string;
  ruleId: string | null;
  title: string;
  category: PlanCategory;
  source: string;
  level: string;
  status: PlanStatus;
  targetDate: string | null;
  dueLabel: string;
  intervalMonths: number | null;
  lastDoneLabel: string | null;
  rationale: string;
  action: string;
  /** True when the item is a routine interval (not a raised rule flag). */
  routine: boolean;
}

export interface ScreeningPlan {
  generatedAt: string;
  horizonMonths: number;
  items: ScreeningPlanItem[];
  summary: {
    overdue: number;
    needsData: number;
    dueSoon: number;
    upcoming: number;
    upToDate: number;
  };
  nextAction: ScreeningPlanItem | null;
}

export interface ScreeningPlanPatient {
  ageYears: number;
  ageMonths: number;
  sex: string;
  pathwayType: string;
  clinicalProfile: Record<string, any>;
}

export interface ScreeningPlanRecommendation {
  dueDate?: string | null;
  state?: string;
  facilityName?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function todayIso(today?: string): string {
  if (today && /^\d{4}-\d{2}-\d{2}/.test(today)) return today.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function isoFromParts(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function addMonthsClamped(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const firstOfTarget = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, 0)
  ).getUTCDate();
  return isoFromParts(
    firstOfTarget.getUTCFullYear(),
    firstOfTarget.getUTCMonth(),
    Math.min(d, lastDay)
  );
}

function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS
  );
}

function windowToDays(label?: string | null): number {
  if (!label) return 30;
  const lower = label.toLowerCase();
  if (lower.includes('immediate') || lower.includes('same day')) return 0;
  const weeks = /within (\d+) weeks?/.exec(lower);
  if (weeks) return Number(weeks[1]) * 7;
  const days = /within (\d+) days?/.exec(lower);
  if (days) return Number(days[1]);
  return 30;
}

function targetFromWindow(label: string | null | undefined, today: string, fallback?: string | null): string | null {
  if (fallback && /^\d{4}-\d{2}-\d{2}/.test(fallback)) {
    if (!label || /routine/i.test(label)) return fallback.slice(0, 10);
  }
  return addDays(today, windowToDays(label));
}

function statusFor(target: string | null, today: string, level?: string): PlanStatus {
  if (level === 'red') return 'overdue';
  if (level === 'grey') return 'needs_data';
  if (!target) return 'needs_data';
  const days = daysBetween(today, target);
  if (days < 0) return 'overdue';
  if (days <= 14) return 'due_soon';
  return 'upcoming';
}

function dueLabelFor(status: PlanStatus, target: string | null, locale: Locale): string {
  switch (status) {
    case 'overdue':
      return locale === 'fr' ? 'En retard' : 'Overdue';
    case 'needs_data':
      return locale === 'fr' ? 'Données à compléter' : 'Data to complete';
    case 'due_soon':
      return locale === 'fr' ? 'À faire sous 14 jours' : 'Due within 14 days';
    case 'up_to_date':
      return locale === 'fr' ? 'À jour' : 'Up to date';
    default:
      return target
        ? locale === 'fr'
          ? `Prévu le ${target}`
          : `Planned for ${target}`
        : locale === 'fr'
        ? 'À planifier'
        : 'To schedule';
  }
}

function categoryForRule(ruleId: string | null): PlanCategory {
  if (!ruleId) return 'comprehensive';
  if (ruleId.startsWith('P')) return 'pediatric';
  if (ruleId.startsWith('G')) return 'genomic';
  if (ruleId === 'E0') return 'safety';
  if (ruleId === 'A11') return 'maternal';
  if (['A5', 'A6', 'A7'].includes(ruleId)) return 'cancer';
  if (['A8'].includes(ruleId)) return 'comprehensive';
  if (['A1', 'A2', 'A3', 'A4', 'A9'].includes(ruleId)) return 'cardiometabolic';
  return 'comprehensive';
}

const STATUS_RANK: Record<PlanStatus, number> = {
  overdue: 0,
  due_soon: 1,
  needs_data: 2,
  upcoming: 3,
  up_to_date: 4,
};

function numeric(value: any): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasBloodPressure(profile: Record<string, any>): boolean {
  return (
    numeric(profile.systolicBp1) !== null ||
    numeric(profile.systolicBp2) !== null ||
    numeric(profile.systolicBp3) !== null
  );
}

function routineItem(params: {
  id: string;
  ruleId: string | null;
  title: string;
  category: PlanCategory;
  source: string;
  targetDate: string | null;
  status: PlanStatus;
  intervalMonths: number | null;
  locale: Locale;
  rationale: string;
  action: string;
  lastDoneLabel?: string | null;
}): ScreeningPlanItem {
  return {
    id: params.id,
    ruleId: params.ruleId,
    title: params.title,
    category: params.category,
    source: params.source,
    level: params.status === 'needs_data' ? 'grey' : 'green',
    status: params.status,
    targetDate: params.targetDate,
    dueLabel: dueLabelFor(params.status, params.targetDate, params.locale),
    intervalMonths: params.intervalMonths,
    lastDoneLabel: params.lastDoneLabel ?? null,
    rationale: params.rationale,
    action: params.action,
    routine: true,
  };
}

function routineTarget(
  today: string,
  intervalMonths: number,
  monthsSince: number | null
): string | null {
  if (monthsSince === null) return null;
  const remaining = Math.max(0, intervalMonths - monthsSince);
  return addMonthsClamped(today, remaining);
}

/**
 * Builds a personalized screening plan from the signed-rule flags plus the
 * routine intervals of the versioned care-schedule document.
 */
export function buildScreeningPlan(params: {
  patient: ScreeningPlanPatient;
  flags: Array<Pick<EvaluatedFlag, 'ruleId' | 'flagType' | 'level' | 'title' | 'factors' | 'sourceLabel' | 'dueDate' | 'isEclipseSuspended'>>;
  recommendation?: ScreeningPlanRecommendation | null;
  locale?: Locale;
  today?: string;
}): ScreeningPlan {
  const locale = params.locale || 'en';
  const today = todayIso(params.today);
  const profile = params.patient.clinicalProfile || {};
  const rec = params.recommendation || null;
  const items: ScreeningPlanItem[] = [];
  const covered = new Set<string>();

  for (const flag of params.flags || []) {
    covered.add(flag.ruleId);
    const targetDate = targetFromWindow(flag.dueDate, today, rec?.dueDate);
    const status =
      flag.level === 'green'
        ? 'up_to_date'
        : statusFor(targetDate, today, flag.level);
    items.push({
      id: `FLAG-${flag.ruleId}`,
      ruleId: flag.ruleId,
      title: flag.title,
      category: categoryForRule(flag.ruleId),
      source: flag.sourceLabel,
      level: flag.level,
      status,
      targetDate,
      dueLabel: dueLabelFor(status, targetDate, locale),
      intervalMonths: null,
      lastDoneLabel: null,
      rationale: (flag.factors || []).slice(0, 2).join(' '),
      action:
        flag.level === 'red'
          ? locale === 'fr'
            ? 'Contacter immédiatement le centre de soin'
            : 'Contact the care centre immediately'
          : locale === 'fr'
          ? 'Saisir mes mesures ou planifier la visite'
          : 'Enter my measurements or schedule the visit',
      routine: false,
    });
  }

  const ageYears = Number(params.patient.ageYears) || 0;
  const ageMonths = Number(params.patient.ageMonths) || ageYears * 12;
  const sex = String(params.patient.sex || '').toLowerCase();
  const isFemale = sex === 'female';
  const isAdult = ageYears >= 18 || params.patient.pathwayType === 'adult';

  if (isAdult) {
    if (!covered.has('A1')) {
      const bpKnown = hasBloodPressure(profile);
      const oldest = numeric(profile.oldestMeasureMonths);
      const interval = 12;
      const target = bpKnown
        ? routineTarget(today, interval, oldest ?? 0)
        : null;
      const status: PlanStatus = bpKnown ? statusFor(target, today) : 'needs_data';
      items.push(
        routineItem({
          id: 'ROUTINE-A1',
          ruleId: 'A1',
          title:
            locale === 'fr'
              ? 'Contrôle de la tension artérielle'
              : 'Blood pressure check',
          category: 'cardiometabolic',
          source: 'WHO HEARTS Technical Package',
          targetDate: target,
          status,
          intervalMonths: interval,
          locale,
          rationale:
            locale === 'fr'
              ? 'Mesure annuelle de la tension, même sans symptôme.'
              : 'Annual blood pressure measurement, even without symptoms.',
          action:
            locale === 'fr'
              ? 'Saisir mes mesures à domicile'
              : 'Enter my home measurements',
          lastDoneLabel: bpKnown
            ? locale === 'fr'
              ? 'Mesure disponible dans mon dossier'
              : 'Measurement available in my record'
            : null,
        })
      );
    }

    if (!covered.has('A2') && ageYears >= 40 && ageYears <= 74) {
      const target = addMonthsClamped(today, 12);
      items.push(
        routineItem({
          id: 'ROUTINE-A2',
          ruleId: 'A2',
          title:
            locale === 'fr'
              ? 'Évaluation personnalisée du risque cardiovasculaire'
              : 'Personalized cardiovascular risk assessment',
          category: 'cardiometabolic',
          source: 'WHO 2019 CVD Risk Chart (Non-Laboratory)',
          targetDate: target,
          status: 'upcoming',
          intervalMonths: 12,
          locale,
          rationale:
            locale === 'fr'
              ? 'Réévaluation annuelle à partir de l’âge, de la tension, du tabac et de l’IMC.'
              : 'Annual reassessment from age, blood pressure, smoking and BMI.',
          action:
            locale === 'fr' ? 'Voir mon estimation actuelle' : 'View my current estimate',
        })
      );
    }

    if (!covered.has('A3')) {
      const findrisc = numeric(profile.findriscScore);
      const interval = findrisc !== null && findrisc >= 12 ? 12 : 36;
      const monthsSince = numeric(profile.monthsSinceLastGlycemicScreening);
      const target = routineTarget(today, interval, monthsSince);
      const status: PlanStatus =
        monthsSince === null ? 'needs_data' : statusFor(target, today);
      items.push(
        routineItem({
          id: 'ROUTINE-A3',
          ruleId: 'A3',
          title:
            locale === 'fr'
              ? 'Dépistage glycémique (sucre sanguin)'
              : 'Glycemic screening (blood sugar)',
          category: 'cardiometabolic',
          source: 'FINDRISC & ADA Glycemic Guidelines',
          targetDate: target,
          status,
          intervalMonths: interval,
          locale,
          rationale:
            locale === 'fr'
              ? interval === 12
                ? 'Intervalle annuel adapté à votre niveau de risque.'
                : 'Intervalle de trois ans pour un risque actuellement faible.'
              : interval === 12
              ? 'Annual interval adapted to your risk level.'
              : 'Three-year interval for a currently low risk level.',
          action:
            locale === 'fr'
              ? 'Saisir la date de mon dernier contrôle'
              : 'Enter the date of my last check',
          lastDoneLabel:
            monthsSince !== null
              ? locale === 'fr'
                ? `Dernier contrôle il y a ${monthsSince} mois`
                : `Last check ${monthsSince} months ago`
              : null,
        })
      );
    }

    if (isFemale && !covered.has('A5') && ageYears >= 21 && ageYears <= 65) {
      const interval = CARE_SCHEDULES.cervicalIntervalMonths;
      const monthsSince = numeric(profile.monthsSinceLastCervicalScreening);
      const target = routineTarget(today, interval, monthsSince);
      items.push(
        routineItem({
          id: 'ROUTINE-A5',
          ruleId: 'A5',
          title:
            locale === 'fr'
              ? 'Dépistage du col de l’utérus'
              : 'Cervical screening',
          category: 'cancer',
          source: 'National Cancer Screening Guideline',
          targetDate: target,
          status: monthsSince === null ? 'needs_data' : statusFor(target, today),
          intervalMonths: interval,
          locale,
          rationale:
            locale === 'fr'
              ? 'Dépistage périodique recommandé selon le calendrier national.'
              : 'Periodic screening recommended by the national schedule.',
          action:
            locale === 'fr'
              ? 'Planifier mon dépistage'
              : 'Schedule my screening',
        })
      );
    }

    if (isFemale && !covered.has('A6') && ageYears >= 40 && ageYears <= 74) {
      const interval = CARE_SCHEDULES.mammographyIntervalMonths;
      const monthsSince = numeric(profile.monthsSinceLastMammography);
      const target = routineTarget(today, interval, monthsSince);
      items.push(
        routineItem({
          id: 'ROUTINE-A6',
          ruleId: 'A6',
          title:
            locale === 'fr' ? 'Mammographie de dépistage' : 'Screening mammography',
          category: 'cancer',
          source: 'National Breast Screening Guideline',
          targetDate: target,
          status: monthsSince === null ? 'needs_data' : statusFor(target, today),
          intervalMonths: interval,
          locale,
          rationale:
            locale === 'fr'
              ? 'Dépistage organisé selon l’intervalle national.'
              : 'Organized screening on the national interval.',
          action:
            locale === 'fr'
              ? 'Planifier ma mammographie'
              : 'Schedule my mammography',
        })
      );
    }

    if (!covered.has('A7') && ageYears >= 45 && ageYears <= 75) {
      const interval = CARE_SCHEDULES.colorectalIntervalMonths;
      const monthsSince = numeric(profile.monthsSinceLastColorectalScreening);
      const target = routineTarget(today, interval, monthsSince);
      items.push(
        routineItem({
          id: 'ROUTINE-A7',
          ruleId: 'A7',
          title:
            locale === 'fr'
              ? 'Dépistage colorectal (FIT / coloscopie)'
              : 'Colorectal screening (FIT / colonoscopy)',
          category: 'cancer',
          source: 'National Colorectal Screening Guideline',
          targetDate: target,
          status: monthsSince === null ? 'needs_data' : statusFor(target, today),
          intervalMonths: interval,
          locale,
          rationale:
            locale === 'fr'
              ? 'Dépistage recommandé dans la tranche d’âge éligible.'
              : 'Screening recommended within the eligible age range.',
          action:
            locale === 'fr'
              ? 'Planifier mon dépistage colorectal'
              : 'Schedule my colorectal screening',
        })
      );
    }

    if (!covered.has('A8')) {
      const interval = CARE_SCHEDULES.ifhasIntervalMonths;
      const monthsSince = numeric(profile.monthsSinceLastIfhas);
      const target = routineTarget(today, interval, monthsSince);
      items.push(
        routineItem({
          id: 'ROUTINE-A8',
          ruleId: 'A8',
          title:
            locale === 'fr'
              ? 'Bilan de santé périodique complet'
              : 'Comprehensive periodic health check',
          category: 'comprehensive',
          source: 'IFHAS Comprehensive Screening',
          targetDate: target,
          status: monthsSince === null ? 'needs_data' : statusFor(target, today),
          intervalMonths: interval,
          locale,
          rationale:
            locale === 'fr'
              ? 'Regroupe les vérifications recommandées en une seule visite.'
              : 'Brings the recommended checks together in one visit.',
          action:
            locale === 'fr' ? 'Planifier mon bilan complet' : 'Schedule my comprehensive check',
        })
      );
    }
  } else {
    // Pediatric / adolescent routine pathway.
    if (!covered.has('P3')) {
      const milestones = CARE_SCHEDULES.wcvAgesMonths.filter((a) => a <= 72);
      const nextMilestone = milestones.find((a) => a > ageMonths) || null;
      const lastWcv = numeric(profile.lastWcvAgeMonths);
      const target =
        nextMilestone !== null
          ? addMonthsClamped(today, Math.max(0, nextMilestone - ageMonths))
          : null;
      items.push(
        routineItem({
          id: 'ROUTINE-P3',
          ruleId: 'P3',
          title:
            locale === 'fr'
              ? 'Prochaine visite de l’enfant (WCV)'
              : 'Next Well-Child Visit (WCV)',
          category: 'pediatric',
          source: 'Well-Child Visit Standard (national reference)',
          targetDate: target,
          status: lastWcv === null ? 'needs_data' : statusFor(target, today),
          intervalMonths: null,
          locale,
          rationale:
            locale === 'fr'
              ? 'Calendrier des visites de suivi selon l’âge de l’enfant.'
              : 'Follow-up visit calendar based on the child’s age.',
          action:
            locale === 'fr' ? 'Planifier la visite de suivi' : 'Schedule the follow-up visit',
          lastDoneLabel:
            lastWcv !== null
              ? locale === 'fr'
                ? `Dernière visite à ${lastWcv} mois`
                : `Last visit at ${lastWcv} months`
              : null,
        })
      );
    }

    if (!covered.has('P8')) {
      const hasGrowth = numeric(profile.weightKg) !== null && numeric(profile.heightCm) !== null;
      items.push(
        routineItem({
          id: 'ROUTINE-P8',
          ruleId: 'P8',
          title:
            locale === 'fr'
              ? 'Suivi de la croissance et du poids'
              : 'Growth and weight monitoring',
          category: 'pediatric',
          source: 'WHO Growth Reference 2007',
          targetDate: hasGrowth ? addMonthsClamped(today, 6) : null,
          status: hasGrowth ? 'upcoming' : 'needs_data',
          intervalMonths: 6,
          locale,
          rationale:
            locale === 'fr'
              ? 'Mesures de taille et de poids pour suivre la courbe de croissance.'
              : 'Height and weight measurements to follow the growth curve.',
          action:
            locale === 'fr' ? 'Saisir les mesures de mon enfant' : 'Enter my child’s measurements',
        })
      );
    }

    if (!covered.has('P4')) {
      const delay = numeric(profile.vaccineDelayDays) || 0;
      const zeroDose = Boolean(profile.isZeroDoseChild);
      items.push(
        routineItem({
          id: 'ROUTINE-P4',
          ruleId: 'P4',
          title:
            locale === 'fr'
              ? 'Calendrier vaccinal de l’enfant'
              : 'Childhood immunization schedule',
          category: 'immunization',
          source: 'National Immunization Schedule',
          targetDate: delay > 0 || zeroDose ? today : addMonthsClamped(today, 6),
          status: delay > 0 || zeroDose ? 'overdue' : 'upcoming',
          intervalMonths: null,
          locale,
          rationale:
            locale === 'fr'
              ? 'Vérification des vaccins dus selon l’âge et rattrapage si nécessaire.'
              : 'Checks vaccines due by age and catch-up when needed.',
          action:
            locale === 'fr' ? 'Voir le carnet vaccinal' : 'View the immunization record',
        })
      );
    }

    if (!covered.has('P5') && ageMonths >= 12 && ageMonths <= 60) {
      const done = Boolean(profile.anemiaScreeningDone);
      items.push(
        routineItem({
          id: 'ROUTINE-P5',
          ruleId: 'P5',
          title:
            locale === 'fr'
              ? 'Dépistage de l’anémie du jeune enfant'
              : 'Early childhood anemia screening',
          category: 'pediatric',
          source: 'WHO & Pediatric Standard',
          targetDate: done ? addMonthsClamped(today, 12) : null,
          status: done ? 'up_to_date' : 'needs_data',
          intervalMonths: 12,
          locale,
          rationale:
            locale === 'fr'
              ? 'Contrôle du fer et de l’hémoglobine pendant la petite enfance.'
              : 'Iron and hemoglobin check during early childhood.',
          action:
            locale === 'fr' ? 'Compléter le suivi' : 'Complete the follow-up',
        })
      );
    }

    if (!covered.has('P6') && ageMonths >= 16 && ageMonths <= 30) {
      const mchat = numeric(profile.mchatScore);
      items.push(
        routineItem({
          id: 'ROUTINE-P6',
          ruleId: 'P6',
          title:
            locale === 'fr'
              ? 'Entretien de développement (M-CHAT)'
              : 'Developmental follow-up interview (M-CHAT)',
          category: 'pediatric',
          source: 'M-CHAT-R/F Published Logic',
          targetDate: mchat === null ? null : addMonthsClamped(today, 6),
          status: mchat === null ? 'needs_data' : mchat >= 3 ? 'due_soon' : 'up_to_date',
          intervalMonths: null,
          locale,
          rationale:
            locale === 'fr'
              ? 'Questionnaire de développement à réaliser à cet âge.'
              : 'Developmental questionnaire due at this age.',
          action:
            locale === 'fr' ? 'Répondre au questionnaire' : 'Answer the questionnaire',
        })
      );
    }
  }

  const sorted = items.sort((a, b) => {
    const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
    return a.title.localeCompare(b.title);
  });

  const summary = {
    overdue: sorted.filter((i) => i.status === 'overdue').length,
    needsData: sorted.filter((i) => i.status === 'needs_data').length,
    dueSoon: sorted.filter((i) => i.status === 'due_soon').length,
    upcoming: sorted.filter((i) => i.status === 'upcoming').length,
    upToDate: sorted.filter((i) => i.status === 'up_to_date').length,
  };

  return {
    generatedAt: today,
    horizonMonths: 12,
    items: sorted,
    summary,
    nextAction: sorted.find((i) => i.status !== 'up_to_date') || null,
  };
}

/* ------------------------------------------------------------------------- */
/* Smart reminder assistant                                                  */
/* ------------------------------------------------------------------------- */

export type AppointmentStatus = 'upcoming' | 'today' | 'missed' | 'done' | 'refused' | 'none';

export interface ReminderSlot {
  id: string;
  kind: 'upcoming' | 'missed';
  label: string;
  scheduledFor: string;
  status: 'to_send' | 'planned';
  message: string;
  safetyCheckPassed: boolean;
}

export interface ReminderPlan {
  consentEnabled: boolean;
  channel: string;
  language: Locale;
  appointment: {
    date: string | null;
    state: string;
    facility: string;
    title: string;
    daysUntil: number | null;
    status: AppointmentStatus;
  } | null;
  upcomingReminders: ReminderSlot[];
  missedReminders: ReminderSlot[];
  history: Array<{
    id: string;
    title: string;
    bodyText: string;
    sentAt: string;
    channel: string;
    requiresAction: boolean;
  }>;
  canSend: boolean;
  remindersSentCount: number;
  maxReminders: number;
  safetyMessage: string | null;
}

function dateLabel(iso: string, language: Locale): string {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : 'en-GB',
      { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }
    );
  } catch {
    return iso;
  }
}

function buildMessage(params: {
  kind: 'upcoming' | 'missed';
  language: Locale;
  displayName: string;
  facility: string;
  date: string;
  isChild: boolean;
}): string {
  const { kind, language, displayName, facility, date, isChild } = params;
  const who = isChild ? `${displayName}` : displayName;
  if (language === 'fr') {
    return kind === 'upcoming'
      ? `Rappel MediBenin : la visite de prévention de ${who} est prévue le ${date} au centre ${facility}. Présentez votre pass à l’accueil. Pour reporter, ouvrez votre portail.`
      : `Rappel MediBenin : la visite de prévention de ${who} du ${date} n’a pas été confirmée. Vous pouvez encore la reprogrammer dans votre portail, sans aucune conséquence sur votre accès aux soins.`;
  }
  return kind === 'upcoming'
    ? `MediBenin reminder: ${who}'s preventive visit is planned for ${date} at ${facility}. Please present your pass at reception. To reschedule, open your portal.`
    : `MediBenin reminder: ${who}'s preventive visit on ${date} was not confirmed. You can still reschedule it in your portal, with no impact on your access to care.`;
}

/**
 * Builds the smart reminder timeline for the next/missed appointment.
 * Reminders are proposed at T-7, T-3, T-1 and D0, and at J+1, J+3, J+7 when
 * the visit is missed. The plan never sends anything by itself.
 */
export function buildReminderPlan(params: {
  patient: {
    displayName: string;
    preferredLanguage?: string | null;
    preferredChannel?: string | null;
    facilityCenter?: string | null;
    pathwayType?: string | null;
  };
  recommendation?: {
    dueDate?: string | null;
    scheduledDate?: string | null;
    state?: string | null;
    pathwayTitle?: string | null;
    facilityName?: string | null;
    remindersSentCount?: number | null;
  } | null;
  notifications?: Array<{
    id: string;
    title: string;
    bodyText: string;
    sentAt: string;
    channel: string;
    requiresAction?: boolean | null;
  }>;
  consentEnabled: boolean;
  locale?: Locale;
  today?: string;
  maxReminders?: number;
}): ReminderPlan {
  const today = todayIso(params.today);
  const rec = params.recommendation || null;
  const language = (params.locale ||
    (params.patient.preferredLanguage as Locale) ||
    'en') as Locale;
  const channel = params.patient.preferredChannel || 'WhatsApp';
  const maxReminders = params.maxReminders ?? 2;
  const sentCount = Number(rec?.remindersSentCount) || 0;
  const isChild = params.patient.pathwayType === 'child' || params.patient.pathwayType === 'adolescent';

  const rawDate = rec?.scheduledDate || rec?.dueDate || null;
  const date = rawDate && /^\d{4}-\d{2}-\d{2}/.test(rawDate) ? rawDate.slice(0, 10) : null;
  const state = rec?.state || 'created';
  const daysUntil = date ? daysBetween(today, date) : null;

  let appointmentStatus: AppointmentStatus = 'none';
  if (!date) appointmentStatus = 'none';
  else if (state === 'done') appointmentStatus = 'done';
  else if (state === 'refused') appointmentStatus = 'refused';
  else if (daysUntil !== null && daysUntil < 0) appointmentStatus = 'missed';
  else if (daysUntil === 0) appointmentStatus = 'today';
  else appointmentStatus = 'upcoming';

  const displayName = params.patient.displayName || 'Patient';
  const facility = rec?.facilityName || params.patient.facilityCenter || 'health centre';

  const upcomingReminders: ReminderSlot[] = [];
  const missedReminders: ReminderSlot[] = [];

  if (date && appointmentStatus !== 'done' && appointmentStatus !== 'refused' && params.consentEnabled) {
    if (appointmentStatus === 'upcoming' || appointmentStatus === 'today') {
      for (const offset of [7, 3, 1, 0]) {
        const scheduledFor = addDays(date, -offset);
        const message = buildMessage({
          kind: 'upcoming',
          language,
          displayName,
          facility,
          date: dateLabel(date, language),
          isChild,
        });
        upcomingReminders.push({
          id: `REM-UP-${offset}`,
          kind: 'upcoming',
          label:
            language === 'fr'
              ? offset === 0
                ? 'Le jour de la visite'
                : `J-${offset}`
              : offset === 0
              ? 'Visit day'
              : `D-${offset}`,
          scheduledFor,
          status: scheduledFor <= today ? 'to_send' : 'planned',
          message,
          safetyCheckPassed: validateM2MessageSafety(message).valid,
        });
      }
    }

    if (appointmentStatus === 'missed') {
      for (const offset of [1, 3, 7]) {
        const scheduledFor = addDays(date, offset);
        const message = buildMessage({
          kind: 'missed',
          language,
          displayName,
          facility,
          date: dateLabel(date, language),
          isChild,
        });
        missedReminders.push({
          id: `REM-MISSED-${offset}`,
          kind: 'missed',
          label:
            language === 'fr'
              ? offset === 1
                ? 'Lendemain de la visite manquée'
                : `J+${offset}`
              : offset === 1
              ? 'Day after the missed visit'
              : `D+${offset}`,
          scheduledFor,
          status: scheduledFor <= today ? 'to_send' : 'planned',
          message,
          safetyCheckPassed: validateM2MessageSafety(message).valid,
        });
      }
    }
  }

  const consentBlocked = !params.consentEnabled;
  const appointmentClosed = appointmentStatus === 'done' || appointmentStatus === 'refused';
  const limitReached = sentCount >= maxReminders;
  const hasAppointment =
    appointmentStatus === 'upcoming' ||
    appointmentStatus === 'today' ||
    appointmentStatus === 'missed';

  let safetyMessage: string | null = null;
  if (consentBlocked) {
    safetyMessage =
      language === 'fr'
        ? 'Rappels désactivés : vous avez retiré le consentement « rappels ». Aucun message ne sera envoyé.'
        : 'Reminders are disabled: you withdrew the reminders consent. No message will be sent.';
  } else if (appointmentStatus === 'refused') {
    safetyMessage =
      language === 'fr'
        ? 'Visite refusée : toutes les relances sont arrêtées immédiatement, sans impact sur vos soins.'
        : 'Visit declined: all reminders stop immediately, with no impact on your care.';
  } else if (appointmentStatus === 'done') {
    safetyMessage =
      language === 'fr'
        ? 'Visite confirmée comme réalisée : aucun rappel supplémentaire n’est nécessaire.'
        : 'Visit confirmed as completed: no further reminder is needed.';
  } else if (limitReached) {
    safetyMessage =
      language === 'fr'
        ? `Limite de ${maxReminders} rappels atteinte. L’équipe de soin peut vous contacter directement.`
        : `Limit of ${maxReminders} reminders reached. The care team may contact you directly.`;
  }

  return {
    consentEnabled: params.consentEnabled,
    channel,
    language,
    appointment: rec
      ? {
          date,
          state,
          facility,
          title: rec.pathwayTitle || 'Preventive visit',
          daysUntil,
          status: appointmentStatus,
        }
      : null,
    upcomingReminders,
    missedReminders,
    history: (params.notifications || []).slice(0, 8).map((n) => ({
      id: n.id,
      title: n.title,
      bodyText: n.bodyText,
      sentAt: n.sentAt,
      channel: n.channel,
      requiresAction: Boolean(n.requiresAction),
    })),
    canSend:
      params.consentEnabled &&
      !appointmentClosed &&
      !limitReached &&
      hasAppointment,
    remindersSentCount: sentCount,
    maxReminders,
    safetyMessage,
  };
}
