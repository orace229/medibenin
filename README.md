# MediBenin — Precision Prevention and Screening (Challenge 04)

> **Future Health Digital Innovation Challenge 2026** · Population Health · **Challenge 04 : Precision Prevention and Screening**  
> **Team:** CareX (University of Abomey-Calavi — ENEAM, IFRI, FSS)  
> **Live Prototype:** [https://medibenin.onrender.com](https://medibenin.onrender.com)  
> **Evidence & Governance:** `/proof` (available directly on the platform)

---

## Overview

MediBenin is a precision-prevention platform designed to solve a critical operational gap in healthcare: **turning early risk detection into a completed, confirmed clinical consultation**. 

While screening programs identify early indicators across chronic and pediatric health, between 60% and 80% of screened individuals never reach follow-up care. MediBenin closes this loop across **children, adults, and communities** through an auditable, four-portal closed loop where clinical authority remains strictly in human hands.

```mermaid
flowchart LR
    A["1. Precision Screening"] --> B["2. Deterministic Rules Engine (SHA-256)"]
    B --> C["Clinician Workspace (1-Click Human Sign-off)"]
    B --> D["Care Coordinator Queue (Logistics Priority & Outreach)"]
    C & D --> E["Patient & Family Portal (Unified QR Pass)"]
    E --> F["Completed Clinic Visit (Closed-Loop Confirmation)"]
    F --> G["Public Health Observatory (Wilson 95% CI & Privacy)"]
    G -. Feedback Loop .-> A
```

---

## Key Features & Challenge 04 Alignment

| Pillar | How it Works | Evidence / Standard |
|---|---|---|
| **1. Transparent Clinical Stratification (Req 1)** | Evaluates 7 risk dimensions (hypertension, diabetes, obesity, smoking, CVD, respiratory, preventive). Surfaces explicit risk tiers (**Green / Orange / Red**) and certainty levels (**Established / Probable / Possible**). Zero generative AI black-box in clinical judgment. | WHO HEARTS, WHO 2019 Non-Lab CVD Risk Charts, ADA Diabetes Guidelines, WHO LMS Growth Standards (2006/2007). |
| **2. Strictly Separated Workspaces (Req 2)** | • **Clinician Portal:** Clinical review and 1-click human validation, adaptation, or deferral.<br>• **Coordinator Queue:** Logistics prioritization ($S_{prio}$) combining clinical urgency, overdue days, and travel time with a calibrated no-show model to dispatch WhatsApp/SMS invitations. | Principle AD-2: Rules govern clinical decisions; ML acts strictly on logistics. Ethical monotonicity (TEST-M1). |
| **3. Family QR Pass & Citizen Choice (Req 3 & 5)** | Groups adult checkups and pediatric Well-Child Visits under a single scannable household QR code (`IFH3692T`) for bundled check-ins. Citizens control their data via 5 granular consent toggles (assessment, reminders, sharing, affiliation, research). | Penalty-free refusal, audit logging, and scannable HMAC-verified orientation pass. |
| **4. Population Equity & Safeguards (Req 4)** | Real-time population surveillance with Wilson 95% confidence intervals on all proportions, automated small-cell suppression ($n < 10$), and secondary complementary masking to prevent re-identification. | Wilson Score Interval (1927), k-anonymity privacy safeguards. |

---

## 4 Role-Based Portals (Live Access)

The platform is deployed live on Render Free: **`https://medibenin.onrender.com`**.  
The landing page includes instant **Continue as Guest** one-click access buttons for all four roles:

| Portal | User Persona / Context | Role / Scope |
|---|---|---|
| **Clinician Workspace** | Dr. Sydney Kpegbe (Primary Care Physician) | `clinician` — Patient panel, clinical flags, 1-click validation |
| **Care Coordinator Queue** | Fatima Zahra (Care Coordinator) | `coordinator` — Prioritized triage list, no-show scoring, WhatsApp/SMS dispatch |
| **Patient & Family Portal** | Tariq Al-Nadim (Adult, 36y) + 3 children (Zayed 18m, Layla 14y, Youssef 18y) | `patient` — Household health view, scannable Family QR Pass, 5 consent toggles |
| **Public Health Observatory** | Population Health Directorate | `public_health` — Territorial coverage map, Wilson 95% CI, suppressed cells |

---

## Cold Start & Local Setup (Clean Machine)

### Prerequisites
- **Node.js 20.19+** (compatible with Vite 8 and React 19)
- **PostgreSQL 14+** (Local or Cloud PostgreSQL such as Neon Serverless)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Uriel-Hope/medibenin.git
cd medibenin

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your database parameters:

```bash
cp .env.example .env
```

Key environment variables in `.env`:
- `SQL_HOST`, `SQL_PORT`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`: PostgreSQL connection settings
- `DATABASE_URL`: Connection string (e.g. `postgresql://user:pass@host/dbname?sslmode=require`)
- `DEMO_MODE=true`: Enables instant access to demo personas and demo tokens
- `PORT=3000`: Local server port (defaults to 3000)

### 3. Database Schema Push & Seeding

```bash
# Push database schema (Drizzle ORM)
npm run db:push

# Start the development server
npm run dev
```

The application runs on `http://localhost:3000`.  
A reproducible synthetic cohort of **53 patient records** (PRNG seed `20261120`, including detailed clinical personas and pediatric profiles) is automatically seeded on startup if the database is empty.

### 4. Production Build

```bash
# Build production bundle (Vite)
npm run build

# Start production server
npm run start:prod
```

---

## Demonstration Tokens (API & Local Testing)

When `DEMO_MODE=true` is enabled, the following preconfigured tokens can be used for API requests or direct testing:

| Portal | Header / Token | Role |
|:---|:---|:---|
| **Patient & Family** (Tariq + 3 children) | `Bearer demo-token-patient` | `patient` |
| **Clinician Workspace** (Dr. Kpegbe) | `Bearer demo-token-clinician` | `clinician` |
| **Care Coordinator** | `Bearer demo-token-coordinator` | `coordinator` |
| **Public Health Observatory** | `Bearer demo-token-public-health` | `public_health` |

**Access Control (RBAC):** Every route implements a **deny-by-default** policy. Personal roles (`patient`) only have access to their own record and affiliated dependents. The `public_health` role has **zero** access to individual patient records—only aggregated, suppressed statistics.

---

## Clinical Fidelity & Cryptographic Governance

- **Signed Rule Table (SHA-256 HMAC):** The 22 clinical rules are sealed cryptographically (`getCanonicalSignedRuleTable`). The system strictly rejects unsigned or tampered tables (`TEST-S5`).
- **Epistemic Certainty:** Missing data never defaults to "healthy". Unscreened or missing inputs produce a **Level Grey** status requiring explicit data collection.
- **Pediatric LMS Standards:** BMI-for-age 5–19y (WHO 2007) and weight-for-height 65–120cm (WHO 2006) Z-scores are computed directly from official LMS tables (`interpolateLms`), avoiding rough approximations.
- **Offline Sync Conflict Resolution:** A formal authority lattice (Center > Coordinator > Field Worker) and state precedence (`done` > `postponed`, `refused` > `scheduled`) resolve disconnected field sync conflicts (`TEST-S1`).

---

## Testing & Quality Assurance

The codebase includes an automated test suite verifying clinical safety, ethical ML constraints, statistical safeguards, and regulatory requirements:

```bash
# Run the 58 automated unit & acceptance tests
npm test

# Run TypeScript type check
npm run lint

# Check UI compliance and forbidden terminology
npm run check:ui
```

All 58 tests pass out-of-the-box, verifying:
- **Clinical Safety (S):** Sync conflict lattice, Eclipse rule (Red suspends minor Yellow flags), Emergency escape E0, LMS child growth calculation.
- **Responsible ML (M):** Monotonicity invariant (TEST-M1: social vulnerability only increases support, never delays care), strict information barrier between logistics and clinician view (TEST-M2).
- **Challenge Requirements (E):** Wilson 95% confidence intervals, k-anonymity primary suppression ($n < 10$) and complementary neighbor masking (TEST-E4), Family QR Pass HMAC check (TEST-E5).
- **Access & Governance (G):** Deny-by-default RBAC, property-scoped access, versioned threshold integrity.

---

## License

Developed by **Team CareX** (University of Abomey-Calavi) for the Future Health Digital Innovation Challenge 2026.  
All clinical guidelines referenced (WHO, ADA, ESC) remain under their respective public domain / clinical use terms. Synthetic data only.
