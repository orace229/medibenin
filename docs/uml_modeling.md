# Modélisation UML Ajustée - Plateforme MediBenin (CareX)

Ce document rassemble les **diagrammes UML révisés** selon les spécifications précises des acteurs retenus pour **MediBenin** :
- **Patient** : Représente le patient direct ET le proche/parent qui saisit les informations pour lui.
- **Médecin** : Acteur connecté actif de la plateforme (téléconsultation vidéo, audit/validation).
- **Pharmacie & Centres de Soins** : Partenaires hors plateforme (référencés pour l'orientation et la cartographie, mais sans compte/connexion requis).
- **Système / Microservice IA** : Acteur système automatisé (triage, transcription MMS, traduction AfriNLLB, MedGemma, règles PCIME).

---

## 1. Diagramme de Cas d'Utilisation (Use Case Diagram Ajusté)

```mermaid
graph TD
    %% Acteurs Utilisateurs Connectés
    Patient((👤 Patient / Représentant))
    Medecin((👨‍⚕️ Médecin Connecté))
    SystemeIA((🤖 Système MediBenin & IA))

    %% Partenaire Hors Plateforme (Référencé uniquement)
    Pharmacie[🏥 Pharmacie Partenaire - Hors Plateforme]
    Hopital[🏥 Hôpital / Centre de Santé - Hors Plateforme]

    subgraph Plateforme MediBenin
        UC1[Décrire les symptômes - Voix/Texte/Photo/Température]
        UC2[Recevoir le Triage & Recommandation - Vert/Orange/Rouge]
        UC3[Localiser le Centre de Santé ou Hôpital le plus proche]
        UC4[Localiser la Pharmacie partenaire la plus proche]
        UC5[Déclencher l'Alerte Urgence Vitale - Cas Rouge]
        UC6[Planifier & Réaliser la Téléconsultation Vidéo]
        UC7[Recevoir le Compte-Rendu / Ordonnance de conseils]
        UC8[Recevoir le Suivi Automatique SMS à +48h]

        UC9[Effectuer la Téléconsultation Vidéo - 15 min]
        UC10[Auditer & Valider les cas de triage à risque]
    end

    %% Interactions Patient
    Patient --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4
    Patient --> UC5
    Patient --> UC6
    Patient --> UC7
    Patient --> UC8

    %% Interactions Système IA
    UC1 -.->|Analyse PNL / Règles| SystemeIA
    SystemeIA -.->|Génère| UC2
    SystemeIA -.->|Envoi SMS| UC8

    %% Interactions Médecin Connecté
    Medecin --> UC9
    Medecin --> UC10
    UC6 -.->|Relie| UC9

    %% Orientation vers partenaires hors plateforme
    UC3 -.->|Oriente vers| Hopital
    UC4 -.->|Oriente vers| Pharmacie
```

---

## 2. Diagramme de Séquence : Parcours Simplifié Patient - Système - Médecin

```mermaid
sequenceDiagram
    autonumber
    actor Patient as 👤 Patient (ou Proche)
    participant App as App / Web MediBenin
    participant IA as 🤖 Système IA & Règles
    actor Medecin as 👨‍⚕️ Médecin Connecté
    participant External as 📍 Partenaires (Hôpitaux/Pharmacies - Hors Plateforme)

    Patient->>App: Saisie des symptômes (Voix/Texte/Photo/Température)
    App->>IA: Transmet le payload symptômes
    IA->>IA: Évalue les règles PCIME + Analyse NLP/LLM
    
    alt CAS ROUGE (Urgence Vitale)
        IA-->>App: Triage ROUGE (Alerte immédiate)
        App->>Patient: Affiche Carte Hôpital le plus proche + Bouton Appel Urgence
        App-.->External: Localise l'Hôpital le plus proche (Hors Plateforme)
    else CAS ORANGE (Besoin Téléconsultation)
        IA-->>App: Triage ORANGE (Téléconsultation recommandée)
        App->>Patient: Propose sélection Médecin & Paiement Mobile Money
        Patient->>App: Valide la séance de téléconsultation
        App->>Medecin: Notifie le Médecin Connecté pour la session vidéo
        Medecin->>App: Effectue la vidéo consultation (15 min)
        Medecin->>App: Envoie compte-rendu / conseils
        App-->>Patient: Transmet le compte-rendu par SMS/App
    else CAS VERT (Léger - Auto-soins)
        IA-->>App: Triage VERT (Conseils & Ordonnance de conseils)
        App->>Patient: Affiche la liste des Pharmacies partenaires proches (Hors Plateforme)
    end
```

---

## 3. Diagramme de Classes Révisé (Modèle Simplifié)

```mermaid
classDiagram
    class PatientProfile {
        +String patientId
        +String firstNameOrNickname
        +boolean isRepresentedByRelative
        +float ageYears
        +AgeGroup ageGroup
        +LocalLanguage preferredLanguage
        +String phoneNumberHash
        +LocationInfo location
    }

    class SymptomPayload {
        +String sessionId
        +InputMode inputMode
        +String frenchTranslatedText
        +float temperatureCelsius
        +DangerSignCheck dangerSigns
    }

    class TriageResult {
        +String triageId
        +TriageUrgency urgencyLevel
        +String presumedConditionName
        +FacilityType recommendedFacilityType
        +String immediateAdviceFr
    }

    class MedecinProfile {
        +String medecinId
        +String fullName
        +String specialty
        +String licenseNumber
        +boolean isAvailableForTeleconsultation
    }

    class OffsitePartnerFacility {
        +String facilityId
        +String name
        +FacilityType type
        +String commune
        +float latitude
        +float longitude
    }

    PatientProfile "1" -- "0..*" SymptomPayload : transmet
    SymptomPayload "1" -- "1" TriageResult : produit
    PatientProfile "0..*" -- "0..1" MedecinProfile : consulte_en_teleconsultation
    TriageResult "1" ..> OffsitePartnerFacility : oriente_vers_hors_plateforme
```
