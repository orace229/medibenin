<p align="center">
  <img src="docs/logo.png" alt="MediSense Logo" width="160" />
</p>

<h1 align="center">MediSense 🩺✨</h1>

<p align="center">
  <strong>Prévention et Dépistage de Précision : Enfants, Adultes et Communautés</strong><br>
  <em>Future Health Digital Innovation Challenge 2026 (Abu Dhabi) • Population Health • <strong>Challenge 04 : Precision Prevention and Screening</strong></em><br>
  <em>Développé par l'équipe <strong>CareX</strong> (Université d'Abomey-Calavi : ENEAM, IFRI, FSS).</em>
</p>

<p align="center">
  <a href="https://frontend-one-flax-65.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-frontend--one--flax--65.vercel.app-emerald?style=for-the-badge&logo=vercel" alt="Live Demo Vercel" /></a>
  <a href="https://github.com/orace229/medibenin"><img src="https://img.shields.io/badge/GitHub-orace229%2Fmedibenin-blue?style=for-the-badge&logo=github" alt="GitHub Repo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Challenge-Future%20Health%20Abu%20Dhabi%202026-gold" alt="Future Health Challenge" />
  <img src="https://img.shields.io/badge/Langues-Fran%C3%A7ais%20%7C%20English%20(100%25)-indigo" alt="Bilingual" />
  <img src="https://img.shields.io/badge/Standards-DoH%20WCV%20%2F%20IFHAS%20%2F%20WHO%20HEARTS-emerald" alt="Clinical Standards" />
  <img src="https://img.shields.io/badge/Garde--fous-Wilson%2095%25%20CI%20%26%20Masquage%20n%3C10-purple" alt="Statistical Safeguards" />
  <img src="https://img.shields.io/badge/Interop-FHIR%20R4%20%2F%20Malaffi%20Ready-blue" alt="FHIR R4" />
</p>

---

## 📌 Présentation du Projet

À Abu Dhabi, l'éligibilité et les invitations aux visites de l'enfant (*Well-Child Visits*), au dépistage complet de l'adulte (*IFHAS*) et aux autres parcours préventifs dépendent encore largement de règles générales basées sur l'âge et le sexe. Pourtant, le risque clinique se répartit entre les antécédents familiaux, la génomique, les maladies chroniques, le développement, les comportements et le contexte territorial.

**MediSense** est une plateforme d'intelligence de santé des populations conçue pour :
1. **Repérer** les risques élevés et les soins manqués ou en retard (visites pédiatriques DoH, enfants zéro-dose, risque drépanocytaire et cardiométabolique précoce, FINDRISC, M-CHAT-R), avec les principaux facteurs explicatifs et un **badge de certitude clinique**.
2. **Orienter** vers la bonne visite ou dépistage selon des directives officielles approuvées, avec une échéance timée et un parcours unifié (`CarePlan`).
3. **Engager** chaque personne dans sa langue (**Arabe et Anglais**, et audio), avec des aides à la décision courtes et un **consentement granulaire à 5 finalités** avec droit de refus immédiat sans pénalité.
4. **Suivre** chaque recommandation en boucle fermée à **8 états** jusqu'à confirmation par le centre via un **code d'orientation sécurisé (QR / 8 caractères)** sans stocker d'identité civile.
5. **Mesurer** l'impact et l'équité via une console avec **masquage strict anti-réidentification ($n < 10$)**, intervalles de Wilson à 95% et détection des alertes d'équité (Règles C1 à C4).

---

## 🖥️ Les Écrans du Prototype de Démonstration (Section 11)

L'application Web ([frontend-one-flax-65.vercel.app](https://frontend-one-flax-65.vercel.app)) met en scène de bout en bout les exigences du concours, entièrement bilingue (**Français / English**) :

0. **🏠 Écran d'Accueil : Vue d’Ensemble Exécutive**
   - Synthèse du Défi 04 (Abu Dhabi) et des 3 piliers (gain $\times 4.02$, équité sans biais, boucle fermée).
   - Accès direct en un clic aux 5 perspectives fonctionnelles.
   - Sélection rapide des 3 personas de démonstration clinique.

1. **👥 Écran 1 : Priorisation de la Population (Coordinateur)**
   - Tri logistique par le score $S_{\text{prio}} = 100 \times (0{,}40 I_{\text{risque}} + 0{,}25 I_{\text{lacune}} + 0{,}20 I_{\text{retard}} + 0{,}15 I_{\text{vuln}})$.
   - Jauges de capacité quotidienne des centres de santé d'Abu Dhabi.
   - Validation des invitations par lot.
