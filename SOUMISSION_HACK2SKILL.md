# 📋 Soumission Officielle — Future Health Digital Innovation Challenge
**Projet : MediBenin (CareX Team)**  
**URL Prototype Live : https://medibenin.onrender.com**  
**Défi Ciblé :** `[Santé des populations] Prévention et dépistage de précision` *(Challenge 04 : Precision Prevention and Screening)*

---

## 1. Défi à sélectionner dans le menu déroulant *

> ✅ **`[Santé des populations] Prévention et dépistage de précision`**

---

## 2. Résumé de la solution — `Solution Summary` * (Max 2000 caractères)

### 👉 Version en Anglais (Recommandée pour le jury — 1 966 caractères / 2000) :
```text
In population health and preventive care, translating early risk detection into confirmed, completed consultations remains a vital challenge. While modern screening identifies valuable chronic and pediatric health indicators, ensuring that every individual and family smoothly reaches timely follow-up is essential to achieving lasting impact.

MediBenin addresses Challenge 04 (Precision Prevention and Screening) with an auditable, closed-loop platform that connects precision detection directly to a completed doctor's visit across children, adults, and communities:

1. Transparent Clinical Stratification: Analyzes biometrics and history against published guidelines (WHO HEARTS, CVD charts, ADA, WHO LMS growth) across 7 risk dimensions. Instead of opaque generative AI, clinicians receive structured alerts with explicit risk tiers (Green/Orange/Red) and certainty ratings (Established/Probable/Possible), validating or adapting care plans in 1 click.

2. Proactive Care Coordination: Prevents patient drop-off by isolating logistics from clinical decision-making. Coordinators manage a dynamic queue scored by clinical urgency, care gap, and travel time. A calibrated predictive model identifies no-show risks, triggering supportive multilingual invitations (WhatsApp/SMS) in seconds.

3. Family QR Pass & Citizen Sovereignty: Consolidates adult checkups and pediatric Well-Child Visits under a single scannable household QR code for bundled clinic check-ins. Citizens maintain full data sovereignty through 5 independent consent toggles (assessment, reminders, sharing, affiliation, research).

4. Public Health Equity Observatory: Equips health authorities with real-time territorial surveillance, using robust Wilson 95% confidence intervals and automated small-cell suppression (n < 10) to protect citizen privacy while targeting underserved areas.

MediBenin turns precision screening into delivered care, keeping medical judgment firmly in human hands.
```

### 👉 Version en Français (1 894 caractères / 2000) :
```text
En santé des populations et en médecine préventive, l'un des défis majeurs consiste à transformer la détection précoce en consultations effectives. Si le dépistage identifie des indicateurs précieux chez l'enfant et l'adulte, assurer un suivi rapide et coordonné jusqu'au centre de santé demeure un enjeu déterminant.

MediBenin répond au Défi 04 (Prévention et dépistage de précision) par une plateforme en boucle fermée reliant la détection du risque à une visite confirmée, pour les enfants, les adultes et les communautés :

1. Stratification Clinique Transparente : Évalue constantes et antécédents selon les recommandations officielles (OMS HEARTS, CVD, ADA, croissance infantile LMS) sur 7 dimensions de risque. Sans boîte noire, le médecin reçoit des alertes structurées avec niveaux de risque (Vert/Orange/Rouge) et indices de certitude (Établi/Probable/Possible), validant ou adaptant les soins en 1 clic.

2. Coordination de Soins Proactive : Évite les ruptures de suivi en isolant la logistique de la décision médicale. Le coordinateur gère une file priorisée par urgence clinique, retard et temps de trajet. Un modèle calibré prédit le risque d'absence pour déclencher des relances par WhatsApp/SMS en quelques secondes.

3. Pass QR Famille & Choix Réel : Regroupe le suivi adulte et pédiatrique au sein d'un compte unique. Un Pass QR familial scannable mutualise les consultations au centre de santé. Le citoyen garde le contrôle via 5 leviers de consentement (évaluation, rappels, partage, affiliation, recherche).

4. Observatoire d'Équité Territoriale : Offre aux autorités sanitaires un suivi en temps réel avec intervalles de confiance Wilson à 95 % et masquage automatique des petits effectifs (n < 10) pour préserver la vie privée tout en ciblant les zones sous-dotées.

MediBenin fait du dépistage de précision un soin réel, maintenant l'humain au cœur de chaque décision.
```

