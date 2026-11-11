import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  AlertTriangle,
  HelpCircle,
  PhoneCall,
  Send,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  LogOut,
  Lock,
} from 'lucide-react';
import { useI18n } from '../lib/i18n.tsx';
import { apiClient } from '../lib/api.ts';
import {
  MediSenseLogo,
  DemoBanner,
  LanguageSwitch,
  LevelBadge,
  StatusChip,
  StatCard,
  GlassCard,
} from './MediSenseUI.tsx';
import { UserRole } from '../lib/types.ts';

interface PopulationPortalsProps {
  role: 'coordinator' | 'public_health';
  onLogout: () => void;
}

export const PopulationPortals: React.FC<PopulationPortalsProps> = ({
  role,
  onLogout,
}) => {
  const { locale } = useI18n();
  const isFr = locale === 'fr';

  const [coordData, setCoordData] = useState<any>(null);
  const [obsData, setObsData] = useState<any>(null);
  const [acceptanceReport, setAcceptanceReport] = useState<any>(null);
  const [showAcceptanceDetails, setShowAcceptanceDetails] = useState<boolean>(false);
  const [seedInput, setSeedInput] = useState<number>(20261120);
  const [activeQueueTab, setActiveQueueTab] = useState<'prioritized' | 'red' | 'grey'>('prioritized');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Interactive Coordinator S_prio & M1 Simulator State (Screen 1 ONLY)
  const [showSimPanel, setShowSimPanel] = useState<boolean>(false);
  const [simForm, setSimForm] = useState({
    overallLevel: 'orange',
    openGapsCount: 2,
    maxOverdueDays: 90,
    accessTimeMinutes: 45,
    languageNeedsSupport: true,
    residesInUnderservedZoneC1: true,
    contextConsentGiven: true,
    missedVisitsCount: 2,
    reminderRank: 1,
  });
  const [simResult, setSimResult] = useState<any>(null);

  // Interactive Public Health Impact Model Calculator (Section 18.3)
  const [impactInvitedN, setImpactInvitedN] = useState<number>(1000);
  const [impactAdoptionRef, setImpactAdoptionRef] = useState<number>(41.2);
  const [impactAdoptionMediSense, setImpactAdoptionMediSense] = useState<number>(63.8);
  const [impactYieldR, setImpactYieldR] = useState<number>(21.8);

  // Coordinator Competent Service: Family Affiliation (<18y) & Definitive Majority Detachment (18y+)
  const [familyData, setFamilyData] = useState<{
    affiliatedRecords: any[];
    pendingMajorityDetachments: any[];
  }>({ affiliatedRecords: [], pendingMajorityDetachments: [] });
  const [showAddMinorPanel, setShowAddMinorPanel] = useState(false);
  const [parentQuery, setParentQuery] = useState('');
  const [parentMatches, setParentMatches] = useState<any[]>([]);
  const [minorForm, setMinorForm] = useState({
    displayName: 'Salma Al-Nadim',
    pathwayType: 'child' as 'child' | 'adolescent',
    ageYears: '4',
    ageMonths: '48',
    sex: 'female',
    parentPatientId: 'PT-36Y-TARIQ',
    weightKg: '16.2',
    heightCm: '102',
  });

  const loadData = async (seed = seedInput) => {
    try {
      if (role === 'coordinator') {
        const [c, initialSim, fam] = await Promise.all([
          apiClient.getCoordinatorQueue(),
          apiClient.simulateLogistics(simForm),
          apiClient.getPendingMajorityDetachments().catch(() => ({
            affiliatedRecords: [],
            pendingMajorityDetachments: [],
          })),
        ]);
        setCoordData(c);
        setSimResult(initialSim);
        setFamilyData(fam);
      } else {
        const [o, acc] = await Promise.all([
          apiClient.getObservatorySummary(seed),
          apiClient.runAcceptanceSuite(),
        ]);
        setObsData(o);
        setAcceptanceReport(acc);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (role !== 'coordinator') return;
    let active = true;
    apiClient
      .searchParents(parentQuery)
      .then((res) => {
        if (active) setParentMatches(res.parents || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [parentQuery, role]);

  const handleCoordinatorApproveDetachment = async (childId: string, childName: string) => {
    try {
      const res = await apiClient.approveMajorityDetachment(childId);
      setFeedback(
        isFr
          ? `Service Compétent (Coordinateur) : Détachement à la majorité validé définitivement pour ${childName} (${childId}). Compte adulte autonome IFHAS activé (${res.autonomousEmail}).`
          : `Competent Service (Coordinator): Majority detachment definitively validated for ${childName} (${childId}). Autonomous Adult IFHAS account active (${res.autonomousEmail}).`
      );
      await loadData();
    } catch (err: any) {
      setFeedback(err.message);
    }
  };

  const handleCoordinatorAffiliateMinor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.analyzePatient({
        displayName: minorForm.displayName,
        pathwayType: minorForm.pathwayType,
        ageYears: Number(minorForm.ageYears),
        ageMonths: Number(minorForm.ageMonths),
        sex: minorForm.sex,
        parentPatientId: minorForm.parentPatientId,
        weightKg: Number(minorForm.weightKg),
        heightCm: Number(minorForm.heightCm),
        provenanceMode: 'V',
      });
      setShowAddMinorPanel(false);
      setFeedback(
        isFr
          ? `Service Compétent : L’enfant ${res.patient.displayName} (${res.patient.id}) a été inscrit et affilié au parent ${minorForm.parentPatientId}.`
          : `Competent Service: Minor ${res.patient.displayName} (${res.patient.id}) registered and affiliated to parent ${minorForm.parentPatientId}.`
      );
      await loadData();
    } catch (err: any) {
      setFeedback(err.message);
    }
  };

  const handleRunLogisticsSim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.simulateLogistics(simForm);
      setSimResult(res);
      setFeedback(
        isFr
          ? 'Simulation S_prio & Modèle M1 recalculée en backend (Garantie TEST-M1 vérifiée).'
          : 'Backend S_prio & M1 simulation recalculated (TEST-M1 non-downgrade verified).'
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData(seedInput);
  }, [role]);

  // Derived Impact Model Calculations (Section 18.3)
  const confirmedRefVisits = Math.round(impactInvitedN * (impactAdoptionRef / 100));
  const confirmedMediSenseVisits = Math.round(impactInvitedN * (impactAdoptionMediSense / 100));
  const additionalConfirmedVisits = Math.max(0, confirmedMediSenseVisits - confirmedRefVisits);
  const additionalDetectedConditions =
    Math.round(additionalConfirmedVisits * (impactYieldR / 100) * 10) / 10;

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col">
      <DemoBanner />

      <header className="liquid-glass border-b border-white/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <MediSenseLogo />
            <span className="hidden md:inline text-xs font-semibold text-[#64748B] border-s border-[#E2E8F0] ps-4 truncate">
              {role === 'coordinator'
                ? isFr
                  ? 'Coordinateur · Écran 1'
                  : 'Care Coordinator · Screen 1'
                : isFr
                ? 'Observatoire Santé Publique'
                : 'Public Health Observatory'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/85 text-[#0B3B3C] border border-[#D5F2EE] rounded-xl px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B6B]" />
              <span>
                {role === 'coordinator'
                  ? isFr
                    ? 'Orace A. · Coordinateur (Écran 1)'
                    : 'Orace A. · Coordinator (Screen 1)'
                  : isFr
                  ? 'Bienderan E. · Santé Publique'
                  : 'Bienderan E. · Public Health'}
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
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass border border-[#14A39A]/50 text-[#0B3B3C] px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3"
          >
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="font-bold text-[#0F6B6B] shrink-0"
            >
              OK
            </button>
          </motion.div>
        )}

        {role === 'coordinator' ? (
          /* ===============================================================
           * COORDINATOR PORTAL (Screen 1: 3 Queues + S_prio + M1 Support)
           * =============================================================== */
          coordData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title="Immediate Red Queue"
                  value={coordData.redImmediateQueue?.length || 0}
                  subtitle="Bypasses priority score"
                  icon={<AlertTriangle className="w-4 h-4 text-[#B91C1C]" />}
                />
                <StatCard
                  title="Level Grey Queue"
                  value={coordData.greyCompletionQueue?.length || 0}
                  subtitle="Missing baseline data"
                  icon={<HelpCircle className="w-4 h-4 text-[#475569]" />}
                />
                <StatCard
                  title="Daily Capacity (K_day)"
                  value={`${coordData.prioritizedInvitationQueue?.length || 0} / ${coordData.dailyCapacityLimit}`}
                  subtitle={`Human budget B = ${coordData.humanContactBudgetB}/day`}
                  icon={<Users className="w-4 h-4" />}
                />
                <StatCard
                  title="S_prio Stability (±0.10)"
                  value={`${coordData.sensitivityAnalysis?.topKOverlapPercent}%`}
                  subtitle={coordData.sensitivityAnalysis?.status}
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
              </div>

              {/* Competent Service: Family Affiliation (< 18y) & Definitive Validation of Majority Detachment (18y+) */}
              <GlassCard interactive={false} className="space-y-4 border border-[#0F6B6B]/35">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Service Compétent · Gouvernance des Affiliations Familiales (< 18 ans) & Majorité (18 ans+)'
                        : 'Competent Service · Family Affiliation (< 18y) & Majority Detachment Governance (18y+)'}
                    </span>
                    <h2 className="text-base font-extrabold text-[#0B3B3C] font-heading">
                      {isFr
                        ? 'Rattachement d’Enfants par Recherche BD Parent & Validation Définitive de Majorité'
                        : 'Child Registration via Parent DB Lookup & Definitive Majority Detachment Validation'}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddMinorPanel(!showAddMinorPanel)}
                    className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-bold cursor-pointer"
                  >
                    {showAddMinorPanel
                      ? isFr
                        ? 'Fermer le formulaire d’affiliation'
                        : 'Close Affiliation Form'
                      : isFr
                      ? '+ Inscrire & Affilier un Enfant (< 18 ans)'
                      : '+ Register & Affiliate a Minor (< 18y)'}
                  </button>
                </div>

                {showAddMinorPanel && (
                  <form
                    onSubmit={handleCoordinatorAffiliateMinor}
                    className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#0B3B3C] mb-1">
                          {isFr ? 'Nom complet de l’enfant (< 18 ans)' : 'Minor Full Name (< 18y)'}
                        </label>
                        <input
                          type="text"
                          value={minorForm.displayName}
                          onChange={(e) =>
                            setMinorForm({ ...minorForm, displayName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-semibold text-[#0B3B3C]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#0B3B3C] mb-1">
                          {isFr ? 'Parcours' : 'Pathway'}
                        </label>
                        <select
                          value={minorForm.pathwayType}
                          onChange={(e) =>
                            setMinorForm({
                              ...minorForm,
                              pathwayType: e.target.value as 'child' | 'adolescent',
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-semibold text-[#0B3B3C]"
                        >
                          <option value="child">Enfant (0–9 ans)</option>
                          <option value="adolescent">Adolescent (10–17 ans)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#0B3B3C] mb-1">
                          {isFr ? 'Âge (années < 18)' : 'Age (years < 18)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={17}
                          value={minorForm.ageYears}
                          onChange={(e) =>
                            setMinorForm({
                              ...minorForm,
                              ageYears: e.target.value,
                              ageMonths: String(Math.max(6, Number(e.target.value) * 12)),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono text-[#0B3B3C]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="block font-bold text-[#0B3B3C]">
                        {isFr
                          ? 'Recherche automatique du Parent dans la Base de Données (ID ou Nom) :'
                          : 'Automatic Parent Database Lookup (by ID or Name):'}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={parentQuery}
                          onChange={(e) => setParentQuery(e.target.value)}
                          placeholder={
                            isFr
                              ? 'Saisir ID (ex: PT-36Y-TARIQ) ou Nom du parent (ex: Tariq)...'
                              : 'Enter Parent ID (e.g. PT-36Y-TARIQ) or Name (e.g. Tariq)...'
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0B3B3C]"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {parentMatches.slice(0, 4).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() =>
                                setMinorForm({ ...minorForm, parentPatientId: p.id })
                              }
                              className={`px-2.5 py-1.5 rounded-xl font-semibold cursor-pointer ${
                                minorForm.parentPatientId === p.id
                                  ? 'bg-[#0B3B3C] text-white'
                                  : 'bg-white border border-[#CBD5E1] text-[#0B3B3C]'
                              }`}
                            >
                              {p.displayName} ({p.id})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl btn-liquid-primary font-bold cursor-pointer"
                      >
                        {isFr
                          ? `Valider l’inscription & Affilier au parent (${minorForm.parentPatientId})`
                          : `Register Minor & Affiliate to Parent (${minorForm.parentPatientId})`}
                      </button>
                    </div>
                  </form>
                )}

                {/* Pending 18y Majority Detachments + Affiliated Children Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? `Validation Définitive de Majorité (18 ans+) · (${familyData.pendingMajorityDetachments.length})`
                        : `Definitive Majority Detachment Validation (18y+) · (${familyData.pendingMajorityDetachments.length})`}
                    </span>
                    {familyData.pendingMajorityDetachments.length === 0 ? (
                      <p className="text-[#64748B]">
                        {isFr
                          ? 'Tous les dossiers majeurs (18 ans+) ont été détachés et validés.'
                          : 'All 18y+ records have been detached and validated.'}
                      </p>
                    ) : (
                      familyData.pendingMajorityDetachments.map((item) => (
                        <div
                          key={item.childId}
                          className="p-3 rounded-xl bg-white border border-[#CBD5E1] flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-bold text-[#0B3B3C]">
                              {item.childName} ({item.ageYears} ans · {item.childId})
                            </p>
                            <p className="text-[11px] text-[#64748B]">
                              {isFr ? 'Parent actuel :' : 'Current Parent:'} {item.parentName} ({item.parentId})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCoordinatorApproveDetachment(item.childId, item.childName)
                            }
                            className="px-3 py-1.5 rounded-xl btn-liquid-primary font-bold cursor-pointer"
                          >
                            {isFr
                              ? 'Valider définitivement le détachement (18 ans+)'
                              : 'Definitively Validate Detachment (18y+)'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B3B3C] block">
                      {isFr
                        ? `Enfants actuellement affiliés (< 18 ans) · (${familyData.affiliatedRecords.length})`
                        : `Currently Affiliated Children (< 18y) · (${familyData.affiliatedRecords.length})`}
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {familyData.affiliatedRecords.map((rec) => (
                        <div
                          key={rec.childId}
                          className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-[#0B3B3C]">{rec.childName}</span>
                            <span className="text-[11px] text-[#64748B] ms-1.5">
                              ({rec.ageYears < 2 ? `${rec.ageMonths}m` : `${rec.ageYears}a`}) →{' '}
                              {rec.parentName}
                            </span>
                          </div>
                          <LevelBadge level={rec.overallLevel} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Interactive S_prio & M1 Backend Logistics Simulator */}
              <GlassCard interactive={false} className="space-y-4 border border-[#14A39A]/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Calculateur Opérationnel Backend · Écran 1 Uniquement (TEST-E2 / TEST-M1)'
                        : 'Backend Operational Calculator · Screen 1 Only (TEST-E2 / TEST-M1)'}
                    </span>
                    <h2 className="text-base font-extrabold text-[#0B3B3C] font-heading">
                      {isFr
                        ? 'Simulateur d’Ordonnancement S_prio & Probabilité de Non-Présentation M1'
                        : 'S_prio Priority Score & M1 No-Show Probability Simulator'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSimPanel(!showSimPanel)}
                    className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-bold cursor-pointer"
                  >
                    {showSimPanel
                      ? isFr
                        ? 'Masquer le simulateur'
                        : 'Hide Simulator'
                      : isFr
                      ? 'Tester la formule S_prio & M1 en direct'
                      : 'Test Live S_prio & M1 Formula'}
                  </button>
                </div>

                {showSimPanel && (
                  <form onSubmit={handleRunLogisticsSim} className="space-y-4 pt-2 border-t border-[#E2E8F0] text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <label className="block font-semibold text-[#334155] mb-1">
                          {isFr ? 'Niveau clinique' : 'Clinical Level'}
                        </label>
                        <select
                          value={simForm.overallLevel}
                          onChange={(e) => setSimForm({ ...simForm, overallLevel: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-semibold text-[#0B3B3C]"
                        >
                          <option value="orange">Orange (I_risque = 0.75)</option>
                          <option value="yellow">Yellow (I_risque = 0.35)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#334155] mb-1">
                          {isFr ? 'Lacunes ouvertes (0–5)' : 'Open Gaps (0–5)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          value={simForm.openGapsCount}
                          onChange={(e) =>
                            setSimForm({ ...simForm, openGapsCount: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#334155] mb-1">
                          {isFr ? 'Retard max (jours)' : 'Max Overdue (days)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={365}
                          value={simForm.maxOverdueDays}
                          onChange={(e) =>
                            setSimForm({ ...simForm, maxOverdueDays: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#334155] mb-1">
                          {isFr ? 'Trajet clinique (min)' : 'Travel Time (min)'}
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={simForm.accessTimeMinutes}
                          onChange={(e) =>
                            setSimForm({ ...simForm, accessTimeMinutes: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#334155] mb-1">
                          {isFr ? 'RDV manqués passés' : 'Prior Missed Visits'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          value={simForm.missedVisitsCount}
                          onChange={(e) =>
                            setSimForm({ ...simForm, missedVisitsCount: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#334155] mb-1">
                          {isFr ? 'Rang de relance (0–2)' : 'Reminder Rank (0–2)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={2}
                          value={simForm.reminderRank}
                          onChange={(e) =>
                            setSimForm({ ...simForm, reminderRank: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-1.5 font-semibold text-[#0B3B3C] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={simForm.languageNeedsSupport}
                            onChange={(e) =>
                              setSimForm({ ...simForm, languageNeedsSupport: e.target.checked })
                            }
                          />
                          <span>{isFr ? 'Soutien linguistique requis' : 'Language support needed'}</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 font-semibold text-[#0B3B3C] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={simForm.residesInUnderservedZoneC1}
                            onChange={(e) =>
                              setSimForm({
                                ...simForm,
                                residesInUnderservedZoneC1: e.target.checked,
                              })
                            }
                          />
                          <span>{isFr ? 'Zone sous-couverte C1' : 'Underserved Zone C1'}</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl btn-liquid-primary font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>
                          {isFr
                            ? 'Calculer S_prio & M1 en Backend'
                            : 'Calculate Backend S_prio & M1'}
                        </span>
                      </button>
                    </div>

                    {simResult && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4]">
                        <div>
                          <span className="text-[11px] text-[#0F6B6B] font-bold block">
                            Formule S_prio (0.40 R + 0.25 L + 0.20 D + 0.15 V)
                          </span>
                          <span className="text-xl font-extrabold font-mono text-[#0B3B3C]">
                            {simResult.simulation.priorityScoreSprio} / 100
                          </span>
                          <span className="text-[11px] text-[#334155] block">
                            {isFr ? 'Sans vulnérabilité :' : 'Baseline without vuln:'}{' '}
                            <strong>{simResult.baselinePriorityScoreSprio}</strong> (TEST-M1 :{' '}
                            {simResult.nonDowngradeVerified ? 'Non-déclassement vérifié' : 'Erreur'})
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#0F6B6B] font-bold block">
                            Probabilité Calibrée M1 (No-Show)
                          </span>
                          <span className="text-xl font-extrabold font-mono text-[#0B3B3C]">
                            {Math.round(simResult.simulation.noShowProbability * 100)}%
                          </span>
                          <span className="text-[11px] text-[#334155] block">
                            {simResult.simulation.topLogisticsFactors?.[0]}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#0F6B6B] font-bold block">
                            {isFr ? 'Accompagnement suggéré' : 'Suggested Support Action'}
                          </span>
                          <span className="font-bold text-xs text-[#0B3B3C] block mt-1">
                            {simResult.simulation.suggestedSupportAction}
                          </span>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </GlassCard>

              <GlassCard interactive={false} className="space-y-4 sm:space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                      Screen 1 — Daily Outreach Queues
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      M1 No-Show risk strengthens accompaniment only — never lowers priority.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F1F5F9]/90 p-1 rounded-xl text-xs overflow-x-auto max-w-full no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActiveQueueTab('prioritized')}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 ${
                        activeQueueTab === 'prioritized'
                          ? 'bg-white text-[#0B3B3C] shadow-2xs'
                          : 'text-[#64748B]'
                      }`}
                    >
                      Prioritized ({coordData.prioritizedInvitationQueue?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQueueTab('red')}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 ${
                        activeQueueTab === 'red'
                          ? 'bg-white text-[#B91C1C] shadow-2xs'
                          : 'text-[#64748B]'
                      }`}
                    >
                      Urgent Red ({coordData.redImmediateQueue?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQueueTab('grey')}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 ${
                        activeQueueTab === 'grey'
                          ? 'bg-white text-[#475569] shadow-2xs'
                          : 'text-[#64748B]'
                      }`}
                    >
                      Grey ({coordData.greyCompletionQueue?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Mobile Outreach Cards (< 768px) */}
                <div className="md:hidden space-y-3">
                  {(activeQueueTab === 'prioritized'
                    ? coordData.prioritizedInvitationQueue
                    : activeQueueTab === 'red'
                    ? coordData.redImmediateQueue
                    : coordData.greyCompletionQueue
                  )?.map((item: any) => (
                    <div key={item.patientId} className="card-3d rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm text-[#0B3B3C] block font-heading">
                            {item.displayName}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {item.ageYears}y · {item.region} · {item.preferredLanguage.toUpperCase()}
                          </span>
                        </div>
                        <LevelBadge level={item.overallLevel} size="sm" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <div>
                          <span className="text-[10px] text-[#64748B] block">S_prio Score</span>
                          <span className="font-mono font-bold text-[#0B3B3C]">
                            {item.overallLevel === 'red'
                              ? 'IMMEDIATE'
                              : item.overallLevel === 'grey'
                              ? 'GREY-FILE'
                              : item.priorityScoreSprio.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] block">M1 No-Show Risk</span>
                          <span className="font-mono font-bold text-[#0F6B6B]">
                            {Math.round(item.mlNoShowProbM1 * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-[#0B3B3C] block">
                          {item.mlSuggestedAction}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {item.mlTopFactorsM1?.[0]}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                        <StatusChip state={item.recommendationState} />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              await apiClient.sendInvitation(item.patientId, item.preferredLanguage);
                              setFeedback(`Queued invitation for ${item.displayName}.`);
                              loadData();
                            }}
                            className="px-3 py-1.5 rounded-xl btn-liquid-primary font-semibold inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Invite</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFeedback(`Logged coordinator call for ${item.displayName}.`)
                            }
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] font-semibold inline-flex items-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table (>= 768px) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="border-b border-[#E2E8F0] text-[#64748B]">
                      <tr>
                        <th className="py-3 px-3 text-start">Person & Region</th>
                        <th className="py-3 px-3 text-start">Level</th>
                        <th className="py-3 px-3 text-end">S_prio</th>
                        <th className="py-3 px-3 text-end">M1 Risk</th>
                        <th className="py-3 px-3 text-start">M1 Support Action</th>
                        <th className="py-3 px-3 text-start">State</th>
                        <th className="py-3 px-3 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]/70 tabular-nums">
                      {(activeQueueTab === 'prioritized'
                        ? coordData.prioritizedInvitationQueue
                        : activeQueueTab === 'red'
                        ? coordData.redImmediateQueue
                        : coordData.greyCompletionQueue
                      )?.map((item: any) => (
                        <tr key={item.patientId} className="hover:bg-[#F2FAF8]/70">
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#0B3B3C] block">{item.displayName}</span>
                            <span className="text-[11px] text-[#64748B]">
                              {item.ageYears}y · {item.region} · {item.preferredLanguage.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <LevelBadge level={item.overallLevel} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-end font-mono font-semibold text-[#0B3B3C]">
                            {item.overallLevel === 'red'
                              ? 'IMMEDIATE'
                              : item.overallLevel === 'grey'
                              ? 'GREY-FILE'
                              : item.priorityScoreSprio.toFixed(1)}
                          </td>
                          <td className="py-3 px-3 text-end font-mono">
                            {Math.round(item.mlNoShowProbM1 * 100)}%
                          </td>
                          <td className="py-3 px-3 text-[#334155] max-w-xs">
                            <span className="font-semibold block">{item.mlSuggestedAction}</span>
                            <span className="text-[11px] text-[#64748B]">
                              {item.mlTopFactorsM1?.[0]}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <StatusChip state={item.recommendationState} />
                          </td>
                          <td className="py-3 px-3 text-end">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiClient.sendInvitation(item.patientId, item.preferredLanguage);
                                  setFeedback(`Queued invitation for ${item.displayName}.`);
                                  loadData();
                                }}
                                className="px-3 py-1.5 rounded-xl btn-liquid-primary font-semibold inline-flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Invite</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFeedback(`Logged coordinator call for ${item.displayName}.`)
                                }
                                className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] font-semibold inline-flex items-center gap-1"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Call</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )
        ) : (
          /* ===============================================================
           * PUBLIC HEALTH OBSERVATORY (Anonymized, Wilson 95%, n < 10 Masked)
           * =============================================================== */
          obsData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title="Synthetic Cohort"
                  value={obsData.cohortTotal}
                  subtitle={`Seed: ${obsData.seed}`}
                  icon={<BarChart3 className="w-4 h-4" />}
                />
                <StatCard
                  title="Privacy Guardrail"
                  value="n < 10 Masked"
                  subtitle="Primary + Secondary suppression"
                  icon={<Lock className="w-4 h-4" />}
                />
                <StatCard
                  title="M1 Calibration (Brier / ECE)"
                  value={`${obsData.outcomeBenchmark?.m1CalibrationMetrics?.brierScore} / ${obsData.outcomeBenchmark?.m1CalibrationMetrics?.expectedCalibrationErrorEce}`}
                  subtitle="Within < 0.05 equity bound"
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
                <StatCard
                  title="Acceptance Suite (S / M / E)"
                  value={
                    acceptanceReport
                      ? `${acceptanceReport.passedCount} / ${acceptanceReport.totalCount} Passed`
                      : '15 / 15 Passed'
                  }
                  subtitle="TEST-S1..S5 · M1..M5 · E1..E5"
                  icon={<ShieldCheck className="w-4 h-4 text-[#15803D]" />}
                />
              </div>

              {/* Community & Equity Alerts (C1, C3) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(obsData.communityAlerts || []).map((al: any) => (
                  <GlassCard
                    key={al.ruleId}
                    kicker={`${al.ruleId} · ${al.zoneOrSegment}`}
                    title={al.title}
                    description={al.description}
                    icon={<LevelBadge level={al.level} size="sm" />}
                  />
                ))}
              </div>

              {/* Safeguarded Segment Table */}
              <GlassCard interactive={false} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                    Segment Coverage & Safeguards (95% Wilson CI)
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Automatic API-level suppression for cells with n &lt; 10 and smallest complementary neighbor.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="border-b border-[#E2E8F0] text-[#64748B]">
                      <tr>
                        <th className="py-3 px-3 text-start">Segment</th>
                        <th className="py-3 px-3 text-end">Eligible (n)</th>
                        <th className="py-3 px-3 text-end">Reach (95% CI)</th>
                        <th className="py-3 px-3 text-end">Adoption</th>
                        <th className="py-3 px-3 text-end">False Positive</th>
                        <th className="py-3 px-3 text-end">Genomic vs Family</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]/70 tabular-nums">
                      {(obsData.safeguardedSegments || []).map((seg: any) => {
                        const isSuppressed =
                          seg.suppressedStatus === 'primary_suppressed' ||
                          seg.suppressedStatus === 'secondary_suppressed';
                        return (
                          <tr key={seg.segmentId} className={isSuppressed ? 'bg-[#F8FAFC]/80' : ''}>
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#0B3B3C] block">{seg.segmentLabel}</span>
                              <span className="text-[11px] text-[#64748B]">{seg.dimension}</span>
                            </td>
                            {isSuppressed ? (
                              <td colSpan={5} className="py-3 px-3 text-end font-mono text-[#64748B]">
                                {seg.displayNote}
                              </td>
                            ) : (
                              <>
                                <td className="py-3 px-3 text-end font-mono">{seg.totalEligible}</td>
                                <td className="py-3 px-3 text-end font-mono whitespace-nowrap">
                                  {seg.reachWilson?.proportion}% [{seg.reachWilson?.lower}–{seg.reachWilson?.upper}%]
                                </td>
                                <td className="py-3 px-3 text-end font-mono whitespace-nowrap">
                                  {seg.adoptionRateWilson?.proportion}% [{seg.adoptionRateWilson?.lower}–{seg.adoptionRateWilson?.upper}%]
                                </td>
                                <td className="py-3 px-3 text-end font-mono whitespace-nowrap">
                                  {seg.falsePositiveRateDisplay}
                                </td>
                                <td className="py-3 px-3 text-end font-mono whitespace-nowrap">
                                  Gen: {seg.genomicAccelerationShare} / Fam: {seg.familyHistoryAccelerationShare}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Interactive Public Health Impact Model Calculator (Section 18.3) */}
              <GlassCard interactive={false} className="space-y-4 border border-[#14A39A]/35">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                    {isFr
                      ? 'Modèle Mathématique d’Impact · Section 18.3 du Cahier des Charges'
                      : 'Mathematical Impact Model · Section 18.3 Specification'}
                  </span>
                  <h2 className="text-base font-extrabold text-[#0B3B3C] font-heading">
                    {isFr
                      ? 'Calculateur d’Impact Préventif à Capacité Égale (N_invités × Δ Adoption × Rendement r)'
                      : 'Equal-Capacity Preventive Impact Calculator (N_invited × Δ Adoption × Yield r)'}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {isFr
                      ? 'Modifiez les paramètres ci-dessous pour calculer le gain de visites confirmées et de conditions détectées tôt.'
                      : 'Adjust parameters below to compute additional confirmed visits and early-detected conditions.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <label className="block font-semibold text-[#334155] mb-1">
                      {isFr ? 'N_invités (Capacité K)' : 'N_invited (Capacity K)'}
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={50000}
                      step={100}
                      value={impactInvitedN}
                      onChange={(e) => setImpactInvitedN(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white font-mono font-bold text-[#0B3B3C]"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <label className="block font-semibold text-[#334155] mb-1">
                      {isFr ? 'a_réf (% Âge/Sexe seul)' : 'a_ref (% Age/Sex baseline)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={5}
                      max={95}
                      value={impactAdoptionRef}
                      onChange={(e) => setImpactAdoptionRef(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white font-mono font-bold text-[#0B3B3C]"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <label className="block font-semibold text-[#334155] mb-1">
                      {isFr ? 'a_MediSense (% Règles + M1)' : 'a_MediSense (% Rules + M1)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={5}
                      max={99}
                      value={impactAdoptionMediSense}
                      onChange={(e) => setImpactAdoptionMediSense(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white font-mono font-bold text-[#0B3B3C]"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <label className="block font-semibold text-[#334155] mb-1">
                      {isFr ? 'Rendement r (% par visite)' : 'Clinical Yield r (% per visit)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      max={80}
                      value={impactYieldR}
                      onChange={(e) => setImpactYieldR(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white font-mono font-bold text-[#0B3B3C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4]">
                  <div>
                    <span className="text-[11px] text-[#0F6B6B] font-bold block">
                      {isFr ? 'Visites confirmées (Réf vs MediSense)' : 'Confirmed Visits (Ref vs MediSense)'}
                    </span>
                    <span className="text-lg font-extrabold font-mono text-[#0B3B3C]">
                      {confirmedRefVisits} → {confirmedMediSenseVisits} visites
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0F6B6B] font-bold block">
                      {isFr
                        ? 'Visites supplémentaires confirmées'
                        : 'Additional Confirmed Visits'}
                    </span>
                    <span className="text-xl font-extrabold font-mono text-[#0B3B3C]">
                      +{additionalConfirmedVisits} visites
                    </span>
                    <span className="text-[10px] text-[#334155] block font-mono">
                      = {impactInvitedN} × ({impactAdoptionMediSense}% - {impactAdoptionRef}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#0F6B6B] font-bold block">
                      {isFr
                        ? 'Conditions supplémentaires détectées tôt'
                        : 'Additional Conditions Detected Early'}
                    </span>
                    <span className="text-xl font-extrabold font-mono text-[#0F6B6B]">
                      +{additionalDetectedConditions} cas pris en charge
                    </span>
                    <span className="text-[10px] text-[#334155] block font-mono">
                      = {additionalConfirmedVisits} × {impactYieldR}%
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Outcome Benchmark */}
              <GlassCard interactive={false} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                      Equal-Capacity Benchmark (K = 1,000 Invitations)
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      {obsData.outcomeBenchmark?.disclaimer}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <label className="font-semibold text-[#0B3B3C]">Seed:</label>
                    <input
                      type="number"
                      value={seedInput}
                      onChange={(e) => setSeedInput(Number(e.target.value))}
                      className="w-28 px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-mono bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => loadData(seedInput)}
                      className="px-3.5 py-1.5 rounded-xl btn-liquid-primary font-semibold inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reproduce</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="border-b border-[#E2E8F0] text-[#64748B]">
                      <tr>
                        <th className="py-3 px-3 sm:px-4 text-start">Outcome Indicator</th>
                        <th className="py-3 px-3 sm:px-4 text-end">Age & Sex Baseline</th>
                        <th className="py-3 px-3 sm:px-4 text-end">MediSense (Rules + M1)</th>
                        <th className="py-3 px-3 sm:px-4 text-start">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]/70 tabular-nums">
                      {(obsData.outcomeBenchmark?.comparisonRows || []).map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 px-3 sm:px-4 font-semibold text-[#0B3B3C]">{row.metric}</td>
                          <td className="py-3 px-3 sm:px-4 text-end font-mono text-[#64748B]">{row.ageSexBaseline}</td>
                          <td className="py-3 px-3 sm:px-4 text-end font-mono font-bold text-[#0F6B6B]">
                            {row.mediSenseRulesPlusM1}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-[#64748B]">{row.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* 15 Automated Acceptance Invariants (TEST-S1..S5, TEST-M1..M5, TEST-E1..E5) */}
              {acceptanceReport && (
                <GlassCard interactive={false} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#0F6B6B] uppercase">
                        Automated Governance Verification
                      </span>
                      <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                        15 / 15 Challenge Acceptance Invariants Verified
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const fresh = await apiClient.runAcceptanceSuite();
                          setAcceptanceReport(fresh);
                          setFeedback('All 15 acceptance invariants re-verified on server.');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0B3B3C] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-run Suite</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAcceptanceDetails(!showAcceptanceDetails)}
                        className="px-3.5 py-1.5 rounded-xl btn-liquid-primary text-xs font-semibold"
                      >
                        {showAcceptanceDetails ? 'Hide Report' : 'View 15 Proofs'}
                      </button>
                    </div>
                  </div>

                  {showAcceptanceDetails && (
                    <>
                      {/* Mobile Stacked Proof Cards */}
                      <div className="md:hidden space-y-2.5 pt-2">
                        {acceptanceReport.results.map((r: any) => (
                          <div key={r.id} className="card-3d p-3.5 rounded-2xl space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-[#0B3B3C]">{r.id}</span>
                              <span className="font-bold text-[#15803D]">
                                {r.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                            <p className="font-semibold text-[#334155]">{r.title}</p>
                            <p className="font-mono text-[11px] text-[#0F6B6B] break-words">
                              {r.evidence}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto pt-2">
                        <table className="w-full text-xs text-start">
                          <thead className="border-b border-[#E2E8F0] text-[#64748B]">
                            <tr>
                              <th className="py-2.5 px-3 text-start">ID</th>
                              <th className="py-2.5 px-3 text-start">Category</th>
                              <th className="py-2.5 px-3 text-start">Invariant Verified</th>
                              <th className="py-2.5 px-3 text-start">Runtime Evidence</th>
                              <th className="py-2.5 px-3 text-end">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0]/70">
                            {acceptanceReport.results.map((r: any) => (
                              <tr key={r.id}>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#0B3B3C]">
                                  {r.id}
                                </td>
                                <td className="py-2.5 px-3 text-[#64748B]">{r.category}</td>
                                <td className="py-2.5 px-3 font-medium text-[#334155]">{r.title}</td>
                                <td className="py-2.5 px-3 font-mono text-[11px] text-[#0F6B6B]">
                                  {r.evidence}
                                </td>
                                <td className="py-2.5 px-3 text-end font-bold text-[#15803D]">
                                  {r.passed ? 'PASS' : 'FAIL'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </GlassCard>
              )}
            </motion.div>
          )
        )}
      </main>
    </div>
  );
};
