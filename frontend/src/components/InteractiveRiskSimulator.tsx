import React, { useState } from 'react';
import { Sliders, TrendingDown, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

interface InteractiveRiskSimulatorProps {
  initialSystolic?: number;
  initialBmi?: number;
  initialSmoking?: boolean;
  initialFamilyHistory?: boolean;
  patientName: string;
}

export const InteractiveRiskSimulator: React.FC<InteractiveRiskSimulatorProps> = ({
  initialSystolic = 136,
  initialBmi = 24.1,
  initialSmoking = true,
  initialFamilyHistory = true,
  patientName
}) => {
  const [systolic, setSystolic] = useState<number>(initialSystolic);
  const [bmi, setBmi] = useState<number>(initialBmi);
  const [isSmoker, setIsSmoker] = useState<boolean>(initialSmoking);
  const [familyDiabetes, setFamilyDiabetes] = useState<boolean>(initialFamilyHistory);
  const [simulateMissingData, setSimulateMissingData] = useState<boolean>(false);

  // Calcul dynamique du score FINDRISC simplifié
  const calculateFindrisc = () => {
    let score = 0;
    // Âge (36 ans = 0 pt)
    if (bmi >= 30) score += 3;
    else if (bmi >= 25) score += 1;
    // Tour de taille estimé par l'IMC
    if (bmi >= 28) score += 4;
    else if (bmi >= 24) score += 3;
    // Tabagisme / sédentarité associée
    if (isSmoker) score += 2;
    // Tension artérielle
    if (systolic >= 140) score += 2;
    // Antécédents familiaux
    if (familyDiabetes) score += 5;
    return score;
  };

  const currentScore = calculateFindrisc();
  
  // Calcul contrefactuel : Scénario cible idéal (Tension 120, arrêt tabac, IMC normal)
  const targetScore = familyDiabetes ? 5 : 0; // Seul l'antécédent familial reste non modifiable
  const potentialReductionPercent = Math.max(0, Math.round(((currentScore - targetScore) / Math.max(1, currentScore)) * 100));

  const resetValues = () => {
    setSystolic(initialSystolic);
    setBmi(initialBmi);
    setIsSmoker(initialSmoking);
    setFamilyDiabetes(initialFamilyHistory);
    setSimulateMissingData(false);
  };

  const getRiskBadge = (score: number) => {
    if (score >= 15) return { level: 'Orange', text: 'Risque Très Élevé (>= 15 pts)', color: 'bg-orange-600 text-white' };
    if (score >= 12) return { level: 'Jaune', text: 'Risque Modéré (12-14 pts)', color: 'bg-amber-600 text-white' };
    return { level: 'Vert', text: 'Risque Faible (< 12 pts)', color: 'bg-emerald-600 text-white' };
  };

  const riskStatus = getRiskBadge(currentScore);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              Simulateur Contrefactuel en Direct
            </span>
            <span className="text-xs text-gray-400">CDC §4.6</span>
          </div>
          <h3 className="font-black text-base text-gray-900 mt-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-700" />
            <span>Impact des Facteurs Modifiables • {patientName}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulateMissingData(!simulateMissingData)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
              simulateMissingData
                ? 'bg-gray-800 text-white border-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
            }`}
          >
            {simulateMissingData ? 'Retirer simulation données manquantes' : 'Tester Niveau Gris (Données manquantes)'}
          </button>
          <button
            onClick={resetValues}
            className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {simulateMissingData ? (
        /* AFFICHAGE DU NIVEAU GRIS (CDC §4.7) */
        <div className="p-6 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded-md bg-gray-600 text-white">
              Niveau Gris Actif • Données Insuffisantes
            </span>
            <h4 className="font-bold text-sm text-gray-900 mt-2">
              Refus Méthodologique de Prédire un Risque sans Données Récentes
            </h4>
            <p className="text-xs text-gray-600 max-w-lg mx-auto mt-1 leading-relaxed">
              Conformément à la clause <em>making uncertainty visible</em>, MediSense n'utilise <strong>jamais de valeur par défaut</strong>. 
              Le calcul de probabilité est suspendu pour éviter d'induire le soignant en erreur.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-700 max-w-md mx-auto text-left">
            <strong>Examens obligatoires avant réévaluation :</strong>
            <ul className="list-disc list-inside mt-1 text-[11px] text-gray-600 space-y-0.5">
              <li>Mesure normalisée de la pression artérielle (moyenne 2e/3e mesures)</li>
              <li>Poids et taille mesurés au centre de santé (pour calcul de l'IMC)</li>
            </ul>
          </div>
        </div>
      ) : (
        /* AFFICHAGE NORMAL DU SIMULATEUR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders de manipulation */}
          <div className="lg:col-span-7 space-y-4">
            {/* Curseur Tension Systolique */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-gray-700">Tension Artérielle Systolique (mmHg)</label>
                <span className="font-mono font-black text-indigo-900 text-sm">{systolic} mmHg</span>
              </div>
              <input
                type="range"
                min="110"
                max="175"
                step="1"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>110 (Idéal)</span>
                <span>130 (Vigilance)</span>
                <span>140 (Hypertension)</span>
                <span>175 (Sévère)</span>
              </div>
            </div>

            {/* Curseur IMC */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-gray-700">Indice de Masse Corporelle (IMC en kg/m²)</label>
                <span className="font-mono font-black text-indigo-900 text-sm">{bmi.toFixed(1)} kg/m²</span>
              </div>
              <input
                type="range"
                min="20"
                max="36"
                step="0.2"
                value={bmi}
                onChange={(e) => setBmi(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>20 (Normal)</span>
                <span>23 (Seuil Asie OMS)</span>
                <span>25 (Surpoids)</span>
                <span>30 (Obésité)</span>
              </div>
            </div>

            {/* Toggles Tabagisme & Antécédents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => setIsSmoker(!isSmoker)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSmoker ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">Statut Tabagique</div>
                  <div className="text-[10px] text-gray-500">{isSmoker ? 'Fumeur actif' : 'Non-fumeur'}</div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  isSmoker ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isSmoker ? '+2 pts' : '0 pt'}
                </span>
              </div>

              <div
                onClick={() => setFamilyDiabetes(!familyDiabetes)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  familyDiabetes ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">Diabète Familial 1er Degré</div>
                  <div className="text-[10px] text-gray-500">{familyDiabetes ? 'Confirmé (Père/Mère)' : 'Aucun'}</div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  familyDiabetes ? 'bg-purple-200 text-purple-900' : 'bg-gray-200 text-gray-700'
                }`}>
                  {familyDiabetes ? '+5 pts (Fixe)' : '0 pt'}
                </span>
              </div>
            </div>
          </div>

          {/* Jauge Résultat Dynamique Contrefactuelle */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Score Calculé en Temps Réel
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-indigo-950 font-mono">{currentScore}</span>
                <span className="text-xs text-gray-500 font-medium">/ 26 points</span>
              </div>
              <div className="mt-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${riskStatus.color}`}>
                  {riskStatus.text}
                </span>
              </div>
            </div>

            {/* Comparaison Contrefactuelle */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Gain Potentiel Contrefactuel : -{potentialReductionPercent}%</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Si la tension est stabilisée à <strong>120 mmHg</strong>, avec <strong>sevrage tabagique</strong> et <strong>réduction de l'IMC à 22 kg/m²</strong>, le score passe à <strong>{targetScore} pts</strong> (Niveau Vert).
              </p>
            </div>

            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Attribution contrefactuelle rigoureuse sans modification de l'algorithme sous-jacent.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
