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
  clinical: {
    backToPopulation: string;
    sprioForbiddenNotice: string;
    vitalsTitle: string;
    carePlanTitle: string;
    simulatorsTitle: string;
    growthChartTitle: string;
    qrModalTitle: string;
    levelGreyButton: string;
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
  };
  benchmark: {
    headerTitle: string;
    headerDesc: string;
    integrityTitle: string;
    integrityDesc: string;
    metrics: {
      yieldGain: string;
      falseNegativesAvoided: string;
      zeroDoseResolved: string;
      gapDetection: string;
    };
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
    clinical: {
      backToPopulation: 'Retour à la Priorisation Population',
      sprioForbiddenNotice: 'Fiche Clinique Individuelle • Écran 2 (Sprio exclu selon CDC §5.2)',
      vitalsTitle: 'Constantes & Données Biocliniques',
      carePlanTitle: 'Plan de Soins Personnalisé (CarePlan unifié)',
      simulatorsTitle: 'Simulateur Interactif de Risque & Facteurs Modifiables',
      growthChartTitle: 'Courbe de Croissance OMS 2006 (0 à 24 mois)',
      qrModalTitle: 'Pass Sanitaire de Prévention (QR Code sécurisé)',
      levelGreyButton: 'Activer / Tester le Niveau Gris'
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
      }
    },
    benchmark: {
      headerTitle: 'Banc d’Essai & Évaluation sur 50 000 Profils Synthétiques',
      headerDesc: 'Validation expérimentale sur une cohorte représentative d’Abu Dhabi démontrant un gain de rendement x4.02 sans biais d’exclusion.',
      integrityTitle: 'Clause d’Intégrité Scientifique (CDC §8.4)',
      integrityDesc: 'Les métriques présentées ici valident l’exécution du pipeline algorithmique et le déclenchement des garde-fous sur données synthétiques. Elles ne constituent pas une validation clinique en conditions réelles, laquelle sera menée lors de la phase pilote à Abu Dhabi.',
      metrics: {
        yieldGain: 'Gain de Rendement',
        falseNegativesAvoided: 'Faux Négatifs Évités',
        zeroDoseResolved: 'Zero-Dose Identifiés',
        gapDetection: 'Taux de Détection des Lacunes'
      }
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
    clinical: {
      backToPopulation: 'Back to Population Prioritization',
      sprioForbiddenNotice: 'Individual Clinical Record • Screen 2 (Sprio strictly forbidden per CDC §5.2)',
      vitalsTitle: 'Bioclinical Vitals & Signals',
      carePlanTitle: 'Personalized Unified CarePlan',
      simulatorsTitle: 'Interactive Risk Simulator & Modifiable Factors',
      growthChartTitle: 'WHO 2006 Pediatric Growth Chart (0-24m)',
      qrModalTitle: 'Health Prevention Pass (Secure QR Code)',
      levelGreyButton: 'Toggle / Test Level Grey Fallback'
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
      }
    },
    benchmark: {
      headerTitle: 'Benchmark & Evaluation on 50,000 Synthetic Profiles',
      headerDesc: 'Experimental pipeline validation on a representative Abu Dhabi synthetic cohort demonstrating a x4.02 yield gain without disparity.',
      integrityTitle: 'Scientific Integrity Clause (CDC §8.4)',
      integrityDesc: 'The metrics presented here validate algorithmic pipeline execution and safety guard triggers on synthetic data. They do not constitute real-world clinical validation, which will occur during the post-competition Abu Dhabi pilot.',
      metrics: {
        yieldGain: 'Yield Gain',
        falseNegativesAvoided: 'False Negatives Avoided',
        zeroDoseResolved: 'Zero-Dose Resolved',
        gapDetection: 'Gap Detection Rate'
      }
    }
  }
};
