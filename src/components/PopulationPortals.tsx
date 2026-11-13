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
  LogOut,
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
  const [activeQueueTab, setActiveQueueTab] = useState<'prioritized' | 'red' | 'grey'>('prioritized');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Coordinator internal sub-views (hash-based, no router in this project)
  const [coordView, setCoordView] = useState<'queues' | 'family'>(() =>
    window.location.hash.includes('coordinator/family') ? 'family' : 'queues'
  );
  const seedRef = 20261120;

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

  const loadData = async () => {
    try {
      if (role === 'coordinator') {
        const [c, fam] = await Promise.all([
          apiClient.getCoordinatorQueue(),
          apiClient.getPendingMajorityDetachments().catch(() => ({
            affiliatedRecords: [],
            pendingMajorityDetachments: [],
          })),
        ]);
        setCoordData(c);
        setFamilyData(fam);
      } else {
        const o = await apiClient.getObservatorySummary(seedRef);
        setObsData(o);
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
      await apiClient.approveMajorityDetachment(childId);
      setFeedback(
        isFr
          ? `Détachement à la majorité validé pour ${childName} — compte adulte activé.`
          : `Majority detachment confirmed for ${childName} — autonomous adult account active.`
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
          ? `${res.patient.displayName} inscrit et affilié au parent ${minorForm.parentPatientId}.`
          : `${res.patient.displayName} registered and affiliated to parent ${minorForm.parentPatientId}.`
      );
      await loadData();
    } catch (err: any) {
      setFeedback(err.message);
    }
  };

  const switchCoordView = (view: 'queues' | 'family') => {
    setCoordView(view);
    window.history.replaceState(
      null,
      '',
      view === 'family' ? '#/coordinator/family' : '#/coordinator'
    );
  };

  useEffect(() => {
    loadData();
  }, [role]);

  // Public-health indicators, pooled from the safeguarded segment table
  // (segments with n < 10 are suppressed server-side and never pooled).
  const visibleSegments: any[] = (obsData?.safeguardedSegments || []).filter(
    (s: any) => s.suppressedStatus === 'visible' || s.suppressedStatus === 'small_sample'
  );
  const sumVisible = (fn: (s: any) => number) =>
    visibleSegments.reduce((acc: number, s: any) => acc + Math.max(0, fn(s) || 0), 0);
  const totalEligibleN = sumVisible((s) => s.totalEligible);
  const evaluatedCompleteN = sumVisible((s) => s.evaluatedComplete);
  const invitedN = sumVisible((s) => s.invitedCount);
  const confirmedVisitsN = sumVisible((s) => s.confirmedVisitsCount);
  const pooledPercent = (n: number, d: number) =>
    d > 0 ? Math.round((n / d) * 1000) / 10 : null;
  const pooledReach = pooledPercent(evaluatedCompleteN, totalEligibleN);
  const pooledAdoption = pooledPercent(confirmedVisitsN, invitedN);
  const pooledClosedLoop = pooledPercent(confirmedVisitsN, totalEligibleN);
  const falseNegativeProps = visibleSegments
    .map((s: any) => {
      const m = /^([\d.]+)%/.exec(s.falseNegativeRateDisplay || '');
      return m ? parseFloat(m[1]) : null;
    })
    .filter((v: any): v is number => v !== null);
  const falseNegativeRange = falseNegativeProps.length
    ? `${Math.min(...falseNegativeProps)}–${Math.max(...falseNegativeProps)}%`
    : '—';

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
                  ? 'Coordinateur · Coordination des soins'
                  : 'Care Coordinator'
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
                    ? 'Orace A. · Coordinateur'
                    : 'Orace A. · Coordinator'
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
           * COORDINATOR PORTAL: 3 Queues + Family Affiliation Sub-view
           * =============================================================== */
          coordData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title={isFr ? 'File rouge — urgences' : 'Immediate Red Queue'}
                  value={coordData.redImmediateQueue?.length || 0}
                  subtitle={isFr ? 'Hors score de priorité' : 'Bypasses priority score'}
                  icon={<AlertTriangle className="w-4 h-4 text-[#B91C1C]" />}
                />
                <StatCard
                  title={isFr ? 'File grise — données à compléter' : 'Level Grey Queue'}
                  value={coordData.greyCompletionQueue?.length || 0}
                  subtitle={isFr ? 'Mesures de base manquantes' : 'Missing baseline data'}
                  icon={<HelpCircle className="w-4 h-4 text-[#475569]" />}
                />
                <StatCard
                  title={isFr ? 'Capacité du jour' : 'Daily Capacity'}
                  value={`${coordData.prioritizedInvitationQueue?.length || 0} / ${coordData.dailyCapacityLimit}`}
                  subtitle={isFr ? `${coordData.humanContactBudgetB} relances par jour` : `${coordData.humanContactBudgetB} outreach contacts/day`}
                  icon={<Users className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Stabilité du classement' : 'Ranking stability'}
                  value={`${coordData.sensitivityAnalysis?.topKOverlapPercent}%`}
                  subtitle={coordData.sensitivityAnalysis?.status}
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
              </div>

              {coordView === 'family' ? (
                /* Family affiliation governance sub-view */
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => switchCoordView('queues')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6B6B] hover:text-[#0B3B3C] liquid-glass px-3.5 py-2 rounded-xl cursor-pointer"
                  >
                    ← {isFr ? 'Retour à la coordination' : 'Back to care coordination'}
                  </button>
                  <GlassCard interactive={false} className="space-y-4 border border-[#0F6B6B]/35">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr
                        ? 'Affiliations familiales & majorité'
                        : 'Family Affiliation & Majority Governance'}
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
                          ? 'Recherche automatique du parent dans le registre (ID ou Nom) :'
                          : 'Automatic parent lookup in the registry (by ID or name):'}
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
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchCoordView('family')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 border border-[#E2E8F0] hover:border-[#0F6B6B] text-xs font-semibold text-[#0B3B3C] cursor-pointer"
                    >
                      {isFr
                        ? 'Gouvernance des affiliations familiales'
                        : 'Family affiliation governance'}
                    </button>
                  </div>

                  <GlassCard interactive={false} className="space-y-4 sm:space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#E2E8F0] pb-4">
                      <div>
                        <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                          {isFr
                            ? 'Coordination des soins — Files de relance du jour'
                            : 'Care coordination — Daily outreach queues'}
                        </h2>
                        <p className="text-xs text-[#64748B]">
                          {isFr
                            ? 'Le risque de non-présentation renforce uniquement l’accompagnement — il ne baisse jamais la priorité.'
                            : 'M1 No-Show risk strengthens accompaniment only — never lowers priority.'}
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
                </>
              )}
            </motion.div>
          )
        ) : (
          /* ===============================================================
           * PUBLIC HEALTH OBSERVATORY (Anonymized, Wilson 95% CI)
           * =============================================================== */
          obsData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard
                  title={isFr ? 'Cohorte synthétique' : 'Synthetic Cohort'}
                  value={obsData.cohortTotal}
                  subtitle={isFr ? 'Données reproductibles' : 'Reproducible data'}
                  icon={<BarChart3 className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Portée' : 'Reach'}
                  value={pooledReach !== null ? `${pooledReach}%` : '—'}
                  subtitle={isFr ? 'Évaluations complètes (cumul)' : 'Complete evaluations (pooled)'}
                  icon={<Users className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Adoption' : 'Adoption'}
                  value={pooledAdoption !== null ? `${pooledAdoption}%` : '—'}
                  subtitle={isFr ? 'Visites confirmées (cumul)' : 'Confirmed visits (pooled)'}
                  icon={<Send className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Boucle complète' : 'Closed-loop completion'}
                  value={pooledClosedLoop !== null ? `${pooledClosedLoop}%` : '—'}
                  subtitle={isFr ? 'Confirmés parmi éligibles' : 'Confirmed among eligible'}
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Faux négatifs estimés' : 'False-negative estimate'}
                  value={falseNegativeRange}
                  subtitle={isFr ? 'Plage des segments visibles' : 'Range across visible segments'}
                  icon={<AlertTriangle className="w-4 h-4 text-[#C2410C]" />}
                />
              </div>

              {/* Community & Equity Alerts (C1, C3) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(obsData.communityAlerts || []).map((al: any) => (
                  <GlassCard
                    key={al.ruleId}
                    kicker={al.zoneOrSegment}
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
                    Small groups are always masked automatically to protect privacy, including the smallest complementary group.
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
            </motion.div>
          )
        )}
      </main>
    </div>
  );
};
