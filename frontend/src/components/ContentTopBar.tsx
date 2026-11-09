import React from 'react';
import { MediSenseTab } from './NavigationTabs';
import { 
  PanelLeft, 
  Stethoscope, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { PersonaProfile } from '../types/medisense';

interface ContentTopBarProps {
  activeTab: MediSenseTab;
  onOpenSidebar: () => void;
  selectedPersona?: PersonaProfile;
  personas?: PersonaProfile[];
  onSelectPersona?: (p: PersonaProfile) => void;
  currentLang: 'ar' | 'en';
  onToggleLang: (lang: 'ar' | 'en') => void;
  onSosClick: () => void;
}

export const ContentTopBar: React.FC<ContentTopBarProps> = ({
  activeTab,
  onOpenSidebar,
  selectedPersona,
  personas,
  onSelectPersona,
  currentLang,
  onToggleLang,
  onSosClick
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'population':
        return {
          title: 'Priorisation Population',
          sub: 'Attribution des Créneaux • Sprio',
          icon: Users
        };
      case 'clinical':
        return {
          title: 'Fiche Clinique Individuelle',
          sub: 'Face au praticien • Arbres décisionnels',
          icon: Stethoscope
        };
      case 'safeguards':
        return {
          title: 'Garde-fous & Équité',
          sub: 'Masquage n < 10 & Wilson 95%',
          icon: ShieldCheck
        };
      case 'engagement':
        return {
          title: 'Consentement & Choix Réel',
          sub: '5 finalités & Aides à la décision',
          icon: HeartHandshake
        };
      case 'benchmark':
        return {
          title: 'Banc d’Essai 50k',
          sub: 'Validation scientifique sur 50 000 profils',
          icon: BarChart3
        };
    }
  };

  const info = getTabInfo();
  const Icon = info.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Menu Drawer Toggle + Logo + Active Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Bouton Menu Tiroir Gauche */}
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-xs font-semibold text-xs transition active:scale-95 shrink-0"
            title="Ouvrir les modules du Défi 04"
          >
            <PanelLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Modules</span>
          </button>

          {/* Logo & Titre de page */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {info.title}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden md:inline shrink-0">
                  DoH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                {info.sub}
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Clinical Persona Switcher (Clean, compact, NO scrollbar) */}
        {activeTab === 'clinical' && personas && onSelectPersona && selectedPersona && (
          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            {personas.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              const shortName = p.fullName.split(' ')[0];
              const shortAge = p.ageYears >= 1 ? `${p.ageYears}a` : `${Math.round(p.ageYears * 12)}m`;

              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title={`${p.fullName} (${p.ageYears} ans)`}
                >
                  <span>{shortName}</span>
                  <span className={`text-[10px] ml-1 font-normal ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    ({shortAge})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Actions: SOS + Language Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onSosClick}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition active:scale-95"
            title="Urgence vitale immédiate - Règle de sortie E0"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => onToggleLang('ar')}
              className={`px-2 py-0.5 rounded-md text-[11px] sm:text-xs transition ${
                currentLang === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2 py-0.5 rounded-md text-[11px] sm:text-xs transition ${
                currentLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
