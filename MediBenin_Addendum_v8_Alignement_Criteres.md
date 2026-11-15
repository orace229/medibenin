# MediBenin â€” Addendum v8.0 : alignement sur les critÃ¨res d'Ã©valuation

**Addendum Ã  la v7.0 du cahier des charges Â· Challenge 04 : Precision Prevention and Screening**

| | |
| :--- | :--- |
| **Version** | 8.0 (addendum Ã  la v7.0), 10 novembre 2026 |
| **Ã‰quipe** | CareX (UniversitÃ© d'Abomey-Calavi : ENEAM, IFRI, FSS) |
| **Source des critÃ¨res** | Page officielle du dÃ©fi (Hack2skill), consultÃ©e le 10 novembre 2026. Les six critÃ¨res sont listÃ©s avec la mention Â« Impact first. Then proof that it works. Â». **Les pondÃ©rations ne sont pas publiÃ©es.** |
| **Non vÃ©rifiÃ©** | Les rÃ©ponses de la FAQ et la page des rÃ¨gles complÃ¨tes n'ont pas pu Ãªtre lues : voir V16 et V17 (section 26) |
| **Convention** | MÃªmes marquages que la v7.0 : fait sourcÃ©, hypothÃ¨se (H), **[Ã€ VÃ‰RIFIER]**, **[SIMULÃ‰]** |

> [!IMPORTANT]
> **Ce que cet addendum change dans la stratÃ©gie.** La v7.0 est trÃ¨s forte sur la gouvernance et la pertinence clinique, mais trois critÃ¨res restent insuffisamment servis : la **profondeur technique** (le moteur est 100 % rÃ¨gles), la **solution fonctionnelle** (pÃ©rimÃ¨tre trop large pour 10 jours) et la **viabilitÃ© commerciale** (aucun acheteur ni modÃ¨le Ã©conomique testÃ©). L'Ã©valuation se fait **sur dossier, sans l'Ã©quipe** (le jury dÃ©signe les trois finalistes uniquement sur Ã©valuation, avant GITEX) : tout doit Ãªtre comprÃ©hensible et vÃ©rifiable Ã  partir du dÃ©pÃ´t, de la dÃ©mo hÃ©bergÃ©e et de la vidÃ©o.

---

## Instructions d'intÃ©gration Ã  la v7.0

| Section v7.0 | Modification Ã  faire |
| :--- | :--- |
| 0. Lecture rapide | Ajouter la phrase de positionnement (17.1) et remplacer Â« ce que le jury verra Â» par la liste du 20.1 |
| 2.3 Statut des briques | Ajouter les lignes M1 et M2 (19.3, 19.4) avec le statut Â« RÃ©el (donnÃ©es synthÃ©tiques) Â» |
| 9.1 Architecture | Remplacer le schÃ©ma par celui du 19.2 (couche ML) ; appliquer AD-1 (application web unique) |
| 11.1, 11.2, 11.4 | RemplacÃ©es par les sections 24.1 Ã  24.3 et 20.2 |
| 13 ModÃ¨le Ã©conomique | ComplÃ©tÃ©e par la section 23 |
| 14 Matrice des risques | Ajouter le registre des dangers D1 Ã  D12 (21.1) |
| 15 HypothÃ¨ses et vÃ©rifications | Ajouter H17 Ã  H24 et V16 Ã  V20 (section 26) |
| Nouvelle section | InsÃ©rer les sections 17 Ã  26 aprÃ¨s la section 16 |

---

## 17. Alignement sur les critÃ¨res d'Ã©valuation

### 17.1 Positionnement en une phrase

**FR :** MediBenin ne remplace pas le jugement clinique : il ferme la boucle entre un risque repÃ©rÃ© et une visite rÃ©ellement faite, avec des rÃ¨gles publiques, une incertitude visible et des garde-fous d'Ã©quitÃ© mesurÃ©s.

**EN:** MediBenin does not replace clinical judgement: it closes the loop between an identified risk and a completed visit, using published rules, visible uncertainty and measured equity safeguards.

### 17.2 Matrice critÃ¨re par critÃ¨re

| # | CritÃ¨re officiel | Ce que le jury cherche (notre lecture) | Notre rÃ©ponse | Preuve visible dans le dÃ©pÃ´t ou la dÃ©mo | Sections |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Health impact and clinical relevance** | Un problÃ¨me de santÃ© rÃ©el, une chaÃ®ne causale crÃ©dible jusqu'au bÃ©nÃ©fice, des rÃ¨gles dÃ©fendables cliniquement | ThÃ©orie du changement en 6 maillons, mesure Ã  chaque maillon, rÃ¨gles traÃ§ables jusqu'Ã  une directive et signÃ©es par un clinicien | SchÃ©ma de la chaÃ®ne ; fiche d'un signalement avec rÃ¨gle et source ; modÃ¨le d'impact | 18, 4, 8 |
| 2 | **Technical depth and architecture** | Une architecture rÃ©flÃ©chie, des choix justifiÃ©s, de l'IA ou du ML bien placÃ©, de la qualitÃ© d'ingÃ©nierie | RÃ¨gles pour le clinique, **ML pour le logistique** (prÃ©diction de non-prÃ©sentation, message adaptÃ© sous contrainte), dÃ©cisions d'architecture documentÃ©es, tests, reproductibilitÃ© | DÃ©pÃ´t avec tests ; fiche modÃ¨le ; schÃ©ma d'architecture ; rÃ©sultats d'Ã©valuation ML | 19, 9 |
| 3 | **Working solution and demonstration quality** | Un prototype qui tourne, une dÃ©mo claire, qui marche sans l'Ã©quipe | Application web hÃ©bergÃ©e, trois personas prÃ©chargÃ©s, vidÃ©o de 5 minutes, README de dÃ©marrage en moins de 5 minutes | Lien de dÃ©mo, vidÃ©o, rapport de tests | 20, 24 |
| 4 | **Responsible AI, safety and data governance** | Supervision humaine, gestion des dangers, Ã©quitÃ©, vie privÃ©e, transparence sur l'IA | Registre des dangers, matrice de supervision humaine, gouvernance des donnÃ©es, tests d'Ã©quitÃ©, divulgation de l'usage de l'IA | Registre D1â€“D12, fiche modÃ¨le, journal d'usage des donnÃ©es | 21, 3, 7 |
| 5 | **Scalability and deployment readiness** | Une route crÃ©dible du prototype Ã  un dÃ©ploiement rÃ©el | Paliers prototype, pilote, programme, autre pays ; modÃ¨le de capacitÃ© ; mode Â« ombre Â» ; checklist de prÃ©paration | Tableau des paliers, checklist avec statuts | 22 |
| 6 | **Commercial viability and path to pilot** | Un acheteur identifiÃ©, une valeur mesurable, un chemin concret jusqu'au pilote | Panorama de l'existant, Ã©conomie unitaire, pilote en 4 phases dont une phase Â« ombre Â», questions Ã  valider avec un acheteur | Tableau comparatif, plan de pilote avec critÃ¨res de passage fixÃ©s Ã  l'avance | 23, 13 |

### 17.3 AutoÃ©valuation qualitative (estimation interne, pas une prÃ©diction de note)

| CritÃ¨re | Ã‰tat v7.0 | Cible v8.0 | Condition pour l'atteindre |
| :--- | :---: | :---: | :--- |
| 1. Impact et pertinence clinique | Fort | Fort | Ajout de la thÃ©orie du changement et du modÃ¨le d'impact |
| 2. Profondeur technique | Moyen | Fort | **M1 et M2 livrÃ©s et Ã©valuÃ©s**, dÃ©cisions d'architecture documentÃ©es |
| 3. Solution fonctionnelle | Moyen | Fort | **PÃ©rimÃ¨tre v8 tenu**, dÃ©ploiement hÃ©bergÃ©, vidÃ©o |
| 4. IA responsable | Fort | Fort | Registre des dangers et fiche modÃ¨le livrÃ©s |
| 5. Ã‰chelle et dÃ©ploiement | Moyen | Moyen Ã  Fort | ModÃ¨le de capacitÃ©, mode Â« ombre Â», checklist |
| 6. ViabilitÃ© commerciale | Fragile | Moyen | Aucun acheteur n'est validÃ© : on prÃ©sente un cadre et un plan, **sans prÃ©tendre Ã  une demande prouvÃ©e** |

---

## 18. CritÃ¨re 1 : impact en santÃ© et pertinence clinique

### 18.1 ThÃ©orie du changement

```mermaid
flowchart LR
    A["1. RepÃ©rer<br/>risques et lacunes<br/>(rÃ¨gles P, A, C, G)"] --> B["2. Inviter<br/>bon parcours,<br/>bon moment, bon canal"]
    B --> C["3. Visite confirmÃ©e<br/>(boucle fermÃ©e)"]
    C --> D["4. Condition dÃ©tectÃ©e<br/>ou vaccin rattrapÃ©"]
    D --> E["5. Prise en charge<br/>ou suivi engagÃ©"]
    E --> F["6. RÃ©sultat de santÃ©<br/>(hors pÃ©rimÃ¨tre du concours)"]
```

La valeur de MediBenin se situe aux maillons **2 et 3**, lÃ  oÃ¹ les programmes existants perdent le plus de personnes entre l'alerte et la visite effective **(H17 de dÃ©part : Ã  confirmer avec le partenaire)**.

### 18.2 Ce qu'on mesure Ã  chaque maillon, et oÃ¹

| Maillon | Indicateur | MesurÃ© dans le prototype | MesurÃ© dans le pilote | Au-delÃ  |
| :---: | :--- | :---: | :---: | :---: |
| 1 | PortÃ©e, taux de recommandation, part de Niveau Gris, erreurs par segment | Oui (synthÃ©tique) | Oui | |
| 2 | Part des invitations validÃ©es et envoyÃ©es dans le dÃ©lai du niveau | Oui (simulÃ©) | Oui | |
| 3 | Adoption = visites confirmÃ©es / invitÃ©s ; ponctualitÃ© | Oui (synthÃ©tique) | Oui | |
| 4 | Rendement : conditions confirmÃ©es pour 100 invitations ; doses rattrapÃ©es | Oui (synthÃ©tique) | Oui | |
| 5 | Suivi engagÃ© aprÃ¨s un rÃ©sultat positif | | Oui | |
| 6 | MorbiditÃ©, mortalitÃ©, coÃ»ts Ã©vitÃ©s | | | **Non revendiquÃ©** |

### 18.3 ModÃ¨le d'impact (formules, sans chiffres inventÃ©s)

$$\text{Visites supplÃ©mentaires confirmÃ©es} = N_{\text{invitÃ©s}} \times \left(a_{\text{MediBenin}} - a_{\text{rÃ©fÃ©rence}}\right)$$

$$\text{Conditions supplÃ©mentaires dÃ©tectÃ©es} = \text{Visites supplÃ©mentaires} \times r$$

oÃ¹ $a$ est le taux d'adoption (visites confirmÃ©es / invitÃ©s) et $r$ le rendement par visite (conditions confirmÃ©es / visites). Les valeurs de $a_{\text{rÃ©fÃ©rence}}$ et de $r$ **viennent du partenaire et du pilote** ; le prototype ne les fixe pas.

**Table de sensibilitÃ© livrÃ©e avec la dÃ©mo :** rÃ©sultat du modÃ¨le pour une grille de valeurs de $a$ et de $r$, prÃ©sentÃ©e comme un *outil de raisonnement* et non comme une prÃ©vision.

### 18.4 Pertinence clinique : ce qui rend les rÃ¨gles dÃ©fendables

- Chaque rÃ¨gle cite sa directive, sa version et son statut (PubliÃ©, H ou Ã€ VÃ‰RIFIER) : tableaux 4.2 et 4.3.
- Toute table est **signÃ©e par un clinicien diplÃ´mÃ©** avant usage (section 12, H14). **Tant que ce clinicien n'est pas identifiÃ©, l'Ã©crire explicitement dans le dossier.**
- Un rÃ©sultat ne prÃ©sente jamais un score comme un diagnostic ; le Niveau Gris et le badge Â« Ã  confirmer Â» empÃªchent de rassurer Ã  tort.
- **Ce que nous ne prÃ©tendons pas :** aucune performance clinique, aucun effet sur la santÃ©, aucune sensibilitÃ© ni spÃ©cificitÃ© rÃ©elle (15.2).

### 18.5 AdÃ©quation avec l'Ã©noncÃ© du dÃ©fi

| Attente de l'Ã©noncÃ© | RÃ©ponse MediBenin |
| :--- | :--- |
| Passer d'une prise en charge rÃ©active Ã  une prÃ©vention prÃ©dictive | RepÃ©rage par rÃ¨gles multi-domaines plutÃ´t que par Ã¢ge et sexe seuls |
| Transformer des donnÃ©es longitudinales en actions concrÃ¨tes | Parcours unique, Ã©chÃ©ance, rappel, suivi en Ã©tats, visite confirmÃ©e |
| Exploiter les informations gÃ©nomiques | RÃ¨gle d'Ã©ligibilitÃ© G1 Ã  G3 **[SIMULÃ‰]**, voie d'accÃ©lÃ©ration familiale pour l'Ã©quitÃ© |
| Transparence sur l'usage et les autorisations des donnÃ©es | Consentement par finalitÃ©, journal d'usage consultable |

---

## 19. CritÃ¨re 2 : profondeur technique et architecture

### 19.1 Principe directeur (dÃ©cision AD-2)

> **Les rÃ¨gles dÃ©cident du clinique ; le ML n'agit que sur le logistique.**
> Le niveau d'un signalement (Rouge, Orange, Jaune, Vert, Gris) vient uniquement de rÃ¨gles publiques, signÃ©es et explicables. Le ML estime des **probabilitÃ©s opÃ©rationnelles** (la personne viendra-t-elle ?) pour mieux accompagner, jamais pour dÃ©classer.

**Pourquoi ce choix.** (1) Il n'existe pas de donnÃ©es rÃ©elles Ã©tiquetÃ©es pour apprendre un risque clinique. (2) Un risque appris et opaque serait difficile Ã  signer et Ã  auditer. (3) Le dÃ©fi demande de la transparence sur les facteurs de chaque signalement. En revanche, la non-prÃ©sentation est un problÃ¨me oÃ¹ l'apprentissage apporte de la valeur sans compromettre la sÃ©curitÃ© clinique.

### 19.2 Architecture mise Ã  jour (dÃ©cision AD-1 : une application web unique)

**AD-1.** Pour tenir le dÃ©lai, le prototype est **une application web responsive (PWA)** servie par FastAPI et React, qui sert Ã  la fois d'interface de terrain et de console. L'application Flutter native passe en feuille de route (statut mis Ã  jour en 2.3). Une dÃ©monstration hors ligne simple reste possible via le mode PWA **(Facultatif)**.

```mermaid
flowchart TB
    subgraph U["Interface web (PWA, React)"]
        U1["Consentement et journal d'usage"]
        U2["Saisie guidÃ©e et protocoles de mesure"]
        U3["Ã‰cran 1 : priorisation (logistique)"]
        U4["Ã‰cran 2 : fiche clinique (sans S_prio, sans ML)"]
        U5["Tableau de bord : Ã©quitÃ© et rÃ©sultats"]
    end
    subgraph A["API (FastAPI)"]
        A1["Authentification et rÃ´les"]
        A2["Moteur de rÃ¨gles P, A, C, G<br/>(tables JSON signÃ©es)"]
        A3["Suivi en Ã©tats, codes d'orientation, conflits"]
        A4["Garde-fous : masquage, Wilson"]
        A5["Journal d'audit"]
    end
    subgraph M["Couche ML (logistique seulement)"]
        M1["M1 : probabilitÃ© de non-prÃ©sentation"]
        M2["M2 : message adaptÃ© sous contraintes"]
        M3["Fiche modÃ¨le, versions, suivi de dÃ©rive"]
    end
    D[("PostgreSQL")]
    U --> A
    A2 --> A3
    A3 --> M1
    M1 --> U3
    A3 --> M2
    A --> D
    A4 --> U5
    A2 --> U4
```

**Garde-fou architectural :** la couche ML n'a **aucun accÃ¨s en Ã©criture** au niveau d'un signalement ni Ã  l'Ã©cran 2. Un test automatique vÃ©rifie qu'aucun champ issu du ML n'apparaÃ®t dans les rÃ©ponses de l'API destinÃ©es Ã  la fiche clinique (TEST-M2).

### 19.3 M1 : probabilitÃ© de non-prÃ©sentation

| Ã‰lÃ©ment | Choix |
| :--- | :--- |
| **Question** | Pour une invitation envoyÃ©e, quelle est la probabilitÃ© qu'elle n'aboutisse pas Ã  une visite confirmÃ©e dans sa fenÃªtre ? |
| **Cible** | Invitation sans Ã©tat Â« RÃ©alisÃ©e Â» dans le dÃ©lai du niveau |
| **Variables autorisÃ©es** | Rang de l'invitation, canal, langue, temps d'accÃ¨s, crÃ©neau (jour, heure), nombre de visites manquÃ©es antÃ©rieures, type de parcours, pÃ©riode du Ramadan, dÃ©lai dÃ©jÃ  Ã©coulÃ© |
| **Variables exclues du modÃ¨le** | NationalitÃ©, religion, gÃ©nomique, Ã©tat de santÃ© dÃ©taillÃ©. Elles ne servent **qu'Ã  l'audit d'Ã©quitÃ©** (21.4) |
| **ModÃ¨les comparÃ©s** | (a) rÃ©fÃ©rence simple : taux historique par type de parcours ; (b) rÃ©gression logistique ; (c) boosting d'arbres (par exemple `HistGradientBoostingClassifier`). On retient le plus simple dont les performances sont Ã©quivalentes (tolÃ©rance H18) |
| **Calibrage** | Calibrage isotonique ou de Platt ; on publie le score de Brier et l'ECE |
| **Explication** | Coefficients pour (b) ; contributions SHAP, trois facteurs affichÃ©s, pour (c) |
| **Usage autorisÃ©** | (1) ajuster le moment et le canal du rappel ; (2) proposer un contact humain pour les Orange Ã  forte probabilitÃ© de non-prÃ©sentation (budget H19) ; (3) suggÃ©rer un surbooking agrÃ©gÃ© au niveau du centre |
| **Usage interdit** | **Abaisser la prioritÃ© d'une personne ou retarder une invitation.** Le ML ne peut que *renforcer* l'accompagnement. Cette rÃ¨gle est testÃ©e (TEST-M1) |
| **VisibilitÃ©** | Ã‰cran 1 uniquement. Jamais sur la fiche clinique |
| **Statut** | RÃ©el, entraÃ®nÃ© et Ã©valuÃ© sur donnÃ©es synthÃ©tiques **[SIMULÃ‰]** |

### 19.4 M2 : message adaptÃ© sous contraintes

| Ã‰lÃ©ment | Choix |
| :--- | :--- |
| **RÃ´le** | Reformuler un **modÃ¨le de message validÃ© par la gouvernance clinique** selon la langue, le destinataire et le registre |
| **Ce que le modÃ¨le voit** | Identifiant du modÃ¨le de message, langue, destinataire (parent, adolescent, adulte), registre. **Aucune donnÃ©e de santÃ© ni donnÃ©e personnelle** |
| **ContrÃ´les automatiques** | Liste d'exclusion (diagnostic, score, mention gÃ©nÃ©tique), conservation des variables (`[date]`, `[lieu]`), longueur maximale, niveau de lecture, similaritÃ© avec le message validÃ© par rÃ©tro-traduction |
| **Validation humaine** | **Toujours** avant envoi (6.5). Aucun envoi automatique |
| **Repli** | Variantes prÃ©Ã©crites si le modÃ¨le de langage est indisponible, ou si V19 interdit son usage |
| **Statut** | RÃ©el pour la gÃ©nÃ©ration et les contrÃ´les ; envoi **[SIMULÃ‰]** |

### 19.5 Ce que nous avons volontairement Ã©cartÃ© (M0 : risque clinique appris)

Un modÃ¨le qui apprendrait les lacunes de soins ou le risque Ã  partir de donnÃ©es est **hors prototype**. Raisons : pas d'Ã©tiquettes rÃ©elles, risque de circularitÃ© avec nos donnÃ©es synthÃ©tiques, perte de transparence. Il reste en **feuille de route**, Ã  envisager sur les donnÃ©es du pilote, avec une Ã©valuation prospective et une comparaison aux rÃ¨gles.

### 19.6 Protocole d'Ã©valuation du ML

| Ã‰lÃ©ment | Protocole |
| :--- | :--- |
| DÃ©coupage | Par graine et par pÃ©riode (entraÃ®nement sur les premiÃ¨res pÃ©riodes, test sur les suivantes) |
| Mesures | PR-AUC, score de Brier, ECE ; **Ã©carts de TPR et de TFP entre segments** |
| Test d'utilitÃ© | Ã€ **budget de contacts humains B Ã©gal (H19)**, comparer le ciblage alÃ©atoire, le ciblage par rÃ¨gle simple et le ciblage M1 sur le taux de visites confirmÃ©es |
| ScÃ©narios dÃ©gradÃ©s | Les trois scÃ©narios de 8.4 (donnÃ©es manquantes non alÃ©atoires, sous-dÃ©claration, historique incomplet) |
| Limite Ã  Ã©crire | La dynamique des non-prÃ©sentations est celle de **notre gÃ©nÃ©rateur** (H24). Le test montre que le mÃ©canisme fonctionne et que le gain est *possible* ; il ne prouve pas un gain rÃ©el |
| GÃ©nÃ©rateur | Les facteurs de non-prÃ©sentation sont documentÃ©s dans le dÃ©pÃ´t avec leur source **[V20]** et sont distincts des variables du modÃ¨le autant que possible |

### 19.7 Fiche modÃ¨le (squelette Ã  remplir dans le dÃ©pÃ´t)

| Rubrique | Contenu |
| :--- | :--- |
| IdentitÃ© | Nom, version, date, responsable |
| Usage prÃ©vu et interdit | 19.3 |
| DonnÃ©es d'entraÃ®nement | SynthÃ©tiques, graine, structure, limites |
| Performance | Mesures de 19.6, avec intervalles |
| Ã‰quitÃ© | Ã‰carts par segment, seuils d'alerte |
| Limites connues | DÃ©pendance au gÃ©nÃ©rateur, absence de donnÃ©es rÃ©elles |
| Surveillance | DÃ©rive des variables, recalibrage, critÃ¨res de retrait |
| Supervision humaine | Qui peut ignorer ou dÃ©sactiver le modÃ¨le |

### 19.8 QualitÃ© d'ingÃ©nierie (visible dans le dÃ©pÃ´t)

- Tests unitaires par rÃ¨gle, tests d'acceptation (11.3 et section 20.5), intÃ©gration continue qui les exÃ©cute.
- ReproductibilitÃ© : une commande (`docker compose up`) lance l'application avec les personas ; la cohorte se rÃ©gÃ©nÃ¨re Ã  partir d'une graine.
- Tables de rÃ¨gles versionnÃ©es et signÃ©es ; une table non signÃ©e est refusÃ©e (TEST-S5).
- API documentÃ©e (OpenAPI), validation des entrÃ©es, journal d'audit.
- Aucun secret ni donnÃ©e rÃ©elle dans le dÃ©pÃ´t.

---

## 20. CritÃ¨re 3 : solution fonctionnelle et qualitÃ© de la dÃ©monstration

### 20.1 Ce que l'Ã©valuateur peut faire seul, sans nous

1. Ouvrir le lien de dÃ©mo, choisir un persona, parcourir le parcours complet.
2. Passer de l'Ã©cran 1 (priorisation) Ã  l'Ã©cran 2 (clinique) et constater que $S_{\text{prio}}$ et le ML ont disparu.
3. Voir un Niveau Gris et un badge de certitude Â« Faible Â».
4. Refuser une recommandation et constater l'arrÃªt des relances.
5. Ouvrir le tableau d'Ã©quitÃ© avec une cellule masquÃ©e.
6. Lancer le banc d'essai et reproduire un rÃ©sultat Ã  partir de la graine.

### 20.2 Script de la vidÃ©o : 5 minutes (remplace 11.2)

| Temps | SÃ©quence | Message clÃ© |
| :---: | :--- | :--- |
| 0:00â€“0:30 | ProblÃ¨me et phrase de positionnement | Les personnes qui en ont le plus besoin sont oubliÃ©es |
| 0:30â€“1:30 | Persona enfant de 18 mois : signalement, facteurs, badge, parcours unique | Transparence et incertitude visibles |
| 1:30â€“2:15 | Persona adulte de 36 ans : rÃ¨gle A4, signal gÃ©nomique **[SIMULÃ‰]**, modÃ¨le OMS Â« hors domaine Â» | Pas de trou, pas de fausse prÃ©cision |
| 2:15â€“3:00 | Ã‰cran 1 puis Ã©cran 2 ; M1 renforce l'accompagnement d'un Orange | SÃ©paration population et clinique ; ML au service de l'accompagnement |
| 3:00â€“3:45 | Message en arabe et en anglais ; refus qui arrÃªte les relances ; visite confirmÃ©e par code | Choix rÃ©el et boucle fermÃ©e |
| 3:45â€“4:30 | Tableau d'Ã©quitÃ©, masquage, comparaison Ã  l'invitation par Ã¢ge et sexe | Garde-fous et Ã©valuation par les rÃ©sultats |
| 4:30â€“5:00 | Limites dÃ©clarÃ©es et chemin vers le pilote | HonnÃªtetÃ© et maturitÃ© |

La vidÃ©o est sous-titrÃ©e en anglais. Elle est publiÃ©e avec un lien stable et incluse dans le dÃ©pÃ´t.

### 20.3 HÃ©bergement et plan de secours

- DÃ©mo hÃ©bergÃ©e, accessible sans installation, avec comptes de dÃ©monstration documentÃ©s.
- **Plan B :** vidÃ©o complÃ¨te et procÃ©dure `docker compose up` testÃ©e sur une machine vierge.
- Test de la dÃ©mo hÃ©bergÃ©e Ã  froid la veille du dÃ©pÃ´t, depuis un rÃ©seau extÃ©rieur Ã  l'universitÃ©.

### 20.4 Personas

Les trois personas de la v7.0 (11.2) sont conservÃ©s et prÃ©chargÃ©s, avec leurs cas limites (dossier incomplet, enfant prÃ©maturÃ©, grossesse). Ils sont dÃ©crits dans le README avec le rÃ©sultat attendu pour chacun.

### 20.5 Tests d'acceptation supplÃ©mentaires

| Test | VÃ©rification |
| :--- | :--- |
| TEST-M1 | Aucune sortie de M1 ne modifie le niveau d'un signalement ni n'abaisse un rang de prioritÃ© |
| TEST-M2 | Aucun champ issu du ML n'apparaÃ®t dans les rÃ©ponses de l'API de la fiche clinique |
| TEST-M3 | M2 : tout message gÃ©nÃ©rÃ© conserve ses variables et Ã©choue au contrÃ´le s'il contient un terme de la liste d'exclusion |
| TEST-M4 | La dÃ©mo dÃ©marre Ã  froid sur une machine vierge en suivant le README (README.md fourni ; un garde-fou automatisÃ© vÃ©rifie que chaque commande du README existe bien dans le projet) |
| TEST-M5 | Le banc d'essai reproduit les mÃªmes rÃ©sultats avec la mÃªme graine |

---

## 21. CritÃ¨re 4 : IA responsable, sÃ©curitÃ© et gouvernance des donnÃ©es

### 21.1 Registre des dangers (complÃ¨te la matrice 14)

| ID | Danger | Cause | ConsÃ©quence | GravitÃ© | Mesure | Test |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| D1 | Faux nÃ©gatif rassurant | DonnÃ©e manquante, rÃ¨gle trop permissive | Retard de prise en charge | Critique | Niveau Gris ; badge Â« Ã  confirmer Â» ; contrÃ´le de 5 % des Verts ; alerte C4 | E1 |
| D2 | Faux positif anxiogÃ¨ne | Seuil trop bas | AnxiÃ©tÃ©, examens inutiles | Moyenne | Aide Ã  la dÃ©cision avec limites ; message sans diagnostic ; suivi du taux | E3 |
| D3 | Message mal traduit ou ambigu | Traduction, reformulation M2 | IncomprÃ©hension, refus | Ã‰levÃ©e | Relecture par locuteurs natifs ; contrÃ´le de rÃ©tro-traduction ; validation humaine | M3 |
| D4 | Fuite ou usage non autorisÃ© de donnÃ©es | ContrÃ´le d'accÃ¨s, journal absent | Atteinte Ã  la vie privÃ©e | Critique | RÃ´les, journal non modifiable, minimisation, masquage dans l'API | E4 |
| D5 | Biais du ML contre un segment | DonnÃ©es dÃ©sÃ©quilibrÃ©es | Accompagnement inÃ©gal | Ã‰levÃ©e | Variables sensibles exclues ; audit d'Ã©quitÃ© ; seuils d'alerte | M-Ã©q |
| D6 | Le score de priorisation utilisÃ© comme dÃ©cision clinique | Confusion des rÃ´les | Mauvaise dÃ©cision individuelle | Ã‰levÃ©e | $S_{\text{prio}}$ absent de l'Ã©cran 2 | E2 |
| D7 | Relances perÃ§ues comme du harcÃ¨lement | Trop de messages | Perte de confiance | Moyenne | Maximum 2 relances ; refus immÃ©diat ; mesure des dÃ©sinscriptions | E3 |
| D8 | DonnÃ©es pÃ©rimÃ©es | Mesure ancienne | Signalement erronÃ© | Moyenne | Badge d'anciennetÃ© ; confiance Â« Faible Â» si trop ancienne | E1 |
| D9 | Conflit de synchronisation | Modifications hors ligne | Visite perdue ou comptÃ©e Ã  tort | Ã‰levÃ©e | RÃ¨gles de 5.5 ; journal des conflits | S1 |
| D10 | Hallucination du modÃ¨le de langage | GÃ©nÃ©ration libre | Message trompeur | Ã‰levÃ©e | ModÃ¨le de message validÃ© ; contrÃ´les automatiques ; validation humaine ; repli prÃ©Ã©crit | M3 |
| D11 | ConfidentialitÃ© de l'adolescent | VisibilitÃ© parentale | Atteinte Ã  la confidentialitÃ© | Ã‰levÃ©e | RÃ¨gles de 6.4 ; donnÃ©es sensibles visibles du seul clinicien | Ã€ Ã©crire |
| D12 | DÃ©rive du modÃ¨le | Changement de population | DÃ©gradation silencieuse | Moyenne | Suivi de dÃ©rive, recalibrage, retrait du modÃ¨le | Ã€ Ã©crire |

### 21.2 Matrice de supervision humaine

| Action | Qui dÃ©cide | RÃ´le de l'IA ou du ML |
| :--- | :--- | :--- |
| Niveau d'un signalement | RÃ¨gles signÃ©es ; le clinicien peut adapter avec un motif | Aucun |
| Validation d'une invitation | Coordinateur ou clinicien | M2 propose le texte |
| Ordre des invitations | Coordinateur (liste proposÃ©e par $S_{\text{prio}}$) | M1 peut **renforcer** l'accompagnement |
| Contact humain pour un Orange | Coordinateur | M1 suggÃ¨re |
| Modification d'une table de rÃ¨gles | Clinicien signataire | Aucun |
| Retrait d'un modÃ¨le | Responsable du modÃ¨le et gouvernance clinique | Alerte de dÃ©rive |

### 21.3 Gouvernance des donnÃ©es

| CatÃ©gorie | FinalitÃ© | Base | Conservation | AccÃ¨s | Suppression |
| :--- | :--- | :--- | :---: | :--- | :--- |
| IdentitÃ© pseudonymisÃ©e | Rattacher les visites | Consentement | H21 | Clinicien du centre | Sur demande |
| Mesures et antÃ©cÃ©dents | Ã‰valuation et calendrier | Consentement (finalitÃ© 1) | H21 | Clinicien | Sur demande |
| Contact et prÃ©fÃ©rences | Rappels | Consentement (finalitÃ© 2) | H21 | Coordinateur | Sur retrait |
| RÃ©sultat gÃ©nomique interprÃ©tÃ© | RÃ¨gle G | Consentement (finalitÃ© 5) | H21 | Clinicien | Sur retrait |
| DonnÃ©es agrÃ©gÃ©es | Statistiques | Consentement (finalitÃ© 4) | Sans limite, masquÃ©es | Coordinateur | Sans objet |
| Journal d'accÃ¨s | Audit | Obligation de sÃ©curitÃ© | H21 | Administrateur | Non |

**Principes :** minimisation, sÃ©paration de l'identitÃ© et des donnÃ©es d'analyse (5.6), hÃ©bergement aux Ã‰mirats (V13, V18), aucune donnÃ©e rÃ©elle dans le prototype.

### 21.4 Plan de test d'Ã©quitÃ©

- Segments de 7.1, publication hiÃ©rarchique, masquage selon 7.3.
- Pour M1 : Ã©cart de TPR et de TFP entre segments ; seuil d'alerte H18 ; un dÃ©passement bloque l'extension.
- Pour les rÃ¨gles : alertes C3 et C4 (4.4).
- Rapport d'Ã©quitÃ© gÃ©nÃ©rÃ© automatiquement et inclus dans le dÃ©pÃ´t.

### 21.5 Liste de contrÃ´le Â« red team Â» pour M2

Tester au minimum : injection dans les variables du message, demande de diagnostic, demande de mention gÃ©nÃ©tique, langue inattendue, message trop long, variables supprimÃ©es, ton culpabilisant, rÃ©fÃ©rence religieuse inappropriÃ©e. RÃ©sultats consignÃ©s dans le dÃ©pÃ´t.

### 21.6 Transparence sur l'usage de l'IA

Le dossier et l'interface indiquent clairement : oÃ¹ le ML intervient (M1, M2), oÃ¹ il n'intervient pas (niveaux cliniques, Ã©cran 2), les donnÃ©es qu'il utilise et celles qu'il n'utilise pas, et comment une personne ou un clinicien peut l'ignorer.

---

## 22. CritÃ¨re 5 : capacitÃ© de passage Ã  l'Ã©chelle et prÃ©paration au dÃ©ploiement

### 22.1 Paliers

| Palier | PÃ©rimÃ¨tre | Ce qui change | PrÃ©requis |
| :--- | :--- | :--- | :--- |
| **0. Prototype** | DonnÃ©es synthÃ©tiques, un dÃ©ploiement unique | Rien de rÃ©el | Concours |
| **1. Mode Â« ombre Â»** | Un centre, donnÃ©es rÃ©elles, **aucun contact avec les personnes** : MediBenin calcule en parallÃ¨le et on compare Ã  ce que le centre a rÃ©ellement fait | AccÃ¨s aux donnÃ©es, hÃ©bergement conforme | Accord partenaire, V13, V14 |
| **2. Pilote** | Un centre, invitations rÃ©elles validÃ©es par humain | Messages rÃ©els, circuit de confirmation | Ã‰thique, protocole 8.5 |
| **3. Programme** | Plusieurs centres, une rÃ©gion | Multi-Ã©tablissements, intÃ©gration, support | CritÃ¨res de passage atteints |
| **4. Autre pays** | Profil de rÃ¨gles du pays | Calendriers, langues, cadre lÃ©gal | Section 16 |

Le **mode Â« ombre Â»** est le choix de prudence : il permet de mesurer la qualitÃ© des signalements sur des donnÃ©es rÃ©elles sans exposer les personnes.

### 22.2 Points d'Ã©chelle techniques

- API sans Ã©tat, derriÃ¨re un Ã©quilibreur ; base PostgreSQL avec partitionnement par Ã©tablissement ; file de tÃ¢ches pour l'envoi et le recalcul.
- RÃ¨gles et profils de pays sous forme de configuration signÃ©e, pas de code.
- Multi-Ã©tablissement dÃ¨s la conception (isolation par Ã©tablissement).
- ModÃ¨les ML versionnÃ©s, recalibrables sans toucher aux rÃ¨gles.

### 22.3 ModÃ¨le de capacitÃ©

$$K_{\text{jour}} = \min\left(\sum_{c} \text{crÃ©neaux libres}_c,\ \text{capacitÃ© de validation humaine}\right)$$

Les invitations proposÃ©es par jour sont limitÃ©es par la capacitÃ© des centres et par le temps de validation des soignants. La validation par lot des Jaunes (6.5) et la file sÃ©parÃ©e des Rouges Ã©vitent la saturation. Les valeurs rÃ©elles viennent du partenaire (H23).

### 22.4 IntÃ©gration et hÃ©bergement

- **IntÃ©gration :** export FHIR R4 rÃ©el dans le prototype ; raccordement Ã  Malaffi ou Ã  d'autres systÃ¨mes via un Ã©tablissement agrÃ©Ã© aprÃ¨s le concours (V14).
- **HÃ©bergement :** aux Ã‰mirats (V13). Les co-crÃ©ateurs du dÃ©fi incluent Microsoft ; Ã©tudier les rÃ©gions cloud disponibles aux Ã‰mirats est une piste, sans engagement ni prÃ©fÃ©rence technique **[Ã€ VÃ‰RIFIER, V18]**. Le dÃ©fi est neutre sur la technologie.

### 22.5 Checklist de prÃ©paration au dÃ©ploiement

| Ã‰lÃ©ment | Statut au dÃ©pÃ´t |
| :--- | :---: |
| Application conteneurisÃ©e et reproductible | RÃ©el |
| Tests automatisÃ©s en intÃ©gration continue | RÃ©el |
| Journal d'audit et contrÃ´le d'accÃ¨s par rÃ´le | RÃ©el |
| Surveillance et alertes (santÃ© du service, dÃ©rive) | Partiel |
| Sauvegarde et restauration documentÃ©es | Feuille de route |
| Test de charge | Feuille de route (**[Ã€ MESURER]**, aucun chiffre annoncÃ©) |
| Audit de sÃ©curitÃ© et analyse d'impact | Feuille de route |
| Qualification rÃ©glementaire (V13) | Feuille de route |
| Plan de support et de formation des soignants | Feuille de route |

---

## 23. CritÃ¨re 6 : viabilitÃ© commerciale et voie vers le pilote

> [!NOTE]
> Aucun acheteur n'a Ã©tÃ© interrogÃ© et aucun prix n'a Ã©tÃ© testÃ©. Cette section prÃ©sente un **cadre et des hypothÃ¨ses Ã  valider**, pas une demande prouvÃ©e.

### 23.1 Panorama de l'existant et diffÃ©renciation

Les catÃ©gories ci-dessous sont celles que nous connaissons ; leurs dÃ©ploiements actuels **[Ã€ VÃ‰RIFIER avant dÃ©pÃ´t]**.

| CatÃ©gorie | Exemples | Ce qu'elle apporte | Ce que MediBenin ajoute (Ã  notre connaissance) |
| :--- | :--- | :--- | :--- |
| DÃ©pistage organisÃ© par invitation | Programmes nationaux (sein, col, cÃ´lon) | Structure, registres, relances | RepÃ©rage multi-domaines au-delÃ  de l'Ã¢ge et du sexe ; Ã©quitÃ© mesurÃ©e par segment |
| GÃ©nomique Ã  grande Ã©chelle | Our Future Health, Genomics England | Risque individuel Ã  partir de la gÃ©nÃ©tique | Usage **encadrÃ©** du signal gÃ©nomique, sans jamais retarder un dÃ©pistage |
| IA de dÃ©pistage par imagerie ou signal | Qure.ai, CAD4TB, IDx-DR | DÃ©tection automatisÃ©e d'une pathologie | MediBenin n'analyse pas d'image : il orchestre le parcours et la boucle fermÃ©e |
| Stratification du risque en santÃ© des populations | Innovaccer, Health Catalyst, modules d'Epic | Identification de patients Ã  haut risque dans de grands systÃ¨mes | LÃ©ger, transparent, avec incertitude visible et garde-fous d'Ã©quitÃ© intÃ©grÃ©s |
| DonnÃ©es de santÃ© publique | DHIS2 | Collecte et agrÃ©gation | Action individuelle et suivi jusqu'Ã  la visite |

**DiffÃ©renciation dÃ©fendable :** la boucle fermÃ©e jusqu'Ã  la visite confirmÃ©e, l'incertitude visible, l'Ã©quitÃ© mesurÃ©e, le ML limitÃ© au logistique. **Ce n'est pas un avantage de brevet** : les rÃ¨gles cliniques sont publiques (13.2).

### 23.2 Acheteurs et valeur mesurable

Voir 13.1. Pour chaque acheteur, la valeur est exprimÃ©e par un indicateur du pilote : lacunes comblÃ©es et confirmÃ©es, rendez-vous manquÃ©s Ã©vitÃ©s, rendement par invitation, bilans rÃ©alisÃ©s. Les **montants** associÃ©s viennent du partenaire.

### 23.3 Ã‰conomie unitaire (cadre)

$$N^{*} = \frac{C_{\text{fixe}}}{R - C_{\text{var}}}$$

oÃ¹ $N^{*}$ est le nombre de personnes couvertes Ã  l'Ã©quilibre, $R$ le revenu par personne couverte, $C_{\text{var}}$ le coÃ»t variable (infrastructure, messages, infÃ©rence ML) et $C_{\text{fixe}}$ les coÃ»ts annuels (Ã©quipe, hÃ©bergement conforme, conformitÃ©, support). Les estimations internes de la v7.0 (H16) restent des hypothÃ¨ses ; **les postes d'hÃ©bergement conforme, de sÃ©curitÃ© et de licences sont Ã  chiffrer avec le partenaire** (13.4).

### 23.4 Chemin vers le pilote en 4 phases (critÃ¨res fixÃ©s Ã  l'avance)

| Phase | Contenu | DurÃ©e | Sortie attendue |
| :---: | :--- | :---: | :--- |
| 0 | Accord du partenaire, Ã©thique, qualification rÃ©glementaire | H21 | Autorisations |
| 1 | **Mode Â« ombre Â»** : calculs en parallÃ¨le sur donnÃ©es rÃ©elles, sans contact | H21 | QualitÃ© des signalements, Ã©carts par segment |
| 2 | Pilote limitÃ© : invitations rÃ©elles validÃ©es par humain | H21 | Adoption, ponctualitÃ©, rendement |
| 3 | Ã‰valuation et dÃ©cision | H21 | Passage Ã  l'Ã©chelle ou arrÃªt selon les critÃ¨res de 8.5 |

### 23.5 Cinq questions Ã  poser Ã  un acheteur ou partenaire potentiel

1. Quel taux de rendez-vous manquÃ©s ou de visites en retard observez-vous aujourd'hui sur ces parcours, et comment le mesurez-vous ?
2. Qui paie le temps de validation des soignants, et combien de temps est acceptable par jour ?
3. Quelles donnÃ©es pouvez-vous partager en mode Â« ombre Â», sous quelles conditions ?
4. Quel indicateur dÃ©clencherait une dÃ©cision de poursuivre ou d'arrÃªter ?
5. Quel modÃ¨le de paiement serait acceptable : par personne, par Ã©tablissement, au rÃ©sultat ?

### 23.6 Pistes de partenariat

Les co-crÃ©ateurs du dÃ©fi (Microsoft, Inception, MBZUAI) et les autoritÃ©s de santÃ© d'Abu Dhabi sont des interlocuteurs potentiels. **Rien n'est acquis** ; l'Ã©valuation de maturitÃ© annoncÃ©e par le dÃ©fi pour les solutions retenues est une occasion Ã  saisir.

---

## 24. PÃ©rimÃ¨tre et plan rÃ©visÃ©s (remplacent 11.1, 11.2 et 11.4)

### 24.1 MoSCoW v8

| PrioritÃ© | Contenu |
| :--- | :--- |
| **Indispensable** | Application web unique (AD-1), hÃ©bergÃ©e ; rÃ¨gles retenues (24.2) ; Niveau Gris et badge de certitude ; Ã©crans 1 et 2 sÃ©parÃ©s ; suivi en **5 Ã©tats** (CrÃ©Ã©e, InvitÃ©e, PlanifiÃ©e, RÃ©alisÃ©e, RefusÃ©e) avec code d'orientation ; **M1 entraÃ®nÃ© et Ã©valuÃ©** ; garde-fous (masquage, Wilson, alertes C1, C3, C4) ; cohorte synthÃ©tique rÃ©duite avec comparaison Ã  l'invitation par Ã¢ge et sexe ; registre des dangers, fiche modÃ¨le, tableau RÃ©el / SimulÃ© ; vidÃ©o et README |
| **Souhaitable** | M2 avec contrÃ´les et repli ; messages et aides Ã  la dÃ©cision en arabe et en anglais ; consentement par finalitÃ© et journal d'usage ; export FHIR d'un exemple ; analyse de sensibilitÃ© de $S_{\text{prio}}$ ; rÃ©sumÃ© exÃ©cutif en anglais |
| **Facultatif** | Mode hors ligne PWA ; audio ; carte par rÃ©gion |
| **Hors prototype** | Flutter natif, 3 Ã©tats supplÃ©mentaires (ReportÃ©e, En retard, relances automatiques fines), rÃ¨gles P2, P7, P9, A10, C2, raccordement rÃ©el, envoi rÃ©el de messages, cohorte de 50 000 Ã— 20 graines (remplacÃ©e par 5 000 Ã  10 000 personnes et 3 graines **H22**) |

### 24.2 RÃ¨gles retenues pour le prototype

- **Enfant :** P1, P3, P4, P5, P6 (logique seulement, sans items protÃ©gÃ©s), P8, P10, P11.
- **Adulte :** A1, A2, A3, A4, A5 Ã  A8, A9, A11.
- **CommunautÃ©s :** C1, C3, C4.
- **GÃ©nomique :** G1 Ã  G3 **[SIMULÃ‰]**.

Les rÃ¨gles dÃ©pendant de V3 et de V4 sont **marquÃ©es Â« Ã  vÃ©rifier Â» dans l'interface** si les textes d'Abu Dhabi ne sont pas obtenus ; dans ce cas, on s'appuie sur les calendriers internationaux de rÃ©fÃ©rence, Ã©tiquetÃ©s comme tels.

### 24.3 Plan jour par jour

| Date | Jalon | Responsable |
| :--- | :--- | :--- |
| **Mar. 10 nov.** | **VÃ©rifier l'inscription (clÃ´ture le 10 nov.)** ; envoyer les questions au support (V16, V17) ; geler le pÃ©rimÃ¨tre v8 ; rÃ©partir les rÃ´les | Toute l'Ã©quipe, Uriel K. pour le support |
| Mer. 11 nov. | Tables JSON signables, moteur de rÃ¨gles ; gÃ©nÃ©rateur de cohorte v0 ; tentative V3 et V4 | Orace A., Bienderan E., Sydney K. |
| **Jeu. 12 nov.** | **ContrÃ´le 1** : rÃ¨gles relues, personas qui passent ; question en direct Ã  la session du jeudi | Sydney K. et relecteur clinique |
| Ven. 13 nov. | Squelette des Ã©crans 1 et 2 ; suivi en 5 Ã©tats ; code d'orientation | Orace A. |
| Sam. 14 nov. | Garde-fous (masquage, Wilson) ; M1 de rÃ©fÃ©rence ; V7 licences | Bienderan E., Freud B. |
| **Dim. 15 nov.** | **ContrÃ´le 2** : dÃ©monstration de bout en bout, mÃªme non finie | Toute l'Ã©quipe |
| Lun. 16 nov. | Ã‰valuation ML et Ã©quitÃ© ; fiche modÃ¨le ; messages arabe et anglais ; M2 si le temps le permet | Freud B., Bienderan E. |
| Mar. 17 nov. | Panorama de l'existant, section commerciale ; documentation en anglais ; conteneurisation et dÃ©ploiement | Uriel K., Orace A. |
| **Mer. 18 nov.** | **Gel du code** ; tous les tests passent (11.3 et 20.5) | Toute l'Ã©quipe |
| Jeu. 19 nov. | Enregistrement de la vidÃ©o ; test Ã  froid de la dÃ©mo hÃ©bergÃ©e ; session du jeudi | Uriel K., Freud B. |
| **Ven. 20 nov.** | **DÃ©pÃ´t en dÃ©but de journÃ©e** ; marge de sÃ©curitÃ© | Orace A. |

**RÃ¨gle de repli :** si le contrÃ´le 2 (15 nov.) n'est pas atteint, tout le Â« Souhaitable Â» est retirÃ© et M1 devient le seul module ML.

---

## 25. Dossier de dÃ©pÃ´t

### 25.1 Liste de contrÃ´le

| Ã‰lÃ©ment | Statut | Remarque |
| :--- | :---: | :--- |
| Lien de dÃ©mo hÃ©bergÃ©e avec comptes de dÃ©monstration | Ã€ faire | TestÃ© Ã  froid |
| VidÃ©o de 5 minutes, sous-titres anglais | Ã€ faire | 20.2 |
| README (dÃ©marrage en moins de 5 minutes) | Ã€ faire | `docker compose up` |
| Documentation technique | Ã€ faire | Architecture, dÃ©cisions AD-1 et AD-2 |
| HypothÃ¨ses et limites | RÃ©alisÃ© (v7.0, section 15) | Ã€ mettre Ã  jour |
| Tableau RÃ©el / SimulÃ© | Ã€ mettre Ã  jour | 2.3 |
| Fiche modÃ¨le M1 (et M2) | Ã€ faire | 19.7 |
| Registre des dangers | Ã€ faire | 21.1 |
| Rapport d'Ã©quitÃ© | Ã€ faire | GÃ©nÃ©rÃ© automatiquement |
| Panorama de l'existant et plan de pilote | Ã€ faire | Section 23 |
| RÃ©sumÃ© exÃ©cutif de 1 page | Ã€ faire | 25.2 |
| **Langue de la documentation** | **Anglais recommandÃ©** | Les Ã©valuateurs sont internationaux ; vÃ©rifier V16 |
| Format exact demandÃ© par le concours | **Ã€ vÃ©rifier** | V16 |

### 25.2 RÃ©sumÃ© exÃ©cutif (version anglaise, Ã  ajuster)

**MediBenin: closing the loop between an identified risk and a completed preventive visit**

*Problem.* In Abu Dhabi, eligibility for Well-Child Visits, adult screening and other preventive pathways still relies largely on age and sex, while clinically meaningful risk is spread across family history, genomics, chronic conditions, development, behaviour, visit history, geography and social context. The people with the greatest need can be missed, invited late, or sent to an unsuitable pathway.

*Solution.* MediBenin is a web platform that (1) identifies elevated or unmet risk and care gaps for children, adults and communities using published, clinician-signed rules, each flagged with its top factors and a visible certainty badge; (2) builds one personalised pathway per person, separating population prioritisation from individual clinical decision-making; (3) engages people in their own language and channel, with real choice, including refusal; (4) tracks every recommendation until the visit is confirmed by the health centre; and (5) measures reach, errors, adoption and outcomes by population segment, with small-cell suppression and confidence intervals.

*Where AI is used, and where it is not.* Clinical risk levels come from transparent rules only. Machine learning is limited to logistics: a calibrated model that estimates the likelihood of a missed visit so that support can be strengthened (never so that priority is lowered), and a constrained language module that adapts pre-approved messages, always with human validation.

*What we show.* A working prototype on a fully synthetic cohort, three end-to-end personas, a model card, a hazard register, an equity report, and a benchmark against age-and-sex-based invitation at equal capacity. We state clearly what this does and does not prove: it validates the pipeline and safeguards, not clinical performance.

*Path to pilot.* Shadow mode on real data with no contact with patients, then a limited pilot with human validation, with go/no-go criteria fixed in advance. Costs, pricing and buyer demand remain hypotheses to be tested with a partner.

---

## 26. HypothÃ¨ses et vÃ©rifications ajoutÃ©es

### 26.1 Nouvelles hypothÃ¨ses

| NÂ° | HypothÃ¨se |
| :---: | :--- |
| H17 | Une part importante des pertes des programmes de prÃ©vention se situe entre l'alerte et la visite effective (Ã  confirmer avec le partenaire) |
| H18 | Seuils de tolÃ©rance de choix du modÃ¨le M1 et seuils d'alerte d'Ã©quitÃ© sur les Ã©carts de TPR et de TFP |
| H19 | Budget de contacts humains B par centre et par jour, utilisÃ© pour comparer les stratÃ©gies de ciblage |
| H20 | Cadence et nombre de relances (maximum 2, espacÃ©es d'au moins 7 jours) |
| H21 | DurÃ©es de conservation des donnÃ©es et durÃ©es des phases du pilote |
| H22 | Taille de la cohorte rÃ©duite (5 000 Ã  10 000 personnes, 3 graines) suffisante pour dÃ©montrer la chaÃ®ne |
| H23 | Valeurs de capacitÃ© des centres et du temps de validation des soignants |
| H24 | Les facteurs de non-prÃ©sentation du gÃ©nÃ©rateur synthÃ©tique reflÃ¨tent des mÃ©canismes plausibles |

### 26.2 Nouvelles vÃ©rifications

| NÂ° | Point Ã  vÃ©rifier | Section | Responsable | Ã‰chÃ©ance | Si non vÃ©rifiÃ© |
| :---: | :--- | :---: | :--- | :--- | :--- |
| V16 | Format exact du dÃ©pÃ´t (vidÃ©o, lien, langue, taille), et critÃ¨res dÃ©taillÃ©s de la page des rÃ¨gles | 25 | Uriel K. | 12 nov. | DÃ©pÃ´t en anglais avec vidÃ©o, lien et README |
| V17 | FAQ et rÃ¨gles : donnÃ©es autorisÃ©es, propriÃ©tÃ© intellectuelle, produit existant (MediBenin), prÃ©sence aux Ã‰mirats | 2.2, 10.2 | Uriel K. | 12 nov. | Mentions de la v7.0 Ã  ne pas citer comme Â« lues Â» |
| V18 | Options d'hÃ©bergement aux Ã‰mirats et Ã©ventuels crÃ©dits | 22.4 | Orace A. | 16 nov. | HÃ©bergement de dÃ©monstration hors Ã‰mirats, dÃ©clarÃ© comme tel |
| V19 | Conditions d'usage du modÃ¨le de langage et de tout modÃ¨le prÃ©entraÃ®nÃ© (licence, donnÃ©es envoyÃ©es, rÃ©sidence) | 19.4 | Freud B. | 14 nov. | M2 en variantes prÃ©Ã©crites seulement |
| V20 | Sources des facteurs de non-prÃ©sentation du gÃ©nÃ©rateur | 19.6 | Bienderan E. | 14 nov. | Facteurs dÃ©clarÃ©s comme hypothÃ©tiques |
