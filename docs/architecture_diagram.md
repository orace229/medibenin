# Architecture et Diagrammes de Modélisation MediBenin

Ce document rassemble les diagrammes d'architecture, de données et de workflow pour la plateforme **MediBenin** (CareX).

---

## 1. Vue d'Ensemble des Composants Système (Architecture 3-Tiers & Microservices)

```mermaid
graph TD
    subgraph Client Layer (Flutter Cross-Platform)
        AppMobile[Application Mobile Flutter - Android Prioritaire]
        AppWeb[Application Web / PWA Flutter]
    end

    subgraph Core Backend Layer (Django / PostgreSQL)
        DjangoAPI[Core API Django REST Framework]
        DB[(Base de données PostgreSQL + JSONB)]
        FirebaseAuth[Firebase Auth - SMS OTP]
    end

    subgraph AI Microservice Layer (Python FastAPI)
        FastAPI[Microservice Inférence IA]
        MetaMMS[Meta MMS - ASR ASR/TTS Fon/Yoruba/Bariba]
        AfriNLLB[AfriNLLB - Traduction Pivot vers FR]
        MedGemma[MedGemma 4B/27B - Raisonnement Clinique]
        RulesEngine[Moteur de Règles Déterministe PCIME / TETU]
        XAI[Calculateur Explicabilité SHAP / LIME]
    end

    subgraph External Integrations Layer
        SMSGateway[Passerelle SMS - Twilio / Celcom]
        MobileMoney[APIs Mobile Money - MTN / Moov FCFA]
        DHIS2[API National Santé DHIS2]
    end

    AppMobile -->|HTTPS / REST| DjangoAPI
    AppWeb -->|HTTPS / REST| DjangoAPI
    AppMobile -->|Auth SMS| FirebaseAuth
    
    DjangoAPI -->|Read/Write| DB
    DjangoAPI -->|Inférence Async/Sync| FastAPI

    FastAPI --> MetaMMS
    MetaMMS --> AfriNLLB
    AfriNLLB --> RulesEngine
    RulesEngine -->|Si Signe Danger| TriageRouge[Urgence Vitale Imposée]
    RulesEngine -->|Si Aucun Danger| MedGemma
    MedGemma --> XAI

    DjangoAPI -->|Suivi + Rappels| SMSGateway
    DjangoAPI -->|Paiement Téléconsultation| MobileMoney
    DjangoAPI -->|Données Épidémiologiques Anonymisées| DHIS2
```

---

## 2. Diagramme d'État & Workflow de Triage Clinique

```mermaid
stateDiagram-v2
    [*] --> DescriptionSymptomes : Voix (Fon/Yoruba/Bariba) / Texte / Photo / Température
    DescriptionSymptomes --> TranscriptionEtTraduction : Meta MMS + AfriNLLB -> Texte Français Pivot
    
    TranscriptionEtTraduction --> VerificationSignesDanger : Evaluation PCIME / TETU
    
    VerificationSignesDanger --> CAS_ROUGE : Signe Général de Danger Présent OR Temp >= 39.5°C
    VerificationSignesDanger --> RaisonnementMedGemma : Aucun Signe de Danger Immédiat
    
    RaisonnementMedGemma --> GravityEvaluation : Inférence LLM + Explication SHAP/LIME
    
    GravityEvaluation --> CAS_ROUGE : Risque Vital Détecté (10%)
    GravityEvaluation --> CAS_ORANGE : Modéré - Besoins Soins 24-48h (20%)
    GravityEvaluation --> CAS_VERT : Léger - Auto-Soins (70%)
    
    CAS_ROUGE --> OrientHôpital : Carte Hôpital + Appel SAMU + Alerte GPS Proche
    CAS_ORANGE --> OrientCentreSante : Téléconsultation Vidéo + Prise de Rendez-vous
    CAS_VERT --> OrientPharmacie : Conseil Auto-soins + Envoi Ordonnance Pharmacie
    
    OrientHôpital --> SuiviPostConsultation : SMS Suivi à +48h
    OrientCentreSante --> SuiviPostConsultation : SMS Suivi à +48h
    OrientPharmacie --> SuiviPostConsultation : SMS Suivi à +48h
    
    SuiviPostConsultation --> [*]
```

---

## 3. Schéma Conceptuel des Données (MCD / Entités Pydantic & ORM)

```mermaid
erDiagram
    PATIENT_PROFILE ||--o{ SYMPTOM_PAYLOAD : submits
    PATIENT_PROFILE ||--o{ TRIAGE_RESULT : receives
    TRIAGE_RESULT ||--|| XAI_EXPLANATION : contains
    TRIAGE_RESULT }|--|| HEALTH_FACILITY : recommends
    PATIENT_PROFILE ||--o{ POST_CONSULTATION_FOLLOWUP : tracks

    PATIENT_PROFILE {
        string patient_id PK
        string first_name_or_nickname
        float age_years
        string age_group
        string preferred_language
        string phone_number_hash
        string departement
        string commune
    }

    SYMPTOM_PAYLOAD {
        string session_id PK
        string input_mode
        string raw_transcribed_text
        string french_translated_text
        float temperature_celsius
        boolean has_pcime_danger_sign
    }

    TRIAGE_RESULT {
        string triage_id PK
        string urgency_level
        boolean rule_based_override
        string presumed_icd10_code
        string recommended_facility_type
        string immediate_advice_fr
    }

    HEALTH_FACILITY {
        string facility_id PK
        string name
        string facility_type
        string departement
        string commune
        float latitude
        float longitude
    }
```
