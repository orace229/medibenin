import React, { useState } from 'react';
import {
  Mic,
  Thermometer,
  ShieldAlert,
  Users,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { PatientProfile, DangerSignsPCIME, TriageResult, LocalLanguage } from '../types';
import { LANGUAGES } from '../data/mockData';

interface HeroTriageProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  currentLang: LocalLanguage;
  onOpenVoiceModal: () => void;
  onTriageComputed: (result: TriageResult) => void;
}

export const HeroTriage: React.FC<HeroTriageProps> = ({
  patient,
  onUpdatePatient,
  currentLang,
  onOpenVoiceModal,
  onTriageComputed,
}) => {
  const [symptomText, setSymptomText] = useState('');
  const [temperature, setTemperature] = useState<number>(38.5);
  const [hasPhoto, setHasPhoto] = useState(false);

  const [dangerSigns, setDangerSigns] = useState<DangerSignsPCIME>({
    cannotDrinkOrBreastfeed: false,
    vomitsEverything: false,
    convulsions: false,
    lethargicOrUnconscious: false,
  });

  const langInfo = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const handleComputeTriage = (customText?: string) => {
    const textToEvaluate = customText || symptomText || 'Fièvre et fatigue';
    const hasDangerSign =
      dangerSigns.cannotDrinkOrBreastfeed ||
      dangerSigns.vomitsEverything ||
      dangerSigns.convulsions ||
      dangerSigns.lethargicOrUnconscious;

    let result: TriageResult;

    // Règle Absolue 1 : Signe de danger PCIME ou Hyperthermie >= 39.5 -> CAS ROUGE
    if (hasDangerSign || temperature >= 39.5) {
      result = {
        id: `TRG-${Date.now()}`,
        patientName: patient.name,
        urgency: 'ROUGE',
        conditionName: 'Urgence Pédiatrique Majeure (PCIME)',
        icd10Code: 'R56.0',
        adviceFrench:
          'URGENCE VITALE : Signe général de danger détecté ou hyperthermie critique. Conduisez immédiatement le malade à l\'hôpital le plus proche. Ne forcez pas l\'alimentation s\'il est somnolent.',
        adviceLocalLanguage:
          'ALODO SYƐNSYƐN ! Vi mitɔn ɖo tagba mɛ. Mi hɛn yi dotoxwe klewun !',
        recommendedFacility: 'CHU-MEL Cotonou (Urgences)',
        xaiExplanation:
          'Déclenché par règle déterministe PCIME (Danger général présent) et/ou température critique (≥39.5°C).',
        ruleBasedOverride: true,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (
      temperature >= 38.5 ||
      textToEvaluate.toLowerCase().includes('fièvre') ||
      textToEvaluate.toLowerCase().includes('palu') ||
      textToEvaluate.toLowerCase().includes('frisson')
    ) {
      result = {
        id: `TRG-${Date.now()}`,
        patientName: patient.name,
        urgency: 'ORANGE',
        conditionName: 'Suspicions Paludisme Simple / Accès Fébrile',
        icd10Code: 'B54',
        adviceFrench:
          'Consultation médicale impérative sous 24h à 48h dans un centre de santé ou via téléconsultation. Hydratez abondamment le malade avec de l\'eau propre.',
        adviceLocalLanguage:
          'Mi ɖo na mɔ doto ɖo azan we gblamɛ bo na d’alɔ palu tɔn.',
        recommendedFacility: 'Centre de Santé de Calavi Centre',
        xaiExplanation:
          'Suspicion de paludisme : association d\'un accès fébrile et céphalées/courbatures en zone endémique.',
        ruleBasedOverride: false,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      result = {
        id: `TRG-${Date.now()}`,
        patientName: patient.name,
        urgency: 'VERT',
        conditionName: 'Affection Légère / État Fébrile Bénin',
        icd10Code: 'R53',
        adviceFrench:
          'Symptômes bénins. Repos, alimentation légère et conseils auprès de votre pharmacien partenaire. Surveillez l\'apparition de tout nouveau symptôme.',
        adviceLocalLanguage: 'Nuɖe syɛn ɖe a. Gbɔjɛ bo nu sin ganji.',
        recommendedFacility: 'Pharmacie Akassato Calavi',
        xaiExplanation:
          'Aucun signe de danger général PCIME ni drapeau rouge clinique détecté. Prise en charge ambulatoire simple.',
        ruleBasedOverride: false,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    onTriageComputed(result);
  };

  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fiche Patient Actif avec Switch "Pour moi / Pour un proche" */}
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-medigreen-50 text-medigreen-700 flex items-center justify-center font-bold text-lg border border-medigreen-200">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-gray-900">{patient.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-earth-500/10 text-earth-700 font-bold">
                  {patient.isRelative ? '👨‍👩‍👧 Rempli pour un proche' : '👤 Pour moi-même'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {patient.age} ans • {patient.gender === 'M' ? 'Masculin' : 'Féminin'} • {patient.commune} ({patient.departement})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={patient.isRelative}
                onChange={(e) => onUpdatePatient({ ...patient, isRelative: e.target.checked })}
                className="w-4 h-4 text-medigreen-700 rounded focus:ring-medigreen-500"
              />
              <span>C'est pour un enfant ou un parent</span>
            </label>
          </div>
        </div>

        {/* Grille Principale : Hero Vocal & Modes de saisie */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne Gauche : Le Gros Bouton Vocal "Grand-Mère" (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-medigreen-700 via-medigreen-800 to-medigreen-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-medigreen-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold mb-4">
                <span>{langInfo.flag}</span>
                <span>Mode Vocal Interactif en {langInfo.name}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
                Décrivez vos symptômes à la voix
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium max-w-lg mb-8">
                « Conçu pour que toute personne, même sans savoir lire ou écrire, puisse obtenir un premier avis médical instantané. »
              </p>

              {/* Bouton Géant Tactile */}
              <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
                <button
                  onClick={onOpenVoiceModal}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white hover:bg-gray-100 text-medigreen-800 flex flex-col items-center justify-center shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition group"
                >
                  <Mic className="w-10 h-10 mb-1 group-hover:scale-110 transition text-medigreen-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-medigreen-800">
                    Parler
                  </span>
                </button>

                <div className="text-center sm:text-left">
                  <div className="font-extrabold text-lg text-white">Touchez le micro pour parler</div>
                  <div className="text-xs text-white/80 mt-1">
                    Meta MMS (reconnaissance vocale) + AfriNLLB (traduction)
                  </div>
                  <div className="text-xs text-emerald-300 font-semibold mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Réponse clinique en 15 à 30 secondes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Décoration de fond */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
          </div>

          {/* Colonne Droite : Paramètres Cliniques & PCIME (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-medigreen-700" />
                <span>Indicateurs & Signes PCIME</span>
              </h3>
              <span className="text-xs font-bold text-gray-400">Étape 2/2</span>
            </div>

            {/* Thermomètre Interactif */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-medired-700" />
                  <span>Température Corporelle :</span>
                </span>
                <span
                  className={`text-xl font-black ${
                    temperature >= 39.5
                      ? 'text-medired-700'
                      : temperature >= 38.5
                      ? 'text-mediorange-700'
                      : 'text-medigreen-700'
                  }`}
                >
                  {temperature.toFixed(1)} °C
                </span>
              </div>
              <input
                type="range"
                min="35.0"
                max="42.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-medigreen-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                <span>35.0° (Normal)</span>
                <span>38.5° (Fièvre)</span>
                <span>39.5° (Urgence)</span>
              </div>
            </div>

            {/* Checklist 4 Signes Généraux de Danger PCIME */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-earth-700 uppercase tracking-wider mb-2.5">
                <ShieldAlert className="w-4 h-4 text-earth-500" />
                <span>4 Signes Généraux de Danger (0 - 5 ans) :</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800 transition">
                  <input
                    type="checkbox"
                    checked={dangerSigns.cannotDrinkOrBreastfeed}
                    onChange={(e) =>
                      setDangerSigns({ ...dangerSigns, cannotDrinkOrBreastfeed: e.target.checked })
                    }
                    className="w-4 h-4 text-medired-700 rounded focus:ring-medired-500"
                  />
                  <span>Incapable de boire ou de téter</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800 transition">
                  <input
                    type="checkbox"
                    checked={dangerSigns.vomitsEverything}
                    onChange={(e) =>
                      setDangerSigns({ ...dangerSigns, vomitsEverything: e.target.checked })
                    }
                    className="w-4 h-4 text-medired-700 rounded focus:ring-medired-500"
                  />
                  <span>Vomit absolument tout ce qu'il avale</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800 transition">
                  <input
                    type="checkbox"
                    checked={dangerSigns.convulsions}
                    onChange={(e) =>
                      setDangerSigns({ ...dangerSigns, convulsions: e.target.checked })
                    }
                    className="w-4 h-4 text-medired-700 rounded focus:ring-medired-500"
                  />
                  <span>A eu des convulsions pendant la maladie</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800 transition">
                  <input
                    type="checkbox"
                    checked={dangerSigns.lethargicOrUnconscious}
                    onChange={(e) =>
                      setDangerSigns({ ...dangerSigns, lethargicOrUnconscious: e.target.checked })
                    }
                    className="w-4 h-4 text-medired-700 rounded focus:ring-medired-500"
                  />
                  <span>Léthargique ou inconscient (ne réagit pas)</span>
                </label>
              </div>
            </div>

            {/* Saisie texte d'appoint */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>Précisions écrites ou photo (optionnel) :</span>
                </span>
                <button
                  type="button"
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border transition ${
                    hasPhoto
                      ? 'bg-medigreen-50 text-medigreen-700 border-medigreen-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>{hasPhoto ? 'Photo ajoutée' : 'Ajouter photo'}</span>
                </button>
              </div>
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="Ex: Maux de tête violents, frissons depuis 2 jours, grande fatigue..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-medigreen-500 bg-white"
                rows={2}
              ></textarea>
            </div>

            {/* Bouton de Triage Final */}
            <button
              onClick={() => handleComputeTriage()}
              className="w-full py-4 px-6 rounded-2xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-medigreen-700/25 transition active:scale-95"
            >
              <span>Lancer le Triage Clinique</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
