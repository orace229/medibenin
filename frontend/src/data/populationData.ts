import { PopulationSegmentMetric } from '../types/medisense';

export interface BenchmarkComparison {
  metricLabel: string;
  ageSexStandardApproach: string;
  mediSensePrecisionApproach: string;
  differenceGain: string;
  clinicalSignificance: string;
}

export const BENCHMARK_COMPARISONS: BenchmarkComparison[] = [
  {
    metricLabel: "Visites WCV de l'enfant comblées dans les délais",
    ageSexStandardApproach: "48.2% [46.8% – 49.6%]",
    mediSensePrecisionApproach: "79.4% [78.1% – 80.7%]",
    differenceGain: "+31.2 points",
    clinicalSignificance: "Réduction drastique des retards vaccinaux et détection précoce M-CHAT à 18 mois"
  },
  {
    metricLabel: "Rendement dépistage adulte (Cas confirmés / 100 invitations)",
    ageSexStandardApproach: "4.8 cas / 100",
    mediSensePrecisionApproach: "19.3 cas / 100",
    differenceGain: "x 4.02",
    clinicalSignificance: "Quadruplement des diagnostics précoces d’HTA et diabète méconnus à capacité égale K"
  },
  {
    metricLabel: "Taux de rattrapage des enfants zéro-dose (Règle C2)",
    ageSexStandardApproach: "14.1%",
    mediSensePrecisionApproach: "68.7%",
    differenceGain: "+54.6 points",
    clinicalSignificance: "Interventions ciblées sur les foyers communautaires sans disperser les moyens"
  },
  {
    metricLabel: "Taux de boucles fermées (Visite confirmée ou refus éclairé)",
    ageSexStandardApproach: "32.0%",
    mediSensePrecisionApproach: "84.5%",
    differenceGain: "+52.5 points",
    clinicalSignificance: "Traçabilité rigoureuse via code d'orientation sans dépendre de l'identité civile"
  },
  {
    metricLabel: "Sur-invitations inutiles (Faux positifs / rendez-vous à blanc)",
    ageSexStandardApproach: "58.4%",
    mediSensePrecisionApproach: "18.2%",
    differenceGain: "-40.2 points",
    clinicalSignificance: "Désengorgement des centres de santé d'Abu Dhabi et respect du temps soignant"
  }
];

export const POPULATION_SEGMENTS: PopulationSegmentMetric[] = [
  {
    segmentKey: 'nat-emirati',
    segmentLabel: 'Citoyens Émiratis',
    eligiblePopulation: 14200,
    evaluatedComplete: 12100,
    dossiersGris: 310,
    reachRate: 85.2,
    reachWilson95: [84.6, 85.8],
    recommendationRate: 31.4,
    recommendationWilson95: [30.6, 32.2],
    adoptionRate: 78.6,
    adoptionWilson95: [77.3, 79.9],
    falsePositiveRate: 11.2,
    falseNegativeRate: 3.1,
    isMasked: false
  },
  {
    segmentKey: 'nat-south-asia',
    segmentLabel: 'Résidents d’Asie du Sud',
    eligiblePopulation: 22500,
    evaluatedComplete: 17800,
    dossiersGris: 890,
    reachRate: 79.1,
    reachWilson95: [78.5, 79.7],
    recommendationRate: 46.8, // Plus élevé car règle A4 IMC >= 23 et prévalence FINDRISC
    recommendationWilson95: [46.1, 47.5],
    adoptionRate: 64.2, // Règle C3 : Alerte écart d'adoption (revoir langues et créneaux)
    adoptionWilson95: [63.2, 65.2],
    falsePositiveRate: 13.8,
    falseNegativeRate: 4.2,
    isMasked: false
  },
  {
    segmentKey: 'nat-arab-non-uae',
    segmentLabel: 'Monde arabe (hors ÉAU)',
    eligiblePopulation: 8300,
    evaluatedComplete: 6950,
    dossiersGris: 195,
    reachRate: 83.7,
    reachWilson95: [82.9, 84.5],
    recommendationRate: 34.1,
    recommendationWilson95: [33.0, 35.2],
    adoptionRate: 74.8,
    adoptionWilson95: [73.1, 76.5],
    falsePositiveRate: 12.0,
    falseNegativeRate: 3.4,
    isMasked: false
  },
  {
    segmentKey: 'reg-abu-dhabi',
    segmentLabel: 'Région métropolitaine d’Abu Dhabi',
    eligiblePopulation: 28000,
    evaluatedComplete: 23500,
    dossiersGris: 720,
    reachRate: 83.9,
    reachWilson95: [83.4, 84.4],
    recommendationRate: 38.2,
    recommendationWilson95: [37.6, 38.8],
    adoptionRate: 73.1,
    adoptionWilson95: [72.2, 74.0],
    falsePositiveRate: 12.1,
    falseNegativeRate: 3.6,
    isMasked: false
  },
  {
    segmentKey: 'reg-al-ain',
    segmentLabel: 'Région d’Al Ain',
    eligiblePopulation: 14500,
    evaluatedComplete: 11900,
    dossiersGris: 410,
    reachRate: 82.1,
    reachWilson95: [81.4, 82.8],
    recommendationRate: 39.4,
    recommendationWilson95: [38.5, 40.3],
    adoptionRate: 71.4,
    adoptionWilson95: [70.1, 72.7],
    falsePositiveRate: 12.8,
    falseNegativeRate: 3.9,
    isMasked: false
  },
  {
    segmentKey: 'reg-al-dhafra',
    segmentLabel: 'Région d’Al Dhafra (Sites distants)',
    eligiblePopulation: 7500,
    evaluatedComplete: 5450,
    dossiersGris: 265,
    reachRate: 72.7,
    reachWilson95: [71.5, 73.9],
    recommendationRate: 44.5,
    recommendationWilson95: [43.2, 45.8],
    adoptionRate: 61.3,
    adoptionWilson95: [59.4, 63.2],
    falsePositiveRate: 14.2,
    falseNegativeRate: 4.8,
    isMasked: false
  },
  // SEGMENT PARTICULIER POUR DÉMONSTRATION DU MASQUAGE CELLULE < 10 (CDC §7.3)
  {
    segmentKey: 'micro-segment-demo',
    segmentLabel: 'Micro-cohorte pilote isolée (Sila West)',
    eligiblePopulation: 8, // n < 10 -> DOIT ÊTRE MASQUÉ
    evaluatedComplete: 6,
    dossiersGris: 2,
    reachRate: 75.0,
    reachWilson95: [40.9, 92.9],
    recommendationRate: 50.0,
    recommendationWilson95: [18.8, 81.2],
    adoptionRate: 66.7,
    adoptionWilson95: [20.8, 93.9],
    falsePositiveRate: 0,
    falseNegativeRate: 0,
    isMasked: true,
    maskReason: 'Masqué (n < 10) : Protection de la vie privée et prévention de résultats trompeurs'
  }
];
