# MediBenin â€” Cahier des charges

**PrÃ©vention et dÃ©pistage de prÃ©cision : enfants, adultes et communautÃ©s**

Future Health Digital Innovation Challenge 2026 Â· Population Health Â· **Challenge 04 : Precision Prevention and Screening**

| | |
| :--- | :--- |
| **Version** | 7.0, rÃ©visÃ©e aprÃ¨s revue critique Â« jury Â» (8 novembre 2026) |
| **Statut** | Document de travail de l'Ã©quipe, Ã  relire avant dÃ©pÃ´t. Les mentions **[Ã€ VÃ‰RIFIER]** renvoient au registre de la section 15.3 |
| **Ã‰quipe** | CareX (UniversitÃ© d'Abomey-Calavi : ENEAM, IFRI, FSS) |
| **Livrable du concours** | Prototype fonctionnel au 20 novembre 2026, avec documentation technique, hypothÃ¨ses et limites |

> [!IMPORTANT]
> **RÃ¨gle d'Ã©criture de ce document.** Ce que nous savons est Ã©crit comme un fait, avec sa source. Ce que nous supposons est Ã©crit comme une hypothÃ¨se (H). Ce qui reste Ã  vÃ©rifier porte la mention **[Ã€ VÃ‰RIFIER]**. Ce qui est simulÃ© dans le prototype est marquÃ© **[SIMULÃ‰]**. Le concours demande explicitement les hypothÃ¨ses et les limites : nous les montrons au lieu de les cacher.

---

## Sommaire

0. [Lecture rapide](#0-lecture-rapide)
1. [Le dÃ©fi et notre rÃ©ponse, exigence par exigence](#1-le-dÃ©fi-et-notre-rÃ©ponse-exigence-par-exigence)
2. [PÃ©rimÃ¨tre, maturitÃ© et statut de chaque brique](#2-pÃ©rimÃ¨tre-maturitÃ©-et-statut-de-chaque-brique)
3. [DonnÃ©es autorisÃ©es, provenance et consentement](#3-donnÃ©es-autorisÃ©es-provenance-et-consentement)
4. [Exigence 1 : repÃ©rage transparent des risques et des lacunes](#4-exigence-1--repÃ©rage-transparent-des-risques-et-des-lacunes)
5. [Exigence 2 : parcours personnalisÃ©s, population et clinique sÃ©parÃ©es](#5-exigence-2--parcours-personnalisÃ©s-population-et-clinique-sÃ©parÃ©es)
6. [Exigence 3 : engagement culturellement adaptÃ© et choix rÃ©el](#6-exigence-3--engagement-culturellement-adaptÃ©-et-choix-rÃ©el)
7. [Exigence 4 : garde-fous pour la population locale](#7-exigence-4--garde-fous-pour-la-population-locale)
8. [Exigence 5 : Ã©valuation par les rÃ©sultats](#8-exigence-5--Ã©valuation-par-les-rÃ©sultats)
9. [Architecture technique et interopÃ©rabilitÃ©](#9-architecture-technique-et-interopÃ©rabilitÃ©)
10. [Cadre rÃ©glementaire, Ã©thique, sÃ©curitÃ© et licences](#10-cadre-rÃ©glementaire-Ã©thique-sÃ©curitÃ©-et-licences)
11. [Prototype du 20 novembre 2026](#11-prototype-du-20-novembre-2026)
12. [Ã‰quipe et gouvernance clinique](#12-Ã©quipe-et-gouvernance-clinique)
13. [ModÃ¨le Ã©conomique et voie vers le pilote](#13-modÃ¨le-Ã©conomique-et-voie-vers-le-pilote)
14. [Matrice des risques](#14-matrice-des-risques)
15. [HypothÃ¨ses, limites et registre des vÃ©rifications](#15-hypothÃ¨ses-limites-et-registre-des-vÃ©rifications)
16. [TransfÃ©rabilitÃ© aux contextes Ã  ressources limitÃ©es](#16-transfÃ©rabilitÃ©-aux-contextes-Ã -ressources-limitÃ©es)
- [Annexes A Ã  E](#annexes)

---

## 0. Lecture rapide

**Le problÃ¨me (Ã©noncÃ© du dÃ©fi).** Ã€ Abu Dhabi, l'Ã©ligibilitÃ© et les invitations aux visites de l'enfant (*Well-Child Visits*), au dÃ©pistage complet de l'adulte et aux autres parcours de prÃ©vention dÃ©pendent encore largement de rÃ¨gles d'Ã¢ge et de sexe. Pourtant, le risque se rÃ©partit entre les antÃ©cÃ©dents familiaux, la gÃ©nomique, les maladies chroniques, le dÃ©veloppement, les comportements, l'historique des visites, la gÃ©ographie et le contexte social. Les personnes qui en ont le plus besoin sont donc oubliÃ©es, invitÃ©es trop tard ou orientÃ©es vers un parcours inadaptÃ©.

**Ce que fait MediBenin, en cinq verbes :**

1. **RepÃ©rer** les risques Ã©levÃ©s et les soins manquÃ©s ou en retard, chez l'enfant, l'adulte et dans les communautÃ©s, avec les principaux facteurs de chaque signalement et **son degrÃ© de certitude**.
2. **Orienter** vers la bonne visite de l'enfant, le bon dÃ©pistage de l'adulte ou la bonne intervention, selon des directives approuvÃ©es, avec une Ã©chÃ©ance.
3. **Engager** chaque personne dans sa langue, sur son canal, avec une information claire et le droit de refuser.
4. **Suivre** chaque recommandation jusqu'Ã  la visite confirmÃ©e par le centre de santÃ©.
5. **Mesurer** la portÃ©e, les erreurs, l'adoption et les rÃ©sultats par segment de population, sans jamais publier de petits effectifs ni de chiffres trompeurs.

**Ce que MediBenin n'est pas.** Ce n'est pas un outil de diagnostic, ni un service d'urgence, ni un sÃ©quenceur gÃ©nÃ©tique. Il aide des professionnels Ã  dÃ©cider et Ã  prioriser. Le soignant dÃ©cide toujours.

**Ce que le jury verra le 20 novembre** (dÃ©tails en section 11) :
- trois personas synthÃ©tiques (un enfant de 18 mois, un adolescent de 14 ans, un adulte de 36 ans) suivis de bout en bout ;
- deux Ã©crans sÃ©parÃ©s : la liste de priorisation de la population et la fiche clinique individuelle ;
- un badge de certitude sur chaque signalement ;
- une console de population avec masquage des petits effectifs et intervalles de confiance ;
- un banc d'essai synthÃ©tique qui compare MediBenin Ã  l'invitation par Ã¢ge et sexe, Ã  capacitÃ© Ã©gale, en prÃ©sentant clairement ce qu'il prouve et ce qu'il ne prouve pas.

---

## 1. Le dÃ©fi et notre rÃ©ponse, exigence par exigence

| Exigence officielle | RÃ©ponse de MediBenin | Preuve visible au prototype | Sections |
| :--- | :--- | :--- | :---: |
| **1. Transparent risk and care-gap identification** | RÃ¨gles explicites pour l'enfant (P), l'adulte (A), la gÃ©nomique (G) et les communautÃ©s (C). Chaque signalement indique son type, son niveau, son Ã©chÃ©ance, ses 1 Ã  3 facteurs principaux, les donnÃ©es manquantes et un **badge de certitude** | Fiche d'un signalement avec facteurs et badge ; un dossier incomplet passe en Niveau Gris | 4 |
| **2. Personalized preventive pathways** | Parcours unifiÃ© par personne (une seule visite quand c'est possible), Ã©chÃ©ance, rappel et suivi en 8 Ã©tats. **Deux Ã©crans sÃ©parÃ©s** : priorisation de la population (score $S_{\text{prio}}$) et fiche clinique (sans ce score) | Les deux Ã©crans ; une recommandation suivie jusqu'Ã  Â« RÃ©alisÃ©e Â» | 5 |
| **3. Culturally appropriate engagement** | Langue, canal et message adaptÃ©s au parent, Ã  l'aidant, Ã  l'adolescent ou Ã  l'adulte. Aides Ã  la dÃ©cision courtes (bÃ©nÃ©fices, limites, et ce qui arrive en cas de refus). Consentement par finalitÃ©, report ou refus sans consÃ©quence | Message en arabe et en anglais ; un refus arrÃªte les relances | 6 |
| **4. Local population safeguards** | PortÃ©e, faux positifs, faux nÃ©gatifs, taux de recommandation et adoption par segment de la population d'Abu Dhabi, avec intervalles de Wilson. Masquage des cellules < 10 avec suppression secondaire. RÃ¨gles communautaires et alertes d'Ã©quitÃ© | Tableau par segment : une cellule masquÃ©e, un rÃ©sultat Â« insuffisant Â» au lieu d'un chiffre | 7 |
| **5. Outcome-based evaluation** | Visites de l'enfant et dÃ©pistages de l'adulte rÃ©alisÃ©s et confirmÃ©s, ponctualitÃ©, efficacitÃ© des rappels, **un critÃ¨re principal par parcours**, calibrage d'un critÃ¨re observable, effets indÃ©sirables du dÃ©pistage | Tableau de bord des rÃ©sultats sur la cohorte synthÃ©tique, avec la comparaison Ã  l'invitation par Ã¢ge et sexe | 8 |
| **Clause transversale :** *making uncertainty and authorized data use visible* | Badge de certitude individuel, intervalles de confiance pour la population, Niveau Gris, journal d'usage des donnÃ©es consultable par la personne | Badge et journal d'usage Ã  l'Ã©cran | 3.3, 4.6, 7 |

---

## 2. PÃ©rimÃ¨tre, maturitÃ© et statut de chaque brique

### 2.1 PÃ©rimÃ¨tre

- **Population :** enfants de 0 Ã  17 ans (via les parents ou aidants, avec l'assentiment de l'adolescent de 12 Ã  17 ans) et adultes Ã  partir de 18 ans, sans trou d'Ã¢ge. CommunautÃ©s repÃ©rÃ©es Ã  l'Ã©chelle des zones.
- **Parcours ciblÃ©s Ã  Abu Dhabi :**
  - le programme des visites de l'enfant selon le standard du Department of Health (`DOH/WCV/SD`) **[Ã€ VÃ‰RIFIER : version et contenu exacts, V3]** ;
  - le programme de dÃ©pistage complet de l'adulte (IFHAS) **[Ã€ VÃ‰RIFIER : tranches d'Ã¢ge, pÃ©riodicitÃ© et contenus, V4]** ;
  - les autres parcours de prÃ©vention : vaccination, dÃ©pistage des cancers, suivi des maladies chroniques.
- **Hors pÃ©rimÃ¨tre :** le diagnostic ; la prise en charge des symptÃ´mes aigus (seule existe une rÃ¨gle d'Ã©chappement vers les urgences, section 4.5) ; le sÃ©quenÃ§age et l'interprÃ©tation gÃ©nomique (MediBenin ne lit que des rÃ©sultats dÃ©jÃ  interprÃ©tÃ©s et autorisÃ©s).

### 2.2 MaturitÃ© initiale (rÃ¨gle du concours sur les produits existants)

Le projet est nÃ© sous le nom **MediBenin**, dans un cadre acadÃ©mique, comme un prototype de triage vocal de symptÃ´mes. Ce triage **n'est pas utilisÃ©** pour le dÃ©fi. Tout ce qui sert au DÃ©fi 04 (moteur de prÃ©vention, garde-fous, suivi, console) est conÃ§u pendant le dÃ©fi. Le tableau ci-dessous sera mis Ã  jour le 20 novembre avec l'Ã©tat rÃ©el du dÃ©pÃ´t de code.

### 2.3 Statut de chaque brique

| Brique | Statut au 20 novembre | Commentaire |
| :--- | :---: | :--- |
| Moteur de rÃ¨gles P, A, G, C (tables JSON signÃ©es) | **RÃ©el** | ExÃ©cutÃ© sur les personas et sur la cohorte synthÃ©tique |
| Explication des facteurs, badge de certitude, Niveau Gris | **RÃ©el** | |
| Ã‰crans sÃ©parÃ©s population et clinique, machine Ã  8 Ã©tats | **RÃ©el** | |
| Garde-fous statistiques et tableau de bord des rÃ©sultats | **RÃ©el** | CalculÃ©s sur des donnÃ©es synthÃ©tiques |
| Cohorte synthÃ©tique et banc d'essai | **RÃ©el** | DonnÃ©es **[SIMULÃ‰]** ; voir section 8.4 |
| Signal gÃ©nomique | **SimulÃ©** | Ressource FHIR fictive, aucune donnÃ©e gÃ©nomique rÃ©elle |
| Ã‰change FHIR R4 (export d'un lot) | **RÃ©el** (export) / **Feuille de route** (raccordement) | Aucun raccordement Ã  Malaffi ni Ã  Sahatna |
| Messages en arabe et en anglais | **RÃ©el** | Relus par des locuteurs natifs **[Ã€ VÃ‰RIFIER, V11]** |
| Autres langues (ourdou, hindi, tagalog, malayalam) | **Feuille de route** | Une langue d'Asie du Sud si le temps le permet |
| Fonctionnement hors ligne complet, chiffrement sur l'appareil | **Partiel** | DÃ©monstration hors ligne simple ; chiffrement complet en feuille de route |
| Envoi rÃ©el de SMS ou WhatsApp | **SimulÃ©** | File de messages affichÃ©e, aucun envoi rÃ©el |

---

## 3. DonnÃ©es autorisÃ©es, provenance et consentement

### 3.1 Les huit domaines de donnÃ©es de l'Ã©noncÃ©

| Domaine | Variables utilisÃ©es | Source cible Ã  Abu Dhabi | Prototype |
| :--- | :--- | :--- | :--- |
| Clinique | Tension artÃ©rielle (2 ou 3 mesures), poids, taille, IMC, tour de taille ; HbA1c, lipides, hÃ©moglobine si disponibles ; maladies connues | Dossier de l'Ã©tablissement, Ã©change Malaffi **[Ã€ VÃ‰RIFIER : modalitÃ©s d'accÃ¨s, V14]** | SynthÃ©tique |
| GÃ©nomique | RÃ©sultat dÃ©jÃ  interprÃ©tÃ© et autorisÃ© : percentile d'un score polygÃ©nique, variant actionnable, rÃ©sultat du dÃ©pistage nÃ©onatal | Programme gÃ©nomique Ã©mirati **[Ã€ VÃ‰RIFIER : quels rÃ©sultats sont restituÃ©s et sous quelle forme, V5]** | **[SIMULÃ‰]** |
| DÃ©veloppement | Croissance (scores Z de l'OMS), questionnaires de dÃ©veloppement et de dÃ©pistage de l'autisme | Visites de l'enfant | SynthÃ©tique |
| Comportements | Tabac (cigarette, *medwakh/dokha*, chicha, vapotage), activitÃ© physique, alimentation, sommeil | Questionnaire | SynthÃ©tique |
| AntÃ©cÃ©dents familiaux | Maladie cardiovasculaire prÃ©coce, diabÃ¨te, cancers, hypercholestÃ©rolÃ©mie familiale (1er et 2e degrÃ©) | Questionnaire, dossier | SynthÃ©tique |
| Visites de l'enfant | Visites faites ou manquÃ©es, doses vaccinales | Registre de l'Ã©tablissement, registre vaccinal | SynthÃ©tique |
| DÃ©pistages de l'adulte | Dernier bilan complet, dernier test de dÃ©pistage de chaque cancer | Registre de l'Ã©tablissement | SynthÃ©tique |
| Contexte | RÃ©gion, temps d'accÃ¨s au centre, langue, canal prÃ©fÃ©rÃ©, prÃ©fÃ©rences (genre du praticien, horaires) | Profil dÃ©clarÃ© | SynthÃ©tique |

### 3.2 Provenance de chaque variable

Chaque valeur porte un code de provenance, utilisÃ© par le badge de certitude (section 4.6) :

- **V (vÃ©rifiÃ©e) :** issue d'un dossier ou d'un registre d'Ã©tablissement ;
- **M (mesurÃ©e) :** mesurÃ©e lors de l'Ã©valuation selon le protocole ;
- **D (dÃ©clarÃ©e) :** dÃ©clarÃ©e par la personne ou l'aidant ;
- **S (simulÃ©e) :** donnÃ©e de dÃ©monstration.

S'y ajoutent la date de la valeur et, pour les mesures, l'identifiant du protocole.

### 3.3 Consentement par finalitÃ© et journal d'usage (F1)

- **Cinq autorisations distinctes**, chacune acceptÃ©e ou refusÃ©e sÃ©parÃ©ment :
  1. Ã©valuation et calendrier de prÃ©vention ;
  2. rappels sur le canal choisi ;
  3. transmission du dossier d'orientation au centre de santÃ© ;
  4. statistiques agrÃ©gÃ©es anonymes ;
  5. utilisation d'un rÃ©sultat gÃ©nomique existant.
- **Mineurs :** le consentement vient du parent ou du tuteur lÃ©gal. Entre 12 et 17 ans, l'assentiment de l'adolescent est recueilli en plus. Les rÃ¨gles de confidentialitÃ© propres Ã  l'adolescent sont dÃ©crites en section 6.4.
- **Journal d'usage :** la personne peut voir, Ã  tout moment, quelles catÃ©gories de donnÃ©es ont Ã©tÃ© lues, par quelle rÃ¨gle (et sa version), quand, et Ã  qui le dossier a Ã©tÃ© transmis. C'est la rÃ©ponse directe Ã  la clause *authorized data use visible*.
- **Retrait :** le retrait d'une autorisation prend effet immÃ©diatement. Le dossier est recalculÃ© sans les donnÃ©es retirÃ©es et l'accÃ¨s aux soins n'est jamais pÃ©nalisÃ©.

---

## 4. Exigence 1 : repÃ©rage transparent des risques et des lacunes

### 4.1 Typologie

**Quatre types de signalement :** *risque Ã©levÃ©*, *soins manquÃ©s*, *soins en retard*, *suivi interrompu*. Les signalements communautaires sont dÃ©crits en 4.4.

**Cinq niveaux d'action :**
- **Rouge :** orientation immÃ©diate ;
- **Orange :** visite prioritaire, en gÃ©nÃ©ral sous 7 Ã  14 jours ;
- **Jaune :** visite programmÃ©e, sous 30 Ã  90 jours ;
- **Vert :** Ã  jour ;
- **Gris :** donnÃ©es insuffisantes.

Les dÃ©lais sont des valeurs de dÃ©part **(H1)**, Ã  valider par la gouvernance clinique (section 12).

### 4.2 RÃ¨gles pour l'enfant et l'adolescent (P)

La colonne Â« Statut Â» distingue un seuil **publiÃ©** dans une rÃ©fÃ©rence internationale citÃ©e d'une rÃ¨gle **[Ã€ VÃ‰RIFIER]** sur un texte d'Abu Dhabi.

| ID | Ã‚ge | Condition | Type | Niveau | RÃ©fÃ©rence | Statut |
| :---: | :---: | :--- | :--- | :---: | :--- | :---: |
| P1 | 0â€“5 ans | Malnutrition aiguÃ« sÃ©vÃ¨re : score Z poids-pour-taille < âˆ’3, ou pÃ©rimÃ¨tre brachial < 115 mm (6â€“59 mois), ou Å“dÃ¨mes bilatÃ©raux | Risque Ã©levÃ© | Rouge | OMS, standards de croissance 2006 | PubliÃ© |
| P2 | 0â€“5 ans | Score Z poids-pour-taille ou taille-pour-Ã¢ge entre âˆ’3 et âˆ’2 (Orange) ; IMC-pour-Ã¢ge > +2 (Jaune) ou > +3 (Orange) | Risque Ã©levÃ© | Orange / Jaune | OMS 2006 | PubliÃ© |
| P3 | 0â€“6 ans | Visite de l'enfant manquÃ©e : une visite hors de sa fenÃªtre (Jaune) ; deux visites consÃ©cutives (Orange) | Soins manquÃ©s / en retard | Jaune / Orange | Standard DoH `DOH/WCV/SD` | [Ã€ VÃ‰RIFIER] V3 |
| P4 | 0â€“17 ans | Dose vaccinale en retard de plus de 30 jours (Jaune) ou de plus de 60 jours (Orange). Enfant Â« zÃ©ro dose Â» : aucune dose contenant la composante DTC Ã  14 semaines rÃ©volues (Orange) | Soins manquÃ©s / en retard | Jaune / Orange | Calendrier national des Ã‰AU ; dÃ©finition Â« zÃ©ro dose Â» de Gavi et de l'OMS | Calendrier [Ã€ VÃ‰RIFIER] V3 |
| P5 | 12â€“24 mois | DÃ©pistage de l'anÃ©mie non fait dans la fenÃªtre prÃ©vue (Jaune) ; hÃ©moglobine < 11,0 g/dL (Orange) | Soins manquÃ©s / risque Ã©levÃ© | Jaune / Orange | Seuil OMS (6â€“59 mois) ; fenÃªtre selon le standard DoH | FenÃªtre [Ã€ VÃ‰RIFIER] V3 |
| P6 | 16â€“30 mois | Autisme, M-CHAT-R : score de 3 Ã  7 â†’ entretien de suivi (*Follow-Up*) ; score â‰¥ 8, ou entretien de suivi â‰¥ 2 â†’ orientation | Risque Ã©levÃ© | Jaune â†’ Orange | Grille M-CHAT-R/F publiÃ©e | PubliÃ© ; licence (section 10.4) |
| P7 | 1â€“66 mois | DÃ©veloppement : score sous le seuil de rÃ©fÃ©rence de l'ASQ-3 dans au moins un domaine (Orange) ; zone de surveillance (Jaune) ; perte d'une compÃ©tence acquise Ã  tout Ã¢ge (Orange) | Risque Ã©levÃ© | Orange / Jaune | Seuils publiÃ©s de l'ASQ-3 | PubliÃ© ; **licence requise** (10.4) |
| P8 | 5â€“17 ans | IMC-pour-Ã¢ge selon la rÃ©fÃ©rence OMS 2007 : > +1 (surpoids, Jaune), > +2 (obÃ©sitÃ©, Orange), < âˆ’2 (maigreur, Jaune), < âˆ’3 (maigreur sÃ©vÃ¨re, Orange) | Risque Ã©levÃ© | Jaune / Orange | OMS 2007 | PubliÃ© |
| P9 | 1â€“17 ans | Tension artÃ©rielle (protocole pÃ©diatrique, 4.7) : avant 13 ans, â‰¥ 95e percentile pour l'Ã¢ge, le sexe et la taille ; Ã  partir de 13 ans, â‰¥ 130/80 (Orange) | Risque Ã©levÃ© | Orange | Recommandation AAP 2017 | PubliÃ© |
| P10 | 2â€“17 ans | AntÃ©cÃ©dent familial au 1er degrÃ© d'hypercholestÃ©rolÃ©mie familiale ou d'Ã©vÃ©nement cardiovasculaire prÃ©coce, sans bilan lipidique (Orange). **C'est la voie d'accÃ©lÃ©ration sans gÃ©nomique** (7.5) | Risque Ã©levÃ© | Orange | Recommandations internationales sur l'hypercholestÃ©rolÃ©mie familiale de l'enfant | PubliÃ© [Ã€ VÃ‰RIFIER : Ã¢ge du bilan, V6] |
| P11 | 10â€“17 ans | Vaccins de l'adolescence (HPV, mÃ©ningocoque, rappels) non faits dans la fenÃªtre nationale | Soins manquÃ©s | Jaune | Calendrier national des Ã‰AU | [Ã€ VÃ‰RIFIER] V3 |

**Questionnaire PHQ-A (santÃ© mentale de l'adolescent).** Il est administrÃ© **uniquement par un clinicien**, jamais par un agent hors ligne. Il suit un protocole de sÃ©curitÃ© (section 4.5). Au prototype, il n'est que dÃ©crit (feuille de route).

### 4.3 RÃ¨gles pour l'adulte (A)

| ID | Ã‚ge | Condition | Type | Niveau | RÃ©fÃ©rence | Statut |
| :---: | :---: | :--- | :--- | :---: | :--- | :---: |
| A1 | â‰¥ 18 ans | Tension (moyenne des 2e et 3e mesures) : systolique 140â€“179 ou diastolique 90â€“109 (Orange) ; systolique 130â€“139 ou diastolique 85â€“89 (Jaune) | Risque Ã©levÃ© | Orange / Jaune | OMS HEARTS ; seuil de vigilance (H2) | PubliÃ© / H |
| A2 | 40â€“80 ans | Risque cardiovasculaire Ã  10 ans, modÃ¨le OMS 2019 sans laboratoire (Annexe A) : â‰¥ 20 % (Orange prioritaire), 10 Ã  < 20 % (Orange), 5 Ã  < 10 % (Jaune) | Risque Ã©levÃ© | Orange / Jaune | OMS 2019 ; HEARTS | PubliÃ© ; seuil de 5 % = H3 |
| A3 | â‰¥ 18 ans | FINDRISC â‰¥ 15 (Orange), 12 Ã  14 (Jaune). HbA1c â‰¥ 6,5 % sans diagnostic connu (Orange), 5,7 Ã  6,4 % (Jaune). **Aucune imputation par dÃ©faut** : les 8 items du questionnaire doivent Ãªtre renseignÃ©s (ou un score dÃ©clarÃ© par la personne) ; un item manquant est signalÃ© comme donnÃ©e manquante et un questionnaire incomplet ne dÃ©clenche jamais la rÃ¨gle sur un score extrapolÃ© | Risque Ã©levÃ© | Orange / Jaune | LindstrÃ¶m et Tuomilehto, 2003 ; seuils HbA1c de l'ADA | PubliÃ© |
| A4 | â‰¥ 18 ans | **Origine d'Asie du Sud ou d'Asie de l'Est et IMC â‰¥ 23**, sans dÃ©pistage glycÃ©mique depuis plus de 3 ans â†’ dÃ©pistage HbA1c (Jaune). RÃ¨gle **ajoutÃ©e** au FINDRISC sans modifier le score validÃ© | Risque Ã©levÃ© | Jaune | Seuils d'IMC asiatiques de l'OMS (2004) ; recommandation de dÃ©pistage de l'ADA | PubliÃ© ; adaptation locale H4 |
| A5 | 25â€“65 ans | DÃ©pistage du cancer du col non fait dans l'intervalle national | Soins manquÃ©s / en retard | Jaune | Programme national | [Ã€ VÃ‰RIFIER] V4 |
| A6 | 40â€“69 ans | Mammographie non faite dans l'intervalle national | Soins manquÃ©s / en retard | Jaune / Orange | Programme national | [Ã€ VÃ‰RIFIER] V4 |
| A7 | 40â€“75 ans | DÃ©pistage du cancer colorectal (test FIT ou coloscopie) non fait dans l'intervalle national. AntÃ©cÃ©dent familial au 1er degrÃ© : dÃ©but plus prÃ©coce selon les recommandations spÃ©cialisÃ©es | Soins manquÃ©s / risque Ã©levÃ© | Jaune / Orange | Programme national | [Ã€ VÃ‰RIFIER] V4 |
| A8 | 18â€“75 ans | Aucun bilan complet de l'adulte dans l'intervalle du programme | Soins manquÃ©s | Jaune | Programme IFHAS | [Ã€ VÃ‰RIFIER] V4 |
| A9 | â‰¥ 18 ans | Maladie chronique connue (hypertension, diabÃ¨te, maladie cardiovasculaire, maladie rÃ©nale chronique) sans visite de suivi depuis plus de 6 mois ; ou personne orientÃ©e Orange ou Rouge qui ne s'est pas prÃ©sentÃ©e dans le dÃ©lai | Suivi interrompu | Orange | OMS PEN ; rÃ¨gle de boucle fermÃ©e | DÃ©lai = H5 |
| A10 | â‰¥ 65 ans | Chute dans l'annÃ©e, trouble de l'Ã©quilibre, ou dÃ©ficit visuel ou auditif non pris en charge | Risque Ã©levÃ© | Jaune / Orange | CDC STEADI (risque de chute) | PubliÃ© ; place dans IFHAS [Ã€ VÃ‰RIFIER] V4 |
| A11 | Femme, 15â€“49 ans | **Grossesse en cours** et tension â‰¥ 140/90 aprÃ¨s 20 semaines d'amÃ©norrhÃ©e (**Rouge**, suspicion de prÃ©Ã©clampsie) ; â‰¥ 160/110 (**Rouge, le jour mÃªme**). Pendant la grossesse, les rÃ¨gles A2 (OMS), A3 (IMC et tour de taille du FINDRISC) et A6 sont suspendues | Risque Ã©levÃ© | Rouge | Recommandations obstÃ©tricales internationales sur les troubles hypertensifs de la grossesse | PubliÃ© |

### 4.4 RÃ¨gles communautaires (C)

Ces rÃ¨gles rÃ©pondent au mot *communities* de l'Ã©noncÃ©. Une communautÃ© est une zone gÃ©ographique (une municipalitÃ© ou un secteur) ou un segment de population (section 7.1).

| ID | Condition (n â‰¥ 30 dans la zone ou le segment, sinon pas de signalement) | Niveau | Action proposÃ©e |
| :---: | :--- | :---: | :--- |
| C1 | **Zone sous-couverte :** la borne haute de l'intervalle de Wilson Ã  95 % du taux de visites de l'enfant Ã  jour, ou du taux de bilans de l'adulte Ã  jour, est sous la cible du programme (cible = H6) | Orange | UnitÃ© mobile, campagne d'invitation ciblÃ©e |
| C2 | **Foyer d'enfants zÃ©ro dose :** au moins 5 enfants zÃ©ro dose repÃ©rÃ©s dans la zone en 90 jours (affichage soumis au masquage de la section 7.3) | Orange | Rattrapage vaccinal de proximitÃ© |
| C3 | **Ã‰cart d'adoption :** l'adoption dans un segment est infÃ©rieure de plus de 10 points Ã  la moyenne, avec des intervalles de confiance qui ne se chevauchent pas, alors que le taux d'invitation est comparable | Jaune | Revoir la langue, le canal, le crÃ©neau, la mÃ©diation |
| C4 | **Ã‰cart de faux nÃ©gatifs :** le taux de faux nÃ©gatifs d'un segment dÃ©passe la moyenne de plus de 5 points, avec au moins 5 Ã©vÃ©nements | Rouge (gouvernance) | Extension bloquÃ©e ; revue par la gouvernance clinique |

### 4.5 RÃ¨gles de sÃ©curitÃ© et d'arbitrage

- **Ã‰chappement d'urgence (E0).** Si un signe d'urgence est observÃ© pendant l'Ã©valuation (signes de danger de la PCIME chez l'enfant, tension â‰¥ 180/120 avec symptÃ´mes, douleur thoracique, dÃ©ficit neurologique), le systÃ¨me affiche Â« orienter immÃ©diatement vers les urgences Â» et suspend le parcours de prÃ©vention. **Ce n'est pas un moteur de triage**, seulement une sortie de sÃ©curitÃ©.
- **Protocole PHQ-A (clinicien uniquement).**
  - Item 9 positif (pensÃ©es suicidaires) : Ã©valuation de sÃ©curitÃ© immÃ©diate par le clinicien, jamais de message SMS, contact avec le circuit d'urgence local **[Ã€ VÃ‰RIFIER : numÃ©ros et obligations de signalement aux Ã‰AU, V13]**.
  - Score â‰¥ 10 : consultation prioritaire.
- **RÃ¨gle d'Ã©clipse.** Tant qu'un signalement Rouge est actif, les invitations Jaunes des autres parcours sont suspendues. Elles reprennent quand le Rouge est rÃ©solu (Ã©tat 5 ou 8) ou au plus tard aprÃ¨s 30 jours, avec revue.
- **Regroupement.** Les signalements Orange et Jaunes d'une mÃªme personne sont regroupÃ©s dans **une seule visite** quand c'est cliniquement compatible (5.1).
- **DÃ©doublonnage.** Si une mÃªme lacune dÃ©clenche deux rÃ¨gles (par exemple P3 et P4 Ã  la mÃªme visite), un seul signalement est crÃ©Ã©, avec les deux motifs.

### 4.6 Explication et badge de certitude

Chaque signalement affiche les Ã©lÃ©ments suivants.

1. **Les 1 Ã  3 facteurs principaux :**
   - **ModÃ¨le OMS :** attribution **contrefactuelle**. Pour chaque facteur modifiable (tension, tabac, IMC), on calcule la baisse du risque si ce facteur Ã©tait ramenÃ© Ã  sa valeur cible (par exemple 120 mmHg, non-fumeur, IMC 25). Les facteurs sont classÃ©s par baisse dÃ©croissante. Cette mÃ©thode tient compte des interactions avec l'Ã¢ge du modÃ¨le. L'Ã¢ge et le sexe sont affichÃ©s comme facteurs non modifiables.
   - **FINDRISC :** les items qui apportent le plus de points.
   - **RÃ¨gles de calendrier :** l'acte manquÃ©, la date attendue et le nombre de jours de retard.
2. **La rÃ¨gle et sa source :** identifiant de la rÃ¨gle, version de la table, rÃ©fÃ©rence de la directive.
3. **Les donnÃ©es manquantes.**
4. **Le badge de certitude** (rÃ©ponse Ã  la clause *making uncertainty visible*) :

| Ã‰lÃ©ment du badge | Calcul |
| :--- | :--- |
| ComplÃ©tude | Part des variables requises prÃ©sentes |
| Provenance | Codes V, M, D, S de chaque variable utilisÃ©e (3.2) |
| AnciennetÃ© | Ã‚ge de la plus ancienne valeur utilisÃ©e |
| ValiditÃ© du domaine | Ã‚ge dans le domaine du modÃ¨le, pas de grossesse pour A2 et A3, rÃ©gion OMS adaptÃ©e Ã  l'origine dÃ©clarÃ©e (Annexe A) |
| Intervalle de risque (modÃ¨le OMS) | Risque recalculÃ© avec la tension Ã  Â± 1,96 Ïƒ, oÃ¹ Ïƒ = 5 mmHg pour la moyenne de deux mesures (H7), et l'IMC Ã  Â± 1 kg/mÂ² ; on affiche *risque 12 % [9â€“16 %]* |

**Niveau de certitude affichÃ© :**
- **Haute :** complÃ©tude de 100 %, variables clÃ©s V ou M de moins de 12 mois, modÃ¨le dans son domaine, et intervalle qui ne franchit aucun seuil de niveau.
- **Moyenne :** une variable clÃ© dÃ©clarÃ©e ou ancienne, **ou** un intervalle qui franchit un seuil.
- **Faible :** au moins deux variables clÃ©s dÃ©clarÃ©es ou anciennes, **ou** un modÃ¨le hors de son domaine. Le signalement est alors prÃ©sentÃ© comme **Â« Ã  confirmer Â»**, avec une action de mesure de confirmation, et non comme une conclusion.

### 4.7 Protocoles de mesure et Niveau Gris (F2, F3)

- **Tension de l'adulte :** 5 minutes de repos, 2 mesures espacÃ©es d'au moins 1 minute. Si l'Ã©cart dÃ©passe 10 mmHg pour la systolique ou 6 mmHg pour la diastolique, une 3e mesure est demandÃ©e et la moyenne des 2e et 3e est retenue (H8 : seuils de la troisiÃ¨me mesure Ã  valider). Les valeurs hors bornes sont refusÃ©es : systolique < 60 ou > 260, diastolique < 30 ou > 160, diastolique â‰¥ systolique.
- **Tension de l'enfant :** brassard adaptÃ© au bras ; taille requise pour calculer le percentile (AAP 2017). Sans taille, le signalement passe en Niveau Gris.
- **Croissance :** scores Z calculÃ©s par la mÃ©thode LMS de l'OMS, sur l'**Ã¢ge corrigÃ© jusqu'Ã  24 mois** pour un enfant nÃ© avant 37 semaines d'amÃ©norrhÃ©e (Ã¢ge corrigÃ© = Ã¢ge chronologique âˆ’ (40 âˆ’ Ã¢ge gestationnel Ã  la naissance) semaines). MÃªme rÃ¨gle pour les fenÃªtres de l'ASQ-3.
- **Niveau Gris :** une donnÃ©e manquante n'est **jamais** remplacÃ©e par une valeur par dÃ©faut. Si les variables requises manquent, le rÃ©sultat est Gris (Â« donnÃ©es insuffisantes Â»), avec la liste des mesures Ã  faire. Un Gris n'est jamais comptÃ© comme un Vert.

### 4.8 Signal gÃ©nomique : une rÃ¨gle de politique, pas une modification du risque (G)

L'estimation du risque (le modÃ¨le OMS) **reste celle de l'OMS**. Elle n'est pas modifiÃ©e par la gÃ©nomique et reste donc calibrable. Le signal gÃ©nomique agit Ã  part, comme une **rÃ¨gle d'Ã©ligibilitÃ©** :

| ID | Condition (rÃ©sultat interprÃ©tÃ©, autorisÃ© par la personne) | Effet |
| :---: | :--- | :--- |
| G1 | Score polygÃ©nique coronarien ou diabÃ¨te au 90e percentile ou plus | Avance le bilan cardiomÃ©tabolique complet (lipides, HbA1c) ; Ã¢ge de dÃ©part = H9 |
| G2 | Variant actionnable (BRCA1/2, syndrome de Lynch, hypercholestÃ©rolÃ©mie familialeâ€¦) | Orientation vers une consultation spÃ©cialisÃ©e ou gÃ©nÃ©tique ; calendrier renforcÃ© selon les recommandations spÃ©cialisÃ©es |
| G3 | Score bas ou rÃ©sultat nÃ©gatif | **Aucun effet.** Un rÃ©sultat gÃ©nomique ne retarde jamais et ne supprime jamais un dÃ©pistage prÃ©vu |

Le retrait du consentement gÃ©nomique supprime le signal G1 sans modifier aucun signalement clinique (A1/A3) â€” vÃ©rifiÃ© par TEST-G3.

**Affichage :** Â« Risque OMS : 7 % [5â€“9 %] Â· Signal gÃ©nomique : percentile 94 **[SIMULÃ‰]** â†’ bilan avancÃ© (rÃ¨gle G1) Â».

**Ã‰quitÃ©.** Les rÃ©sultats gÃ©nomiques concernent surtout les citoyens Ã©miratis **[Ã€ VÃ‰RIFIER, V5]**. La voie d'accÃ©lÃ©ration par les antÃ©cÃ©dents familiaux (P10, A7) existe donc pour tous, et la part des accÃ©lÃ©rations d'origine gÃ©nomique est suivie par segment (7.5).

---

## 5. Exigence 2 : parcours personnalisÃ©s, population et clinique sÃ©parÃ©es

### 5.1 Parcours unifiÃ© (F5)

Les signalements d'une personne sont assemblÃ©s en un **parcours** (`CarePlan`) : actes recommandÃ©s, fenÃªtre de dates, centre cible, rappel et tÃ¢che de suivi. Les actes compatibles sont regroupÃ©s en une seule visite. Exemple : contrÃ´le de la tension, HbA1c et remise du kit FIT. Chaque acte cite sa rÃ¨gle et sa directive.

### 5.2 Deux Ã©crans, deux responsabilitÃ©s

| | Ã‰cran 1 : priorisation de la population | Ã‰cran 2 : fiche clinique individuelle |
| :--- | :--- | :--- |
| **Pour qui** | Coordinateur de programme ou de centre | MÃ©decin ou infirmier, face au patient |
| **Question posÃ©e** | Qui inviter en premier, avec la capacitÃ© disponible ? | Que recommander Ã  cette personne ? |
| **Contenu** | Liste triÃ©e par $S_{\text{prio}}$, capacitÃ© restante, files d'attente | Mesures, facteurs, badge de certitude, actes recommandÃ©s et directives |
| **Interdit** | Aucune prescription | **$S_{\text{prio}}$ n'est jamais affichÃ©**, pour que la logistique n'influence pas la dÃ©cision mÃ©dicale |
| **Actions** | Approuver des invitations (une par une ou par lot) | Valider, adapter selon son jugement (avec un motif), diffÃ©rer (avec un motif) |

### 5.3 Score de priorisation $S_{\text{prio}}$, entiÃ¨rement dÃ©fini

$$S_{\text{prio}} = 100 \times \left(0{,}40\, I_{\text{risque}} + 0{,}25\, I_{\text{lacune}} + 0{,}20\, I_{\text{retard}} + 0{,}15\, I_{\text{vuln}}\right)$$

| Composante | DÃ©finition |
| :--- | :--- |
| $I_{\text{risque}}$ | Niveau le plus Ã©levÃ© de la personne : Orange = 0,75, Jaune = 0,35, Vert = 0. Les Rouges **ne passent pas par le score** : ils vont dans une file immÃ©diate. Les Gris vont dans une file sÃ©parÃ©e Â« complÃ©ter les donnÃ©es Â» |
| $I_{\text{lacune}}$ | $\min(1, \text{nombre de lacunes ouvertes} / 3)$ |
| $I_{\text{retard}}$ | $\min(1, \text{plus grand dÃ©passement d'Ã©chÃ©ance en jours} / 180)$ |
| $I_{\text{vuln}}$ | Moyenne de trois indicateurs binaires autorisÃ©s : temps d'accÃ¨s au centre > 30 min, langue non couverte ou besoin d'interprÃ¨te, rÃ©sidence dans une zone C1. Vaut 0 si l'autorisation Â« contexte Â» n'est pas donnÃ©e. Ne peut **que** faire monter la prioritÃ© |

- **Poids :** valeurs de dÃ©part **(H10)**.
- **Analyse de sensibilitÃ©, livrÃ©e au prototype :** chaque poids varie de Â± 0,10, les poids Ã©tant renormalisÃ©s. On mesure le recouvrement des K premiÃ¨res personnes avec le classement de rÃ©fÃ©rence. S'il est infÃ©rieur Ã  80 %, les poids sont signalÃ©s comme instables et soumis Ã  la gouvernance clinique.
- **CapacitÃ© :** le nombre de crÃ©neaux par centre et par jour limite la liste d'invitations proposÃ©e.

### 5.4 Suivi en 8 Ã©tats (boucle fermÃ©e)

```mermaid
stateDiagram-v2
    [*] --> Creee : Signalement
    Creee --> Validee : Validation humaine
    Creee --> Refusee : Refus immÃ©diat
    Validee --> Invitee : Invitation envoyÃ©e
    Invitee --> Planifiee : CrÃ©neau confirmÃ©
    Invitee --> Reportee : Report demandÃ©
    Invitee --> Refusee : Refus explicite
    Invitee --> EnRetard : Ã‰chÃ©ance dÃ©passÃ©e
    Planifiee --> Realisee : Visite confirmÃ©e par le centre
    Planifiee --> EnRetard : Rendez-vous manquÃ©
    Planifiee --> Reportee : Report demandÃ©
    Reportee --> Planifiee : Nouvelle date
    EnRetard --> Invitee : Relance (2 au maximum)
    EnRetard --> Realisee : Rattrapage confirmÃ©
    EnRetard --> Refusee : Refus lors de la relance
    Realisee --> [*]
    Refusee --> [*]
```

- **Â« RÃ©alisÃ©e Â» exige une confirmation** par le centre : une visite enregistrÃ©e via le code d'orientation (5.6) ou une validation par le clinicien. Une simple intention reste Ã  l'Ã©tat Â« PlanifiÃ©e Â».
- **Au plus 2 relances**, espacÃ©es d'au moins 7 jours. Ensuite, pour un Orange, une tÃ¢che de contact humain est proposÃ©e, si ce canal est autorisÃ©.
- **Un refus arrÃªte immÃ©diatement toutes les relances** de cette recommandation. La personne peut revenir sur sa dÃ©cision.

### 5.5 Conflits de synchronisation

Quand deux appareils modifient la mÃªme recommandation hors ligne :

1. **Â« RÃ©alisÃ©e Â» confirmÃ©e par le centre est dÃ©finitive.** Seul le centre peut la corriger, et la correction est tracÃ©e.
2. **Un refus ou un retrait de consentement** l'emporte sur tout Ã©tat non final et arrÃªte les relances futures.
3. Pour les autres Ã©tats, on compare les **dates des Ã©vÃ©nements** (et non les dates de synchronisation). Ã€ date Ã©gale, l'ordre d'autoritÃ© est : centre, puis coordinateur, puis agent.
4. Chaque conflit est journalisÃ© et affichÃ© au coordinateur.

### 5.6 Fermer la boucle sans identitÃ© civile

Ã€ la crÃ©ation d'une orientation, un **code d'orientation** est gÃ©nÃ©rÃ© : 8 caractÃ¨res ou un QR code. Il est remis Ã  la personne et portÃ© dans la demande d'orientation FHIR (`ServiceRequest.identifier`). Le centre saisit ou scanne ce code lors de la visite, ce qui rattache la visite Ã  l'orientation. Le serveur ne garde qu'une empreinte HMAC du code. Aucun numÃ©ro d'identitÃ© civile n'est stockÃ© dans la base d'analyse.

---

## 6. Exigence 3 : engagement culturellement adaptÃ© et choix rÃ©el

### 6.1 Langues et formats

- **Cible Ã  Abu Dhabi :** arabe (standard moderne et dialecte du Golfe pour l'audio), anglais, ourdou, hindi, tagalog et malayalam **[Ã€ VÃ‰RIFIER : prioritÃ©s selon les populations visÃ©es par le partenaire, V10]**.
- **Prototype :** arabe et anglais (2.3).
- **Formats :** texte court sans jargon, et **audio enregistrÃ© par des locuteurs natifs**. Pas de synthÃ¨se ni de reconnaissance vocale libre dans les langues peu dotÃ©es. Les rÃ©ponses se saisissent par boutons et pictogrammes.

### 6.2 Adapter le message au destinataire

| Destinataire | RÃ¨gle |
| :--- | :--- |
| Enfant de moins de 12 ans | Aucun message direct. Le parent ou l'aidant reÃ§oit l'invitation, avec les documents Ã  apporter |
| Adolescent de 12 Ã  17 ans | Logistique adressÃ©e au parent. Messages sur la santÃ© formulÃ©s pour l'adolescent ; confidentialitÃ© selon 6.4 |
| Adulte | Message personnel, possibilitÃ© d'y associer un proche |
| Aidant d'une personne Ã¢gÃ©e | Avec l'accord de la personne, regroupement des rappels dans une vue familiale |

### 6.3 PrÃ©fÃ©rences culturelles et pratiques

- PossibilitÃ© de demander une **praticienne** pour les examens concernÃ©s (mammographie, dÃ©pistage du col, examen clinique).
- Pas de messages pendant les heures de priÃ¨re ni Ã  l'iftar pendant le Ramadan. Les bilans Ã  jeun non urgents sont reprogrammÃ©s aprÃ¨s le Ramadan ou aprÃ¨s l'iftar, selon le souhait de la personne.
- Pour les travailleurs postÃ©s et les sites Ã©loignÃ©s : crÃ©neaux du soir ou du week-end, ou passage d'une unitÃ© mobile.
- **Aucun message ne contient de diagnostic, de score ou de mention gÃ©nÃ©tique.** Le dÃ©tail n'est visible qu'aprÃ¨s authentification ou en face Ã  face.

### 6.4 ConfidentialitÃ© de l'adolescent

- Par dÃ©faut, le parent reÃ§oit la logistique (date, lieu).
- Les rÃ©sultats sensibles (santÃ© mentale, et sujets que la loi locale protÃ¨ge) ne sont visibles **que par le clinicien**. Leur communication au parent suit le droit local **[Ã€ VÃ‰RIFIER, V13]**.
- Exception : un danger immÃ©diat (protocole 4.5).

### 6.5 Choix rÃ©el : aides Ã  la dÃ©cision

Chaque invitation Ã  un dÃ©pistage s'accompagne d'une **aide Ã  la dÃ©cision de 3 Ã  5 phrases**, validÃ©e par la gouvernance clinique : pourquoi ce test, comment il se passe, ce qu'il apporte, ses limites (faux positif, examens supplÃ©mentaires) et ce qui se passe si l'on refuse. Exemple en Annexe D.

**Trois rÃ©ponses possibles :** Confirmer, Reporter (en choisissant une date) ou Refuser (sans consÃ©quence sur l'accÃ¨s aux soins). Chaque message est validÃ© par un humain avant l'envoi : un par un pour les Orange, par lot homogÃ¨ne pour les rappels Jaunes de calendrier.

---

## 7. Exigence 4 : garde-fous pour la population locale

### 7.1 Segments de la population locale (Abu Dhabi)

| Dimension | ModalitÃ©s |
| :--- | :--- |
| Ã‚ge | Les 8 tranches : 0â€“11 mois, 1â€“4 ans, 5â€“9 ans, 10â€“17 ans, 18â€“24 ans, 25â€“39 ans, 40â€“64 ans, 65 ans et plus |
| Sexe | Femme, homme |
| Groupe de nationalitÃ© | Ã‰mirati ; rÃ©sidents par grand groupe d'origine (Asie du Sud, monde arabe hors Ã‰mirats, Asie du Sud-Est, autres) **(H11)** |
| Couverture d'assurance | Types de couverture en vigueur Ã  Abu Dhabi **[Ã€ VÃ‰RIFIER : catÃ©gories exactes, V9]** |
| RÃ©gion | Abu Dhabi, Al Ain, Al Dhafra |
| Langue prÃ©fÃ©rÃ©e | Langues de la section 6.1 |

**Publication hiÃ©rarchique.** Pour garder des effectifs suffisants, la console publie d'abord chaque dimension sÃ©parÃ©ment. Elle ne publie ensuite que des croisements de deux dimensions au plus, pris dans une liste fixe : Ã¢ge Ã— sexe, nationalitÃ© Ã— rÃ©gion, langue Ã— programme, assurance Ã— programme.

### 7.2 Indicateurs par segment (F7)

Pour chaque segment $s$ :

- **PortÃ©e** = Ã©valuÃ©s avec un dossier complet / population cible Ã©ligible. Les dossiers Gris sont comptÃ©s Ã  part.
- **Taux de recommandation** = signalÃ©s Jaune, Orange ou Rouge / Ã©valuÃ©s complets.
- **Adoption** = visites confirmÃ©es (Ã©tat 5) / personnes invitÃ©es (Ã©tat 3).
- **Faux positifs :** taux de faux positifs $\text{TFP} = FP/(FP+VN)$, valeur prÃ©dictive positive $\text{VPP} = VP/(VP+FP)$, nombre Ã  inviter pour un cas $\text{NNS} = 1/\text{VPP}$.
- **Faux nÃ©gatifs :** taux de faux nÃ©gatifs $\text{TFN} = FN/(FN+VP)$.
  - Dans un pilote, seules les personnes orientÃ©es sont vÃ©rifiÃ©es. Un **Ã©chantillon alÃ©atoire de 5 % des Verts** est donc invitÃ© Ã  un bilan de rÃ©fÃ©rence, et l'estimation est repondÃ©rÃ©e par l'inverse de la probabilitÃ© de vÃ©rification (Horvitz-Thompson).
  - **Limite dÃ©clarÃ©e :** avec peu d'Ã©vÃ©nements, l'intervalle est large. Il est toujours publiÃ© avec son intervalle de confiance.
- **Intervalle de Wilson Ã  95 %** sur chaque proportion :

$$\frac{\hat p + \frac{z^2}{2n} \pm z\sqrt{\frac{\hat p(1-\hat p)}{n} + \frac{z^2}{4n^2}}}{1+\frac{z^2}{n}}, \quad z = 1{,}96$$

### 7.3 Masquage et anti-tromperie

| Situation | RÃ¨gle | Affichage |
| :--- | :--- | :--- |
| Effectif < 10 | Masquage, plus suppression secondaire de la plus petite cellule voisine de la mÃªme ligne et de la mÃªme colonne | Â« MasquÃ© (n < 10) Â» |
| Effectif de 10 Ã  29 | Taux affichÃ© avec son intervalle ; aucune comparaison | Â« Petit effectif : pas de conclusion Â» |
| Moins de 5 Ã©vÃ©nements | Aucun taux d'erreur publiÃ© en pourcentage | Â« Ã‰vÃ©nements insuffisants Â» |
| DonnÃ©es manquantes | Niveau Gris ; jamais comptÃ© comme Vert | Â« DonnÃ©es insuffisantes Â» |

Le masquage est appliquÃ© **dans l'API**, avant tout envoi Ã  l'interface ou tout export.

### 7.4 Alertes d'Ã©quitÃ©

Ce sont les rÃ¨gles C3 et C4 (4.4), plus une **alerte de portÃ©e** : la portÃ©e d'un segment est infÃ©rieure de plus de 10 points Ã  la moyenne, et les intervalles de confiance ne se chevauchent pas. Une alerte bloque l'extension du dÃ©ploiement tant qu'elle n'a pas Ã©tÃ© revue. **On ne la corrige pas en ajustant un seuil** sans l'avis de la gouvernance clinique.

### 7.5 Ã‰quitÃ© gÃ©nomique

Indicateur suivi : la part des accÃ©lÃ©rations d'Ã©ligibilitÃ© d'origine gÃ©nomique (G1, G2), et celle d'origine familiale (P10, A7), par groupe de nationalitÃ©. Un Ã©cart est attendu (H12) ; il doit rester visible et Ãªtre compensÃ© par la voie familiale.

---

## 8. Exigence 5 : Ã©valuation par les rÃ©sultats

### 8.1 Indicateurs demandÃ©s par l'Ã©noncÃ© (F8)

| Indicateur de l'Ã©noncÃ© | DÃ©finition |
| :--- | :--- |
| Visites de l'enfant rÃ©alisÃ©es | Lacunes de visite comblÃ©es et confirmÃ©es / lacunes signalÃ©es |
| DÃ©pistages complets de l'adulte rÃ©alisÃ©s | Bilans complets confirmÃ©s / adultes orientÃ©s |
| Actions de prÃ©vention rÃ©alisÃ©es | Actes confirmÃ©s / actes recommandÃ©s. Exemples : dose rattrapÃ©e, FIT rendu, mammographie faite, dÃ©pistage de l'anÃ©mie, M-CHAT, bilan lipidique |
| PonctualitÃ© | Part des visites faites dans le dÃ©lai du niveau ; dÃ©lai mÃ©dian et intervalle interquartile entre le signalement et la visite |
| Rappels et suivi | Conversion selon le rang du rappel (1re invitation, relance 1, relance 2, contact humain) ; part des recommandations Â« en retard Â» ramenÃ©es Ã  Â« rÃ©alisÃ©e Â» ; **taux de boucles fermÃ©es** = (rÃ©alisÃ©es + refus Ã©clairÃ©s) / recommandations Ã©mises |
| Calibrage du modÃ¨le | Voir 8.3 |
| Valeur clinique en aval | Voir 8.2 |

### 8.2 Un critÃ¨re principal par parcours

| Parcours | CritÃ¨re principal | CritÃ¨res secondaires |
| :--- | :--- | :--- |
| Visites de l'enfant | Part des lacunes comblÃ©es dans leur fenÃªtre | Doses rattrapÃ©es, enfants zÃ©ro dose rattrapÃ©s, dÃ©pistages de l'autisme et de l'anÃ©mie faits |
| DÃ©pistage de l'adulte | **Rendement** : conditions nouvellement confirmÃ©es (hypertension, diabÃ¨te, prÃ©diabÃ¨te, dyslipidÃ©mie) pour 100 invitations | Bilans complets rÃ©alisÃ©s, dÃ©lai |
| Cancers | DÃ©pistages en retard rÃ©alisÃ©s | Suivi aprÃ¨s un FIT positif (coloscopie faite) |
| Suivi interrompu | Part des personnes revues dans les 30 jours | Maladie contrÃ´lÃ©e Ã  la visite suivante (pilote) |

**Effets indÃ©sirables suivis :** signalements nÃ©gatifs Ã  la confirmation, coloscopies normales aprÃ¨s un FIT positif, nombre de messages par personne, taux de dÃ©sinscription.

**Comparaison.** Chaque critÃ¨re est comparÃ© Ã  la rÃ¨gle d'invitation par Ã¢ge et sexe, **Ã  capacitÃ© Ã©gale** (K invitations).

### 8.3 Calibrage : ce qui est calibrable, et quand

- Seul le **modÃ¨le OMS** produit une probabilitÃ©. Les lacunes de soins sont des rÃ¨gles et le FINDRISC est un score.
- Un risque Ã  10 ans **ne peut pas Ãªtre calibrÃ© dans un pilote de quelques mois**.
- **Dans le pilote**, nous calibrons un critÃ¨re observable : la **probabilitÃ© qu'une condition soit confirmÃ©e Ã  la visite de confirmation**, estimÃ©e Ã  partir des donnÃ©es du signalement. On mesure le score de Brier, l'erreur de calibrage attendue (ECE) par quintiles, et l'intercept et la pente de recalibrage, par segment quand l'effectif le permet.
- **Dans le prototype**, les courbes de calibrage sont calculÃ©es sur la cohorte synthÃ©tique. Elles montrent que la chaÃ®ne de calcul fonctionne et qu'elle **dÃ©tecte un mauvais calibrage** quand les donnÃ©es sont mal spÃ©cifiÃ©es (8.4). Elles ne mesurent pas la performance clinique.

### 8.4 Banc d'essai synthÃ©tique (prototype)

| Ã‰lÃ©ment | Choix |
| :--- | :--- |
| Taille | 50 000 personnes de 0 Ã  85 ans ; 20 graines alÃ©atoires ; tous les rÃ©sultats avec leur variabilitÃ© entre graines |
| Structure de la population | InspirÃ©e de statistiques publiques d'Abu Dhabi **[Ã€ VÃ‰RIFIER : sources, V12]** (H13) |
| VÃ©ritÃ© cachÃ©e | Ã‰tats de santÃ© tirÃ©s de **prÃ©valences publiÃ©es et d'une fonction de risque diffÃ©rente de celles du moteur** (documentÃ©e dans le dÃ©pÃ´t), pour limiter la circularitÃ© |
| Observations | Bruit de mesure ; donnÃ©es manquantes au hasard (10 %) |
| ScÃ©narios de mauvaise spÃ©cification | (a) donnÃ©es manquantes plus frÃ©quentes chez les personnes Ã  risque ; (b) sous-dÃ©claration du tabac et des antÃ©cÃ©dents ; (c) historique de visites incomplet |
| Comparaison | MediBenin contre l'invitation par Ã¢ge et sexe, Ã  capacitÃ© K Ã©gale, sur les critÃ¨res de 8.2 |
| Ce que le banc d'essai prouve | Que la chaÃ®ne fonctionne, que les garde-fous se dÃ©clenchent et que le comportement rÃ©siste aux scÃ©narios (a) Ã  (c) |
| Ce qu'il ne prouve pas | **Aucune efficacitÃ© clinique.** Aucun chiffre de performance n'est annoncÃ© avant l'exÃ©cution du banc d'essai |

### 8.5 Protocole du pilote (aprÃ¨s le concours)

- Pilote encadrÃ© dans un Ã©tablissement partenaire, aprÃ¨s autorisations. Mesure du **taux de base avant intervention**, puis comparaison avant et aprÃ¨s, ou par grappes si le partenaire l'accepte.
- CritÃ¨res de passage Ã  l'Ã©chelle **fixÃ©s avant le pilote** : portÃ©e par segment, taux de faux nÃ©gatifs, taux de visites confirmÃ©es, Ã©carts d'Ã©quitÃ©, dÃ©lai de traitement des Orange.
- **Ces critÃ¨res ne sont pas modifiÃ©s** une fois les rÃ©sultats connus.

---

## 9. Architecture technique et interopÃ©rabilitÃ©

### 9.1 Vue d'ensemble

```mermaid
flowchart TB
    subgraph T["Application de terrain et de centre (Flutter)"]
        T1["Consentement et journal d'usage"]
        T2["Saisie guidÃ©e et protocoles de mesure"]
        T3["Moteur de rÃ¨gles local (tables JSON signÃ©es)"]
        T4["Stockage local et file de synchronisation"]
    end
    subgraph S["Serveur (FastAPI, PostgreSQL)"]
        S1["API, authentification, rÃ´les"]
        S2["Moteur de rÃ¨gles de rÃ©fÃ©rence (mÃªmes tables JSON)"]
        S3["Suivi en 8 Ã©tats, conflits, codes d'orientation"]
        S4["Garde-fous statistiques et masquage"]
    end
    subgraph W["Console web (React)"]
        W1["Ã‰cran 1 : priorisation de la population"]
        W2["Ã‰cran 2 : fiche clinique"]
        W3["Tableau de bord des rÃ©sultats et de l'Ã©quitÃ©"]
    end
    subgraph X["Ã‰changes (feuille de route sauf export)"]
        X1["Export d'un lot FHIR R4"]
        X2["Raccordement via un Ã©tablissement agrÃ©Ã©"]
    end
    T4 -->|"Synchronisation TLS"| S1
    S1 --> S2 --> S3 --> S4
    S4 --> W3
    S3 --> W1
    S2 --> W2
    S3 --> X1
    X1 -.-> X2
```

### 9.2 Une seule source de vÃ©ritÃ© pour les rÃ¨gles

Les rÃ¨gles P, A, C et G, les seuils, les fenÃªtres et les tables prÃ©-calculÃ©es (paramÃ¨tres LMS de l'OMS, tables du modÃ¨le OMS 2019) sont stockÃ©s dans des **fichiers JSON versionnÃ©s et signÃ©s**. Chaque rÃ¨gle porte sa source, sa version, sa date et son statut. L'application et le serveur lisent **les mÃªmes fichiers**. Le moteur Python sert de rÃ©fÃ©rence aux tests, qui comparent les sorties sur des profils communs. Une table non signÃ©e est refusÃ©e.

Les **seuils numÃ©riques** vivent dans six documents JSON versionnÃ©s (`who-cvd`, `diabetes-screening`, `blood-pressure`, `pediatric`, `adult-screening`, `privacy`), chacun portant son `schemaVersion`, sa version, sa date d'effet et sa citation de source. Un chargeur unique les valide au dÃ©marrage et calcule un **hash SHA-256** par document : toute modification de valeur passe par une nouvelle version du document, jamais par une retouche de code. Les documents dÃ©ployÃ©s sont auditables en continu via `GET /api/governance/thresholds`.

**ContrÃ´le d'accÃ¨s par rÃ´le et scoping par propriÃ©tÃ©.** Chaque route API est soumise Ã  une matrice de rÃ´les **refus par dÃ©faut**. Les rÃ´les personnels (patient, parent) n'accÃ¨dent qu'Ã  leurs **dossiers liÃ©s** et aux membres de la famille qui y sont affiliÃ©s ; les rÃ´les professionnels (clinicien, coordinateur) opÃ¨rent au pÃ©rimÃ¨tre de l'Ã©tablissement (rÃ©fÃ©rence H) ; la santÃ© publique n'a **aucun** accÃ¨s Ã  un dossier individuel â€” agrÃ©gats de l'observatoire uniquement. Cette matrice est vÃ©rifiÃ©e par TEST-G1, et les seuils versionnÃ©s par TEST-G2.

### 9.3 Correspondance FHIR R4 (export)

| Concept | Ressource FHIR | Codage |
| :--- | :--- | :--- |
| Personne | `Patient` | Identifiant pseudonyme, sexe, annÃ©e de naissance, langue |
| Lien parent-enfant, antÃ©cÃ©dents | `RelatedPerson`, `FamilyMemberHistory` | |
| Consentement par finalitÃ© | `Consent` | Les 5 finalitÃ©s de 3.3 |
| Mesures | `Observation` | LOINC : panel de tension 85354-9, systolique 8480-6, diastolique 8462-4, poids 29463-7, taille 8302-2, IMC 39156-5, tour de taille 8280-0, HbA1c 4548-4, hÃ©moglobine 718-7, tabac 72166-2 ; **autres codes [Ã€ VÃ‰RIFIER sur loinc.org, V15]** (pÃ©rimÃ¨tre brachial, FINDRISC, M-CHAT, PHQ-A) |
| Vaccin | `Immunization` | |
| Signal gÃ©nomique | `Observation` **[SIMULÃ‰]** | Selon le guide HL7 *Genomics Reporting* |
| Signalement | `RiskAssessment` / `DetectedIssue` | Niveau, facteurs, badge, rÃ¨gle et version |
| Parcours, orientation, suivi | `CarePlan`, `ServiceRequest` (avec code d'orientation), `Task`, `Appointment`, `Encounter` | Les 8 Ã©tats de 5.4 |

**InteropÃ©rabilitÃ©.** L'export suit FHIR R4 de base. La conformitÃ© aux guides d'implÃ©mentation de Malaffi n'est **pas** revendiquÃ©e : elle sera Ã©tablie avec un Ã©tablissement agrÃ©Ã© **[V14]**.

### 9.4 Exigences non fonctionnelles

Ce sont des **cibles**, mesurÃ©es et publiÃ©es au prototype :
- Ã©valuation complÃ¨te en moins de 1 seconde sur un tÃ©lÃ©phone Android d'entrÃ©e de gamme ;
- fonctionnement de l'Ã©valuation sans rÃ©seau ;
- synchronisation sans doublon ;
- accessibilitÃ© visÃ©e WCAG 2.1 AA, avec affichage de droite Ã  gauche pour l'arabe.

### 9.5 DÃ©pÃ´t de code (le concours peut le demander)

- README avec une procÃ©dure reproductible ;
- gÃ©nÃ©ration de la cohorte Ã  partir d'une graine ;
- tests unitaires de chaque rÃ¨gle ;
- tests d'acceptation (11.3) ;
- licence ;
- aucun secret ni aucune donnÃ©e rÃ©elle dans le dÃ©pÃ´t.

---

## 10. Cadre rÃ©glementaire, Ã©thique, sÃ©curitÃ© et licences

### 10.1 Qualification

MediBenin est **conÃ§u comme un outil d'aide Ã  la dÃ©cision** pour des professionnels :
- il applique des directives publiÃ©es ;
- il montre la rÃ¨gle derriÃ¨re chaque rÃ©sultat ;
- il n'analyse aucun signal ni aucune image ;
- le soignant dÃ©cide.

Un logiciel qui priorise des personnes selon leur risque peut cependant Ãªtre qualifiÃ© de dispositif mÃ©dical par certains rÃ©gulateurs. **La qualification sera confirmÃ©e auprÃ¨s du DoH avant tout usage rÃ©el [V13].**

### 10.2 Textes applicables Ã  Abu Dhabi

| Texte | Ce que nous en retenons | Statut |
| :--- | :--- | :---: |
| Loi fÃ©dÃ©rale nÂ° 2 de 2019 sur les TIC dans le domaine de la santÃ© | DonnÃ©es de santÃ© hÃ©bergÃ©es aux Ã‰mirats ; confidentialitÃ© | CitÃ© ; lecture juridique [V13] |
| DÃ©cret-loi fÃ©dÃ©ral nÂ° 45 de 2021 (PDPL) | Ã€ notre connaissance, il **exclut** les donnÃ©es de santÃ© rÃ©gies par leur propre lÃ©gislation ; son application Ã  MediBenin est Ã  confirmer | [Ã€ VÃ‰RIFIER] V13 |
| Politiques du DoH sur l'IA en santÃ© (politique de 2018, norme d'IA responsable citÃ©e dans notre v4.1) | Gouvernance, analyse d'impact, piste d'audit des dÃ©cisions | [Ã€ VÃ‰RIFIER] V13 |
| Norme de sÃ©curitÃ© ADHICS | ContrÃ´les de sÃ©curitÃ© ; prÃ©sentÃ©s comme un prÃ©requis au raccordement Ã  Malaffi | [Ã€ VÃ‰RIFIER] V14 |
| RÃ¨glement du concours (FAQ Hack2Skill) | La propriÃ©tÃ© intellectuelle reste Ã  l'Ã©quipe ; produit existant possible si sa maturitÃ© est dÃ©clarÃ©e ; donnÃ©es lÃ©gales, personnelles rÃ©duites au nÃ©cessaire ; code partageable | Lu |

### 10.3 SÃ©curitÃ©

- Chiffrement TLS en transit.
- Base de donnÃ©es chiffrÃ©e cÃ´tÃ© serveur ; chiffrement sur l'appareil en feuille de route (2.3).
- AccÃ¨s par rÃ´le : l'agent voit sa tournÃ©e ; le coordinateur voit des donnÃ©es agrÃ©gÃ©es et masquÃ©es ; le clinicien voit ses patients.
- Journal d'accÃ¨s non modifiable.
- RÃ©vocation Ã  distance d'un appareil.

### 10.4 Licences des instruments

| Instrument | Condition d'utilisation | DÃ©cision pour le prototype |
| :--- | :--- | :--- |
| ASQ-3 | ProtÃ©gÃ© (Brookes Publishing). L'utilisation Ã©lectronique demande une licence | **Pas d'items ASQ-3 dans le prototype.** La rÃ¨gle P7 est dÃ©montrÃ©e avec un score fictif ; demande de licence ou instrument libre de remplacement **[V7]** |
| M-CHAT-R/F | Gratuit pour l'usage clinique ; une intÃ©gration logicielle demande une autorisation des auteurs | Demande d'autorisation **[V7]** ; d'ici lÃ , items non reproduits |
| PHQ-9 / PHQ-A | Utilisation libre | Clinicien uniquement (4.5) |
| FINDRISC | Grille publiÃ©e | Ã€ confirmer [V7] |
| ModÃ¨les OMS 2019 | Publication en accÃ¨s ouvert | CitÃ©s et implÃ©mentÃ©s |
| LOINC | Licence gratuite de Regenstrief | Mention de la licence |

---

## 11. Prototype du 20 novembre 2026

### 11.1 PÃ©rimÃ¨tre (MoSCoW, profil Abu Dhabi uniquement)

| PrioritÃ© | Contenu |
| :--- | :--- |
| **Indispensable** | Moteur de rÃ¨gles et tables JSON signÃ©es ; 3 personas ; explications, badge de certitude, Niveau Gris ; deux Ã©crans sÃ©parÃ©s ; machine Ã  8 Ã©tats avec codes d'orientation ; console avec masquage et intervalles de Wilson ; banc d'essai synthÃ©tique avec critÃ¨res par parcours ; tableau RÃ©el / SimulÃ© Ã  jour |
| **Souhaitable** | Messages et aides Ã  la dÃ©cision en arabe et en anglais (audio) ; consentement par finalitÃ© et journal d'usage ; export FHIR R4 ; analyse de sensibilitÃ© de $S_{\text{prio}}$ |
| **Facultatif** | DÃ©monstration hors ligne ; une langue d'Asie du Sud ; carte par rÃ©gion (un tableau suffit sinon) |
| **Hors prototype** | Raccordement rÃ©el Ã  Malaffi ou Sahatna ; envoi rÃ©el de SMS ; chiffrement complet sur l'appareil ; autres profils de pays |

### 11.2 DÃ©monstration (environ 8 minutes)

1. **Consentement et journal d'usage** (1 min) : une famille accepte certaines finalitÃ©s et en refuse d'autres ; le journal montre ce qui a Ã©tÃ© lu.
2. **Persona 1, enfant de 18 mois** (1 min 30) : visite des 18 mois manquÃ©e (P3), dÃ©pistage de l'anÃ©mie non fait (P5), M-CHAT-R Ã  5 (P6 : entretien de suivi). Les facteurs, la certitude (carnet vÃ©rifiÃ© ou dÃ©claratif) et un parcours unique sont affichÃ©s.
3. **Persona 2, adolescent de 14 ans** (1 min) : IMC-pour-Ã¢ge Ã  +2,3 (P8), vaccin de l'adolescence non fait (P11), antÃ©cÃ©dent familial d'hypercholestÃ©rolÃ©mie familiale (P10). Montre qu'il n'y a pas de trou entre 6 et 17 ans.
4. **Persona 3, adulte de 36 ans, originaire d'Asie du Sud** (2 min) :
   - tension Ã  136/88 (A1 Jaune) ;
   - FINDRISC Ã  15 (A3 Orange) ;
   - IMC Ã  24 (A4) ;
   - signal gÃ©nomique **[SIMULÃ‰]** au 94e percentile (G1) ;
   - le modÃ¨le OMS s'affiche Â« hors domaine (< 40 ans) Â», la certitude est moyenne (tabac dÃ©clarÃ©) ;
   - passage de l'Ã©cran 1 Ã  l'Ã©cran 2 : $S_{\text{prio}}$ disparaÃ®t.
5. **Engagement et choix** (1 min) : message et aide Ã  la dÃ©cision en arabe ; un refus arrÃªte les relances ; un rendez-vous suivi jusqu'Ã  Â« RÃ©alisÃ©e Â» via le code d'orientation.
6. **Garde-fous et rÃ©sultats** (1 min 30) : tableau par segment avec une cellule masquÃ©e et une cellule Â« petit effectif Â» ; alerte C3 ; critÃ¨res par parcours comparÃ©s Ã  l'invitation par Ã¢ge et sexe ; scÃ©nario de mauvaise spÃ©cification ; rappel de ce que le banc d'essai ne prouve pas.

### 11.3 Tests d'acceptation

| Test | VÃ©rification |
| :--- | :--- |
| TEST-E1 | Un profil complet produit le bon signalement, avec ses 1 Ã  3 facteurs, sa rÃ¨gle et son badge. Un profil incomplet produit un Niveau Gris |
| TEST-E2 | Aucun champ `priority_score` n'est prÃ©sent dans l'API ni dans l'interface de la fiche clinique. Un parcours unique regroupe les actes compatibles |
| TEST-E3 | Un refus ou un retrait de consentement arrÃªte toute relance en moins d'une seconde. Les messages ne contiennent aucun terme clinique de la liste d'exclusion |
| TEST-E4 | Un segment de 7 personnes est masquÃ©, ainsi que sa cellule complÃ©mentaire, dans l'API et dans l'export |
| TEST-E5 | Une visite Â« PlanifiÃ©e Â» ne compte pas comme rÃ©alisÃ©e tant que le code d'orientation n'a pas Ã©tÃ© saisi par le centre |
| TEST-E6 | L'observatoire est calculÃ© depuis la cohorte du banc d'essai : sommes de segments exactes, cellules masquÃ©es valides, alertes typÃ©es (C1/C3/C4) et critÃ¨res comparÃ©s Ã  l'invitation par Ã¢ge et sexe |
| TEST-G1 | La matrice de rÃ´les refuse par dÃ©faut : chaque route n'est accessible qu'aux rÃ´les autorisÃ©s, un rÃ´le personnel ne voit que ses dossiers liÃ©s et affiliÃ©s, la santÃ© publique n'a aucun accÃ¨s individuel |
| TEST-G2 | Les seuils cliniques proviennent des documents JSON versionnÃ©s (v1.0.0, hash SHA-256 re-vÃ©rifiÃ©) ; aucun seuil n'est calculÃ© ni tunÃ© dans le code |
| TEST-G3 | Le retrait du consentement gÃ©nomique supprime le signal G1 sans jamais retarder les signalements cliniques (A1/A3) |
| TEST-S1 | Conflit Â« ReportÃ©e Â» (agent hors ligne) contre Â« RÃ©alisÃ©e Â» (centre) : le rÃ©sultat est Â« RÃ©alisÃ©e Â» et le conflit est journalisÃ© |
| TEST-S2 | Un Rouge actif suspend les invitations Jaunes (Ã©clipse) |
| TEST-S3 | Grossesse et tension Ã  150/95 : Rouge (A11) ; A2 et A3 suspendues |
| TEST-S4 | Enfant nÃ© Ã  32 semaines d'amÃ©norrhÃ©e : les scores Z sont calculÃ©s sur l'Ã¢ge corrigÃ© |
| TEST-S5 | Une table de rÃ¨gles non signÃ©e est refusÃ©e |

### 11.4 Plan et points de contrÃ´le

| Date | Jalon | Responsable |
| :--- | :--- | :--- |
| 9â€“11 nov. | Tables JSON (rÃ¨gles, LMS, OMS) ; moteur ; personas | Orace A. (application), Bienderan E. (rÃ©fÃ©rence Python) |
| **12 nov.** | **ContrÃ´le 1 :** rÃ¨gles relues par la gouvernance clinique ; les personas passent | Sydney K. et conseiller clinique |
| 12â€“14 nov. | Ã‰crans 1 et 2, 8 Ã©tats, codes d'orientation ; gÃ©nÃ©rateur de cohorte | Orace A., Bienderan E. |
| **15 nov.** | **ContrÃ´le 2 :** dÃ©monstration de bout en bout, mÃªme sans finition | Toute l'Ã©quipe |
| 15â€“17 nov. | Garde-fous, banc d'essai, messages et audio, finition, tests | Bienderan E., Freud B., Uriel K. |
| **18 nov.** | **Gel du code ;** tous les tests de 11.3 passent | Toute l'Ã©quipe |
| 19 nov. | VidÃ©o, README, mise Ã  jour des tableaux 2.3 et 15.3 | Uriel K., Freud B. |
| 20 nov. | DÃ©pÃ´t | Orace A. |

Si le contrÃ´le 2 n'est pas atteint, tout ce qui est Â« Souhaitable Â» est retirÃ© du pÃ©rimÃ¨tre.

---

## 12. Ã‰quipe et gouvernance clinique

| Membre | RÃ´le | Ã‰tablissement |
| :--- | :--- | :--- |
| Orace ATTINMAWASSONOU | DÃ©veloppement principal et IA, coordination | ENEAM, UAC |
| Bienderan EGBO | Backend, donnÃ©es, statistiques, cohorte synthÃ©tique | ENEAM, UAC |
| Uriel KPEGBE | SÃ©curitÃ©, confidentialitÃ©, documentation | IFRI, UAC |
| Freud BOKOSSA | IA, langues, Ã©valuation et Ã©quitÃ© | IFRI, UAC |
| Sydney KPEGBE | RÃ©fÃ©rent mÃ©dical : rÃ¨gles, calendriers, contenus | FSS, UAC â€” **statut Ã  prÃ©ciser (Ã©tudiant ou mÃ©decin diplÃ´mÃ©), H14** |

**Gouvernance clinique.**
- Toute table de rÃ¨gles est relue par le rÃ©fÃ©rent mÃ©dical et **signÃ©e par un clinicien diplÃ´mÃ©** (mÃ©decine de famille ou pÃ©diatrie), Ã  dÃ©signer **(H14)**.
- Chaque rÃ¨gle porte une date de revue. Une rÃ¨gle reconnue erronÃ©e est retirÃ©e par une nouvelle version signÃ©e, et le retrait est tracÃ©.

**Partenaire.** Nous recherchons un Ã©tablissement agrÃ©Ã© Ã  Abu Dhabi, avec l'appui du programme du dÃ©fi, pour le pilote et pour le raccordement **[V14]**.

---

## 13. ModÃ¨le Ã©conomique et voie vers le pilote

> [!NOTE]
> Aucun prix n'a Ã©tÃ© discutÃ© avec un acheteur. Cette section prÃ©sente **la logique de valeur et les hypothÃ¨ses Ã  tester**. Elle n'annonce pas de rentabilitÃ©.

### 13.1 Qui achÃ¨te, et quoi

| Acheteur type (Abu Dhabi) | Ce qu'il achÃ¨te | Indicateur qui l'intÃ©resse |
| :--- | :--- | :--- |
| Programme public de prÃ©vention | Couverture et Ã©quitÃ© des programmes de visites de l'enfant et de dÃ©pistage de l'adulte | PortÃ©e par segment, lacunes comblÃ©es, zones C1 rÃ©sorbÃ©es |
| RÃ©seau de soins primaires | Remplissage utile des crÃ©neaux, moins de rendez-vous manquÃ©s | Taux de visites confirmÃ©es, ponctualitÃ© |
| Assureur | DÃ©pistages rÃ©alisÃ©s chez ses assurÃ©s Ã  risque | Rendement par invitation, suivi des maladies chroniques |
| Employeur de grands sites | SantÃ© des travailleurs, accÃ¨s facilitÃ© | Bilans rÃ©alisÃ©s sur site |

### 13.2 Ce qui nous distingue

Les rÃ¨gles cliniques sont publiques et peuvent Ãªtre copiÃ©es. La valeur de MediBenin tient ailleurs, au **dernier kilomÃ¨tre** :
- la boucle fermÃ©e jusqu'Ã  la visite confirmÃ©e ;
- l'engagement multilingue avec un choix rÃ©el ;
- les garde-fous d'Ã©quitÃ© et d'incertitude intÃ©grÃ©s ;
- la fonction d'orchestration, qui se branche sur les dossiers existants sans les remplacer.

### 13.3 ModÃ¨les de prix Ã  tester (H15)

- Par personne couverte et par an.
- Par lacune comblÃ©e et confirmÃ©e (paiement au rÃ©sultat).
- Par Ã©tablissement, avec un forfait d'intÃ©gration.

Le choix se fera au pilote, avec le partenaire.

### 13.4 CoÃ»ts : ce que nous savons et ce qui reste Ã  chiffrer

| Poste | Statut |
| :--- | :--- |
| DÃ©veloppement du prototype et d'un premier produit minimal | Estimation interne : 28 000 USD (H16) |
| Infrastructure par Ã©valuation (calcul et messages) | Estimation interne : environ 0,04 USD par Ã©valuation, hors hÃ©bergement souverain (H16) |
| HÃ©bergement aux Ã‰mirats, audit de sÃ©curitÃ©, conformitÃ© | **Ã€ chiffrer avec le partenaire.** Ces postes seront probablement nettement plus Ã©levÃ©s que dans nos versions prÃ©cÃ©dentes |
| Licences des instruments (ASQ-3, etc.) | Ã€ chiffrer [V7] |
| Ã‰quipe et conseiller clinique | Ã€ chiffrer selon le financement du pilote |
| Temps des soignants (validation, confirmation) | MesurÃ© au pilote. La validation par lot des Jaunes vise Ã  le rÃ©duire |

### 13.5 Voie vers le pilote

1. Accord d'un Ã©tablissement partenaire et de l'autoritÃ© compÃ©tente.
2. Autorisations : comitÃ© d'Ã©thique, qualification rÃ©glementaire, conformitÃ© de l'hÃ©bergement.
3. **Budget du pilote demandÃ©**, Ã©tabli avec le partenaire : Ã©quipe, hÃ©bergement, licences, temps de confirmation des visites, traduction et enregistrements audio.
4. Protocole de la section 8.5, avec des critÃ¨res fixÃ©s Ã  l'avance.
5. DÃ©cision de passage Ã  l'Ã©chelle sur ces critÃ¨res.

---

## 14. Matrice des risques

| Risque | GravitÃ© | RÃ©ponse | Responsable |
| :--- | :---: | :--- | :--- |
| Une personne Ã  risque est rassurÃ©e Ã  tort (faux nÃ©gatif) | Critique | Niveau Gris ; badge Â« Ã  confirmer Â» ; contrÃ´le de 5 % des Verts ; alerte C4 | Gouvernance clinique |
| Saturation des centres | Ã‰levÃ©e | CapacitÃ© intÃ©grÃ©e Ã  $S_{\text{prio}}$ ; les Rouges dans une file sÃ©parÃ©e ; validation par lot | Bienderan E. |
| Banc d'essai jugÃ© circulaire | Ã‰levÃ©e | GÃ©nÃ©rateur distinct, scÃ©narios de mauvaise spÃ©cification, limites Ã©crites (8.4) | Bienderan E., Freud B. |
| Erreur de transcription d'un seuil | Critique | Une seule source JSON signÃ©e ; tests par rÃ¨gle ; relecture clinique | Orace A., Sydney K. |
| Affirmation rÃ©glementaire ou clinique inexacte | Ã‰levÃ©e | Registre 15.3 ; rien n'est affirmÃ© sans source | Uriel K. |
| Licence d'un instrument non obtenue | Moyenne | Items non reproduits ; instrument de remplacement | Uriel K. |
| Retard du prototype | Ã‰levÃ©e | PÃ©rimÃ¨tre MoSCoW ; points de contrÃ´le des 12 et 15 novembre | Orace A. |
| IniquitÃ© d'accÃ¨s (langue, nationalitÃ©, gÃ©nomique) | Ã‰levÃ©e | Segments locaux, alertes d'Ã©quitÃ©, voie familiale | Freud B. |
| RÃ©-identification dans la console | Ã‰levÃ©e | Masquage dans l'API, suppression secondaire | Uriel K. |
| Fatigue des soignants face aux validations | Moyenne | Lots homogÃ¨nes pour les Jaunes ; revue une par une des Orange seulement | Gouvernance clinique |

---

## 15. HypothÃ¨ses, limites et registre des vÃ©rifications

### 15.1 HypothÃ¨ses (H)

| NÂ° | HypothÃ¨se |
| :---: | :--- |
| H1 | DÃ©lais par niveau (Orange 7 Ã  14 jours, Jaune 30 Ã  90 jours) |
| H2 | Seuil de vigilance tensionnelle Ã  130/85 (Jaune) |
| H3 | Seuil de 5 % pour le Jaune du modÃ¨le OMS |
| H4 | RÃ¨gle Â« origine asiatique et IMC â‰¥ 23 Â» ajoutÃ©e au FINDRISC |
| H5 | DÃ©lai de 6 mois pour le suivi interrompu |
| H6 | Cibles de couverture des rÃ¨gles C1 |
| H7 | Ïƒ = 5 mmHg pour la tension moyenne (intervalle de risque) |
| H8 | Seuils de 10 et 6 mmHg pour la troisiÃ¨me mesure de tension |
| H9 | Ã‚ge de dÃ©part du bilan avancÃ© par la gÃ©nomique (G1) |
| H10 | Poids de $S_{\text{prio}}$ |
| H11 | Regroupement des nationalitÃ©s en grands groupes |
| H12 | Ã‰cart d'accÃ¨s Ã  la gÃ©nomique selon la nationalitÃ© |
| H13 | Structure dÃ©mographique de la cohorte synthÃ©tique |
| H14 | Statut du rÃ©fÃ©rent mÃ©dical ; dÃ©signation d'un clinicien signataire |
| H15 | ModÃ¨les de prix |
| H16 | Estimations internes de coÃ»ts |

### 15.2 Limites

- **Aucune performance clinique n'est dÃ©montrÃ©e.** Le prototype repose sur des donnÃ©es synthÃ©tiques ; il valide la chaÃ®ne de traitement et les garde-fous.
- **Le modÃ¨le OMS est limitÃ© aux 40â€“80 ans.** En dessous, seules les rÃ¨gles de tension, de FINDRISC, d'antÃ©cÃ©dents et de gÃ©nomique s'appliquent.
- **Le choix de la rÃ©gion OMS est imparfait pour les rÃ©sidents d'autres origines.** Il est signalÃ© dans le badge de certitude.
- **La gÃ©nomique est simulÃ©e.** Sa disponibilitÃ© rÃ©elle et son Ã©quitÃ© restent Ã  Ã©tablir.
- **Les indicateurs de rÃ©sultats dÃ©pendent de la confirmation des visites par les centres.**
- **L'estimation des faux nÃ©gatifs repose sur un Ã©chantillon de contrÃ´le de faible puissance.**
- **Aucun raccordement rÃ©el** Ã  Malaffi, Ã  Sahatna ou au registre vaccinal.

### 15.3 Registre des vÃ©rifications (V)

| NÂ° | Point Ã  vÃ©rifier | Section | Responsable | Ã‰chÃ©ance | Si non vÃ©rifiÃ© |
| :---: | :--- | :---: | :--- | :--- | :--- |
| V3 | Standard DoH des visites de l'enfant (version, visites, contenus, fenÃªtres) et calendrier vaccinal national | 4.2, Annexe C | Sydney K. | 12 nov. | RÃ¨gles P3, P4, P5, P11 marquÃ©es Â« Ã  vÃ©rifier Â» dans l'application |
| V4 | Programme IFHAS (tranches, pÃ©riodicitÃ©, contenus) et intervalles nationaux de dÃ©pistage des cancers | 4.3 | Sydney K. | 12 nov. | RÃ¨gles A5 Ã  A8 et A10 marquÃ©es Â« Ã  vÃ©rifier Â» |
| V5 | RÃ©sultats gÃ©nomiques restituÃ©s par le programme Ã©mirati, forme, population couverte | 3.1, 4.8 | Uriel K. | Avant le dÃ©pÃ´t | Le signal reste explicitement simulÃ© |
| V6 | Ã‚ge du bilan lipidique de l'enfant en cas d'hypercholestÃ©rolÃ©mie familiale | 4.2 | Sydney K. | 12 nov. | Valeur de dÃ©part annoncÃ©e |
| V7 | Licences : ASQ-3, M-CHAT-R/F, FINDRISC | 10.4 | Uriel K. | 14 nov. | Items non reproduits |
| V9 | CatÃ©gories de couverture d'assurance Ã  Abu Dhabi | 7.1 | Freud B. | 14 nov. | Dimension retirÃ©e |
| V10 | Langues prioritaires selon le partenaire | 6.1 | Freud B. | Pilote | Arabe et anglais seulement |
| V11 | Relecture des messages par des locuteurs natifs extÃ©rieurs Ã  l'Ã©quipe | 6 | Freud B. | 17 nov. | Messages marquÃ©s Â« non relus Â» |
| V12 | Sources dÃ©mographiques publiques d'Abu Dhabi | 8.4 | Bienderan E. | 13 nov. | Structure dÃ©clarÃ©e comme hypothÃ©tique |
| V13 | Qualification rÃ©glementaire, PDPL, politiques IA du DoH, confidentialitÃ© de l'adolescent, protocole d'urgence | 4.5, 6.4, 10 | Uriel K. | Avant le pilote | Aucun usage rÃ©el |
| V14 | AccÃ¨s Ã  Malaffi, ADHICS, Ã©tablissement partenaire | 9.3, 10.2, 12 | Orace A. | AprÃ¨s le concours | Export FHIR seulement |
| V15 | Codes LOINC non confirmÃ©s | 9.3 | Bienderan E. | 14 nov. | Codes locaux temporaires |

---

## 16. TransfÃ©rabilitÃ© aux contextes Ã  ressources limitÃ©es

MediBenin est nÃ© Ã  l'UniversitÃ© d'Abomey-Calavi, au BÃ©nin. Les choix qui rendent l'outil utile aux populations les moins bien servies d'Abu Dhabi le rendent aussi transfÃ©rable aux systÃ¨mes Ã  ressources limitÃ©es : saisie guidÃ©e par l'audio, Niveau Gris quand les analyses manquent, modÃ¨les sans laboratoire, synchronisation diffÃ©rÃ©e, profils de rÃ¨gles par pays. Un profil BÃ©nin (calendrier national, rÃ©gion OMS Â« Afrique subsaharienne de l'Ouest Â») est envisagÃ© **aprÃ¨s** le concours. Il ne fait pas partie du prototype et **n'a pas Ã©tÃ© testÃ© sur le terrain**.

---

## Annexes

### Annexe A. ModÃ¨le OMS 2019 sans laboratoire

- **Source :** WHO CVD Risk Chart Working Group, *Lancet Global Health*, 2019 : modÃ¨les recalibrÃ©s pour 21 rÃ©gions du monde.
- **ImplÃ©mentation de rÃ©fÃ©rence :** calculateur ou paquet publiÃ© **[nom et version Ã  consigner, V15]**. Les coefficients sont chargÃ©s depuis la source, jamais retapÃ©s.
- **RÃ©sultat :** risque Ã  10 ans d'infarctus ou d'AVC, mortel ou non.
- **Variables :** Ã¢ge, sexe, tabagisme actuel, tension systolique (moyenne des mesures retenues), IMC.
- **Domaine :** 40 Ã  80 ans, en dehors de la grossesse.
- **RÃ©gion :** Â« North Africa and Middle East Â» par dÃ©faut Ã  Abu Dhabi. Si l'origine est dÃ©clarÃ©e et autorisÃ©e, la rÃ©gion d'origine peut Ãªtre proposÃ©e (par exemple Â« South Asia Â»), et le badge indique que le choix de rÃ©gion est incertain (H11).
- **Affichage :** risque OMS avec son intervalle (4.6) ; facteurs contrefactuels ; **aucune modification du risque par la gÃ©nomique** (4.8).
- **Test d'acceptation :** au moins 50 profils de rÃ©fÃ©rence, en concordance avec l'implÃ©mentation publiÃ©e.

### Annexe B. FINDRISC (LindstrÃ¶m et Tuomilehto, *Diabetes Care*, 2003)

| Item | RÃ©ponse : points |
| :--- | :--- |
| Ã‚ge | < 45 ans : 0 Â· 45â€“54 : 2 Â· 55â€“64 : 3 Â· > 64 : 4 |
| IMC | < 25 : 0 Â· 25â€“30 : 1 Â· > 30 : 3 |
| Tour de taille | Homme : < 94 cm : 0 Â· 94â€“102 : 3 Â· > 102 : 4 ; Femme : < 80 cm : 0 Â· 80â€“88 : 3 Â· > 88 : 4 |
| ActivitÃ© physique â‰¥ 30 min/jour | Oui : 0 Â· Non : 2 |
| Fruits ou lÃ©gumes chaque jour | Oui : 0 Â· Non : 1 |
| Traitement antihypertenseur | Non : 0 Â· Oui : 2 |
| GlycÃ©mie Ã©levÃ©e dÃ©jÃ  constatÃ©e | Non : 0 Â· Oui : 5 |
| DiabÃ¨te dans la famille | Non : 0 Â· 2e degrÃ© : 3 Â· 1er degrÃ© : 5 |

Total de 0 Ã  26. MediBenin : 15 ou plus = Orange ; 12 Ã  14 = Jaune. Grille suspendue pendant la grossesse. Pour les personnes d'origine asiatique, la rÃ¨gle A4 **s'ajoute** au score ; elle ne le modifie pas.

### Annexe C. Calendriers de l'enfant (profil Abu Dhabi)

- **Visites de l'enfant selon le standard DoH `DOH/WCV/SD`** **[Ã€ VÃ‰RIFIER, V3]** : nouveau-nÃ©, 1, 2, 4, 6, 9, 12, 15 et 18 mois, 2 ans, 2 ans et demi, 3, 4, 5 et 6 ans. Contenu de chaque visite (croissance, dÃ©veloppement, dÃ©pistage de l'autisme, de l'anÃ©mie, de la vision et de l'audition, vaccins) Ã  recopier depuis le texte officiel, avec la rÃ©fÃ©rence de page.
- **Calendrier vaccinal national des Ã‰AU :** Ã  recopier depuis la source officielle, avec sa date **[V3]**. Les rÃ¨gles P4 et P11 lisent cette table ; elles ne codent aucun vaccin en dur.
- **De 6 Ã  17 ans :** suivi de la croissance selon la rÃ©fÃ©rence OMS 2007, de la tension (AAP 2017), de la vision et de l'audition, et des vaccins de l'adolescence, selon les textes nationaux de santÃ© scolaire et adolescente **[V3]**.

### Annexe D. Textes types

**Consentement (adulte) :**
> Â« Bonjour. Je travaille avec le centre de santÃ© de [lieu]. Avec votre accord, nous allons faire un point de prÃ©vention d'environ 8 minutes. Vous pouvez accepter certaines choses et en refuser d'autres : l'Ã©valuation, les rappels sur votre tÃ©lÃ©phone, l'envoi de votre dossier au centre, les statistiques anonymes, l'utilisation d'un rÃ©sultat gÃ©nÃ©tique que vous avez dÃ©jÃ . Refuser ne change rien Ã  votre accÃ¨s aux soins, et vous pouvez changer d'avis plus tard. Qu'acceptez-vous ? Â»

**Consentement (parent ou aidant) :** mÃªme trame, avec : Â« Les informations de votre enfant ne sont transmises qu'au centre de santÃ©. Â» L'adolescent de 12 Ã  17 ans donne aussi son accord.

**Exemple d'aide Ã  la dÃ©cision (dÃ©pistage colorectal par FIT) :**
> Â« Ce test cherche des traces de sang invisibles dans les selles. Il se fait chez vous, en quelques minutes. Il aide Ã  trouver tÃ´t des lÃ©sions qui se soignent mieux Ã  un stade prÃ©coce. Un test positif ne veut pas dire cancer : la plupart du temps, l'examen de contrÃ´le est normal, mais il est nÃ©cessaire. Vous pouvez refuser ou demander Ã  en parler avec un soignant. Â»

**Message d'invitation :**
> Â« Bonjour. Une visite de prÃ©vention est proposÃ©e pour [vous / votre enfant] le [date] au centre de [lieu]. RÃ©pondez 1 pour confirmer, 2 pour choisir une autre date, 3 si vous ne souhaitez pas participer. Â»

Aucun message ne contient de diagnostic, de score ni de mention gÃ©nÃ©tique. Tous les textes sont relus par des locuteurs natifs **[V11]** et validÃ©s par la gouvernance clinique.

### Annexe E. Sources de donnÃ©es et droits d'utilisation

| Source | PropriÃ©taire | Usage dans le projet | DonnÃ©es personnelles rÃ©elles |
| :--- | :--- | :--- | :---: |
| ModÃ¨les OMS 2019 sans laboratoire | OMS, *Lancet Global Health* | ImplÃ©mentation citÃ©e | Non |
| Standards de croissance OMS (2006) et rÃ©fÃ©rence 2007 | OMS | Tables LMS | Non |
| FINDRISC | LindstrÃ¶m et Tuomilehto | Grille citÃ©e [V7] | Non |
| M-CHAT-R/F, ASQ-3 | Auteurs et Ã©diteurs | Logique de rÃ¨gle seulement ; items non reproduits sans autorisation [V7] | Non |
| Recommandations AAP 2017 sur la tension de l'enfant, OMS HEARTS, CDC STEADI | Organismes citÃ©s | Seuils citÃ©s | Non |
| Textes du DoH et de l'ADPHC (visites de l'enfant, IFHAS) | AutoritÃ©s d'Abu Dhabi | Calendriers, aprÃ¨s vÃ©rification [V3, V4] | Non |
| Cohorte synthÃ©tique MediBenin | Ã‰quipe CareX | Banc d'essai et dÃ©monstration | **Non (100 % synthÃ©tique)** |
| Signal gÃ©nomique de dÃ©monstration | Ã‰quipe CareX | Ressource FHIR fictive | **Non** |
