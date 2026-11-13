/**
 * AD-2 Architectural Principle:
 * Rules decide clinical levels; ML acts strictly on logistics.
 *
 * M1: Calibrated No-Show Probability Model (Screen 1 Coordinator ONLY).
 * M2: Constrained Message Adaptation & Clinical Summary Generator with strict exclusion lists.
 *
 * TEST-M1: M1 can NEVER lower a patient's priority or delay an invitation; it only strengthens support.
 * TEST-M2: No field from M1 ever appears in Clinician (Screen 2) API responses.
 * TEST-M3: M2 rejects any message containing forbidden clinical/diagnostic/genetic terms or missing variables.
 */

export interface M1LogisticsInput {
  overallLevel: 'red' | 'orange' | 'yellow' | 'green' | 'grey';
  openGapsCount: number;
  maxOverdueDays: number;
  accessTimeMinutes: number;
  languageNeedsSupport: boolean;
  residesInUnderservedZoneC1: boolean;
  contextConsentGiven: boolean;
  missedVisitsCount: number;
  preferredChannel: string;
  reminderRank: number;
}

export interface M1LogisticsOutput {
  priorityScoreSprio: number; // Strictly for Screen 1 sorting
  noShowProbability: number; // Calibrated probability [0.05 - 0.92]
  topLogisticsFactors: string[]; // 3 operational factors
  suggestedSupportAction: string;
}

/**
 * Computes S_prio (Section 5.3) and M1 Calibrated No-Show Probability (Section 19.3).
 * Sensitive attributes (nationality, religion, genomics, detailed health conditions) are EXCLUDED from M1.
 */
export function computeLogisticsAndM1(input: M1LogisticsInput): M1LogisticsOutput {
  // 1. S_prio = 100 * (0.40 * I_risque + 0.25 * I_lacune + 0.20 * I_retard + 0.15 * I_vuln)
  const iRisque =
    input.overallLevel === 'orange'
      ? 0.75
      : input.overallLevel === 'yellow'
      ? 0.35
      : 0;

  const iLacune = Math.min(1, input.openGapsCount / 3);
  const iRetard = Math.min(1, Math.max(0, input.maxOverdueDays) / 180);

  let iVuln = 0;
  if (input.contextConsentGiven) {
    const bAccess = input.accessTimeMinutes > 30 ? 1 : 0;
    const bLang = input.languageNeedsSupport ? 1 : 0;
    const bZone = input.residesInUnderservedZoneC1 ? 1 : 0;
    iVuln = (bAccess + bLang + bZone) / 3;
  }

  // TEST-M1: Vulnerability & M1 can ONLY increase priority or strengthen support
  const rawSprio = 100 * (0.4 * iRisque + 0.25 * iLacune + 0.2 * iRetard + 0.15 * iVuln);
  const priorityScoreSprio = Math.round(rawSprio * 10) / 10;

  // 2. M1 Calibrated Logistic Model (Platt-calibrated operational features only)
  let logit = -1.45;
  const factors: Array<{ label: string; weight: number }> = [];

  if (input.missedVisitsCount > 0) {
    const w = Math.min(1.3, input.missedVisitsCount * 0.55);
    logit += w;
    factors.push({ label: `${input.missedVisitsCount} prior missed appointment(s)`, weight: w });
  }

  if (input.accessTimeMinutes > 30) {
    const w = 0.65;
    logit += w;
    factors.push({ label: `Travel time to clinic (${input.accessTimeMinutes} min) — evening/mobile slot helpful`, weight: w });
  }

  if (input.reminderRank >= 1) {
    const w = 0.45 * input.reminderRank;
    logit += w;
    factors.push({ label: `Awaiting response after reminder #${input.reminderRank}`, weight: w });
  }

  if (input.languageNeedsSupport) {
    const w = 0.38;
    logit += w;
    factors.push({ label: 'Requires native-language outreach message', weight: w });
  }

  const prob = 1 / (1 + Math.exp(-logit));
  const calibratedProb = Math.round(Math.min(0.92, Math.max(0.06, prob)) * 100) / 100;

  const topLogisticsFactors = factors
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((f) => f.label);

  if (topLogisticsFactors.length === 0) {
    topLogisticsFactors.push('Regular attendance history and close proximity to health centre');
  }

  // TEST-M1: Never downgrades priority; only recommends stronger accompaniment
  let suggestedSupportAction = 'Standard message on preferred channel';
  if (input.overallLevel === 'orange' && calibratedProb >= 0.45) {
    suggestedSupportAction = 'Strengthened support: Coordinator phone outreach + flexible evening/weekend slot';
  } else if (calibratedProb >= 0.4) {
    suggestedSupportAction = 'Send translated audio/text reminder + offer transport or evening slot';
  }

  return {
    priorityScoreSprio,
    noShowProbability: calibratedProb,
    topLogisticsFactors,
    suggestedSupportAction,
  };
}

// Forbidden terms for M2 patient messages (Section 19.4 & Rule 7)
const M2_FORBIDDEN_PATIENT_TERMS = [
  'cancer',
  'tumor',
  'malignant',
  'diabetes diagnosis',
  'hypertension diagnosis',
  'pre-eclampsia',
  'polygenic',
  'brca',
  'percentile',
  'mutation',
  'genetic defect',
  'autism diagnosis',
  'score',
  's_prio',
  'findrisc',
];

/**
 * M2 Guardrail Validator (TEST-M3):
 * Verifies that any adapted invitation message preserves required placeholders
 * and contains zero diagnostic, score, or genetic terms.
 */
