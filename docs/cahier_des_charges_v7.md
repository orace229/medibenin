# MediSense — Cahier des charges

**Prévention et dépistage de précision : enfants, adultes et communautés**

Future Health Digital Innovation Challenge 2026 · Population Health · **Challenge 04 : Precision Prevention and Screening**

| | |
| :--- | :--- |
| **Version** | 7.0, révisée après revue critique « jury » (8 novembre 2026) |
| **Statut** | Document de travail de l'équipe, à relire avant dépôt. Les mentions **[À VÉRIFIER]** renvoient au registre de la section 15.3 |
| **Équipe** | CareX (Université d'Abomey-Calavi : ENEAM, IFRI, FSS) |
| **Livrable du concours** | Prototype fonctionnel au 20 novembre 2026, avec documentation technique, hypothèses et limites |

> [!IMPORTANT]
> **Règle d'écriture de ce document.** Ce que nous savons est écrit comme un fait, avec sa source. Ce que nous supposons est écrit comme une hypothèse (H). Ce qui reste à vérifier porte la mention **[À VÉRIFIER]**. Ce qui est simulé dans le prototype est marqué **[SIMULÉ]**. Le concours demande explicitement les hypothèses et les limites : nous les montrons au lieu de les cacher.

---

## Sommaire

0. [Lecture rapide](#0-lecture-rapide)
1. [Le défi et notre réponse, exigence par exigence](#1-le-défi-et-notre-réponse-exigence-par-exigence)
2. [Périmètre, maturité et statut de chaque brique](#2-périmètre-maturité-et-statut-de-chaque-brique)
3. [Données autorisées, provenance et consentement](#3-données-autorisées-provenance-et-consentement)
4. [Exigence 1 : repérage transparent des risques et des lacunes](#4-exigence-1--repérage-transparent-des-risques-et-des-lacunes)
5. [Exigence 2 : parcours personnalisés, population et clinique séparées](#5-exigence-2--parcours-personnalisés-population-et-clinique-séparées)
6. [Exigence 3 : engagement culturellement adapté et choix réel](#6-exigence-3--engagement-culturellement-adapté-et-choix-réel)
7. [Exigence 4 : garde-fous pour la population locale](#7-exigence-4--garde-fous-pour-la-population-locale)
8. [Exigence 5 : évaluation par les résultats](#8-exigence-5--évaluation-par-les-résultats)
9. [Architecture technique et interopérabilité](#9-architecture-technique-et-interopérabilité)
10. [Cadre réglementaire, éthique, sécurité et licences](#10-cadre-réglementaire-éthique-sécurité-et-licences)
11. [Prototype du 20 novembre 2026](#11-prototype-du-20-novembre-2026)
12. [Équipe et gouvernance clinique](#12-équipe-et-gouvernance-clinique)
13. [Modèle économique et voie vers le pilote](#13-modèle-économique-et-voie-vers-le-pilote)
14. [Matrice des risques](#14-matrice-des-risques)
15. [Hypothèses, limites et registre des vérifications](#15-hypothèses-limites-et-registre-des-vérifications)
16. [Transférabilité aux contextes à ressources limitées](#16-transférabilité-aux-contextes-à-ressources-limitées)
- [Annexes A à E](#annexes)

---

## 0. Lecture rapide

**Le problème (énoncé du défi).** À Abu Dhabi, l'éligibilité et les invitations aux visites de l'enfant (*Well-Child Visits*), au dépistage complet de l'adulte et aux autres parcours de prévention dépendent encore largement de règles d'âge et de sexe. Pourtant, le risque se répartit entre les antécédents familiaux, la génomique, les maladies chroniques, le développement, les comportements, l'historique des visites, la géographie et le contexte social. Les personnes qui en ont le plus besoin sont donc oubliées, invitées trop tard ou orientées vers un parcours inadapté.

**Ce que fait MediSense, en cinq verbes :**

1. **Repérer** les risques élevés et les soins manqués ou en retard, chez l'enfant, l'adulte et dans les communautés, avec les principaux facteurs de chaque signalement et **son degré de certitude**.
2. **Orienter** vers la bonne visite de l'enfant, le bon dépistage de l'adulte ou la bonne intervention, selon des directives approuvées, avec une échéance.
3. **Engager** chaque personne dans sa langue, sur son canal, avec une information claire et le droit de refuser.
4. **Suivre** chaque recommandation jusqu'à la visite confirmée par le centre de santé.
5. **Mesurer** la portée, les erreurs, l'adoption et les résultats par segment de population, sans jamais publier de petits effectifs ni de chiffres trompeurs.

**Ce que MediSense n'est pas.** Ce n'est pas un outil de diagnostic, ni un service d'urgence, ni un séquenceur génétique. Il aide des professionnels à décider et à prioriser. Le soignant décide toujours.

**Ce que le jury verra le 20 novembre** :
- trois personas synthétiques (un enfant de 18 mois, un adolescent de 14 ans, un adulte de 36 ans) suivis de bout en bout ;
- deux écrans séparés : la liste de priorisation de la population et la fiche clinique individuelle ;
- un badge de certitude sur chaque signalement ;
- une console de population avec masquage des petits effectifs et intervalles de confiance ;
- un banc d'essai synthétique qui compare MediSense à l'invitation par âge et sexe, à capacité égale, en présentant clairement ce qu'il prouve et ce qu'il ne prouve pas.
