export type LocalLanguage = 'fon' | 'yor' | 'bba' | 'gun' | 'adj' | 'fra';

export interface LanguageInfo {
  code: LocalLanguage;
  name: string;
  localName: string;
  flag: string;
}

export type TriageUrgency = 'VERT' | 'ORANGE' | 'ROUGE';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  isRelative: boolean;
  phone: string;
  commune: string;
  departement: string;
  language: LocalLanguage;
}

export interface DangerSignsPCIME {
  cannotDrinkOrBreastfeed: boolean;
  vomitsEverything: boolean;
  convulsions: boolean;
  lethargicOrUnconscious: boolean;
}

export interface TriageResult {
  id: string;
  patientName: string;
  urgency: TriageUrgency;
  conditionName: string;
  icd10Code: string;
  adviceFrench: string;
  adviceLocalLanguage: string;
  recommendedFacility: string;
  xaiExplanation: string;
  ruleBasedOverride: boolean;
  timestamp: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'Hôpital' | 'Centre de Santé' | 'Pharmacie';
  commune: string;
  departement: string;
  distanceKm: number;
  phone: string;
  isOpen247: boolean;
  hasPediatricEmergency?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  languages: string[];
  feeFcfa: number;
  rating: number;
  isAvailable: boolean;
}

export interface AuditCase {
  id: string;
  patientInfo: string;
  reportedSymptoms: string;
  temperature?: number;
  urgency: TriageUrgency;
  shapSummary: string;
  date: string;
  isReviewed: boolean;
  isApproved?: boolean;
  notes?: string;
}
