import React from 'react';
import { MediSenseTab } from './NavigationTabs';
import { Users, Stethoscope, ShieldCheck, HeartHandshake, BarChart3, AlertCircle } from 'lucide-react';

interface UnifiedTopBarProps {
  activeTab: MediSenseTab;
  onSelectTab: (tab: MediSenseTab) => void;
  selectedPersonaName?: string;
  currentLang: 'ar' | 'en';
  onToggleLang: (lang: 'ar' | 'en') => void;
  onSosClick?: () => void;
}

export const UnifiedTopBar: React.FC<UnifiedTopBarProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  onToggleLang,
  onSosClick
}) => {
  const tabs = [
    { id: 'population' as MediSenseTab, label: 'Population', icon: Users, sub: 'Sprio' },
    { id: 'clinical' as MediSenseTab, label: 'Fiche Clinique', icon: Stethoscope, sub: 'Soignant' },
    { id: 'safeguards' as MediSenseTab, label: 'Garde-fous', icon: ShieldCheck, sub: 'Wilson 95%' },
    { id: 'engagement' as MediSenseTab, label: 'Consentement', icon: HeartHandshake, sub: 'Choix' },
    { id: 'benchmark' as MediSenseTab, label: 'Banc d’Essai', icon: BarChart3, sub: '50k' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="MediSense"
            className="w-8 h-8 rounded-xl shadow-xs object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                MediSense
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden sm:inline">
                DoH Abu Dhabi
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden lg:block">
              Prévention & Dépistage de Précision • CareX
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Sleek, fluid, no wrap, compact on small screens */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: SOS E0 + Clean language toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onSosClick && (
            <button
              onClick={onSosClick}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition active:scale-95 shrink-0"
              title="Urgence vitale immédiate - Règle d’échappement E0"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden xs:inline">SOS</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => onToggleLang('ar')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs transition ${
                currentLang === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs transition ${
                currentLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>

          <span className="hidden xl:inline-flex text-[11px] font-semibold text-slate-400 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
            MBZUAI • 2026
          </span>
        </div>
      </div>
    </header>
  );
};
