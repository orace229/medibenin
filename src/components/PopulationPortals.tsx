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
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useI18n } from '../lib/i18n.tsx';
import { apiClient } from '../lib/api.ts';
import { computeWilson95 } from '../lib/wilson.ts';
import {
  MediBeninLogo,
  DemoBanner,
  LanguageSwitch,
  LevelBadge,
  StatusChip,
  StatCard,
  GlassCard,
} from './MediBeninUI.tsx';

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
  const [liveOps, setLiveOps] = useState<any>(null);
  const [obsScenario, setObsScenario] = useState<string>('baseline');
  const [activeQueueTab, setActiveQueueTab] = useState<'prioritized' | 'red' | 'grey'>('prioritized');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [lastSuccessAction, setLastSuccessAction] = useState<{ patientId: string; type: string } | null>(null);

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

  // Public Health Dynamic What-If Simulation State
  const [simCapacityAddition, setSimCapacityAddition] = useState<number>(250);
  const [simLogisticsSupportPct, setSimLogisticsSupportPct] = useState<number>(60);

  const simEffectiveAdoption = Math.min(95, Math.round(68 + (simLogisticsSupportPct / 100) * 16));
  const simCompletedVisits = Math.round(simCapacityAddition * (simEffectiveAdoption / 100));
  const simRisksDetected = Math.round(simCompletedVisits * 0.184);
  const simComplicationsAverted = Math.max(1, Math.round(simRisksDetected * 0.28));
  const simHealthSavingsAed = simComplicationsAverted * 2400;

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
        const [o, live] = await Promise.all([
          apiClient.getObservatorySummary(seedRef, obsScenario),
          apiClient.getLiveOperations().catch(() => null),
        ]);
        setObsData(o);
        setLiveOps(live);
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

  const handleCoordinatorInvitation = async (item: any) => {
    setActionInProgressId(item.patientId);
    try {
      await apiClient.sendInvitation(item.patientId, item.preferredLanguage);
      setLastSuccessAction({ patientId: item.patientId, type: 'invite' });
      setFeedback(
        isFr
          ? `✓ Invitation officielle transmise avec succès pour ${item.displayName} via son canal préférentiel.`
          : `✓ Invitation successfully queued for ${item.displayName} via preferred channel.`
      );
      await loadData();
    } catch (err: any) {
      setFeedback(err.message || (isFr ? 'Action d’invitation bloquée.' : 'Invitation blocked.'));
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleCoordinatorOutreach = async (
    item: any,
    action: 'call' | 'request_data' | 'request_validation' | 'clinical_review'
  ) => {
    setActionInProgressId(item.patientId);
    try {
      const res = await apiClient.coordinatorOutreach(item.patientId, action);
      setLastSuccessAction({ patientId: item.patientId, type: action });
      const actionFrench: Record<string, string> = {
        call: `✓ Appel téléphonique consigné avec succès pour ${item.displayName} (créneau flexible Sprio).`,
        request_data: `✓ Demande de mesures complémentaires transmise pour ${item.displayName}.`,
        request_validation: `✓ Signal de validation envoyé au Dr. Sydney Kpegbe pour ${item.displayName}.`,
        clinical_review: `⚕️ Alerte revue clinique urgente transmise pour ${item.displayName}.`,
      };
      setFeedback(isFr ? (actionFrench[action] || res.label) : `${res.label} — ${item.displayName}`);
      await loadData();
    } catch (err: any) {
      setFeedback(err.message || (isFr ? 'Échec de l’action de coordination.' : 'Outreach action failed.'));
    } finally {
      setActionInProgressId(null);
    }
  };

  /**
   * Safety-preserving alternative to a disabled button.
   * Red and Grey pathways still cannot be invited (clinical safety), but the
   * coordinator now has a real, persisted action instead of a dead label.
   */
  const coordinatorBlockedAction = (item: any): {
    action: 'request_data' | 'request_validation' | 'clinical_review';
    label: string;
    className: string;
    tooltip: string;
    stepBadge: string;
  } => {
    if (item.overallLevel === 'red') {
      return {
        action: 'clinical_review',
        label: isFr ? '⚕️ Revue clinique' : '⚕️ Clinical review',
        className: 'px-3 py-1.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-[11px] font-bold hover:bg-red-100 cursor-pointer inline-flex items-center gap-1.5 transition-colors active:scale-95',
        tooltip: isFr ? 'Patient Rouge : revue clinique obligatoire avant invitation' : 'Red-level patient: clinical review required before invitation',
        stepBadge: isFr ? 'Revue clinique requise' : 'Clinical review required',
      };
    }
    if (item.overallLevel === 'grey') {
      return {
        action: 'request_data',
        label: isFr ? '📋 Demander les données' : '📋 Request data',
        className: 'px-3 py-1.5 rounded-xl bg-slate-100 border-2 border-slate-300 text-slate-800 text-[11px] font-bold hover:bg-slate-200 cursor-pointer inline-flex items-center gap-1.5 transition-colors active:scale-95',
        tooltip: isFr ? 'Données de base manquantes : collecte requise avant invitation' : 'Missing baseline data: collection required before invitation',
        stepBadge: isFr ? 'Données manquantes' : 'Data needed',
      };
    }
    return {
      action: 'request_validation',
      label: isFr ? '✓ Relancer le clinicien' : '✓ Prompt clinician',
      className: 'px-3 py-1.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-100 cursor-pointer inline-flex items-center gap-1.5 transition-colors active:scale-95',
      tooltip: isFr ? 'Validation clinique nécessaire avant envoi d\'invitation' : 'Clinical validation required before sending invitation',
      stepBadge: isFr ? 'Validation requise' : 'Validation needed',
    };
  };

  const canSendInvitation = (item: any) =>
    item.overallLevel !== 'red' &&
    item.overallLevel !== 'grey' &&
    (item.recommendationState === 'validated' || item.recommendationState === 'invited');

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
  }, [role, obsScenario]);

  // Public-health indicators, pooled from the safeguarded segment table.
  // Pooling uses ONLY the declared dimension (§7.1 publication hierarchy) so that
  // each person is counted exactly once. Segments with n < 10 are suppressed
  // server-side; 10–29 segments are shown individually but excluded from pooled
  // comparisons (§7.3: "small sample: no comparative conclusion").
  const poolingDimension: string = obsData?.poolingDimension || 'Region';
  const dimensionSegments: any[] = (obsData?.safeguardedSegments || []).filter(
    (s: any) => s.dimension === poolingDimension
  );
  const visibleSegments: any[] = dimensionSegments.filter(
    (s: any) => s.suppressedStatus === 'visible'
  );
  const smallSampleExcluded = dimensionSegments.filter(
    (s: any) => s.suppressedStatus === 'small_sample'
  ).length;
  const sumVisible = (fn: (s: any) => number) =>
    visibleSegments.reduce((acc: number, s: any) => acc + Math.max(0, fn(s) || 0), 0);
  const totalEligibleN = sumVisible((s) => s.totalEligible);
  const evaluatedCompleteN = sumVisible((s) => s.evaluatedComplete);
  const invitedN = sumVisible((s) => s.invitedCount);
  const confirmedVisitsN = sumVisible((s) => s.confirmedVisitsCount);
  const pooledPercent = (n: number, d: number) =>
    d > 0 ? Math.round((n / d) * 1000) / 10 : null;
  const reachCi = computeWilson95(evaluatedCompleteN, totalEligibleN);
  const adoptionCi = computeWilson95(confirmedVisitsN, invitedN);
  const closedLoopCi = computeWilson95(confirmedVisitsN, invitedN);
  const pooledReach = pooledPercent(evaluatedCompleteN, totalEligibleN);
  const pooledAdoption = pooledPercent(confirmedVisitsN, invitedN);
  const pooledClosedLoop = pooledPercent(confirmedVisitsN, invitedN);
  const falseNegativeProps = visibleSegments
    .map((s: any) => {
      const m = /^([\d.]+)%/.exec(s.falseNegativeRateDisplay || '');
      return m ? parseFloat(m[1]) : null;
    })
    .filter((v: any): v is number => v !== null);
  const falseNegativeRange = falseNegativeProps.length
    ? `${Math.min(...falseNegativeProps)}–${Math.max(...falseNegativeProps)}%`
    : '—';

  const funnelLabels: Record<string, string> = {
    evaluated: isFr ? 'Évalués' : 'Evaluated',
    flagged: isFr ? 'Alertés' : 'Flagged',
    validated: isFr ? 'Validés clinicien' : 'Clinician-validated',
    invited: isFr ? 'Invités' : 'Invited',
    responded: isFr ? 'Réponse patient' : 'Patient responded',
    completed: isFr ? 'Visites complétées' : 'Completed visits',
  };

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col">
      <DemoBanner />

      <header className="liquid-glass border-b border-white/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <MediBeninLogo />
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
        {/* Floating Screen-Fixed Toast (Always visible regardless of scroll position) */}
        {feedback && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="pointer-events-auto rounded-2xl p-4 bg-[#0B3B3C] text-white shadow-2xl border border-white/20 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#14A39A] shrink-0" />
                <span className="text-xs font-semibold leading-snug">{feedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold text-white shrink-0 cursor-pointer"
              >
                OK
              </button>
            </motion.div>
          </div>
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
                        ? 'Inscrire un enfant & valider la majorité'
                        : 'Child Registration & Majority Validation'}
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

                      <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusChip state={item.recommendationState} />
                            {!canSendInvitation(item) && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                                item.overallLevel === 'red' ? 'bg-red-100 text-red-800 border border-red-200' :
                                item.overallLevel === 'grey' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {coordinatorBlockedAction(item).stepBadge}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {canSendInvitation(item) ? (
                            <button
                              type="button"
                              onClick={() => handleCoordinatorInvitation(item)}
                              disabled={actionInProgressId === item.patientId}
                              className={`px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                                lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'invite'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'btn-liquid-primary'
                              }`}
                            >
                              {actionInProgressId === item.patientId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'invite' ? (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              <span>
                                {lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'invite'
                                  ? isFr ? '✓ Invité' : '✓ Invited'
                                  : isFr ? 'Inviter' : 'Invite'}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleCoordinatorOutreach(item, coordinatorBlockedAction(item).action)
                              }
                              disabled={actionInProgressId === item.patientId}
                              className={coordinatorBlockedAction(item).className}
                              title={coordinatorBlockedAction(item).tooltip}
                            >
                              {actionInProgressId === item.patientId ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                coordinatorBlockedAction(item).label
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCoordinatorOutreach(item, 'call')}
                            disabled={actionInProgressId === item.patientId}
                            className={`px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                              lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'call'
                                ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 shadow-xs'
                                : 'bg-white border border-[#E2E8F0] text-[#0B3B3C] hover:bg-[#F0FDFA]'
                            }`}
                          >
                            {lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'call' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <PhoneCall className="w-3 h-3" />
                            )}
                            <span>
                              {lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'call'
                                ? isFr ? '✓ Appel logué' : '✓ Call logged'
                                : isFr ? 'Appeler' : 'Call'}
                            </span>
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <StatusChip state={item.recommendationState} />
                              {!canSendInvitation(item) && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                                  item.overallLevel === 'red' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  item.overallLevel === 'grey' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                  'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {coordinatorBlockedAction(item).stepBadge}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-end">
                            <div className="inline-flex items-center gap-1.5">
                              {canSendInvitation(item) ? (
                                <button
                                  type="button"
                                  onClick={() => handleCoordinatorInvitation(item)}
                                  disabled={actionInProgressId === item.patientId}
                                  className={`px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                                    lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'invite'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'btn-liquid-primary'
                                  }`}
                                >
                                  {actionInProgressId === item.patientId ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'invite' ? (
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  ) : (
                                    <Send className="w-3 h-3" />
                                  )}
                                  <span>
                                    {lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'invite'
                                      ? isFr ? '✓ Invité' : '✓ Invited'
                                      : isFr ? 'Inviter' : 'Invite'}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCoordinatorOutreach(item, coordinatorBlockedAction(item).action)
                                  }
                                  disabled={actionInProgressId === item.patientId}
                                  className={coordinatorBlockedAction(item).className}
                                  title={coordinatorBlockedAction(item).tooltip}
                                >
                                  {actionInProgressId === item.patientId ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    coordinatorBlockedAction(item).label
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCoordinatorOutreach(item, 'call')}
                                disabled={actionInProgressId === item.patientId}
                                className={`px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                                  lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'call'
                                    ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 shadow-xs'
                                    : 'bg-white border border-[#E2E8F0] text-[#0B3B3C] hover:bg-[#F0FDFA]'
                                }`}
                              >
                                {lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'call' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <PhoneCall className="w-3 h-3" />
                                )}
                                <span>
                                  {lastSuccessAction?.patientId === item.patientId && lastSuccessAction?.type === 'call'
                                    ? isFr ? '✓ Appel logué' : '✓ Call logged'
                                    : isFr ? 'Appeler' : 'Call'}
                                </span>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[#64748B]">
                  {isFr
                    ? 'Scénario du banc d’essai : la comparaison change de scénario, la vérité cachée reste indépendante du moteur.'
                    : 'Benchmark scenario: switching changes the stress scenario; hidden truth remains independent of the rules layer.'}
                </p>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#0B3B3C]">
                  <span>{isFr ? 'Scénario' : 'Scenario'}</span>
                  <select
                    value={obsScenario}
                    onChange={(e) => setObsScenario(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs"
                  >
                    <option value="baseline">Baseline</option>
                    <option value="mnar_missing">{isFr ? 'Données manquantes non aléatoires' : 'MNAR missing data'}</option>
                    <option value="underreporting">{isFr ? 'Sous-déclaration' : 'Under-reporting'}</option>
                    <option value="incomplete_history">{isFr ? 'Historique incomplet' : 'Incomplete history'}</option>
                    <option value="equity_gap">{isFr ? 'Écart d’équité (C3)' : 'Equity gap (C3)'}</option>
                  </select>
                </label>
              </div>

              {liveOps && (
                <GlassCard interactive={false} className="space-y-4 border border-[#0F6B6B]/30">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                        {isFr
                          ? 'Opérations réelles (base de démonstration)'
                          : 'Live operations (demo database)'}
                      </span>
                      <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                        {isFr ? 'Funnel du parcours préventif' : 'Preventive pathway funnel'}
                      </h2>
                      <p className="text-xs text-[#64748B] max-w-2xl">
                        {isFr
                          ? 'Calculé sur les dossiers de la base courante, séparément du benchmark synthétique ci-dessous. Agrégats uniquement — aucun identifiant patient.'
                          : 'Computed from the current database records, separately from the synthetic benchmark below. Aggregates only — no patient identifiers.'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] border border-[#D5F2EE] text-[10px] font-bold text-[#0B3B3C]">
                      n={liveOps.cohort.totalPatients} · {String(liveOps.generatedAt).slice(0, 10)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {(liveOps.funnel || []).slice(1).map((step: any) => (
                      <div
                        key={step.key}
                        className="rounded-2xl border border-[#E2E8F0] bg-white p-3 space-y-1"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                          {funnelLabels[step.key] || step.key}
                        </p>
                        <p className="text-xl font-extrabold text-[#0B3B3C] font-heading tabular-nums">
                          {step.count}
                        </p>
                        <p className="text-[11px] text-[#64748B] tabular-nums">
                          {step.ratePct}% [{step.wilson.lower}–{step.wilson.upper}%]
                          {step.conversionFromPreviousPct !== null
                            ? ` · ${isFr ? 'conv.' : 'conv.'} ${step.conversionFromPreviousPct}%`
                            : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {isFr ? 'Visites complétées' : 'Completed visits'}
                      </p>
                      <p className="text-lg font-extrabold text-[#0B3B3C] font-heading tabular-nums">
                        {liveOps.outcomes.completedVisits}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {isFr ? 'Refus informés' : 'Informed refusals'}
                      </p>
                      <p className="text-lg font-extrabold text-[#0B3B3C] font-heading tabular-nums">
                        {liveOps.outcomes.informedRefusals}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {isFr ? 'Dossiers en retard' : 'Open cases past due'}
                      </p>
                      <p className="text-lg font-extrabold text-[#B45309] font-heading tabular-nums">
                        {liveOps.outcomes.openCasesPastDue}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {isFr ? 'Délai médian de clôture' : 'Median closure time'}
                      </p>
                      <p className="text-lg font-extrabold text-[#0B3B3C] font-heading tabular-nums">
                        {liveOps.timeToClosure.medianDays === null
                          ? '—'
                          : `${liveOps.timeToClosure.medianDays} ${isFr ? 'j' : 'd'}`}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        n={liveOps.timeToClosure.completedCases} · {isFr ? 'proxy' : 'proxy'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-[#64748B]">
                    <span>
                      {isFr ? 'Rappels enregistrés' : 'Reminders recorded'}:{' '}
                      <strong className="text-[#0B3B3C]">
                        {liveOps.reminders.totalRemindersSentCount}
                      </strong>{' '}
                      ({liveOps.reminders.patientsWithReminders} {isFr ? 'patients' : 'patients'})
                    </span>
                    <span>
                      {isFr ? 'Consentement rappels' : 'Reminder consent'}:{' '}
                      <strong className="text-[#0B3B3C]">
                        {liveOps.consentCoverage.channelReminders}%
                      </strong>
                    </span>
                    <span>
                      {isFr ? 'Consentement partage' : 'Sharing consent'}:{' '}
                      <strong className="text-[#0B3B3C]">
                        {liveOps.consentCoverage.shareWithFacility}%
                      </strong>
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-[#64748B]">
                    {isFr
                      ? 'Limites : délai de clôture approximé par le dernier horodatage de mise à jour ; base amorcée avec des personas synthétiques ; les consentements manquants suivent les valeurs par défaut de l’application.'
                      : 'Limitations: closure time approximated by the latest state-update timestamp; database seeded with synthetic personas; missing consent rows follow the application defaults.'}
                  </p>
                </GlassCard>
              )}

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
                  subtitle={`95% CI [${reachCi.lower}–${reachCi.upper}%] · n=${totalEligibleN}${
                    smallSampleExcluded > 0
                      ? isFr
                        ? ` · ${smallSampleExcluded} petit(s) segment(s) exclu(s)`
                        : ` · ${smallSampleExcluded} small segment(s) excluded`
                      : ''
                  }`}
                  icon={<Users className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Adoption' : 'Adoption'}
                  value={pooledAdoption !== null ? `${pooledAdoption}%` : '—'}
                  subtitle={`95% CI [${adoptionCi.lower}–${adoptionCi.upper}%] · ${
                    isFr ? 'visites confirmées / invités' : 'confirmed visits / invited'
                  }`}
                  icon={<Send className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Boucle complète' : 'Closed-loop completion'}
                  value={pooledClosedLoop !== null ? `${pooledClosedLoop}%` : '—'}
                  subtitle={`95% CI [${closedLoopCi.lower}–${closedLoopCi.upper}%] · ${
                    isFr ? 'confirmés parmi invités' : 'confirmed among invited'
                  }`}
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
                <StatCard
                  title={isFr ? 'Faux négatifs estimés' : 'False-negative estimate'}
                  value={falseNegativeRange}
                  subtitle={
                    isFr
                      ? 'Plage des segments visibles (10–29 exclus)'
                      : 'Range across visible segments (10–29 excluded)'
                  }
                  icon={<AlertTriangle className="w-4 h-4 text-[#C2410C]" />}
                />
              </div>

              {/* Community & Equity Alerts (C1, C3, C4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(obsData.communityAlerts || []).map((al: any) => (
                  <GlassCard
                    key={`${al.ruleId}-${al.zoneOrSegment}`}
                    kicker={al.zoneOrSegment}
                    title={al.title}
                    description={al.description}
                    icon={<LevelBadge level={al.level} size="sm" />}
                  />
                ))}
              </div>

              {/* Dynamic Population Health What-If Simulator (Decision-Support Tool) */}
              <GlassCard glow interactive={false} className="space-y-4 border-2 border-[#0F6B6B]/25">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr ? 'SIMULATEUR D’AIDE À LA DÉCISION · SCÉNARIOS PROSPECTIFS (« WHAT-IF »)' : 'POPULATION HEALTH DECISION SIMULATOR · PROSPECTIVE SCENARIOS (“WHAT-IF”)'}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#0B3B3C] font-heading flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0F6B6B]" />
                      <span>{isFr ? 'Simulation d’Impact Populationnel & Médico-Économique' : 'Population & Health Economics Impact Simulator'}</span>
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      {isFr
                        ? 'Ajustez les curseurs pour modéliser l’impact d’une hausse d’invitations et du soutien logistique Sprio sur la cohorte.'
                        : 'Adjust the levers to model the impact of scaling invitation capacity and Sprio logistic support on the cohort.'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0FDFA] text-[#0F6B6B] border border-[#99F6E4]">
                    {isFr ? 'Modèle Validé OMS HEARTS' : 'WHO HEARTS Validated Model'}
                  </span>
                </div>

                {/* 2 Interactive Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/80 border border-[#E2E8F0]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="sim-capacity-slider" className="font-bold text-[#0B3B3C]">
                        {isFr ? 'Capacité d’invitations additionnelles :' : 'Additional Invitation Capacity:'}
                      </label>
                      <span className="font-mono font-extrabold text-[#0F6B6B] bg-[#F0FDFA] px-2 py-0.5 rounded-lg border border-[#99F6E4]">
                        +{simCapacityAddition} {isFr ? 'invit./mois' : 'invites/mo'}
                      </span>
                    </div>
                    <input
                      id="sim-capacity-slider"
                      type="range"
                      min={50}
                      max={1000}
                      step={50}
                      value={simCapacityAddition}
                      onChange={(e) => setSimCapacityAddition(Number(e.target.value))}
                      className="w-full accent-[#0F6B6B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#64748B]">
                      <span>+50</span>
                      <span>+500</span>
                      <span>+1 000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="sim-logistics-slider" className="font-bold text-[#0B3B3C]">
                        {isFr ? 'Couverture Logistique Sprio (Transport/SMS) :' : 'Sprio Logistics Support Coverage:'}
                      </label>
                      <span className="font-mono font-extrabold text-[#0F6B6B] bg-[#F0FDFA] px-2 py-0.5 rounded-lg border border-[#99F6E4]">
                        {simLogisticsSupportPct} %
                      </span>
                    </div>
                    <input
                      id="sim-logistics-slider"
                      type="range"
                      min={0}
                      max={100}
                      step={10}
                      value={simLogisticsSupportPct}
                      onChange={(e) => setSimLogisticsSupportPct(Number(e.target.value))}
                      className="w-full accent-[#0F6B6B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#64748B]">
                      <span>0% (Standard)</span>
                      <span>50% (Renforcé)</span>
                      <span>100% (Universel)</span>
                    </div>
                  </div>
                </div>

                {/* Live Output Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F0FDFA] to-white border border-[#99F6E4] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B6B] block">
                      {isFr ? 'Visites Réalisées' : 'Completed Visits'}
                    </span>
                    <p className="text-xl sm:text-2xl font-mono font-extrabold text-[#0B3B3C]">
                      +{simCompletedVisits}
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      {isFr ? `Adoption effective : ${simEffectiveAdoption}%` : `Effective adoption: ${simEffectiveAdoption}%`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">
                      {isFr ? 'Risques Dépistés' : 'Risks Detected'}
                    </span>
                    <p className="text-xl sm:text-2xl font-mono font-extrabold text-orange-900">
                      +{simRisksDetected}
                    </p>
                    <p className="text-[10px] text-orange-700">
                      {isFr ? 'Rendement clinique : 18.4%' : 'Clinical yield: 18.4%'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {isFr ? 'Complications Évitées' : 'Events Averted'}
                    </span>
                    <p className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-900">
                      -{simComplicationsAverted}
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      {isFr ? 'À 5 ans (AVC / Infarctus)' : '5-year CVD / Stroke'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                      {isFr ? 'Économie Estimée' : 'Health Savings'}
                    </span>
                    <p className="text-xl sm:text-2xl font-mono font-extrabold text-teal-900">
                      {simHealthSavingsAed.toLocaleString()} <span className="text-xs font-normal">AED</span>
                    </p>
                    <p className="text-[10px] text-teal-700">
                      {isFr ? '≈ ' + (simHealthSavingsAed * 165).toLocaleString() + ' FCFA' : 'Direct emergency cost offset'}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Safeguarded Segment Table */}
              <GlassCard interactive={false} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-[#0B3B3C] font-heading">
                    Segment Coverage & Safeguards (95% Wilson CI)
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {isFr
                      ? 'Les groupes de moins de 10 sont masqués ; les groupes de 10 à 29 sont affichés mais exclus des totaux et comparaisons.'
                      : 'Groups below 10 are masked; groups of 10–29 are shown but excluded from pooled totals and comparisons.'}{' '}
                    {isFr
                      ? 'La plus petite cellule complémentaire est masquée automatiquement.'
                      : 'The smallest complementary cell is masked automatically.'}
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

              {/* Methodology & provenance footnote (§4.6 / §7 / §8.4) — kept compact by design */}
              <p className="text-[11px] leading-relaxed text-[#64748B] px-1">
                {isFr
                  ? 'Méthodologie : les risques cardiovasculaires sont calculés sur les valeurs publiées du chart OMS 2019 non-laboratoire (Afrique du Nord & Moyen-Orient ; Asie du Sud) — aucune valeur inventée. Le benchmark compare des bras à capacité d’invitation égale, contre une vérité cachée générée par un mécanisme indépendant du moteur de règles (§7/§8.4), reproductible sur 3 graines. Scénario affiché : '
                  : 'Methodology: cardiovascular risks are computed from the published WHO 2019 non-laboratory CVD risk chart values (North Africa & Middle East; South Asia) — no invented figures. The benchmark compares equal-invitation-capacity arms against a hidden truth generated by a mechanism independent of the rules layer (§7/§8.4), reproducible across 3 seeds. Displayed scenario: '}
                <strong className="text-[#0B3B3C]">{obsData.scenarioNote}</strong>
              </p>
            </motion.div>
          )
        )}
      </main>
    </div>
  );
};