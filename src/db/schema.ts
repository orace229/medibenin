import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Users table (Firebase Auth + Demo Role accounts)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('patient'), // 'patient' | 'parent' | 'clinician' | 'coordinator' | 'public_health'
  preferredLanguage: text('preferred_language').notNull().default('en'), // 'en' | 'fr' | 'ar'
  facilityName: text('facility_name').default('Al Bateen Primary Care Centre'),
  linkedPatientIds: jsonb('linked_patient_ids').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Signed Rules Tables Registry (Governance & Signature verification)
export const ruleTables = pgTable('rule_tables', {
  id: serial('id').primaryKey(),
  tableCode: text('table_code').notNull().unique(), // e.g. 'ABU_DHABI_WCV_IFHAS_V8'
  version: text('version').notNull(),
  signedBy: text('signed_by').notNull(),
  signerRole: text('signer_role').notNull(),
  signatureHash: text('signature_hash').notNull(),
  isSigned: boolean('is_signed').notNull().default(true),
  reviewDate: text('review_date').notNull(),
  rulesPayload: jsonb('rules_payload').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Patients (Personas + Synthetic Cohort)
export const patients = pgTable('patients', {
  id: text('id').primaryKey(), // Opaque identifier e.g. 'PT-18M-ZAYED'
  displayName: text('display_name').notNull(),
  ageYears: integer('age_years').notNull(),
  ageMonths: integer('age_months').notNull(),
  gestationalAgeWeeks: integer('gestational_age_weeks').default(40), // For premature corrected age (P1-P8)
  sex: text('sex').notNull(), // 'female' | 'male'
  pathwayType: text('pathway_type').notNull(), // 'child' | 'adolescent' | 'adult'
  isPersona: boolean('is_persona').notNull().default(false),
  parentUserId: text('parent_user_id'),
  region: text('region').notNull(), // 'Abu Dhabi' | 'Al Ain' | 'Al Dhafra'
  nationalityGroup: text('nationality_group').notNull(), // 'Emirati' | 'South Asia' | 'Arab World (Non-UAE)' | 'Southeast Asia' | 'Other'
  insuranceCategory: text('insurance_category').notNull(), // 'Thiqa' | 'Basic' | 'Enhanced'
  preferredLanguage: text('preferred_language').notNull().default('en'),
  preferredChannel: text('preferred_channel').notNull().default('WhatsApp'), // 'SMS' | 'WhatsApp' | 'App'
  preferFemalePractitioner: boolean('prefer_female_practitioner').notNull().default(false),
  accessTimeMinutes: integer('access_time_minutes').notNull().default(15),
  missedVisitsCount: integer('missed_visits_count').notNull().default(0),
  facilityCenter: text('facility_center').notNull().default('Al Bateen Healthcare Centre'),
  overallLevel: text('overall_level').notNull().default('green'), // 'red' | 'orange' | 'yellow' | 'green' | 'grey'
  overallCertainty: text('overall_certainty').notNull().default('high'), // 'high' | 'medium' | 'low'
  primaryReasonSummary: text('primary_reason_summary').notNull(),
  nextDueDate: text('next_due_date').notNull(),
  preventionProgressDone: integer('prevention_progress_done').notNull().default(3),
  preventionProgressTotal: integer('prevention_progress_total').notNull().default(5),
  // Clinical & Context raw inputs (evaluated ONLY on backend, never exposed as thresholds on frontend)
  clinicalProfile: jsonb('clinical_profile').$type<{
    isPregnant?: boolean;
    pregnancyWeeks?: number;
    systolicBp1?: number;
    diastolicBp1?: number;
    systolicBp2?: number;
    diastolicBp2?: number;
    systolicBp3?: number;
    diastolicBp3?: number;
    bpZoneLabel?: string; // Pre-computed label for patient portal: 'In target zone' | 'To discuss with your clinician'
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    waistCm?: number;
    muacMm?: number;
    weightForHeightZ?: number;
    heightForAgeZ?: number;
    bmiForAgeZ?: number;
    hemoglobinGdl?: number;
    hba1cPercent?: number;
    findriscScore?: number;
    mchatScore?: number;
    smokingStatus?: 'never' | 'current' | 'dokha_shisha' | null;
    dailyPhysicalActivity?: boolean | null;
    dailyFruitsVeg?: boolean | null;
    antihypertensiveMed?: boolean | null;
    historyHighGlucose?: boolean | null;
    familyHistoryDiabetes?: 'none' | 'second_degree' | 'first_degree' | null;
    familyHistoryFhOrEarlyCvd?: boolean;
    familyHistoryColorectal?: boolean;
    chronicCondition?: string | null;
    monthsSinceLastChronicVisit?: number;
    lastWcvAgeMonths?: number;
    missedWcvConsecutive?: number;
    vaccineDelayDays?: number;
    isZeroDoseChild?: boolean | null;
    adolescentVaccinesUpToDate?: boolean | null;
    anemiaScreeningDone?: boolean | null;
    cervicalScreeningUpToDate?: boolean | null;
    mammographyUpToDate?: boolean | null;
    colorectalScreeningUpToDate?: boolean | null;
    ifhasFullScreeningDone?: boolean | null;
    fallOrSensoryRisk?: boolean | null;
    activeSpecialistFollowup?: boolean;
    redFlagWarningSymptom?: boolean;
    redFlagSymptomLabel?: string;
    hasEmergencySymptoms?: boolean;
    hasSymptomaticCrisis?: boolean;
    genomicSignal?: {
      type: 'PRS_CAD_T2D_94' | 'BRCA_ACTIONABLE' | 'NONE';
      label: string;
      effectSummary: string;
      simulated: boolean;
    } | null;
    provenanceMap: Record<string, 'V' | 'M' | 'D' | 'S'>;
    oldestMeasureMonths: number;
    growthSeries?: Array<{ ageLabel: string; value: number; refLow: number; refMid: number; refHigh: number }>;
    bpSeries?: Array<{ dateLabel: string; systolic: number; diastolic: number; targetMaxSys: number; targetMaxDia: number }>;
    vaccinesList?: Array<{ name: string; status: 'done' | 'scheduled' | 'overdue'; dateLabel: string }>;
  }>().notNull(),
  // Hidden ground truth for Synthetic Benchmark & Equity Safeguards (Section 7 & 8)
  syntheticGroundTruth: jsonb('synthetic_ground_truth').$type<{
    hasTrueUnmetCondition: boolean;
    invitedUnderAgeSexOnly: boolean;
    confirmedVisitUnderMediSense: boolean;
    confirmedVisitUnderBaseline: boolean;
    daysToVisit: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Flags / Signalements (Exigence 1)
export const flags = pgTable('flags', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .references(() => patients.id)
    .notNull(),
  ruleId: text('rule_id').notNull(), // Internal ID for backend audit; frontend displays sourceLabel
  flagType: text('flag_type').notNull(), // 'elevated_risk' | 'missed_care' | 'overdue_care' | 'interrupted_followup'
  level: text('level').notNull(), // 'red' | 'orange' | 'yellow' | 'green' | 'grey'
  title: text('title').notNull(),
  factors: jsonb('factors').$type<string[]>().notNull(), // 1 to 3 human-readable sentences
  sourceLabel: text('source_label').notNull(), // e.g. 'National Immunization Schedule'
  missingData: jsonb('missing_data').$type<string[]>().notNull().default([]),
  dueDate: text('due_date').notNull(),
  certainty: text('certainty').notNull(), // 'high' | 'medium' | 'low'
  certaintyReason: text('certainty_reason').notNull(),
  isEclipseSuspended: boolean('is_eclipse_suspended').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Recommendations & Care Pathways (Exigence 2 — 8-state machine + Referral Code)
export const recommendations = pgTable('recommendations', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .references(() => patients.id)
    .notNull(),
  pathwayTitle: text('pathway_title').notNull(),
  groupedActions: jsonb('grouped_actions').$type<Array<{
    actionTitle: string;
    directiveSource: string;
    category: string;
  }>>().notNull(),
  level: text('level').notNull(),
  state: text('state').notNull().default('created'), // 'created' | 'validated' | 'invited' | 'scheduled' | 'postponed' | 'overdue' | 'done' | 'refused'
  dueDate: text('due_date').notNull(),
  scheduledDate: text('scheduled_date'),
  facilityName: text('facility_name').notNull(),
  referralCodeDisplay: text('referral_code_display').notNull(), // 8-char code shown to patient
  referralCodeHmac: text('referral_code_hmac').notNull(), // HMAC stored on server
  decisionAidText: text('decision_aid_text').notNull(), // 3-5 sentences decision aid
  clinicianModifierReason: text('clinician_modifier_reason'),
  conclusionStatus: text('conclusion_status'), // 'normal' | 'abnormal' | null
  conclusionNotes: text('conclusion_notes'),
  remindersSentCount: integer('reminders_sent_count').notNull().default(0),
  // Strictly isolated Logistics & ML fields (Screen 1 Coordinator ONLY — NEVER returned in Screen 2 Clinician API)
  priorityScoreSprio: real('priority_score_sprio').notNull().default(0),
  mlNoShowProbM1: real('ml_no_show_prob_m1').notNull().default(0),
  mlTopFactorsM1: jsonb('ml_top_factors_m1').$type<string[]>().notNull().default([]),
  mlSuggestedAction: text('ml_suggested_action').notNull().default('Standard reminder'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Consents by Purpose (5 distinct toggles — Section 3.3)
export const consents = pgTable('consents', {
  id: serial('id').primaryKey(),
  patientId: text('patient_id')
    .references(() => patients.id)
    .notNull()
    .unique(),
  evaluationAndCalendar: boolean('evaluation_and_calendar').notNull().default(true),
  channelReminders: boolean('channel_reminders').notNull().default(true),
  shareWithFacility: boolean('share_with_facility').notNull().default(true),
  anonymousStatistics: boolean('anonymous_statistics').notNull().default(true),
  existingGenomicResult: boolean('existing_genomic_result').notNull().default(false),
  adolescentAssentGiven: boolean('adolescent_assent_given').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 7. Data Usage & Audit Log (Clause: making authorized data use visible)
export const usageLogs = pgTable('usage_logs', {
  id: serial('id').primaryKey(),
  patientId: text('patient_id')
    .references(() => patients.id)
    .notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  dataCategory: text('data_category').notNull(),
  purposeDescription: text('purpose_description').notNull(),
  ruleVersionRef: text('rule_version_ref').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Notifications & Culturally Adapted Messages (Exigence 3 + M2 constrained)
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  patientId: text('patient_id')
    .references(() => patients.id)
    .notNull(),
  recommendationId: text('recommendation_id'),
  channel: text('channel').notNull(), // 'SMS' | 'WhatsApp' | 'App'
  language: text('language').notNull(), // 'en' | 'fr' | 'ar'
  recipientType: text('recipient_type').notNull(), // 'parent' | 'adolescent' | 'adult'
  title: text('title').notNull(),
  bodyText: text('body_text').notNull(),
  decisionAidSummary: text('decision_aid_summary'),
  isRead: boolean('is_read').notNull().default(false),
  requiresAction: boolean('requires_action').notNull().default(true),
  humanValidatedBy: text('human_validated_by'),
  sentAt: text('sent_at').notNull(),
});

// 9. Access Requests (Clinician onboarding stub — Phase 2)
export const accessRequests = pgTable('access_requests', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  professionalEmail: text('professional_email').notNull(),
  profession: text('profession').notNull(),
  facility: text('facility').notNull(),
  licenseNumber: text('license_number').notNull(),
  preferredLanguage: text('preferred_language').notNull().default('en'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const patientsRelations = relations(patients, ({ many, one }) => ({
  flags: many(flags),
  recommendations: many(recommendations),
  consent: one(consents, {
    fields: [patients.id],
    references: [consents.patientId],
  }),
  usageLogs: many(usageLogs),
  notifications: many(notifications),
}));
