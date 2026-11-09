export type Language = 'fr' | 'en';

export interface TranslationDictionary {
  brand: {
    title: string;
    tagline: string;
    dohBadge: string;
    challengeTitle: string;
    country: string;
  };
  nav: {
    modules: string;
    menuTitle: string;
    population: {
      title: string;
      sub: string;
      breadcrumb: string;
      badge: string;
    };
    clinical: {
      title: string;
      sub: string;
      breadcrumb: string;
      badge: string;
    };
    safeguards: {
      title: string;
      sub: string;
      breadcrumb: string;
      badge: string;
    };
    engagement: {
      title: string;
      sub: string;
      breadcrumb: string;
      badge: string;
    };
    benchmark: {
      title: string;
      sub: string;
      breadcrumb: string;
      badge: string;
    };
  };
  topBar: {
    sos: string;
    sosTooltip: string;
    patientRecord: string;
  };
  sidebar: {
    challengeSubtitle: string;
    sosLabel: string;
    sosRule: string;
    footerCity: string;
  };
  prioritization: {
    title: string;
    badge: string;
    subtitle: string;
    capacityTitle: string;
    capacitySlots: string;
    ethicalRuleTitle: string;
    ethicalRuleDesc: string;
    dossiersCount: string;
    selectedCount: string;
    selectAll: string;
    validateInvitations: string;
    scoreSprio: string;
    openClinical: string;
    batchSuccessNotice: string;
    yearsOld: string;
    monthsOld: string;
  };
  clinical: {
    backToPopulation: string;
    sprioForbiddenNotice: string;
    primaryCenter: string;
    syntheticId: string;
    ageLabel: string;
    genderLabel: string;
    regionLabel: string;
    languageLabel: string;
    vitalsTitle: string;
    signalsTitle: string;
    carePlanTitle: string;
    simulatorsTitle: string;
    growthChartTitle: string;
    qrModalTitle: string;
    levelGreyButton: string;
    levelGreyActive: string;
    levelGreyDesc: string;
    vitals: {
      bp: string;
      bpNotMeasured: string;
      bmi: string;
      waist: string;
      waistNotMeasured: string;
      smoking: string;
      nonSmoker: string;
      findrisc: string;
      findriscCalc: string;
      genomics: string;
      genomicsNotRequired: string;
    };
    status: {
      validated: string;
      invited: string;
      reminded: string;
      booked: string;
      attended: string;
      noShow: string;
      declined: string;
      completed: string;
    };
  };
  engagement: {
    headerTitle: string;
    headerDesc: string;
    decisionAidsTitle: string;
    consentPurposesTitle: string;
    refusalNotice: string;
    topics: {
      fit: string;
      wcv: string;
      diabetes: string;
    };
    fitText: {
      title: string;
      p1: string;
      p2: string;
      p3: string;
      disclaimer: string;
    };
    wcvText: {
      title: string;
      p1: string;
      p2: string;
      p3: string;
      disclaimer: string;
    };
    diabetesText: {
      title: string;
      p1: string;
      p2: string;
      disclaimer: string;
    };
  };
  safeguards: {
    headerTitle: string;
    headerDesc: string;
    antiReidBadge: string;
    antiReidSub: string;
    alertC3Title: string;
    alertC3Badge: string;
    alertC3Desc: string;
    alertC3Action: string;
    alertC1Title: string;
    alertC1Badge: string;
    alertC1Desc: string;
    alertC1Action: string;
    filters: {
      title: string;
      all: string;
      nationality: string;
      region: string;
    };
    columns: {
      segment: string;
      eligible: string;
      reach: string;
      recommendation: string;
      adoption: string;
      falsePositives: string;
      falseNegatives: string;
      status: string;
    };
    maskedText: string;
    confirmedWilson: string;
    antiReidStatus: string;
    methodologyTitle: string;
    methodologyDesc: string;
  };
  benchmark: {
    headerTitle: string;
    headerDesc: string;
    badge: string;
    sub: string;
    integrityTitle: string;
    integrityDesc: string;
    kpi: {
      yieldGain: string;
      yieldGainSub: string;
      falseNegAvoided: string;
      falseNegSub: string;
      zeroDose: string;
      zeroDoseSub: string;
      gapDetection: string;
      gapDetectionSub: string;
    };
    table: {
      title: string;
      metricCol: string;
      medisenseCol: string;
      baselineCol: string;
      deltaCol: string;
    };
  };
  footer: {
    disclaimerTitle: string;
    disclaimerText: string;
    brandTagline: string;
    brandMission: string;
    complianceTitle: string;
    complianceLaw: string;
    complianceEncryption: string;
    compliancePseudonymization: string;
    complianceDhis2: string;
    challengeTitle: string;
    challengeTopic: string;
    challengeOrg: string;
    copyright: string;
    developedWith: string;
    forBenin: string;
  };
  historicToggle: {
    switchToHistoric: string;
    backToMediSense: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  fr: {
    brand: {
      title: 'MediSense',
      tagline: 'Prévention & Dépistage de Précision • EAU 2026',
      dohBadge: 'DoH',
      challengeTitle: 'Défi 04 Abu Dhabi 2026',
      country: 'Abu Dhabi, EAU'
    },
    nav: {
      modules: 'Modules',
      menuTitle: 'Modules du Défi 04 (Abu Dhabi)',
      population: {
        title: 'Priorisation Population',
        sub: 'Score Sprio & Attribution Créneaux',
        breadcrumb: 'Console Coordinateur de Santé Publique',
        badge: 'Sprio'
      },
      clinical: {
        title: 'Fiche Clinique Individuelle',
        sub: 'Soignant & Arbres Décisionnels',
        breadcrumb: 'Console Praticien (Médecin / Infirmier)',
        badge: 'CDC §5'
      },
      safeguards: {
        title: 'Garde-fous & Équité',
        sub: 'Wilson 95% & Masquage n < 10',
        breadcrumb: 'Console Gouvernance & Équité Sanitaire',
        badge: 'CDC §7'
      },
      engagement: {
        title: 'Consentement & Choix Réel',
        sub: '5 finalités & Aides à la décision',
        breadcrumb: 'Portail Patient & Aides à la Décision',
        badge: 'CDC §6'
      },
      benchmark: {
        title: 'Banc d’Essai 50k',
        sub: 'Cohorte synthétique & Équité',
        breadcrumb: 'Validation Scientifique & Détection des Lacunes',
        badge: 'CDC §8'
      }
    },
    topBar: {
      sos: 'SOS',
      sosTooltip: 'Urgence vitale immédiate - Règle de sortie E0',
      patientRecord: 'Dossier :'
    },
    sidebar: {
      challengeSubtitle: 'Prévention de Précision • EAU 2026',
      sosLabel: 'Urgence Vitale SOS',
      sosRule: 'Règle de sortie E0',
      footerCity: 'Abu Dhabi, UAE'
    },
    prioritization: {
      title: 'Priorisation de la Population',
      badge: 'Console Coordinateur',
      subtitle: 'Ordonnancement des invitations selon le score Sprio et la capacité des créneaux',
      capacityTitle: 'Capacité centres du jour',
      capacitySlots: 'créneaux alloués (74%)',
      ethicalRuleTitle: 'RÈGLE CDC §5.2 — Séparation stricte Logistique / Clinique :',
      ethicalRuleDesc: 'Le score Sprio sert uniquement à ordonnancer les invitations selon les créneaux disponibles. Il est strictement interdit d’afficher ce score dans la fiche clinique individuelle pour ne pas biaiser la décision du médecin ou de l’infirmier.',
      dossiersCount: 'dossiers priorisés',
      selectedCount: 'sélectionné(s) pour invitation',
      selectAll: 'Tout sélectionner',
      validateInvitations: 'Valider le lot d’invitations',
      scoreSprio: 'Score Sprio',
      openClinical: 'Fiche Clinique',
      batchSuccessNotice: 'Lot d’invitations validé : les convocations ont été transmises aux centres Al Bateen et Al Hili.',
      yearsOld: 'ans',
      monthsOld: 'mois'
    },
    clinical: {
      backToPopulation: 'Retour à la Priorisation Population',
      sprioForbiddenNotice: 'Fiche Clinique Individuelle • Écran 2 (Sprio exclu selon CDC §5.2)',
      primaryCenter: 'Centre de rattachement :',
      syntheticId: 'ID Synthétique :',
      ageLabel: 'Âge :',
      genderLabel: 'Sexe :',
      regionLabel: 'Région :',
      languageLabel: 'Langue :',
      vitalsTitle: 'Constantes & Données Biocliniques',
      signalsTitle: 'Signaux Détectés & Arbres Décisionnels (Règles P, A, G, C)',
      carePlanTitle: 'Plan de Soins Personnalisé (CarePlan unifié)',
      simulatorsTitle: 'Simulateur Interactif de Risque & Facteurs Modifiables',
      growthChartTitle: 'Courbe de Croissance OMS 2006 (0 à 24 mois)',
      qrModalTitle: 'Pass Sanitaire de Prévention (QR Code sécurisé)',
      levelGreyButton: 'Activer / Tester le Niveau Gris',
      levelGreyActive: 'Niveau Gris Activé (Données insuffisantes pour statuer)',
      levelGreyDesc: 'Données insuffisantes pour un algorithme déterministe. Échappement vers une consultation présentielle de cadrage clinique sans extrapolation.',
      vitals: {
        bp: 'TENSION',
        bpNotMeasured: 'Non mesurée',
        bmi: 'IMC / POIDS',
        waist: 'TOUR DE TAILLE',
        waistNotMeasured: 'Non mesuré',
        smoking: 'TABAGISME',
        nonSmoker: 'Non-fumeur',
        findrisc: 'SCORE FINDRISC',
        findriscCalc: 'Calculé',
        genomics: 'GÉNOMIQUE',
        genomicsNotRequired: 'Non requis'
      },
      status: {
        validated: 'Validée',
        invited: 'Invitée',
        reminded: 'Rappelée',
        booked: 'Rendez-vous pris',
        attended: 'Présentée',
        noShow: 'Non présentée',
        declined: 'Refusée',
        completed: 'Complétée'
      }
    },
    engagement: {
      headerTitle: 'Engagement Culturellement Adapté & Choix Éclairé',
      headerDesc: 'MediSense respecte l’autonomie des familles : aides à la décision courtes en français et anglais, consentement granulaire par finalité, et arrêt immédiat des relances en cas de refus sans pénalité d’accès aux soins.',
      decisionAidsTitle: 'Aide à la Décision (3 à 5 phrases claires)',
      consentPurposesTitle: 'Gestion Granulaire des 5 Finalités de Consentement',
      refusalNotice: 'Refus enregistré : Relances désactivées immédiatement. Aucun impact sur vos droits aux soins réguliers.',
      topics: {
        fit: 'Dépistage FIT',
        wcv: 'Visite Enfant',
        diabetes: 'Bilan Diabète'
      },
      fitText: {
        title: 'Dépistage du cancer colorectal (Test FIT) :',
        p1: 'Ce test simple recherche des traces invisibles de sang dans les selles et se fait chez vous en quelques minutes.',
        p2: 'Il permet de repérer des polypes ou lésions précancéreuses avant qu’ils ne deviennent dangereux.',
        p3: 'Un résultat positif ne signifie pas nécessairement un cancer, mais nécessite une consultation de contrôle.',
        disclaimer: 'Vous avez le droit d’accepter, de reporter ou de refuser ce dépistage sans aucune pénalité sur votre prise en charge.'
      },
      wcvText: {
        title: 'Visite systématique de santé infantile (18 mois) :',
        p1: 'Cette consultation permet de vérifier la croissance de votre enfant, son audition, sa vision et son éveil psychomoteur.',
        p2: 'Elle comprend le dépistage de l’anémie et l’évaluation du développement selon les recommandations officielles DoH.',
        p3: 'Elle assure la mise à jour des vaccins essentiels pour protéger votre enfant et sa communauté.',
        disclaimer: 'Ce bilan est pris en charge et gratuit dans les centres agréés de santé communautaire.'
      },
      diabetesText: {
        title: 'Bilan métabolique & Dépistage du diabète (IFHAS) :',
        p1: 'Recommandé pour dépister précocement le pré-diabète et les facteurs de risque cardiovasculaires silencieux.',
        p2: 'Une simple prise de sang à jeun (glycémie et HbA1c) permet d’adapter votre mode de vie avant l’apparition de complications.',
        disclaimer: 'Vous restez maître de vos rendez-vous et pouvez demander conseil à votre médecin traitant.'
      }
    },
    safeguards: {
      headerTitle: 'Garde-fous & Équité de Santé Publique',
      headerDesc: 'Masquage strict des petits effectifs (n < 10), intervalles de Wilson à 95 % et alertes d’équité culturelle C1–C4.',
      antiReidBadge: 'Anti-Réidentification',
      antiReidSub: 'Suppression primaire & secondaire active',
      alertC3Title: 'Alerte d’Écart d’Adoption (Règle C3)',
      alertC3Badge: 'JAUNE',
      alertC3Desc: 'Segment Asie du Sud : Taux d’adoption (64,2% [63,2% – 65,2%]) inférieur de plus de 10 points à la moyenne (74,8%), avec intervalles de Wilson disjoints.',
      alertC3Action: '→ Action : Adapter les messages en Ourdou/Hindi et ouvrir des créneaux en soirée pour les travailleurs postés.',
      alertC1Title: 'Alerte Zone Sous-Couverte (Règle C1)',
      alertC1Badge: 'ORANGE',
      alertC1Desc: 'Région Al Dhafra : Borne haute de l’intervalle de portée (73,9%) sous la cible du programme (85%). Accès routier moyen > 30 minutes.',
      alertC1Action: '→ Action : Déploiement d’une unité mobile de dépistage itinérante avec relais communautaires.',
      filters: {
        title: 'Dimension d’analyse :',
        all: 'Tous les segments',
        nationality: 'Par Nationalité',
        region: 'Par Région Géographique'
      },
      columns: {
        segment: 'Segment de Population',
        eligible: 'Population Éligible',
        reach: 'Portée [Wilson 95%]',
        recommendation: 'Taux Recomm.',
        adoption: 'Adoption',
        falsePositives: 'Faux Positifs',
        falseNegatives: 'Faux Négatifs',
        status: 'Garde-fou Statut'
      },
      maskedText: 'Masqué (n < 10)',
      confirmedWilson: 'CONFIRMÉ WILSON',
      antiReidStatus: 'ANTI-RÉIDENTIFICATION',
      methodologyTitle: 'Explication méthodologique du masquage (CDC §7.3) :',
      methodologyDesc: 'Toute cellule dont l’effectif est strictement inférieur à 10 est systématiquement masquée (primaire) pour protéger le secret statistique. La cellule complémentaire de la même ligne ou colonne est également masquée (suppression secondaire) pour empêcher tout recalcul par déduction mathématique.'
    },
    benchmark: {
      headerTitle: 'Banc d’Essai & Évaluation sur 50 000 Profils Synthétiques',
      headerDesc: 'Validation expérimentale sur une cohorte représentative d’Abu Dhabi démontrant un gain de rendement x4.02 sans biais d’exclusion.',
      badge: 'CDC §8 • 50 000 profils',
      sub: 'Comparaison à capacité de centres égale (65 créneaux / jour)',
      integrityTitle: 'Clause d’Intégrité Scientifique (CDC §8.4)',
      integrityDesc: 'Les métriques présentées ici valident l’exécution du pipeline algorithmique et le déclenchement des garde-fous sur données synthétiques. Elles ne constituent pas une validation clinique en conditions réelles, laquelle sera menée lors de la phase pilote à Abu Dhabi.',
      kpi: {
        yieldGain: 'Gain de Rendement',
        yieldGainSub: 'Cas à haut risque détectés vs ciblage par âge seul',
        falseNegAvoided: 'Faux Négatifs Évités',
        falseNegSub: 'Repérage actif des lacunes silencieuses',
        zeroDose: 'Zero-Dose Identifiés',
        zeroDoseSub: 'Enfants sans aucun vaccin orientés vers la clinique',
        gapDetection: 'Détection des Lacunes',
        gapDetectionSub: 'Taux de conformité aux recommandations DoH'
      },
      table: {
        title: 'Tableau Comparatif d’Efficacité Algorithmique (Capacité Fixe)',
        metricCol: 'Indicateur de Santé Publique',
        medisenseCol: 'MediSense (Précision)',
        baselineCol: 'Règle Âge / Sexe Seul',
        deltaCol: 'Gain / Différentiel'
      }
    },
    footer: {
      disclaimerTitle: 'Avertissement Médical Légal Obligatoire :',
      disclaimerText: '« MediBenin est un outil d\'aide à l\'orientation et au triage médical. Il ne se substitue pas à une consultation médicale présentielle et ne pose aucun diagnostic définitif. En cas de détresse respiratoire, convulsion ou perte de connaissance, appelez immédiatement le SAMU Bénin au 112 ou rendez-vous au centre de santé le plus proche. »',
      brandTagline: '« La santé est un droit, pas un privilège urbain. »',
      brandMission: 'Conçu pour combler les déserts médicaux en Afrique de l\'Ouest grâce à une IA vocale multilingue adaptée aux réalités du Bénin.',
      complianceTitle: 'Conformité Numérique & APDP',
      complianceLaw: '• Loi n° 2017-20 portant Code du Numérique au Bénin',
      complianceEncryption: '• Chiffrement fort des données de santé (AES-256)',
      compliancePseudonymization: '• Pseudonymisation intégrale des identités patients',
      complianceDhis2: '• Interopérabilité sanitaire format DHIS2',
      challengeTitle: 'Future Health Challenge 2026',
      challengeTopic: 'Défi 04 : Prévention & Dépistage de Précision.',
      challengeOrg: 'Mohamed bin Zayed University of Artificial Intelligence (MBZUAI) • Abu Dhabi, EAU.',
      copyright: '© 2026 MediBenin • CareX. Tous droits réservés.',
      developedWith: 'Développé avec',
      forBenin: 'pour le Bénin'
    },
    historicToggle: {
      switchToHistoric: 'Basculer vers le socle académique initial (Triage Aigu de Symptômes)',
      backToMediSense: '← Revenir à MediSense (Défi 04 Abu Dhabi • Prévention de Précision)'
    }
  },
  en: {
    brand: {
      title: 'MediSense',
      tagline: 'Precision Prevention & Screening • UAE 2026',
      dohBadge: 'DoH',
      challengeTitle: 'Challenge 04 Abu Dhabi 2026',
      country: 'Abu Dhabi, UAE'
    },
    nav: {
      modules: 'Modules',
      menuTitle: 'Challenge 04 Modules (Abu Dhabi)',
      population: {
        title: 'Population Prioritization',
        sub: 'Sprio Score & Slot Allocation',
        breadcrumb: 'Public Health Coordinator Console',
        badge: 'Sprio'
      },
      clinical: {
        title: 'Individual Clinical Record',
        sub: 'Clinician View & Decision Trees',
        breadcrumb: 'Clinician Console (Physician / Nurse)',
        badge: 'CDC §5'
      },
      safeguards: {
        title: 'Safeguards & Health Equity',
        sub: 'Wilson 95% CI & Small-Cell Masking n < 10',
        breadcrumb: 'Health Equity & Governance Console',
        badge: 'CDC §7'
      },
      engagement: {
        title: 'Informed Consent & Choice',
        sub: '5 Purposes & Decision Aids',
        breadcrumb: 'Patient Portal & Decision Aids',
        badge: 'CDC §6'
      },
      benchmark: {
        title: '50k Cohort Benchmark',
        sub: 'Synthetic Cohort & Yield Metrics',
        breadcrumb: 'Scientific Pipeline & Gap Detection',
        badge: 'CDC §8'
      }
    },
    topBar: {
      sos: 'SOS',
      sosTooltip: 'Immediate Vital Emergency - Safety Rule E0',
      patientRecord: 'Record:'
    },
    sidebar: {
      challengeSubtitle: 'Precision Prevention • UAE 2026',
      sosLabel: 'Vital Emergency SOS',
      sosRule: 'Safety Rule E0',
      footerCity: 'Abu Dhabi, UAE'
    },
    prioritization: {
      title: 'Population Prioritization',
      badge: 'Coordinator Console',
      subtitle: 'Ordering invitation outreach using Sprio scores and clinic slot capacity',
      capacityTitle: 'Clinic Daily Capacity',
      capacitySlots: 'slots allocated (74%)',
      ethicalRuleTitle: 'CDC RULE §5.2 — Strict Logistics / Clinical Separation:',
      ethicalRuleDesc: 'The Sprio score is used exclusively for logistics slot scheduling. Displaying this score inside the individual clinical record is strictly prohibited to avoid biasing medical decision-making.',
      dossiersCount: 'prioritized profiles',
      selectedCount: 'selected for invitation',
      selectAll: 'Select all',
      validateInvitations: 'Approve Invitation Batch',
      scoreSprio: 'Sprio Score',
      openClinical: 'Clinical Record',
      batchSuccessNotice: 'Batch approved: Outreach notices routed to Al Bateen and Al Hili community healthcare centers.',
      yearsOld: 'yrs',
      monthsOld: 'mo'
    },
    clinical: {
      backToPopulation: 'Back to Population Prioritization',
      sprioForbiddenNotice: 'Individual Clinical Record • Screen 2 (Sprio strictly forbidden per CDC §5.2)',
      primaryCenter: 'Assigned Center:',
      syntheticId: 'Synthetic ID:',
      ageLabel: 'Age:',
      genderLabel: 'Sex:',
      regionLabel: 'Region:',
      languageLabel: 'Language:',
      vitalsTitle: 'Bioclinical Vitals & Laboratory Signals',
      signalsTitle: 'Detected Signals & Rule Engines (P, A, G, C Rules)',
      carePlanTitle: 'Personalized Unified CarePlan',
      simulatorsTitle: 'Interactive Risk Simulator & Modifiable Factors',
      growthChartTitle: 'WHO 2006 Pediatric Growth Chart (0-24m)',
      qrModalTitle: 'Health Prevention Pass (Secure QR Code)',
      levelGreyButton: 'Toggle / Test Level Grey Fallback',
      levelGreyActive: 'Level Grey Active (Insufficient data to compute deterministic rule)',
      levelGreyDesc: 'Insufficient clinical data for rule firing. Escapes gracefully to an in-person clinical scoping consultation without unverified inference.',
      vitals: {
        bp: 'BLOOD PRESSURE',
        bpNotMeasured: 'Not measured',
        bmi: 'BMI / WEIGHT',
        waist: 'WAIST CIRC.',
        waistNotMeasured: 'Not measured',
        smoking: 'SMOKING',
        nonSmoker: 'Non-smoker',
        findrisc: 'FINDRISC SCORE',
        findriscCalc: 'Calculated',
        genomics: 'GENOMICS',
        genomicsNotRequired: 'Not required'
      },
      status: {
        validated: 'Validated',
        invited: 'Invited',
        reminded: 'Reminded',
        booked: 'Booked',
        attended: 'Attended',
        noShow: 'No-show',
        declined: 'Declined',
        completed: 'Completed'
      }
    },
    engagement: {
      headerTitle: 'Culturally Adapted Engagement & Informed Choice',
      headerDesc: 'MediSense respects family autonomy: concise bilingual decision aids, granular 5-purpose consent toggles, and immediate reminder cancellation upon refusal without any healthcare access penalty.',
      decisionAidsTitle: 'Decision Aid (3 to 5 clear sentences)',
      consentPurposesTitle: 'Granular 5-Purpose Consent Management',
      refusalNotice: 'Refusal recorded: Automated reminders cancelled immediately. No penalty on routine care access.',
      topics: {
        fit: 'FIT Screening',
        wcv: 'Well-Child Visit',
        diabetes: 'Diabetes Checkup'
      },
      fitText: {
        title: 'Colorectal Cancer Screening (FIT Test):',
        p1: 'This simple test checks for invisible traces of blood in the stool and is completed at home in just minutes.',
        p2: 'It detects early pre-cancerous polyps before they turn into severe illness.',
        p3: 'A positive test does not mean cancer, but indicates a follow-up assessment is needed.',
        disclaimer: 'You have the full right to accept, postpone, or decline without any penalty to your medical care.'
      },
      wcvText: {
        title: 'Well-Child Health Assessment (18 months):',
        p1: 'This visit monitors your child’s physical growth, hearing, vision, and psychomotor developmental milestones.',
        p2: 'It includes early anemia screening and social-communication milestones per DoH guidelines.',
        p3: 'It ensures essential immunization boosters are up to date to protect your child and community.',
        disclaimer: 'This checkup is fully covered and free of charge in authorized community healthcare centers.'
      },
      diabetesText: {
        title: 'Comprehensive Metabolic & Diabetes Screening (IFHAS):',
        p1: 'Recommended for early detection of pre-diabetes and silent cardiovascular risk factors.',
        p2: 'A simple fasting blood test (glucose and HbA1c) enables timely lifestyle and medical adjustments before complications arise.',
        disclaimer: 'You remain in full control of your schedule and can consult your primary physician at any time.'
      }
    },
    safeguards: {
      headerTitle: 'Public Health Safeguards & Equity',
      headerDesc: 'Strict small-cell masking (n < 10), Wilson 95% confidence intervals, and cultural equity alerts C1–C4.',
      antiReidBadge: 'Anti-Reidentification',
      antiReidSub: 'Primary & secondary suppression active',
      alertC3Title: 'Adoption Disparity Alert (Rule C3)',
      alertC3Badge: 'YELLOW',
      alertC3Desc: 'South Asian Segment: Adoption rate (64.2% [63.2% – 65.2%]) is >10 points lower than the overall mean (74.8%), with disjoint Wilson confidence intervals.',
      alertC3Action: '→ Action: Tailor reminders in Urdu/Hindi and establish evening outreach clinic slots for shift workers.',
      alertC1Title: 'Under-Covered Geographic Zone Alert (Rule C1)',
      alertC1Badge: 'ORANGE',
      alertC1Desc: 'Al Dhafra Region: Upper bound of reach interval (73.9%) remains below program target (85%). Mean travel time > 30 minutes.',
      alertC1Action: '→ Action: Deploy itinerant mobile screening clinic with local community healthcare workers.',
      filters: {
        title: 'Analysis Dimension:',
        all: 'All Segments',
        nationality: 'By Nationality',
        region: 'By Geographic Region'
      },
      columns: {
        segment: 'Population Segment',
        eligible: 'Eligible Population',
        reach: 'Reach [Wilson 95%]',
        recommendation: 'Recomm. Rate',
        adoption: 'Adoption Rate',
        falsePositives: 'False Positives',
        falseNegatives: 'False Negatives',
        status: 'Safeguard Status'
      },
      maskedText: 'Masked (n < 10)',
      confirmedWilson: 'CONFIRMED WILSON',
      antiReidStatus: 'ANTI-REIDENTIFICATION',
      methodologyTitle: 'Masking Methodology Disclosure (CDC §7.3):',
      methodologyDesc: 'Any cell with a count strictly below 10 is systematically suppressed (primary suppression) to protect statistical confidentiality. A complementary cell on the same row or column is also suppressed (secondary suppression) to prevent mathematical recalculation.'
    },
    benchmark: {
      headerTitle: 'Benchmark & Evaluation on 50,000 Synthetic Profiles',
      headerDesc: 'Experimental pipeline validation on a representative Abu Dhabi synthetic cohort demonstrating a x4.02 yield gain without disparity.',
      badge: 'CDC §8 • 50,000 profiles',
      sub: 'Comparison at equal clinic capacity (65 slots / day)',
      integrityTitle: 'Scientific Integrity Clause (CDC §8.4)',
      integrityDesc: 'The metrics presented here validate algorithmic pipeline execution and safety guard triggers on synthetic data. They do not constitute real-world clinical validation, which will occur during the post-competition Abu Dhabi pilot.',
      kpi: {
        yieldGain: 'Yield Gain',
        yieldGainSub: 'High-risk cases detected vs age-only baseline',
        falseNegAvoided: 'False Negatives Avoided',
        falseNegSub: 'Active identification of silent care gaps',
        zeroDose: 'Zero-Dose Resolved',
        zeroDoseSub: 'Children without any vaccine directed to clinic',
        gapDetection: 'Gap Detection Rate',
        gapDetectionSub: 'DoH guideline adherence rate'
      },
      table: {
        title: 'Algorithmic Yield Benchmark Table (Fixed Clinic Capacity)',
        metricCol: 'Public Health Indicator',
        medisenseCol: 'MediSense (Precision)',
        baselineCol: 'Age & Sex Baseline',
        deltaCol: 'Differential / Gain'
      }
    },
    footer: {
      disclaimerTitle: 'Mandatory Legal Medical Disclaimer:',
      disclaimerText: '“MediBenin is a clinical decision-support and triage tool. It does not replace an in-person medical consultation and does not establish a definitive diagnosis. In case of respiratory distress, seizure, or loss of consciousness, immediately call emergency medical services or proceed to the nearest healthcare facility.”',
      brandTagline: '“Healthcare is a right, not an urban privilege.”',
      brandMission: 'Designed to bridge healthcare deserts in West Africa through multilingual speech AI tailored to local realities.',
      complianceTitle: 'Digital Compliance & APDP',
      complianceLaw: '• Law No. 2017-20 on the Digital Code in Benin',
      complianceEncryption: '• Strong health data encryption (AES-256)',
      compliancePseudonymization: '• Full pseudonymization of patient records',
      complianceDhis2: '• DHIS2 healthcare interoperability standards',
      challengeTitle: 'Future Health Challenge 2026',
      challengeTopic: 'Challenge 04: Precision Prevention & Screening.',
      challengeOrg: 'Mohamed bin Zayed University of Artificial Intelligence (MBZUAI) • Abu Dhabi, UAE.',
      copyright: '© 2026 MediBenin • CareX. All rights reserved.',
      developedWith: 'Developed with',
      forBenin: 'for Benin'
    },
    historicToggle: {
      switchToHistoric: 'Switch to initial academic baseline (Acute Symptom Triage)',
      backToMediSense: '← Return to MediSense (Challenge 04 Abu Dhabi • Precision Prevention)'
    }
  }
};
