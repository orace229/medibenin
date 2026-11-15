# DÃ©ploiement gratuit â€” Render + Neon

Ce guide dÃ©ploie le prototype complet (Express + React + PostgreSQL) sur un
service web **Render Free** et une base **Neon Free**. Les deux offres sont
gratuites et ne demandent pas de carte bancaire pour ce usage de dÃ©monstration.

> [!WARNING]
> Cette dÃ©ploiement est une **dÃ©mo synthÃ©tique**. Gardez `DEMO_MODE=true` pour
> les tokens de dÃ©monstration, ne chargez aucune donnÃ©e rÃ©elle, et n'utilisez
> pas cette configuration comme environnement de production clinique.

---

## 1. CrÃ©er la base PostgreSQL gratuite sur Neon

1. CrÃ©er un compte sur <https://neon.tech>.
2. CrÃ©er un projet (par exemple `MediBenin`) et une base `neondb`.
3. Dans **Connection Details**, copier :
   - `host` (ex. `ep-xxx.eu-central-1.aws.neon.tech`) ;
   - `database` (`neondb` ou le nom choisi) ;
   - `user` ;
   - `password` ;
   - `port` (`5432`).
4. Utiliser la **connexion directe** (pas le pooler `-pooler`) pour les
   migrations Drizzle.

Neon fournit le TLS ; l'application l'active avec `SQL_SSL=true`.

---

## 2. Pousser le dÃ©pÃ´t sur GitHub

Le dÃ©ploiement Render part d'un dÃ©pÃ´t GitHub. Le dÃ©pÃ´t courant est sur la
branche `main`.

```bash
git remote -v
git push origin main
```

VÃ©rifier que `render.yaml`, `drizzle/` et `.node-version` sont bien poussÃ©s.

---

## 3. CrÃ©er le service Render

### Option A â€” Blueprint (recommandÃ©e)

1. Aller sur <https://dashboard.render.com> â†’ **New** â†’ **Blueprint**.
2. Connecter le dÃ©pÃ´t GitHub `MediBenin`.
3. Render dÃ©tecte `render.yaml` et propose le service `MediBenin`.
4. Renseigner les variables secrÃ¨tes demandÃ©es :

| Variable | Valeur |
| :--- | :--- |
| `SQL_HOST` | host Neon |
| `SQL_DB_NAME` | `neondb` |
| `SQL_USER` | user Neon |
| `SQL_PASSWORD` | password Neon |
| `SQL_ADMIN_USER` | user Neon |
| `SQL_ADMIN_PASSWORD` | password Neon |

`SQL_PORT`, `SQL_SSL=true`, `DEMO_MODE=true`, `NODE_ENV=production` et
`NODE_VERSION=20.19.0` sont dÃ©jÃ  dans `render.yaml`.

5. Cliquer **Apply** puis attendre le build et le dÃ©ploiement.

### Option B â€” Service manuel

CrÃ©er un **Web Service** Node avec :

- **Build Command** : `npm ci --include=dev && npm run build`
- **Start Command** : `npm run db:migrate && npm run start:prod`
- **Health Check Path** : `/api/governance/status`
- **Environment** : les mÃªmes variables que ci-dessus, plus
  `NODE_VERSION=20.19.0`, `NODE_ENV=production`, `DEMO_MODE=true`,
  `SQL_SSL=true`.

---

## 4. AprÃ¨s le dÃ©ploiement

L'URL Render ressemble Ã  `https://MediBenin.onrender.com`.

1. Ouvrir `/` : la landing page doit s'afficher.
2. Ouvrir `/proof` : la page de preuves et les 58 tests doivent Ãªtre servis.
3. Se connecter avec les tokens de dÃ©mo :

| Portail | Token |
| :--- | :--- |
| Patient | `demo-token-patient` |
| Parent | `demo-token-parent` |
| Clinicien | `demo-token-clinician` |
| Coordinateur | `demo-token-coordinator` |
| SantÃ© publique | `demo-token-public-health` |

4. VÃ©rifier l'observatoire et le scÃ©nario `equity_gap` (C3).
5. VÃ©rifier `GET /api/governance/status` : la table de rÃ¨gles, le calendrier
   de soins et les rÃ©fÃ©rences de croissance doivent apparaÃ®tre.

Au premier appel, l'application applique les migrations puis sÃ¨me la cohorte
synthÃ©tique (53 dossiers). Cela peut prendre quelques secondes.

---

## 5. DÃ©pannage

| SymptÃ´me | Cause probable | Solution |
| :--- | :--- | :--- |
| Build Ã©choue sur Vite/rolldown | Node trop ancien | `NODE_VERSION=20.19.0` |
| `db:migrate` Ã©choue | SSL ou identifiants Neon | VÃ©rifier `SQL_SSL=true`, host/user/password, utiliser la connexion directe |
| Tables dÃ©jÃ  existantes | Base crÃ©Ã©e avec `db:push` sans historique de migration | Utiliser une base Neon vierge, ou repartir d'une base neuve |
| Page blanche sur `/proof` | Ancien build | RedÃ©ployer avec `npm run build` |
| Premier appel trÃ¨s lent | Render Free endormi + seed | Attendre 30â€“90 s, puis recharger |
| `relation "patients" does not exist` | Migration non exÃ©cutÃ©e | VÃ©rifier que le Start Command contient bien `npm run db:migrate` |

---

## 6. Limites du gratuit

- **Render Free** : le service s'endort aprÃ¨s une pÃ©riode d'inactivitÃ© ; le
  premier appel aprÃ¨s rÃ©veil peut prendre 30â€“90 secondes.
- **Neon Free** : la base peut se suspendre automatiquement ; le premier appel
  la rÃ©veille.
- Pas de SLA, pas de sauvegarde garantie, ressources limitÃ©es.
- Ne pas utiliser pour des donnÃ©es rÃ©elles ni pour un usage clinique.

## 7. Alternative si Render n'est pas disponible

La mÃªme image applicative fonctionne sur **Koyeb Free** ou **Fly.io** avec une
base Neon. Le point important est de conserver :
`npm ci --include=dev && npm run build` au build, et
`npm run db:migrate && npm run start:prod` au dÃ©marrage.
