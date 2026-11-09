import React from 'react';
import { Users, Stethoscope, ShieldAlert, HeartHandshake, BarChart3 } from 'lucide-react';

export type MediSenseTab = 'population' | 'clinical' | 'safeguards' | 'engagement' | 'benchmark';

interface NavigationTabsProps {
  activeTab: MediSenseTab;
  onSelectTab: (tab: MediSenseTab) => void;
  selectedPersonaName?: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  selectedPersonaName
}) => {
  const tabs = [
    {
      id: 'population' as MediSenseTab,
      label: '1. Priorisation Population',
      sublabel: 'Coordinateur • Score Sprio',
      icon: Users,
      badge: 'Sprio'
    },
    {
      id: 'clinical' as MediSenseTab,
      label: '2. Fiche Clinique Individuelle',
      sublabel: selectedPersonaName ? `Patient : ${selectedPersonaName}` : 'Médecin • Sprio Interdit',
      icon: Stethoscope,
      badge: 'Clinique'
    },
    {
      id: 'safeguards' as MediSenseTab,
      label: '3. Garde-fous & Équité',
      sublabel: 'Masquage n<10 • Wilson 95%',
      icon: ShieldAlert,
      badge: 'Garde-fous'
    },
    {
      id: 'engagement' as MediSenseTab,
      label: '4. Engagement & Choix',
      sublabel: 'Arabe/Anglais • Choix réel',
      icon: HeartHandshake,
      badge: 'Consentement'
    },
    {
      id: 'benchmark' as MediSenseTab,
      label: '5. Banc d’Essai 50k',
      sublabel: 'MediSense vs Âge/Sexe',
      icon: BarChart3,
      badge: 'Preuve'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-medigreen-700 text-white border-medigreen-700 shadow-sm shadow-medigreen-700/20'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>{tab.label}</span>
                  </div>
                  <div className={`text-[10px] ${isActive ? 'text-medigreen-100' : 'text-gray-400'}`}>
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
