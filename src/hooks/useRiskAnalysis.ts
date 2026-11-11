import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api.ts';
import {
  BackendClinicalCalculations,
  Certainty,
  Level,
} from '../lib/types.ts';

export interface RiskAssessmentResult {
  patientId: string;
  overallLevel: Level;
  overallCertainty: Certainty;
  calculations: BackendClinicalCalculations;
  ruleVersion: string;
  evaluatedAt: string;
}

export interface PatientRiskInputPayload {
  systolicBp1?: string | number;
  diastolicBp1?: string | number;
  systolicBp2?: string | number;
  diastolicBp2?: string | number;
  systolicBp3?: string | number;
  diastolicBp3?: string | number;
  weightKg?: string | number;
  heightCm?: string | number;
  waistCm?: string | number;
  dailyPhysicalActivity?: boolean;
  dailyFruitsVeg?: boolean;
  smokingStatus?: boolean;
  antihypertensiveMedHistory?: boolean;
  highBloodGlucoseHistory?: boolean;
  familyHistoryDiabetesLevel?: string;
  familyPrematureCvd?: boolean;
  isPregnant?: boolean;
  mchatScore?: string | number;
  redFlagWarningSymptom?: boolean;
  redFlagSymptomLabel?: string;
  [key: string]: any;
}

/**
 * Analytical Service wrapper that communicates with the MediSense backend
 * calculation engine (WHO 2019 CVD, 8-item FINDRISC, 2/3-reading BP protocol,
 * WHO pediatric Z-scores, and signed Abu Dhabi WCV/IFHAS v8 rules).
 */
export const analyticalService = {
  async evaluatePatientSelfAssessment(
    patientId: string,
    payload: PatientRiskInputPayload
  ): Promise<RiskAssessmentResult> {
    const res = await apiClient.submitSelfAssessment(patientId, payload);
    return {
      patientId,
      overallLevel: res.overallLevel,
      overallCertainty: res.overallCertainty,
      calculations: res.calculations,
      ruleVersion: 'ABU_DHABI_WCV_IFHAS_V8',
      evaluatedAt: new Date().toISOString(),
    };
  },

  async fetchPatientRiskProfile(patientId: string): Promise<{
    fullData: any;
    assessment: RiskAssessmentResult | null;
  }> {
    const res = await apiClient.getPatientPortalProfile(patientId);
    const profile = res?.profile;
    const assessment: RiskAssessmentResult | null =
      profile && profile.calculations
        ? {
            patientId: profile.id,
            overallLevel: profile.overallLevel,
            overallCertainty: profile.overallCertainty,
            calculations: profile.calculations,
            ruleVersion: 'ABU_DHABI_WCV_IFHAS_V8',
            evaluatedAt: new Date().toISOString(),
          }
        : null;

    return { fullData: res, assessment };
  },

  async evaluateClinicianPatient(
    payload: Record<string, any>
  ): Promise<RiskAssessmentResult> {
    const res = await apiClient.analyzePatient(payload);
    const p = res.patient;
    return {
      patientId: p.id,
      overallLevel: p.overallLevel,
      overallCertainty: p.overallCertainty,
      calculations: p.calculations!,
      ruleVersion: 'ABU_DHABI_WCV_IFHAS_V8',
      evaluatedAt: new Date().toISOString(),
    };
  },
};

export interface UseRiskAnalysisReturn {
  assessment: RiskAssessmentResult | null;
  loading: boolean;
  error: string | null;
  lastAnalyzedAt: string | null;
  triggerRiskAnalysis: (
    patientId: string,
    inputData: PatientRiskInputPayload
  ) => Promise<RiskAssessmentResult>;
  loadRiskProfile: (patientId: string) => Promise<any>;
  runClinicalWorkbenchAnalysis: (
    payload: Record<string, any>
  ) => Promise<RiskAssessmentResult>;
  syncAssessmentFromProfile: (profile: any) => void;
  clearError: () => void;
}

/**
 * Custom React hook `useRiskAnalysis` that consumes the MediSense analytical
 * service and manages loading, error, and calculated risk assessment state
 * for components such as `PatientPortal` and `ClinicianPortal`.
 */
export function useRiskAnalysis(
  initialAssessment: RiskAssessmentResult | null = null
): UseRiskAnalysisReturn {
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(
    initialAssessment
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);

  const syncAssessmentFromProfile = useCallback((profile: any) => {
    if (!profile || !profile.calculations) return;
    const nextAssessment: RiskAssessmentResult = {
      patientId: profile.id,
      overallLevel: profile.overallLevel,
      overallCertainty: profile.overallCertainty,
      calculations: profile.calculations,
      ruleVersion: 'ABU_DHABI_WCV_IFHAS_V8',
      evaluatedAt: new Date().toISOString(),
    };
    setAssessment(nextAssessment);
  }, []);

  const loadRiskProfile = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { fullData, assessment: fetchedAssessment } =
        await analyticalService.fetchPatientRiskProfile(patientId);
      if (fetchedAssessment) {
        setAssessment(fetchedAssessment);
        setLastAnalyzedAt(fetchedAssessment.evaluatedAt);
      }
      return fullData;
    } catch (err: any) {
      const message =
        err?.message || 'Unable to load preventive risk assessment.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerRiskAnalysis = useCallback(
    async (
      patientId: string,
      inputData: PatientRiskInputPayload
    ): Promise<RiskAssessmentResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyticalService.evaluatePatientSelfAssessment(
          patientId,
          inputData
        );
        setAssessment(result);
        setLastAnalyzedAt(result.evaluatedAt);
        return result;
      } catch (err: any) {
        const message =
          err?.message || 'Failed to execute preventive risk analysis.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const runClinicalWorkbenchAnalysis = useCallback(
    async (payload: Record<string, any>): Promise<RiskAssessmentResult> => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyticalService.evaluateClinicianPatient(payload);
        setAssessment(result);
        setLastAnalyzedAt(result.evaluatedAt);
        return result;
      } catch (err: any) {
        const message =
          err?.message || 'Failed to execute clinical workbench analysis.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    assessment,
    loading,
    error,
    lastAnalyzedAt,
    triggerRiskAnalysis,
    loadRiskProfile,
    runClinicalWorkbenchAnalysis,
    syncAssessmentFromProfile,
    clearError,
  };
}