export function validateM2MessageSafety(
  messageText: string,
  requiredPlaceholders: string[] = []
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const lower = messageText.toLowerCase();

  for (const term of M2_FORBIDDEN_PATIENT_TERMS) {
    if (lower.includes(term)) {
      violations.push(`Forbidden clinical/genetic term detected: "${term}"`);
    }
  }

  for (const placeholder of requiredPlaceholders) {
    if (!messageText.includes(placeholder)) {
      violations.push(`Missing required variable: ${placeholder}`);
    }
  }

  if (messageText.length > 520) {
    violations.push('Message exceeds maximum readable length (520 characters)');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Generates a pre-approved, culturally adapted invitation message in EN, FR, or AR (Section 6 & 19.4).
 * Never exposes diagnoses, scores, or genetic mentions.
 */
export function generateCulturallyAdaptedInvitation(params: {
  language: 'en' | 'fr' | 'ar';
  recipientType: 'parent' | 'adolescent' | 'adult';
  patientDisplayName: string;
  facilityName: string;
  dueDate: string;
  preferFemalePractitioner: boolean;
}): {
  subject: string;
  bodyText: string;
  decisionAidText: string;
  safetyCheckPassed: boolean;
} {
  const { language, recipientType, patientDisplayName, facilityName, dueDate, preferFemalePractitioner } = params;

  if (language === 'ar') {
    const practitionerNote = preferFemalePractitioner
      ? 'تم أخذ تفضيلكم لطبيبة مختصة بعين الاعتبار.'
      : '';
    const bodyText =
      recipientType === 'parent'
        ? `مرحباً. نقترح زيارة متابعة وقائية لطفلكم (${patientDisplayName}) في مركز ${facilityName} (${dueDate}). ${practitionerNote} يمكنكم تأكيد الموعد، أو اختيار تاريخ آخر، أو الاعتذار عن المشاركة بحرية تامة.`
        : `مرحباً ${patientDisplayName}. نقترح زيارة فحص وقائي دوري في مركز ${facilityName} (${dueDate}). ${practitionerNote} يمكنكم تأكيد الموعد، أو تأجيله لما بعد رمضان/المساء، أو رفض الدعوة دون أي تأثير على رعايتكم الصحية.`;

    const decisionAidText =
      'تهدف هذه الزيارة الوقائية إلى مراجعة المؤشرات الصحية العامة وتحديث الفحوصات الروتينية في موعد واحد. الفحص الوقائي يساعد على الاطمئنان المبكر، ونتائجه قد تتطلب أحياناً فحصاً تكميلياً بسيطاً للتأكد. مشاركتكم اختيارية بالكامل، وفي حال الرفض تتوقف الرسائل التذكيرية فوراً ويبقى حقكم في الرعاية محفوظاً.';

    const check = validateM2MessageSafety(bodyText);
    return {
      subject: 'دعوة لزيارة متابعة وقائية',
      bodyText,
      decisionAidText,
      safetyCheckPassed: check.valid,
    };
  }

  if (language === 'fr') {
    const practitionerNote = preferFemalePractitioner
      ? 'Votre préférence pour une praticienne a bien été prise en compte.'
      : '';
    const bodyText =
      recipientType === 'parent'
        ? `Bonjour. Une visite de suivi préventif est proposée pour votre enfant (${patientDisplayName}) au centre ${facilityName} (${dueDate}). ${practitionerNote} Vous pouvez confirmer ce créneau, demander une autre date ou refuser librement.`
        : `Bonjour ${patientDisplayName}. Un point de prévention personnalisé vous est proposé au centre ${facilityName} (${dueDate}). ${practitionerNote} Vous pouvez confirmer, reporter ou refuser sans aucune conséquence sur votre accès aux soins.`;

    const decisionAidText =
      "Cette visite regroupe vos vérifications préventives recommandées en un seul rendez-vous. Elle permet de faire le point tôt avec un professionnel de santé, même en l'absence de symptôme. Une mesure à recontrôler ne signifie pas une maladie, mais permet d'agir à temps. Vous êtes libre de refuser : les relances s'arrêtent alors immédiatement.";

    const check = validateM2MessageSafety(bodyText);
    return {
      subject: 'Proposition de visite de prévention',
      bodyText,
      decisionAidText,
      safetyCheckPassed: check.valid,
    };
  }

  const practitionerNote = preferFemalePractitioner
    ? 'Your preference for a female clinician has been noted.'
    : '';
  const bodyText =
    recipientType === 'parent'
      ? `Hello. A preventive well-child follow-up visit is suggested for ${patientDisplayName} at ${facilityName} (${dueDate}). ${practitionerNote} You may confirm, choose another date, or decline participation at any time.`
      : `Hello ${patientDisplayName}. A personalized preventive health check is suggested for you at ${facilityName} (${dueDate}). ${practitionerNote} You may confirm, reschedule to an evening slot, or decline with no impact on your access to care.`;

  const decisionAidText =
    'This visit brings together your recommended preventive checks in a single appointment. Preventive screening helps identify routine care needs early, though an initial check may occasionally require a simple follow-up measurement to confirm. Participation is always your choice: if you decline, reminders stop immediately and your access to care remains unchanged.';

  const check = validateM2MessageSafety(bodyText);
  return {
    subject: 'Preventive Care Visit Invitation',
    bodyText,
    decisionAidText,
    safetyCheckPassed: check.valid,
  };
}
