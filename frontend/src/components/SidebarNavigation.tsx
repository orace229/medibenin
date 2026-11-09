import React from 'react';
import { MediSenseTab } from './NavigationTabs';
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  HeartHandshake, 
  BarChart3, 
  AlertCircle, 
  PanelLeftClose
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface SidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MediSenseTab;
  onSelectTab: (tab: MediSenseTab) => void;
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  onSosClick: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentLang,
  onToggleLang,
  onSosClick
}) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    {
      id: 'population' as MediSenseTab,
      label: t.nav.population.title,
      sub: t.nav.population.sub,
      icon: Users,
      badge: t.nav.population.badge
    },
    {
      id: 'clinical' as MediSenseTab,
      label: t.nav.clinical.title,
      sub: t.nav.clinical.sub,
      icon: Stethoscope,
      badge: t.nav.clinical.badge
    },
    {
      id: 'safeguards' as MediSenseTab,
      label: t.nav.safeguards.title,
      sub: t.nav.safeguards.sub,
      icon: ShieldCheck,
      badge: t.nav.safeguards.badge
    },
    {
      id: 'engagement' as MediSenseTab,
      label: t.nav.engagement.title,
      sub: t.nav.engagement.sub,
      icon: HeartHandshake,
      badge: t.nav.engagement.badge
    },
    {
      id: 'benchmark' as MediSenseTab,
      label: t.nav.benchmark.title,
      sub: t.nav.benchmark.sub,
      icon: BarChart3,
      badge: t.nav.benchmark.badge
    }
  ];

  const handleSelect = (tab: MediSenseTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Backdrop sombre flouté */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Tiroir latéral gauche (Drawer) */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-88 bg-white border-r border-slate-200/90 shadow-2xl flex flex-col justify-between
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header du tiroir */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MediSense"
                className="w-9 h-9 rounded-xl shadow-xs object-contain"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    {t.brand.title}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    {t.brand.dohBadge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {t.sidebar.challengeSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition active:scale-95"
              title="Fermer le menu"
            >
              <PanelLeftClose className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Liste des modules - Pleine largeur, texte jamais coupé */}
          <div className="p-3 space-y-1.5">
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.nav.menuTitle}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group
                    ${isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`
                      p-2 rounded-lg transition shrink-0
                      ${isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900'}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">
                        {item.label}
                      </div>
                      <div className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
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

        {/* Bas du tiroir : SOS + Langue + Roster */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/60">
          {/* Touche SOS Urgence Vitale */}
          <button
            onClick={() => {
              onSosClick();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 transition active:scale-98 group"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">{t.sidebar.sosLabel}</div>
                <div className="text-[10px] text-rose-600 leading-tight">{t.sidebar.sosRule}</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-rose-200/80 text-rose-900">
              112
            </span>
          </button>

          {/* Langue & Challenge */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            {/* Bascule FR / EN */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold">
              <button
                onClick={() => onToggleLang('fr')}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  currentLang === 'fr' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onToggleLang('en')}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  currentLang === 'en' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-700">MBZUAI • 2026</div>
              <div className="text-[9px] text-slate-400">{t.sidebar.footerCity}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
