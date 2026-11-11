import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Calendar,
  Bell,
  User,
  Shield,
  HelpCircle,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  Baby,
  Download,
  Lock,
  Smartphone,
  UserCheck,
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useI18n } from '../lib/i18n.tsx';
import { apiClient } from '../lib/api.ts';
import { useRiskAnalysis } from '../hooks/useRiskAnalysis.ts';
import {
  MediSenseLogo,
  DemoBanner,
  LanguageSwitch,
  StatusChip,
  LevelBadge,
  CertaintyBadge,
  Ring,
  PassQrCard,
  ConsentToggle,
  GlassCard,
} from './MediSenseUI.tsx';
import { ConsentState } from '../lib/types.ts';

interface PatientPortalProps {
  role: 'patient' | 'parent';
  onLogout: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  onLogout,
}) => {
  const { locale, t } = useI18n();
  const isFr = locale === 'fr';
  const isAr = locale === 'ar';

  // Unified Patient Portal defaults to adult patient Tariq Al-Nadim (PT-36Y-TARIQ)
  const [activePatientId, setActivePatientId] = useState<string>('PT-36Y-TARIQ');
  const [activeTab, setActiveTab] = useState<
    'home' | 'checkup' | 'journey' | 'notifications' | 'profile' | 'privacy'
  >('home');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDecisionAid, setShowDecisionAid] = useState(false);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('2026-12-04');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'action'>('all');

  // Custom React hook managing backend analytical risk assessment & loading state
  const {
    assessment: riskAssessment,
    loading: isAnalyzingRisk,
    error: riskAnalysisError,
    triggerRiskAnalysis,
    syncAssessmentFromProfile,
    clearError: clearRiskError,
  } = useRiskAnalysis();

  // SMS OTP Gate for accessing affiliated children (<18y or attached 18y)
  const [verifiedChildIds, setVerifiedChildIds] = useState<string[]>([]);
  const [pendingOtpChild, setPendingOtpChild] = useState<{
    parentId: string;
    childId: string;
    childName: string;
    maskedPhone: string;
    demoOtpCode: string;
  } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Guided Self-Assessment & Home Vitals Form (Provenance D)
  const [selfForm, setSelfForm] = useState({
    systolicBp1: '128',
    diastolicBp1: '82',
    systolicBp2: '126',
    diastolicBp2: '80',
    weightKg: '78',
    heightCm: '175',
    waistCm: '94',
    dailyPhysicalActivity: true,
    dailyFruitsVeg: true,
    smokingStatus: false,
    antihypertensiveMedHistory: false,
    highBloodGlucoseHistory: false,
    familyHistoryDiabetesLevel: 'none',
    familyPrematureCvd: false,
    isPregnant: false,
    mchatScore: '1',
    redFlagWarningSymptom: false,
  });

  const loadProfile = async (pid: string) => {
    try {
      setLoading(true);
      clearRiskError();
      const res = await apiClient.getPatientPortalProfile(pid);
      setData(res);
      syncAssessmentFromProfile(res?.profile);
      const cp = res?.profile?.clinicalProfile || {};
      const isChildProfile = res?.profile?.pathwayType !== 'adult';
      setSelfForm({
        systolicBp1: cp.systolicBp1 ? String(cp.systolicBp1) : '128',
        diastolicBp1: cp.diastolicBp1 ? String(cp.diastolicBp1) : '82',
        systolicBp2: cp.systolicBp2 ? String(cp.systolicBp2) : '126',
        diastolicBp2: cp.diastolicBp2 ? String(cp.diastolicBp2) : '80',
        weightKg: cp.weightKg ? String(cp.weightKg) : isChildProfile ? '10.8' : '78',
        heightCm: cp.heightCm ? String(cp.heightCm) : isChildProfile ? '81' : '175',
        waistCm: cp.waistCm ? String(cp.waistCm) : '92',
        dailyPhysicalActivity:
          cp.dailyPhysicalActivity !== undefined ? Boolean(cp.dailyPhysicalActivity) : true,
        dailyFruitsVeg: cp.dailyFruitsVeg !== undefined ? Boolean(cp.dailyFruitsVeg) : true,
        smokingStatus: Boolean(cp.smokingStatus),
        antihypertensiveMedHistory: Boolean(cp.antihypertensiveMedHistory),
        highBloodGlucoseHistory: Boolean(cp.highBloodGlucoseHistory),
        familyHistoryDiabetesLevel: cp.familyHistoryDiabetesLevel || 'none',
        familyPrematureCvd: Boolean(cp.familyPrematureCvd),
        isPregnant: Boolean(cp.isPregnant),
        mchatScore: cp.mchatScore !== undefined ? String(cp.mchatScore) : '1',
        redFlagWarningSymptom: Boolean(cp.redFlagWarningSymptom),
      });
    } catch (err) {
      console.error('Error loading patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(activePatientId);
  }, [activePatientId]);

  const rootParent = data?.familyContext?.rootParent || {
    id: 'PT-36Y-TARIQ',
    displayName: 'Tariq Al-Nadim',
    ageYears: 36,
    pathwayType: 'adult',
  };
  const affiliatedChildren: Array<{
    id: string;
    displayName: string;
    ageYears: number;
    ageMonths: number;
    pathwayType: string;
    overallLevel: string;
    eligibleForMajorityDetachment: boolean;
    majorityDetachmentRequested: boolean;
  }> = data?.familyContext?.affiliatedChildren || [];

  const isViewingChild = activePatientId !== rootParent.id;

  const handleSelectFamilyMember = async (targetId: string) => {
    if (targetId === activePatientId) return;
    if (targetId === rootParent.id || verifiedChildIds.includes(targetId)) {
      setActivePatientId(targetId);
      return;
    }
    try {
      setOtpError(null);
      const otpRes = await apiClient.requestFamilySmsOtp(rootParent.id, targetId);
      setPendingOtpChild({
        parentId: rootParent.id,
        childId: otpRes.childId,
        childName: otpRes.childName,
        maskedPhone: otpRes.maskedPhone,
        demoOtpCode: otpRes.demoOtpCode,
      });
      setOtpInput(otpRes.demoOtpCode);
    } catch (err: any) {
      setFeedbackBanner(err.message);
    }
  };

  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingOtpChild) return;
    try {
      setVerifyingOtp(true);
      setOtpError(null);
      await apiClient.verifyFamilySmsOtp(
        pendingOtpChild.parentId,
        pendingOtpChild.childId,
        otpInput
      );
      setVerifiedChildIds((prev) =>
        prev.includes(pendingOtpChild.childId) ? prev : [...prev, pendingOtpChild.childId]
      );
      const childName = pendingOtpChild.childName;
      const targetChildId = pendingOtpChild.childId;
      setPendingOtpChild(null);
      setOtpInput('');
      setActivePatientId(targetChildId);
      setFeedbackBanner(
        isFr
          ? `Accès parental confirmé par SMS OTP. Vous consultez désormais le dossier affilié de ${childName}.`
          : `Parental access confirmed via SMS OTP. Now viewing ${childName}'s affiliated record.`
      );
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRequestMajorityDetachment = async (childId: string) => {
    try {
      const res = await apiClient.requestMajorityDetachment(childId);
      setFeedbackBanner(res.message);
      await loadProfile(activePatientId);
    } catch (err: any) {
      setFeedbackBanner(err.message);
    }
  };

  const handleSelfAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await triggerRiskAnalysis(activePatientId, selfForm);
      await loadProfile(activePatientId);
      setActiveTab('home');
      setFeedbackBanner(
        isAr
          ? 'تم تحديث قياساتك وإعادة حساب مسار المتابعة الوقائية بنجاح.'
          : isFr
          ? 'Vos mesures et votre questionnaire ont été analysés en backend. Votre parcours préventif a été mis à jour.'
          : 'Your measurements and health check were analyzed by the backend engine. Your preventive plan is now updated.'
      );
    } catch {
      // Error state is managed by useRiskAnalysis
    }
  };

  const handlePatientChoice = async (choice: 'confirm' | 'postpone' | 'refuse') => {
    try {
      await apiClient.respondToRecommendation(
        activePatientId,
        choice,
        choice === 'postpone' ? rescheduleDate : undefined
      );
      setShowReschedulePicker(false);
      if (choice === 'refuse') {
        setFeedbackBanner(
          isAr
            ? 'تم تسجيل اعتذارك. توقفت جميع التذكيرات فوراً دون أي تأثير على رعايتك.'
            : isFr
            ? 'Refus enregistré. Relances arrêtées immédiatement, sans impact sur vos soins.'
            : 'Declined. All reminders stopped immediately with zero impact on care.'
        );
      } else if (choice === 'confirm') {
        setFeedbackBanner(
          isFr
            ? 'Rendez-vous confirmé. Présentez votre pass 8 caractères à l’accueil.'
            : 'Appointment confirmed. Present your 8-character pass at reception.'
        );
      } else {
        setFeedbackBanner(
          isFr ? `Reporté au ${rescheduleDate}.` : `Rescheduled to ${rescheduleDate}.`
        );
      }
      await loadProfile(activePatientId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentChange = async (key: keyof ConsentState, value: boolean) => {
    if (!data?.consents) return;
    const nextConsents: ConsentState = {
      ...data.consents,
      [key]: value,
    };
    await apiClient.updateConsents(activePatientId, nextConsents);
    setFeedbackBanner(
      isFr
        ? 'Consentement mis à jour et dossier recalculé immédiatement.'
        : 'Consent updated and preventive profile recalculated immediately.'
    );
    await loadProfile(activePatientId);
  };

  const profile = data?.profile;
  const rec = data?.nextRecommendation;
  const consents: ConsentState = data?.consents || {
    evaluationAndCalendar: true,
    channelReminders: true,
    shareWithFacility: true,
    anonymousStatistics: true,
    existingGenomicResult: false,
  };

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col pb-20 lg:pb-0">
      <DemoBanner />

      {/* Top Liquid Glass Header */}
      <header className="liquid-glass border-b border-white/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <MediSenseLogo />
            <span className="hidden md:inline text-xs font-semibold text-[#64748B] border-s border-[#E2E8F0] ps-4 truncate">
              {isFr
                ? 'Portail Patient Unifié (Dossier Personnel & Enfants Affiliés)'
                : 'Unified Patient Portal (Personal Record & Affiliated Children)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/85 text-[#0B3B3C] border border-[#D5F2EE] rounded-xl px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0F6B6B]" />
              <span>
                {isFr
                  ? `Titulaire : ${rootParent.displayName}`
                  : `Account Holder: ${rootParent.displayName}`}
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

      {/* SMS OTP Verification Modal when switching to an affiliated child */}
      {pendingOtpChild && (
        <div className="fixed inset-0 z-50 bg-[#072627]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white border border-[#D5F2EE] shadow-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0F6B6B] shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                    {isFr ? 'Sécurité Accès Parental · SMS OTP' : 'Parental Access Security · SMS OTP'}
                  </span>
                  <h3 className="text-base font-extrabold text-[#0B3B3C] font-heading">
                    {isFr
                      ? `Accéder au dossier de ${pendingOtpChild.childName}`
                      : `Access ${pendingOtpChild.childName}'s Record`}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#334155] leading-relaxed">
              {isFr
                ? `Un code de confirmation à 6 chiffres a été envoyé par SMS au numéro rattaché à votre dossier parent (${pendingOtpChild.maskedPhone}).`
                : `A 6-digit confirmation code was sent via SMS to the mobile number linked to your parent profile (${pendingOtpChild.maskedPhone}).`}
            </p>

            <div className="p-3 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0B3B3C]">
                {isFr ? 'Code SMS reçu (Simulation Démo) :' : 'SMS Code received (Demo Simulation):'}
              </span>
              <span className="font-mono font-extrabold text-sm text-[#0F6B6B] bg-white px-2.5 py-1 rounded-lg border border-[#99F6E4]">
                {pendingOtpChild.demoOtpCode}
              </span>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifySmsOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0B3B3C] mb-1">
                  {isFr ? 'Code de confirmation SMS (6 chiffres)' : '6-Digit SMS Confirmation Code'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#CBD5E1] font-mono text-center text-base font-extrabold tracking-widest text-[#0B3B3C]"
                  placeholder="000000"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPendingOtpChild(null);
                    setOtpError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-slate-50 cursor-pointer"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {verifyingOtp
                      ? isFr
                        ? 'Vérification...'
                        : 'Verifying...'
                      : isFr
                      ? 'Confirmer par SMS & Ouvrir le dossier'
                      : 'Confirm via SMS & Open Record'}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-6xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-3 sm:px-6 py-4 sm:py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5">
          {/* Unified Patient & Affiliated Children Switcher */}
          <GlassCard interactive={false} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                {isAr ? 'ملفي وأطفالي' : isFr ? 'Mon Dossier & Enfants Affiliés' : 'My Record & Affiliated Children'}
              </p>
            </div>

            {/* 1. Adult Root Patient Record */}
            <button
              type="button"
              onClick={() => handleSelectFamilyMember(rootParent.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-start transition-all cursor-pointer ${
                activePatientId === rootParent.id
                  ? 'bg-[#0B3B3C] text-white shadow-sm'
                  : 'hover:bg-white/80 text-[#0B3B3C] border border-[#E2E8F0]'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  activePatientId === rootParent.id
                    ? 'bg-white text-[#0B3B3C]'
                    : 'bg-[#F1F5F9] text-[#0B3B3C]'
                }`}
              >
                TA
              </span>
              <div className="truncate flex-1">
                <p className="text-xs font-bold truncate">{rootParent.displayName}</p>
                <p
                  className={`text-[11px] ${
                    activePatientId === rootParent.id ? 'text-white/85' : 'text-[#64748B]'
                  }`}
                >
                  {isFr ? `Mon Dossier Adulte (${rootParent.ageYears} ans · IFHAS)` : `My Adult Record (${rootParent.ageYears}y · IFHAS)`}
                </p>
              </div>
            </button>

            {/* 2. Affiliated Children (< 18y or 18y pending detachment) */}
            <div className="pt-1 border-t border-[#E2E8F0] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                {isFr
                  ? `Enfants rattachés (${affiliatedChildren.length}) · Accès SMS`
                  : `Affiliated Children (${affiliatedChildren.length}) · SMS Gate`}
              </span>

              {affiliatedChildren.map((ch) => {
                const isVerified = verifiedChildIds.includes(ch.id);
                const isSelected = activePatientId === ch.id;
                const ageDisplay =
                  ch.ageYears < 2 ? `${ch.ageMonths}m` : `${ch.ageYears} ${isFr ? 'ans' : 'yrs'}`;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectFamilyMember(ch.id)}
                    className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B3B3C] text-white shadow-sm'
                        : 'hover:bg-white/80 text-[#0B3B3C] border border-[#E2E8F0]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-white text-[#0B3B3C]'
                            : 'bg-[#F0FDFA] text-[#0F6B6B] border border-[#99F6E4]'
                        }`}
                      >
                        {ch.displayName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{ch.displayName}</p>
                        <p
                          className={`text-[10px] ${
                            isSelected ? 'text-white/85' : 'text-[#64748B]'
                          }`}
                        >
                          {ageDisplay} · {ch.ageYears >= 18 ? (isFr ? 'Majorité 18 ans' : '18y Majority') : 'WCV'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 inline-flex items-center gap-1 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isVerified
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>OK</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>SMS</span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] text-[#475569] leading-relaxed">
              {isFr
                ? 'Gouvernance : L’ajout d’un enfant (< 18 ans) et la validation définitive du détachement à la majorité (18 ans+) sont effectués exclusivement par le service compétent (Médecin / Coordinateur).'
                : 'Governance: Adding a minor (< 18y) and final validation of majority detachment (18y+) are performed exclusively by the competent health service.'}
            </div>
          </GlassCard>

          <nav className="liquid-glass rounded-3xl p-2.5 space-y-1">
            {[
              { id: 'home', label: isAr ? 'الرئيسية' : isFr ? 'Accueil' : 'Home', Icon: Home },
              {
                id: 'checkup',
                label: isAr ? 'تحديث قياساتي' : isFr ? 'Mon Bilan & Mesures' : 'My Health Check',
                Icon: CheckCircle2,
              },
              { id: 'journey', label: isAr ? 'مساري' : isFr ? 'Mon parcours' : 'Care Journey', Icon: Calendar },
              { id: 'notifications', label: isAr ? 'الرسائل' : isFr ? 'Messages' : 'Messages', Icon: Bell },
              { id: 'profile', label: isAr ? 'تفضيلاتي' : isFr ? 'Préférences' : 'Preferences', Icon: User },
              { id: 'privacy', label: isAr ? 'الموافقات' : isFr ? 'Consentements' : 'Consents', Icon: Shield },
            ].map((item) => {
              const IconComp = item.Icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#0B3B3C] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0B3B3C] hover:bg-white/70'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Viewport */}
        <main className="lg:col-span-9 space-y-6">
          {/* Mobile Unified Family Switcher (< lg) */}
          <div className="lg:hidden liquid-glass p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#0F6B6B]">
              <span>
                {isFr ? 'Mon Dossier & Mes Enfants Affiliés (Accès SMS)' : 'My Record & Affiliated Children (SMS Gate)'}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => handleSelectFamilyMember(rootParent.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  activePatientId === rootParent.id
                    ? 'bg-[#0B3B3C] text-white'
                    : 'bg-white/80 text-[#0B3B3C] border border-[#E2E8F0]'
                }`}
              >
                {rootParent.displayName} (Adulte)
              </button>
              {affiliatedChildren.map((ch) => {
                const isVerified = verifiedChildIds.includes(ch.id);
                const ageDisplay = ch.ageYears < 2 ? `${ch.ageMonths}m` : `${ch.ageYears}y`;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectFamilyMember(ch.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                      activePatientId === ch.id
                        ? 'bg-[#0B3B3C] text-white'
                        : 'bg-white/80 text-[#0B3B3C] border border-[#E2E8F0]'
                    }`}
                  >
                    <Baby className="w-3.5 h-3.5" />
                    <span>
                      {ch.displayName} ({ageDisplay})
                    </span>
                    {!isVerified && <Lock className="w-3 h-3 text-amber-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {feedbackBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass border border-[#14A39A]/50 text-[#0B3B3C] px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4"
            >
              <span>{feedbackBanner}</span>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                className="text-xs font-bold text-[#0F6B6B]"
              >
                OK
              </button>
            </motion.div>
          )}

          {loading || !profile ? (
            <div className="space-y-4">
              <div className="h-28 liquid-glass rounded-3xl animate-pulse" />
              <div className="h-56 liquid-glass rounded-3xl animate-pulse" />
            </div>
          ) : (
            <motion.div
              key={`${activePatientId}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* 18y Majority Transition Banner when viewing an affiliated child who reached 18 years old */}
              {isViewingChild && profile.ageYears >= 18 && (
                <GlassCard
                  interactive={false}
                  className="p-4 border-2 border-[#0F6B6B]/40 bg-[#F0FDFA]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Majorité Atteinte (18 ans+) · Transition WCV vers Portail Adulte IFHAS'
                        : 'Majority Reached (18y+) · WCV Transition to Autonomous Adult IFHAS'}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#0B3B3C] font-heading">
                      {isFr
                        ? `${profile.displayName} (${profile.ageYears} ans) est éligible à la reprise autonome de ses données`
                        : `${profile.displayName} (${profile.ageYears}y) is eligible for autonomous record ownership`}
                    </h3>
                    <p className="text-xs text-[#334155]">
                      {isFr
                        ? 'La demande de détachement est transmise au service compétent (Médecin / Coordinateur) qui valide définitivement l’autonomie du dossier.'
                        : 'The detachment request is sent to the competent service (Clinician / Coordinator) for definitive validation.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRequestMajorityDetachment(profile.id)}
                    className="px-4 py-2.5 rounded-xl btn-liquid-primary text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {isFr
                      ? 'Demander le détachement à la majorité (Service Compétent)'
                      : 'Request Majority Detachment (Competent Service)'}
                  </button>
                </GlassCard>
              )}

              {/* Concise Greeting Banner + Self-Assessment CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {profile.facilityCenter} · {profile.preferredLanguage.toUpperCase()} ·{' '}
                    {isViewingChild
                      ? isFr
                        ? `Enfant affilié à ${rootParent.displayName} (Accès SMS vérifié)`
                        : `Affiliated to ${rootParent.displayName} (SMS OTP verified)`
                      : isFr
                      ? 'Dossier Personnel Adulte (IFHAS)'
                      : 'Personal Adult Record (IFHAS)'}
                  </p>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B3B3C] font-heading">
                    {isViewingChild
                      ? isFr
                        ? `Dossier affilié : ${profile.displayName}`
                        : `Affiliated Record: ${profile.displayName}`
                      : isFr
                      ? `Bonjour, ${profile.displayName}`
                      : `Hello, ${profile.displayName}`}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'checkup' ? 'home' : 'checkup')}
                  className="px-4 py-2.5 rounded-2xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeTab === 'checkup'
                      ? isFr
                        ? 'Retour à l’accueil'
                        : 'Back to Home'
                      : isFr
                      ? '+ Saisir mes mesures / Lancer mon bilan'
                      : '+ Enter My Vitals / Run Health Check'}
                  </span>
                </button>
              </div>

              {/* TAB 1: HOME */}
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {rec && (
                    <GlassCard glow interactive={false} className="space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F6B6B]">
                            {isAr ? 'الخطوة القادمة' : isFr ? 'Prochaine étape' : 'Next Step'}
                          </span>
                          <h2 className="text-lg font-bold text-[#0B3B3C] font-heading">
                            {rec.pathwayTitle}
                          </h2>
                          <p className="text-xs text-[#64748B]">
                            {rec.facilityName} · <strong className="text-[#0B3B3C]">{rec.dueDate}</strong>
                            {rec.scheduledDate ? ` · Confirmed: ${rec.scheduledDate}` : ''}
                          </p>
                        </div>
                        <StatusChip state={rec.state} />
                      </div>

                      {/* Grouped Preventive Checks */}
                      <div className="card-3d rounded-2xl p-4 space-y-2">
                        <p className="text-xs font-bold text-[#0B3B3C]">
                          {isFr ? 'Regroupé en une seule visite :' : 'Combined in one visit:'}
                        </p>
                        <ul className="text-xs text-[#334155] space-y-1 list-disc ps-4">
                          {rec.groupedActions.map((act: any, i: number) => (
                            <li key={i}>{act.actionTitle}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Decision Aid */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowDecisionAid(!showDecisionAid)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6B6B] hover:underline"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>
                            {isAr
                              ? 'لماذا هذا الموعد؟'
                              : isFr
                              ? 'Pourquoi cette visite ? (En 4 phrases)'
                              : 'Why this visit? (4-sentence summary)'}
                          </span>
                        </button>

                        {showDecisionAid && (
                          <div className="mt-2.5 p-4 rounded-2xl bg-[#F2FAF8] border border-[#D5F2EE] text-xs text-[#334155] leading-relaxed">
                            {rec.decisionAidText}
                          </div>
                        )}
                      </div>

                      {/* 3 Real Choices: Confirm · Reschedule · Decline */}
                      <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handlePatientChoice('confirm')}
                          className="px-4 py-2.5 rounded-xl btn-liquid-primary text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('confirmBtn')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReschedulePicker(!showReschedulePicker)}
                          className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0B3B3C] text-[#0B3B3C] text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Clock className="w-4 h-4" />
                          <span>{t('postponeBtn')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePatientChoice('refuse')}
                          className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{t('refuseBtn')}</span>
                        </button>
                      </div>

                      {showReschedulePicker && (
                        <div className="p-3.5 rounded-2xl bg-white/90 border border-[#E2E8F0] flex flex-wrap items-center gap-3">
                          <label className="text-xs font-semibold text-[#0B3B3C]">
                            {isFr ? 'Nouvelle date :' : 'Preferred date:'}
                          </label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handlePatientChoice('postpone')}
                            className="px-3.5 py-1.5 rounded-xl btn-liquid-primary text-xs font-semibold"
                          >
                            {isFr ? 'Valider' : 'Save'}
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  )}

                  {/* Pass QR + Up-to-Date Ring */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rec && (
                      <PassQrCard
                        code={rec.referralCodeDisplay}
                        facilityName={profile.facilityCenter}
                      />
                    )}
                    <Ring
                      done={profile.preventionProgressDone}
                      total={profile.preventionProgressTotal}
                      label={isFr ? 'Prévention à jour' : 'Up-to-date Prevention'}
                    />
                  </div>

                  {/* Live Analytical Risk Assessment Card powered by useRiskAnalysis */}
                  {riskAssessment && (
                    <GlassCard interactive={false} className="space-y-4 border border-[#0F6B6B]/30">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] inline-flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>
                              {isFr
                                ? 'Synthèse Analytique des Risques Préventifs (Hook useRiskAnalysis)'
                                : 'Preventive Risk Assessment Summary (useRiskAnalysis Hook)'}
                            </span>
                          </span>
                          <h3 className="text-base font-extrabold text-[#0B3B3C] font-heading">
                            {riskAssessment.calculations.consolidatedCarePlan.pathwayTitle}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <LevelBadge level={riskAssessment.overallLevel} size="sm" />
                          <CertaintyBadge certainty={riskAssessment.overallCertainty} />
                          <button
                            type="button"
                            disabled={isAnalyzingRisk}
                            onClick={async () => {
                              try {
                                await triggerRiskAnalysis(activePatientId, selfForm);
                                await loadProfile(activePatientId);
                                setFeedbackBanner(
                                  isFr
                                    ? 'Évaluation analytique des risques recalculée en direct.'
                                    : 'Analytical risk assessment recalculated live.'
                                );
                              } catch {
                                // Handled by hook
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-xs font-bold text-[#0B3B3C] hover:bg-[#CCFBF1] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingRisk ? 'animate-spin' : ''}`} />
                            <span>
                              {isAnalyzingRisk
                                ? isFr
                                  ? 'Calcul...'
                                  : 'Analyzing...'
                                : isFr
                                ? 'Recalculer en direct'
                                : 'Recalculate Live'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {profile.pathwayType === 'adult' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Protocole TA retenu' : 'Retained BP'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.bpProtocol.retainedSys ?? '—'}/
                              {riskAssessment.calculations.bpProtocol.retainedDia ?? '—'} mmHg
                            </span>
                            <span className="text-[10px] text-[#0F6B6B] block">
                              {riskAssessment.calculations.bpProtocol.bpZoneLabel}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'IMC & Seuil A4' : 'BMI & A4 Threshold'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.anthropometry.bmi ?? '—'} kg/m²
                            </span>
                            <span className="text-[10px] text-[#64748B] block">
                              {riskAssessment.calculations.findriscModel.asianBmiRuleA4Triggered
                                ? isFr
                                  ? 'Seuil A4 Asie du Sud (23 kg/m²)'
                                  : 'South Asian A4 threshold (23 kg/m²)'
                                : isFr
                                ? 'Seuil standard (25 kg/m²)'
                                : 'Standard threshold (25 kg/m²)'}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Score FINDRISC (8 items)' : 'FINDRISC (8 items)'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.findriscModel.score ?? 0} / 26 pts
                            </span>
                            <span className="text-[10px] text-[#0F6B6B] block">
                              {riskAssessment.calculations.findriscModel.levelLabel}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Risque CV OMS 2019' : 'WHO 2019 CVD Risk'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.whoCvdModel.inDomain
                                ? `${riskAssessment.calculations.whoCvdModel.riskPercent}%`
                                : isFr
                                ? 'Qualitatif (<40a)'
                                : 'Qualitative (<40y)'}
                            </span>
                            <span className="text-[10px] text-[#64748B] block truncate">
                              {riskAssessment.calculations.whoCvdModel.domainNote}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Âge & Correction (<37 SA)' : 'Age & Preterm Correction'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.anthropometry.correctedAgeMonths ??
                                profile.ageMonths}{' '}
                              {isFr ? 'mois' : 'mos'}
                            </span>
                            <span className="text-[10px] text-[#0F6B6B] block">
                              {riskAssessment.calculations.anthropometry.correctedAgeMonths
                                ? isFr
                                  ? 'Âge corrigé appliqué'
                                  : 'Corrected age applied'
                                : isFr
                                ? 'Terme standard'
                                : 'Full-term'}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Z-Score Poids / IMC OMS' : 'WHO Weight / BMI Z-Score'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.anthropometry.weightForHeightZ ?? 0} /{' '}
                              {riskAssessment.calculations.anthropometry.bmiForAgeZ ?? 0} SD
                            </span>
                            <span className="text-[10px] text-[#64748B] block truncate">
                              {isFr ? 'Courbes OMS 2006/2007' : 'WHO 2006/2007 Charts'}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Périmètre brachial (MUAC)' : 'MUAC Measurement'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.anthropometry.muacMm ?? 142} mm
                            </span>
                            <span className="text-[10px] text-[#0F6B6B] block truncate">
                              {isFr ? 'Seuil nutritionnel ≥ 125 mm' : 'Nutritional cutoff ≥ 125 mm'}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="text-[11px] text-[#64748B] block">
                              {isFr ? 'Actions regroupées' : 'Grouped Checks'}
                            </span>
                            <span className="text-sm font-extrabold font-mono text-[#0B3B3C]">
                              {riskAssessment.calculations.consolidatedCarePlan.groupedActions.length}{' '}
                              {isFr ? 'action(s)' : 'item(s)'}
                            </span>
                            <span className="text-[10px] text-[#64748B] block">
                              {isFr ? 'Calendrier DoH WCV' : 'DoH WCV Schedule'}
                            </span>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  )}

                  {/* Visual Indicators */}
                  {profile.pathwayType === 'adult' ? (
                    <GlassCard interactive={false} className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                            {isFr ? 'Tension au repos' : 'Resting Blood Pressure'}
                          </h3>
                          <p className="text-xs text-[#64748B]">
                            {isFr ? 'Zone repère de votre centre' : 'Reference zone from your clinic'}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-[#0B3B3C] text-white text-xs font-semibold">
                          {profile.bpZoneLabel}
                        </span>
                      </div>

                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={profile.bpSeries}>
                            <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                            <YAxis domain={[60, 160]} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <ReferenceLine y={130} stroke="#14A39A" strokeDasharray="4 4" />
                            <Area
                              type="monotone"
                              dataKey="systolic"
                              name="Systolic"
                              stroke="#0F6B6B"
                              fill="#D5F2EE"
                              strokeWidth={2.5}
                            />
                            <Area
                              type="monotone"
                              dataKey="diastolic"
                              name="Diastolic"
                              stroke="#2F6FDE"
                              fill="#EFF6FF"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassCard interactive={false} className="space-y-3">
                        <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                          {isFr ? 'Courbe de croissance' : 'Growth Trajectory'}
                        </h3>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={profile.growthSeries}>
                              <XAxis dataKey="ageLabel" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip />
                              <Area type="monotone" dataKey="refHigh" stroke="none" fill="#F1F5F9" />
                              <Area
                                type="monotone"
                                dataKey="value"
                                name="Measured"
                                stroke="#0F6B6B"
                                fill="#D5F2EE"
                                strokeWidth={2.5}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </GlassCard>

                      <GlassCard interactive={false} className="space-y-3">
                        <h3 className="text-sm font-bold text-[#0B3B3C] font-heading">
                          {isFr ? 'Vaccins par dose' : 'Vaccines by Dose'}
                        </h3>
                        <div className="space-y-2">
                          {(profile.vaccinesList || []).map((v: any, idx: number) => (
                            <div
                              key={idx}
                              className="card-3d flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs"
                            >
                              <div>
                                <p className="font-semibold text-[#0B3B3C]">{v.name}</p>
                                <p className="text-[11px] text-[#64748B]">{v.dateLabel}</p>
                              </div>
                              <StatusChip state={v.status === 'done' ? 'done' : 'overdue'} />
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1B: INTERACTIVE SELF-ASSESSMENT & HOME VITALS (Recalculates Backend CarePlan) */}
              {activeTab === 'checkup' && (
                <GlassCard interactive={false} className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Auto-Évaluation Guidée & Mesures à Domicile (Provenance D)'
                        : 'Guided Self-Assessment & Home Vitals (Provenance D)'}
                    </span>
                    <h2 className="text-lg font-extrabold text-[#0B3B3C] font-heading">
                      {isViewingChild
                        ? isFr
                          ? `Mettre à jour les indicateurs de ${profile.displayName}`
                          : `Update ${profile.displayName}’s Growth & Wellness Check`
                        : isFr
                        ? 'Saisir mes mesures et lancer l’analyse de mon parcours préventif'
                        : 'Enter My Home Measurements & Recalculate My Preventive Plan'}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      {isFr
                        ? 'Ces informations sont analysées par le moteur préventif MediSense pour actualiser vos vérifications recommandées en un seul rendez-vous (sans poser de diagnostic médical).'
                        : 'Your entries are processed by the MediSense preventive engine to update your recommended checks in a single visit (non-diagnostic guidance).'}
                    </p>
                  </div>

                  {riskAnalysisError && (
                    <div className="bg-[#FEF2F2] border border-red-200 text-[#B91C1C] px-4 py-3 rounded-xl text-xs font-semibold">
                      {riskAnalysisError}
                    </div>
                  )}

                  <form onSubmit={handleSelfAssessmentSubmit} className="space-y-4 text-xs">
                    {profile.pathwayType === 'adult' ? (
                      <>
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                          <h3 className="font-bold text-[#0B3B3C]">
                            {isFr
                              ? '1. Tension artérielle au repos (2 mesures à 1 minute d’intervalle)'
                              : '1. Resting Blood Pressure (2 readings, 1 minute apart)'}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                              <span className="font-semibold text-[#334155] block mb-1.5">
                                {isFr ? 'Mesure 1 (Systolique / Diastolique mmHg)' : 'Reading 1 (Sys / Dia mmHg)'}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={selfForm.systolicBp1}
                                  onChange={(e) =>
                                    setSelfForm({ ...selfForm, systolicBp1: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono text-center"
                                  placeholder="128"
                                />
                                <span>/</span>
                                <input
                                  type="number"
                                  value={selfForm.diastolicBp1}
                                  onChange={(e) =>
                                    setSelfForm({ ...selfForm, diastolicBp1: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono text-center"
                                  placeholder="82"
                                />
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-[#E2E8F0]">
                              <span className="font-semibold text-[#334155] block mb-1.5">
                                {isFr ? 'Mesure 2 (Systolique / Diastolique mmHg)' : 'Reading 2 (Sys / Dia mmHg)'}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={selfForm.systolicBp2}
                                  onChange={(e) =>
                                    setSelfForm({ ...selfForm, systolicBp2: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono text-center"
                                  placeholder="126"
                                />
                                <span>/</span>
                                <input
                                  type="number"
                                  value={selfForm.diastolicBp2}
                                  onChange={(e) =>
                                    setSelfForm({ ...selfForm, diastolicBp2: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] font-mono text-center"
                                  placeholder="80"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                          <h3 className="font-bold text-[#0B3B3C]">
                            {isFr
                              ? '2. Poids, Taille, Tour de taille & Habitudes de vie'
                              : '2. Weight, Height, Waist & Daily Habits'}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-semibold text-[#334155] mb-1">
                                {isFr ? 'Poids (kg)' : 'Weight (kg)'}
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={selfForm.weightKg}
                                onChange={(e) => setSelfForm({ ...selfForm, weightKg: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#334155] mb-1">
                                {isFr ? 'Taille (cm)' : 'Height (cm)'}
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={selfForm.heightCm}
                                onChange={(e) => setSelfForm({ ...selfForm, heightCm: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#334155] mb-1">
                                {isFr ? 'Tour de taille (cm)' : 'Waist Circumference (cm)'}
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                value={selfForm.waistCm}
                                onChange={(e) => setSelfForm({ ...selfForm, waistCm: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selfForm.dailyPhysicalActivity}
                                onChange={(e) =>
                                  setSelfForm({
                                    ...selfForm,
                                    dailyPhysicalActivity: e.target.checked,
                                  })
                                }
                              />
                              <span className="font-medium text-[#0B3B3C]">
                                {isFr
                                  ? 'Au moins 30 min d’activité physique par jour'
                                  : 'At least 30 min of daily physical activity'}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selfForm.dailyFruitsVeg}
                                onChange={(e) =>
                                  setSelfForm({ ...selfForm, dailyFruitsVeg: e.target.checked })
                                }
                              />
                              <span className="font-medium text-[#0B3B3C]">
                                {isFr
                                  ? 'Consommation quotidienne de fruits et légumes'
                                  : 'Fruits & vegetables every day'}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selfForm.smokingStatus}
                                onChange={(e) =>
                                  setSelfForm({ ...selfForm, smokingStatus: e.target.checked })
                                }
                              />
                              <span className="font-medium text-[#0B3B3C]">
                                {isFr ? 'Fumeur actuel' : 'Current tobacco smoker'}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selfForm.highBloodGlucoseHistory}
                                onChange={(e) =>
                                  setSelfForm({
                                    ...selfForm,
                                    highBloodGlucoseHistory: e.target.checked,
                                  })
                                }
                              />
                              <span className="font-medium text-[#0B3B3C]">
                                {isFr
                                  ? 'Glycémie déjà signalée comme limite lors d’un bilan'
                                  : 'Previously told blood sugar was borderline'}
                              </span>
                            </label>
                          </div>

                          <div className="pt-1">
                            <label className="block font-semibold text-[#334155] mb-1">
                              {isFr
                                ? 'Un proche (parent, frère, sœur, grand-parent) est-il suivi pour du diabète ?'
                                : 'Family history of diabetes?'}
                            </label>
                            <select
                              value={selfForm.familyHistoryDiabetesLevel}
                              onChange={(e) =>
                                setSelfForm({
                                  ...selfForm,
                                  familyHistoryDiabetesLevel: e.target.value,
                                })
                              }
                              className="w-full sm:w-80 px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
                            >
                              <option value="none">{isFr ? 'Non' : 'No'}</option>
                              <option value="second_degree">
                                {isFr ? 'Oui (Grand-parent, oncle, tante)' : 'Yes (Grandparent, aunt, uncle)'}
                              </option>
                              <option value="first_degree">
                                {isFr ? 'Oui (Parent, frère, sœur, enfant)' : 'Yes (Parent, sibling, child)'}
                              </option>
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Child / Adolescent Parent Self-Assessment */
                      <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                        <h3 className="font-bold text-[#0B3B3C]">
                          {isFr
                            ? 'Mesures de croissance & Questionnaire d’éveil parent'
                            : 'Child Growth Measurements & Parent Milestone Check'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-[#334155] mb-1">
                              {isFr ? 'Poids mesuré (kg)' : 'Weight (kg)'}
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={selfForm.weightKg}
                              onChange={(e) => setSelfForm({ ...selfForm, weightKg: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#334155] mb-1">
                              {isFr ? 'Taille mesurée (cm)' : 'Height (cm)'}
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              value={selfForm.heightCm}
                              onChange={(e) => setSelfForm({ ...selfForm, heightCm: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#334155] mb-1">
                              {isFr
                                ? 'Points d’attention éveil/communication (0–20)'
                                : 'Milestone / Communication items noted (0–20)'}
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={selfForm.mchatScore}
                              onChange={(e) => setSelfForm({ ...selfForm, mchatScore: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('home')}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] font-semibold text-[#334155]"
                      >
                        {isFr ? 'Annuler' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isAnalyzingRisk}
                        className="px-5 py-2.5 rounded-xl btn-liquid-primary font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isAnalyzingRisk
                            ? isFr
                              ? 'Analyse en cours...'
                              : 'Recalculating...'
                            : isFr
                            ? 'Lancer l’analyse et mettre à jour mon parcours'
                            : 'Analyze & Update My Preventive Plan'}
                        </span>
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* TAB 2: MY CARE JOURNEY */}
              {activeTab === 'journey' && (
                <GlassCard interactive={false} className="space-y-5">
                  <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                    {isFr ? 'Parcours préventif' : 'Preventive Care Timeline'}
                  </h2>
                  <div className="space-y-5 relative before:absolute before:top-3 before:bottom-3 before:start-3.5 before:w-0.5 before:bg-[#E2E8F0]">
                    {[
                      {
                        period: isFr ? 'Passé' : 'Completed',
                        title:
                          profile.pathwayType === 'adult'
                            ? 'Initial blood pressure check'
                            : 'Early childhood visits (0–12m)',
                        date: 'May 2026',
                        state: 'done' as const,
                      },
                      {
                        period: isFr ? 'Présent' : 'Current Step',
                        title: rec?.pathwayTitle || 'Consolidated Preventive Visit',
                        date: profile.nextDueDate,
                        state: (rec?.state || 'invited') as any,
                      },
                      {
                        period: isFr ? 'Futur' : 'Planned',
                        title: 'Annual wellness follow-up',
                        date: 'Nov 2027',
                        state: 'created' as const,
                      },
                    ].map((step, i) => (
                      <div key={i} className="relative ps-10">
                        <span
                          className={`absolute start-1.5 top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                            step.state === 'done' ? 'bg-[#15803D]' : 'bg-[#0F6B6B]'
                          }`}
                        />
                        <div className="card-3d p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold text-[#0F6B6B]">{step.period}</p>
                            <p className="text-sm font-bold text-[#0B3B3C] font-heading">{step.title}</p>
                            <p className="text-xs text-[#64748B] mt-0.5">{step.date}</p>
                          </div>
                          <StatusChip state={step.state} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* TAB 3: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <GlassCard interactive={false} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                      {isFr ? 'Messages reçus' : 'Outreach Messages'}
                    </h2>
                    <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs">
                      {(['all', 'unread', 'action'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setNotifFilter(f)}
                          className={`px-3 py-1 rounded-lg font-semibold capitalize ${
                            notifFilter === f ? 'bg-white text-[#0B3B3C] shadow-2xs' : 'text-[#64748B]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(data?.notifications || []).map((n: any) => (
                      <div key={n.id} className="card-3d p-4 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[#64748B]">
                          <span>
                            <strong className="text-[#0B3B3C]">{n.channel}</strong> · {n.language.toUpperCase()}
                          </span>
                          <span className="font-mono">{n.sentAt}</span>
                        </div>
                        <p className="text-sm font-bold text-[#0B3B3C] font-heading">{n.title}</p>
                        <p className="text-xs text-[#334155] leading-relaxed">{n.bodyText}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* TAB 4: PROFILE & CULTURAL PREFERENCES */}
              {activeTab === 'profile' && (
                <GlassCard interactive={false} className="space-y-5">
                  <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                    {isFr ? 'Préférences culturelles & canal' : 'Cultural & Channel Preferences'}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="card-3d p-4 rounded-2xl">
                      <p className="text-[#64748B]">Display Name</p>
                      <p className="text-sm font-bold text-[#0B3B3C] mt-0.5">{profile.displayName}</p>
                    </div>
                    <div className="card-3d p-4 rounded-2xl">
                      <p className="text-[#64748B]">Primary Health Centre</p>
                      <p className="text-sm font-bold text-[#0B3B3C] mt-0.5">{profile.facilityCenter}</p>
                    </div>
                  </div>

                  <ConsentToggle
                    title={
                      isFr
                        ? 'Préférence pour une praticienne'
                        : 'Preference for a female clinician'
                    }
                    description={
                      isFr
                        ? 'Appliqué automatiquement lors de la prise de rendez-vous.'
                        : 'Applied automatically when scheduling physical visits.'
                    }
                    checked={Boolean(profile.preferFemalePractitioner)}
                    onChange={async (next) => {
                      await apiClient.updatePreferences(activePatientId, {
                        preferredLanguage: locale,
                        preferredChannel: profile.preferredChannel,
                        preferFemalePractitioner: next,
                      });
                      await loadProfile(activePatientId);
                    }}
                  />
                </GlassCard>
              )}

              {/* TAB 5: PRIVACY & 5 GRANULAR CONSENTS */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <GlassCard interactive={false} className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                          {isFr ? '5 consentements indépendants' : '5 Independent Purpose Consents'}
                        </h2>
                        <p className="text-xs text-[#64748B]">
                          {isFr
                            ? 'Retrait immédiat et sans aucune pénalité.'
                            : 'Immediate withdrawal with zero impact on care.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiClient.updateConsents(activePatientId, {
                            evaluationAndCalendar: false,
                            channelReminders: false,
                            shareWithFacility: false,
                            anonymousStatistics: false,
                            existingGenomicResult: false,
                          });
                          setFeedbackBanner('All optional consents withdrawn immediately.');
                          await loadProfile(activePatientId);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-red-50 text-[#B91C1C] text-xs font-semibold"
                      >
                        {isFr ? 'Tout retirer' : 'Withdraw all'}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <ConsentToggle
                        title="1. Preventive Evaluation & Calendar"
                        description="Propose a consolidated preventive visit from my clinical history."
                        checked={consents.evaluationAndCalendar}
                        onChange={(v) => handleConsentChange('evaluationAndCalendar', v)}
                      />
                      <ConsentToggle
                        title="2. Channel Reminders"
                        description="Receive invitations and up to 2 reminders on my chosen channel."
                        checked={consents.channelReminders}
                        onChange={(v) => handleConsentChange('channelReminders', v)}
                      />
                      <ConsentToggle
                        title="3. Share Pass with Health Centre"
                        description="Send my preventive care plan and 8-character pass to my clinic."
                        checked={consents.shareWithFacility}
                        onChange={(v) => handleConsentChange('shareWithFacility', v)}
                      />
                      <ConsentToggle
                        title="4. Anonymous Public Health Metrics"
                        description="Include de-identified status in aggregate stats (n < 10 masked)."
                        checked={consents.anonymousStatistics}
                        onChange={(v) => handleConsentChange('anonymousStatistics', v)}
                      />
                      <ConsentToggle
                        title="5. Existing Interpreted Genomic Result"
                        description="Use an existing result to advance a check-up (never delays care)."
                        checked={consents.existingGenomicResult}
                        onChange={(v) => handleConsentChange('existingGenomicResult', v)}
                      />
                    </div>
                  </GlassCard>

                  <GlassCard interactive={false} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                          {isFr ? 'Journal d’accès transparent' : 'Data Usage Log'}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          {isFr ? 'Traçabilité complète par règle signée.' : 'Every access logged with rule version.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackBanner('Personal data summary downloaded (Simulated JSON).')
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B3B3C] text-white text-xs font-semibold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Exporter' : 'Download'}</span>
                      </button>
                    </div>

                    {/* Mobile Stacked Cards */}
                    <div className="md:hidden space-y-2.5">
                      {(data?.usageLogs || []).map((log: any) => (
                        <div key={log.id} className="card-3d p-3.5 rounded-2xl space-y-1 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#0B3B3C]">{log.actorName}</span>
                            <span className="font-mono text-[10px] text-[#0B3B3C] bg-[#F1F5F9] border border-[#CBD5E1] px-2 py-0.5 rounded-lg">
                              {log.ruleVersionRef}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-[#334155]">{log.dataCategory}</p>
                          <p className="text-[11px] text-[#64748B]">{log.purposeDescription}</p>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
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
                          {(data?.usageLogs || []).map((log: any) => (
                            <tr key={log.id}>
                              <td className="py-2.5 px-3 font-semibold text-[#0B3B3C]">
                                {log.actorName}
                              </td>
                              <td className="py-2.5 px-3 text-[#334155]">{log.dataCategory}</td>
                              <td className="py-2.5 px-3 text-[#64748B]">{log.purposeDescription}</td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-[#0F6B6B]">
                                {log.ruleVersionRef}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 liquid-glass border-t border-white/60 z-30 flex items-center justify-around py-2 px-1 pb-safe">
        {[
          { id: 'home', label: isAr ? 'الرئيسية' : isFr ? 'Accueil' : 'Home', Icon: Home },
          { id: 'checkup', label: isAr ? 'فحصي' : isFr ? 'Bilan' : 'Check', Icon: CheckCircle2 },
          { id: 'journey', label: isAr ? 'مساري' : isFr ? 'Parcours' : 'Journey', Icon: Calendar },
          { id: 'notifications', label: isAr ? 'الرسائل' : isFr ? 'Messages' : 'Messages', Icon: Bell },
          { id: 'privacy', label: isAr ? 'الموافقات' : isFr ? 'Accès' : 'Consents', Icon: Shield },
        ].map((item) => {
          const IconComp = item.Icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors ${
                active ? 'text-white bg-[#0B3B3C]' : 'text-[#64748B]'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
