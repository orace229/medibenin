import React, { useState } from 'react';
import { PersonaProfile } from '../types/medisense';
import { Send, ArrowRight, CheckCircle2, MapPin, Filter, Building2, ShieldCheck } from 'lucide-react';

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

  // Sorted strictly by Sprio descending
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
    <div className="space-y-5">
      {/* Page Header - Clean, modern, breathable (SaaS standard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Priorisation de la Population
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Console Coordinateur
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordonnancement des invitations selon le score <strong>Sprio</strong> et la capacité des créneaux
          </p>
        </div>

        {/* Capacity Widget - Minimal & Elegant */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-4 shrink-0 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-slate-900">48 / 65</span>
              <span className="text-[11px] text-slate-500">créneaux alloués (74%)</span>
            </div>
            <div className="w-36 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Rule Notice - Subtle, not an ugly giant yellow box */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Séparation stricte Logistique / Clinique (CDC §5.2) :</strong> Ce score <code>Sprio</code> ordonnance uniquement les invitations et <strong>n’apparaît jamais dans la fiche clinique</strong> pour préserver l’indépendance soignante.
        </span>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">{sortedPersonas.length} dossiers classés</span>
          <span className="text-slate-300">•</span>
          <span>{selectedIds.length} sélectionné(s)</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (selectedIds.length === personas.length) setSelectedIds([]);
              else setSelectedIds(personas.map(p => p.id));
            }}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition"
          >
            {selectedIds.length === personas.length ? 'Désélectionner tout' : 'Tout sélectionner'}
          </button>
          <button
            disabled={selectedIds.length === 0}
            onClick={handleApproveBatch}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition ${
              selectedIds.length > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Valider invitations ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {batchApproved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Lot d'invitations validé avec génération automatique des codes d'orientation chiffrés.</span>
        </div>
      )}

      {/* List of Personas - Clean, Card-based, Elegant */}
      <div className="space-y-3">
        {sortedPersonas.map((persona, index) => {
          const isSelected = selectedIds.includes(persona.id);

          return (
            <div
              key={persona.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs hover:border-slate-300 ${
                isSelected ? 'border-indigo-400/80 bg-indigo-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Checkbox + Identity + Signals */}
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(persona.id)}
                    className="mt-1 w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                  />
                  <div className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                    #{index + 1}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{persona.fullName}</span>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {persona.syntheticId}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                        {persona.nationalityGroup}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {persona.region} ({persona.accessTimeToClinicMinutes} min)
                      </span>
                    </div>

                    {/* Summary of signals */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {persona.signals.slice(0, 3).map((sig) => (
                        <span
                          key={sig.id}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            sig.level === 'Orange'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : sig.level === 'Jaune'
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sig.ruleId} • {sig.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Sprio Score & View Button */}
                <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Score Sprio
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {persona.priorityScore}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono space-x-1">
                      <span>R:{persona.priorityComponents.riskIndex}</span>
                      <span>L:{persona.priorityComponents.gapIndex}</span>
                      <span>D:{persona.priorityComponents.delayIndex}</span>
                      <span>V:{persona.priorityComponents.vulnIndex}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPersonaForClinicalView(persona)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-xs transition shrink-0 group active:scale-95"
                  >
                    <span>Fiche Clinique</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
