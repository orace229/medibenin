import React, { useState } from 'react';
import { PersonaProfile } from '../types/medisense';
import { Send, ArrowRight, CheckCircle2, MapPin, Filter } from 'lucide-react';

interface PopulationPrioritizationViewProps {
  personas: PersonaProfile[];
  onSelectPersonaForClinicalView: (persona: PersonaProfile) => void;
  onApproveInvitationsBatch: (personaIds: string[]) => void;
}

export const PopulationPrioritizationView: React.FC<PopulationPrioritizationViewProps> = ({
  personas,
  onSelectPersonaForClinicalView,
  onApproveInvitationsBatch
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchApproved, setBatchApproved] = useState(false);

  // Sorted strictly by Sprio descending as specified in Section 5.2
  const sortedPersonas = [...personas].sort((a, b) => b.priorityScore - a.priorityScore);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApproveBatch = () => {
    onApproveInvitationsBatch(selectedIds);
    setBatchApproved(true);
    setTimeout(() => setBatchApproved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner / Header explicatif pour le jury */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
                Écran 1 • Console Coordinateur
              </span>
              <span className="text-xs text-blue-200 font-medium">Standard DoH Abu Dhabi</span>
            </div>
            <h2 className="text-xl font-black mt-1">Priorisation de la Population & Attribution des Créneaux</h2>
            <p className="text-xs text-blue-100 max-w-2xl mt-1 leading-relaxed">
              Cet écran répond à la question logistique : <em>« Qui inviter en premier avec la capacité disponible ? »</em>.
              Il calcule le score <strong>Sprio</strong> combinant risque clinique, lacunes de soins, retard d’échéance et vulnérabilité d’accès.
            </p>
          </div>

          {/* Jauge de capacité des centres */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 shrink-0 text-right">
            <div className="text-[11px] text-blue-200 font-medium">Capacité centres du jour</div>
            <div className="text-lg font-black text-white">48 / 65 créneaux alloués</div>
            <div className="w-48 bg-white/20 h-2 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Règle éthique explicite affichée au coordinateur */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <div className="p-1 rounded bg-amber-200/60 font-bold shrink-0">RÈGLE CDC §5.2</div>
        <p>
          <strong>Séparation stricte Logistique / Clinique :</strong> Ce score <code>Sprio</code> sert uniquement à ordonnancer les invitations selon les créneaux disponibles. <strong>Il est strictement interdit d'afficher ce score dans la fiche clinique individuelle</strong> pour ne pas biaiser la décision du médecin ou de l'infirmier.
        </p>
      </div>

      {/* Barre d'action et validation par lot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">{sortedPersonas.length} dossiers priorisés</span>
          <span className="text-gray-300">•</span>
          <span>{selectedIds.length} sélectionné(s) pour invitation</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedIds(personas.map(p => p.id))}
            className="text-xs font-semibold px-3 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Tout sélectionner
          </button>
          <button
            disabled={selectedIds.length === 0}
            onClick={handleApproveBatch}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition ${
              selectedIds.length > 0
                ? 'bg-medigreen-700 hover:bg-medigreen-800 text-white cursor-pointer active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Valider le lot d'invitations ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {batchApproved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lot d'invitations validé ! Les messages d'invitation avec code d'orientation ont été mis en file d'envoi.</span>
        </div>
      )}

      {/* Tableau des Personas priorisés par Sprio */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {sortedPersonas.map((persona, index) => {
            const isSelected = selectedIds.includes(persona.id);

            return (
              <div
                key={persona.id}
                className={`p-4 sm:p-5 transition hover:bg-gray-50/80 ${
                  isSelected ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Gauche : Checkbox + Rang + Identité */}
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(persona.id)}
                      className="mt-1 w-4 h-4 text-medigreen-700 rounded border-gray-300 focus:ring-medigreen-600 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-xl bg-gray-100 font-black text-xs text-gray-700 flex items-center justify-center shrink-0 border border-gray-200">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">{persona.fullName}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          {persona.syntheticId}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {persona.nationalityGroup}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {persona.region} ({persona.accessTimeToClinicMinutes} min du centre)
                        </span>
                      </div>

                      {/* Signaux de lacune résumés */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {persona.signals.slice(0, 3).map((sig) => (
                          <span
                            key={sig.id}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                              sig.level === 'Orange'
                                ? 'bg-orange-50 text-orange-800 border-orange-200'
                                : sig.level === 'Jaune'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            <strong>{sig.ruleId}</strong> : {sig.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Droite : Score Sprio + Composantes + Bouton Fiche */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    {/* Décomposition mathématique Sprio */}
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Score Sprio
                      </div>
                      <div className="text-2xl font-black text-indigo-900 flex items-baseline justify-end gap-1">
                        <span>{persona.priorityScore}</span>
                        <span className="text-xs text-gray-400 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-x-1.5 font-mono">
                        <span>R:{persona.priorityComponents.riskIndex}</span>
                        <span>L:{persona.priorityComponents.gapIndex}</span>
                        <span>D:{persona.priorityComponents.delayIndex}</span>
                        <span>V:{persona.priorityComponents.vulnIndex}</span>
                      </div>
                    </div>

                    {/* Bouton de bascule vers la Fiche Clinique */}
                    <button
                      onClick={() => onSelectPersonaForClinicalView(persona)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition shrink-0 group active:scale-95"
                    >
                      <span>Ouvrir Fiche Clinique</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
