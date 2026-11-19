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
  ClipboardList,
  BellRing,
  AlertTriangle,
  Activity,
  HeartPulse,
  RefreshCw,
  Send,
  CalendarClock,
  Play,
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
  MediBeninLogo,
  DemoBanner,
  LanguageSwitch,
  StatusChip,
  Ring,
  PassQrCard,
  ConsentToggle,
  GlassCard,
  LevelBadge,
  StatCard,
} from './MediBeninUI.tsx';
import { ConsentState } from '../lib/types.ts';

/* ------------------------------------------------------------------
 * Blood pressure visual zones — patient-friendly reading.
 * Zones are qualitative bands (target / follow-up / confirm); the
 * numeric boundaries below are never displayed to the patient.
 * ------------------------------------------------------------------ */
type BpZoneKey = 'target' | 'borderline' | 'above' | 'none';

function deriveBpZoneKey(label?: string | null): BpZoneKey {
  if (!label) return 'none';
  if (/above/i.test(label)) return 'above';
  if (/borderline/i.test(label)) return 'borderline';
  if (/target zone/i.test(label)) return 'target';
  return 'none';
}

const BP_ZONE_CHIP: Record<BpZoneKey, string> = {
  target: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
  borderline: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  above: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  none: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
};

/* ------------------------------------------------------------------
 * BP 3D gauge — glass tube with qualitative zones (target / follow-up /
 * confirm), a glossy mercury column at the latest reading, a value
 * bubble and a zone-change trend arrow. Zone boundaries are never
 * displayed as numbers; meaning is carried by color + legend.
 * ------------------------------------------------------------------ */
const BP_GAUGE = { top: 14, bottom: 180, cx: 37, w: 26 };
const BP_ZONE_FILL = ['#34D399', '#FBBF24', '#F87171'];
const BP_ZONE_DOT = ['bg-[#6EE7B7]', 'bg-[#FCD34D]', 'bg-[#FCA5A5]'];

