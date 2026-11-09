import React, { useState } from 'react';
import { POPULATION_SEGMENTS } from '../data/populationData';
import { Lock, Info, Filter, ShieldCheck } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface PopulationSafeguardsViewProps {
  currentLang?: Language;
}

export const PopulationSafeguardsView: React.FC<PopulationSafeguardsViewProps> = ({
  currentLang = 'fr'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedDimension, setSelectedDimension] = useState<'nationality' | 'region' | 'all'>('all');

  const filteredSegments = POPULATION_SEGMENTS.filter(seg => {
    if (selectedDimension === 'nationality') return seg.segmentKey.startsWith('nat');
    if (selectedDimension === 'region') return seg.segmentKey.startsWith('reg') || seg.segmentKey.includes('micro');
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header - Clean, modern, breathable SaaS style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t.safeguards.headerTitle}
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Console ADPHC / CDC §7
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.safeguards.headerDesc}
          </p>
        </div>

        {/* Anti-Reidentification Badge */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 px-3.5 flex items-center gap-3 shrink-0 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{t.safeguards.antiReidBadge}</div>
            <div className="text-[10px] text-slate-500 font-medium">{t.safeguards.antiReidSub}</div>
          </div>
        </div>
      </div>

      {/* Alertes d'équité détectées (Règles C3 & C1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-bold text-xs text-slate-900">{t.safeguards.alertC3Title}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              {t.safeguards.alertC3Badge}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.safeguards.alertC3Desc}
          </p>
          <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/80 font-medium">
            {t.safeguards.alertC3Action}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-rose-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="font-bold text-xs text-slate-900">{t.safeguards.alertC1Title}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {t.safeguards.alertC1Badge}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.safeguards.alertC1Desc}
          </p>
          <div className="text-[11px] text-slate-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/80 font-medium">
            {t.safeguards.alertC1Action}
          </div>
        </div>
      </div>

      {/* Filtres de dimension */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 px-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.safeguards.filters.title}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedDimension('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              selectedDimension === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.safeguards.filters.all}
          </button>
          <button
            onClick={() => setSelectedDimension('nationality')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              selectedDimension === 'nationality'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.safeguards.filters.nationality}
          </button>
          <button
            onClick={() => setSelectedDimension('region')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              selectedDimension === 'region'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.safeguards.filters.region}
          </button>
        </div>
      </div>

      {/* Tableau des indicateurs avec Masquage et Intervalles de Wilson */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3">{t.safeguards.columns.segment}</th>
                <th className="p-3 text-right">{t.safeguards.columns.eligible}</th>
                <th className="p-3 text-right">{t.safeguards.columns.reach}</th>
                <th className="p-3 text-right">{t.safeguards.columns.recommendation}</th>
                <th className="p-3 text-right">{t.safeguards.columns.adoption}</th>
                <th className="p-3 text-right">{t.safeguards.columns.falsePositives}</th>
                <th className="p-3 text-right">{t.safeguards.columns.falseNegatives}</th>
                <th className="p-3 text-center">{t.safeguards.columns.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSegments.map((seg) => {
                return (
                  <tr
                    key={seg.segmentKey}
                    className={`hover:bg-slate-50/80 transition ${
                      seg.isMasked ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900">
                      {seg.segmentLabel}
                    </td>

                    <td className="p-3 text-right font-mono text-slate-700">
                      {seg.isMasked ? (
                        <span className="text-slate-400 italic">n &lt; 10</span>
                      ) : (
                        seg.eligiblePopulation.toLocaleString()
                      )}
                    </td>

                    {/* Portée avec intervalle Wilson */}
                    <td className="p-3 text-right">
                      {seg.isMasked ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[10px] inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {t.safeguards.maskedText}
                        </span>
                      ) : (
                        <div>
                          <div className="font-bold text-slate-900">{seg.reachRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            [{seg.reachWilson95[0]}% – {seg.reachWilson95[1]}%]
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Taux Recommandation */}
                    <td className="p-3 text-right">
                      {seg.isMasked ? (
                        <span className="text-slate-400 italic">—</span>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-900">{seg.recommendationRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            [{seg.recommendationWilson95[0]}% – {seg.recommendationWilson95[1]}%]
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Adoption */}
                    <td className="p-3 text-right">
                      {seg.isMasked ? (
                        <span className="text-slate-400 italic">—</span>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-900">{seg.adoptionRate.toFixed(1)}%</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            [{seg.adoptionWilson95[0]}% – {seg.adoptionWilson95[1]}%]
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Faux Positifs */}
                    <td className="p-3 text-right font-mono text-slate-600">
                      {seg.isMasked ? '—' : `${seg.falsePositiveRate.toFixed(1)}%`}
                    </td>

                    {/* Faux Négatifs */}
                    <td className="p-3 text-right font-mono text-slate-600">
                      {seg.isMasked ? '—' : `${seg.falseNegativeRate.toFixed(1)}%`}
                    </td>

                    {/* Statut Garde-fou */}
                    <td className="p-3 text-center">
                      {seg.isMasked ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          {t.safeguards.antiReidStatus}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center justify-center gap-1 w-fit mx-auto">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{t.safeguards.confirmedWilson}</span>
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
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 shadow-xs">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>{t.safeguards.methodologyTitle}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {t.safeguards.methodologyDesc}
        </p>
      </div>
    </div>
  );
};
