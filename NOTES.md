# MediSense — Architecture & Implementation Notes (`NOTES.md`)

## Phase 0 Decisions & Safeguards Locked

1. **Database & Persistence (Option A — Cloud SQL PostgreSQL + Drizzle ORM)**
   - Provisioned Cloud SQL PostgreSQL instance (`europe-west2`) with 9 normalized relational tables (`users`, `rule_tables`, `patients`, `flags`, `recommendations`, `consents`, `usage_logs`, `notifications`, `access_requests`).
   - Deterministic seeded cohort (`seed = 20261120`) automatically populates 7 detailed clinical personas (18-month child Zayed, 14-year adolescent Layla, 36-year South Asian adult Tariq, 49-year Level Grey Mariam, 29-year Pregnant Red Fatima, 44-year Green Omar, and 8-month premature infant Noor evaluated on corrected age) plus 45 diverse synthetic profiles.

2. **AD-1 & AD-2 Separation (Clinical Rules vs. Logistics ML)**
   - **Zero Clinical Calculation in Frontend**: The React frontend never compares a measurement to a threshold or computes a score.
   - **Signed Rules Engine (`src/server/rulesEngine.ts`)**: Verifies SHA-256 signature of the `ABU_DHABI_WCV_IFHAS_V8` table (`TEST-S5`) before evaluating P1–P11, A1–A11, G1–G3, Eclipse suspension (`TEST-S2`), pregnancy suspension (`TEST-S3`), and premature corrected age (`TEST-S4`).
   - **Strict Screen 1 vs. Screen 2 API Isolation (`TEST-E2`, `TEST-M2`)**: `priorityScoreSprio` and `mlNoShowProbM1` are stored for `/api/coordinator/queue` (Screen 1) and explicitly stripped from `/api/clinician/patients` and `/api/clinician/patients/:id` (Screen 2).
   - **M1 Non-Downgrade Rule (`TEST-M1`)**: M1 logistics probabilities (expert-coefficient baseline, not yet a trained model) can only trigger strengthened accompaniment (human outreach, evening/mobile slot), never lower priority.
   - **M2 Safety Guardrail (`TEST-M3`)**: Automated exclusion filter blocks any message containing diagnostic, score, or genetic terminology before preview/send.
   - **Closed-Loop HMAC Referral Pass (`TEST-E5`)**: Visits transition to `done` only when the 8-character referral code matches the stored HMAC hash.
   - **Population Safeguards (`TEST-E4`)**: API-level Wilson 95% intervals + primary suppression (`n < 10`) + secondary complementary suppression on the smallest neighbor.

## P0 Remediation Applied (2026-11-15)

1. **Authentication** — new Firebase accounts are `patient` with no linked record; demo bearer tokens are restricted to `DEMO_MODE=true` (enabled automatically outside production).
2. **Emergency escape E0** — the guided form and patient self-assessment now map red-flag symptoms to `hasEmergencySymptoms` / `hasSymptomaticCrisis`; E0 is covered by a regression test.
3. **No default imputation** — FINDRISC items, smoking, screening statuses (anemia, colorectal, cervical, mammography, IFHAS, adolescent vaccines, zero-dose, fall risk) are `null/unknown` when unanswered; a `GREY` completeness flag lists the missing required variables.
4. **Grey vs Orange** — confirmed Orange/Yellow findings now outrank the Grey completeness flag; missing data can no longer hide an actionable finding.
5. **Consent enforcement** — evaluation, reminders, facility sharing and genomic purpose now block the corresponding actions; consent withdrawal recalculates and replaces flags; genomic signals and G1/G2 are filtered from API payloads without consent.
6. **Coordinator guardrails** — no invitation for Red/Grey, no invitation before clinician validation, no invitation after refusal; the UI shows a blocking label instead of the Invite action.
7. **Production SPA fallback** — `/proof` and deep links are served in production (`app.get('*')`); Vite is loaded dynamically in development only.
8. **Cold start** — `npm run db:push` creates the schema; `.env.example` documents SQL host/port/credentials; README documents the mandatory `db:push` step and production start.
9. **Parent portal** — `parent` is no longer collapsed to `patient`; the portal loads the first linked record from `/api/auth/me`; a parent demo preset and OTP scope checks were added.
10. **Regression checks** — `npm test` (31 tests), `tsc --noEmit`, and `npm run check:ui` pass; `db:push` and the production server were exercised against a temporary PostgreSQL instance.

## P1-A Remediation Applied (2026-11-15)

1. **C3 fixed** — pooled adoption/invitation rates are computed on people, not by summing the same people across five dimensions. A dedicated `equity_gap` scenario exercises the C3 alert, and a unit test asserts it fires on a crafted 20%-vs-pooled gap.
2. **C4 protected against small cells** — an alert now requires a segment of at least 10 people and at least 5 events; a unit test asserts a 7-person false-negative cluster is never disclosed.
3. **Small samples excluded from pooled totals** — 10–29 segments remain visible in the table but no longer feed headline reach/adoption/closed-loop figures.
4. **Wilson intervals on headline figures** — the observatory displays 95% intervals for reach, adoption and closed-loop completion using the shared `src/lib/wilson.ts`.
5. **Secondary suppression hardened** — one complementary neighbor is suppressed for each primary cell, not only one per dimension.
6. **Benchmark fairness** — both arms now use the same attendance mechanism (no MediSense-only level boost), both are invited at the same capacity K, and per-arm attendance outcomes are stored separately so overlapping invitations cannot contaminate the other arm.
7. **Scenario selector** — the observatory can switch between baseline, MNAR missing, under-reporting, incomplete history and equity-gap scenarios.
8. **Testable pathway policy** — consent and invitation rules moved to `src/server/pathwayPolicy.ts`, covered by 6 unit tests; safeguards have 4 new tests and benchmark equity has 3.
9. **Tests** — `npm test` now runs 44 tests; all pass.

## P1-B Clinical Fidelity Applied (2026-11-15)

1. **WHO growth LMS** — added `src/config/growth/who-bmi-for-age-5-19.json` and `who-weight-for-height-65-120.json`, transcribed from the official WHO expanded tables, plus `src/server/growthReference.ts`. BMI-for-age and weight-for-height Z-scores are computed when not supplied; values outside the published domain stay null (Grey).
2. **Care schedules** — added versioned `src/config/schedules/care-schedules.v1.json` (WCV ages, cervical 36, mammography 24, colorectal 24, IFHAS 12 months) and `src/server/careSchedules.ts`. These are declared V3/V4 starting values, exposed in governance status.
3. **A4** — the 3-year glycemic-screening interval is required; an unknown date is missing data, not an assumed accelerator.
4. **A7** — colorectal screening is capped at 75 years.
5. **A9** — an Orange/Red orientation not honoured within its window produces a closed-loop interrupted-follow-up flag.
6. **A11** — preeclampsia applies from 20 weeks; before 20 weeks the elevated BP is handled by A1; missing gestational age is surfaced as missing data.
7. **P6** — M-CHAT-R 3–7 now requires the follow-up interview; a positive follow-up refers, a negative one closes the screen.
8. **P3** — missed WCV count can be derived from the age at the last visit using the versioned schedule.
9. **Tests** — 58 tests total; growth-reference tests cover published median/SD cells and domain boundaries.
