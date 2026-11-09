import { PersonaProfile } from '../types/medisense';

export const SYNTHETIC_PERSONAS: PersonaProfile[] = [
  // PERSONA 1 : Enfant de 18 mois (Abu Dhabi)
  {
    id: 'persona-1',
    syntheticId: 'SYN-WCV-018M',
    fullName: 'Zayd Al-Ketbi',
    ageYears: 1,
    ageMonths: 18,
    sex: 'M',
    nationalityGroup: 'Émirati',
    region: 'Abu Dhabi',
    preferredLanguage: 'Arabe',
    preferredChannel: 'WhatsApp',
    insuranceType: 'Thiqa',
    accessTimeToClinicMinutes: 15,
    clinicalData: {
      weightKg: 11.2,
      heightCm: 82.5,
      muacMm: 152, // Normal (> 125mm)
      lastWellChildVisitDate: '2026-05-10', // 12-month visit done, 18-month visit missed
      missedConsecutiveVisitsCount: 1,
      hemoglobinGdl: undefined, // Non fait
      mchatScore: 5, // 3 to 7 -> entretien de suivi
      asqScoreZone: 'Normal',
      missedVaccineDoses: ['DTCa-IPV-Hib rappel 18m'],
      isZeroDoseChild: false,
      familyHistory: ['Diabète type 2 (grand-mère maternelle)'],
    },
    signals: [
      {
        id: 'sig-p1-1',
        ruleId: 'P3',
        title: "Visite de l'enfant des 18 mois manquée (Well-Child Visit)",
        type: 'Soins manqués / en retard',
        level: 'Jaune',
        deadlineDays: 30,
        keyFactors: [
          'Âge 18 mois révolus sans visite DoH enregistrée',
          'Dépassement de la fenêtre recommandée de 42 jours',
          'Vaccin de rappel 18 mois non validé dans le registre'
        ],
        missingData: ["Validation clinique de l'étape de développement 18m"],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: {
            age: 'V',
            historique_visites: 'V',
            registre_vaccinal: 'V'
          },
          oldestDataMonths: 6,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Données extraites directement du registre pédiatrique DoH certifié.'
        },
        referenceDirective: 'Standard DoH DOH/WCV/SD (Pédiatrie préventive)',
        ruleStatus: 'Vérifié'
      },
      {
        id: 'sig-p1-2',
        ruleId: 'P5',
        title: "Dépistage de l'anémie infantile en retard",
        type: 'Soins manqués / en retard',
        level: 'Jaune',
        deadlineDays: 30,
        keyFactors: [
          'Fenêtre obligatoire DoH (12-24 mois) atteinte',
          'Aucun dosage d’hémoglobine capillaire ou veineux répertorié'
        ],
        missingData: ['Taux d’hémoglobine (g/dL)'],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { carnet_biologique: 'V' },
          oldestDataMonths: 6,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Absence formelle d’analyse biologique dans le carnet de santé.'
        },
        referenceDirective: 'Directive DoH / Recommandation OMS anémie du jeune enfant',
        ruleStatus: 'Vérifié'
      },
      {
        id: 'sig-p1-3',
        ruleId: 'P6',
        title: 'Dépistage autisme M-CHAT-R (Score 5 : Risque modéré)',
        type: 'Risque élevé',
        level: 'Jaune',
        deadlineDays: 21,
        keyFactors: [
          'Score M-CHAT-R = 5 (seuil de vigilance 3 à 7)',
          'Pointage sur le pointage du doigt et l’imitation sociale',
          'Nécessite impérativement l’algorithme d’Entretien de Suivi (Follow-Up)'
        ],
        missingData: ['Entretien de suivi M-CHAT-R/F par soignant'],
        certainty: {
          level: 'Moyenne',
          completenessPercent: 90,
          provenances: { questionnaire_parent: 'D' },
          oldestDataMonths: 1,
          domainValidity: true,
          isActionConfirmRequired: true,
          explanation: 'Questionnaire déclaré par le parent : entretien clinique de confirmation nécessaire.'
        },
        referenceDirective: 'Grille validée M-CHAT-R/F (Robins et al.)',
        ruleStatus: 'Protocole clinique validé'
      }
    ],
    carePlan: [
      {
        id: 'act-p1-1',
        ruleId: 'P3+P4+P5+P6',
        actionTitle: "Visite pédiatrique complète unifiée des 18 mois (WCV + Anémie + M-CHAT Suivi + Rappel vaccinal)",
        category: 'Visite enfant',
        recommendedWindowDays: 21,
        targetFacility: 'Centre de Santé Al Bateen (Abu Dhabi)',
        orientationCode: 'MS-ZAYD18',
        currentState: 'Validee',
        remindersCount: 1,
        lastUpdated: '2026-11-08'
      }
    ],
    priorityScore: 58,
    priorityComponents: {
      riskIndex: 0.35, // Jaune
      gapIndex: 0.67,  // 2 lacunes
      delayIndex: 0.23, // 42j / 180j
      vulnIndex: 0.0   // Proche et assuré
    },
    consent: {
      evaluationCalendar: true,
      channelReminders: true,
      transmissionToFacility: true,
      anonymousAggregatedStats: true,
      genomicExistingUse: false
    },
    dataUsageLogs: [
      {
        timestamp: '2026-11-08T09:14:22Z',
        ruleId: 'P3',
        dataCategoriesRead: ['Date de naissance', 'Historique des visites WCV'],
        purpose: 'Vérification calendrier visites de l’enfant',
        recipient: 'Centre de Santé Al Bateen'
      },
      {
        timestamp: '2026-11-08T09:14:23Z',
        ruleId: 'P6',
        dataCategoriesRead: ['Réponses questionnaire M-CHAT-R'],
        purpose: 'Évaluation risque développemental',
        recipient: 'Coordinateur pédiatrique'
      }
    ]
  },

  // PERSONA 2 : Adolescente de 14 ans (Al Ain)
  {
    id: 'persona-2',
    syntheticId: 'SYN-ADO-014F',
    fullName: 'Mariam Al-Zaabi',
    ageYears: 14,
    ageMonths: 172,
    sex: 'F',
    nationalityGroup: 'Émirati',
    region: 'Al Ain',
    preferredLanguage: 'Arabe',
    preferredChannel: 'SMS',
    insuranceType: 'Thiqa',
    accessTimeToClinicMinutes: 20,
    clinicalData: {
      weightKg: 68.5,
      heightCm: 156,
      bmi: 28.15, // Z-score OMS 2007 : +2.3 (Obésité modérée)
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 76,
      bloodPressureProvenance: 'M',
      bmiProvenance: 'M',
      familyHistory: [
        'Père : infarctus du myocarde précoce à 42 ans',
        'Suspicion d’hypercholestérolémie familiale au 1er degré'
      ],
      missedVaccineDoses: ['Vaccin HPV dose 2 (Santé scolaire)'],
      lastAdultCheckupDate: undefined
    },
    signals: [
      {
        id: 'sig-p2-1',
        ruleId: 'P10',
        title: "Suspicion d’hypercholestérolémie familiale (Voie d’accélération sans génomique)",
        type: 'Risque élevé',
        level: 'Orange',
        deadlineDays: 14,
        keyFactors: [
          'Antécédent familial au 1er degré d’accident coronarien précoce (< 55 ans chez le père)',
          'Aucun bilan lipidique pédiatrique réalisé à ce jour',
          'Accélération clinique activée indépendamment de tout test génétique'
        ],
        missingData: ['Bilan lipidique complet à jeun (LDL-C, HDL-C, Triglycérides)'],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: {
            antecedent_paternel: 'V',
            dossier_famille: 'V'
          },
          oldestDataMonths: 3,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Antécédent vérifié dans le dossier médical familial de l’établissement.'
        },
        referenceDirective: 'Consensus pédiatrique international sur l’hypercholestérolémie familiale',
        ruleStatus: 'Publié [Vérifié V6]'
      },
      {
        id: 'sig-p2-2',
        ruleId: 'P8',
        title: 'Surveillance pondérale adolescente (IMC Z-score > +2)',
        type: 'Risque élevé',
        level: 'Orange',
        deadlineDays: 30,
        keyFactors: [
          'IMC 28,15 kg/m² correspondant à un Z-score OMS 2007 de +2,3',
          'Percentile > 98e pour l’âge et le sexe',
          'Facteur multiplicateur de risque cardiométabolique'
        ],
        missingData: ['Activité physique hebdomadaire structurée'],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { poids_taille: 'M' },
          oldestDataMonths: 1,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Mesures anthropométriques récentes prises en milieu scolaire.'
        },
        referenceDirective: 'Standards de croissance OMS 2007 (5-19 ans)',
        ruleStatus: 'Publié'
      },
      {
        id: 'sig-p2-3',
        ruleId: 'P11',
        title: 'Vaccin HPV de l’adolescence non complété',
        type: 'Soins manqués',
        level: 'Jaune',
        deadlineDays: 60,
        keyFactors: [
          'Dose 2 du vaccin anti-HPV manquante dans le registre scolaire',
          'Retard de 75 jours par rapport au calendrier recommandé'
        ],
        missingData: [],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { registre_vaccinal: 'V' },
          oldestDataMonths: 2,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Vérifié dans le carnet de vaccination national informatisé.'
        },
        referenceDirective: 'Programme national de santé scolaire des ÉAU',
        ruleStatus: 'Vérifié'
      }
    ],
    carePlan: [
      {
        id: 'act-p2-1',
        ruleId: 'P10+P8+P11',
        actionTitle: 'Bilan de santé de l’adolescent (Lipides à jeun + Rattrapage HPV + Conseil nutrition)',
        category: 'Consultation spécialisée',
        recommendedWindowDays: 14,
        targetFacility: 'Centre de Santé Ambulatoire Al Hili (Al Ain)',
        orientationCode: 'MS-MAR14A',
        currentState: 'Invitee',
        remindersCount: 1,
        lastUpdated: '2026-11-07'
      }
    ],
    priorityScore: 67,
    priorityComponents: {
      riskIndex: 0.75, // Orange (P10)
      gapIndex: 0.67,  // 2 lacunes
      delayIndex: 0.42, // 75j retard HPV
      vulnIndex: 0.0
    },
    consent: {
      evaluationCalendar: true,
      channelReminders: true,
      transmissionToFacility: true,
      anonymousAggregatedStats: true,
      genomicExistingUse: false
    },
    dataUsageLogs: [
      {
        timestamp: '2026-11-07T11:20:15Z',
        ruleId: 'P10',
        dataCategoriesRead: ['Antécédents cardiovasculaires familiaux'],
        purpose: 'Calcul de risque précoce sans génomique',
        recipient: 'Centre de Santé Al Hili'
      }
    ]
  },

  // PERSONA 3 : Adulte de 36 ans d'origine Asie du Sud (Al Dhafra)
  {
    id: 'persona-3',
    syntheticId: 'SYN-ADU-036M',
    fullName: 'Rajesh Patel',
    ageYears: 36,
    ageMonths: 432,
    sex: 'M',
    nationalityGroup: 'Asie du Sud',
    region: 'Al Dhafra',
    preferredLanguage: 'Anglais',
    preferredChannel: 'SMS',
    insuranceType: 'Basic',
    accessTimeToClinicMinutes: 35, // Zone éloignée
    clinicalData: {
      bloodPressureSystolic: 136,
      bloodPressureDiastolic: 88,
      bloodPressureProvenance: 'M', // Moyenne des 2e et 3e mesures
      weightKg: 73,
      heightCm: 174,
      bmi: 24.11, // Surpoids pour population asiatique (seuil >= 23)
      bmiProvenance: 'M',
      waistCircumferenceCm: 92, // Seuil asiatique masculin >= 90 cm
      smokingStatus: 'Fumeur cigarette', // 10 cig/j déclaré
      familyHistory: ['Diabète type 2 (père et oncle maternel)'],
      findriscScore: 15, // >= 15 -> Risque élevé de diabète (Orange)
      lastAdultCheckupDate: undefined, // Aucun bilan depuis son arrivée il y a 4 ans
      genomicScorePercentile: 94 // Signal génomique simulé (G1)
    },
    signals: [
      {
        id: 'sig-p3-1',
        ruleId: 'A3',
        title: 'Risque élevé de diabète de type 2 (Score FINDRISC = 15)',
        type: 'Risque élevé',
        level: 'Orange',
        deadlineDays: 14,
        keyFactors: [
          'Score FINDRISC calculé à 15 points (Seuil d’alerte >= 15)',
          'Antécédents familiaux de diabète au 1er degré (+5 pts)',
          'Tour de taille 92 cm supérieur au seuil cardiométabolique sud-asiatique (90 cm)'
        ],
        missingData: ['Dosage HbA1c récent', 'Glycémie à jeun'],
        certainty: {
          level: 'Moyenne',
          completenessPercent: 88,
          provenances: {
            mesure_tension: 'M',
            imc_tour_taille: 'M',
            tabagisme: 'D',
            antecedents: 'D'
          },
          oldestDataMonths: 14,
          domainValidity: true,
          isActionConfirmRequired: true,
          explanation: 'Certaine ancienneté des déclarations sur le mode de vie : confirmation biologique requise.'
        },
        referenceDirective: 'Lindström & Tuomilehto (FINDRISC validé) / ADA Clinical Guidelines',
        ruleStatus: 'Publié'
      },
      {
        id: 'sig-p3-2',
        ruleId: 'A4',
        title: 'Dépistage glycémique ciblé (Origine Asie du Sud & IMC >= 23)',
        type: 'Risque élevé',
        level: 'Jaune',
        deadlineDays: 30,
        keyFactors: [
          'Origine Asie du Sud avec IMC à 24,1 kg/m² (seuil de vigilance OMS Asie = 23)',
          'Absence de tout contrôle glycémique documenté depuis plus de 3 ans'
        ],
        missingData: [],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { imc: 'M', origine: 'D' },
          oldestDataMonths: 2,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Règle d’équité ethnoculturelle recommandée par l’OMS et l’ADA.'
        },
        referenceDirective: 'Seuils OMS Asie 2004 / Directive dépistage ADA',
        ruleStatus: 'Publié'
      },
      {
        id: 'sig-p3-3',
        ruleId: 'A1',
        title: 'Tension artérielle en zone de vigilance (136/88 mmHg)',
        type: 'Risque élevé',
        level: 'Jaune',
        deadlineDays: 30,
        keyFactors: [
          'Moyenne des 2e et 3e mesures de repos à 136/88 mmHg',
          'Présystolique HEARTS (systolique 130-139 ou diastolique 85-89 mmHg)'
        ],
        missingData: [],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { protocole_mesure: 'M' },
          oldestDataMonths: 1,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Protocole standardisé de 3 mesures consécutives respecté.'
        },
        referenceDirective: 'Protocole OMS HEARTS (Gestion de l’hypertension)',
        ruleStatus: 'Publié'
      },
      {
        id: 'sig-p3-4',
        ruleId: 'G1',
        title: 'Signal génomique : Score polygénique au 94e percentile [SIMULÉ]',
        type: 'Risque élevé',
        level: 'Orange',
        deadlineDays: 14,
        keyFactors: [
          'Score polygénique coronarien / diabète >= 90e percentile',
          'Avancement de l’éligibilité au bilan complet (lipides + HbA1c)',
          'Rappel d’intégrité : Le modèle OMS reste non modifié (calibrable)'
        ],
        missingData: [],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { fhir_genomics: 'S' },
          oldestDataMonths: 1,
          domainValidity: true,
          isActionConfirmRequired: false,
          explanation: 'Simulation conforme au guide HL7 Genomics Reporting (donnée synthétique déclarée).'
        },
        referenceDirective: 'Règle de politique d’accès génomique MediSense G1',
        ruleStatus: 'Simulé [Conforme CDC §4.8]'
      },
      {
        id: 'sig-p3-5',
        ruleId: 'A2-NOTE',
        title: 'Modèle cardiovasculaire OMS 2019 : Hors domaine d’application',
        type: 'Suivi interrompu',
        level: 'Gris',
        deadlineDays: 90,
        keyFactors: [
          'Âge de 36 ans : le modèle OMS 2019 est formellement restreint aux 40-80 ans',
          'Affichage désactivé pour éviter tout résultat trompeur',
          'La décision repose sur la tension, le FINDRISC et le signal G1'
        ],
        missingData: [],
        certainty: {
          level: 'Haute',
          completenessPercent: 100,
          provenances: { date_naissance: 'V' },
          oldestDataMonths: 1,
          domainValidity: false,
          domainNote: 'Âge < 40 ans (hors domaine OMS 2019)',
          isActionConfirmRequired: false,
          explanation: 'Garde-fou méthodologique actif : refus de projeter un risque probabiliste non calibré.'
        },
        referenceDirective: 'Modèle OMS CVD 2019 (Lancet Global Health)',
        ruleStatus: 'Publié'
      }
    ],
    carePlan: [
      {
        id: 'act-p3-1',
        ruleId: 'A3+A4+G1',
        actionTitle: 'Bilan de dépistage cardiométabolique complet (HbA1c + Bilan lipidique + Contrôle tensionnel)',
        category: 'Dépistage adulte',
        recommendedWindowDays: 14,
        targetFacility: 'Centre de Santé de Madinat Zayed (Al Dhafra)',
        orientationCode: 'MS-RAJ36P',
        currentState: 'Planifiee',
        remindersCount: 0,
        lastUpdated: '2026-11-08'
      }
    ],
    priorityScore: 74,
    priorityComponents: {
      riskIndex: 0.75, // Orange (A3, G1)
      gapIndex: 1.0,   // 3 lacunes ouvertes (FINDRISC, HbA1c, IFHAS)
      delayIndex: 0.50, // Retard important
      vulnIndex: 0.67  // Temps accès > 30 min + zone éloignée Al Dhafra
    },
    consent: {
      evaluationCalendar: true,
      channelReminders: true,
      transmissionToFacility: true,
      anonymousAggregatedStats: true,
      genomicExistingUse: true
    },
    dataUsageLogs: [
      {
        timestamp: '2026-11-08T14:02:11Z',
        ruleId: 'A3',
        dataCategoriesRead: ['Taille', 'Poids', 'Tour de taille', 'Antécédents familiaux'],
        purpose: 'Calcul du score FINDRISC de risque de diabète',
        recipient: 'Centre de Santé Madinat Zayed'
      },
      {
        timestamp: '2026-11-08T14:02:12Z',
        ruleId: 'G1',
        dataCategoriesRead: ['Percentile de score polygénique autorisé'],
        purpose: 'Vérification critère d’avancement bilan précoce',
        recipient: 'Serveur de coordination MediSense'
      }
    ]
  }
];
