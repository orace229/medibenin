# MediBenin â€” DÃ©fi 04 (Abu Dhabi)

Plateforme de repÃ©rage transparent des risques et des lacunes de suivi de soins
(enfants, adolescents, adultes), avec parcours personnalisÃ©s, engagement
culturellement adaptÃ© (AR/FR/EN), garde-fous de population locale et Ã©valuation
par les rÃ©sultats. 100 % donnÃ©es synthÃ©tiques, rÃ¨gles cliniques publiÃ©es et
page de preuves ouverte (`/proof`).

## DÃ©marrage Ã  froid (machine vierge)

PrÃ©requis : **Node.js 20.19+** (Vite 8) et **PostgreSQL 14+** (local ou Cloud SQL).

```bash
# 1. DÃ©pendances
npm install

# 2. Base de donnÃ©es â€” crÃ©er une base vide nommÃ©e `MediBenin`
#    (ou pointer .env vers une instance PostgreSQL existante)
psql -c "CREATE DATABASE MediBenin;"

# 3. Variables d'environnement â€” copier l'exemple puis ajuster
cp .env.example .env
#   SQL_HOST, SQL_PORT, SQL_USER, SQL_PASSWORD, SQL_DB_NAME  â†’ connexion PostgreSQL
#   SQL_ADMIN_USER, SQL_ADMIN_PASSWORD                        â†’ db:push (drizzle-kit)
#   DEMO_MODE=true                                         â†’ active les tokens de dÃ©mo
#   GEMINI_API_KEY                                         â†’ optionnel (M2 templates par dÃ©faut)

# 4. CrÃ©er / mettre Ã  jour le schÃ©ma (OBLIGATOIRE au premier lancement)
npm run db:push

# 5. DÃ©marrer (la cohorte synthÃ©tique est semÃ©e si la base est vide)
npm run dev
```

L'application Ã©coute sur `http://localhost:3000`. La cohorte de dÃ©monstration
(dÃ©terministe, graine `20261120` : 7 personas cliniques dÃ©taillÃ©s + 1 cas de
transition Ã  18 ans + 45 profils synthÃ©tiques = 53 dossiers) est semÃ©e
automatiquement si les tables existent et sont vides.
**Le schÃ©ma n'est pas crÃ©Ã© automatiquement** : `npm run db:push` est requis.

Production locale (sert `dist/`) :

```bash
npm run build
npm run start:prod
```

## Portails de dÃ©monstration (tokens de dÃ©mo)

Les tokens de dÃ©mo sont acceptÃ©s quand `DEMO_MODE=true`, ou automatiquement
hors production. En production, ils sont refusÃ©s par dÃ©faut.

| Portail | Token | RÃ´le |
| :--- | :--- | :--- |
| Patient unifiÃ© (Tariq, 36 ans + enfants affiliÃ©s) | `demo-token-patient` | `patient` |
| Parent (Amira, enfants affiliÃ©s Zayed & Layla) | `demo-token-parent` | `parent` |
| MÃ©decin / Clinicien (Dr Kpegbe) | `demo-token-clinician` | `clinician` |
| Coordinateur de parcours | `demo-token-coordinator` | `coordinator` |
| SantÃ© publique (observatoire agrÃ©gÃ©) | `demo-token-public-health` | `public_health` |

ContrÃ´le d'accÃ¨s : chaque route est protÃ©gÃ©e par une liste de rÃ´les
**deny-by-default** + scoping par propriÃ©tÃ© (un rÃ´le personnel n'accÃ¨de qu'Ã  ses
dossiers liÃ©s et aux membres de la famille affiliÃ©s). La santÃ© publique n'a
**aucun** accÃ¨s individuel â€” agrÃ©gats observatoire uniquement.

## Consentements et sÃ©curitÃ© (P0)

- Les 5 finalitÃ©s sont appliquÃ©es : Ã©valuation, rappels, transmission au centre,
  statistiques agrÃ©gÃ©es, rÃ©sultat gÃ©nomique existant.
- Un retrait d'Ã©valuation suspend l'Ã©valuation et remet le dossier en Niveau
  Gris ; un retrait gÃ©nomique recalcule et retire G1/G2 ; un retrait des rappels
  bloque toute invitation.
- Une invitation ne peut pas Ãªtre envoyÃ©e pour un Rouge, un Gris, un plan non
  validÃ© ou aprÃ¨s un refus.
