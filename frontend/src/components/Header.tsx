import React, { useState } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import { LanguageInfo, LocalLanguage } from '../types';
import { LANGUAGES } from '../data/mockData';

interface HeaderProps {
  currentLang: LocalLanguage;
  onSelectLang: (lang: LocalLanguage) => void;
  onSosClick: () => void;
  onAuditClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  onSosClick,
  onAuditClick,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const activeLangInfo = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MediSense Logo"
            className="w-11 h-11 rounded-2xl shadow-md shadow-medigreen-700/20 object-contain hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-medigreen-800">MEDISENSE</span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-medigreen-50 text-medigreen-700 border border-medigreen-200">
                CareX • Challenge 04
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium hidden md:block">
              Prévention & Dépistage de Précision • Abu Dhabi 2026
            </p>
          </div>
        </div>

        {/* Central Network / Slogan */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Standards DoH / ADPHC • FHIR R4 Ready</span>
        </div>

        {/* Actions : SOS + Langue + Comité Médical */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bouton Comité Médical */}
          <button
            onClick={onAuditClick}
            className="text-xs font-semibold px-3 py-2 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition border border-purple-200 hidden md:flex items-center gap-1.5"
          >
            <span>Espace Audit</span>
          </button>

          {/* Bouton SOS Urgence */}
          <button
            onClick={onSosClick}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-medired-700 hover:bg-medired-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-medired-700/25 transition active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS 112</span>
          </button>

          {/* Menu Langue */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold transition"
            >
              <span>{activeLangInfo.flag}</span>
              <span className="hidden sm:inline">{activeLangInfo.name}</span>
              <Globe className="w-3.5 h-3.5 text-gray-500 ml-0.5" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Langue de consultation
                </div>
                {LANGUAGES.map((lang: LanguageInfo) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      currentLang === lang.code
                        ? 'bg-medigreen-50 text-medigreen-700 font-bold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag}</span>
                      <div className="text-left">
                        <div className="font-semibold">{lang.name}</div>
                        <div className="text-[10px] text-gray-400">{lang.localName}</div>
                      </div>
                    </div>
                    {currentLang === lang.code && (
                      <span className="w-2 h-2 rounded-full bg-medigreen-700"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
