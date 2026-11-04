import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, FileCheck, Stethoscope } from 'lucide-react';
import { AuditCase } from '../types';
import { AUDIT_CASES } from '../data/mockData';

export const MedicalCommitteeAudit: React.FC = () => {
  const [cases, setCases] = useState<AuditCase[]>(AUDIT_CASES);
  const [selectedCase, setSelectedCase] = useState<AuditCase | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = (id: string, approved: boolean) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isReviewed: true, isApproved: approved, notes: notes || 'Vérification effectuée' }
          : c
      )
    );
    setSelectedCase(null);
    setNotes('');
  };

  return (
    <section id="audit-portal" className="py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Gouvernance & Sécurité Clinique</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Espace d'Audit du Comité Médical
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Supervision a posteriori systématique : 100% des cas ROUGE et cas incertains sont examinés collégialement.
            </p>
          </div>

          <div className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-purple-700" />
            <span>Aucune modification directe des règles en 1 clic (Procédure collégiale ARS / SoBePed)</span>
          </div>
        </div>

        {/* Tableau / Cartes des cas à auditer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cases.map((item: AuditCase) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition flex flex-col justify-between ${
                item.isReviewed
                  ? 'bg-gray-50/70 border-gray-200'
                  : 'bg-white border-purple-200 shadow-md shadow-purple-500/5 hover:border-purple-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black text-gray-400">{item.id}</span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      item.urgency === 'ROUGE'
                        ? 'bg-medired-50 text-medired-700 border border-medired-200'
                        : item.urgency === 'ORANGE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.urgency}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-gray-900 mb-1">{item.patientInfo}</h4>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">« {item.reportedSymptoms} »</p>

                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-purple-900 font-medium mb-4">
                  <span className="font-bold">Analyse IA : </span>
                  {item.shapSummary}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-400 mb-3">{item.date}</div>
                {item.isReviewed ? (
                  <div
                    className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                      item.isApproved
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-medired-50 text-medired-700'
                    }`}
                  >
                    {item.isApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertOctagon className="w-4 h-4 text-medired-600" />
                    )}
                    <span>{item.isApproved ? 'Décision validée' : 'Anomalie signalée'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedCase(item)}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition"
                  >
                    Examiner ce cas
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal d'examen de cas */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Audit Clinique : {selectedCase.id}
              </h3>
              <p className="text-xs text-gray-500 mb-4">{selectedCase.patientInfo}</p>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 mb-4 space-y-2">
                <div>
                  <span className="font-bold">Symptômes déclarés : </span>
                  {selectedCase.reportedSymptoms}
                </div>
                {selectedCase.temperature && (
                  <div>
                    <span className="font-bold">Température : </span>
                    {selectedCase.temperature} °C
                  </div>
                )}
                <div>
                  <span className="font-bold">Classification Système : </span>
                  <span className="font-black text-purple-800">{selectedCase.urgency}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Remarques ou motifs de révision médicale :
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Le niveau Orange est approprié en raison du risque palustre sans convulsion..."
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  rows={3}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction(selectedCase.id, false)}
                  className="py-3 px-4 rounded-xl border border-medired-300 text-medired-700 hover:bg-medired-50 font-bold text-xs transition"
                >
                  Signaler Anomalie
                </button>
                <button
                  onClick={() => handleAction(selectedCase.id, true)}
                  className="py-3 px-4 rounded-xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-bold text-xs transition shadow-md"
                >
                  Valider la Recommandation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