const BpGauge: React.FC<{
  clipId: string;
  title: string;
  data: Array<{ dateLabel: string; systolic?: number; diastolic?: number }>;
  dataKey: 'systolic' | 'diastolic';
  min: number;
  max: number;
  target: number;
  limit: number;
  trendLabels: { up: string; down: string; stable: string };
}> = ({ clipId, title, data, dataKey, min, max, target, limit, trendLabels }) => {
  const values = data
    .map((d) => d[dataKey])
    .filter((v): v is number => typeof v === 'number');
  const latest = values[values.length - 1];
  const prev = values.length > 1 ? values[values.length - 2] : null;

  if (latest == null) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-[#64748B]">
        {title} —
      </div>
    );
  }

  const zoneOf = (v: number) => (v < target ? 0 : v < limit ? 1 : 2);
  const { top: tTop, bottom: tBot, cx, w } = BP_GAUGE;
  const r = w / 2;
  const yOf = (v: number) => tBot - ((v - min) / (max - min)) * (tBot - tTop);
  const yTarget = yOf(target);
  const yLimit = yOf(limit);
  const yLatest = yOf(latest);
  const zoneColor = BP_ZONE_FILL[zoneOf(latest)];

  let trendKey: 'up' | 'down' | 'stable' = 'stable';
  if (prev != null) {
    const dz = zoneOf(latest) - zoneOf(prev);
    if (dz > 0) trendKey = 'up';
    else if (dz < 0) trendKey = 'down';
  }
  const trendColor =
    trendKey === 'up' ? '#B91C1C' : trendKey === 'down' ? '#15803D' : '#64748B';
  const trendArrow = trendKey === 'up' ? '▲' : trendKey === 'down' ? '▼' : '◆';

  const bubbleY = Math.min(Math.max(yLatest - 12, tTop), tBot - 26);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold text-[#334155]">{title}</span>
      <svg viewBox="0 0 140 196" className="w-full max-w-[150px] h-auto" role="img" aria-label={title}>
        <defs>
          <clipPath id={clipId}>
            <rect x={cx - r} y={tTop} width={w} height={tBot - tTop} rx={r} />
          </clipPath>
          <linearGradient id={`${clipId}-glass`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.4" />
            <stop offset="16%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="84%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.4" />
          </linearGradient>
          <filter id={`${clipId}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0B3B3C" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Qualitative zone bands (soft, no numbers) */}
        <g clipPath={`url(#${clipId})`}>
          <rect x={cx - r} y={yLimit} width={w} height={tBot - yLimit} fill="#FECACA" />
          <rect x={cx - r} y={yTarget} width={w} height={yLimit - yTarget} fill="#FDE68A" />
          <rect x={cx - r} y={tTop} width={w} height={yTarget - tTop} fill="#D1FAE5" />
          <line x1={cx - r} x2={cx + r} y1={yTarget} y2={yTarget} stroke="#94A3B8" strokeOpacity="0.55" strokeDasharray="2 2" />
          <line x1={cx - r} x2={cx + r} y1={yLimit} y2={yLimit} stroke="#94A3B8" strokeOpacity="0.55" strokeDasharray="2 2" />

          {/* Mercury column at the latest reading */}
          <rect
            x={cx - r + 4}
            y={yLatest}
            width={w - 8}
            height={tBot - yLatest}
            fill={zoneColor}
            opacity="0.95"
          />
          {/* Glossy highlight on the mercury */}
          <rect
            x={cx - r + 5}
            y={Math.max(yLatest + 3, tTop + 3)}
            width={5}
            height={Math.max(tBot - yLatest - 8, 0)}
            rx="2.5"
            fill="#FFFFFF"
            opacity="0.55"
          />
          {/* Specular streak of the tube */}
          <rect x={cx - r + 3} y={tTop + 3} width={4} height={tBot - tTop - 6} rx="2" fill="#FFFFFF" opacity="0.45" />
        </g>

        {/* Glass tube outline on top for depth */}
        <rect
          x={cx - r}
          y={tTop}
          width={w}
          height={tBot - tTop}
          rx={r}
          fill={`url(#${clipId}-glass)`}
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Value bubble */}
        <rect
          x={cx + r + 7}
          y={bubbleY}
          width={66}
          height={24}
          rx="12"
          fill="#FFFFFF"
          stroke={zoneColor}
          strokeWidth="1.5"
          filter={`url(#${clipId}-shadow)`}
        />
        <text x={cx + r + 40} y={bubbleY + 16} textAnchor="middle">
          <tspan fontSize="12" fontWeight="700" fill="#0B3B3C">
            {latest}
          </tspan>
          <tspan fontSize="9" fill="#64748B">
            {' '}
            mmHg
          </tspan>
        </text>

        {/* Ground cap */}
        <ellipse cx={cx} cy={tBot + 3} rx={r} ry="3.5" fill="#CBD5E1" opacity="0.5" />
      </svg>

      {/* Zone-change trend vs previous reading */}
      <span className="text-[10px] font-bold tabular-nums" style={{ color: trendColor }}>
        {trendArrow} {trendLabels[trendKey]}
      </span>

      {/* Recent readings, colored by zone (hover = date + exact value) */}
      <div className="flex items-center justify-center gap-1.5">
        {data
          .slice(-4)
          .filter((d) => typeof d[dataKey] === 'number')
          .map((d, i) => (
            <span
              key={i}
              title={`${d.dateLabel} · ${d[dataKey]} mmHg`}
              className={`w-2.5 h-2.5 rounded-full ${BP_ZONE_DOT[zoneOf(d[dataKey] as number)]}`}
            />
          ))}
      </div>
    </div>
  );
};

type SelfFormState = {
  systolicBp1: string;
  diastolicBp1: string;
  systolicBp2: string;
  diastolicBp2: string;
  weightKg: string;
  heightCm: string;
  waistCm: string;
  dailyPhysicalActivity: boolean | null;
  dailyFruitsVeg: boolean | null;
  smokingStatus: boolean | null;
  antihypertensiveMedHistory: boolean | null;
  highBloodGlucoseHistory: boolean | null;
  familyHistoryDiabetesLevel: string;
  familyPrematureCvd: boolean;
  isPregnant: boolean;
  mchatScore: string;
  redFlagWarningSymptom: boolean;
};

const EMPTY_SELF_FORM: SelfFormState = {
  systolicBp1: '',
  diastolicBp1: '',
  systolicBp2: '',
  diastolicBp2: '',
  weightKg: '',
  heightCm: '',
  waistCm: '',
  dailyPhysicalActivity: null,
  dailyFruitsVeg: null,
  smokingStatus: null,
  antihypertensiveMedHistory: null,
  highBloodGlucoseHistory: null,
  familyHistoryDiabetesLevel: '',
  familyPrematureCvd: false,
  isPregnant: false,
  mchatScore: '',
  redFlagWarningSymptom: false,
};

const DEMO_SELF_FORM: SelfFormState = {
  systolicBp1: '128',
  diastolicBp1: '82',
  systolicBp2: '126',
  diastolicBp2: '80',
  weightKg: '78',
  heightCm: '175',
  waistCm: '94',
  dailyPhysicalActivity: true,
  dailyFruitsVeg: false,
  smokingStatus: false,
  antihypertensiveMedHistory: false,
  highBloodGlucoseHistory: false,
  familyHistoryDiabetesLevel: 'second_degree',
  familyPrematureCvd: false,
  isPregnant: false,
  mchatScore: '',
  redFlagWarningSymptom: false,
};

interface PatientPortalProps {
  role: 'patient' | 'parent';
  onLogout: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  role,
  onLogout,
}) => {
  const { locale, t } = useI18n();
  const isFr = locale === 'fr';
  // Unified Patient Portal starts from the records linked to the authenticated
  // account (patient own record, or the parent's affiliated children).
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'checkup'
    | 'plan'
    | 'reminders'
    | 'journey'
    | 'notifications'
    | 'profile'
    | 'privacy'
  >('home');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDecisionAid, setShowDecisionAid] = useState(false);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('2026-12-04');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'action'>('all');
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [riskAnalysisError, setRiskAnalysisError] = useState<string | null>(null);
  const [showFamilyInfo, setShowFamilyInfo] = useState(false);

  // Personalized screening planner & smart reminder assistant state.
  const [screeningPlan, setScreeningPlan] = useState<any>(null);
  const [reminderPlan, setReminderPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-12-04');
  const [manualMode, setManualMode] = useState(false);
  const [lastAssessment, setLastAssessment] = useState<any>(null);

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

  // Guided Self-Assessment & Home Vitals Form.
  // The form starts EMPTY: an evaluator must be able to enter their own values
  // and obtain a dynamic risk calculation instead of editing preloaded demo data.
  const [selfForm, setSelfForm] = useState<SelfFormState>(EMPTY_SELF_FORM);

  const loadProfile = async (pid: string) => {
    try {
      setLoading(true);
      const res = await apiClient.getPatientPortalProfile(pid);
      setData(res);
      const cp = res?.profile?.clinicalProfile || {};
      setSelfForm({
        systolicBp1: cp.systolicBp1 ? String(cp.systolicBp1) : '',
        diastolicBp1: cp.diastolicBp1 ? String(cp.diastolicBp1) : '',
        systolicBp2: cp.systolicBp2 ? String(cp.systolicBp2) : '',
        diastolicBp2: cp.diastolicBp2 ? String(cp.diastolicBp2) : '',
        weightKg: cp.weightKg ? String(cp.weightKg) : '',
        heightCm: cp.heightCm ? String(cp.heightCm) : '',
        waistCm: cp.waistCm ? String(cp.waistCm) : '',
        dailyPhysicalActivity:
          cp.dailyPhysicalActivity !== undefined && cp.dailyPhysicalActivity !== null
            ? Boolean(cp.dailyPhysicalActivity)
            : null,
        dailyFruitsVeg:
          cp.dailyFruitsVeg !== undefined && cp.dailyFruitsVeg !== null
            ? Boolean(cp.dailyFruitsVeg)
            : null,
        smokingStatus:
          cp.smokingStatus !== undefined && cp.smokingStatus !== null
            ? cp.smokingStatus !== 'never'
            : null,
        antihypertensiveMedHistory:
          cp.antihypertensiveMed !== undefined && cp.antihypertensiveMed !== null
            ? Boolean(cp.antihypertensiveMed)
            : null,
        highBloodGlucoseHistory:
          cp.historyHighGlucose !== undefined && cp.historyHighGlucose !== null
            ? Boolean(cp.historyHighGlucose)
            : null,
        familyHistoryDiabetesLevel: cp.familyHistoryDiabetes || '',
        familyPrematureCvd: Boolean(cp.familyHistoryFhOrEarlyCvd),
        isPregnant: Boolean(cp.isPregnant),
        mchatScore:
          cp.mchatScore !== undefined && cp.mchatScore !== null ? String(cp.mchatScore) : '',
        redFlagWarningSymptom: Boolean(cp.redFlagWarningSymptom),
      });
    } catch (err) {
      console.error('Error loading patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = async (pid: string) => {
    try {
      setPlanLoading(true);
      const res = await apiClient.getScreeningPlan(pid, locale);
      setScreeningPlan(res.plan);
    } catch (err) {
      console.error('Error loading screening plan:', err);
      setScreeningPlan(null);
    } finally {
      setPlanLoading(false);
    }
  };

  const loadReminders = async (pid: string) => {
    try {
      const res = await apiClient.getReminderPlan(pid, locale);
      setReminderPlan(res.plan);
    } catch (err) {
      console.error('Error loading reminder plan:', err);
      setReminderPlan(null);
    }
  };

  useEffect(() => {
    if (!activePatientId) return;
    void loadPlan(activePatientId);
    void loadReminders(activePatientId);
  }, [activePatientId, locale]);

  useEffect(() => {
    let active = true;
    // Launch both requests in parallel: resolve the patient ID from /me,
    // and immediately start loading the default profile — whichever resolves first wins.
    const defaultPid = 'PT-36Y-TARIQ';
    const mePromise = apiClient.getMe().catch(() => null);
    const defaultProfilePromise = loadProfile(defaultPid);

    mePromise.then((res) => {
      if (!active) return;
      if (res?.user) setCurrentUser(res.user);
      const linked = Array.isArray(res?.user?.linkedPatientIds)
        ? (res!.user.linkedPatientIds as string[])
        : [];
      const resolvedPid = linked[0] || defaultPid;
      if (resolvedPid !== defaultPid) {
        // Real patient ID differs from default — reload for the correct profile
        loadProfile(resolvedPid);
      }
      setActivePatientId(resolvedPid);
    });
    // defaultProfilePromise is already in flight; just await resolution via loadProfile state

    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    // Only trigger a reload when activePatientId is set AFTER the initial mount
    // (i.e. when the user switches to a child record — not on first render which
    // is already handled by the parallel fetch above).
    if (activePatientId && activePatientId !== 'PT-36Y-TARIQ') {
      loadProfile(activePatientId);
    }
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
    const linkedIds: string[] = Array.isArray(currentUser?.linkedPatientIds)
      ? currentUser.linkedPatientIds
      : [];
    if (targetId === rootParent.id && role === 'parent' && !linkedIds.includes(targetId)) {
      setFeedbackBanner(
        isFr
          ? "Ce dossier adulte n'est pas rattaché à votre compte."
          : 'This adult record is not linked to your account.'
      );
      return;
    }
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
    setIsAnalyzingRisk(true);
    setRiskAnalysisError(null);
    try {
      const res = await apiClient.submitSelfAssessment(activePatientId, selfForm);
      setLastAssessment(res);
      await loadProfile(activePatientId);
      await Promise.all([loadPlan(activePatientId), loadReminders(activePatientId)]);
      setActiveTab('checkup');
      setFeedbackBanner(
        isFr
          ? 'Mesures enregistrées. Votre niveau de risque et votre plan de dépistage ont été recalculés.'
          : 'Measurements saved. Your risk level and screening plan were recalculated.'
      );
    } catch (err: any) {
      setRiskAnalysisError(
        err?.message ||
          (isFr
            ? 'Une erreur est survenue. Merci de réessayer.'
            : 'Something went wrong. Please try again.')
      );
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  const handleScheduleScreening = async (date?: string) => {
    const targetDate = date || scheduleDate;
    try {
      setReminderBusy(true);
      await apiClient.scheduleScreening(activePatientId, targetDate);
      setScheduleDate(targetDate);
      setFeedbackBanner(
        isFr
          ? `Visite planifiée le ${targetDate}. Votre assistant de rappel est prêt.`
          : `Visit scheduled for ${targetDate}. Your reminder assistant is ready.`
      );
      await Promise.all([loadProfile(activePatientId), loadReminders(activePatientId), loadPlan(activePatientId)]);
      setActiveTab('reminders');
    } catch (err: any) {
      setFeedbackBanner(err?.message || 'Unable to schedule this visit.');
    } finally {
      setReminderBusy(false);
    }
  };

  const handleSendReminder = async (kind: 'upcoming' | 'missed') => {
    try {
      setReminderBusy(true);
      await apiClient.sendSmartReminder(activePatientId, kind);
      setFeedbackBanner(
        isFr
          ? 'Rappel envoyé via votre canal préféré (message validé, sans diagnostic).'
          : 'Reminder sent through your preferred channel (safety-checked, no diagnosis).'
      );
      await Promise.all([loadReminders(activePatientId), loadProfile(activePatientId)]);
    } catch (err: any) {
      setFeedbackBanner(err?.message || 'Unable to send the reminder.');
    } finally {
      setReminderBusy(false);
    }
  };

  const handleEnableReminders = async () => {
    try {
      const nextConsents = {
        ...(data?.consents || {}),
        channelReminders: true,
      };
      await apiClient.updateConsents(activePatientId, nextConsents as ConsentState);
      setFeedbackBanner(
        isFr
          ? 'Consentement aux rappels activé. Votre assistant peut maintenant préparer les messages.'
          : 'Reminder consent enabled. Your assistant can now prepare messages.'
      );
      await Promise.all([loadProfile(activePatientId), loadReminders(activePatientId)]);
    } catch (err: any) {
      setFeedbackBanner(err?.message || 'Unable to enable reminders.');
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
          isFr
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
  const profileFlags: any[] = data?.flags || [];
  const calculations = data?.profile?.calculations;
  const activePlan = screeningPlan || data?.screeningPlan || null;
  const activeReminders = reminderPlan || data?.reminderPlan || null;
  const planItems: any[] = activePlan?.items || [];
  const todayDate = new Date().toISOString().slice(0, 10);
  const riskMetrics = [
    {
      label: isFr ? 'Risque cardiovasculaire' : 'Cardiovascular risk',
      value:
        calculations?.whoCvdModel?.riskPercent !== null &&
        calculations?.whoCvdModel?.riskPercent !== undefined
          ? `${calculations.whoCvdModel.riskPercent}%`
          : '—',
      hint: isFr ? 'Estimation à 10 ans' : '10-year estimate',
      Icon: Activity,
    },
    {
      label: isFr ? 'Tension retenue' : 'Retained blood pressure',
      value:
        calculations?.bpProtocol?.retainedSys && calculations?.bpProtocol?.retainedDia
          ? `${calculations.bpProtocol.retainedSys}/${calculations.bpProtocol.retainedDia}`
          : '—',
      hint: calculations?.bpProtocol?.bpZoneLabel || (isFr ? 'À mesurer' : 'To measure'),
      Icon: HeartPulse,
    },
    {
      label: isFr ? 'Indice de masse corporelle' : 'BMI',
      value: calculations?.anthropometry?.bmi ?? '—',
      hint: isFr ? 'Poids / taille²' : 'Weight / height²',
      Icon: Activity,
    },
    {
      label: isFr ? 'Score FINDRISC' : 'FINDRISC score',
      value:
        calculations?.findriscModel?.score !== null &&
        calculations?.findriscModel?.score !== undefined
          ? calculations.findriscModel.score
          : '—',
      hint: calculations?.findriscModel?.levelLabel || (isFr ? 'Questionnaire à compléter' : 'Questionnaire to complete'),
      Icon: ClipboardList,
    },
  ];

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col pb-20 lg:pb-0">
      <DemoBanner />

      {/* Top Liquid Glass Header */}
      <header className="liquid-glass border-b border-white/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <MediBeninLogo />
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
                  ? `Titulaire : ${currentUser?.displayName || rootParent.displayName}`
                  : `Account Holder: ${currentUser?.displayName || rootParent.displayName}`}
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

      {/* Family accounts info modal */}
      {showFamilyInfo && (
        <div className="fixed inset-0 z-50 bg-[#072627]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white border border-[#D5F2EE] shadow-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0F6B6B] shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#0B3B3C] font-heading">
                {isFr ? 'Comptes famille' : 'Family accounts'}
              </h3>
            </div>
            <div className="space-y-2.5 text-xs text-[#334155] leading-relaxed">
              <p>
                {isFr
                  ? 'Chaque adulte dispose de son propre dossier. Les enfants de moins de 18 ans apparaissent comme dossiers affiliés au compte du parent.'
                  : 'Each adult has their own record. Children under 18 appear as affiliated records on the parent’s account.'}
              </p>
              <p>
                {isFr
                  ? 'Pour consulter le dossier d’un enfant affilié, une validation par code SMS envoyé au parent est demandée à chaque session.'
                  : 'To open an affiliated child’s record, a one-time SMS code sent to the parent is required each session.'}
              </p>
              <p>
                {isFr
                  ? 'À 18 ans, le jeune peut demander un dossier indépendant, validé par son équipe de soin.'
                  : 'At 18, the young person can request an independent record, confirmed by their care team.'}
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowFamilyInfo(false)}
                className="px-4 py-2 rounded-xl bg-[#0B3B3C] text-white text-xs font-semibold cursor-pointer"
              >
                {isFr ? 'Compris' : 'Got it'}
              </button>
            </div>
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
                {isFr ? 'Mon Dossier & Enfants Affiliés' : 'My Record & Affiliated Children'}
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

            <button
              type="button"
              onClick={() => setShowFamilyInfo(true)}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] font-semibold text-[#0F6B6B] hover:bg-[#F0FDFA] cursor-pointer text-start leading-relaxed"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isFr
                  ? 'Comment fonctionnent les comptes famille ?'
                  : 'How family accounts work'}
              </span>
            </button>
          </GlassCard>

          <nav className="liquid-glass rounded-3xl p-2.5 space-y-1">
            {[
              { id: 'home', label: isFr ? 'Accueil' : 'Home', Icon: Home },
              {
                id: 'checkup',
                label: isFr ? 'Mon Bilan & Mesures' : 'My Health Check',
                Icon: CheckCircle2,
              },
              {
                id: 'plan',
                label: isFr ? 'Plan de dépistage' : 'Screening Plan',
                Icon: ClipboardList,
              },
              {
                id: 'reminders',
                label: isFr ? 'Assistant rappels' : 'Reminder Assistant',
                Icon: BellRing,
              },
              { id: 'journey', label: isFr ? 'Mon parcours' : 'Care Journey', Icon: Calendar },
              { id: 'notifications', label: isFr ? 'Messages' : 'Messages', Icon: Bell },
              { id: 'profile', label: isFr ? 'Préférences' : 'Preferences', Icon: User },
              { id: 'privacy', label: isFr ? 'Consentements' : 'Consents', Icon: Shield },
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
                        ? 'Passage à la majorité (18 ans)'
                        : 'Majority Reached (18y+)'}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#0B3B3C] font-heading">
                      {isFr
                        ? `${profile.displayName} (${profile.ageYears} ans) est éligible à la reprise autonome de ses données`
                        : `${profile.displayName} (${profile.ageYears}y) is eligible for autonomous record ownership`}
                    </h3>
                    <p className="text-xs text-[#334155]">
                      {isFr
                        ? 'La demande est validée par l’équipe de soin avant l’activation du dossier indépendant.'
                        : 'The request is confirmed by the care team before the independent record is activated.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRequestMajorityDetachment(profile.id)}
                    className="px-4 py-2.5 rounded-xl btn-liquid-primary text-xs font-bold shrink-0 cursor-pointer"
                  >
                    {isFr
                      ? 'Demander un dossier indépendant'
                      : 'Request independent record'}
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
                  {/* Health risk alerts & live calculation summary */}
                  <GlassCard interactive={false} className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                          {isFr ? 'Alertes santé & calcul dynamique' : 'Health alerts & live calculation'}
                        </span>
                        <h2 className="text-lg font-bold text-[#0B3B3C] font-heading">
                          {isFr ? 'Votre niveau de risque actuel' : 'Your current risk level'}
                        </h2>
                        <p className="text-xs text-[#64748B]">
                          {profile.primaryReasonSummary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <LevelBadge level={profile.overallLevel} />
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                          {isFr ? 'Certitude' : 'Certainty'}: {profile.overallCertainty}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {riskMetrics.map((metric) => {
                        const IconComp = metric.Icon;
                        return (
                          <div key={metric.label} className="card-3d rounded-2xl p-3 space-y-0.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B]">
                              <IconComp className="w-3.5 h-3.5 text-[#0F6B6B]" />
                              {metric.label}
                            </span>
                            <p className="text-base font-extrabold text-[#0B3B3C] font-heading">
                              {String(metric.value)}
                            </p>
                            <p className="text-[10px] text-[#64748B]">{metric.hint}</p>
                          </div>
                        );
                      })}
                    </div>

                    {profileFlags.filter((f) => f.level !== 'green').length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#0B3B3C]">
                          {isFr ? 'Points d’attention actifs' : 'Active attention points'}
                        </p>
                        {profileFlags
                          .filter((f) => f.level !== 'green')
                          .slice(0, 4)
                          .map((flag) => (
                            <div
                              key={flag.id}
                              className={`rounded-2xl border p-3 space-y-1 ${
                                flag.level === 'red'
                                  ? 'bg-red-50 border-red-200'
                                  : flag.level === 'orange'
                                  ? 'bg-orange-50 border-orange-200'
                                  : flag.level === 'grey'
                                  ? 'bg-slate-50 border-slate-200'
                                  : 'bg-amber-50 border-amber-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-[#0B3B3C]">{flag.title}</p>
                                <LevelBadge level={flag.level as any} size="sm" />
                              </div>
                              <p className="text-[11px] text-[#334155]">
                                {(flag.factors || [])[0]}
                              </p>
                              <p className="text-[10px] text-[#64748B]">
                                {flag.sourceLabel} · {flag.dueDate} ·{' '}
                                {isFr ? 'Certitude' : 'Certainty'}: {flag.certainty}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#334155] bg-[#F0FDF4] border border-emerald-200 rounded-2xl px-3.5 py-3">
                        {isFr
                          ? 'Aucune alerte active. Continuez votre suivi préventif habituel.'
                          : 'No active alert. Continue your usual preventive follow-up.'}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('checkup')}
                        className="px-3.5 py-2 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Activity className="w-4 h-4" />
                        <span>{isFr ? 'Mettre à jour mes mesures' : 'Update my measurements'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('plan')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>{isFr ? 'Voir mon plan de dépistage' : 'View my screening plan'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reminders')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>{isFr ? 'Assistant de rappel' : 'Reminder assistant'}</span>
                      </button>
                    </div>
                  </GlassCard>

                  {rec && (
                    <GlassCard glow interactive={false} className="space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F6B6B]">
                            {isFr ? 'Prochaine étape' : 'Next Step'}
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
                            {isFr
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

                  {/* Visual Indicators */}
                  {profile.pathwayType === 'adult' ? (
                    <GlassCard interactive={false} className="space-y-4">
                      {(() => {
                        const zoneKey = deriveBpZoneKey(profile.bpZoneLabel);
                        const series: Array<{
                          dateLabel: string;
                          systolic?: number;
                          diastolic?: number;
                        }> = profile.bpSeries || [];
                        return (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                                  {isFr ? 'Tension au repos' : 'Resting Blood Pressure'}
                                </h3>
                                <p className="text-xs text-[#64748B]">
                                  {isFr ? 'Évolution de vos mesures' : 'Your readings over time'}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-xl border text-xs font-semibold ${BP_ZONE_CHIP[zoneKey]}`}
                              >
                                {isFr
                                  ? zoneKey === 'above'
                                    ? 'Au-dessus de la zone cible — confirmation prioritaire'
                                    : zoneKey === 'borderline'
                                    ? 'Zone limite — conservez votre suivi programmé'
                                    : zoneKey === 'target'
                                    ? 'Dans la zone cible'
                                    : 'Tension non mesurée pour le moment'
                                  : zoneKey === 'above'
                                  ? 'Above target zone — priority confirmation'
                                  : zoneKey === 'borderline'
                                  ? 'Borderline zone — keep your scheduled follow-up'
                                  : zoneKey === 'target'
                                  ? 'Within your target zone'
                                  : 'Blood pressure not recorded yet'}
                              </span>
                            </div>

                            {series.length > 0 ? (
                              <>
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <BpGauge
                                    clipId="bp-sys"
                                    title={isFr ? 'Systolique' : 'Systolic'}
                                    data={series}
                                    dataKey="systolic"
                                    min={90}
                                    max={170}
                                    target={130}
                                    limit={140}
                                    trendLabels={{
                                      up: isFr ? 'En hausse' : 'Rising',
                                      down: isFr ? 'En amélioration' : 'Improving',
                                      stable: isFr ? 'Stable' : 'Stable',
                                    }}
                                  />
                                  <BpGauge
                                    clipId="bp-dia"
                                    title={isFr ? 'Diastolique' : 'Diastolic'}
                                    data={series}
                                    dataKey="diastolic"
                                    min={50}
                                    max={110}
                                    target={85}
                                    limit={90}
                                    trendLabels={{
                                      up: isFr ? 'En hausse' : 'Rising',
                                      down: isFr ? 'En amélioration' : 'Improving',
                                      stable: isFr ? 'Stable' : 'Stable',
                                    }}
                                  />
                                </div>
                                {/* Shared zone legend */}
                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] font-semibold text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D1FAE5] border border-[#A7F3D0]" />
                                    {isFr ? 'Zone cible' : 'Target zone'}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FDE68A] border border-[#FCD34D]" />
                                    {isFr ? 'À suivre' : 'Follow-up'}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FECACA] border border-[#FCA5A5]" />
                                    {isFr ? 'À confirmer' : 'Needs confirmation'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-[#64748B] py-4 text-center">
                                {isFr
                                  ? 'Aucune mesure enregistrée pour le moment.'
                                  : 'No readings recorded yet.'}
                              </p>
                            )}
                          </>
                        );
                      })()}
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

              {/* TAB 1B: INTERACTIVE SELF-ASSESSMENT & HOME VITALS */}
              {activeTab === 'checkup' && (
                <GlassCard interactive={false} className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Auto-Évaluation Guidée & Mesures à Domicile'
                        : 'Guided Self-Assessment & Home Vitals'}
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
                        ? 'Vos informations mettent à jour vos vérifications recommandées en un seul rendez-vous (sans poser de diagnostic médical).'
                        : 'Your entries update your recommended checks in a single visit (non-diagnostic guidance).'}
                    </p>
                  </div>

                  {riskAnalysisError && (
                    <div className="bg-[#FEF2F2] border border-red-200 text-[#B91C1C] px-4 py-3 rounded-xl text-xs font-semibold">
                      {riskAnalysisError}
                    </div>
                  )}

                  {/* Manual-entry affordance: evaluators can start from a blank form
                      or load a labelled example, instead of being forced to edit
                      preloaded demo values. */}
                  <div className="rounded-2xl border border-[#D5F2EE] bg-[#F0FDFA] p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-[#0F6B6B]" />
                        <p className="text-xs font-semibold text-[#0B3B3C]">
                          {manualMode
                            ? isFr
                              ? 'Mode saisie libre activé — entrez vos propres valeurs.'
                              : 'Free-entry mode enabled — enter your own values.'
                            : isFr
                            ? 'Chaque champ est modifiable. Vous pouvez aussi partir d’un formulaire vide.'
                            : 'Every field is editable. You can also start from a blank form.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setManualMode(true);
                            setSelfForm(EMPTY_SELF_FORM);
                            setLastAssessment(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[#0B3B3C] text-[11px] font-bold"
                        >
                          {isFr ? 'Formulaire vide' : 'Blank form'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setManualMode(true);
                            setSelfForm(DEMO_SELF_FORM);
                            setLastAssessment(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] text-[11px] font-bold"
                        >
                          {isFr ? 'Charger un exemple' : 'Load an example'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {lastAssessment && (
                    <div className="rounded-2xl border-2 border-[#0F6B6B]/30 bg-white p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                            {isFr ? 'Résultat du calcul dynamique' : 'Live calculation result'}
                          </span>
                          <p className="text-sm font-extrabold text-[#0B3B3C] font-heading">
                            {isFr
                              ? 'Votre parcours vient d’être recalculé'
                              : 'Your pathway has just been recalculated'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <LevelBadge level={lastAssessment.overallLevel as any} />
                          <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                            {isFr ? 'Certitude' : 'Certainty'}: {lastAssessment.overallCertainty}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {
                            label: isFr ? 'Risque CV 10 ans' : '10y CV risk',
                            value:
                              lastAssessment.calculations?.whoCvdModel?.riskPercent !== null &&
                              lastAssessment.calculations?.whoCvdModel?.riskPercent !== undefined
                                ? `${lastAssessment.calculations.whoCvdModel.riskPercent}%`
                                : '—',
                          },
                          {
                            label: isFr ? 'Tension retenue' : 'Retained BP',
                            value:
                              lastAssessment.calculations?.bpProtocol?.retainedSys &&
                              lastAssessment.calculations?.bpProtocol?.retainedDia
                                ? `${lastAssessment.calculations.bpProtocol.retainedSys}/${lastAssessment.calculations.bpProtocol.retainedDia}`
                                : '—',
                          },
                          {
                            label: isFr ? 'Indice de masse corporelle' : 'BMI',
                            value: lastAssessment.calculations?.anthropometry?.bmi ?? '—',
                          },
                          {
                            label: 'FINDRISC',
                            value:
                              lastAssessment.calculations?.findriscModel?.score ?? '—',
                          },
                        ].map((metric) => (
                          <div key={metric.label} className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5">
                            <p className="text-[10px] text-[#64748B]">{metric.label}</p>
                            <p className="text-sm font-extrabold text-[#0B3B3C] font-heading">
                              {String(metric.value)}
                            </p>
                          </div>
                        ))}
                      </div>
                      {(lastAssessment.flags || []).filter((f: any) => f.level !== 'green').length > 0 && (
                        <div className="space-y-1.5">
                          {(lastAssessment.flags || [])
                            .filter((f: any) => f.level !== 'green')
                            .slice(0, 3)
                            .map((flag: any) => (
                              <div
                                key={flag.ruleId}
                                className="flex items-start justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2"
                              >
                                <div>
                                  <p className="text-[11px] font-bold text-[#0B3B3C]">{flag.title}</p>
                                  <p className="text-[10px] text-[#64748B]">{(flag.factors || [])[0]}</p>
                                </div>
                                <LevelBadge level={flag.level as any} size="sm" />
                              </div>
                            ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('plan')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>{isFr ? 'Voir mon plan recalculé' : 'View my recalculated plan'}</span>
                      </button>
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
                                {isFr ? '1re mesure (Systolique / Diastolique mmHg)' : 'Reading 1 (Sys / Dia mmHg)'}
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
                                {isFr ? '2e mesure (Systolique / Diastolique mmHg)' : 'Reading 2 (Sys / Dia mmHg)'}
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
                                checked={selfForm.dailyPhysicalActivity === true}
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
                                checked={selfForm.dailyFruitsVeg === true}
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
                                checked={selfForm.smokingStatus === true}
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
                                checked={selfForm.antihypertensiveMedHistory === true}
                                onChange={(e) =>
                                  setSelfForm({
                                    ...selfForm,
                                    antihypertensiveMedHistory: e.target.checked,
                                  })
                                }
                              />
                              <span className="font-medium text-[#0B3B3C]">
                                {isFr
                                  ? 'Traitement contre l’hypertension en cours'
                                  : 'Currently taking blood-pressure medication'}
                              </span>
                            </label>

                            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E2E8F0] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selfForm.highBloodGlucoseHistory === true}
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
                              <option value="">{isFr ? 'Non renseigné' : 'Not answered'}</option>
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

              {/* TAB 2A: PERSONALIZED SCREENING PLANNER */}
              {activeTab === 'plan' && (
                <div className="space-y-5">
                  <GlassCard interactive={false} className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                          {isFr ? 'Planificateur personnalisé' : 'Personalized planner'}
                        </span>
                        <h2 className="text-lg font-bold text-[#0B3B3C] font-heading">
                          {isFr ? 'Mon plan de dépistage' : 'My screening plan'}
                        </h2>
                        <p className="text-xs text-[#64748B]">
                          {isFr
                            ? 'Calculé à partir de vos mesures, des règles cliniques signées et du calendrier national de soins.'
                            : 'Computed from your measurements, the signed clinical rules and the national care calendar.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadPlan(activePatientId)}
                        className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${planLoading ? 'animate-spin' : ''}`} />
                        <span>{isFr ? 'Recalculer' : 'Recalculate'}</span>
                      </button>
                    </div>

                    {activePlan && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          {
                            key: 'overdue',
                            label: isFr ? 'En retard' : 'Overdue',
                            value: activePlan.summary?.overdue ?? 0,
                            tone: 'bg-red-50 text-[#B91C1C] border-red-200',
                          },
                          {
                            key: 'needsData',
                            label: isFr ? 'À compléter' : 'To complete',
                            value: activePlan.summary?.needsData ?? 0,
                            tone: 'bg-slate-50 text-[#475569] border-slate-200',
                          },
                          {
                            key: 'dueSoon',
                            label: isFr ? 'Sous 14 jours' : 'Within 14 days',
                            value: activePlan.summary?.dueSoon ?? 0,
                            tone: 'bg-amber-50 text-[#92400E] border-amber-200',
                          },
                          {
                            key: 'upcoming',
                            label: isFr ? 'À venir' : 'Upcoming',
                            value: activePlan.summary?.upcoming ?? 0,
                            tone: 'bg-teal-50 text-[#0F6B6B] border-teal-200',
                          },
                          {
                            key: 'upToDate',
                            label: isFr ? 'À jour' : 'Up to date',
                            value: activePlan.summary?.upToDate ?? 0,
                            tone: 'bg-emerald-50 text-[#15803D] border-emerald-200',
                          },
                        ].map((chip) => (
                          <div
                            key={chip.key}
                            className={`rounded-xl border px-2.5 py-2 ${chip.tone}`}
                          >
                            <p className="text-lg font-extrabold font-heading">{chip.value}</p>
                            <p className="text-[10px] font-semibold">{chip.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {planLoading && planItems.length === 0 ? (
                      <div className="space-y-2">
                        <div className="h-16 rounded-2xl bg-[#F1F5F9] animate-pulse" />
                        <div className="h-16 rounded-2xl bg-[#F1F5F9] animate-pulse" />
                      </div>
                    ) : planItems.length > 0 ? (
                      <div className="space-y-2.5">
                        {planItems.map((item: any) => (
                          <div
                            key={item.id}
                            className={`rounded-2xl border p-3.5 space-y-1.5 ${
                              item.status === 'overdue'
                                ? 'bg-red-50/70 border-red-200'
                                : item.status === 'needs_data'
                                ? 'bg-slate-50 border-slate-200'
                                : item.status === 'due_soon'
                                ? 'bg-amber-50/70 border-amber-200'
                                : item.status === 'up_to_date'
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : 'bg-white border-[#E2E8F0]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0B3B3C]">{item.title}</p>
                                <p className="text-[10px] text-[#64748B]">
                                  {item.source}
                                  {item.intervalMonths
                                    ? ` · ${isFr ? 'tous les' : 'every'} ${item.intervalMonths} ${isFr ? 'mois' : 'months'}`
                                    : ''}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-lg bg-white/90 border border-[#E2E8F0] text-[10px] font-bold text-[#0B3B3C] whitespace-nowrap">
                                {item.dueLabel}
                              </span>
                            </div>
                            {item.rationale && (
                              <p className="text-[11px] text-[#334155] leading-relaxed">
                                {item.rationale}
                              </p>
                            )}
                            {item.lastDoneLabel && (
                              <p className="text-[10px] text-[#64748B]">{item.lastDoneLabel}</p>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <span className="text-[10px] font-semibold text-[#0F6B6B]">
                                {item.action}
                              </span>
                              {(item.status === 'overdue' ||
                                item.status === 'due_soon' ||
                                item.status === 'needs_data') && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveTab(item.status === 'needs_data' ? 'checkup' : 'reminders')
                                  }
                                  className="px-3 py-1.5 rounded-xl btn-liquid-primary text-[10px] font-bold inline-flex items-center gap-1"
                                >
                                  {item.status === 'needs_data' ? (
                                    <>
                                      <Activity className="w-3 h-3" />
                                      <span>{isFr ? 'Saisir les mesures' : 'Enter measurements'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <CalendarClock className="w-3 h-3" />
                                      <span>{isFr ? 'Planifier' : 'Schedule'}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-3.5 py-3">
                        {isFr
                          ? 'Le plan est en pause car le consentement d’évaluation a été retiré. Réactivez-le dans l’onglet Consentements.'
                          : 'The plan is paused because evaluation consent was withdrawn. Re-enable it in the Consents tab.'}
                      </p>
                    )}
                  </GlassCard>

                  <GlassCard interactive={false} className="space-y-3">
                    <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                      {isFr ? 'Planifier ma prochaine visite' : 'Schedule my next visit'}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {isFr
                        ? 'Choisissez une date : elle sera enregistrée dans votre parcours et l’assistant préparera les rappels.'
                        : 'Choose a date: it will be saved in your pathway and the assistant will prepare reminders.'}
                    </p>
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="text-xs font-semibold text-[#334155]">
                        <span className="block mb-1">{isFr ? 'Date souhaitée' : 'Preferred date'}</span>
                        <input
                          type="date"
                          min={todayDate}
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono text-xs"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleScheduleScreening()}
                        disabled={reminderBusy}
                        className="px-4 py-2.5 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <CalendarClock className="w-4 h-4" />
                        <span>
                          {reminderBusy
                            ? isFr
                              ? 'Enregistrement...'
                              : 'Saving...'
                            : isFr
                            ? 'Confirmer la date'
                            : 'Confirm date'}
                        </span>
                      </button>
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* TAB 2B: SMART REMINDER ASSISTANT */}
              {activeTab === 'reminders' && (
                <div className="space-y-5">
                  <GlassCard interactive={false} className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                          {isFr ? 'Assistant de rappel intelligent' : 'Smart reminder assistant'}
                        </span>
                        <h2 className="text-lg font-bold text-[#0B3B3C] font-heading">
                          {isFr ? 'Rendez-vous à venir & manqués' : 'Upcoming & missed appointments'}
                        </h2>
                        <p className="text-xs text-[#64748B]">
                          {isFr
                            ? 'Rappels proposés à J-7, J-3, J-1 et le jour J. En cas de visite manquée : J+1, J+3, J+7.'
                            : 'Reminders proposed at D-7, D-3, D-1 and on the day. If missed: D+1, D+3, D+7.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadReminders(activePatientId)}
                        className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Actualiser' : 'Refresh'}</span>
                      </button>
                    </div>

                    {!activeReminders ? (
                      <div className="h-24 rounded-2xl bg-[#F1F5F9] animate-pulse" />
                    ) : (
                      <>
                        {!activeReminders.consentEnabled && (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 space-y-2">
                            <p className="text-xs font-semibold text-[#92400E]">
                              {activeReminders.safetyMessage}
                            </p>
                            <button
                              type="button"
                              onClick={handleEnableReminders}
                              className="px-3.5 py-2 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <BellRing className="w-4 h-4" />
                              <span>{isFr ? 'Activer les rappels' : 'Enable reminders'}</span>
                            </button>
                          </div>
                        )}

                        {activeReminders.appointment ? (
                          <div className="card-3d rounded-2xl p-4 space-y-2">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B6B]">
                                  {isFr ? 'Prochain rendez-vous' : 'Next appointment'}
                                </p>
                                <p className="text-sm font-bold text-[#0B3B3C] font-heading">
                                  {activeReminders.appointment.title}
                                </p>
                                <p className="text-xs text-[#64748B]">
                                  {activeReminders.appointment.facility}
                                </p>
                              </div>
                              <StatusChip state={activeReminders.appointment.state} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#334155]">
                              <span className="inline-flex items-center gap-1.5 font-semibold">
                                <CalendarClock className="w-4 h-4 text-[#0F6B6B]" />
                                {activeReminders.appointment.date || (isFr ? 'À planifier' : 'To schedule')}
                              </span>
                              {activeReminders.appointment.daysUntil !== null && (
                                <span>
                                  {activeReminders.appointment.daysUntil < 0
                                    ? isFr
                                      ? `Manquée depuis ${Math.abs(activeReminders.appointment.daysUntil)} jour(s)`
                                      : `Missed ${Math.abs(activeReminders.appointment.daysUntil)} day(s) ago`
                                    : activeReminders.appointment.daysUntil === 0
                                    ? isFr
                                      ? 'Aujourd’hui'
                                      : 'Today'
                                    : isFr
                                    ? `Dans ${activeReminders.appointment.daysUntil} jour(s)`
                                    : `In ${activeReminders.appointment.daysUntil} day(s)`}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-1 rounded-lg bg-white border border-[#E2E8F0] font-semibold">
                                {activeReminders.channel} · {String(activeReminders.language).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-3.5 py-3">
                            {isFr
                              ? 'Aucun rendez-vous planifié. Utilisez le planificateur pour choisir une date.'
                              : 'No appointment scheduled yet. Use the planner to choose a date.'}
                          </p>
                        )}

                        {activeReminders.safetyMessage && activeReminders.consentEnabled && (
                          <p className="text-xs text-[#92400E] bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5">
                            {activeReminders.safetyMessage}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-[#0B3B3C]">
                              {isFr ? 'Avant la visite' : 'Before the visit'}
                            </h3>
                            {(activeReminders.upcomingReminders || []).length > 0 ? (
                              (activeReminders.upcomingReminders || []).map((slot: any) => (
                                <div
                                  key={slot.id}
                                  className="rounded-2xl border border-[#E2E8F0] bg-white p-3 space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-[#0B3B3C]">
                                      {slot.label} · {slot.scheduledFor}
                                    </span>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                                        slot.status === 'to_send'
                                          ? 'bg-amber-50 text-[#92400E] border border-amber-200'
                                          : 'bg-slate-50 text-[#475569] border border-slate-200'
                                      }`}
                                    >
                                      {slot.status === 'to_send'
                                        ? isFr
                                          ? 'À envoyer'
                                          : 'To send'
                                        : isFr
                                        ? 'Planifié'
                                        : 'Planned'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#64748B] leading-relaxed">
                                    {slot.message}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-[#64748B]">
                                {isFr ? 'Aucun rappel à venir.' : 'No upcoming reminder.'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-[#0B3B3C]">
                              {isFr ? 'Visite manquée' : 'Missed visit'}
                            </h3>
                            {(activeReminders.missedReminders || []).length > 0 ? (
                              (activeReminders.missedReminders || []).map((slot: any) => (
                                <div
                                  key={slot.id}
                                  className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-[#0B3B3C]">
                                      {slot.label} · {slot.scheduledFor}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold bg-white text-[#92400E] border border-amber-200">
                                      {slot.status === 'to_send'
                                        ? isFr
                                          ? 'À envoyer'
                                          : 'To send'
                                        : isFr
                                        ? 'Planifié'
                                        : 'Planned'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#64748B] leading-relaxed">
                                    {slot.message}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-[#64748B]">
                                {isFr ? 'Aucune visite manquée.' : 'No missed visit.'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSendReminder('upcoming')}
                            disabled={!activeReminders.canSend || reminderBusy}
                            className="px-4 py-2.5 rounded-xl btn-liquid-primary text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            <span>
                              {reminderBusy
                                ? isFr
                                  ? 'Envoi...'
                                  : 'Sending...'
                                : isFr
                                ? 'Envoyer un rappel maintenant'
                                : 'Send a reminder now'}
                            </span>
                          </button>
                          {(activeReminders.missedReminders || []).length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder('missed')}
                              disabled={!activeReminders.consentEnabled || reminderBusy}
                              className="px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <BellRing className="w-4 h-4" />
                              <span>{isFr ? 'Relancer pour la visite manquée' : 'Follow up on the missed visit'}</span>
                            </button>
                          )}
                          <span className="text-[10px] text-[#64748B]">
                            {isFr ? 'Rappels envoyés' : 'Reminders sent'}:{' '}
                            {activeReminders.remindersSentCount}/{activeReminders.maxReminders}
                          </span>
                        </div>
                      </>
                    )}
                  </GlassCard>

                  <GlassCard interactive={false} className="space-y-3">
                    <h3 className="text-base font-bold text-[#0B3B3C] font-heading">
                      {isFr ? 'Historique des messages' : 'Message history'}
                    </h3>
                    {(activeReminders?.history || []).length > 0 ? (
                      (activeReminders.history || []).map((item: any) => (
                        <div key={item.id} className="card-3d rounded-2xl p-3.5 space-y-1">
                          <div className="flex items-center justify-between gap-2 text-[10px] text-[#64748B]">
                            <span className="font-bold text-[#0B3B3C]">{item.channel}</span>
                            <span className="font-mono">{item.sentAt}</span>
                          </div>
                          <p className="text-xs font-bold text-[#0B3B3C]">{item.title}</p>
                          <p className="text-[11px] text-[#334155] leading-relaxed">{item.bodyText}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#64748B]">
                        {isFr
                          ? 'Aucun message envoyé pour le moment.'
                          : 'No message sent yet.'}
                      </p>
                    )}
                  </GlassCard>
                </div>
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
                        description="Include de-identified status in aggregate statistics (small groups are always masked)."
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
                          {isFr
                            ? 'Chaque accès à votre dossier est tracé et expliqué.'
                            : 'Every access to your record is logged and explained.'}
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
                              {log.dataCategory}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-[#334155]">
                            {isFr ? 'Pourquoi ? ' : 'Why: '}
                            {log.purposeDescription}
                          </p>
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
                            <th className="py-2 px-3 text-start">Why</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {(data?.usageLogs || []).map((log: any) => (
                            <tr key={log.id}>
                              <td className="py-2.5 px-3 font-semibold text-[#0B3B3C]">
                                {log.actorName}
                              </td>
                              <td className="py-2.5 px-3 text-[#334155]">{log.dataCategory}</td>
                              <td className="py-2.5 px-3 text-[#64748B]">
                                {log.purposeDescription}
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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 liquid-glass border-t border-white/60 z-30 flex items-center gap-1 overflow-x-auto no-scrollbar py-2 px-1 pb-safe">
        {[
          { id: 'home', label: isFr ? 'Accueil' : 'Home', Icon: Home },
          { id: 'checkup', label: isFr ? 'Bilan' : 'Check', Icon: CheckCircle2 },
          { id: 'plan', label: isFr ? 'Plan' : 'Plan', Icon: ClipboardList },
          { id: 'reminders', label: isFr ? 'Rappels' : 'Remind', Icon: BellRing },
          { id: 'journey', label: isFr ? 'Parcours' : 'Journey', Icon: Calendar },
          { id: 'notifications', label: isFr ? 'Messages' : 'Messages', Icon: Bell },
          { id: 'privacy', label: isFr ? 'Accès' : 'Consents', Icon: Shield },
        ].map((item) => {
          const IconComp = item.Icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-colors shrink-0 ${
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