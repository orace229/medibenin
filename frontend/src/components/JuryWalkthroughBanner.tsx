import React, { useState } from 'react';
import { MediSenseTab } from './NavigationTabs';
import { ChevronRight, ChevronLeft, Award } from 'lucide-react';

interface JuryWalkthroughBannerProps {
  onNavigateStep: (tab: MediSenseTab, personaIndex?: number) => void;
}

export const JuryWalkthroughBanner: React.FC<JuryWalkthroughBannerProps> = ({
  onNavigateStep
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const steps = [
    {
      step: 1,
      duration: '1 min',
      title: '1. Consentement & Journal d’Usage',
      tab: 'engagement' as MediSenseTab,
      personaIndex: 0,
      objective: 'Montrer les 5 autorisations granulaires distinctes et le journal d’usage des données (clause authorized data use visible).'
    },
    {
      step: 2,
      duration: '1 min 30',
      title: '2. Persona 1 : Enfant de 18 mois (Zayd)',
      tab: 'clinical' as MediSenseTab,
      personaIndex: 0,
      objective: 'Visite WCV manquée (P3), anémie (P5), autisme M-CHAT-R (P6). Un seul CarePlan unifié au centre Al Bateen.'
    },
    {
      step: 3,
      duration: '1 min',
      title: '3. Persona 2 : Adolescente 14 ans (Mariam)',
      tab: 'clinical' as MediSenseTab,
      personaIndex: 1,
      objective: 'IMC +2,3 (P8), vaccin HPV manqué (P11), antécédent hypercholestérolémie (P10) : prouve l’absence de trou d’âge 6-17 ans et l’accélération sans génomique.'
    },
    {
      step: 4,
      duration: '2 min',
      title: '4. Persona 3 : Adulte 36 ans Asie du Sud (Rajesh)',
      tab: 'clinical' as MediSenseTab,
      personaIndex: 2,
      objective: 'FINDRISC 15 (A3), IMC 24 Asie (A4), signal génomique simulé (G1), OMS hors domaine (< 40 ans). Montre la disparition totale de Sprio en fiche clinique !'
    },
    {
      step: 5,
      duration: '1 min',
      title: '5. Choix Réel & Boucle Fermée QR',
      tab: 'engagement' as MediSenseTab,
      personaIndex: 0,
      objective: 'Aides à la décision courtes en Arabe et Anglais, arrêt immédiat des relances si refus, code d’orientation QR sans identité civile.'
    },
    {
      step: 6,
      duration: '1 min 30',
      title: '6. Garde-fous & Banc d’Essai 50k',
      tab: 'safeguards' as MediSenseTab,
      personaIndex: 0,
      objective: 'Masquage strict des cellules n < 10, intervalles de Wilson 95%, alertes C1/C3, quadruplement du rendement de dépistage vs âge/sexe.'
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

  return (
    <aside aria-label="Mode Démonstration Jury" className="bg-slate-950 text-white border-b border-indigo-900/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Titre & Progression */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-gold-400 text-amber-400 bg-amber-400/10 border border-amber-400/30">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-black text-amber-400">
                  Déroulé Démo Officiel (CDC §11.2 • 8 min)
                </div>
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Étape {currentStep.step}/6 : {currentStep.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({currentStep.duration})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 md:hidden"
            >
              {isExpanded ? 'Réduire' : 'Détails'}
            </button>
          </div>

          {/* Description de l'objectif de l'étape active */}
          {isExpanded && (
            <p className="text-[11px] text-slate-300 max-w-xl text-center md:text-left leading-relaxed hidden lg:block">
              <strong>À démontrer :</strong> {currentStep.objective}
            </p>
          )}

          {/* Contrôles Suivant / Précédent */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrev}
              className={`p-1.5 rounded-lg border text-xs transition ${
                currentStepIndex === 0
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer'
              }`}
              title="Étape précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {steps.map((st, idx) => (
                <button
                  key={st.step}
                  onClick={() => goToStep(idx)}
                  className={`w-6 h-6 rounded-md text-[10px] font-black transition ${
                    idx === currentStepIndex
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.step}
                </button>
              ))}
            </div>

            <button
              disabled={currentStepIndex === steps.length - 1}
              onClick={handleNext}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentStepIndex === steps.length - 1
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer active:scale-95'
              }`}
            >
              <span>Étape suivante</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
