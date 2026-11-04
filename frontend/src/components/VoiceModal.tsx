import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, X } from 'lucide-react';
import { LocalLanguage } from '../types';
import { LANGUAGES } from '../data/mockData';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LocalLanguage;
  onConfirmText: (text: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onConfirmText,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  const langInfo = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const mockTranscriptionFongbe =
    "Vi 3 ans tɔn ce ɖo asɔ yɔyɔ sin zɔn, é gbɛ́ nǔ nu bo ɖo hwi jɛ wɛ sín zǎn mɛ...";
  const mockFrenchTranslation =
    "Mon enfant de 3 ans a une très forte fièvre, refuse de téter et vomit tout depuis cette nuit.";

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setSeconds(0);
      setHasRecorded(false);
    } else {
      setIsRecording(false);
      setHasRecorded(true);
    }
  };

  const handleValidate = () => {
    onConfirmText(mockFrenchTranslation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medigreen-50 text-medigreen-800 text-xs font-bold mb-4">
          <span>{langInfo.flag}</span>
          <span>Saisie Vocale en {langInfo.name}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
          {isRecording ? "Écoute en cours..." : "Parlez librement de vos maux"}
        </h3>
        <p className="text-sm text-gray-500 mb-8">
          « Décrivez simplement ce que vous ressentez, comme devant un médecin au village »
        </p>

        {/* Bouton Micro Central Animé */}
        <div className="flex justify-center my-6">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <div className="absolute w-40 h-40 rounded-full bg-medired-500/20 animate-ping"></div>
            )}
            <button
              onClick={toggleRecording}
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl active:scale-95 ${
                isRecording
                  ? 'bg-medired-700 shadow-medired-700/40'
                  : 'bg-gradient-to-tr from-medigreen-700 to-medigreen-500 shadow-medigreen-700/35 hover:scale-105'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-10 h-10 mb-1" />
                  <span className="text-xs font-bold font-mono">00:{seconds < 10 ? `0${seconds}` : seconds}</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 mb-1" />
                  <span className="text-xs font-bold">Appuyer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Aperçu Transcription & Traduction */}
        {hasRecorded && (
          <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1">
                <Volume2 className="w-3.5 h-3.5 text-medigreen-700" />
                <span>Transcription locale {langInfo.name} (Meta MMS) :</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 italic bg-white p-2.5 rounded-xl border border-gray-100">
                « {mockTranscriptionFongbe} »
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Traduction Pivot Français (AfriNLLB) :</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-900 font-semibold bg-white p-2.5 rounded-xl border border-gray-100">
                « {mockFrenchTranslation} »
              </p>
            </div>

            <button
              onClick={handleValidate}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-bold text-sm shadow-md transition"
            >
              Valider et évaluer la gravité
            </button>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          Module vocal optimisé pour les réseaux faibles (compression audio 2G/3G).
        </div>
      </div>
    </div>
  );
};
