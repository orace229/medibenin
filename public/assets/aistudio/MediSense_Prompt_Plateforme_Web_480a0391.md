# MediSense — Prompt maître pour l'éditeur de code (plateforme web)

## Mode d'emploi (pour vous, ne pas coller)

1. Ouvrez votre éditeur en **mode agent** (Cursor, Windsurf, Claude Code, Copilot agent…) dans le dossier du frontend.
2. Collez **tout ce qui se trouve sous la ligne « PROMPT À COLLER »** en une seule fois. L'agent travaille phase par phase et s'arrête après chacune.
3. Après chaque phase, ouvrez le site, vérifiez, puis écrivez : « Phase suivante ».
4. Si votre dépôt utilise déjà une autre pile que Next.js (par exemple React + Vite), ajoutez en tête : « Adapte la pile à celle du dépôt existant, garde le reste identique ».
5. Les chiffres, logos de partenaires et témoignages sont **volontairement interdits** dans le prompt : ne les ajoutez pas à la main sans source.

---

## PROMPT À COLLER

Tu es un ingénieur front-end senior et un designer produit spécialisé en santé numérique. Tu vas construire la plateforme web **MediSense** : une landing page marketing de type SaaS, un portail de connexion, un portail patient et un portail médecin. Lis tout le prompt avant d'écrire du code. Travaille **phase par phase** (section 9) et **arrête-toi à la fin de chaque phase** avec un résumé de ce qui a été fait, de ce qui reste, et des décisions que tu as prises.

---

### 1. Contexte produit

**MediSense** est une plateforme de **prévention et de dépistage de précision**. Elle aide des professionnels de santé à repérer les enfants, adultes et communautés à risque élevé ou dont les soins sont manqués ou en retard, à les orienter vers la bonne visite ou le bon dépistage au bon moment, et à **suivre chaque recommandation jusqu'à la visite réellement faite** (la « boucle fermée »).

**Positionnement en une phrase :** *MediSense ne remplace pas le jugement clinique : il ferme la boucle entre un risque repéré et une visite réellement faite, avec une incertitude visible et des garde-fous d'équité.*

**Cinq verbes qui structurent le produit :** Repérer · Orienter · Engager · Suivre · Mesurer.

**Ce que MediSense n'est pas :** un outil de diagnostic, un service d'urgence, un dispositif de remplacement du médecin. Le soignant décide toujours.

**Cadre :** prototype présenté au *Future Health Digital Innovation Challenge 2026*. Toutes les données affichées sont **synthétiques**. Ne prétends jamais à un partenariat, une certification, une validation clinique ou un déploiement réel.

**Utilisateurs réels :**
- **Patients, parents et aidants** : destinataires ; accès léger, interface simple, mobile d'abord.
- **Médecins et cliniciens** : consultent des patients, déclenchent des analyses par boutons.
- **Coordinateurs de soins** (phase 5, optionnelle) : file de relance quotidienne.
- **Responsables de santé publique** (phase 5, optionnelle) : tableau de bord agrégé et anonymisé.

---

### 2. Règles non négociables

Ces règles passent avant toute préférence de design.

