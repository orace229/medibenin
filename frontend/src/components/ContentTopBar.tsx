import React from 'react';
import { MediSenseTab } from './NavigationTabs';
import { Menu, Stethoscope, Users, ShieldCheck, HeartHandshake, BarChart3 } from 'lucide-react';
import { PersonaProfile } from '../types/medisense';

interface ContentTopBarProps {
  activeTab: MediSenseTab;
  onOpenMobileSidebar: () => void;
  selectedPersona?: PersonaProfile;
  personas?: PersonaProfile[];
  onSelectPersona?: (p: PersonaProfile) => void;
}

export const ContentTopBar: React.FC<ContentTopBarProps> = ({
  activeTab,
  onOpenMobileSidebar,
  selectedPersona,
  personas,
  onSelectPersona
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'population':
        return {
          title: 'Priorisation de la Population & Créneaux',
          breadcrumb: 'Console Coordinateur de Santé Publique',
          icon: Users
        };
      case 'clinical':
        return {
          title: 'Fiche Clinique & Arbres Décisionnels',
          breadcrumb: 'Console Praticien (Médecin / Infirmier)',
          icon: Stethoscope
        };
      case 'safeguards':
        return {
          title: 'Garde-fous, Masquage n<10 & Intervalles de Wilson',
          breadcrumb: 'Console Gouvernance & Équité Sanitaire',
          icon: ShieldCheck
        };
      case 'engagement':
        return {
          title: 'Consentement Éclairé & Choix Réel',
          breadcrumb: 'Portail Patient & Aides à la Décision',
          icon: HeartHandshake
        };
      case 'benchmark':
        return {
          title: 'Banc d’Essai & Évaluation sur 50 000 Profils',
          breadcrumb: 'Validation Scientifique & Détection des Lacunes',
          icon: BarChart3
        };
    }
  };

  const info = getTabInfo();
  const Icon = info.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Ouvrir le menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 hidden sm:flex">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 truncate">
                {info.breadcrumb}
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {info.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Challenge Live Badge & Persona Quick Switch if in Clinical Tab */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'clinical' && personas && onSelectPersona && selectedPersona && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Patient :</span>
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedPersona.id === p.id
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {p.fullName.split(' ')[0]} ({p.ageYears >= 1 ? `${p.ageYears}a` : `${Math.round(p.ageYears * 12)}m`})
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">Défi 04</span>
            <span>Abu Dhabi 2026</span>
          </div>
        </div>
      </div>

      {/* Subheader Persona Bar for small screens when activeTab is clinical */}
      {activeTab === 'clinical' && personas && onSelectPersona && selectedPersona && (
        <div className="lg:hidden px-4 py-2 bg-slate-50/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Dossier :</span>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                selectedPersona.id === p.id
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.fullName} ({p.ageYears >= 1 ? `${p.ageYears}a` : `${Math.round(p.ageYears * 12)}m`})
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