- Le signal gÃ©nomique n'est jamais renvoyÃ© par l'API sans le consentement 5.
- La rÃ¨gle d'urgence E0 est dÃ©clenchÃ©e par le signalement de signes de danger.

## Preuves et gouvernance

- `GET /api/governance/acceptance-tests` â€” suite d'acceptation automatisÃ©e (19 tests).
- `GET /api/governance/status` â€” table de rÃ¨gles signÃ©e (`ABU_DHABI_WCV_IFHAS_V8`).
- `GET /api/governance/thresholds` â€” documents de seuils versionnÃ©s (hash SHA-256).
- `GET /api/observatory/summary` â€” observatoire agrÃ©gÃ© (Wilson 95 %, masquage n < 10).

## DÃ©ploiement gratuit

Un guide complet Render + Neon est fourni dans [`DEPLOY.md`](./DEPLOY.md).
Le fichier `render.yaml` dÃ©crit le service web gratuit et `drizzle/` contient
les migrations non interactives appliquÃ©es au dÃ©marrage.

## Tests et qualitÃ©

```bash
npm test          # 58 tests : acceptation, rÃ¨gles, WHO 2019, croissance LMS, garde-fous, consentement/invitation
npm run lint      # tsc --noEmit
npm run check:ui  # garde-fou de contenu UI interdit
```

## FidÃ©litÃ© clinique (P1-B)

- **Croissance LMS** : BMI-for-age 5â€“19 ans (WHO 2007) et poids-pour-taille
  65â€“120 cm (WHO 2006) sont calculÃ©s depuis les tables LMS officielles ; un Z
  fourni reste prioritaire, et une valeur hors domaine reste `null` (Gris).
- **Calendriers** : les visites WCV, les intervalles col/sein/colorectal/IFHAS
  sont versionnÃ©s dans `src/config/schedules/care-schedules.v1.json` (valeurs
  V3/V4 Ã  remplacer par les textes officiels).
- **A4** : lâ€™intervalle glycÃ©mique de 3 ans est vÃ©rifiÃ© ; une date inconnue
  produit un Gris, jamais une accÃ©lÃ©ration supposÃ©e.
- **A7** : plafond Ã  75 ans.
- **A9** : une orientation Orange/Rouge non honorÃ©e dans sa fenÃªtre devient un
  signalement de suivi interrompu.
- **A11** : la rÃ¨gle prÃ©Ã©clampsie sâ€™applique Ã  partir de 20 SA ; avant 20 SA,
  la tension Ã©levÃ©e passe par A1. Une grossesse sans Ã¢ge gestationnel produit
  A11 avec donnÃ©e manquante.
- **P6** : le score 3â€“7 exige lâ€™entretien de suivi M-CHAT-R/F ; un suivi
  positif oriente, un suivi nÃ©gatif clÃ´t le dÃ©pistage.
- **P3** : le nombre de visites WCV manquÃ©es peut Ãªtre dÃ©rivÃ© de lâ€™Ã¢ge de la
  derniÃ¨re visite.

## Garde-fous dâ€™Ã©quitÃ© (P1)

- Les totaux de lâ€™observatoire sont calculÃ©s sur une seule dimension et excluent
  les segments de 10 Ã  29 (pas de conclusion comparative).
- Chaque proportion publiÃ©e est accompagnÃ©e dâ€™un intervalle de Wilson 95 %.
- C3 (Ã©cart dâ€™adoption) est recalculÃ© sur les personnes, plus sur la somme des
  dimensions ; il peut Ãªtre exercÃ© via le scÃ©nario `equity_gap`.
- C4 (faux nÃ©gatifs) ne publie jamais un petit effectif : `n >= 10` et au moins
  5 Ã©vÃ©nements sont requis.
- La suppression secondaire protÃ¨ge une cellule voisine pour chaque cellule
  primaire masquÃ©e.

## Ce que cette dÃ©monstration ne prouve pas

Les donnÃ©es sont synthÃ©tiques ; le calibrage clinique rÃ©el exige le protocole du
pilote documentÃ© dans le cahier des charges (Â§8.5). Aucune infÃ©rence clinique
n'est calculÃ©e cÃ´tÃ© navigateur. M1 est une baseline logistique Ã  coefficients
experts (pas un modÃ¨le entraÃ®nÃ©) ; M2 utilise des modÃ¨les de messages prÃ©Ã©crits.
Les limites restantes (M1 entraÃ®nÃ©, C3, FHIR complet, fiche modÃ¨le, registre des
dangers, rapport d'Ã©quitÃ©) sont documentÃ©es comme feuille de route.
