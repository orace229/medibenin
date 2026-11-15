# MediBenin — Parcours Utilisateurs Détaillés

**Plateforme :** Prévention & Dépistage de Précision (Défi 04 · Future Health Digital Innovation Challenge 2026)
**Version :** 1.0 · Novembre 2026
**Périmètre :** 4 profils utilisateurs · Données 100 % synthétiques en mode démo

---

## Table des matières

1. [Vue d'ensemble du système](#1-vue-densemble-du-système)
2. [Parcours — Patient / Citoyen](#2-parcours--patient--citoyen)
3. [Parcours — Médecin / Clinicien](#3-parcours--médecin--clinicien)
4. [Parcours — Coordinateur de soins](#4-parcours--coordinateur-de-soins)
5. [Parcours — Agent de santé publique](#5-parcours--agent-de-santé-publique)
6. [Parcours transversaux](#6-parcours-transversaux)
7. [Règles cliniques embarquées](#7-règles-cliniques-embarquées)
6. [Parcours — Agent de santé publique](#6-parcours--agent-de-santé-publique)
7. [Parcours transversaux](#7-parcours-transversaux)
8. [Règles cliniques embarquées](#8-règles-cliniques-embarquées)

---

## 1. Vue d'ensemble du système

MediBenin est une plateforme de prévention et de dépistage de précision qui relie **règles cliniques publiées**, **validation médicale humaine** et **engagement patient** en un parcours fermé (*closed-loop*). Chaque risque détecté est tracé jusqu'à une visite préventive effectuée ou un refus documenté.

### Architecture fonctionnelle

```
   PATIENT / CITOYEN                MÉDECIN                   COORDINATEUR         SANTÉ PUBLIQUE
        │                               │                            │                     │
  [Profil & consentements]    [Liste patients + niveaux]   [File d'attente]    [Observatoire équité]
        │                               │                            │                     │
  [Auto-déclaration]          [Évaluation clinique]         [Envoi invitations]  [Indicateurs agrégés]
        │                               │                            │                     │
  [Réponse à invitation]      [Validation & invitation]     [Suivi relances]     [Alertes zones]
        │                               │                            │
  [Code QR à l'accueil]       [Confirmation visite]        [Score logistique ML]
        │                               │
  [Résultat → statut DONE]    [Conclusion + audit]
```

### Les 5 niveaux de priorité

| Niveau | Couleur | Signification |
|---|---|---|
| **Rouge** | 🔴 | Urgence — besoin de soin immédiat |
| **Orange** | 🟠 | Prioritaire — à traiter sous 30 jours |
| **Jaune** | 🟡 | À planifier — visite préventive à programmer |
| **Vert** | 🟢 | À jour — aucune action requise |
| **Gris** | ⬜ | Données insuffisantes — évaluation incomplète |

### Les 3 niveaux de certitude

| Certitude | Signification |
|---|---|
| **Élevée** | Mesures cliniques récentes et complètes |
| **Moyenne** | Données partiellement auto-déclarées ou > 12 mois |
| **Faible** | À confirmer par une nouvelle mesure clinique |

### Les 8 états du parcours de soin

```
created → validated → invited → scheduled → (postponed) → done
                                           → overdue
                                           → refused
```

---

## 2. Parcours — Patient / Citoyen

**Profil de démonstration :** Tariq Al-Nadim, 36 ans · Dossier personnel + enfants affiliés
**Rôle système :** `patient` (inclut la gestion des enfants affiliés)
**Accès :** Portail Patient Unifié

> [!NOTE]
> Il n'existe qu'**un seul portail citoyen**. Qu'il s'agisse d'un adulte seul ou d'un parent avec enfants affiliés, l'interface est identique. Les fonctionnalités liées aux enfants apparaissent automatiquement si des enfants sont rattachés au compte.

### 2.1 Connexion et première découverte

```
1. L'utilisateur arrive sur la page d'accueil (Landing Page)
2. Il clique sur "Essayer la démo en direct" ou "Accéder au portail"
3. Sur la page de connexion → catégorie "Citoyens"
4. Il sélectionne le profil "Portail Patient Unifié"
   Email prérempli : tariq.nadim@demo.medisense.example
   Mot de passe : MediSense-Demo-2026
5. Connexion → le système vérifie le token et charge le profil
6. Redirection vers le Portail Patient (onglet "Accueil")
```

### 2.2 Tableau de bord — Onglet Accueil (`home`)

À l'ouverture, le patient voit :

- **Bandeau de niveau global** : indicateur coloré (rouge/orange/jaune/vert/gris) + badge de certitude
- **Résumé de la raison principale** : phrase synthétique expliquant pourquoi ce niveau est attribué
- **Carte de progression** : X visites préventives accomplies sur Y recommandées
- **Prochaine action** : date et nature de la prochaine visite à effectuer
- **Enfants affiliés** *(si des enfants sont rattachés au compte)* : aperçu de l'état de chaque enfant

> Le patient ne voit **jamais** de formulation diagnostique — uniquement des niveaux de priorité et des invitations à consulter.

### 2.3 Onglet Bilan de santé (`checkup`)

Le patient peut **auto-déclarer** ses données de santé :

```
Formulaire d'auto-déclaration :
├── Mesures physiques (poids, taille, tour de taille)
├── Tension artérielle (3 mesures possibles si écart > 10 mmHg)
├── Antécédents familiaux
├── Facteurs FINDRISC (alimentation, activité physique, tabac, historique glycémique)
├── Historique vaccinal
├── Symptômes d'alerte (drapeau rouge → suspension du parcours routine)
└── Résultat génomique existant (optionnel, avec consentement spécifique)
```

**Après soumission :**
1. Le serveur recalcule le niveau (moteur de règles cliniques)
2. Le score CVD WHO 10 ans est recalculé si les données sont complètes
3. Le score FINDRISC est mis à jour
4. Le niveau et la certitude sont mis à jour en temps réel
5. L'onglet "Mon parcours" se met à jour avec les nouvelles recommandations

### 2.4 Onglet Mon parcours (`journey`)

Affiche toutes les **recommandations actives** pour ce patient :

```
Pour chaque recommandation :
├── Titre du parcours (ex. "Bilan cardiovasculaire annuel")
├── Actions groupées (ex. "Mesure TA · Glycémie à jeun · Consultation médecin")
├── Source clinique (ex. "WHO HEARTS · IFHAS")
├── Niveau de priorité (badge coloré)
├── État actuel (created / validated / invited / scheduled / done...)
├── Date d'échéance
├── Code de référence à 8 caractères (pour l'accueil du centre)
└── Texte d'aide à la décision (explication non-médicale)
```

**Actions disponibles pour le patient :**

| Action | Résultat | Condition |
|---|---|---|
| **Confirmer** | État → `scheduled` | Invitation reçue |
| **Reporter** | État → `postponed` + nouvelle date | Invitation reçue |
| **Décliner** | État → `refused` + motif | Invitation reçue · sans impact sur la prise en charge |
| **Voir aide à la décision** | Modal explicatif non-médical | Toujours disponible |
| **Code QR** | Affiche le pass QR 8 caractères | Visite planifiée |

#### Le pass QR — clé de fermeture de boucle

Quand une visite est planifiée, le patient reçoit un **code à 8 caractères** (ex. `MB-4F2A`) à présenter à l'accueil du centre de santé. Le médecin entre ce code pour confirmer la visite → état → `done`.

```
Patient planifie → reçoit code QR → se présente au centre → 
donne le code à l'accueil → médecin confirme → boucle FERMÉE ✓
```

### 2.5 Onglet Notifications (`notifications`)

```
Filtres : Toutes | Non lues | Action requise

Chaque notification contient :
├── Titre et corps du message
├── Canal d'envoi (SMS / WhatsApp / App)
├── Résumé d'aide à la décision
├── Validation humaine : "Validé par Dr. [nom]" (jamais automatique)
└── Boutons d'action directs (Confirmer / Reporter / Décliner)
```

> **Garantie clé :** Aucune notification n'est envoyée sans validation préalable par un médecin.

### 2.6 Onglet Profil (`profile`)

- Préférences de langue (EN/FR)
- Canal de contact préféré (SMS / WhatsApp / App)
- Préférence praticien féminin
- Centre de santé rattaché

### 2.7 Onglet Confidentialité (`privacy`)

```
Consentements granulaires (modifiables à tout moment) :
├── ☑ Évaluation & calendrier préventif
├── ☑ Rappels multicanaux
├── ☑ Partage avec le centre de santé rattaché
├── ☑ Statistiques anonymes pour la santé publique
└── ☐ Résultat génomique existant (désactivé par défaut)

Journal d'accès aux données (audit complet) :
└── Qui a consulté quoi, quand, dans quel but, avec quelle règle
```

### 2.8 Accès aux dossiers des enfants affiliés

Si des enfants sont rattachés au compte, le patient peut y accéder directement depuis son portail :

```
1. Dans l'onglet Accueil → section "Enfants affiliés"
2. Cliquer sur un enfant → demande de vérification OTP SMS
3. Entrer le code reçu par SMS → accès au dossier enfant
4. Navigation identique au dossier adulte (bilan, parcours, notifications)
5. Retour au dossier personnel via le sélecteur de profil
```

**Affiliation d'un enfant (faite côté clinicien) :**

```
1. Le médecin ou coordinateur crée le dossier enfant dans le système
2. Il recherche le parent par ID patient (formulaire clinicien)
3. L'enfant est affilié au compte du parent dans la base de données
4. Le parent reçoit une notification → peut désormais accéder au dossier enfant
```

**Passage à la majorité (18 ans) :**

```
1. Le système détecte que l'enfant atteint 18 ans
2. Un flag "Détachement à la majorité" apparaît dans le portail clinicien
3. Le patient (ancien enfant) peut initier la demande de détachement
4. Le médecin / coordinateur valide → le compte devient autonome
5. Le dossier parental n'affiche plus cet enfant
```

---

## 3. Parcours — Médecin / Clinicien

**Profil de démonstration :** Dr. Sydney Kpegbe · Consultation clinique
**Rôle système :** `clinician`
**Accès :** Portail Clinicien

### 3.1 Liste des patients

À l'ouverture, le médecin voit :

```
En-tête synthétique :
├── Nombre de patients Rouges (urgents)
├── Nombre de patients Gris (données insuffisantes)
└── Total de patients dans le panel

Liste des patients (triée par niveau de priorité) :
├── Nom · Âge · Type de parcours (enfant / adolescent / adulte)
├── Niveau global (badge coloré)
├── Certitude
├── Résumé de la raison principale
├── Prochaine date d'échéance
└── Centre de santé rattaché
```

**Filtres :** Niveau (rouge/orange/jaune/vert/gris) · Recherche par nom

### 3.2 Évaluation guidée d'un patient

Le médecin sélectionne un patient → onglets disponibles :

```
Onglets du dossier patient :
├── Résumé        — vue synthétique niveau + flags + plan de soin
├── Profil        — données cliniques complètes
├── Formulaire    — saisie / mise à jour des données cliniques
├── Invitation    — prévisualisation et envoi d'invitation
├── Conclusion    — enregistrement du résultat de visite
└── Données       — données brutes et audit FHIR
```

#### Formulaire d'évaluation clinique

```
Section 1 — Identité & contexte
├── Nom, âge, sexe, groupe de nationalité
├── Type de parcours (enfant / adolescent / adulte)
├── Centre de santé, langue préférée, canal de contact
└── Préférence praticien féminin

Section 2 — Mesures anthropométriques
├── Poids (kg), taille (cm), IMC calculé automatiquement
├── Tour de taille (cm)
├── Âge gestationnel (si applicable)
└── MUAC (périmètre brachial, pour les enfants)

Section 3 — Tension artérielle (protocole 3 mesures)
├── Lecture 1 (systolique / diastolique)
├── Lecture 2
├── Lecture 3 (si écart > 10 mmHg sys ou > 6 mmHg dia)
└── Valeur retenue calculée automatiquement

Section 4 — Profil métabolique & FINDRISC (8 items)
├── IMC ajusté, tour de taille
├── Activité physique quotidienne
├── Consommation de légumes/fruits
├── Antécédents glycémiques
├── Médication antihypertensive
└── Antécédents familiaux de diabète

Section 5 — Facteurs cardiovasculaires (Modèle WHO CVD)
├── Pression artérielle systolique (retenue)
├── Statut tabagique
├── Statut diabétique
└── Traitements actuels

Section 6 — Pédiatrie spécifique
├── Vaccins effectués / manquants
├── Développement moteur et cognitif
└── Score de croissance (courbes WHO)

Section 7 — Génomique (si consentement)
├── Résultat génomique existant disponible
└── Type de signal génomique

Section 8 — Drapeaux d'urgence
└── Symptôme d'alerte rouge → suspension automatique du parcours routine
```

#### Résultats de l'évaluation

Après soumission, le serveur calcule et affiche :

```
Calculs cliniques (backend) :
├── Score CVD WHO 10 ans (avec intervalle de confiance)
│   └── Contrefactuels : "Si tension -10 mmHg → risque -X%"
├── Score FINDRISC (risque diabète type 2)
├── Zone de tension artérielle (cible / suivi / alerte)
├── Scores de croissance (Z-score poids/taille, IMC/âge)
├── Audit de certitude (% de complétude, ancienneté des données)
├── Eclipse safeguard (flag rouge → suspension parcours jaune)
├── Politique génomique (impact du résultat génomique)
└── Plan de soin consolidé (actions groupées par priorité)
```

### 3.3 Génération du résumé IA

```
1. Médecin clique "Générer résumé automatique"
2. Le serveur agrège les flags et recommandations
3. Un résumé structuré est produit (via règles, sans IA générative en production)
4. Badge "Résumé automatique issu des règles" affiché (jamais présenté comme IA autonome)
5. Le médecin peut modifier le résumé avant de le valider
```

### 3.4 Validation et envoi d'invitation

```
Étape 1 — Décision sur le parcours
├── Valider le plan de soin proposé par les règles
├── Modifier le niveau ou les actions (avec motif obligatoire)
└── Ignorer une recommandation (avec justification)

Étape 2 — Prévisualisation de l'invitation
├── Aperçu du message SMS / WhatsApp / App
├── Choix de la langue (EN / FR)
├── Contenu : titre · actions · date limite · code de référence
└── Mention légale : "Validé par Dr. [nom]"

Étape 3 — Envoi
├── Clic "Envoyer l'invitation validée"
├── État du parcours → "invited"
├── La notification apparaît dans le portail patient
└── Journal d'audit mis à jour (qui, quand, quelle règle)
```

### 3.5 Confirmation de visite par code QR

```
1. Le patient se présente au centre avec son code à 8 caractères
2. L'accueil saisit le code dans le champ "Confirmer la visite"
3. Le système vérifie le code (correspondance patient + recommandation)
4. État → "done"
5. Boucle de soin FERMÉE ✓
6. Enregistrement de la date, du praticien, du centre
```

### 3.6 Enregistrement de la conclusion

Après la visite :

```
1. Médecin ouvre l'onglet "Conclusion"
2. Saisit le statut : Réalisée / Reportée / Refusée
3. Notes de conclusion (facultatif)
4. Soumission → audit trail complet
5. Si conflit de synchronisation (agent hors-ligne vs centre) :
   → La décision du centre prévaut toujours
   → Le conflit est enregistré dans le journal d'audit
```

### 3.7 Export FHIR

```
1. Médecin clique "Exporter FHIR"
2. Le serveur génère un document FHIR R4 (application/fhir+json)
3── Bundle Patient + Observations + CarePlan + Flags
4. Téléchargeable pour archivage ou interopérabilité
```

### 3.8 Gestion de la majorité

```
Dans l'onglet "Données" → section "Affiliations"
├── Voir les enfants affiliés à un parent
├── Recherche de parent par ID (< 18 ans)
├── Validation du détachement à la majorité (18 ans)
└── Activation du compte adulte autonome
```

---

## 4. Parcours — Coordinateur de soins

**Profil de démonstration :** Orace A. · Files de relance
**Rôle système :** `coordinator`
**Accès :** Portail Coordinateur (via PopulationPortals)

### 4.1 File d'attente priorisée

Le coordinateur voit trois vues de sa file :

```
Onglet 1 — File priorisée
├── Tous les patients classés par score de priorité
├── Score = niveau (rouge > orange > jaune) × urgence × jours de retard
└── Action : envoyer invitation ou relance

Onglet 2 — Urgences (rouges uniquement)
├── Patients en niveau rouge uniquement
└── Tri par ancienneté de l'alerte

Onglet 3 — Données insuffisantes (gris)
├── Patients avec données incomplètes
└── Action : contacter pour compléter le profil
```

### 4.2 Envoi d'invitation (rôle partagé avec clinicien)

Le coordinateur peut envoyer des invitations validées par le médecin :

```
1. Sélectionner un patient dans la file
2. Vérifier que le médecin a validé le plan de soin
3. Prévisualiser le message
4. Envoyer → état → "invited"
5. Compteur de rappels mis à jour automatiquement
```

### 4.3 Score logistique ML (simulation)

```
Pour chaque patient, le coordinateur peut demander :
├── Probabilité de non-présentation (no-show) en %
├── Score de priorité logistique (Sprio)
├── Facteur M1 : probabilité de rendez-vous M+1
└── Recommandation : prioriser / relancer / attendre

Entrées du modèle :
├── Niveau global (rouge/orange/jaune/vert/gris)
├── Nombre de lacunes de soin ouvertes
├── Jours de retard maximum
├── Temps d'accès au centre (minutes)
└── Nombre de visites manquées historiques
```

### 4.4 Suivi des détachements à la majorité

```
1. Le coordinateur accède à "Détachements en attente"
2. Liste des patients ayant atteint 18 ans
3. Validation ou refus du détachement
4. Notification envoyée à l'ancien parent et au nouvel adulte
```

---

## 5. Parcours — Agent de santé publique

**Profil de démonstration :** Bienderan E. · Observatoire Population & Équité
**Rôle système :** `public_health`
**Accès :** Portail Observatoire (via PopulationPortals)

### 5.1 Tableau de bord population

```
Indicateurs globaux (panel de 53 patients synthétiques) :
├── Répartition par niveau (rouge / orange / jaune / vert / gris)
├── Taux de couverture préventive (% patients à jour)
├── Taux d'abandons et de refus
├── Temps moyen de fermeture de boucle (jours)
└── Score de stabilité du classement
```

### 5.2 Tableau des zones géographiques

```
Pour chaque zone :
├── Nom de la zone
├── Nombre de patients couverts
├── % de couverture préventive
├── Alerte si zone sous-couverte (règle C1)
└── Comparaison avec la moyenne nationale
```

### 5.3 Tableau d'équité — Segments protégés

```
Règle de protection : n < 10 masquage Wilson (aucune statistique affichée
si moins de 10 individus dans le segment → protection de la vie privée)

Segments analysés :
├── Groupe de nationalité
├── Tranche d'âge
├── Sexe
├── Type de parcours (enfant / adulte)
└── Centre de santé

Pour chaque segment :
├── Taux d'adoption de la plateforme
├── Taux de couverture préventive
├── Alerte d'écart d'équité si > seuil (règle C3)
└── Alerte faux-négatifs de gouvernance (règle C4)
```

### 5.4 Alertes de gouvernance automatiques

```
Règle C1 — Zone sous-couverte
  Déclencheur : couverture < seuil dans une zone géographique
  Action : alerte dans le tableau de bord + rapport exportable

Règle C3 — Écart d'équité de segment
  Déclencheur : taux d'adoption d'un segment < moyenne - X%
  Action : notification coordinateur + recommandation d'intervention

Règle C4 — Faux-négatifs de gouvernance
  Déclencheur : segment avec taux de faux-négatifs anormalement élevé
  Action : alerte médecin référent + audit déclenché
```

### 5.5 Ce que l'agent de santé publique ne voit PAS

> [!IMPORTANT]
> L'agent de santé publique n'a **jamais accès** aux données individuelles nominatives. Tous les indicateurs sont agrégés. Le masquage Wilson s'applique automatiquement pour tout segment avec n < 10 individus.

---

## 6. Parcours transversaux

### 6.1 Parcours de fermeture de boucle (closed-loop)

Le cœur du système — tracer chaque risque jusqu'à une visite accomplie :

```
[Règles cliniques]
      ↓
[Niveau assigné par le moteur]
      ↓
[Médecin valide → état : "validated"]
      ↓
[Invitation envoyée → état : "invited"]
      ↓
[Patient confirme → état : "scheduled"]
      ↓
[Patient se présente avec code QR]
      ↓
[Médecin confirme le code → état : "done"]
      ↓
[Boucle FERMÉE ✓ — enregistré dans le journal d'audit]
```

**Cas de divergence :**

| Situation | État final | Priorité |
|---|---|---|
| Patient reporte | `postponed` | Alerte si délai trop long → `overdue` |
| Patient decline | `refused` | Documenté, aucun impact sur la prise en charge |
| Visite non confirmée après X jours | `overdue` | Remonte dans la file coordinateur |
| Conflit agent hors-ligne vs centre | `done` (centre gagne) | Conflit enregistré dans audit |

### 6.2 Parcours de consentement

```
Consentements requis avant tout accès aux données :
1. Évaluation & calendrier préventif (obligatoire)
2. Rappels multicanaux (optionnel)
3. Partage avec le centre de santé (optionnel)
4. Statistiques anonymes (optionnel)
5. Résultat génomique (optionnel, désactivé par défaut)

Règles :
├── Le patient peut modifier ses consentements à tout moment
├── La révocation d'un consentement est immédiate
├── Chaque accès aux données est loggé avec le consentement actif
└── Sans consentement "évaluation", aucune recommandation n'est générée
```

### 6.3 Parcours d'urgence (Échappée E0)

```
Déclencheur : symptôme d'alerte rouge coché dans le formulaire

Résultat immédiat :
1. Tous les parcours préventifs routine sont SUSPENDUS
2. Un flag rouge d'urgence est créé (règle E0)
3. Le message affiché : "Consultez un service d'urgence immédiatement"
4. Les règles jaunes et vertes sont "éclipsées" (non affichées)
5. Les relances préventives sont stoppées
6. L'urgence est tracée dans le journal d'audit

Reprise après urgence :
1. Le médecin lève manuellement le flag E0
2. Le parcours préventif est restauré
3. Un bilan de synthèse post-urgence est généré
```

### 6.4 Parcours génomique

```
Activation : patient coche "J'ai un résultat génomique existant"

Règle G1 — Accélération cardiométabolique :
  Si signal génomique positif pour risque cardiovasculaire/diabète
  → Fréquence du bilan cardiométabolique augmentée

Règle G2 — Conseil génétique :
  Si signal nécessitant une expertise spécialisée
  → Référence vers un généticien (simulé)

Règle G3 — Garantie de non-substitution :
  Un résultat génomique négatif NE supprime JAMAIS un dépistage standard
  → Protection explicite contre le faux sentiment de sécurité
```

---

## 7. Règles cliniques embarquées

Toutes les règles sont auditables, versionnées, et liées à leur source publiée.

### Pédiatrie

| ID | Règle | Source |
|---|---|---|
| P1 | Dépistage de la malnutrition aiguë sévère | WHO Child Growth Standards |
| P3 | Adhérence au calendrier des visites pédiatriques | Well-Child Visit Guidelines |
| P4 | Calendrier vaccinal + rattrapage zéro-dose | Programme National de Vaccination |
| P5 | Dépistage de l'anémie de la petite enfance | WHO & Pédiatrie nationale |
| P6 | Suivi développemental précoce & autisme | Lignes directrices développement |
| P8 | Surveillance de la croissance & du poids | Courbes WHO de croissance |
| P10 | Dépistage lipidique précoce (antécédents familiaux) | Équité cardiovasculaire |
| P11 | Calendrier vaccinal adolescent | Programme adolescent national |

### Adulte

| ID | Règle | Source |
|---|---|---|
| A1 | Suivi de l'élévation tensionnelle | WHO HEARTS Technical Package |
| A2 | Évaluation du risque cardiovasculaire à 10 ans | WHO CVD Risk Charts 2019 |
| A3 | Dépistage du diabète de type 2 / glycémie | FINDRISC & ADA Guidelines |
| A4 | Dépistage métabolique adapté (origine asiatique) | Critères IMC ajustés OMS |
| A5 | Intervalle de dépistage du cancer du col | Lignes directrices nationales |
| A6 | Intervalle de mammographie | Programme cancer du sein |
| A7 | Dépistage colorectal (FIT / coloscopie) | Programme colorectal national |
| A8 | Bilan de santé périodique complet adulte | IFHAS Comprehensive Check |
| A9 | Continuité des soins des maladies chroniques | Protocole closed-loop IFHAS |
| A11 | Alerte tensionnelle maternelle (grossesse) | Protocole sécurité maternelle |

### Communauté & Sécurité

| ID | Règle | Source |
|---|---|---|
| C1 | Alerte zone géographique sous-couverte | Santé publique nationale |
| C3 | Alerte d'écart d'équité de segment | Gouvernance équité |
| C4 | Alerte faux-négatifs de gouvernance | Clinique gouvernance |
| G1 | Accélération cardiométabolique génomique | Protocole génomique |
| G2 | Référence conseil génétique | Spécialistes génétique |
| G3 | Garantie non-substitution génomique | Sécurité clinique |
| E0 | Échappée d'urgence — suspension du parcours routine | Protocole urgence MediBenin |
| GREY | Protocole données insuffisantes (jamais compté comme à jour) | Sécurité clinique |

---

## Annexe — Profils de démonstration

| Rôle | Prénom | Profil | Email démo |
|---|---|---|---|
| Patient / Citoyen | Tariq Al-Nadim | 36 ans · dossier personnel + enfants affiliés | tariq.nadim@demo.medisense.example |
| Médecin | Dr. Sydney Kpegbe | Consultation clinique | dr.kpegbe@demo.medisense.example |
| Coordinateur | Orace A. | Files de relance | orace.coord@demo.medisense.example |
| Santé publique | Bienderan E. | Observatoire population & équité | bienderan.epi@demo.medisense.example |

**Mot de passe universel démo :** `MediSense-Demo-2026`

> [!NOTE]
> Toutes les données sont 100 % synthétiques. Aucune donnée réelle de patient n'est utilisée. Le panel de démonstration contient 53 patients tirés d'une cohorte synthétique de 6 000 personnes, générée avec une graine déterministe (seed 20261120) pour une reproductibilité totale.

---

*Document généré pour le Future Health Digital Innovation Challenge 2026 — Défi 04 : Precision Prevention and Screening*
*MediBenin · Novembre 2026*
