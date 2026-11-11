import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  RefreshCw,
  ClipboardPlus,
  Sparkles,
  CheckSquare,
  Send,
  QrCode,
  FileCheck,
  Download,
  ArrowLeft,
  LogOut,
  Users,
  AlertTriangle,
  HelpCircle,
  Clock,
  Dna,
  Calculator,
  Activity,
  HeartPulse,
  Baby,
  SlidersHorizontal,
  PlusCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '../lib/i18n.tsx';
import { apiClient } from '../lib/api.ts';
import {
  MediSenseLogo,
  DemoBanner,
  LanguageSwitch,
  LevelBadge,
  CertaintyBadge,
  StatusChip,
  StatCard,
  AiSuggestionPanel,
  GlassCard,
} from './MediSenseUI.tsx';
import {
  ClinicianPatientDetail,
  ClinicianPatientListItem,
  Locale,
  UserRole,
} from '../lib/types.ts';

interface ClinicianPortalProps {
  onLogout: () => void;
}

interface GuidedAnalysisFormState {
  patientId?: string;
  parentPatientId: string;
  displayName: string;
  pathwayType: 'child' | 'adolescent' | 'adult';
  ageYears: string;
  ageMonths: string;
  gestationalAgeWeeks: string;
  sex: string;
  nationalityGroup: string;
  region: string;
  facilityCenter: string;
  preferredLanguage: Locale;
  // BP Protocol (2 or 3 readings)
  systolicBp1: string;
  diastolicBp1: string;
  systolicBp2: string;
  diastolicBp2: string;
  systolicBp3: string;
  diastolicBp3: string;
  // Anthropometry
  weightKg: string;
  heightCm: string;
  waistCm: string;
  // Metabolic & FINDRISC 8 items
  smokingStatus: boolean;
  dailyPhysicalActivity: boolean;
  dailyFruitsVeg: boolean;
  antihypertensiveMedHistory: boolean;
  highBloodGlucoseHistory: boolean;
  familyHistoryDiabetesLevel: 'none' | 'second_degree' | 'first_degree';
  hba1cPercent: string;
  isPregnant: boolean;
  // Family & Cancer & Chronic
  familyPrematureCvd: boolean;
  familyBreastOrColorectalCancer: boolean;
  colorectalScreeningOverdueMonths: string;
  breastScreeningOverdueMonths: string;
  cervicalScreeningOverdueMonths: string;
  chronicFollowupInterruptedMonths: string;
  activeSpecialistFollowup: boolean;
  // Pediatric & Adolescent
  weightForAgeZ: string;
  heightForAgeZ: string;
  bmiForAgeZ: string;
  muacMm: string;
  mchatScore: string;
  hearingScreeningDone: boolean;
  visionScreeningDone: boolean;
  hemoglobinGdl: string;
  missedVaccineDoses: string;
  overdueMonthsWcv: string;
  phqAStatus: 'negative' | 'moderate' | 'severe';
  // Genomic & Emergency Escape E0
  existingGenomicResult: boolean;
  genomicDomain: 'none' | 'cvd' | 'diabetes' | 'oncology';
  redFlagWarningSymptom: boolean;
  redFlagSymptomLabel: string;
  oldestMeasureMonths: string;
  provenanceMode: 'V' | 'M' | 'D' | 'S';
}

const DEFAULT_ANALYSIS_FORM: GuidedAnalysisFormState = {
  parentPatientId: 'PT-36Y-TARIQ',
  displayName: 'Karim Al-Mansoori (Bilan Personnalisé)',
  pathwayType: 'adult',
  ageYears: '52',
  ageMonths: '624',
  gestationalAgeWeeks: '39',
  sex: 'male',
  nationalityGroup: 'South Asia',
  region: 'Abu Dhabi Region',
  facilityCenter: 'Abu Dhabi Preventive Health Centre',
  preferredLanguage: 'fr',
  systolicBp1: '148',
  diastolicBp1: '92',
  systolicBp2: '134',
  diastolicBp2: '84',
  systolicBp3: '136',
  diastolicBp3: '86',
  weightKg: '86',
  heightCm: '172',
  waistCm: '101',
  smokingStatus: true,
  dailyPhysicalActivity: false,
  dailyFruitsVeg: false,
  antihypertensiveMedHistory: true,
  highBloodGlucoseHistory: false,
  familyHistoryDiabetesLevel: 'first_degree',
  hba1cPercent: '6.1',
  isPregnant: false,
  familyPrematureCvd: true,
  familyBreastOrColorectalCancer: false,
  colorectalScreeningOverdueMonths: '14',
  breastScreeningOverdueMonths: '0',
  cervicalScreeningOverdueMonths: '0',
  chronicFollowupInterruptedMonths: '0',
  activeSpecialistFollowup: false,
  weightForAgeZ: '0.0',
  heightForAgeZ: '0.0',
  bmiForAgeZ: '0.0',
  muacMm: '145',
  mchatScore: '0',
  hearingScreeningDone: true,
  visionScreeningDone: true,
  hemoglobinGdl: '13.4',
  missedVaccineDoses: '',
  overdueMonthsWcv: '0',
  phqAStatus: 'negative',
  existingGenomicResult: true,
  genomicDomain: 'cvd',
  redFlagWarningSymptom: false,
  redFlagSymptomLabel: '',
  oldestMeasureMonths: '0',
  provenanceMode: 'M',
};

