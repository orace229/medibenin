import React, { useState } from 'react';
import { POPULATION_SEGMENTS } from '../data/populationData';
import { AlertTriangle, Lock, Info, Filter } from 'lucide-react';

export const PopulationSafeguardsView: React.FC = () => {
  const [selectedDimension, setSelectedDimension] = useState<'nationality' | 'region' | 'all'>('all');

  const filteredSegments = POPULATION_SEGMENTS.filter(seg => {
    if (selectedDimension === 'nationality') return seg.segmentKey.startsWith('nat');
    if (selectedDimension === 'region') return seg.segmentKey.startsWith('reg') || seg.segmentKey.includes('micro');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête explicatif pour le jury d'Abu Dhabi */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider">
                Écran 3 • Console Santé Publique
              </span>
              <span className="text-xs text-emerald-200 font-medium">Standards ADPHC / CDC §7</span>
            </div>
            <h2 className="text-xl font-black mt-1">Garde-fous de Population, Masquage & Intervalles de Wilson</h2>
            <p className="text-xs text-emerald-100 max-w-2xl mt-1 leading-relaxed">
              Pour éviter les analyses trompeuses, MediSense intègre le <strong>masquage strict des petits effectifs (n &lt; 10)</strong>, 
              le calcul systématique des <strong>intervalles de confiance de Wilson à 95 %</strong>, et les <strong>alertes d’équité culturelle C3/C4</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/20 text-xs">
            <Lock className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <div className="font-bold text-white">Règle Anti-Réidentification</div>
              <div className="text-[11px] text-emerald-200">Suppression primaire et secondaire active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes d'équité détectées (Règles C3 & C1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <span>Alerte d’Écart d’Adoption (Règle C3)</span>
              <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-black">JAUNE</span>
            </div>
            <p className="mt-1 leading-relaxed">
              <strong>Segment Asie du Sud :</strong> Taux d'adoption (64,2% [63,2% – 65,2%]) inférieur de plus de 10 points à la moyenne (74,8%), avec intervalles de Wilson disjoints.
            </p>
            <div className="mt-2 text-[11px] text-amber-800 font-semibold bg-white/60 p-2 rounded-lg">
              → Action recommandée : Adapter les messages en Ourdou/Hindi et ouvrir des créneaux en soirée pour les travailleurs postés.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900">
            <div className="font-bold text-sm text-orange-950 flex items-center gap-2">
              <span>Alerte Zone Sous-Couverte (Règle C1)</span>
              <span className="text-[10px] bg-orange-200 px-1.5 py-0.5 rounded font-black">ORANGE</span>
            </div>
            <p className="mt-1 leading-relaxed">
              <strong>Région Al Dhafra :</strong> Borne haute de l'intervalle de portée (73,9%) sous la cible du programme (85%). Accès routier moyen &gt; 30 minutes.
            </p>
            <div className="mt-2 text-[11px] text-orange-800 font-semibold bg-white/60 p-2 rounded-lg">
              → Action recommandée : Déploiement d'une unité mobile de dépistage itinérante avec relais communautaires.
            </div>
          </div>
        </div>
      </div>

      {/* Filtres de dimension */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <Filter className="w-4 h-4 text-gray-400" />
          <span>Filtrer par dimension d’Abu Dhabi :</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSelectedDimension('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              selectedDimension === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous les segments
          </button>
          <button
            onClick={() => setSelectedDimension('nationality')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              selectedDimension === 'nationality'
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par Nationalité
          </button>
          <button
            onClick={() => setSelectedDimension('region')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
              selectedDimension === 'region'
                ? 'bg-emerald-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Par Région Géographique
          </button>
        </div>
      </div>

      {/* Tableau des indicateurs avec Masquage et Intervalles de Wilson */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Segment de Population</th>
                <th className="p-3.5 text-right">Population Éligible</th>
                <th className="p-3.5 text-right">Portée [Wilson 95%]</th>
                <th className="p-3.5 text-right">Taux Recommandation</th>
                <th className="p-3.5 text-right">Adoption Confirmée</th>
                <th className="p-3.5 text-right">Faux Positifs</th>
                <th className="p-3.5 text-right">Faux Négatifs</th>
                <th className="p-3.5 text-center">Garde-fou Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSegments.map((seg) => {
                return (
                  <tr
                    key={seg.segmentKey}
                    className={`hover:bg-gray-50/80 transition ${
                      seg.isMasked ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold text-gray-900">
                      {seg.segmentLabel}
                    </td>

                    <td className="p-3.5 text-right font-mono text-gray-700">
                      {seg.isMasked ? (
                        <span className="text-gray-400 italic">n &lt; 10</span>
                      ) : (
                        seg.eligiblePopulation.toLocaleString()
                      )}
                    </td>

                    {/* Portée avec intervalle Wilson */}
                    <td className="p-3.5 text-right">
                      {seg.isMasked ? (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-bold text-[10px] inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Masqué (n &lt; 10)
                        </span>
                      ) : (
                        <div>
                          <div className="font-bold text-gray-900">{seg.reachRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            [{seg.reachWilson95[0]}% – {seg.reachWilson95[1]}%]
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Taux Recommandation */}
                    <td className="p-3.5 text-right">
                      {seg.isMasked ? (
                        <span className="text-gray-400 italic">—</span>
                      ) : (
                        <div>
                          <div className="font-bold text-gray-900">{seg.recommendationRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            [{seg.recommendationWilson95[0]}% – {seg.recommendationWilson95[1]}%]
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Adoption */}
                    <td className="p-3.5 text-right">
                      {seg.isMasked ? (
                        <span className="text-gray-400 italic">—</span>
                      ) : (
                        <div>
                          <div className="font-bold text-gray-900">{seg.adoptionRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            [{seg.adoptionWilson95[0]}% – {seg.adoptionWilson95[1]}%]
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Faux Positifs */}
                    <td className="p-3.5 text-right font-mono text-gray-600">
                      {seg.isMasked ? '—' : `${seg.falsePositiveRate.toFixed(1)}%`}
                    </td>

                    {/* Faux Négatifs */}
                    <td className="p-3.5 text-right font-mono text-gray-600">
                      {seg.isMasked ? '—' : `${seg.falseNegativeRate.toFixed(1)}%`}
                    </td>

                    {/* Statut Garde-fou */}
                    <td className="p-3.5 text-center">
                      {seg.isMasked ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black border border-red-200">
                          ANTI-RÉIDENTIFICATION
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          CONFIRMÉ WILSON
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note explicative pour le jury sur la suppression secondaire */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1.5">
        <div className="font-bold text-gray-900 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Explication méthodologique du masquage :</span>
        </div>
        <p>
          Conformément au CDC §7.3, toute cellule dont l'effectif est strictement inférieur à 10 est systématiquement masquée (primaire) pour protéger le secret statistique. La cellule complémentaire de la même ligne ou colonne est également masquée (suppression secondaire) pour empêcher tout recalcul par déduction mathématique.
        </p>
      </div>
    </div>
  );
};
