CREATE TABLE "access_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"professional_email" text NOT NULL,
	"profession" text NOT NULL,
	"facility" text NOT NULL,
	"license_number" text NOT NULL,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"evaluation_and_calendar" boolean DEFAULT true NOT NULL,
	"channel_reminders" boolean DEFAULT true NOT NULL,
	"share_with_facility" boolean DEFAULT true NOT NULL,
	"anonymous_statistics" boolean DEFAULT true NOT NULL,
	"existing_genomic_result" boolean DEFAULT false NOT NULL,
	"adolescent_assent_given" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "consents_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
CREATE TABLE "flags" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"rule_id" text NOT NULL,
	"flag_type" text NOT NULL,
	"level" text NOT NULL,
	"title" text NOT NULL,
	"factors" jsonb NOT NULL,
	"source_label" text NOT NULL,
	"missing_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"due_date" text NOT NULL,
	"certainty" text NOT NULL,
	"certainty_reason" text NOT NULL,
	"is_eclipse_suspended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"recommendation_id" text,
	"channel" text NOT NULL,
	"language" text NOT NULL,
	"recipient_type" text NOT NULL,
	"title" text NOT NULL,
	"body_text" text NOT NULL,
	"decision_aid_summary" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"requires_action" boolean DEFAULT true NOT NULL,
	"human_validated_by" text,
	"sent_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"age_years" integer NOT NULL,
	"age_months" integer NOT NULL,
	"gestational_age_weeks" integer DEFAULT 40,
	"sex" text NOT NULL,
	"pathway_type" text NOT NULL,
	"is_persona" boolean DEFAULT false NOT NULL,
	"parent_user_id" text,
	"region" text NOT NULL,
	"nationality_group" text NOT NULL,
	"insurance_category" text NOT NULL,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"preferred_channel" text DEFAULT 'WhatsApp' NOT NULL,
	"prefer_female_practitioner" boolean DEFAULT false NOT NULL,
	"access_time_minutes" integer DEFAULT 15 NOT NULL,
	"missed_visits_count" integer DEFAULT 0 NOT NULL,
	"facility_center" text DEFAULT 'Al Bateen Healthcare Centre' NOT NULL,
	"overall_level" text DEFAULT 'green' NOT NULL,
	"overall_certainty" text DEFAULT 'high' NOT NULL,
	"primary_reason_summary" text NOT NULL,
	"next_due_date" text NOT NULL,
	"prevention_progress_done" integer DEFAULT 3 NOT NULL,
	"prevention_progress_total" integer DEFAULT 5 NOT NULL,
	"clinical_profile" jsonb NOT NULL,
	"synthetic_ground_truth" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"pathway_title" text NOT NULL,
	"grouped_actions" jsonb NOT NULL,
	"level" text NOT NULL,
	"state" text DEFAULT 'created' NOT NULL,
	"due_date" text NOT NULL,
	"scheduled_date" text,
	"facility_name" text NOT NULL,
	"referral_code_display" text NOT NULL,
	"referral_code_hmac" text NOT NULL,
	"decision_aid_text" text NOT NULL,
	"clinician_modifier_reason" text,
	"conclusion_status" text,
	"conclusion_notes" text,
	"reminders_sent_count" integer DEFAULT 0 NOT NULL,
	"priority_score_sprio" real DEFAULT 0 NOT NULL,
	"ml_no_show_prob_m1" real DEFAULT 0 NOT NULL,
	"ml_top_factors_m1" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ml_suggested_action" text DEFAULT 'Standard reminder' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rule_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_code" text NOT NULL,
	"version" text NOT NULL,
	"signed_by" text NOT NULL,
	"signer_role" text NOT NULL,
	"signature_hash" text NOT NULL,
	"is_signed" boolean DEFAULT true NOT NULL,
	"review_date" text NOT NULL,
	"rules_payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "rule_tables_table_code_unique" UNIQUE("table_code")
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"actor_role" text NOT NULL,
	"data_category" text NOT NULL,
	"purpose_description" text NOT NULL,
	"rule_version_ref" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text DEFAULT 'patient' NOT NULL,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"facility_name" text DEFAULT 'Al Bateen Primary Care Centre',
	"linked_patient_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flags" ADD CONSTRAINT "flags_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;