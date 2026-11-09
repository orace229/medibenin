import React from 'react';
import { BENCHMARK_COMPARISONS } from '../data/populationData';
import { TrendingUp, Info } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface BenchmarkEvaluationViewProps {
  currentLang?: Language;
}

export const BenchmarkEvaluationView: React.FC<BenchmarkEvaluationViewProps> = ({
  currentLang = 'fr'
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="space-y-6">
      {/* En-tête explicatif pour le jury */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-500/30 text-slate-200 border border-slate-400/30 text-[11px] font-bold uppercase tracking-wider">
                {currentLang === 'fr' ? 'Écran 5 • Banc d’Essai Synthétique (50 000 Profils)' : 'Screen 5 • Synthetic Benchmark (50,000 Profiles)'}
              </span>
              <span className="text-xs text-slate-300 font-medium">CDC §8.4 • {currentLang === 'fr' ? 'Évaluation comparative' : 'Comparative Evaluation'}</span>
            </div>
            <h2 className="text-xl font-black mt-1">{t.benchmark.headerTitle}</h2>
            <p className="text-xs text-slate-200 max-w-2xl mt-1 leading-relaxed">
              {t.benchmark.headerDesc}
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-xs text-right shrink-0">
            <div className="font-bold text-white text-sm">{currentLang === 'fr' ? 'Cohorte 50 000' : '50,000 Cohort'}</div>
            <div className="text-[11px] text-slate-300">{currentLang === 'fr' ? '20 graines aléatoires reproduites' : '20 random seeds reproduced'}</div>
          </div>
        </div>
      </div>

      {/* Encadré d'intégrité scientifique (Clause obligatoire CDC §8.4) */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-2">
        <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-700" />
          <span>{t.benchmark.integrityTitle}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-2.5 bg-white/80 rounded-xl border border-blue-100">
            <strong className="text-emerald-800">
              {currentLang === 'fr' ? '✓ Ce que ce banc d’essai prouve :' : '✓ What this benchmark proves:'}
            </strong>
            <p className="mt-0.5 text-gray-700">
              {currentLang === 'fr'
                ? 'Il prouve que la chaîne d’algorithmes fonctionne, que les garde-fous statistiques de Wilson s’activent, et que le modèle résiste aux scénarios de données manquantes.'
                : 'It proves that the algorithmic pipeline executes, that Wilson 95% statistical safeguards trigger properly, and that the engine is resilient to missing data.'}
            </p>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-blue-100">
            <strong className="text-amber-800">
              {currentLang === 'fr' ? '⚠️ Ce qu’il ne prouve pas :' : '⚠️ What it does NOT prove:'}
            </strong>
            <p className="mt-0.5 text-gray-700">
              {currentLang === 'fr'
                ? 'Aucune efficacité clinique dans le monde réel. L’efficacité clinique définitive sera mesurée uniquement lors du futur pilote encadré dans un établissement partenaire d’Abu Dhabi.'
                : 'Zero real-world clinical efficacy. Definitive clinical outcomes will only be established during the upcoming clinical pilot at partner facilities in Abu Dhabi.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tableau comparatif des résultats */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-700" />
            <span>{t.benchmark.table.title}</span>
          </h3>
          <span className="text-xs text-gray-400">CDC §8.2</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">{t.benchmark.table.metricCol}</th>
                <th className="p-3.5 text-right bg-gray-100/60 text-gray-500">{t.benchmark.table.baselineCol}</th>
                <th className="p-3.5 text-right bg-indigo-50/50 text-indigo-900 font-black">{t.benchmark.table.medisenseCol}</th>
                <th className="p-3.5 text-right">{t.benchmark.table.deltaCol}</th>
                <th className="p-3.5">{currentLang === 'fr' ? 'Bénéfice Clinique et Éthique' : 'Clinical & Ethical Benefit'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {BENCHMARK_COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition">
                  <td className="p-3.5 font-bold text-gray-900">
                    {row.metricLabel}
                  </td>
                  <td className="p-3.5 text-right font-mono bg-gray-50/50 text-gray-600">
                    {row.ageSexStandardApproach}
                  </td>
                  <td className="p-3.5 text-right font-mono bg-indigo-50/30 text-indigo-950 font-bold">
                    {row.mediSensePrecisionApproach}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                      row.differenceGain.startsWith('-')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {row.differenceGain}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-600 text-[11px] leading-snug">
                    {row.clinicalSignificance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cartouche récapitulatif de l'impact populationnel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-black text-indigo-900">x 4.02</div>
          <div className="text-xs font-bold text-gray-800 mt-1">
            {currentLang === 'fr' ? 'Rendement de Détection' : 'Detection Yield'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {currentLang === 'fr' ? '4 fois plus de cas méconnus confirmés par invitation émise' : '4x more unaddressed conditions identified per outreach slot'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-black text-emerald-700">- 40.2 pts</div>
          <div className="text-xs font-bold text-gray-800 mt-1">
            {currentLang === 'fr' ? 'Désengorgement des Cliniques' : 'Clinic Decongestion'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {currentLang === 'fr' ? 'Élimination drastique des rendez-vous « à blanc » non indiqués' : 'Drastic elimination of unindicated routine blank checkups'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-black text-purple-700">84.5%</div>
          <div className="text-xs font-bold text-gray-800 mt-1">
            {currentLang === 'fr' ? 'Boucles Fermées Traçables' : 'Closed Loop Followup'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {currentLang === 'fr' ? 'Chaque orientation suivie jusqu’à réalisation ou refus éclairé' : 'Every care pathway tracked until clinic attendance or explicit refusal'}
          </div>
        </div>
      </div>
    </div>
  );
};