---

## 3. Étape de la solution *
> ✅ **`Prototype`**

---

## 4. Qu’est-ce qui a été construit pendant ce défi ? * (Max 1500 caractères)

### 👉 Version en Anglais (Recommandée — 1 475 caractères / 1500) :
```text
Built during the challenge period (Oct–Nov 2026) for Challenge 04 (Precision Prevention and Screening):

• Full-Stack Architecture: React 19 + Vite + Express + Drizzle ORM + Neon Postgres, deployed live on Render Free. Bilingual EN/FR, mobile-responsive, WCAG-informed accessible design.

• 4 Role-Based Portals: Fully functional UIs and real API endpoints for Clinicians, Care Coordinators, Patients/Families, and Public Health.

• Risk Stratification Engine (Req 1): Deterministic rules (WHO/ESC/HAS guidelines) across 7 risk dimensions (hypertension, diabetes, obesity, smoking, CVD, respiratory, preventive) with Level + Certainty flags (Established/Probable/Possible).

• Separated Workspaces (Req 2): Clinicians validate or adapt care plans in 1 click. Coordinators manage a composite queue (urgency × reachability × recency) with a calibrated no-show model for 1-click WhatsApp/SMS outreach.

• Family QR Pass & Consent (Req 3 & 5): Grouped visit booking for adult + up to 3 affiliated children with a scannable household QR code. 5-toggle granular consent framework (assessment, reminders, data sharing, affiliation, research).

• Equity Observatory (Req 4): Real-time coverage dashboard with Wilson 95% confidence intervals, automated small-cell suppression (n<10), and actionable gap alerts.

• Performance & Reliability: Parallel DB queries (<85ms), promise-singleton initialization, server warmup, keep-alive self-ping, validated by 51 automated acceptance tests.
```

### 👉 Version en Français (1 408 caractères / 1500) :
```text
Construit pendant le défi (oct–nov 2026) en réponse au Défi 04 (Prévention et dépistage de précision) :

• Application Full-Stack : React 19 + Vite + Express + Drizzle ORM + Neon Postgres, déployée sur Render Free. Bilingue FR/EN, responsive mobile, conception accessible (WCAG).

• 4 Portails Dédiés : Interfaces complètes et API réelles pour Médecin, Coordinateur de soins, Patient/Famille et Santé Publique.

• Moteur Clinique Déterministe (Exig. 1) : Règles (OMS/ESC/HAS) sur 7 dimensions de risque (hypertension, diabète, obésité, tabac, cardiovasculaire, respiratoire, préventif) avec drapeaux Niveau + Certitude (Établi/Probable/Possible).

• Séparation des Espaces (Exig. 2) : Validation du médecin en 1 clic. File coordinateur priorisée (urgence × joignabilité × délai) avec modèle logistique de no-show pour relances WhatsApp/SMS.

• Pass QR Famille & Consentement (Exig. 3 & 5) : Visites groupées adulte + jusqu'à 3 enfants avec QR code unique. Cadre de consentement granulaire à 5 leviers (évaluation, rappels, partage, affiliation, recherche).

• Observatoire d'Équité (Exig. 4) : Suivi avec intervalles de confiance Wilson à 95 %, masquage automatique des petits effectifs (n<10) et alertes de disparités géographiques.

• Performance & Robustesse : Requêtes DB parallélisées (<85ms), init par singleton, préchauffage serveur, keep-alive self-ping, validé par 51 tests d'acceptance automatisés.
```

---

## 5. Type de technologie *
> - [x] **`Application logicielle`**
> - [x] **`Analytique`**

---

## 6. Lien prototype/déploiement *
> **`https://medibenin.onrender.com`**

---

## 7. Conflit d'intérêts *
> - [x] **`Aucun. Aucun membre de notre équipe n'a de conflit d'intérêts à déclarer.`**

---

## 8. Votre solution est-elle logicielle, matérielle, ou les deux ? *
> - [x] **`Logiciel`**

---

## 9. Lien vidéo de démonstration * (Moins de 3 minutes)
> Collez votre lien YouTube (Non répertorié/Public) ou Google Drive (Accessible à tous).
