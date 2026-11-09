export type SignalLevel = 'Rouge' | 'Orange' | 'Jaune' | 'Vert' | 'Gris';

export type ProvenanceCode = 'V' | 'M' | 'D' | 'S'; // Vérifiée, Mesurée, Déclarée, Simulée

export type CertaintyLevel = 'Haute' | 'Moyenne' | 'Faible';

export interface CertaintyBadge {
  level: CertaintyLevel;
  completenessPercent: number;
  provenances: Record<string, ProvenanceCode>;
  oldestDataMonths: number;
  domainValidity: boolean;
  domainNote?: string;
  riskIntervalStr?: string;
  isActionConfirmRequired: boolean;
  explanation: string;
}

export interface ClinicalSignal {
  id: string;
  ruleId: string;
  title: string;
  type: 'Risque élevé' | 'Soins manqués' | 'Soins en retard' | 'Soins manqués / en retard' | 'Suivi interrompu';
  level: SignalLevel;
  deadlineDays: number;
  keyFactors: string[]; // 1 to 3 counterfactual or contributing factors
  missingData: string[];
  certainty: CertaintyBadge;
  referenceDirective: string;
  ruleStatus: string;
}

export type FollowupState =
  | 'Creee'
  | 'Validee'
  | 'Invitee'
  | 'Planifiee'
  | 'Realisee'
  | 'Reportee'
  | 'Refusee'
  | 'EnRetard';

export interface CarePlanAction {
  id: string;
  ruleId: string;
  actionTitle: string;
  category: 'Visite enfant' | 'Dépistage adulte' | 'Vaccination' | 'Bilan biologique' | 'Consultation spécialisée';
  recommendedWindowDays: number;
  targetFacility: string;
  orientationCode: string; // 8-char HMAC code, e.g. MS-8F42K9
  currentState: FollowupState;
  remindersCount: number;
  lastUpdated: string;
}

export interface ConsentPurposes {
  evaluationCalendar: boolean;      // 1. Évaluation et calendrier de prévention
  channelReminders: boolean;        // 2. Rappels sur le canal choisi
  transmissionToFacility: boolean;  // 3. Transmission au centre de santé
  anonymousAggregatedStats: boolean;// 4. Statistiques agrégées anonymes
  genomicExistingUse: boolean;      // 5. Utilisation d'un résultat génomique autorisé
}

export interface PersonaProfile {
  id: string;
  syntheticId: string;
  fullName: string;
  ageYears: number;
  ageMonths: number;
  sex: 'M' | 'F';
  nationalityGroup: 'Émirati' | 'Asie du Sud' | 'Monde arabe hors ÉAU' | 'Asie du Sud-Est' | 'Autres';
  region: 'Abu Dhabi' | 'Al Ain' | 'Al Dhafra';
  preferredLanguage: 'Arabe' | 'Anglais' | 'Ourdou' | 'Hindi';
  preferredChannel: 'SMS' | 'WhatsApp' | 'Appel vocal';
  insuranceType: 'Thiqa' | 'Basic' | 'Enhanced' | 'En cours';
  accessTimeToClinicMinutes: number;
  
  // Biological / Clinical data
  clinicalData: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    bloodPressureProvenance?: ProvenanceCode;
    heartRateBpm?: number;
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    bmiProvenance?: ProvenanceCode;
    waistCircumferenceCm?: number;
    muacMm?: number; // Périmètre brachial pédiatrique
    hemoglobinGdl?: number;
    hba1cPercent?: number;
    isPregnant?: boolean;
    gestationalAgeWeeks?: number;
    gestationalAgeAtBirthWeeks?: number; // Pour calcul âge corrigé
    smokingStatus?: 'Non-fumeur' | 'Fumeur cigarette' | 'Medwakh/Dokha' | 'Chicha';
    familyHistory?: string[];
    knownChronicDiseases?: string[];
    lastWellChildVisitDate?: string;
    lastAdultCheckupDate?: string;
    missedConsecutiveVisitsCount?: number;
    missedVaccineDoses?: string[];
    isZeroDoseChild?: boolean;
    mchatScore?: number;
    asqScoreZone?: 'Normal' | 'Surveillance' | 'Sous seuil';
    findriscScore?: number;
    genomicScorePercentile?: number; // Génomique simulée
    genomicVariantActionable?: string;
  };

  signals: ClinicalSignal[];
  carePlan: CarePlanAction[];
  
  // Population Prioritization Score S_prio (USED ONLY BY COORDINATOR, NEVER DISPLAYED IN CLINICAL VIEW)
  priorityScore: number;
  priorityComponents: {
    riskIndex: number;   // I_risque (0.40)
    gapIndex: number;    // I_lacune (0.25)
    delayIndex: number;  // I_retard (0.20)
    vulnIndex: number;   // I_vuln (0.15)
  };

  consent: ConsentPurposes;
  dataUsageLogs: Array<{
    timestamp: string;
    ruleId: string;
    dataCategoriesRead: string[];
    purpose: string;
    recipient: string;
  }>;
}

export interface PopulationSegmentMetric {
  segmentKey: string;
  segmentLabel: string;
  eligiblePopulation: number;
  evaluatedComplete: number;
  dossiersGris: number;
  reachRate: number;
  reachWilson95: [number, number];
  recommendationRate: number;
  recommendationWilson95: [number, number];
  adoptionRate: number;
  adoptionWilson95: [number, number];
  falsePositiveRate: number;
  falseNegativeRate: number;
  isMasked: boolean;
  maskReason?: string;
}