1. **Aucune règle clinique, formule, seuil, coefficient, table, score de priorisation ni code n'est affiché dans l'interface.** Tout le calcul est fait par le back-end. Le front affiche des **résultats lisibles** et expose des **boutons d'action**.
2. **Le front ne fait aucun calcul clinique.** Il reçoit des champs déjà prêts (`niveau`, `zone`, `facteurs`, `badge_certitude`…) et les affiche. Interdit : comparer une valeur mesurée à un seuil dans le code du front.
3. **Pas de score de priorisation ($S_{\text{prio}}$) dans le portail médecin**, jamais, même masqué ou en infobulle. Pas non plus de probabilité issue du ML (par exemple non-présentation) dans la vue clinique.
4. **Le portail médecin explique chaque signalement en langage clair** : niveau, **1 à 3 facteurs principaux** formulés en phrases humaines (ex. « Deux mesures de tension élevées », « Visite des 18 mois manquée »), la source en une étiquette (ex. « Directive nationale de vaccination »), les **données manquantes**, et un **badge de certitude** (Haute / Moyenne / Faible). Jamais de formule ni de seuil chiffré.
5. **Niveau Gris = « données insuffisantes ».** Il n'est jamais présenté comme « Vert » ni « normal ». Il propose les mesures à compléter.
6. **Tout contenu généré par IA** (résumé, suggestion) porte l'étiquette « Suggestion générée par IA — à valider par le soignant » et exige une action humaine (Valider / Modifier / Ignorer).
7. **Messages et écrans patient** : aucun diagnostic, aucun score, aucune mention génétique alarmante. Formulations calmes ; les détails sensibles restent chez le soignant.
8. **Le patient garde le choix** : sur chaque recommandation, trois réponses (Confirmer · Reporter · Refuser), le refus est sans conséquence et clairement dit.
9. **Interdit d'inventer** : statistiques, pourcentages d'efficacité, logos de partenaires, témoignages, avis, noms de vrais hôpitaux, certifications. Les sections qui en auraient normalement utilisent du contenu qualitatif ou sont supprimées.
10. **Bannière permanente discrète** dans les portails : « Environnement de démonstration — données synthétiques ».
11. **Pas de données de santé dans les URL** ni dans les logs du navigateur. Identifiants opaques uniquement.
12. **Aucune dépendance à un secret côté client.**

---

### 3. Pile technique

