import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Volume2,
  Phone,
  Navigation,
  FileText,
  X,
  Share2,
} from 'lucide-react';
import { TriageResult, LocalLanguage } from '../types';
import { LANGUAGES } from '../data/mockData';

interface TriageResultCardProps {
  result: TriageResult;
  currentLang: LocalLanguage;
  onClose: () => void;
  onSelectTeleconsult: () => void;
  onViewFacilities: () => void;
}

export const TriageResultCard: React.FC<TriageResultCardProps> = ({
  result,
  currentLang,
  onClose,
  onSelectTeleconsult,
  onViewFacilities,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const langInfo = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const getUrgencyConfig = () => {
    switch (result.urgency) {
      case 'ROUGE':
        return {
          bg: 'bg-gradient-to-br from-medired-700 to-medired-900',
          badgeBg: 'bg-white/20 text-white',
          border: 'border-medired-500',
          title: 'CAS ROUGE — URGENCE VITALE (10%)',
          sub: 'Attention immédiate requise. Transfert d\'urgence à l\'hôpital le plus proche.',
          icon: <Flame className="w-8 h-8 text-white" />,
        };
      case 'ORANGE':
        return {
          bg: 'bg-gradient-to-br from-mediorange-700 to-mediorange-900',
          badgeBg: 'bg-white/20 text-white',
          border: 'border-mediorange-500',
          title: 'CAS ORANGE — MODÉRÉ (20%)',
          sub: 'Nécessite une attention médicale sous 24h à 48h. Téléconsultation recommandée.',
          icon: <AlertTriangle className="w-8 h-8 text-white" />,
        };
      case 'VERT':
      default:
        return {
          bg: 'bg-gradient-to-br from-medigreen-700 to-medigreen-800',
          badgeBg: 'bg-white/20 text-white',
          border: 'border-medigreen-500',
          title: 'CAS VERT — LÉGER (70%)',
          sub: 'Symptômes bénins. Conseils d\'auto-soins et orientation pharmacie partenaire.',
          icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        };
    }
  };

  const config = getUrgencyConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* En-tête Statut Coloré */}
        <div className={`${config.bg} p-6 sm:p-8 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className="p-2.5 rounded-2xl bg-white/15 backdrop-blur">{config.icon}</span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              {config.title}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-2">{result.conditionName}</h2>
          <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl">{config.sub}</p>

          {result.ruleBasedOverride && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 text-xs font-semibold backdrop-blur">
              <span>🛡️ Déclenché par règle clinique déterministe PCIME / TETU</span>
            </div>
          )}
        </div>

        {/* Corps */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Lecture Audio dans la Langue Locale */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-12 h-12 rounded-2xl bg-medigreen-700 hover:bg-medigreen-800 text-white flex items-center justify-center shadow-md shadow-medigreen-700/20 transition active:scale-95"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <div>
                <div className="text-xs font-bold text-gray-500">
                  Synthèse Vocale (Meta MMS-TTS)
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {isPlayingAudio
                    ? `Lecture en cours en ${langInfo.name}...`
                    : `Écouter les consignes en ${langInfo.name}`}
                </div>
                <div className="text-xs text-gray-400 italic">
                  « {result.adviceLocalLanguage} »
                </div>
              </div>
            </div>
          </div>

          {/* Recommandations Cliniques en Français */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-medigreen-700" />
              <span>Consignes d'Action Immédiate :</span>
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-gray-200 text-sm text-gray-800 leading-relaxed font-medium">
              {result.adviceFrench}
            </div>
          </div>

          {/* Explication XAI (Transparence Médicale) */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="text-xs font-bold text-purple-900 mb-1">
              🔍 Explication Clinique de l'IA (SHAP / LIME) :
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
              {result.xaiExplanation} • Code OMS indicatif :{' '}
              <span className="font-mono font-bold">{result.icd10Code}</span>
            </p>
          </div>

          {/* Actions Immédiates selon Gravité */}
          <div className="pt-2">
            {result.urgency === 'ROUGE' && (
              <div className="space-y-3">
                <button
                  onClick={() => alert("📞 Appel d'urgence SAMU Bénin (112) en cours...")}
                  className="w-full py-4 px-6 rounded-2xl bg-medired-700 hover:bg-medired-800 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-medired-700/30 transition active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>Appeler le SAMU Bénin (112)</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onViewFacilities}
                    className="py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Hôpital le plus proche</span>
                  </button>
                  <button
                    onClick={() => alert('📍 Position GPS transmise aux contacts d\'urgence !')}
                    className="py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Share2 className="w-4 h-4 text-orange-600" />
                    <span>Partager GPS au proche</span>
                  </button>
                </div>
              </div>
            )}

            {result.urgency === 'ORANGE' && (
              <div className="space-y-3">
                <button
                  onClick={onSelectTeleconsult}
                  className="w-full py-4 px-6 rounded-2xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-medigreen-700/25 transition active:scale-95"
                >
                  <span>Prendre une Téléconsultation Vidéo (1 000 - 2 000 FCFA)</span>
                </button>
                <button
                  onClick={onViewFacilities}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Navigation className="w-4 h-4 text-medigreen-700" />
                  <span>Voir les Centres de Santé à proximité</span>
                </button>
              </div>
            )}

            {result.urgency === 'VERT' && (
              <div className="space-y-3">
                <button
                  onClick={onViewFacilities}
                  className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-teal-700/25 transition active:scale-95"
                >
                  <span>Trouver une Pharmacie Partenaire Proche</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs transition"
                >
                  Fermer et revenir à l'accueil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
