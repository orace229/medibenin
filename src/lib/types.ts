export type Locale = 'en' | 'fr' | 'ar';
export type UserRole = 'patient' | 'parent' | 'clinician' | 'coordinator' | 'public_health';
export type Level = 'red' | 'orange' | 'yellow' | 'green' | 'grey';
export type Certainty = 'high' | 'medium' | 'low';
export type PathwayState =
  | 'created'
  | 'validated'
  | 'invited'
  | 'scheduled'
  | 'postponed'
  | 'overdue'
  | 'done'
  | 'refused';

export interface FlagItem {
  id: string;
  flagType: 'elevated_risk' | 'missed_care' | 'overdue_care' | 'interrupted_followup';
  level: Level;
  title: string;
  factors: string[]; // 1 to 3 human-readable sentences
  sourceLabel: string;
  missingData: string[];
  dueDate: string;
  certainty: Certainty;
  certaintyReason: string;
  isEclipseSuspended: boolean;
}

export interface RecommendationItem {
  id: string;
  patientId: string;
  pathwayTitle: string;
  groupedActions: Array<{
    actionTitle: string;
    directiveSource: string;
    category: string;
  }>;
  level: Level;
  state: PathwayState;
  dueDate: string;
  scheduledDate?: string | null;
  facilityName: string;
  referralCodeDisplay: string;
  decisionAidText: string;
  clinicianModifierReason?: string | null;
  conclusionStatus?: string | null;
  conclusionNotes?: string | null;
  remindersSentCount: number;
}

export interface ConsentState {
  evaluationAndCalendar: boolean;
  channelReminders: boolean;
  shareWithFacility: boolean;
  anonymousStatistics: boolean;
  existingGenomicResult: boolean;
  adolescentAssentGiven?: boolean;
}

export interface UsageLogEntry {
  id: number;
  patientId: string;
  actorName: string;
  actorRole: string;
  dataCategory: string;
  purposeDescription: string;
  ruleVersionRef: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  patientId: string;
  recommendationId?: string | null;
  channel: 'SMS' | 'WhatsApp' | 'App';
  language: Locale;
  recipientType: 'parent' | 'adolescent' | 'adult';
  title: string;
  bodyText: string;
  decisionAidSummary?: string | null;
  isRead: boolean;
  requiresAction: boolean;
  humanValidatedBy?: string | null;
  sentAt: string;
}

export interface ClinicianPatientListItem {
  id: string;
  displayName: string;
  ageYears: number;
  ageMonths: number;
  pathwayType: 'child' | 'adolescent' | 'adult';
  isPersona: boolean;
  overallLevel: Level;
  overallCertainty: Certainty;
  primaryReasonSummary: string;
  nextDueDate: string;
  facilityCenter: string;
  pathwayState: PathwayState;
}

export interface BackendClinicalCalculations {
  emergencyEscapeE0: {
    triggered: boolean;
    reason: string | null;
  };
  bpProtocol: {
    reading1: string | null;
    reading2: string | null;
    reading3: string | null;
    spreadSys: number | null;
    spreadDia: number | null;
    requiresThirdReading: boolean;
    retainedSys: number | null;
    retainedDia: number | null;
    bpZoneLabel: string;
  };
  anthropometry: {
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    waistCm: number | null;
    correctedAgeMonths: number | null;
    weightForHeightZ: number | null;
    bmiForAgeZ: number | null;
    muacMm: number | null;
  };
  whoCvdModel: {
    inDomain: boolean;
    domainNote: string;
    regionUsed: string;
    riskPercent: number | null;
    intervalLowPercent: number | null;
    intervalHighPercent: number | null;
    crossesThreshold: boolean;
    counterfactuals: Array<{
      factor: string;
      currentValue: string;
      targetValue: string;
      riskReductionPct: number;
    }>;
  };
  findriscModel: {
    score: number | null;
    levelLabel: string;
    suspendedByPregnancy: boolean;
    asianBmiRuleA4Triggered: boolean;
    itemBreakdown: Array<{ item: string; points: number }>;
  };
  certaintyAudit: {
    completenessPercent: number;
    provenanceCodes: Record<string, string>;
    oldestMeasureMonths: number;
    crossesWhoThreshold: boolean;
    finalCertainty: 'high' | 'medium' | 'low';
    certaintyReason: string;
  };
  eclipseSafeguard: {
    activeRedFlag: boolean;
    suspendedYellowRuleIds: string[];
  };
  genomicPolicy: {
    consentGranted: boolean;
    signalType: string;
    effectSummary: string;
  };
  consolidatedCarePlan: {
    pathwayTitle: string;
    dueDate: string;
    level: 'red' | 'orange' | 'yellow' | 'green' | 'grey';
    groupedActions: Array<{
      ruleId: string;
      actionTitle: string;
      directiveSource: string;
      category: string;
    }>;
  };
}

export interface ClinicianPatientDetail {
  id: string;
  displayName: string;
  ageYears: number;
  ageMonths: number;
  gestationalAgeWeeks?: number | null;
  correctedAgeMonths: number | null;
  sex: string;
  nationalityGroup?: string;
  pathwayType: 'child' | 'adolescent' | 'adult';
  isPersona: boolean;
  region: string;
  preferredLanguage: Locale;
  preferredChannel: string;
  preferFemalePractitioner: boolean;
  facilityCenter: string;
  overallLevel: Level;
  overallCertainty: Certainty;
  primaryReasonSummary: string;
  nextDueDate: string;
  preventionProgressDone: number;
  preventionProgressTotal: number;
  clinicalProfile?: Record<string, any>;
  calculations?: BackendClinicalCalculations;
  visualIndicators: {
    bpZoneLabel: string;
    growthSeries: Array<{ ageLabel: string; value: number; refLow: number; refMid: number; refHigh: number }>;
    bpSeries: Array<{ dateLabel: string; systolic: number; diastolic: number; targetMaxSys: number; targetMaxDia: number }>;
    vaccinesList: Array<{ name: string; status: 'done' | 'scheduled' | 'overdue'; dateLabel: string }>;
    genomicCard: {
      title: string;
      effectSummary: string;
    } | null;
  };
  flags: FlagItem[];
  recommendations: RecommendationItem[];
  consents: ConsentState | null;
  usageLogs: UsageLogEntry[];
}