2. **🩺 Écran 2 : Fiche Clinique Individuelle (Médecin face au patient)**
   - **Règle d'or éthique (CDC §5.2)** : **$S_{\text{prio}}$ n'est jamais affiché** pour ne pas biaiser la décision soignante.
   - Facteurs explicatifs contrefactuels (attribution du risque).
   - **Badge de certitude clinique** (Haute / Moyenne / Faible) avec complétude, provenance (V/M/D/S) et intervalle de risque.
   - **Niveau Gris** : s'abstient de deviner si les données sont insuffisantes.
   - Parcours de soins unifié et code d'orientation sécurisé.
3. **📊 Écran 3 : Garde-fous de Population & Équité (Console Santé Publique)**
   - Tableaux par segments locaux (Émiratis, Asie du Sud, Monde arabe hors ÉAU, Régions Abu Dhabi, Al Ain, Al Dhafra).
   - **Règle anti-tromperie (CDC §7.3)** : Masquage automatique des cellules $n < 10$ avec suppression secondaire.
   - Intervalles de Wilson à 95% calculés pour chaque indicateur.
   - Alertes d'équité C3 (écart d'adoption) et C1 (zones sous-couvertes).
4. **🤝 Écran 4 : Engagement & Choix Éclairé (Famille & Patient)**
   - Aides à la décision de 3 à 5 phrases en **arabe et anglais** (Dépistage colorectal FIT, Visite 18 mois, Bilan IFHAS).
   - Consentement granulaire à 5 finalités.
   - Arrêt immédiat des relances en cas de refus explicite (sans pénalité d'accès aux soins).
5. **🧪 Écran 5 : Banc d'Essai Synthétique (50 000 Profils)**
   - Comparaison rigoureuse à capacité égale $K$ invitations : MediSense vs Approche classique Âge/Sexe.
   - Rendement de détection quadruplé ($x 4.02$) et désengorgement des cliniques.
   - **Déclaration d'honnêteté scientifique (CDC §8.4)** : distinction formelle entre validation de la chaîne algorithmique et efficacité clinique réelle à mesurer en pilote.

---

## 🏗️ Architecture du Répertoire

```text
medibenin/
├── frontend/             # Console Web React 18, Vite, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── components/  # Les 5 Écrans (Population, Clinique, Garde-fous, Engagement, Benchmark)
│   │   ├── data/
│   │   │   ├── rules/   # Tables JSON signées (P, A, G, C) avec SHA-256
│   │   │   ├── personas.ts       # 3 Personas de démo (18 mois, 14 ans, 36 ans)
│   │   │   └── populationData.ts # Segments Abu Dhabi & Banc d'essai
│   │   ├── services/
│   │   │   └── wilsonScore.ts    # Calculateur d'intervalles Wilson 95% & Masquage
│   │   └── types/medisense.ts    # Typage TypeScript strict des modèles
│   └── package.json
│
├── core/                 # Moteur de calcul Python & analyse clinique
├── models/               # Modèles de domaine Pydantic
├── tests/                # Suite de tests de conformité clinique
└── docs/                 # Documentation technique officielle
    ├── cahier_des_charges_v7.md # Cahier des charges officiel v7.0 révisé
    ├── architecture_diagram.md  # Architecture 3-tiers & passerelle FHIR R4
    └── uml_modeling.md          # Diagrammes UML complets
```

---

## 🚀 Démarrage Rapide

### Application Web (Frontend MediSense)
Nécessite Node.js (>= 18) :
```bash
cd frontend
npm install
npm run dev
```
Ouvrez votre navigateur sur `http://localhost:5173`. Vous pouvez basculer d'un clic entre les 5 perspectives du concours ou activer le mode historique de triage aigu.

### Moteur Python & Tests Cliniques
```bash
python -m unittest discover tests
```

---

## 👥 Équipe CareX (Université d'Abomey-Calavi, Bénin)

| Membre | Rôle | Établissement |
| :--- | :--- | :--- |
| **Orace ATTINMAWASSONOU** | Développement principal et IA, coordination | ENEAM, UAC |
| **Bienderan EGBO** | Backend, données, statistiques, cohorte synthétique | ENEAM, UAC |
| **Uriel KPEGBE** | Sécurité, confidentialité, documentation | IFRI, UAC |
| **Freud BOKOSSA** | IA, langues, évaluation et équité | IFRI, UAC |
| **Dr. Sydney KPEGBE** | Référent médical : règles, calendriers, contenus | FSS, UAC |

---

*Projet soumis dans le cadre du **Future Health Digital Innovation Challenge 2026** (Mohamed bin Zayed University of Artificial Intelligence, Microsoft, Inception 42) — Challenge 04 : Precision Prevention and Screening.*
