import React, { useState } from 'react';
import { MediSenseTab } from './NavigationTabs';
import { Award, ChevronRight, ChevronLeft, Minimize2, Maximize2 } from 'lucide-react';

interface FloatingDemoControllerProps {
  onNavigateStep: (tab: MediSenseTab, personaIndex?: number) => void;
}

export const FloatingDemoController: React.FC<FloatingDemoControllerProps> = ({
  onNavigateStep
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const steps = [
    {
      step: 1,
      duration: '1m',
      title: 'Consentement & Journal',
      tab: 'engagement' as MediSenseTab,
      personaIndex: 0,
      objective: 'Montrer les 5 finalités de consentement et le journal d’usage des données.'
    },
    {
      step: 2,
      duration: '1m30',
      title: 'Persona 1 : Zayd (18m)',
      tab: 'clinical' as MediSenseTab,
      personaIndex: 0,
      objective: 'WCV 18m manquée, anémie, M-CHAT score 5. CarePlan unifié au centre Al Bateen.'
    },
    {
      step: 3,
      duration: '1m',
      title: 'Persona 2 : Mariam (14a)',
      tab: 'clinical' as MediSenseTab,
      personaIndex: 1,
      objective: 'IMC +2.3 (P8), rappel HPV manqué (P11), antécédent familial HF (P10).'
    },
    {
      step: 4,
      duration: '2m',
      title: 'Persona 3 : Rajesh (36a)',
      tab: 'clinical' as MediSenseTab,
      personaIndex: 2,
      objective: 'FINDRISC 15, IMC Asie, signal G1 simulé, OMS hors domaine, Sprio exclu.'
    },
    {
      step: 5,
      duration: '1m',
      title: 'Choix Réel & Scan QR',
      tab: 'engagement' as MediSenseTab,
      personaIndex: 0,
      objective: 'Aides à la décision Arabe/Anglais, arrêt des relances, scan QR au centre.'
    },
    {
      step: 6,
      duration: '1m30',
      title: 'Garde-fous & 50k Benchmark',
      tab: 'safeguards' as MediSenseTab,
      personaIndex: 0,
      objective: 'Masquage n < 10, intervalles de Wilson 95%, alertes C1/C3, gain x4.02.'
    }
  ];

  const currentStep = steps[currentStepIndex];

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    const target = steps[index];
    onNavigateStep(target.tab, target.personaIndex);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold shadow-xl border border-slate-700/70 hover:bg-slate-800 transition active:scale-95"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Démo Jury ({currentStepIndex + 1}/6)</span>
          <Maximize2 className="w-3 h-3 text-slate-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md w-full animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-400/20 text-amber-400">
              <Award className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Parcours Démo Jury (8 min)
            </span>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
            title="Minimiser le contrôleur"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Étape active */}
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-100 truncate">
            {currentStep.step}. {currentStep.title}
          </h4>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            {currentStep.duration}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          {currentStep.objective}
        </p>

        {/* Contrôles pas-à-pas */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <div className="flex gap-1">
            {steps.map((st, idx) => (
              <button
                key={st.step}
                onClick={() => goToStep(idx)}
                className={`w-5 h-5 rounded text-[10px] font-bold transition ${
                  idx === currentStepIndex
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st.step}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrev}
              className={`p-1 rounded border text-xs ${
                currentStepIndex === 0
                  ? 'border-slate-800 text-slate-600'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentStepIndex === steps.length - 1}
              onClick={handleNext}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${
                currentStepIndex === steps.length - 1
                  ? 'bg-slate-800 text-slate-600'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer active:scale-95'
              }`}
            >
              <span>Suivant</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