export const ClinicianPortal: React.FC<ClinicianPortalProps> = ({
  onLogout,
}) => {
  const { locale } = useI18n();
  const isFr = locale === 'fr';

  const [patients, setPatients] = useState<ClinicianPatientListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<ClinicianPatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [pathwayFilter, setPathwayFilter] = useState<string>('all');

  const [detailTab, setDetailTab] = useState<
    'calculations' | 'flags' | 'pathway' | 'measures' | 'summary' | 'consents'
  >('calculations');
  const [activeActionPanel, setActiveActionPanel] = useState<
    | null
    | 'guided-workbench'
    | 'missing-data'
    | 'ai-summary'
    | 'pathway-decision'
    | 'invitation'
    | 'confirm-visit'
    | 'conclusion'
  >(null);

  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [analysisForm, setAnalysisForm] = useState<GuidedAnalysisFormState>(DEFAULT_ANALYSIS_FORM);
  const [submittingAnalysis, setSubmittingAnalysis] = useState(false);

  // Live Parent Database Search (< 18y affiliation) & Majority Detachment Validation (18y+)
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [parentCandidates, setParentCandidates] = useState<
    Array<{
      id: string;
      displayName: string;
      ageYears: number;
      sex: string;
      region: string;
      facilityCenter: string;
    }>
  >([]);
  const [pendingMajorityList, setPendingMajorityList] = useState<any[]>([]);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [sysInput, setSysInput] = useState('126');
  const [diaInput, setDiaInput] = useState('82');
  const [weightInput, setWeightInput] = useState('68');
  const [heightInput, setHeightInput] = useState('164');
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [pathwayActionType, setPathwayActionType] = useState<'validate' | 'adapt' | 'defer'>('validate');
  const [pathwayReason, setPathwayReason] = useState('');
  const [invitationPreview, setInvitationPreview] = useState<any>(null);
  const [invitationCustomText, setInvitationCustomText] = useState('');
  const [invitationLang, setInvitationLang] = useState<Locale>('en');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [conclusionStatus, setConclusionStatus] = useState('normal');
  const [conclusionNotes, setConclusionNotes] = useState('');

  const loadList = async () => {
    try {
      setLoading(true);
      const [res, famRes] = await Promise.all([
        apiClient.listPatients({
          level: levelFilter,
          pathway: pathwayFilter,
        }),
        apiClient.getPendingMajorityDetachments().catch(() => ({
          pendingMajorityDetachments: [],
          affiliatedRecords: [],
        })),
      ]);
      setPatients(res.patients || []);
      setPendingMajorityList(famRes.pendingMajorityDetachments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    apiClient
      .searchParents(parentSearchQuery)
      .then((res) => {
        if (active) setParentCandidates(res.parents || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [parentSearchQuery]);

  const handleApproveMajority = async (childId: string, childName: string) => {
    try {
      const res = await apiClient.approveMajorityDetachment(childId);
      setActionFeedback(
        isFr
          ? `Validation définitive effectuée par le service compétent : ${childName} (${childId}) est désormais détaché de la tutelle parentale et rattaché au parcours Adulte IFHAS (${res.autonomousEmail}).`
          : `Definitive majority detachment validated: ${childName} (${childId}) is now an autonomous Adult IFHAS record (${res.autonomousEmail}).`
      );
      await loadList();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const populateFormFromPatient = (p: ClinicianPatientDetail) => {
    const cp = p.clinicalProfile || {};
    setAnalysisForm({
      patientId: p.id,
      parentPatientId: (p as any).parentUserId || 'PT-36Y-TARIQ',
      displayName: p.displayName,
      pathwayType: p.pathwayType,
      ageYears: String(p.ageYears ?? 36),
      ageMonths: String(p.ageMonths ?? p.ageYears * 12),
      gestationalAgeWeeks: String(p.gestationalAgeWeeks ?? 39),
      sex: p.sex || 'female',
      nationalityGroup: p.nationalityGroup || 'Emirati',
      region: p.region || 'Abu Dhabi Region',
      facilityCenter: p.facilityCenter || 'Abu Dhabi Preventive Health Centre',
      preferredLanguage: p.preferredLanguage || 'en',
      systolicBp1: cp.systolicBp1 !== undefined ? String(cp.systolicBp1) : '',
      diastolicBp1: cp.diastolicBp1 !== undefined ? String(cp.diastolicBp1) : '',
      systolicBp2: cp.systolicBp2 !== undefined ? String(cp.systolicBp2) : '',
      diastolicBp2: cp.diastolicBp2 !== undefined ? String(cp.diastolicBp2) : '',
      systolicBp3: cp.systolicBp3 !== undefined ? String(cp.systolicBp3) : '',
      diastolicBp3: cp.diastolicBp3 !== undefined ? String(cp.diastolicBp3) : '',
      weightKg: cp.weightKg !== undefined ? String(cp.weightKg) : '',
      heightCm: cp.heightCm !== undefined ? String(cp.heightCm) : '',
      waistCm: cp.waistCm !== undefined ? String(cp.waistCm) : '',
      smokingStatus: Boolean(cp.smokingStatus),
      dailyPhysicalActivity: cp.dailyPhysicalActivity !== undefined ? Boolean(cp.dailyPhysicalActivity) : true,
      dailyFruitsVeg: cp.dailyFruitsVeg !== undefined ? Boolean(cp.dailyFruitsVeg) : true,
      antihypertensiveMedHistory: Boolean(cp.antihypertensiveMedHistory),
      highBloodGlucoseHistory: Boolean(cp.highBloodGlucoseHistory),
      familyHistoryDiabetesLevel: cp.familyHistoryDiabetesLevel || 'none',
      hba1cPercent: cp.hba1cPercent !== undefined ? String(cp.hba1cPercent) : '',
      isPregnant: Boolean(cp.isPregnant),
      familyPrematureCvd: Boolean(cp.familyPrematureCvd),
      familyBreastOrColorectalCancer: Boolean(cp.familyBreastOrColorectalCancer),
      colorectalScreeningOverdueMonths: String(cp.colorectalScreeningOverdueMonths ?? 0),
      breastScreeningOverdueMonths: String(cp.breastScreeningOverdueMonths ?? 0),
      cervicalScreeningOverdueMonths: String(cp.cervicalScreeningOverdueMonths ?? 0),
      chronicFollowupInterruptedMonths: String(cp.chronicFollowupInterruptedMonths ?? 0),
      activeSpecialistFollowup: Boolean(cp.activeSpecialistFollowup),
      weightForAgeZ: cp.weightForAgeZ !== undefined ? String(cp.weightForAgeZ) : '0',
      heightForAgeZ: cp.heightForAgeZ !== undefined ? String(cp.heightForAgeZ) : '0',
      bmiForAgeZ: cp.bmiForAgeZ !== undefined ? String(cp.bmiForAgeZ) : '0',
      muacMm: cp.muacMm !== undefined ? String(cp.muacMm) : '142',
      mchatScore: cp.mchatScore !== undefined ? String(cp.mchatScore) : '0',
      hearingScreeningDone: cp.hearingScreeningDone !== undefined ? Boolean(cp.hearingScreeningDone) : true,
      visionScreeningDone: cp.visionScreeningDone !== undefined ? Boolean(cp.visionScreeningDone) : true,
      hemoglobinGdl: cp.hemoglobinGdl !== undefined ? String(cp.hemoglobinGdl) : '',
      missedVaccineDoses: Array.isArray(cp.missedVaccineDoses) ? cp.missedVaccineDoses.join(', ') : '',
      overdueMonthsWcv: String(cp.overdueMonthsWcv ?? 0),
      phqAStatus: cp.phqAStatus || 'negative',
      existingGenomicResult: Boolean(p.consents?.existingGenomicResult),
      genomicDomain: cp.genomicSignal?.domain || 'none',
      redFlagWarningSymptom: Boolean(cp.redFlagWarningSymptom),
      redFlagSymptomLabel: cp.redFlagSymptomLabel || '',
      oldestMeasureMonths: String(cp.oldestMeasureMonths ?? 0),
      provenanceMode: 'M',
    });
  };

  const loadPatientDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.getPatient(id);
      setPatientDetail(res.patient);
      populateFormFromPatient(res.patient);
      setReferralCodeInput(res.patient.recommendations[0]?.referralCodeDisplay || '');
      setInvitationLang(res.patient.preferredLanguage || 'en');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [levelFilter, pathwayFilter]);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetail(selectedPatientId);
    }
  }, [selectedPatientId]);

  const filteredPatients = patients.filter(
    (p) =>
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryReasonSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Live frontend helper to check if BP reading 1 & 2 diverge by >10 mmHg sys or >6 mmHg dia
  const bpSpreadSys =
    analysisForm.systolicBp1 && analysisForm.systolicBp2
      ? Math.abs(Number(analysisForm.systolicBp1) - Number(analysisForm.systolicBp2))
      : 0;
  const bpSpreadDia =
    analysisForm.diastolicBp1 && analysisForm.diastolicBp2
      ? Math.abs(Number(analysisForm.diastolicBp1) - Number(analysisForm.diastolicBp2))
      : 0;
  const formRequiresBp3 = bpSpreadSys > 10 || bpSpreadDia > 6;

  const applyPresetScenario = (preset: 'adult_cvd' | 'south_asia_findrisc' | 'child_preterm' | 'red_escape') => {
    if (preset === 'adult_cvd') {
      setAnalysisForm({
        ...DEFAULT_ANALYSIS_FORM,
        patientId: undefined,
        displayName: 'Youssef Al-Hosani (Adulte 55 ans · Bilan CV & Métabolique)',
        pathwayType: 'adult',
        ageYears: '55',
        ageMonths: '660',
        sex: 'male',
        nationalityGroup: 'Emirati',
        systolicBp1: '152',
        diastolicBp1: '94',
        systolicBp2: '138',
        diastolicBp2: '86',
        systolicBp3: '140',
        diastolicBp3: '88',
        weightKg: '91',
        heightCm: '174',
        waistCm: '104',
        smokingStatus: true,
        dailyPhysicalActivity: false,
        dailyFruitsVeg: false,
        antihypertensiveMedHistory: true,
        highBloodGlucoseHistory: true,
        familyHistoryDiabetesLevel: 'first_degree',
        hba1cPercent: '6.2',
        familyPrematureCvd: true,
        existingGenomicResult: true,
        genomicDomain: 'cvd',
        redFlagWarningSymptom: false,
      });
    } else if (preset === 'south_asia_findrisc') {
      setAnalysisForm({
        ...DEFAULT_ANALYSIS_FORM,
        patientId: undefined,
        displayName: 'Ananya Nair (Adulte 38 ans · Règle A4 Asie du Sud & TEST-S4 <40 ans)',
        pathwayType: 'adult',
        ageYears: '38',
        ageMonths: '456',
        sex: 'female',
        nationalityGroup: 'South Asia',
        systolicBp1: '124',
        diastolicBp1: '78',
        systolicBp2: '122',
        diastolicBp2: '76',
        systolicBp3: '',
        diastolicBp3: '',
        weightKg: '74',
        heightCm: '160',
        waistCm: '91',
        smokingStatus: false,
        dailyPhysicalActivity: false,
        dailyFruitsVeg: true,
        antihypertensiveMedHistory: false,
        highBloodGlucoseHistory: true,
        familyHistoryDiabetesLevel: 'first_degree',
        hba1cPercent: '5.9',
        isPregnant: false,
        existingGenomicResult: false,
        genomicDomain: 'none',
        redFlagWarningSymptom: false,
      });
    } else if (preset === 'child_preterm') {
      setAnalysisForm({
        ...DEFAULT_ANALYSIS_FORM,
        patientId: undefined,
        parentPatientId: 'PT-36Y-TARIQ',
        displayName: 'Nahyan Al-Nadim (Enfant 14 mois · Prématuré 32 SA · WCV)',
        pathwayType: 'child',
        ageYears: '1',
        ageMonths: '14',
        gestationalAgeWeeks: '32',
        sex: 'male',
        nationalityGroup: 'Emirati',
        systolicBp1: '',
        diastolicBp1: '',
        systolicBp2: '',
        diastolicBp2: '',
        systolicBp3: '',
        diastolicBp3: '',
        weightKg: '8.4',
        heightCm: '73',
        weightForAgeZ: '-2.3',
        heightForAgeZ: '-1.8',
        bmiForAgeZ: '-2.1',
        muacMm: '122',
        mchatScore: '4',
        hemoglobinGdl: '10.2',
        missedVaccineDoses: 'MMR Dose 1, PCV Booster',
        overdueMonthsWcv: '3',
        redFlagWarningSymptom: false,
      });
    } else if (preset === 'red_escape') {
      setAnalysisForm({
        ...DEFAULT_ANALYSIS_FORM,
        patientId: undefined,
        displayName: 'Fatima Al-Mazrouei (Urgence E0 / Poussée Hypertensive)',
        pathwayType: 'adult',
        ageYears: '61',
        ageMonths: '732',
        sex: 'female',
        nationalityGroup: 'Emirati',
        systolicBp1: '184',
        diastolicBp1: '114',
        systolicBp2: '182',
        diastolicBp2: '112',
        systolicBp3: '',
        diastolicBp3: '',
        redFlagWarningSymptom: true,
        redFlagSymptomLabel: 'Douleur thoracique aiguë & céphalées intenses (Règle E0)',
      });
    }
  };

  const handleExecuteGuidedAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAnalysis(true);
      setActionError(null);
      const computedAgeYears =
        analysisForm.pathwayType === 'child'
          ? Math.floor(Number(analysisForm.ageMonths || 12) / 12)
          : Number(analysisForm.ageYears || 0);
      const payload = {
        ...analysisForm,
        ageYears: computedAgeYears,
        ageMonths:
          analysisForm.pathwayType === 'child'
            ? Number(analysisForm.ageMonths || 12)
            : Number(analysisForm.ageYears || 30) * 12,
        parentPatientId:
          computedAgeYears < 18 || analysisForm.pathwayType !== 'adult'
            ? analysisForm.parentPatientId
            : undefined,
      };
      const res = await apiClient.analyzePatient(payload);
      setShowNewAnalysisModal(false);
      setActiveActionPanel(null);
      await loadList();
      setSelectedPatientId(res.patient.id);
      setPatientDetail(res.patient);
      populateFormFromPatient(res.patient);
      setDetailTab('calculations');
      setActionFeedback(
        isFr
          ? 'Analyse clinique backend exécutée avec succès (Modèles OMS 2019, FINDRISC, Protocole TA et Règles WCV/IFHAS mis à jour).'
          : 'Backend clinical analysis completed (WHO 2019, FINDRISC, BP Protocol, and WCV/IFHAS rules updated).'
      );
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingAnalysis(false);
    }
  };

  const handleRunEvaluation = async () => {
    if (!selectedPatientId) return;
    setActionError(null);
    await apiClient.runEvaluation(selectedPatientId);
    setActionFeedback(
      isFr
        ? 'Calculs préventifs recalculés en backend selon la table signée v8.'
        : 'Evaluation refreshed against signed rules v8.'
    );
    await loadPatientDetail(selectedPatientId);
    await loadList();
  };

  const handleSubmitMissingData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      setActionError(null);
      await apiClient.submitMissingData(selectedPatientId, {
        systolicBp: Number(sysInput),
        diastolicBp: Number(diaInput),
        weightKg: Number(weightInput),
        heightCm: Number(heightInput),
      });
      setActiveActionPanel(null);
      setActionFeedback(
        isFr
          ? 'Mesures enregistrées en backend. Niveau Gris résolu et risque recalculé.'
          : 'Measurements saved. Level Grey resolved.'
      );
      await loadPatientDetail(selectedPatientId);
      await loadList();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!selectedPatientId) return;
    setActionError(null);
    const res = await apiClient.generateSummary(selectedPatientId);
    setAiSummaryText(res.summaryText);
    setActiveActionPanel('ai-summary');
  };

  const handlePathwayDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      setActionError(null);
      await apiClient.actOnRecommendation(selectedPatientId, pathwayActionType, pathwayReason);
      setActiveActionPanel(null);
      setPathwayReason('');
      setActionFeedback(`Care plan ${pathwayActionType.toUpperCase()} recorded.`);
      await loadPatientDetail(selectedPatientId);
      await loadList();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleOpenInvitationPreview = async (langOverride?: Locale) => {
    if (!selectedPatientId) return;
    try {
      setActionError(null);
      const targetLang = langOverride || invitationLang;
      const res = await apiClient.previewInvitation(selectedPatientId, targetLang);
      setInvitationPreview(res.preview);
      setInvitationCustomText(res.preview.bodyText);
      setActiveActionPanel('invitation');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleSendValidatedInvitation = async () => {
    if (!selectedPatientId) return;
    try {
      setActionError(null);
      await apiClient.sendInvitation(selectedPatientId, invitationLang, invitationCustomText);
      setActiveActionPanel(null);
      setActionFeedback('Validated invitation queued (Simulated send).');
      await loadPatientDetail(selectedPatientId);
      await loadList();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleConfirmVisitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      setActionError(null);
      await apiClient.confirmVisit(selectedPatientId, referralCodeInput);
      setActiveActionPanel(null);
      setActionFeedback('8-character pass verified. Visit marked Completed & Confirmed.');
      await loadPatientDetail(selectedPatientId);
      await loadList();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleRecordConclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      setActionError(null);
      await apiClient.recordConclusion(selectedPatientId, {
        conclusionStatus,
        conclusionNotes,
      });
      setActiveActionPanel(null);
      setActionFeedback('Visit conclusion saved.');
      await loadPatientDetail(selectedPatientId);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleExportFhir = () => {
    if (!selectedPatientId) return;
    window.location.href = `/api/clinician/patients/${selectedPatientId}/export-fhir`;
    setActionFeedback('FHIR R4 Bundle downloaded.');
  };

  const redCount = patients.filter((p) => p.overallLevel === 'red').length;
  const greyCount = patients.filter((p) => p.overallLevel === 'grey').length;
  const overdueCount = patients.filter((p) => p.overallLevel === 'orange').length;

  const isMinorForm =
    analysisForm.pathwayType !== 'adult' || Number(analysisForm.ageYears || 0) < 18;

  const renderGuidedAnalysisForm = (isModal: boolean) => (
    <form onSubmit={handleExecuteGuidedAnalysis} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
            {isFr
              ? 'Module U2 · Saisie Guidée & Calculateur Clinique Backend (Défi 04)'
              : 'Module U2 · Guided Clinical Input & Backend Calculation Engine'}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-[#0B3B3C] font-heading">
            {analysisForm.patientId
              ? isFr
                ? `Modifier les paramètres & recalculer : ${analysisForm.displayName}`
                : `Update Clinical Parameters & Recalculate: ${analysisForm.displayName}`
              : isFr
              ? 'Nouvelle Analyse Préventive Personnalisée (Calcul Temps Réel)'
              : 'New Custom Preventive Clinical Analysis (Live Backend Calculation)'}
          </h3>
        </div>

        {!analysisForm.patientId && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-[#64748B] me-1">
              {isFr ? 'Cas types rapides :' : 'Quick presets:'}
            </span>
            <button
              type="button"
              onClick={() => applyPresetScenario('adult_cvd')}
              className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] text-[#0B3B3C] font-semibold hover:bg-[#CCFBF1]"
            >
              {isFr ? 'Adulte CV + FINDRISC' : 'Adult CVD + FINDRISC'}
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('south_asia_findrisc')}
              className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] text-[#0B3B3C] font-semibold hover:bg-[#CCFBF1]"
            >
              {isFr ? 'Asie du Sud <40a (A4/S4)' : 'South Asia <40y (A4/S4)'}
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('child_preterm')}
              className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] border border-[#99F6E4] text-[#0B3B3C] font-semibold hover:bg-[#CCFBF1]"
            >
              {isFr ? 'Enfant Prématuré 32 SA (<18a Affilié)' : 'Preterm Child 32w (<18y Affiliated)'}
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('red_escape')}
              className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] border border-red-200 text-[#991B1B] font-semibold hover:bg-red-100"
            >
              {isFr ? 'Urgence Rouge (E0)' : 'Red Escape (E0)'}
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <div className="bg-[#FEF2F2] border border-red-200 text-[#B91C1C] px-4 py-3 rounded-xl text-xs font-semibold">
          {actionError}
        </div>
      )}

      {/* 1. Identity, Pathway & Demographic Modifiers */}
      <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3B3C] flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#0F6B6B]" />
          <span>
            {isFr
              ? '1. Identité, Parcours d’Âge & Modificateur Démographique (A4)'
              : '1. Identity, Age Pathway & Demographic Modifier (A4)'}
          </span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#334155] mb-1">
              {isFr ? 'Nom du patient' : 'Patient Full Name'}
            </label>
            <input
              type="text"
              value={analysisForm.displayName}
              onChange={(e) => setAnalysisForm({ ...analysisForm, displayName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C] font-semibold"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-[#334155] mb-1">
              {isFr ? 'Parcours' : 'Pathway'}
            </label>
            <select
              value={analysisForm.pathwayType}
              onChange={(e) =>
                setAnalysisForm({
                  ...analysisForm,
                  pathwayType: e.target.value as 'child' | 'adolescent' | 'adult',
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C] font-semibold"
            >
              <option value="adult">{isFr ? 'Adulte (IFHAS 18+)' : 'Adult (IFHAS 18+)'}</option>
              <option value="child">{isFr ? 'Enfant (WCV 0–9 ans)' : 'Child (WCV 0–9y)'}</option>
              <option value="adolescent">{isFr ? 'Adolescent (10–17 ans)' : 'Adolescent (10–17y)'}</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-[#334155] mb-1">
              {analysisForm.pathwayType === 'child'
                ? isFr
                  ? 'Âge (en mois)'
                  : 'Age (months)'
                : isFr
                ? 'Âge (années)'
                : 'Age (years)'}
            </label>
            {analysisForm.pathwayType === 'child' ? (
              <input
                type="number"
                min={1}
                max={119}
                value={analysisForm.ageMonths}
                onChange={(e) =>
                  setAnalysisForm({
                    ...analysisForm,
                    ageMonths: e.target.value,
                    ageYears: String(Math.floor(Number(e.target.value) / 12)),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
              />
            ) : (
              <input
                type="number"
                min={10}
                max={105}
                value={analysisForm.ageYears}
                onChange={(e) =>
                  setAnalysisForm({
                    ...analysisForm,
                    ageYears: e.target.value,
                    ageMonths: String(Number(e.target.value) * 12),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
              />
            )}
          </div>
          <div>
            <label className="block font-semibold text-[#334155] mb-1">
              {isFr ? 'Sexe & Groupe (Règle A4)' : 'Sex & Group (Rule A4)'}
            </label>
            <div className="flex gap-1.5">
              <select
                value={analysisForm.sex}
                onChange={(e) => setAnalysisForm({ ...analysisForm, sex: e.target.value })}
                className="w-1/2 px-2 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
              >
                <option value="female">{isFr ? 'Femme' : 'Female'}</option>
                <option value="male">{isFr ? 'Homme' : 'Male'}</option>
              </select>
              <select
                value={analysisForm.nationalityGroup}
                onChange={(e) => setAnalysisForm({ ...analysisForm, nationalityGroup: e.target.value })}
                className="w-1/2 px-2 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
              >
                <option value="Emirati">Emirati</option>
                <option value="South Asia">South Asia (A4)</option>
                <option value="Arab Non-UAE">Arab Non-UAE</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mandatory Parent / Legal Guardian DB Search & Affiliation when registering a minor (< 18y) */}
        {isMinorForm && (
          <div className="mt-3 p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                  {isFr
                    ? 'Service Compétent · Affiliation Parentale Obligatoire (< 18 ans)'
                    : 'Competent Service · Mandatory Parental Affiliation (< 18y)'}
                </span>
                <p className="font-bold text-[#0B3B3C]">
                  {isFr
                    ? 'Rechercher le parent dans la base de données (par ID ou Nom) pour rattacher l’enfant :'
                    : 'Search parent in database (by ID or Name) to affiliate this minor:'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#99F6E4] font-mono font-bold text-[#0F6B6B]">
                {isFr ? 'Parent affilié :' : 'Linked Parent:'} {analysisForm.parentPatientId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute start-3 top-2.5" />
                <input
                  type="text"
                  value={parentSearchQuery}
                  onChange={(e) => setParentSearchQuery(e.target.value)}
                  placeholder={
                    isFr
                      ? 'Rechercher par ID (ex: PT-36Y-TARIQ) ou Nom (ex: Tariq)...'
                      : 'Search by ID (e.g. PT-36Y-TARIQ) or Name (e.g. Tariq)...'
                  }
                  className="w-full ps-8 pe-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {parentCandidates.slice(0, 4).map((parent) => {
                  const selected = analysisForm.parentPatientId === parent.id;
                  return (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() =>
                        setAnalysisForm({ ...analysisForm, parentPatientId: parent.id })
                      }
                      className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#0B3B3C] text-white shadow-xs'
                          : 'bg-white border border-[#CBD5E1] text-[#0B3B3C] hover:border-[#0F6B6B]'
                      }`}
                    >
                      {parent.displayName} ({parent.id} · {parent.ageYears}a)
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Guided Blood Pressure Protocol (2 or 3 readings) & Anthropometry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3B3C] flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-[#0F6B6B]" />
              <span>
                {isFr
                  ? '2. Protocole TA (2 ou 3 mesures · Bornes 60–260 / 30–160)'
                  : '2. BP Protocol (2 or 3 readings · Bounds 60–260 / 30–160)'}
              </span>
            </h4>
            {formRequiresBp3 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                {isFr
                  ? `Écart ${bpSpreadSys}/${bpSpreadDia} mmHg (>10/6) → 3e mesure requise`
                  : `Spread ${bpSpreadSys}/${bpSpreadDia} mmHg (>10/6) → 3rd reading required`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[11px] font-bold text-[#0B3B3C] block mb-1.5">
                {isFr ? 'Mesure 1 (mmHg)' : 'Reading 1 (mmHg)'}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Sys"
                  value={analysisForm.systolicBp1}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, systolicBp1: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#CBD5E1] text-center font-mono"
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="Dia"
                  value={analysisForm.diastolicBp1}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, diastolicBp1: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#CBD5E1] text-center font-mono"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
              <span className="text-[11px] font-bold text-[#0B3B3C] block mb-1.5">
                {isFr ? 'Mesure 2 (après 1 min)' : 'Reading 2 (after 1m)'}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Sys"
                  value={analysisForm.systolicBp2}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, systolicBp2: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#CBD5E1] text-center font-mono"
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="Dia"
                  value={analysisForm.diastolicBp2}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, diastolicBp2: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#CBD5E1] text-center font-mono"
                />
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                formRequiresBp3
                  ? 'bg-amber-50/90 border-amber-300'
                  : 'bg-white border-[#E2E8F0]'
              }`}
            >
              <span className="text-[11px] font-bold text-[#0B3B3C] block mb-1.5">
                {isFr ? 'Mesure 3 (si écart >10/6)' : 'Reading 3 (if spread >10/6)'}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Sys"
                  value={analysisForm.systolicBp3}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, systolicBp3: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-center font-mono"
                />
                <span>/</span>
                <input
                  type="number"
                  placeholder="Dia"
                  value={analysisForm.diastolicBp3}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, diastolicBp3: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-center font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Anthropometry & Provenance */}
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3B3C] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#0F6B6B]" />
            <span>
              {isFr
                ? '3. Anthropométrie (Calcul IMC Automatique) & Provenance'
                : '3. Anthropometry (Auto BMI Calculation) & Provenance'}
            </span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Poids (kg)' : 'Weight (kg)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={analysisForm.weightKg}
                onChange={(e) => setAnalysisForm({ ...analysisForm, weightKg: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Taille (cm)' : 'Height (cm)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={analysisForm.heightCm}
                onChange={(e) => setAnalysisForm({ ...analysisForm, heightCm: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Tour taille (cm)' : 'Waist (cm)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={analysisForm.waistCm}
                onChange={(e) => setAnalysisForm({ ...analysisForm, waistCm: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Provenance' : 'Provenance'}
              </label>
              <select
                value={analysisForm.provenanceMode}
                onChange={(e) =>
                  setAnalysisForm({
                    ...analysisForm,
                    provenanceMode: e.target.value as 'V' | 'M' | 'D' | 'S',
                  })
                }
                className="w-full px-2 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-semibold text-[#0B3B3C]"
              >
                <option value="M">M · Mesuré protocole</option>
                <option value="V">V · Dossier vérifié</option>
                <option value="D">D · Déclaré patient</option>
                <option value="S">S · Synthétique</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Adult FINDRISC 8 Items, OMS 2019 Factors & Cancer/Chronic OR Pediatric WCV */}
      {analysisForm.pathwayType === 'adult' ? (
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3B3C] flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-[#0F6B6B]" />
            <span>
              {isFr
                ? '4. Facteurs Métaboliques FINDRISC (8 items), OMS 2019 & Dépistages IFHAS (A1–A11)'
                : '4. FINDRISC (8 items), WHO 2019 Factors & IFHAS Screenings (A1–A11)'}
            </span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Antécédents familiaux diabète' : 'Family History of Diabetes'}
              </label>
              <select
                value={analysisForm.familyHistoryDiabetesLevel}
                onChange={(e) =>
                  setAnalysisForm({
                    ...analysisForm,
                    familyHistoryDiabetesLevel: e.target.value as any,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
              >
                <option value="none">{isFr ? 'Aucun (0 pt)' : 'None (0 pt)'}</option>
                <option value="second_degree">{isFr ? '2e degré : Grands-parents/Oncles (+3 pts)' : '2nd degree (+3 pts)'}</option>
                <option value="first_degree">{isFr ? '1er degré : Parents/Fratrie (+5 pts)' : '1st degree (+5 pts)'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'HbA1c (%) optionnelle' : 'Optional HbA1c (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="ex: 6.0"
                value={analysisForm.hba1cPercent}
                onChange={(e) => setAnalysisForm({ ...analysisForm, hba1cPercent: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Retard dépistage colorectal (mois)' : 'Colorectal Overdue (months)'}
              </label>
              <input
                type="number"
                min={0}
                value={analysisForm.colorectalScreeningOverdueMonths}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, colorectalScreeningOverdueMonths: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Interruption suivi chronique (mois)' : 'Chronic Follow-up Gap (mos)'}
              </label>
              <input
                type="number"
                min={0}
                value={analysisForm.chronicFollowupInterruptedMonths}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, chronicFollowupInterruptedMonths: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.smokingStatus}
                onChange={(e) => setAnalysisForm({ ...analysisForm, smokingStatus: e.target.checked })}
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Tabagisme actif (OMS CV)' : 'Current Smoker (WHO CVD)'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.dailyPhysicalActivity}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, dailyPhysicalActivity: e.target.checked })
                }
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Activité ≥30 min/j (FINDRISC)' : 'Activity ≥30m/day'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.dailyFruitsVeg}
                onChange={(e) => setAnalysisForm({ ...analysisForm, dailyFruitsVeg: e.target.checked })}
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Fruits & légumes/j' : 'Daily Fruits & Veg'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.antihypertensiveMedHistory}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, antihypertensiveMedHistory: e.target.checked })
                }
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Traitement anti-HTA (+2 pts)' : 'Antihypertensive Meds (+2)'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.highBloodGlucoseHistory}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, highBloodGlucoseHistory: e.target.checked })
                }
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Antécédent glycémie élevée (+5)' : 'Prior High Glucose (+5)'}
              </span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.familyPrematureCvd}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, familyPrematureCvd: e.target.checked })
                }
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Antécédent CV précoce 1er degré' : '1st-Degree Premature CVD'}
              </span>
            </label>

            {analysisForm.sex === 'female' && (
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={analysisForm.isPregnant}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, isPregnant: e.target.checked })}
                />
                <span className="font-medium text-[#0B3B3C]">
                  {isFr ? 'Grossesse en cours (Règle A11)' : 'Currently Pregnant (Rule A11)'}
                </span>
              </label>
            )}

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
              <input
                type="checkbox"
                checked={analysisForm.activeSpecialistFollowup}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, activeSpecialistFollowup: e.target.checked })
                }
              />
              <span className="font-medium text-[#0B3B3C]">
                {isFr ? 'Suivi spécialiste actif (Éclipse)' : 'Active Specialist Follow-up'}
              </span>
            </label>
          </div>
        </div>
      ) : (
        /* Pediatric & Adolescent Parameters (Rules P1–P11) */
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3B3C] flex items-center gap-1.5">
            <Baby className="w-3.5 h-3.5 text-[#0F6B6B]" />
            <span>
              {isFr
                ? '4. Paramètres Pédiatriques OMS, Prématurité & Développement (Règles P1–P11)'
                : '4. WHO Pediatric Growth, Prematurity & Development (Rules P1–P11)'}
            </span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Terme naissance (SA)' : 'Gestational Age (wks)'}
              </label>
              <input
                type="number"
                min={24}
                max={42}
                value={analysisForm.gestationalAgeWeeks}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, gestationalAgeWeeks: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Score Z Poids/Âge' : 'Weight-for-Age Z'}
              </label>
              <input
                type="number"
                step="0.1"
                value={analysisForm.weightForAgeZ}
                onChange={(e) => setAnalysisForm({ ...analysisForm, weightForAgeZ: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Périmètre brachial (mm)' : 'MUAC (mm)'}
              </label>
              <input
                type="number"
                value={analysisForm.muacMm}
                onChange={(e) => setAnalysisForm({ ...analysisForm, muacMm: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Score M-CHAT-R (0–20)' : 'M-CHAT-R Score'}
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={analysisForm.mchatScore}
                onChange={(e) => setAnalysisForm({ ...analysisForm, mchatScore: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Hémoglobine (g/dL)' : 'Hemoglobin (g/dL)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={analysisForm.hemoglobinGdl}
                onChange={(e) => setAnalysisForm({ ...analysisForm, hemoglobinGdl: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#334155] mb-1">
                {isFr ? 'Vaccins manquants' : 'Missed Vaccines'}
              </label>
              <input
                type="text"
                placeholder="ex: MMR Dose 1"
                value={analysisForm.missedVaccineDoses}
                onChange={(e) =>
                  setAnalysisForm({ ...analysisForm, missedVaccineDoses: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Genomic Accelerator (G1-G3) & Emergency Escape Rule E0 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-[#0B3B3C] block">
              {isFr ? 'Accélérateur Génomique Consenti (G1–G3)' : 'Consented Genomic Accelerator (G1–G3)'}
            </span>
            <span className="text-[11px] text-[#64748B]">
              {isFr ? 'Avance uniquement le calendrier préventif' : 'Strictly advances screening schedule'}
            </span>
          </div>
          <select
            value={analysisForm.genomicDomain}
            onChange={(e) =>
              setAnalysisForm({
                ...analysisForm,
                genomicDomain: e.target.value as any,
                existingGenomicResult: e.target.value !== 'none',
              })
            }
            className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-semibold text-[#0B3B3C]"
          >
            <option value="none">{isFr ? 'Aucun signal' : 'None'}</option>
            <option value="cvd">G1 · Cardiovasculaire (-5 ans)</option>
            <option value="diabetes">G2 · Diabète / HbA1c annuel</option>
            <option value="oncology">G3 · Oncologie ciblée</option>
          </select>
        </div>

        <div className="bg-[#FEF2F2]/80 p-3.5 rounded-2xl border border-red-200 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisForm.redFlagWarningSymptom}
              onChange={(e) =>
                setAnalysisForm({ ...analysisForm, redFlagWarningSymptom: e.target.checked })
              }
            />
            <div>
              <span className="font-bold text-[#991B1B] block">
                {isFr
                  ? 'Symptôme d’alarme aigu — Règle d’Échappement E0'
                  : 'Acute Red-Flag Symptom — Escape Rule E0'}
              </span>
              <span className="text-[11px] text-[#B91C1C]">
                {isFr
                  ? 'Court-circuite la file standard → Niveau Rouge immédiat + Éclipse'
                  : 'Bypasses routine queue → Immediate Level Red + Eclipse'}
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => {
            if (isModal) setShowNewAnalysisModal(false);
            else setActiveActionPanel(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold text-[#334155]"
        >
          {isFr ? 'Annuler' : 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={submittingAnalysis}
          className="px-5 py-2.5 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>
            {submittingAnalysis
              ? isFr
                ? 'Calcul en cours...'
                : 'Calculating...'
              : isFr
              ? 'Exécuter les Calculs Backend (OMS 2019 / FINDRISC / WCV-IFHAS)'
              : 'Run Backend Clinical Calculations (WHO 2019 / FINDRISC / WCV-IFHAS)'}
          </span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col">
      <DemoBanner />

      {/* Top Liquid Glass Header */}
      <header className="liquid-glass border-b border-white/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <MediSenseLogo />
            <span className="hidden md:inline text-xs font-semibold text-[#64748B] border-s border-[#E2E8F0] ps-4 truncate">
              {isFr ? 'Espace Médecin · Écran 2' : 'Clinician Workspace · Screen 2'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/85 text-[#0B3B3C] border border-[#D5F2EE] rounded-xl px-3 py-1.5">
              <span>
                {isFr
                  ? 'Dr. Sydney Kpegbe · Médecin (Écran 2)'
                  : 'Dr. Sydney Kpegbe · Clinician (Screen 2)'}
              </span>
            </span>
            <LanguageSwitch />
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/85 border border-[#E2E8F0] text-xs font-semibold text-[#0B3B3C] hover:bg-white inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">
                {isFr ? 'Déconnexion' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 flex-1 space-y-5 sm:space-y-6">
        {!selectedPatientId ? (
          /* ===============================================================
           * VIEW 1: CLINICIAN DASHBOARD & PATIENT ROSTER (Zero S_prio column)
           * =============================================================== */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 sm:space-y-6"
          >
            {/* Interactive Clinical Workbench Banner (Allows launching a custom patient analysis anytime) */}
            <GlassCard
              glow
              interactive={false}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#14A39A]/35"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>
                    {isFr
                      ? 'Moteur Clinique Backend Actif · Défi 04 (WCV & IFHAS v8)'
                      : 'Active Backend Clinical Engine · Challenge 04 (WCV & IFHAS v8)'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0B3B3C] font-heading">
                  {isFr
                    ? 'Lancer une Analyse Préventive sur Mesure ou Évaluer un Dossier'
                    : 'Launch a Custom Preventive Analysis or Evaluate a Patient Record'}
                </h2>
                <p className="text-xs text-[#334155] max-w-3xl leading-relaxed">
                  {isFr
                    ? 'Saisissez librement les paramètres cliniques d’un patient (Protocole TA 2/3 mesures, IMC, 8 items FINDRISC, facteurs OMS 2019, courbe OMS enfant, prématurité <37 SA) pour exécuter les calculs mathématiques en backend.'
                    : 'Input any patient clinical parameters (2/3-reading BP protocol, BMI, 8 FINDRISC items, WHO 2019 CVD factors, child WHO Z-scores, prematurity <37w) to run real-time backend calculations.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnalysisForm({ ...DEFAULT_ANALYSIS_FORM, patientId: undefined });
                  setActionError(null);
                  setShowNewAnalysisModal((prev) => !prev);
                }}
                className="px-4 py-3 rounded-2xl btn-liquid-primary text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {showNewAnalysisModal
                    ? isFr
                      ? 'Fermer le Calculateur Clinique'
                      : 'Close Clinical Workbench'
                    : isFr
                    ? '+ Nouvelle Analyse Clinique Guidée (U2)'
                    : '+ New Guided Clinical Analysis (U2)'}
                </span>
              </button>
            </GlassCard>

            {showNewAnalysisModal && (
              <GlassCard interactive={false} className="border-2 border-[#0F6B6B]/30">
                {renderGuidedAnalysisForm(true)}
              </GlassCard>
            )}

            {/* Competent Service: Definitive Validation of Majority Detachment (18y+) */}
            {pendingMajorityList.length > 0 && (
              <GlassCard
                interactive={false}
                className="p-4 border border-[#0F6B6B]/35 bg-[#F0FDFA]/85 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Service Compétent (Médecin) · Validation Définitive de Majorité (18 ans+)'
                        : 'Competent Service (Clinician) · Definitive Majority Detachment Validation (18y+)'}
                    </span>
                    <p className="text-xs text-[#334155]">
                      {isFr
                        ? 'Validez définitivement le détachement parental des jeunes ayant atteint 18 ans pour activer leur dossier autonome Adulte IFHAS.'
                        : 'Definitively validate parental detachment for 18y+ youth to activate their autonomous Adult IFHAS record.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {pendingMajorityList.map((item) => (
                    <div
                      key={item.childId}
                      className="p-3 rounded-xl bg-white border border-[#99F6E4] flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-[#0B3B3C] block">
                          {item.childName} ({item.ageYears} ans · {item.childId})
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {isFr ? 'Rattaché au parent :' : 'Affiliated to parent:'} {item.parentName} (
                          {item.parentId})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApproveMajority(item.childId, item.childName)}
                        className="px-3 py-1.5 rounded-xl btn-liquid-primary font-bold cursor-pointer"
                      >
                        {isFr
                          ? 'Valider définitivement la majorité (18 ans+)'
                          : 'Definitively Validate Majority (18y+)'}
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title={isFr ? 'Patients suivis' : 'Active Panel'}
                value={patients.length}
                subtitle="7 Personas + Custom Analyses"
                icon={<Users className="w-4 h-4" />}
              />
              <StatCard
                title={isFr ? 'Urgences Rouges' : 'Urgent Red'}
                value={redCount}
                subtitle="Same-day clinical review"
                icon={<AlertTriangle className="w-4 h-4 text-[#B91C1C]" />}
              />
              <StatCard
                title={isFr ? 'Dossiers Gris' : 'Level Grey'}
                value={greyCount}
                subtitle="Measures to complete"
                icon={<HelpCircle className="w-4 h-4 text-[#475569]" />}
              />
              <StatCard
                title={isFr ? 'Suivis Orange' : 'Priority Orange'}
                value={overdueCount}
                subtitle="14-day clinical window"
                icon={<Clock className="w-4 h-4 text-[#C2410C]" />}
              />
            </div>

            {/* Filter & Search Bar */}
            <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#64748B] absolute start-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isFr ? 'Rechercher un patient ou motif...' : 'Search patient or reason...'
                  }
                  className="w-full ps-10 pe-4 py-2 rounded-xl border border-[#E2E8F0] text-xs bg-white/90"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 text-xs">
                <div className="flex items-center gap-1 bg-[#F1F5F9]/90 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                  {(['all', 'red', 'orange', 'yellow', 'grey', 'green'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevelFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap shrink-0 ${
                        levelFilter === lvl ? 'bg-white text-[#0B3B3C] shadow-2xs' : 'text-[#64748B]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <select
                  aria-label="Filter by pathway"
                  value={pathwayFilter}
                  onChange={(e) => setPathwayFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white/90 font-semibold text-[#0B3B3C]"
                >
                  <option value="all">All Pathways</option>
                  <option value="child">Child (0–9y)</option>
                  <option value="adolescent">Adolescent (10–17y)</option>
                  <option value="adult">Adult (18y+)</option>
                </select>
              </div>
            </div>

            {/* Mobile Clinical Patient Cards (< 768px) */}
            <div className="md:hidden space-y-3">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPatientId(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPatientId(p.id);
                    }
                  }}
                  className="liquid-glass rounded-2xl p-4 space-y-2.5 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-[#0B3B3C] block font-heading">
                        {p.displayName}
                      </span>
                      <span className="text-[11px] text-[#64748B] capitalize">
                        {p.ageYears >= 2 ? `${p.ageYears} yrs` : `${p.ageMonths} mos`} · {p.pathwayType}
                        {p.isPersona ? ' · Persona' : ' · Analyse personnalisée'}
                      </span>
                    </div>
                    <LevelBadge level={p.overallLevel} size="sm" />
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed">{p.primaryReasonSummary}</p>
                  <div className="pt-2 border-t border-[#E2E8F0]/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <StatusChip state={p.pathwayState} />
                      <CertaintyBadge certainty={p.overallCertainty} />
                    </div>
                    <span className="font-mono text-[#64748B]">{p.nextDueDate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Patient Roster Table (>= 768px) */}
            <GlassCard interactive={false} className="hidden md:block !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-white/60 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <tr>
                      <th className="py-3.5 px-5 text-start">Patient</th>
                      <th className="py-3.5 px-4 text-start">Pathway</th>
                      <th className="py-3.5 px-4 text-start">Level</th>
                      <th className="py-3.5 px-4 text-start">Main Preventive Reason</th>
                      <th className="py-3.5 px-4 text-start">Due Date</th>
                      <th className="py-3.5 px-4 text-start">State</th>
                      <th className="py-3.5 px-5 text-start">Certainty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]/70">
                    {filteredPatients.map((p) => (
                      <tr
                        key={p.id}
                        tabIndex={0}
                        onClick={() => setSelectedPatientId(p.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPatientId(p.id);
                          }
                        }}
                        className="hover:bg-[#F2FAF8]/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-[#0B3B3C] block">{p.displayName}</span>
                          <span className="text-[11px] text-[#64748B] tabular-nums">
                            {p.ageYears >= 2 ? `${p.ageYears} yrs` : `${p.ageMonths} mos`}
                            {p.isPersona ? ' · Persona' : ' · Custom'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 capitalize font-medium text-[#334155]">
                          {p.pathwayType}
                        </td>
                        <td className="py-3.5 px-4">
                          <LevelBadge level={p.overallLevel} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-[#334155] max-w-md leading-relaxed">
                          {p.primaryReasonSummary}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#334155] whitespace-nowrap">
                          {p.nextDueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusChip state={p.pathwayState} />
                        </td>
                        <td className="py-3.5 px-5">
                          <CertaintyBadge certainty={p.overallCertainty} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* ===============================================================
           * VIEW 2: CLINICIAN PATIENT RECORD DETAIL + LIVE BACKEND CALCULATIONS
           * =============================================================== */
          patientDetail && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(null);
                    setActiveActionPanel(null);
                    setActionFeedback(null);
                    setActionError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6B6B] hover:text-[#0B3B3C] liquid-glass px-3.5 py-2 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{isFr ? 'Retour à la liste des patients' : 'Back to patients'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveActionPanel(
                      activeActionPanel === 'guided-workbench' ? null : 'guided-workbench'
                    )
                  }
                  className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>
                    {isFr
                      ? 'Modifier Paramètres & Relancer Calcul Backend (U2)'
                      : 'Edit Clinical Parameters & Recalculate (U2)'}
                  </span>
                </button>
              </div>

              {/* Patient Header */}
              <GlassCard glow interactive={false} className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B3B3C] font-heading">
                      {patientDetail.displayName}
                    </h1>
                    <LevelBadge level={patientDetail.overallLevel} />
                    <CertaintyBadge certainty={patientDetail.overallCertainty} />
                    {patientDetail.recommendations[0] && (
                      <StatusChip state={patientDetail.recommendations[0].state} />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {patientDetail.ageYears >= 2
                      ? `${patientDetail.ageYears} yrs`
                      : `${patientDetail.ageMonths} mos`}
                    {patientDetail.correctedAgeMonths !== null
                      ? ` (Corrected Prematurity Age: ${patientDetail.correctedAgeMonths} mos)`
                      : ''}{' '}
                    · {patientDetail.pathwayType.toUpperCase()} · {patientDetail.nationalityGroup || 'UAE'} ·{' '}
                    {patientDetail.facilityCenter} · {patientDetail.preferredLanguage.toUpperCase()}
                  </p>
                </div>

                {patientDetail.visualIndicators.genomicCard && (
                  <div className="card-3d rounded-2xl px-4 py-2.5 max-w-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F6B6B]">
                      <Dna className="w-4 h-4 shrink-0" />
                      <span>{patientDetail.visualIndicators.genomicCard.title}</span>
                    </div>
                    <p className="text-[11px] text-[#334155] mt-0.5 leading-snug">
                      {patientDetail.visualIndicators.genomicCard.effectSummary}
                    </p>
                  </div>
                )}
              </GlassCard>

              {/* 8 Key Clinician Action Bar */}
              <div className="liquid-glass rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                  {isFr ? 'Actions Cliniques & Saisie Guidée' : 'Clinical Consultation Controls'}
                </p>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleRunEvaluation}
                    className="px-3 sm:px-3.5 py-2 rounded-xl btn-liquid-primary text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">1. Evaluate Rules</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveActionPanel('guided-workbench')}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#14A39A] text-[#0B3B3C] text-xs font-bold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">
                      {isFr ? '2. Saisie Guidée Complète (U2)' : '2. Full Guided Input (U2)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveActionPanel('missing-data')}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ClipboardPlus className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">Quick Vitals (Grey)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAiSummary}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">3. AI Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveActionPanel('pathway-decision')}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">4. Validate Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenInvitationPreview()}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">5. Invitation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveActionPanel('confirm-visit')}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">6. Verify Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveActionPanel('conclusion')}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">7. Conclusion</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportFhir}
                    className="px-3 sm:px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-[#0B3B3C] text-xs font-semibold inline-flex items-center justify-center sm:justify-start gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                    <span className="truncate">8. FHIR R4</span>
                  </button>
                </div>
              </div>

              {actionFeedback && (
                <div className="liquid-glass border border-[#14A39A]/50 text-[#0B3B3C] px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
                  <span>{actionFeedback}</span>
                  <button
                    type="button"
                    onClick={() => setActionFeedback(null)}
                    className="font-bold text-[#0F6B6B]"
                  >
                    OK
                  </button>
                </div>
              )}

              {actionError && (
                <div className="bg-[#FEF2F2] border border-red-200 text-[#B91C1C] px-4 py-3 rounded-2xl text-xs font-semibold">
                  {actionError}
                </div>
              )}

              {/* Dynamic Action Panels */}
              {activeActionPanel === 'guided-workbench' && (
                <GlassCard interactive={false} className="border-2 border-[#0F6B6B]/30">
                  {renderGuidedAnalysisForm(false)}
                </GlassCard>
              )}

              {activeActionPanel === 'missing-data' && (
                <GlassCard interactive={false}>
                  <form onSubmit={handleSubmitMissingData} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                      Complete Missing Measurements (Resolves Level Grey)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Systolic BP</label>
                        <input
                          type="number"
                          value={sysInput}
                          onChange={(e) => setSysInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Diastolic BP</label>
                        <input
                          type="number"
                          value={diaInput}
                          onChange={(e) => setDiaInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weightInput}
                          onChange={(e) => setWeightInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Height (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={heightInput}
                          onChange={(e) => setHeightInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold"
                      >
                        Save & Re-evaluate
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActionPanel(null)}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {activeActionPanel === 'ai-summary' && aiSummaryText && (
                <AiSuggestionPanel
                  initialText={aiSummaryText}
                  onDecision={(decision) => {
                    setActionFeedback(`AI summary ${decision} by clinician.`);
                  }}
                />
              )}

              {activeActionPanel === 'pathway-decision' && (
                <GlassCard interactive={false}>
                  <form onSubmit={handlePathwayDecision} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                      Validate, Adapt, or Defer Care Plan
                    </h3>
                    <div className="flex items-center gap-4 text-xs">
                      {(['validate', 'adapt', 'defer'] as const).map((opt) => (
                        <label
                          key={opt}
                          className="inline-flex items-center gap-1.5 font-semibold capitalize cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="pathwayAction"
                            checked={pathwayActionType === opt}
                            onChange={() => setPathwayActionType(opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {(pathwayActionType === 'adapt' || pathwayActionType === 'defer') && (
                      <div>
                        <label className="block text-xs font-semibold text-[#0B3B3C] mb-1">
                          Clinical reason (mandatory):
                        </label>
                        <input
                          type="text"
                          value={pathwayReason}
                          onChange={(e) => setPathwayReason(e.target.value)}
                          placeholder="e.g., Rescheduled 3 weeks due to acute viral recovery"
                          className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs bg-white"
                          required
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold"
                      >
                        Record Decision
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActionPanel(null)}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {activeActionPanel === 'invitation' && invitationPreview && (
                <GlassCard interactive={false} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                      Culturally Adapted Invitation (M2 Safety Active)
                    </h3>
                    <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs">
                      {(['en', 'fr', 'ar'] as Locale[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => {
                            setInvitationLang(l);
                            handleOpenInvitationPreview(l);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-semibold uppercase ${
                            invitationLang === l ? 'bg-white text-[#0B3B3C]' : 'text-[#64748B]'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Channel: <strong>{invitationPreview.channel}</strong> · Zero diagnostic or score terms permitted.
                  </p>
                  <textarea
                    rows={3}
                    value={invitationCustomText}
                    onChange={(e) => setInvitationCustomText(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] p-3 text-xs text-[#334155] bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendValidatedInvitation}
                      className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold"
                    >
                      Approve & Send
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveActionPanel(null)}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </GlassCard>
              )}

              {activeActionPanel === 'confirm-visit' && (
                <GlassCard interactive={false}>
                  <form onSubmit={handleConfirmVisitCode} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                      Verify 8-Character Orientation Pass
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Expected pass:{' '}
                      <code className="font-mono font-bold text-[#0B3B3C]">
                        {patientDetail.recommendations[0]?.referralCodeDisplay}
                      </code>
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={referralCodeInput}
                        onChange={(e) => setReferralCodeInput(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] font-mono text-sm uppercase bg-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold"
                      >
                        Verify & Confirm Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActionPanel(null)}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {activeActionPanel === 'conclusion' && (
                <GlassCard interactive={false}>
                  <form onSubmit={handleRecordConclusion} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                      Record Visit Conclusion
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <label className="inline-flex items-center gap-1.5">
                        <input
                          type="radio"
                          checked={conclusionStatus === 'normal'}
                          onChange={() => setConclusionStatus('normal')}
                        />
                        <span>Routine Follow-Up</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5">
                        <input
                          type="radio"
                          checked={conclusionStatus === 'abnormal'}
                          onChange={() => setConclusionStatus('abnormal')}
                        />
                        <span>Condition Confirmed</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={conclusionNotes}
                      onChange={(e) => setConclusionNotes(e.target.value)}
                      placeholder="Clinical notes..."
                      className="w-full rounded-xl border border-[#E2E8F0] p-3 text-xs bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold"
                      >
                        Save Conclusion
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActionPanel(null)}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* Record Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 liquid-glass p-1.5 rounded-2xl w-fit">
                {(
                  [
                    {
                      id: 'calculations',
                      label: isFr
                        ? 'Calculs Backend (OMS / FINDRISC / TA)'
                        : 'Backend Calculations (WHO / FINDRISC / BP)',
                    },
                    { id: 'flags', label: `Flags (${patientDetail.flags.length})` },
                    { id: 'pathway', label: 'Consolidated CarePlan' },
                    { id: 'measures', label: 'Trends' },
                    { id: 'summary', label: 'Summary' },
                    { id: 'consents', label: 'Consents & Audit' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                      detailTab === tab.id
                        ? 'bg-[#0B3B3C] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#0B3B3C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: LIVE BACKEND CLINICAL CALCULATIONS (WHO 2019, FINDRISC, BP PROTOCOL, Z-SCORES, CERTAINTY) */}
              {detailTab === 'calculations' && patientDetail.calculations && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Card A: Blood Pressure 2/3-Reading Protocol */}
                    <GlassCard interactive={false} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                          {isFr
                            ? 'Protocole TA Guidé (2 ou 3 mesures · Section 4.7)'
                            : 'Guided BP Protocol (2 or 3 readings · Section 4.7)'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0FDFA] text-[#0B3B3C] border border-[#99F6E4]">
                          {patientDetail.calculations.bpProtocol.bpZoneLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[11px] text-[#64748B] block">Mesure 1</span>
                          <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                            {patientDetail.calculations.bpProtocol.reading1 || '—'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[11px] text-[#64748B] block">Mesure 2</span>
                          <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                            {patientDetail.calculations.bpProtocol.reading2 || '—'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#14A39A]/40">
                          <span className="text-[11px] text-[#0F6B6B] font-semibold block">
                            {isFr ? 'Moyenne retenue' : 'Retained Mean'}
                          </span>
                          <span className="font-mono font-extrabold text-sm text-[#0B3B3C]">
                            {patientDetail.calculations.bpProtocol.retainedSys !== null
                              ? `${patientDetail.calculations.bpProtocol.retainedSys}/${patientDetail.calculations.bpProtocol.retainedDia} mmHg`
                              : isFr
                              ? 'Non mesurée'
                              : 'Not measured'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#334155]">
                        {patientDetail.calculations.bpProtocol.requiresThirdReading
                          ? isFr
                            ? `Écart entre Mesure 1 et Mesure 2 : Δ ${patientDetail.calculations.bpProtocol.spreadSys ?? 0}/${patientDetail.calculations.bpProtocol.spreadDia ?? 0} mmHg (> 10/6 mmHg). La moyenne porte sur les mesures 2 et 3.`
                            : `Spread between Reading 1 & 2: Δ ${patientDetail.calculations.bpProtocol.spreadSys ?? 0}/${patientDetail.calculations.bpProtocol.spreadDia ?? 0} mmHg (> 10/6 mmHg). Retained mean uses readings 2 & 3.`
                          : isFr
                          ? 'Écart ≤ 10/6 mmHg entre les mesures : protocole de mesure validé.'
                          : 'Spread ≤ 10/6 mmHg between readings: standard protocol verified.'}
                      </p>
                    </GlassCard>

                    {/* Card B: WHO 2019 Non-Lab 10-Year CVD Risk + Uncertainty + Counterfactual Attribution */}
                    <GlassCard interactive={false} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                          {isFr
                            ? 'Modèle OMS 2019 sans labo (Risque CV à 10 ans)'
                            : 'WHO 2019 Non-Lab Model (10-Year CVD Risk)'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#0B3B3C]">
                          {patientDetail.calculations.whoCvdModel.inDomain
                            ? '40–74 yrs'
                            : 'TEST-S4 (< 40 yrs)'}
                        </span>
                      </div>

                      {patientDetail.calculations.whoCvdModel.riskPercent !== null ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div>
                              <span className="text-xs text-[#64748B] block">
                                {isFr ? 'Risque CV à 10 ans estimé' : 'Estimated 10-Year CVD Risk'}
                              </span>
                              <span className="text-2xl font-extrabold font-mono text-[#0B3B3C]">
                                {patientDetail.calculations.whoCvdModel.riskPercent}%
                              </span>
                            </div>
                            <div className="text-end">
                              <span className="text-[11px] text-[#64748B] block">
                                {isFr ? 'Intervalle d’incertitude (±1,96σ)' : 'Uncertainty Interval (±1.96σ)'}
                              </span>
                              <span className="font-mono font-bold text-xs text-[#0F6B6B]">
                                [{patientDetail.calculations.whoCvdModel.intervalLowPercent}% –{' '}
                                {patientDetail.calculations.whoCvdModel.intervalHighPercent}%]
                              </span>
                              {patientDetail.calculations.whoCvdModel.crossesThreshold && (
                                <span className="block text-[10px] text-amber-800 font-semibold">
                                  {isFr
                                    ? 'Chevauche le seuil de 10 % → Certitude Moyenne'
                                    : 'Crosses 10% threshold → Medium Certainty'}
                                </span>
                              )}
                            </div>
                          </div>

                          {patientDetail.calculations.whoCvdModel.counterfactuals.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-[#0B3B3C] block">
                                {isFr
                                  ? 'Attribution Contrefactuelle des Facteurs Modifiables (Annexe B) :'
                                  : 'Counterfactual Modifiable Risk Attribution (Annex B):'}
                              </span>
                              {patientDetail.calculations.whoCvdModel.counterfactuals.map((cf, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]"
                                >
                                  <span className="text-[#0B3B3C] font-medium">
                                    {cf.factor} ({cf.currentValue} → {cf.targetValue})
                                  </span>
                                  <span className="font-mono font-bold text-[#0F6B6B]">
                                    -{cf.riskReductionPct}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155]">
                          <strong className="text-[#0B3B3C] block mb-1">
                            {patientDetail.calculations.whoCvdModel.domainNote}
                          </strong>
                          {isFr
                            ? 'Conformément à la règle de domaine d’applicabilité (TEST-S4), le modèle OMS 2019 (40–74 ans) n’est jamais extrapolé aux patients < 40 ans.'
                            : 'Per Applicability Domain Safeguard (TEST-S4), the WHO 2019 equation (40–74y) is never extrapolated below age 40.'}
                        </div>
                      )}
                    </GlassCard>

                    {/* Card C: FINDRISC 8-Item Score Breakdown (0-26 pts) OR Pediatric Growth Z-Scores */}
                    {patientDetail.calculations.findriscModel.score !== null ? (
                      <GlassCard interactive={false} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                            {isFr
                              ? 'Score FINDRISC Officiel (8 items · 0–26 pts)'
                              : 'Official FINDRISC Score (8 items · 0–26 pts)'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono bg-[#0B3B3C] text-white">
                            {patientDetail.calculations.findriscModel.score} / 26 pts
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#0B3B3C]">
                            {patientDetail.calculations.findriscModel.levelLabel}
                          </span>
                          {patientDetail.calculations.findriscModel.asianBmiRuleA4Triggered && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]">
                              {isFr
                                ? 'Règle A4 Asie du Sud : seuil IMC abaissé à ≥ 23'
                                : 'Rule A4 South Asia: BMI threshold lowered to ≥ 23'}
                            </span>
                          )}
                        </div>

                        <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-white overflow-hidden text-xs">
                          {patientDetail.calculations.findriscModel.itemBreakdown.map((row, idx) => (
                            <div key={idx} className="px-3 py-1.5 flex items-center justify-between">
                              <span className="text-[#334155] font-medium">{row.item}</span>
                              <span className="font-mono font-bold text-[#0F6B6B]">+{row.points} pt</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    ) : (
                      <GlassCard interactive={false} className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                          {isFr
                            ? 'Croissance Pédiatrique OMS & Âge Corrigé (P1–P11)'
                            : 'WHO Pediatric Growth & Corrected Age (P1–P11)'}
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">Score Z Poids/Taille</span>
                            <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                              {patientDetail.calculations.anthropometry.weightForHeightZ ?? '—'} SD
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">MUAC (Périmètre)</span>
                            <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                              {patientDetail.calculations.anthropometry.muacMm
                                ? `${patientDetail.calculations.anthropometry.muacMm} mm`
                                : '—'}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]">
                            <span className="text-[11px] text-[#0F6B6B] font-semibold block">
                              {isFr ? 'Âge corrigé (<37 SA)' : 'Corrected Age (<37w)'}
                            </span>
                            <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                              {patientDetail.calculations.anthropometry.correctedAgeMonths !== null
                                ? `${patientDetail.calculations.anthropometry.correctedAgeMonths} mos`
                                : isFr
                                ? 'Né à terme'
                                : 'Full-term'}
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    )}

                    {/* Card D: Anthropometry, Data Certainty Audit & Eclipse Safeguard */}
                    <GlassCard interactive={false} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                          {isFr
                            ? 'Anthropométrie, Certitude & Provenance (V/M/D/S)'
                            : 'Anthropometry, Certainty & Provenance (V/M/D/S)'}
                        </span>
                        <CertaintyBadge certainty={patientDetail.calculations.certaintyAudit.finalCertainty} />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[11px] text-[#64748B] block">IMC / BMI</span>
                          <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                            {patientDetail.calculations.anthropometry.bmi
                              ? `${patientDetail.calculations.anthropometry.bmi} kg/m²`
                              : '—'}
                          </span>
                          <span className="text-[10px] text-[#64748B] block">
                            {patientDetail.calculations.anthropometry.waistCm
                              ? `Tour de taille: ${patientDetail.calculations.anthropometry.waistCm} cm`
                              : 'Anthropométrie'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[11px] text-[#64748B] block">
                            {isFr ? 'Complétude' : 'Completeness'}
                          </span>
                          <span className="font-mono font-bold text-sm text-[#0B3B3C]">
                            {patientDetail.calculations.certaintyAudit.completenessPercent}%
                          </span>
                          <span className="text-[10px] text-[#64748B] block">
                            Ancienneté max: {patientDetail.calculations.certaintyAudit.oldestMeasureMonths}m
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                          <span className="text-[11px] text-[#64748B] block">
                            {isFr ? 'Règle d’Éclipse' : 'Eclipse Rule'}
                          </span>
                          <span className="font-bold text-xs text-[#0B3B3C] block mt-0.5">
                            {patientDetail.calculations.eclipseSafeguard.activeRedFlag
                              ? isFr
                                ? 'Active (Relances suspendues)'
                                : 'Active (Routine paused)'
                              : isFr
                              ? 'Aucune suspension'
                              : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#334155] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                        <span>{patientDetail.calculations.certaintyAudit.certaintyReason}</span>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}

              {/* TAB 2: FLAGS */}
              {detailTab === 'flags' && (
                <div className="space-y-4">
                  {patientDetail.flags.map((flg) => (
                    <GlassCard key={flg.id} interactive={false} className="space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <LevelBadge level={flg.level} />
                          <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                            {flg.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <CertaintyBadge certainty={flg.certainty} reason={flg.certaintyReason} />
                          <span className="text-xs font-mono text-[#64748B]">{flg.dueDate}</span>
                        </div>
                      </div>

                      {flg.isEclipseSuspended && (
                        <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 text-xs font-medium flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>
                            Eclipse Safeguard (TEST-S2): Routine outreach paused while urgent Red flag or specialist care is active.
                          </span>
                        </div>
                      )}

                      <ul className="text-xs text-[#334155] space-y-1 list-disc ps-5">
                        {flg.factors.map((fac, idx) => (
                          <li key={idx}>{fac}</li>
                        ))}
                      </ul>

                      <div className="pt-2.5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
                        <span>
                          Source: <strong className="text-[#0B3B3C]">{flg.sourceLabel}</strong>
                        </span>
                        <span>
                          Missing:{' '}
                          <strong className="text-[#0B3B3C]">
                            {flg.missingData.length > 0 ? flg.missingData.join(', ') : 'None'}
                          </strong>
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* TAB 3: SUMMARY */}
              {detailTab === 'summary' && (
                <GlassCard interactive={false} className="space-y-2">
                  <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                    Clinical Summary
                  </h3>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {patientDetail.primaryReasonSummary}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Next window: <strong>{patientDetail.nextDueDate}</strong> ·{' '}
                    <strong>{patientDetail.facilityCenter}</strong>
                  </p>
                </GlassCard>
              )}

              {/* TAB 4: PATHWAY */}
              {detailTab === 'pathway' && (
                <GlassCard interactive={false} className="space-y-4">
                  {patientDetail.recommendations.map((rec) => (
                    <div key={rec.id} className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                            {rec.pathwayTitle}
                          </h3>
                          <p className="text-xs text-[#64748B]">
                            Pass:{' '}
                            <span className="font-mono font-bold text-[#0B3B3C]">
                              {rec.referralCodeDisplay}
                            </span>{' '}
                            · {rec.facilityName}
                          </p>
                        </div>
                        <StatusChip state={rec.state} />
                      </div>
                      <div className="space-y-2">
                        {rec.groupedActions.map((act, idx) => (
                          <div
                            key={idx}
                            className="card-3d p-3.5 rounded-2xl flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-[#0B3B3C]">{act.actionTitle}</span>
                            <span className="text-[#64748B]">{act.directiveSource}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </GlassCard>
              )}

              {/* TAB 5: MEASURES */}
              {detailTab === 'measures' && (
                <GlassCard interactive={false} className="space-y-4">
                  <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                    Longitudinal Measurements
                  </h3>
                  {patientDetail.visualIndicators.bpSeries.length > 0 ? (
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={patientDetail.visualIndicators.bpSeries}>
                          <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                          <YAxis domain={[60, 170]} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="systolic"
                            stroke="#0F6B6B"
                            fill="#D5F2EE"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="diastolic"
                            stroke="#2F6FDE"
                            fill="#EFF6FF"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : patientDetail.visualIndicators.growthSeries.length > 0 ? (
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={patientDetail.visualIndicators.growthSeries}>
                          <XAxis dataKey="ageLabel" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#0F6B6B"
                            fill="#D5F2EE"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B]">
                      No longitudinal chart recorded yet. Use "2. Full Guided Input (U2)" above.
                    </p>
                  )}
                </GlassCard>
              )}

              {/* TAB 6: CONSENTS & HISTORY */}
              {detailTab === 'consents' && (
                <GlassCard interactive={false} className="space-y-4">
                  <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                    Consent & Audit Trail
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start">
                      <thead className="border-b border-[#E2E8F0] text-[#64748B]">
                        <tr>
                          <th className="py-2 px-3 text-start">Actor</th>
                          <th className="py-2 px-3 text-start">Category</th>
                          <th className="py-2 px-3 text-start">Purpose</th>
                          <th className="py-2 px-3 text-start">Rule</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {patientDetail.usageLogs.map((l) => (
                          <tr key={l.id}>
                            <td className="py-2.5 px-3 font-semibold text-[#0B3B3C]">{l.actorName}</td>
                            <td className="py-2.5 px-3">{l.dataCategory}</td>
                            <td className="py-2.5 px-3 text-[#64748B]">{l.purposeDescription}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">{l.ruleVersionRef}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )
        )}
      </main>
    </div>
  );
};
