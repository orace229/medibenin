import {
  ClinicianPatientDetail,
  ClinicianPatientListItem,
  ConsentState,
  Locale,
} from './types.ts';

const AUTH_TOKEN_STORAGE_KEY = 'medisense.authToken';

function restoreStoredAuthToken(): string {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

let currentAuthToken = restoreStoredAuthToken();

export function setApiAuthToken(token: string) {
  currentAuthToken = token;
  try {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    /* storage unavailable — token kept in memory only */
  }
}

export function getApiAuthToken() {
  return currentAuthToken;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${currentAuthToken}`,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const apiClient = {
  getGovernanceStatus: () => apiFetch<any>('/api/governance/status'),

  getDemoCounts: () => apiFetch<{ cohortSize: number; panelSize: number; story: string }>('/api/demo/counts'),

  runAcceptanceSuite: () => apiFetch<any>('/api/governance/acceptance-tests'),

  getMe: () => apiFetch<{ user: any }>('/api/auth/me'),

  requestAccess: (payload: {
    fullName: string;
    professionalEmail: string;
    profession: string;
    facility: string;
    licenseNumber: string;
    preferredLanguage: Locale;
  }) =>
    apiFetch<{ status: string; message: string }>('/api/auth/request-access', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Clinician Screen 2 endpoints (Strictly free of S_prio and M1)
  listPatients: (filters?: { level?: string; pathway?: string; state?: string }) => {
    const params = new URLSearchParams();
    if (filters?.level) params.set('level', filters.level);
    if (filters?.pathway) params.set('pathway', filters.pathway);
    if (filters?.state) params.set('state', filters.state);
    return apiFetch<{ patients: ClinicianPatientListItem[] }>(
      `/api/clinician/patients?${params.toString()}`
    );
  },

  getPatient: (id: string) =>
    apiFetch<{ patient: ClinicianPatientDetail }>(`/api/clinician/patients/${id}`),

  runEvaluation: (id: string) =>
    apiFetch<any>(`/api/clinician/patients/${id}/evaluate`, { method: 'POST' }),

  submitMissingData: (
    id: string,
    payload: {
      systolicBp?: number;
      diastolicBp?: number;
      systolicBp1?: number;
      diastolicBp1?: number;
      systolicBp2?: number;
      diastolicBp2?: number;
      systolicBp3?: number;
      diastolicBp3?: number;
      weightKg?: number;
      heightCm?: number;
      hemoglobinGdl?: number;
      hba1cPercent?: number;
    }
  ) =>
    apiFetch<any>(`/api/clinician/patients/${id}/missing-data`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzePatient: (payload: Record<string, any>) =>
    apiFetch<{ status: string; patient: ClinicianPatientDetail }>(
      '/api/clinician/analyze-patient',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  generateSummary: (id: string) =>
    apiFetch<{ label: string; summaryText: string; generatedAt: string }>(
      `/api/clinician/patients/${id}/summary`,
      { method: 'POST' }
    ),

  actOnRecommendation: (id: string, action: 'validate' | 'adapt' | 'defer', reason?: string) =>
    apiFetch<any>(`/api/clinician/patients/${id}/pathway-action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),

  previewInvitation: (id: string, language?: Locale, customBodyText?: string) =>
    apiFetch<{ preview: any }>(`/api/clinician/patients/${id}/invitation`, {
      method: 'POST',
      body: JSON.stringify({ mode: 'preview', language, customBodyText }),
    }),

  sendInvitation: (id: string, language?: Locale, customBodyText?: string) =>
    apiFetch<any>(`/api/clinician/patients/${id}/invitation`, {
      method: 'POST',
      body: JSON.stringify({ mode: 'send', language, customBodyText }),
    }),

  confirmVisit: (id: string, referralCode: string) =>
    apiFetch<any>(`/api/clinician/patients/${id}/confirm-visit`, {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    }),

  recordConclusion: (id: string, payload: { conclusionStatus: string; conclusionNotes: string }) =>
    apiFetch<any>(`/api/clinician/patients/${id}/conclusion`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Patient & Parent endpoints
  getPatientPortalProfile: (id: string) =>
    apiFetch<any>(`/api/patient/profile/${id}`),

  submitSelfAssessment: (id: string, payload: Record<string, any>) =>
    apiFetch<any>(`/api/patient/profile/${id}/self-assessment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  respondToRecommendation: (
    id: string,
    responseType: 'confirm' | 'postpone' | 'refuse',
    newDate?: string
  ) =>
    apiFetch<any>(`/api/patient/profile/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ responseType, newDate }),
    }),

  updateConsents: (id: string, payload: ConsentState) =>
    apiFetch<{ consents: ConsentState }>(`/api/patient/profile/${id}/consents`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updatePreferences: (
    id: string,
    payload: {
      preferredLanguage: Locale;
      preferredChannel: string;
      preferFemalePractitioner: boolean;
    }
  ) =>
    apiFetch<any>(`/api/patient/profile/${id}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Personalized screening planner & smart reminder assistant
  getScreeningPlan: (id: string, locale?: Locale) =>
    apiFetch<{ plan: any; evaluationPaused: boolean }>(
      `/api/patient/profile/${id}/screening-plan${locale ? `?locale=${locale}` : ''}`
    ),

  getReminderPlan: (id: string, locale?: Locale) =>
    apiFetch<{ plan: any }>(
      `/api/patient/profile/${id}/reminders${locale ? `?locale=${locale}` : ''}`
    ),

  scheduleScreening: (id: string, date: string) =>
    apiFetch<{ status: string; scheduledDate: string; plan: any }>(
      `/api/patient/profile/${id}/reminders/schedule`,
      { method: 'POST', body: JSON.stringify({ date }) }
    ),

  sendSmartReminder: (id: string, kind: 'upcoming' | 'missed') =>
    apiFetch<any>(`/api/patient/profile/${id}/reminders/send`, {
      method: 'POST',
      body: JSON.stringify({ kind }),
    }),

  // Family Affiliation, Parent DB Search, SMS OTP & 18y Majority Detachment
  searchParents: (query = '') =>
    apiFetch<{
      parents: Array<{
        id: string;
        displayName: string;
        ageYears: number;
        sex: string;
        region: string;
        facilityCenter: string;
      }>;
    }>(`/api/family/search-parents?q=${encodeURIComponent(query)}`),

  requestFamilySmsOtp: (parentId: string, childId: string) =>
    apiFetch<{
      status: string;
      childId: string;
      childName: string;
      maskedPhone: string;
      demoOtpCode: string;
      expiresInSeconds: number;
    }>('/api/patient/family/request-sms-otp', {
      method: 'POST',
      body: JSON.stringify({ parentId, childId }),
    }),

  verifyFamilySmsOtp: (parentId: string, childId: string, otpCode: string) =>
    apiFetch<{ status: string; childId: string }>('/api/patient/family/verify-sms-otp', {
      method: 'POST',
      body: JSON.stringify({ parentId, childId, otpCode }),
    }),

  requestMajorityDetachment: (childId: string) =>
    apiFetch<{ status: string; message: string }>(
      '/api/patient/family/request-majority-detachment',
      {
        method: 'POST',
        body: JSON.stringify({ childId }),
      }
    ),

  getPendingMajorityDetachments: () =>
    apiFetch<{
      affiliatedRecords: Array<{
        childId: string;
        childName: string;
        ageYears: number;
        ageMonths: number;
        pathwayType: string;
        overallLevel: string;
        parentId: string;
        parentName: string;
        eligibleForMajority: boolean;
        majorityDetachmentRequested: boolean;
      }>;
      pendingMajorityDetachments: Array<{
        childId: string;
        childName: string;
        ageYears: number;
        ageMonths: number;
        pathwayType: string;
        overallLevel: string;
        parentId: string;
        parentName: string;
        eligibleForMajority: boolean;
        majorityDetachmentRequested: boolean;
      }>;
    }>('/api/family/pending-detachments'),

  approveMajorityDetachment: (childId: string) =>
    apiFetch<{
      status: string;
      childId: string;
      newPathwayType: string;
      autonomousEmail: string;
    }>('/api/family/approve-majority-detachment', {
      method: 'POST',
      body: JSON.stringify({ childId }),
    }),

  // Coordinator Screen 1 & Public Health Observatory
  getCoordinatorQueue: () => apiFetch<any>('/api/coordinator/queue'),

  coordinatorOutreach: (
    patientId: string,
    action: 'call' | 'request_data' | 'request_validation' | 'clinical_review',
    note?: string
  ) =>
    apiFetch<{ status: string; action: string; label: string; loggedAt: string }>(
      `/api/coordinator/patients/${encodeURIComponent(patientId)}/outreach`,
      { method: 'POST', body: JSON.stringify({ action, note }) }
    ),

  simulateLogistics: (payload: Record<string, any>) =>
    apiFetch<any>('/api/coordinator/simulate-logistics', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getObservatorySummary: (seed = 20261120, scenario = 'baseline') =>
    apiFetch<any>(`/api/observatory/summary?seed=${seed}&scenario=${encodeURIComponent(scenario)}`),
};
