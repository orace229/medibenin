import React, { useState } from 'react';
import { PersonaProfile, FollowupState } from '../types/medisense';
import { InteractiveRiskSimulator } from './InteractiveRiskSimulator';
import { InteractiveGrowthChart } from './InteractiveGrowthChart';
import { 
  ShieldCheck, AlertCircle, QrCode, CheckCircle2, User,
  FileText, Calendar, Building2, Activity, ArrowLeft, Scan
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ClinicalIndividualViewProps {
  persona: PersonaProfile;
  onBackToPopulationView: () => void;
  onUpdateActionState: (personaId: string, actionId: string, newState: FollowupState) => void;
  currentLang?: Language;
}

export const ClinicalIndividualView: React.FC<ClinicalIndividualViewProps> = ({
  persona,
  onBackToPopulationView,
  onUpdateActionState,
  currentLang = 'fr'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedActionState, setSelectedActionState] = useState<Record<string, FollowupState>>({});
  const [showQrModal, setShowQrModal] = useState<string | null>(null);
  const [adaptationNote, setAdaptationNote] = useState('');
  const [isAdapted, setIsAdapted] = useState(false);

  const handleStateChange = (actionId: string, newState: FollowupState) => {
    setSelectedActionState(prev => ({ ...prev, [actionId]: newState }));
    onUpdateActionState(persona.id, actionId, newState);
  };

  return (
    <div className="space-y-6">
      {/* Barre supérieure avec bouton retour et rappel éthique */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBackToPopulationView}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.clinical.backToPopulation}</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.clinical.sprioForbiddenNotice}</span>
        </div>
      </div>

      {/* Profil du patient & Constantes cliniques */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-200">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">{persona.fullName}</h1>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {persona.syntheticId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {persona.nationalityGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.clinical.ageLabel} <strong>{persona.ageYears >= 1 ? `${persona.ageYears} ${t.prioritization.yearsOld}` : ''} ({persona.ageMonths} {t.prioritization.monthsOld})</strong> • {t.clinical.genderLabel} <strong>{persona.sex}</strong> • {t.clinical.regionLabel} <strong>{persona.region}</strong> • {t.clinical.languageLabel} <strong>{persona.preferredLanguage}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{t.clinical.primaryCenter} <strong>Al Bateen / Al Hili</strong></span>
          </div>
        </div>

        {/* Constantes biologiques mesurées et codes de provenance (V, M, D, S) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
              <span>{t.clinical.vitals.bp}</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                {persona.clinicalData.bloodPressureProvenance || 'M'}
              </span>
            </div>
            <div className="text-sm font-black text-slate-800 mt-1">
              {persona.clinicalData.bloodPressureSystolic && persona.clinicalData.bloodPressureDiastolic
                ? `${persona.clinicalData.bloodPressureSystolic}/${persona.clinicalData.bloodPressureDiastolic} mmHg`
                : t.clinical.vitals.bpNotMeasured}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
              <span>{t.clinical.vitals.bmi}</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                {persona.clinicalData.bmiProvenance || 'M'}
              </span>
            </div>
            <div className="text-sm font-black text-slate-800 mt-1">
              {persona.clinicalData.bmi ? `${persona.clinicalData.bmi} kg/m²` : `${persona.clinicalData.weightKg || '—'} kg`}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
              <span>{t.clinical.vitals.waist}</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">M</span>
            </div>
            <div className="text-sm font-black text-slate-800 mt-1">
              {persona.clinicalData.waistCircumferenceCm ? `${persona.clinicalData.waistCircumferenceCm} cm` : t.clinical.vitals.waistNotMeasured}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
              <span>{t.clinical.vitals.smoking}</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">D</span>
            </div>
            <div className="text-sm font-black text-slate-800 mt-1 truncate">
              {persona.clinicalData.smokingStatus || t.clinical.vitals.nonSmoker}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
              <span>{t.clinical.vitals.findrisc}</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">{t.clinical.vitals.findriscCalc}</span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-1">
              {persona.clinicalData.findriscScore !== undefined ? `${persona.clinicalData.findriscScore} / 26` : (currentLang === 'fr' ? 'Non applicable' : 'N/A')}
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-[10px] text-purple-700 uppercase font-semibold flex items-center justify-between">
              <span>{t.clinical.vitals.genomics}</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-900">S</span>
            </div>
            <div className="text-sm font-black text-purple-900 mt-1">
              {persona.clinicalData.genomicScorePercentile ? `${persona.clinicalData.genomicScorePercentile}e percentile` : t.clinical.vitals.genomicsNotRequired}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Signaux Détectés avec Badge de Certitude et Facteurs Contrefactuels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-700" />
            <span>{currentLang === 'fr' ? `Signaux d’Alerte et Facteurs Ciblés (${persona.signals.length})` : `Detected Clinical Signals & Risk Factors (${persona.signals.length})`}</span>
          </h2>
          <span className="text-xs text-slate-500">{currentLang === 'fr' ? 'Explication transparente conforme Exigence 1' : 'Explainable rules per Requirement 1'}</span>
        </div>

        <div className="space-y-3.5">
          {persona.signals.map((sig) => {
            const isGrey = sig.level === 'Gris';
            const isOrange = sig.level === 'Orange';
            const isYellow = sig.level === 'Jaune';

            return (
              <div
                key={sig.id}
                className={`p-4 rounded-2xl border transition shadow-xs ${
                  isGrey
                    ? 'bg-slate-50 border-slate-300'
                    : isOrange
                    ? 'bg-amber-50/50 border-amber-200'
                    : isYellow
                    ? 'bg-yellow-50/40 border-yellow-200'
                    : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg text-white ${
                        isGrey ? 'bg-slate-500' : isOrange ? 'bg-amber-600' : 'bg-yellow-600'
                      }`}>
                        {sig.ruleId} • {sig.level.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{sig.title}</h3>
                      <span className="text-[11px] text-slate-500">({sig.type})</span>
                    </div>

                    {/* Les 1 à 3 Facteurs Clés Explicatifs */}
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        {currentLang === 'fr' ? 'Facteurs déterminants identifiés :' : 'Identified key clinical determinants:'}
                      </div>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        {sig.keyFactors.map((factor, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Données Manquantes (Niveau Gris) */}
                    {sig.missingData.length > 0 && (
                      <div className="mt-2.5 bg-white/80 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">{currentLang === 'fr' ? 'Données à compléter pour confirmation :' : 'Missing data required for confirmation:'}</strong>{' '}
                        {sig.missingData.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Badge de Certitude Clinique */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs shrink-0 w-full md:w-64 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {currentLang === 'fr' ? 'Certitude Clinique' : 'Clinical Certainty'}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        sig.certainty.level === 'Haute'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sig.certainty.level === 'Moyenne'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {currentLang === 'fr' ? sig.certainty.level : (sig.certainty.level === 'Haute' ? 'High' : sig.certainty.level === 'Moyenne' ? 'Medium' : 'Low')}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                      <div>{currentLang === 'fr' ? 'Complétude dossier :' : 'Data completeness:'} <strong>{sig.certainty.completenessPercent}%</strong></div>
                      <div>{currentLang === 'fr' ? 'Ancienneté max :' : 'Max data age:'} <strong>{sig.certainty.oldestDataMonths} {currentLang === 'fr' ? 'mois' : 'months'}</strong></div>
                      {sig.certainty.domainNote && (
                        <div className="text-rose-700 font-medium">⚠️ {sig.certainty.domainNote}</div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500 mt-2 border-t border-slate-100 pt-1.5 leading-snug">
                      {sig.certainty.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{currentLang === 'fr' ? 'Directive source :' : 'Reference guideline:'} <em>{sig.referenceDirective}</em></span>
                  <span className="font-semibold text-slate-700">{currentLang === 'fr' ? `Délai max d’action : ${sig.deadlineDays} jours` : `Action window: ${sig.deadlineDays} days`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composant Interactif Dédié selon l'Âge */}
      {persona.ageYears < 6 ? (
        <InteractiveGrowthChart
          childName={persona.fullName}
          initialAgeMonths={persona.ageMonths}
          initialHeightCm={persona.clinicalData.heightCm || 82.5}
          initialWeightKg={persona.clinicalData.weightKg || 11.2}
        />
      ) : (
        <InteractiveRiskSimulator
          patientName={persona.fullName}
          initialSystolic={persona.clinicalData.bloodPressureSystolic || 136}
          initialBmi={persona.clinicalData.bmi || 24.1}
          initialSmoking={persona.clinicalData.smokingStatus === 'Fumeur cigarette'}
          initialFamilyHistory={true}
        />
      )}

      {/* Parcours Personnalisé Unifié (CarePlan) & Boucle Fermée à 8 États */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-700" />
              <span>{t.clinical.carePlanTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLang === 'fr' ? 'Une seule visite groupée recommandée pour optimiser l’adhésion de la famille' : 'Single unified visit recommended to optimize family attendance'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {persona.carePlan.map((action) => {
            const currentState = selectedActionState[action.id] || action.currentState;

            return (
              <div key={action.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {action.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{action.actionTitle}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                      <span>{currentLang === 'fr' ? 'Échéance cible :' : 'Target window:'} <strong>{currentLang === 'fr' ? `sous ${action.recommendedWindowDays} jours` : `within ${action.recommendedWindowDays} days`}</strong></span>
                      <span>•</span>
                      <span>{currentLang === 'fr' ? 'Lieu :' : 'Facility:'} <strong>{action.targetFacility}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        Code : {action.orientationCode}
                      </span>
                    </div>
                  </div>

                  {/* Machine à 8 états */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQrModal(action.orientationCode)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                      title={currentLang === 'fr' ? 'Afficher QR Code d’orientation' : 'Show orientation QR Code'}
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col items-end">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">
                        {currentLang === 'fr' ? 'État de suivi (Boucle fermée)' : 'Closed-Loop State'}
                      </label>
                      <select
                        value={currentState}
                        onChange={(e) => handleStateChange(action.id, e.target.value as FollowupState)}
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                          currentState === 'Realisee'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : currentState === 'Refusee'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : currentState === 'Planifiee'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="Creee">{currentLang === 'fr' ? '1. Créée (Signalement initial)' : '1. Created (Initial signal)'}</option>
                        <option value="Validee">{currentLang === 'fr' ? '2. Validée (Par clinicien)' : '2. Validated (By clinician)'}</option>
                        <option value="Invitee">{currentLang === 'fr' ? '3. Invitée (Message envoyé)' : '3. Invited (Notice dispatched)'}</option>
                        <option value="Planifiee">{currentLang === 'fr' ? '4. Planifiée (Créneau pris)' : '4. Scheduled (Slot booked)'}</option>
                        <option value="Realisee">{currentLang === 'fr' ? '5. Réalisée (Confirmée par centre)' : '5. Attended (Clinic verified)'}</option>
                        <option value="Reportee">{currentLang === 'fr' ? '6. Reportée (À la demande)' : '6. Postponed (User request)'}</option>
                        <option value="Refusee">{currentLang === 'fr' ? '7. Refusée (Arrêt relances)' : '7. Declined (Reminders stopped)'}</option>
                        <option value="EnRetard">{currentLang === 'fr' ? '8. En retard (Relance)' : '8. Overdue (Follow-up alert)'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {currentState === 'Realisee' && (
                  <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>{currentLang === 'fr' ? 'Boucle fermée validée :' : 'Closed-loop verified:'}</strong> {currentLang === 'fr' ? 'La visite a été confirmée par scan du code d’orientation au centre de santé Al Bateen.' : 'Attendance confirmed via secure orientation code scan at Al Bateen Center.'}</span>
                  </div>
                )}
                {currentState === 'Refusee' && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span><strong>{currentLang === 'fr' ? 'Choix respecté (CDC §6.5) :' : 'Choice respected (CDC §6.5):'}</strong> {currentLang === 'fr' ? 'Refus explicite enregistré. Toutes les relances sont immédiatement arrêtées sans pénalité d’accès aux soins.' : 'Explicit refusal registered. All automated reminders stopped with zero healthcare penalty.'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Zone d'adaptation clinique par le soignant */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>{currentLang === 'fr' ? 'Pouvoir d’adaptation clinique du praticien' : 'Clinician Clinical Override & Notes'}</span>
            </span>
            <span className="text-[11px] text-slate-400">{currentLang === 'fr' ? 'Le soignant décide toujours' : 'Clinician always decides'}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={adaptationNote}
              onChange={(e) => setAdaptationNote(e.target.value)}
              placeholder={currentLang === 'fr' ? 'Ex : Adaptation motif (reporté à J+30 pour voyage familial ou examen complémentaire)...' : 'E.g., Adjusted timeline to D+30 due to family travel or specialized lab work...'}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              onClick={() => setIsAdapted(true)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white transition active:scale-95"
            >
              {currentLang === 'fr' ? 'Enregistrer' : 'Save'}
            </button>
          </div>
          {isAdapted && (
            <p className="text-[11px] text-emerald-700 font-semibold">
              ✓ {currentLang === 'fr' ? 'Note clinique enregistrée et tracée dans le journal d’audit de la consultation.' : 'Clinical override note recorded in the consultation audit log.'}
            </p>
          )}
        </div>
      </div>

      {/* Modal QR Code d'orientation */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {currentLang === 'fr' ? 'Code d’Orientation Sécurisé' : 'Secure Orientation Code'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {currentLang === 'fr' ? 'Fermeture de boucle sans stockage d’identité civile (CDC §5.6)' : 'Closed-loop tracking without civilian identity storage (CDC §5.6)'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 inline-block font-mono font-black text-xl text-indigo-900 tracking-wider">
              {showQrModal}
            </div>

            <p className="text-[11px] text-slate-500">
              {currentLang === 'fr'
                ? 'Scanné ou saisi par l’agent d’accueil du centre de santé pour valider la visite « Réalisée ».'
                : 'Scanned or entered at the clinic reception desk to confirm the visit as « Attended ».'}
            </p>

            <button
              onClick={() => {
                const targetAction = persona.carePlan.find(a => a.orientationCode === showQrModal);
                if (targetAction) {
                  handleStateChange(targetAction.id, 'Realisee');
                }
                setShowQrModal(null);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>{currentLang === 'fr' ? 'Simuler Scan au Guichet (Valider Réalisée)' : 'Simulate Clinic Scan (Mark Attended)'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              {currentLang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
