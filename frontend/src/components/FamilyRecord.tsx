import React, { useState } from 'react';
import { History, Calendar, HeartPulse } from 'lucide-react';
import { TriageResult } from '../types';

interface FamilyRecordProps {
  consultations: TriageResult[];
}

export const FamilyRecord: React.FC<FamilyRecordProps> = ({ consultations }) => {
  const [j2State, setJ2State] = useState<number | null>(null);
  const [j2Done, setJ2Done] = useState(false);

  return (
    <section className="py-10 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-earth-500/10 text-earth-700 text-xs font-bold mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Dossier Médical Familial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Historique des Triages & Suivi J+2
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Vos consultations passées et le contrôle automatique par SMS à 48 heures.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Liste des Consultations (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-medigreen-700" />
              <span>Dernières consultations enregistrées</span>
            </h3>

            {consultations.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center text-sm text-gray-400">
                Aucun triage pour l'instant. Décrivez vos symptômes pour commencer.
              </div>
            ) : (
              consultations.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        t.urgency === 'ROUGE'
                          ? 'bg-medired-50 text-medired-700'
                          : t.urgency === 'ORANGE'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {t.urgency}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{t.timestamp}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-gray-900">{t.conditionName}</h4>
                    <p className="text-xs text-earth-700 font-semibold mt-0.5">Patient : {t.patientName}</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{t.adviceFrench}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Orientation : {t.recommendedFacility}</span>
                    <span className="font-mono">{t.icd10Code}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Module de Suivi SMS 48h (J+2) (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-medigreen-700 font-extrabold text-base mb-2">
                <HeartPulse className="w-5 h-5" />
                <span>Questionnaire de Suivi (J+2)</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                « Message SMS automatique reçu après 48h : Vos symptômes ont-ils disparu ? »
              </p>

              {j2Done ? (
                <div className="p-5 rounded-2xl bg-medigreen-50 text-medigreen-800 text-center font-bold text-sm">
                  ✅ Merci ! Votre bilan d'évolution a été enregistré avec succès dans votre carnet.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-gray-700">Comment se sent le patient aujourd'hui ?</div>
                  <div className="space-y-2">
                    {[
                      { id: 0, label: 'Complètement guéri(e)' },
                      { id: 1, label: 'En nette amélioration' },
                      { id: 2, label: 'État stationnaire (sans changement)' },
                      { id: 3, label: 'Aggravation des symptômes (fièvre en hausse)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setJ2State(opt.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition ${
                          j2State === opt.id
                            ? 'border-medigreen-700 bg-medigreen-50 text-medigreen-800 font-bold'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={j2State === null}
                    onClick={() => {
                      if (j2State === 3) {
                        alert('⚠️ Attention : Une aggravation à 48h nécessite un examen immédiat à l\'hôpital le plus proche.');
                      }
                      setJ2Done(true);
                    }}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-medigreen-700 disabled:bg-gray-200 hover:bg-medigreen-800 text-white font-bold text-xs shadow-md transition"
                  >
                    Valider le contrôle
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
              Chaque mise à jour aide le système national à mesurer l'efficacité des soins et la rémission.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
