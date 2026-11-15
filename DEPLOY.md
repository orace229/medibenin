# Déploiement gratuit — Render + Neon

Ce guide déploie le prototype complet (Express + React + PostgreSQL) sur un
service web **Render Free** et une base **Neon Free**. Les deux offres sont
gratuites et ne demandent pas de carte bancaire pour ce usage de démonstration.

> [!WARNING]
> Cette déploiement est une **démo synthétique**. Gardez `DEMO_MODE=true` pour
> les tokens de démonstration, ne chargez aucune donnée réelle, et n'utilisez
> pas cette configuration comme environnement de production clinique.

---

## 1. Créer la base PostgreSQL gratuite sur Neon

1. Créer un compte sur <https://neon.tech>.
2. Créer un projet (par exemple `medisense`) et une base `neondb`.
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

## 2. Pousser le dépôt sur GitHub

Le déploiement Render part d'un dépôt GitHub. Le dépôt courant est sur la
branche `main`.

```bash
git remote -v
git push origin main
```

Vérifier que `render.yaml`, `drizzle/` et `.node-version` sont bien poussés.

---

## 3. Créer le service Render

### Option A — Blueprint (recommandée)

1. Aller sur <https://dashboard.render.com> → **New** → **Blueprint**.
2. Connecter le dépôt GitHub `medisense`.
3. Render détecte `render.yaml` et propose le service `medisense`.
4. Renseigner les variables secrètes demandées :

| Variable | Valeur |
| :--- | :--- |
| `SQL_HOST` | host Neon |
| `SQL_DB_NAME` | `neondb` |
| `SQL_USER` | user Neon |
| `SQL_PASSWORD` | password Neon |
| `SQL_ADMIN_USER` | user Neon |
| `SQL_ADMIN_PASSWORD` | password Neon |

`SQL_PORT`, `SQL_SSL=true`, `DEMO_MODE=true`, `NODE_ENV=production` et
`NODE_VERSION=20.19.0` sont déjà dans `render.yaml`.

5. Cliquer **Apply** puis attendre le build et le déploiement.

### Option B — Service manuel

Créer un **Web Service** Node avec :

- **Build Command** : `npm ci --include=dev && npm run build`
- **Start Command** : `npm run db:migrate && npm run start:prod`
- **Health Check Path** : `/api/governance/status`
- **Environment** : les mêmes variables que ci-dessus, plus
  `NODE_VERSION=20.19.0`, `NODE_ENV=production`, `DEMO_MODE=true`,
  `SQL_SSL=true`.

---

## 4. Après le déploiement

L'URL Render ressemble à `https://medisense.onrender.com`.

1. Ouvrir `/` : la landing page doit s'afficher.
2. Ouvrir `/proof` : la page de preuves et les 58 tests doivent être servis.
3. Se connecter avec les tokens de démo :

| Portail | Token |
| :--- | :--- |
| Patient | `demo-token-patient` |
| Parent | `demo-token-parent` |
| Clinicien | `demo-token-clinician` |
| Coordinateur | `demo-token-coordinator` |
| Santé publique | `demo-token-public-health` |

4. Vérifier l'observatoire et le scénario `equity_gap` (C3).
5. Vérifier `GET /api/governance/status` : la table de règles, le calendrier
   de soins et les références de croissance doivent apparaître.

Au premier appel, l'application applique les migrations puis sème la cohorte
synthétique (53 dossiers). Cela peut prendre quelques secondes.

---

## 5. Dépannage

| Symptôme | Cause probable | Solution |
| :--- | :--- | :--- |
| Build échoue sur Vite/rolldown | Node trop ancien | `NODE_VERSION=20.19.0` |
| `db:migrate` échoue | SSL ou identifiants Neon | Vérifier `SQL_SSL=true`, host/user/password, utiliser la connexion directe |
| Tables déjà existantes | Base créée avec `db:push` sans historique de migration | Utiliser une base Neon vierge, ou repartir d'une base neuve |
| Page blanche sur `/proof` | Ancien build | Redéployer avec `npm run build` |
| Premier appel très lent | Render Free endormi + seed | Attendre 30–90 s, puis recharger |
| `relation "patients" does not exist` | Migration non exécutée | Vérifier que le Start Command contient bien `npm run db:migrate` |

---

## 6. Limites du gratuit

- **Render Free** : le service s'endort après une période d'inactivité ; le
  premier appel après réveil peut prendre 30–90 secondes.
- **Neon Free** : la base peut se suspendre automatiquement ; le premier appel
  la réveille.
- Pas de SLA, pas de sauvegarde garantie, ressources limitées.
- Ne pas utiliser pour des données réelles ni pour un usage clinique.

## 7. Alternative si Render n'est pas disponible

La même image applicative fonctionne sur **Koyeb Free** ou **Fly.io** avec une
base Neon. Le point important est de conserver :
`npm ci --include=dev && npm run build` au build, et
`npm run db:migrate && npm run start:prod` au démarrage.