- **Next.js (App Router) + TypeScript strict**, Tailwind CSS, **shadcn/ui** (Radix), **lucide-react**, **Recharts** pour les graphiques, **framer-motion** pour de légères animations (respecter `prefers-reduced-motion`).
- **Formulaires :** react-hook-form + zod. **Données :** TanStack Query. **i18n :** next-intl.
- **Langues :** anglais (par défaut, car le jury est international), français, arabe (**RTL complet** ; utiliser les propriétés CSS logiques `ms-`, `me-`, `ps-`, `pe-`, jamais `ml-`, `mr-`). L'arabe peut se limiter aux écrans principaux si le temps manque, mais la mise en page RTL doit fonctionner partout.
- **Thème clair d'abord**, entièrement piloté par des variables CSS (tokens) pour permettre un thème sombre plus tard.
- **Auth du prototype :** simulée (cookie signé côté serveur Next, comptes de démonstration), mais architecturée pour être remplacée par le jeton du back-end FastAPI sans réécrire les pages.
- **Back-end :** une couche **adaptateur** (`/lib/api`) avec une interface TypeScript unique et deux implémentations : `mock` (par défaut) et `http` (vers le back-end FastAPI). Si le dépôt expose déjà des routes (file de population, dossier clinique d'une personne, consentements, messages, observatoire, export FHIR), branche l'implémentation `http` dessus plutôt que d'en inventer. Sinon, tout fonctionne en `mock`.

**Structure des dossiers à créer :**

```
app/
  [locale]/
    (marketing)/page.tsx                 # landing
    (auth)/login/page.tsx
    (auth)/request-access/page.tsx
    (portal)/patient/...                 # accueil, parcours, notifications, profil, confidentialité
    (portal)/clinician/...               # patients, détail patient
    (portal)/coordinator/...             # phase 5 (optionnelle)
    (portal)/public-health/...           # phase 5 (optionnelle)
components/ (ui, marketing, portal, charts)
lib/ (api, auth, i18n, mock-data, types)
middleware.ts                            # garde des routes par rôle
NOTES.md                                 # décisions et ambiguïtés
```

---

### 4. Système de design

**Ton visuel :** calme, fiable, humain, moderne. Pas de clichés médicaux (pas de stéthoscope en photo d'archive, pas de croix rouge, pas de bleu hôpital froid). Beaucoup d'espace, cartes arrondies, ombres très douces, illustrations abstraites (formes organiques, boucle, réseau), jamais de photo de patients réels.

**Palette (tokens CSS à définir dans `globals.css` et Tailwind) :**

| Token | Valeur | Usage |
| :--- | :--- | :--- |
| `--brand-900` | `#0B3B3C` | Titres, texte fort |
| `--brand-700` | `#0F6B6B` | Boutons principaux, liens |
| `--brand-500` | `#14A39A` | Accents, graphiques |
| `--brand-100` | `#D5F2EE` | Fonds de cartes d'accent |
| `--brand-50` | `#F1FAF9` | Fond de page |
| `--accent-600` | `#2F6FDE` | Actions secondaires, liens d'information |
| `--ink-700` / `--ink-500` / `--ink-200` | `#334155` / `#64748B` / `#E2E8F0` | Texte, bordures |
| `--surface` | `#FFFFFF` | Cartes |

**Couleurs des niveaux (sémantiques, distinctes de la marque) :** Rouge `#C62828`, Orange `#E8710A`, Jaune `#F2C200` (texte foncé), Vert `#2E8B57`, Gris `#6B7280`. **Ne jamais coder un niveau par la couleur seule** : toujours icône + libellé.

| Niveau | Libellé (FR) | Libellé (EN) | Icône |
| :--- | :--- | :--- | :--- |
| Rouge | Urgent | Urgent | triangle d'alerte |
| Orange | Prioritaire | Priority | cercle plein |
| Jaune | À planifier | To schedule | horloge |
| Vert | À jour | Up to date | coche |
| Gris | Données insuffisantes | Insufficient data | point d'interrogation |

**Typographie :** titres *Plus Jakarta Sans* (600 à 800), texte *Inter* ; arabe : *IBM Plex Sans Arabic* ou *Noto Sans Arabic*. Échelle : 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64.

**Formes :** rayon 12 px (cartes 16 px, boutons 10 px), ombres `0 1px 2px` et `0 8px 24px` à faible opacité, focus visible à 2 px en `--accent-600`.

**Composants à produire une fois et réutiliser :** `LevelBadge`, `CertaintyBadge`, `StatusChip` (état du parcours), `StatCard`, `Ring` (jauge circulaire), `Timeline`, `EmptyState`, `Skeleton`, `AiSuggestionPanel`, `ConsentToggle`, `PassQrCard`, `LanguageSwitch`, `DemoBanner`.

**Étiquette du badge de certitude (infobulle en langage clair, sans formule) :** Haute = « Données récentes et complètes » ; Moyenne = « Certaines données sont déclarées ou anciennes » ; Faible = « À confirmer par une nouvelle mesure ».

---

### 5. Phase 1 — Landing page (SaaS santé)

**Objectif :** une page qui **vend** MediSense, pas une page de texte. Format marketing SaaS adapté à la santé : confiance, clarté, preuve de sérieux, sans exagération. Une seule page, défilement fluide, responsive, rapide.

**Barre de navigation :** logo MediSense (créer un logotype simple : une boucle stylisée + le mot), liens d'ancre (Problème, Comment ça marche, Pour qui, Responsabilité, FAQ), sélecteur de langue, bouton secondaire **« Se connecter »** (→ `/login`) et bouton principal **« Accéder au tableau de bord »** (→ `/login` si non connecté, sinon le portail du rôle).

**Sections, dans cet ordre :**

1. **Hero.** Titre fort, sous-titre en une phrase, deux boutons (« Accéder au tableau de bord », « Voir comment ça marche »), et à droite un **visuel de produit** : une maquette stylisée du tableau de bord et d'une carte patient (composants réels en lecture seule, données synthétiques), avec de légères animations. Petite ligne de confiance : « Prototype conçu pour le Future Health Digital Innovation Challenge 2026 · données synthétiques ». **Aucun logo de partenaire.**
   - Titre EN : *Close the gap between risk and care.* · FR : *Ne laissez plus un risque sans visite.*
   - Sous-titre EN : *MediSense helps care teams find who needs prevention first, reach them in their language, and follow every recommendation until the visit is done.*
2. **Le problème.** Trois cartes : *Des personnes oubliées* · *Invitées trop tard* · *Orientées vers un mauvais parcours*. Une phrase chacune, une icône, pas de chiffre.
3. **Comment ça marche.** Cinq étapes horizontales (Repérer, Orienter, Engager, Suivre, Mesurer), chacune avec icône, titre et une phrase. Sur mobile : liste verticale avec ligne de liaison.
4. **Pour qui.** Quatre cartes : Familles et patients, Médecins et cliniciens, Coordinateurs de soins, Santé publique. Chaque carte : un bénéfice concret et un lien « Voir l'espace ».
5. **Fonctionnalités clés.** Grille de 5 blocs avec un mini-visuel : signalements expliqués avec badge de certitude ; parcours personnalisé unique ; messages adaptés à la langue et au canal avec choix réel ; garde-fous d'équité par segment de population ; suivi des résultats jusqu'à la visite confirmée.
6. **Responsable par conception.** Section sombre (`--brand-900`) : le soignant décide · consentement par finalité et journal d'usage · données minimales · petits effectifs masqués · incertitude visible · aucune promesse de diagnostic. Mentionner clairement « Prototype — non destiné à un usage clinique réel ».
7. **Ce que nous mesurons.** Cartes qualitatives (portée, adoption, ponctualité, équité, valeur en aval), **sans chiffres inventés**.
8. **Vers un pilote.** Trois étapes : mode « ombre » sur données réelles sans contacter les patients → pilote limité avec validation humaine → évaluation. Texte court.
9. **FAQ.** 6 questions (Est-ce un outil de diagnostic ? Qui voit mes données ? Puis-je refuser ? Quelles langues ? Les données sont-elles réelles ? Comment les médecins obtiennent-ils l'accès ?). Accordéon accessible.
10. **Appel final.** Bandeau avec deux boutons (« Accéder au tableau de bord », « Se connecter »).
11. **Pied de page :** logo, liens, sélecteur de langue, **avertissement** « MediSense est un prototype d'aide à la décision, non un dispositif médical ; données synthétiques », contact fictif `contact@medisense.example`.

**Qualité attendue :** hiérarchie claire, un seul message par section, textes courts, animations d'apparition discrètes, aucun lorem ipsum, aucune image de banque d'images : utiliser des illustrations SVG abstraites que tu crées.

---

### 6. Phase 2 — Connexion et accès

**Page `/login`** (écran divisé, 50/50 sur ordinateur, formulaire seul sur mobile) :
- **Gauche :** grand visuel d'illustration abstraite (boucle de soins, réseau, formes organiques en dégradé teal), logo MediSense, une phrase d'accroche, et un petit encart « Données synthétiques de démonstration ».
- **Droite :** titre **« Accédez à votre portail »**, texte d'aide : *« Patients et familles : utilisez l'e-mail et le mot de passe reçus. Médecins et personnel de santé : utilisez votre e-mail professionnel. »* Champs **e-mail** et **mot de passe** (bouton afficher/masquer, attributs `autocomplete` corrects), lien « Mot de passe oublié » (simulé), bouton **« Se connecter »**, messages d'erreur clairs et non accusateurs, état de chargement.
- Sous le bouton : séparateur, puis **« Vous êtes médecin ou soignant ? Demander l'accès »** (→ `/request-access`).
- **Panneau « Accès démonstration »** visible seulement si `NEXT_PUBLIC_DEMO_MODE=true` : boutons rapides **Patient · Parent · Médecin · Coordinateur · Santé publique** qui préremplissent un compte de démonstration. Indispensable pour que le jury essaie chaque rôle sans inscription.

**Page `/request-access`** (médecins) : formulaire (nom, e-mail professionnel, profession, établissement, numéro d'enregistrement professionnel, langue) + case de confirmation. À l'envoi : écran **« Demande reçue — en attente de validation »**. **Aucune logique d'inscription réelle** pour l'instant : stub propre, prévu pour être branché plus tard (la validation par un administrateur est hors périmètre de cette version).

**Redirection par rôle après connexion :** patient ou parent → `/patient` ; médecin → `/clinician` ; coordinateur → `/coordinator` ; santé publique → `/public-health`. Le `middleware.ts` interdit l'accès aux portails d'un autre rôle (page « Accès non autorisé » élégante, sans fuite d'information).

**Sécurité de l'interface :** déconnexion visible, expiration de session avec bandeau de reconnexion, aucun mot de passe en clair dans les logs, limitation de tentatives simulée avec message.

---

### 7. Phase 3 — Portail patient

**Principes :** mobile d'abord, rassurant, visuel avant le texte, un seul « prochain pas » mis en avant, vocabulaire non médical. **Pas de tableau de bord technique** : des cartes, des jauges et des courbes douces.

**Navigation :** barre en bas sur mobile, latérale sur ordinateur : Accueil · Mon parcours · Notifications · Mon profil · Confidentialité. Pour un **parent**, un sélecteur d'enfant (avatars + prénoms) en haut de page ; un enfant n'a jamais de compte.

**Accueil (`/patient`) :**
- Salutation personnalisée et rappel de la langue choisie.
- **Carte « Votre prochaine étape »** : titre simple (ex. « Visite de suivi de croissance »), date limite, lieu, état (`StatusChip`), et boutons **Confirmer · Reporter · Refuser** (voir règle 8). Lien « Pourquoi ce rendez-vous ? » qui ouvre une **aide à la décision de 3 à 5 phrases** (but, déroulement, limites, ce qui arrive si on refuse).
- **`PassQrCard`** : code d'orientation de 8 caractères + QR code, bouton « Afficher en grand », texte « Présentez ce code à l'accueil du centre ».
- **Jauge « Prévention à jour »** : anneau (ex. 3 actions sur 5), calculée par le back-end.
- **Indicateurs clés visuels**, selon le profil :
  - **Enfant :** courbe de croissance avec bande de référence fournie par l'API et points de l'enfant ; barre de **vaccination** par dose (faite, prévue, en retard) ; prochaine visite.
  - **Adulte :** courbe de tension avec **zone cible** dessinée à partir de bornes fournies par l'API (le front dessine, ne décide pas) ; indicateur « Dans la zone / À discuter avec votre soignant » **fourni par l'API** (`zone`) ; dernier bilan et prochain bilan.
- **Aperçu des notifications** (3 dernières) avec icône de canal (SMS, WhatsApp, application), pastille non lu.

**Mon parcours :** frise chronologique verticale (passé : fait ; présent : à faire ; futur : prévu), chaque élément avec statut, date, et lien vers l'aide à la décision.

**Notifications :** liste avec filtre (Tout, Non lues, À traiter), chaque message affichant canal, langue, date, texte non anxiogène, et les boutons de réponse quand une action est attendue.

**Mon profil :** informations d'identité (nom d'affichage, âge, centre de rattachement, langue préférée, canal préféré), préférences culturelles (praticienne souhaitée, créneaux), foyer. Modification de la langue et du canal.

**Confidentialité :**
- **Cinq interrupteurs de consentement** (`ConsentToggle`), chacun avec une explication d'une phrase : évaluation et calendrier de prévention · rappels · partage de mon dossier avec le centre · statistiques anonymes · utilisation d'un résultat génétique existant. Le retrait est **immédiat** et la page confirme ses effets en langage clair. Le partage génétique n'apparaît qu'avec un texte neutre et calme.
- **Journal d'usage de mes données** : tableau lisible (date, qui, quelle catégorie de données, pour quoi).
- Boutons « Télécharger mes données » (simulé) et « Retirer tous mes consentements ».

**États à gérer :** chargement (squelettes), vide, erreur réseau, hors ligne (bandeau).

---

### 8. Phase 4 — Portail médecin

**Principes :** dense mais respirable, lisible en consultation, tout en **boutons d'action**. **Aucune formule, règle ni score affiché.**

**Mise en page :** barre latérale (Aujourd'hui · Patients · Alertes · Paramètres), barre supérieure avec recherche et menu profil, bannière de démonstration.

**Tableau de bord (`/clinician`) :**
- **Cartes clés :** patients à voir aujourd'hui · signalements Rouges · dossiers Gris à compléter · visites en retard.
- **Liste des patients** (tableau triable, filtrable) : nom d'affichage, âge, parcours (enfant / adulte), `LevelBadge`, **motif principal en une phrase**, prochaine échéance, état du parcours, `CertaintyBadge`. **Aucune colonne de score de priorisation.** Filtres : niveau, parcours, état, échéance. Clic sur une ligne → fiche patient. Navigation clavier complète.

**Fiche patient (`/clinician/patients/[id]`) :**
- **En-tête :** identité, âge (et âge corrigé si prématuré, fourni par l'API), niveau global, badge de certitude, centre.
- **Barre d'actions (boutons clés)** — chacune appelle l'adaptateur, affiche un état de chargement, puis un résultat clair :
  1. **Lancer l'évaluation de prévention** → met à jour les signalements.
  2. **Compléter les données manquantes** → formulaire guidé listant exactement les mesures à saisir (utile pour lever un Gris).
  3. **Générer le résumé du dossier (IA)** → `AiSuggestionPanel` avec texte en langage clair, étiquette « Suggestion générée par IA — à valider », boutons Valider · Modifier · Ignorer, bouton Copier.
  4. **Voir le parcours recommandé** → liste d'actes regroupés par visite, avec **Valider · Adapter · Différer** (motif obligatoire pour Adapter et Différer).
  5. **Préparer l'invitation** → aperçu du message (langue, canal, destinataire, aide à la décision), validation humaine obligatoire avant envoi simulé.
  6. **Confirmer la visite** → saisie du code d'orientation ; une visite n'est « Réalisée » qu'après confirmation du centre.
  7. **Enregistrer la conclusion** → normal / anormal + notes.
  8. **Exporter le dossier (FHIR)** → téléchargement d'un fichier ; **le contenu n'est jamais affiché**.
- **Onglets :**
  - **Résumé** : situation en quelques lignes + prochaine action.
  - **Signalements** : une carte par signalement avec `LevelBadge`, 1 à 3 facteurs principaux en phrases, étiquette de source, données manquantes, `CertaintyBadge`, échéance.
  - **Parcours** : actes recommandés et état de suivi.
  - **Mesures** : graphiques d'évolution (tension, poids, taille, courbes) en lecture, sans seuils chiffrés visibles ; zones fournies par l'API.
  - **Consentements et journal d'usage.**
  - **Historique** des actions (qui, quand, quoi).
- **Signal génétique :** s'il existe et que le patient y a consenti, l'afficher dans une carte discrète « Information génétique (simulée) » avec une phrase d'effet (« Bilan cardiométabolique avancé suggéré »), jamais de percentile ni de détail technique.

**Règle de transparence :** si le back-end renvoie un signalement, l'interface doit toujours afficher *pourquoi* (facteurs) sans jamais afficher *comment c'est calculé*.

---

### 9. Phases de travail

Travaille dans cet ordre et **arrête-toi après chaque phase** :

| Phase | Contenu | Critère de fin |
| :--- | :--- | :--- |
| 0 | Projet, pile, tokens de design, composants de base, i18n, adaptateur `mock`, données synthétiques, middleware de rôles | `npm run build` passe ; page de test des composants |
| 1 | Landing page complète | Toutes les sections, responsive, EN/FR, RTL fonctionnel |
| 2 | Connexion, demande d'accès, redirection par rôle | Les 5 comptes de démonstration atterrissent au bon endroit |
| 3 | Portail patient (enfant, parent, adulte) | Les 3 personas affichent leurs indicateurs et notifications |
| 4 | Portail médecin | Liste, fiche, 8 actions, panneau IA |
| 5 *(optionnelle)* | **Coordinateur** : file de relance en 3 files (Rouge immédiat · Gris à compléter · À inviter) avec actions Valider · Inviter · Contacter. **Santé publique** : tableau agrégé avec petits effectifs masqués (« Masqué (n < 10) »), intervalles de confiance, alertes d'équité | Données agrégées uniquement, aucune donnée individuelle |
| 6 | Qualité : accessibilité, performance, tests, README | Section 12 respectée |

---

### 10. Couche de données et données synthétiques

**Interface `ApiClient` (TypeScript)** à implémenter en `mock` et en `http`. Elle expose au minimum : `login`, `logout`, `getMe`, `listPatients(filters)`, `getPatient(id)`, `runEvaluation(id)`, `getMissingData(id)`, `submitMissingData(id, payload)`, `generateSummary(id)`, `getCarePlan(id)`, `actOnRecommendation(id, action, motif?)`, `previewInvitation(id)`, `sendInvitation(id)`, `confirmVisit(id, code)`, `recordConclusion(id, payload)`, `exportFhir(id)`, `getConsents`, `updateConsents`, `getUsageLog`, `getNotifications`, `respondToRecommendation(id, response)`, et, pour la phase 5, `getQueue()` et `getObservatory()`.

**Types principaux :** `Level` (`red|orange|yellow|green|grey`), `Certainty` (`high|medium|low`), `Flag` (`level`, `title`, `factors: string[]` (1 à 3 phrases), `source_label`, `missing_data: string[]`, `due_date`, `certainty`), `Recommendation` (`state` parmi `created|validated|invited|scheduled|postponed|overdue|done|refused`), `Patient`, `CarePlan`, `Notification`, `ConsentState` (5 clés).

**Personnages synthétiques à créer** (noms fictifs, plus 20 autres patients variés pour remplir les listes) :
1. **Enfant de 18 mois** : visite des 18 mois manquée, dépistage d'anémie non fait, questionnaire de développement avec suivi recommandé, certitude Moyenne (carnet déclaré). Parent connecté.
2. **Adolescent de 14 ans** : surpoids à surveiller, vaccin de l'adolescence non fait, antécédent familial de cholestérol élevé. Parent connecté ; confidentialité adolescente respectée.
3. **Adulte de 36 ans** : tension limite sur deux mesures (zone « à discuter »), bilan de diabète recommandé, signal génétique simulé consenti, certitude Moyenne.
4. Un dossier **Gris** (données manquantes), un dossier **Rouge** (grossesse avec tension élevée), un dossier **Vert**.

**Comptes de démonstration :** un par rôle, mot de passe affiché uniquement dans le panneau de démonstration.

---

### 11. i18n, accessibilité, performance

- **WCAG 2.1 AA** visé : contrastes vérifiés, navigation clavier complète, focus visible, libellés ARIA, tableaux accessibles, messages d'erreur liés aux champs, ne jamais coder l'information par la couleur seule.
- **RTL** complet pour l'arabe (miroir de la mise en page, icônes directionnelles inversées).
- **Mobile d'abord** pour le portail patient (cibles tactiles ≥ 44 px).
- **Performance :** images optimisées, polices chargées avec `display: swap`, pas de bibliothèque lourde inutile, chargement différé des graphiques.
- **Aucune donnée de santé dans les URL, le stockage local ou les journaux.**

---

### 12. Tests, livrables et façon de travailler

**Livrables :**
- Code propre, typé strict, sans `any` injustifié, composants réutilisables.
- `README.md` : installation, variables d'environnement (`NEXT_PUBLIC_DEMO_MODE`, `API_MODE=mock|http`, `API_BASE_URL`), comptes de démonstration, scripts.
- `NOTES.md` : chaque décision et ambiguïté que tu as tranchée.
- Test de bout en bout (Playwright) : connexion → redirection selon rôle → affichage de la page attendue → garde de route qui bloque un mauvais rôle.
- **Test automatique d'absence :** vérifier qu'aucune chaîne « score de priorisation », « seuil » ou formule n'apparaît dans le DOM du portail médecin.

**Façon de travailler :**
1. Commence par un **plan** : liste des fichiers et composants que tu vas créer.
2. À la fin de chaque phase, lance `lint`, `typecheck` et `build`, corrige, puis résume.
3. En cas d'ambiguïté, choisis l'option **la plus simple et la plus sûre**, note-la dans `NOTES.md`, et continue. Ne t'arrête pas pour une question mineure.
4. **N'ajoute aucune fonctionnalité non demandée.** Ne crée pas de pages hors de ce prompt.
5. **Ne remplace jamais une règle de ce prompt par une préférence de design.** En cas de conflit, la section 2 gagne.

Commence par la **Phase 0**.
