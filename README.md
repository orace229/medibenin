# MediSense — Défi 04 (Abu Dhabi)

Plateforme de repérage transparent des risques et des lacunes de suivi de soins
(enfants, adolescents, adultes), avec parcours personnalisés, engagement
culturellement adapté (AR/FR/EN), garde-fous de population locale et évaluation
par les résultats. 100 % données synthétiques, règles cliniques publiées et
page de preuves ouverte (`/proof`).

## Démarrage à froid (machine vierge)

Prérequis : **Node.js 20.19+** (Vite 8) et **PostgreSQL 14+** (local ou Cloud SQL).

```bash
# 1. Dépendances
npm install

# 2. Base de données — créer une base vide nommée `medisense`
#    (ou pointer .env vers une instance PostgreSQL existante)
psql -c "CREATE DATABASE medisense;"

# 3. Variables d'environnement — copier l'exemple puis ajuster
cp .env.example .env
#   SQL_HOST, SQL_PORT, SQL_USER, SQL_PASSWORD, SQL_DB_NAME  → connexion PostgreSQL
#   SQL_ADMIN_USER, SQL_ADMIN_PASSWORD                        → db:push (drizzle-kit)
#   DEMO_MODE=true                                         → active les tokens de démo
#   GEMINI_API_KEY                                         → optionnel (M2 templates par défaut)

# 4. Créer / mettre à jour le schéma (OBLIGATOIRE au premier lancement)
npm run db:push

# 5. Démarrer (la cohorte synthétique est semée si la base est vide)
npm run dev
```

L'application écoute sur `http://localhost:3000`. La cohorte de démonstration
(déterministe, graine `20261120` : 7 personas cliniques détaillés + 1 cas de
transition à 18 ans + 45 profils synthétiques = 53 dossiers) est semée
automatiquement si les tables existent et sont vides.
**Le schéma n'est pas créé automatiquement** : `npm run db:push` est requis.

Production locale (sert `dist/`) :

```bash
npm run build
npm run start:prod
```

## Portails de démonstration (tokens de démo)

Les tokens de démo sont acceptés quand `DEMO_MODE=true`, ou automatiquement
hors production. En production, ils sont refusés par défaut.

| Portail | Token | Rôle |
| :--- | :--- | :--- |
| Patient unifié (Tariq, 36 ans + enfants affiliés) | `demo-token-patient` | `patient` |
| Parent (Amira, enfants affiliés Zayed & Layla) | `demo-token-parent` | `parent` |
| Médecin / Clinicien (Dr Kpegbe) | `demo-token-clinician` | `clinician` |
| Coordinateur de parcours | `demo-token-coordinator` | `coordinator` |
| Santé publique (observatoire agrégé) | `demo-token-public-health` | `public_health` |

Contrôle d'accès : chaque route est protégée par une liste de rôles
**deny-by-default** + scoping par propriété (un rôle personnel n'accède qu'à ses
dossiers liés et aux membres de la famille affiliés). La santé publique n'a
**aucun** accès individuel — agrégats observatoire uniquement.

## Consentements et sécurité (P0)

- Les 5 finalités sont appliquées : évaluation, rappels, transmission au centre,
  statistiques agrégées, résultat génomique existant.
- Un retrait d'évaluation suspend l'évaluation et remet le dossier en Niveau
  Gris ; un retrait génomique recalcule et retire G1/G2 ; un retrait des rappels
  bloque toute invitation.
- Une invitation ne peut pas être envoyée pour un Rouge, un Gris, un plan non
  validé ou après un refus.
- Le signal génomique n'est jamais renvoyé par l'API sans le consentement 5.
- La règle d'urgence E0 est déclenchée par le signalement de signes de danger.

## Preuves et gouvernance

- `GET /api/governance/acceptance-tests` — suite d'acceptation automatisée (19 tests).
- `GET /api/governance/status` — table de règles signée (`ABU_DHABI_WCV_IFHAS_V8`).
- `GET /api/governance/thresholds` — documents de seuils versionnés (hash SHA-256).
- `GET /api/observatory/summary` — observatoire agrégé (Wilson 95 %, masquage n < 10).

## Déploiement gratuit

Un guide complet Render + Neon est fourni dans [`DEPLOY.md`](./DEPLOY.md).
Le fichier `render.yaml` décrit le service web gratuit et `drizzle/` contient
les migrations non interactives appliquées au démarrage.

## Tests et qualité

```bash
npm test          # 58 tests : acceptation, règles, WHO 2019, croissance LMS, garde-fous, consentement/invitation
npm run lint      # tsc --noEmit
npm run check:ui  # garde-fou de contenu UI interdit
```

## Fidélité clinique (P1-B)

- **Croissance LMS** : BMI-for-age 5–19 ans (WHO 2007) et poids-pour-taille
  65–120 cm (WHO 2006) sont calculés depuis les tables LMS officielles ; un Z
  fourni reste prioritaire, et une valeur hors domaine reste `null` (Gris).
- **Calendriers** : les visites WCV, les intervalles col/sein/colorectal/IFHAS
  sont versionnés dans `src/config/schedules/care-schedules.v1.json` (valeurs
  V3/V4 à remplacer par les textes officiels).
- **A4** : l’intervalle glycémique de 3 ans est vérifié ; une date inconnue
  produit un Gris, jamais une accélération supposée.
- **A7** : plafond à 75 ans.
- **A9** : une orientation Orange/Rouge non honorée dans sa fenêtre devient un
  signalement de suivi interrompu.
- **A11** : la règle prééclampsie s’applique à partir de 20 SA ; avant 20 SA,
  la tension élevée passe par A1. Une grossesse sans âge gestationnel produit
  A11 avec donnée manquante.
- **P6** : le score 3–7 exige l’entretien de suivi M-CHAT-R/F ; un suivi
  positif oriente, un suivi négatif clôt le dépistage.
- **P3** : le nombre de visites WCV manquées peut être dérivé de l’âge de la
  dernière visite.

## Garde-fous d’équité (P1)

- Les totaux de l’observatoire sont calculés sur une seule dimension et excluent
  les segments de 10 à 29 (pas de conclusion comparative).
- Chaque proportion publiée est accompagnée d’un intervalle de Wilson 95 %.
- C3 (écart d’adoption) est recalculé sur les personnes, plus sur la somme des
  dimensions ; il peut être exercé via le scénario `equity_gap`.
- C4 (faux négatifs) ne publie jamais un petit effectif : `n >= 10` et au moins
  5 événements sont requis.
- La suppression secondaire protège une cellule voisine pour chaque cellule
  primaire masquée.

## Ce que cette démonstration ne prouve pas

Les données sont synthétiques ; le calibrage clinique réel exige le protocole du
pilote documenté dans le cahier des charges (§8.5). Aucune inférence clinique
n'est calculée côté navigateur. M1 est une baseline logistique à coefficients
experts (pas un modèle entraîné) ; M2 utilise des modèles de messages préécrits.
Les limites restantes (M1 entraîné, C3, FHIR complet, fiche modèle, registre des
dangers, rapport d'équité) sont documentées comme feuille de route.
