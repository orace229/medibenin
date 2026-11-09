import React from 'react';
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  HeartHandshake, 
  BarChart3, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Repeat, 
  UserCheck, 
  Building2,
  Award
} from 'lucide-react';
import { MediSenseTab } from './NavigationTabs';
import { PersonaProfile } from '../types/medisense';
import { SYNTHETIC_PERSONAS } from '../data/personas';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface HomeOverviewViewProps {
  currentLang: Language;
  onNavigate: (tab: MediSenseTab) => void;
  onSelectPersona: (persona: PersonaProfile) => void;
}

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({
  currentLang,
  onNavigate,
  onSelectPersona
}) => {
  const t = TRANSLATIONS[currentLang];
  const h = t.homeView;

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-medigreen-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-medigreen-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge officiel du concours */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-medigreen-300 font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-medigreen-400 animate-pulse" />
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>{h.heroBadge}</span>
          </div>

          {/* Titre Principal */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              MediSense <span className="text-medigreen-400 font-light">•</span> {h.heroTitle}
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-slate-300">
              {h.heroSubtitle}
            </p>
          </div>

          {/* Exposé du Défi & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm leading-relaxed">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{currentLang === 'fr' ? 'Le Constat (Défi 04)' : 'The Challenge (Track 04)'}</span>
              </span>
              <p className="text-slate-300 text-xs sm:text-sm">
                {h.heroProblem}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-medigreen-500/10 border border-medigreen-500/20 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-medigreen-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentLang === 'fr' ? 'La Réponse MediSense' : 'The MediSense Solution'}</span>
              </span>
              <p className="text-slate-200 text-xs sm:text-sm">
                {h.heroSolution}
              </p>
            </div>
          </div>

          {/* Boutons d'Action Rapide */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('clinical')}
              className="px-5 py-3 rounded-xl bg-medigreen-600 hover:bg-medigreen-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-medigreen-600/30 transition active:scale-95 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{h.ctaClinical}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('population')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-medigreen-300" />
              <span>{h.ctaPopulation}</span>
            </button>

            <button
              onClick={() => onNavigate('benchmark')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition active:scale-95 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-indigo-300" />
              <span>{h.ctaBenchmark}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. LES 3 PILIERS D'IMPACT */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-medigreen-700" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {h.pillarsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pilier 1 : x4.02 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-medigreen-700 tracking-tight">
                ×4.02
              </span>
              <span className="p-2 rounded-xl bg-medigreen-50 text-medigreen-700">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">{h.kpiYieldTitle}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{h.kpiYieldSub}</p>
          </div>

          {/* Pilier 2 : 100% Éthique */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
                100%
              </span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Shield className="w-5 h-5" />
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">{h.kpiEthicsTitle}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{h.kpiEthicsSub}</p>
          </div>

          {/* Pilier 3 : Boucle Fermée 8 États */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
                8 {currentLang === 'fr' ? 'États' : 'States'}
              </span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <Repeat className="w-5 h-5" />
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">{h.kpiLoopTitle}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{h.kpiLoopSub}</p>
          </div>
        </div>
      </section>

      {/* 3. LES 5 PORTES D'ENTREE DU PROTOTYPE */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {h.modulesTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {h.modulesSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Carte 1 : Priorisation Population */}
          <div 
            onClick={() => onNavigate('population')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-medigreen-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 group-hover:scale-105 transition">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Score Sprio
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-medigreen-700 transition">
                  {h.modulePopTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {h.modulePopDesc}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition gap-1">
              <span>{h.modulePopAction}</span>
            </div>
          </div>

          {/* Carte 2 : Fiche Clinique Individuelle */}
          <div 
            onClick={() => onNavigate('clinical')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-medigreen-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-medigreen-50 text-medigreen-700 group-hover:scale-105 transition">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-medigreen-700 bg-medigreen-50 px-2 py-0.5 rounded-md">
                  CDC §5
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-medigreen-700 transition">
                  {h.moduleClinTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {h.moduleClinDesc}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-medigreen-700 group-hover:translate-x-1 transition gap-1">
              <span>{h.moduleClinAction}</span>
            </div>
          </div>

          {/* Carte 3 : Garde-fous & Équité */}
          <div 
            onClick={() => onNavigate('safeguards')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-medigreen-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  Wilson 95%
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-medigreen-700 transition">
                  {h.moduleSafeTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {h.moduleSafeDesc}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition gap-1">
              <span>{h.moduleSafeAction}</span>
            </div>
          </div>

          {/* Carte 4 : Choix Éclairé & Consentement */}
          <div 
            onClick={() => onNavigate('engagement')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-medigreen-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  5 Finalités
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-medigreen-700 transition">
                  {h.moduleEngTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {h.moduleEngDesc}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition gap-1">
              <span>{h.moduleEngAction}</span>
            </div>
          </div>

          {/* Carte 5 : Banc d'Essai Synthétique */}
          <div 
            onClick={() => onNavigate('benchmark')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-medigreen-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  50 000 Cohorte
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-medigreen-700 transition">
                  {h.moduleBenchTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {h.moduleBenchDesc}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition gap-1">
              <span>{h.moduleBenchAction}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PERSONAS DU JURY */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-medigreen-700" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {h.personasTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {h.personasSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Persona 1 : Zayd */}
          <div 
            onClick={() => onSelectPersona(SYNTHETIC_PERSONAS[0])}
            className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-200/70 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center shrink-0">
                ZA
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                  {SYNTHETIC_PERSONAS[0].fullName}
                </h3>
                <p className="text-[11px] text-blue-700 font-medium">
                  {h.personaZaydSub}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {h.personaZaydFact}
            </p>
            <div className="pt-2 text-xs font-bold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>{h.personaZaydAction}</span>
            </div>
          </div>

          {/* Persona 2 : Mariam */}
          <div 
            onClick={() => onSelectPersona(SYNTHETIC_PERSONAS[1])}
            className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-200/70 hover:border-purple-500 hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center shrink-0">
                MA
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition">
                  {SYNTHETIC_PERSONAS[1].fullName}
                </h3>
                <p className="text-[11px] text-purple-700 font-medium">
                  {h.personaMariamSub}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {h.personaMariamFact}
            </p>
            <div className="pt-2 text-xs font-bold text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>{h.personaMariamAction}</span>
            </div>
          </div>

          {/* Persona 3 : Rajesh */}
          <div 
            onClick={() => onSelectPersona(SYNTHETIC_PERSONAS[2])}
            className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-200/70 hover:border-emerald-500 hover:shadow-md transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                RA
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  {SYNTHETIC_PERSONAS[2].fullName}
                </h3>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {h.personaRajeshSub}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {h.personaRajeshFact}
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition">
              <span>{h.personaRajeshAction}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GOUVERNANCE & CADRE RÉGLEMENTAIRE */}
      <section className="p-6 rounded-3xl bg-slate-100/90 border border-slate-200/90 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Building2 className="w-4 h-4 text-medigreen-700" />
          <span>{h.governanceTitle}</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          {h.governanceDesc}
        </p>
      </section>
    </div>
  );
};
