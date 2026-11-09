import React from 'react';
import { MediSenseTab } from './NavigationTabs';
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  HeartHandshake, 
  BarChart3, 
  AlertCircle, 
  X
} from 'lucide-react';

interface SidebarNavigationProps {
  activeTab: MediSenseTab;
  onSelectTab: (tab: MediSenseTab) => void;
  currentLang: 'ar' | 'en';
  onToggleLang: (lang: 'ar' | 'en') => void;
  onSosClick: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  onToggleLang,
  onSosClick,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'population' as MediSenseTab,
      label: 'Priorisation Population',
      sub: 'Score Sprio & Créneaux',
      icon: Users,
      badge: 'Sprio'
    },
    {
      id: 'clinical' as MediSenseTab,
      label: 'Fiche Clinique Individuelle',
      sub: 'Face au praticien',
      icon: Stethoscope,
      badge: 'CDC §5'
    },
    {
      id: 'safeguards' as MediSenseTab,
      label: 'Garde-fous & Équité',
      sub: 'Wilson 95% & Masquage n<10',
      icon: ShieldCheck,
      badge: 'CDC §7'
    },
    {
      id: 'engagement' as MediSenseTab,
      label: 'Consentement & Choix',
      sub: '5 finalités & Aides décision',
      icon: HeartHandshake,
      badge: 'CDC §6'
    },
    {
      id: 'benchmark' as MediSenseTab,
      label: 'Banc d’Essai 50k',
      sub: 'Cohorte synthétique & Équité',
      icon: BarChart3,
      badge: 'CDC §8'
    }
  ];

  const handleItemClick = (tab: MediSenseTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out
        md:translate-x-0
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Section: Brand & Mobile Close */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MediSense"
                className="w-9 h-9 rounded-xl shadow-xs object-contain"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    MediSense
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    DoH
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Prévention de Précision • EAU 2026
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Modules du Défi 04
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group
                    ${isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`
                      p-1.5 rounded-lg transition
                      ${isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'}
                    `}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {item.label}
                      </div>
                      <div className={`text-[10px] truncate leading-tight ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.sub}
                      </div>
                    </div>
                  </div>

                  <span className={`
                    text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ml-2
                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Safety, Language & Challenge info */}
        <div className="p-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
          {/* Urgence Vitale SOS Button */}
          <button
            onClick={onSosClick}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 transition active:scale-98 group"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Urgence Vitale SOS</div>
                <div className="text-[10px] text-rose-600 leading-tight">Règle de sortie E0</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-900">
              112
            </span>
          </button>

          {/* Langue & Challenge Badge */}
          <div className="flex items-center justify-between gap-2 px-1">
            {/* Sélecteur de langue */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold">
              <button
                onClick={() => onToggleLang('ar')}
                className={`px-2.5 py-1 rounded-md transition ${
                  currentLang === 'ar' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => onToggleLang('en')}
                className={`px-2.5 py-1 rounded-md transition ${
                  currentLang === 'en' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-700">MBZUAI • 2026</div>
              <div className="text-[9px] text-slate-400">Abu Dhabi, UAE</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
