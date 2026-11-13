# MediSense — Architecture & Implementation Notes (`NOTES.md`)

## Phase 0 Decisions & Safeguards Locked

1. **Database & Persistence (Option A — Cloud SQL PostgreSQL + Drizzle ORM)**
   - Provisioned Cloud SQL PostgreSQL instance (`europe-west2`) with 9 normalized relational tables (`users`, `rule_tables`, `patients`, `flags`, `recommendations`, `consents`, `usage_logs`, `notifications`, `access_requests`).
   - Deterministic seeded cohort (`seed = 20261120`) automatically populates 7 detailed clinical personas (18-month child Zayed, 14-year adolescent Layla, 36-year South Asian adult Tariq, 49-year Level Grey Mariam, 29-year Pregnant Red Fatima, 44-year Green Omar, and 8-month premature infant Noor evaluated on corrected age) plus 45 diverse synthetic profiles.

2. **AD-1 & AD-2 Separation (Clinical Rules vs. Logistics ML)**
   - **Zero Clinical Calculation in Frontend**: The React frontend never compares a measurement to a threshold or computes a score.
   - **Signed Rules Engine (`src/server/rulesEngine.ts`)**: Verifies SHA-256 signature of the `ABU_DHABI_WCV_IFHAS_V8` table (`TEST-S5`) before evaluating P1–P11, A1–A11, G1–G3, Eclipse suspension (`TEST-S2`), pregnancy suspension (`TEST-S3`), and premature corrected age (`TEST-S4`).
   - **Strict Screen 1 vs. Screen 2 API Isolation (`TEST-E2`, `TEST-M2`)**: `priorityScoreSprio` and `mlNoShowProbM1` are stored for `/api/coordinator/queue` (Screen 1) and explicitly stripped from `/api/clinician/patients` and `/api/clinician/patients/:id` (Screen 2).
   - **M1 Non-Downgrade Rule (`TEST-M1`)**: M1 calibrated no-show probabilities can only trigger strengthened accompaniment (human outreach, evening/mobile slot), never lower priority.
   - **M2 Safety Guardrail (`TEST-M3`)**: Automated exclusion filter blocks any message containing diagnostic, score, or genetic terminology before preview/send.
   - **Closed-Loop HMAC Referral Pass (`TEST-E5`)**: Visits transition to `done` only when the 8-character referral code matches the stored HMAC hash.
   - **Population Safeguards (`TEST-E4`)**: API-level Wilson 95% intervals + primary suppression (`n < 10`) + secondary complementary suppression on the smallest neighbor.
