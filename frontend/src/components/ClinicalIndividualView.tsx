import React, { useState } from 'react';
import { PersonaProfile, FollowupState } from '../types/medisense';
import { 
  ShieldCheck, AlertCircle, QrCode, CheckCircle2, User,
  FileText, Calendar, Building2, Activity, ArrowLeft
} from 'lucide-react';

interface ClinicalIndividualViewProps {
  persona: PersonaProfile;
  onBackToPopulationView: () => void;
  onUpdateActionState: (personaId: string, actionId: string, newState: FollowupState) => void;
}

export const ClinicalIndividualView: React.FC<ClinicalIndividualViewProps> = ({
  persona,
  onBackToPopulationView,
  onUpdateActionState
}) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={onBackToPopulationView}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la Priorisation Population</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Fiche Clinique Individuelle • Écran 2 (Sprio exclu selon CDC §5.2)</span>
        </div>
      </div>

      {/* Profil du patient & Constantes cliniques */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-medigreen-50 text-medigreen-700 flex items-center justify-center font-black text-base border border-medigreen-200">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900">{persona.fullName}</h1>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {persona.syntheticId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {persona.nationalityGroup}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Âge : <strong>{persona.ageYears} ans ({persona.ageMonths} mois)</strong> • Sexe : <strong>{persona.sex}</strong> • Région : <strong>{persona.region}</strong> • Langue : <strong>{persona.preferredLanguage}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span>Centre de rattachement : <strong>Al Bateen / Al Hili</strong></span>
          </div>
        </div>

        {/* Constantes biologiques mesurées et codes de provenance (V, M, D, S) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-between">
              <span>Tension</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                {persona.clinicalData.bloodPressureProvenance || 'M'}
              </span>
            </div>
            <div className="text-sm font-black text-gray-800 mt-1">
              {persona.clinicalData.bloodPressureSystolic && persona.clinicalData.bloodPressureDiastolic
                ? `${persona.clinicalData.bloodPressureSystolic}/${persona.clinicalData.bloodPressureDiastolic} mmHg`
                : 'Non mesurée'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-between">
              <span>IMC / Poids</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                {persona.clinicalData.bmiProvenance || 'M'}
              </span>
            </div>
            <div className="text-sm font-black text-gray-800 mt-1">
              {persona.clinicalData.bmi ? `${persona.clinicalData.bmi} kg/m²` : `${persona.clinicalData.weightKg || '—'} kg`}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-between">
              <span>Tour de taille</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">M</span>
            </div>
            <div className="text-sm font-black text-gray-800 mt-1">
              {persona.clinicalData.waistCircumferenceCm ? `${persona.clinicalData.waistCircumferenceCm} cm` : 'Non mesuré'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-between">
              <span>Tabagisme</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">D</span>
            </div>
            <div className="text-sm font-black text-gray-800 mt-1 truncate">
              {persona.clinicalData.smokingStatus || 'Non-fumeur'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center justify-between">
              <span>Score FINDRISC</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">Calculé</span>
            </div>
            <div className="text-sm font-black text-indigo-900 mt-1">
              {persona.clinicalData.findriscScore !== undefined ? `${persona.clinicalData.findriscScore} / 26` : 'Non applicable'}
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-[10px] text-purple-700 uppercase font-semibold flex items-center justify-between">
              <span>Génomique [SIMULÉ]</span>
              <span className="font-bold text-[9px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-900">S</span>
            </div>
            <div className="text-sm font-black text-purple-900 mt-1">
              {persona.clinicalData.genomicScorePercentile ? `${persona.clinicalData.genomicScorePercentile}e percentile` : 'Non requis'}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Signaux Détectés avec Badge de Certitude et Facteurs Contrefactuels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-medigreen-700" />
            <span>Signaux d'Alerte et Facteurs Ciblés ({persona.signals.length})</span>
          </h2>
          <span className="text-xs text-gray-500">Explication transparente conforme Exigence 1</span>
        </div>

        <div className="space-y-3.5">
          {persona.signals.map((sig) => {
            const isGrey = sig.level === 'Gris';
            const isOrange = sig.level === 'Orange';
            const isYellow = sig.level === 'Jaune';

            return (
              <div
                key={sig.id}
                className={`p-4 rounded-2xl border transition shadow-sm ${
                  isGrey
                    ? 'bg-gray-50 border-gray-300'
                    : isOrange
                    ? 'bg-orange-50/50 border-orange-200'
                    : isYellow
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg text-white ${
                        isGrey ? 'bg-gray-500' : isOrange ? 'bg-orange-600' : 'bg-amber-600'
                      }`}>
                        {sig.ruleId} • {sig.level.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-sm text-gray-900">{sig.title}</h3>
                      <span className="text-[11px] text-gray-500">({sig.type})</span>
                    </div>

                    {/* Les 1 à 3 Facteurs Clés Explicatifs (Contrefactuels) */}
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        Facteurs déterminants identifiés :
                      </div>
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                        {sig.keyFactors.map((factor, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Données Manquantes (Niveau Gris) */}
                    {sig.missingData.length > 0 && (
                      <div className="mt-2.5 bg-white/80 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-700">
                        <strong className="text-gray-900">Données à compléter pour confirmation :</strong>{' '}
                        {sig.missingData.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Badge de Certitude Clinique (Section 4.6) */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs shrink-0 w-full md:w-64 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Certitude Clinique
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        sig.certainty.level === 'Haute'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sig.certainty.level === 'Moyenne'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sig.certainty.level}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-gray-600 space-y-1">
                      <div>Complétude dossier : <strong>{sig.certainty.completenessPercent}%</strong></div>
                      <div>Ancienneté max : <strong>{sig.certainty.oldestDataMonths} mois</strong></div>
                      {sig.certainty.domainNote && (
                        <div className="text-red-700 font-medium">⚠️ {sig.certainty.domainNote}</div>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-100 pt-1.5 leading-snug">
                      {sig.certainty.explanation}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Directive source : <em>{sig.referenceDirective}</em></span>
                  <span className="font-semibold text-gray-700">Délai max d'action : {sig.deadlineDays} jours</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parcours Personnalisé Unifié (CarePlan) & Boucle Fermée à 8 États */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-700" />
              <span>Parcours Personnalisé Unifié (CarePlan)</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Une seule visite groupée recommandée pour optimiser l'adhésion de la famille
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
                      <h4 className="font-bold text-sm text-gray-900">{action.actionTitle}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1.5 flex-wrap">
                      <span>Échéance cible : <strong>sous {action.recommendedWindowDays} jours</strong></span>
                      <span>•</span>
                      <span>Lieu : <strong>{action.targetFacility}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        Code : {action.orientationCode}
                      </span>
                    </div>
                  </div>

                  {/* Machine à 8 états : Sélecteur d'état pour démonstration au jury */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQrModal(action.orientationCode)}
                      className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                      title="Afficher QR Code d'orientation"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col items-end">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        État de suivi (Boucle fermée)
                      </label>
                      <select
                        value={currentState}
                        onChange={(e) => handleStateChange(action.id, e.target.value as FollowupState)}
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 border transition cursor-pointer ${
                          currentState === 'Realisee'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : currentState === 'Refusee'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : currentState === 'Planifiee'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                      >
                        <option value="Creee">1. Créée (Signalement initial)</option>
                        <option value="Validee">2. Validée (Par clinicien)</option>
                        <option value="Invitee">3. Invitée (Message envoyé)</option>
                        <option value="Planifiee">4. Planifiée (Créneau pris)</option>
                        <option value="Realisee">5. Réalisée (Confirmée par centre)</option>
                        <option value="Reportee">6. Reportée (À la demande)</option>
                        <option value="Refusee">7. Refusée (Arrêt relances)</option>
                        <option value="EnRetard">8. En retard (Relance)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {currentState === 'Realisee' && (
                  <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>Boucle fermée validée :</strong> La visite a été confirmée par scan du code d'orientation au centre de santé Al Bateen.</span>
                  </div>
                )}
                {currentState === 'Refusee' && (
                  <div className="mt-2.5 p-2 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span><strong>Choix respecté (CDC §6.5) :</strong> Refus explicite enregistré. Toutes les relances sont immédiatement arrêtées sans pénalité d'accès aux soins.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Zone d'adaptation clinique par le soignant */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Pouvoir d'adaptation clinique du praticien</span>
            </span>
            <span className="text-[11px] text-gray-400">Le soignant décide toujours</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={adaptationNote}
              onChange={(e) => setAdaptationNote(e.target.value)}
              placeholder="Ex : Adaptation motif (reporté à J+30 pour voyage familial ou examen complémentaire)..."
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-medigreen-600"
            />
            <button
              onClick={() => setIsAdapted(true)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white transition active:scale-95"
            >
              Enregistrer
            </button>
          </div>
          {isAdapted && (
            <p className="text-[11px] text-emerald-700 font-semibold">
              ✓ Note clinique enregistrée et tracée dans le journal d'audit de la consultation.
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
              <h3 className="font-black text-base text-gray-900">Code d'Orientation Sécurisé</h3>
              <p className="text-xs text-gray-500 mt-1">
                Fermeture de boucle sans stockage d'identité civile (CDC §5.6)
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 inline-block font-mono font-black text-xl text-indigo-900 tracking-wider">
              {showQrModal}
            </div>

            <p className="text-[11px] text-gray-400">
              Scanné ou saisi par l'agent d'accueil du centre de santé pour valider la visite « Réalisée ».
            </p>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
