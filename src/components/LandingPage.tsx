import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Eye, Lock, Layers, Menu, X } from 'lucide-react';
import { useI18n } from '../lib/i18n.tsx';
import {
  MediBeninLogo,
  LanguageSwitch,
  LevelBadge,
  CertaintyBadge,
  StatusChip,
  PassQrCard,
  GlassCard,
} from './MediBeninUI.tsx';
import { UserRole } from '../lib/types.ts';
import heroDoctorPatientImg from '../assets/images/hero_doctor_patient_medisense_1794350858815.jpg';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onQuickRoleEnter: (role: UserRole) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onQuickRoleEnter,
}) => {
  const { locale } = useI18n();
  const isFr = locale === 'fr';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const portals: Array<{ role: UserRole; en: string; fr: string }> = [
    { role: 'patient',      en: 'Patient & Family', fr: 'Patient & Famille' },
    { role: 'clinician',    en: 'Clinician',         fr: 'Médecin' },
    { role: 'coordinator',  en: 'Coordinator',       fr: 'Coordinateur' },
    { role: 'public_health',en: 'Public Health',     fr: 'Santé Publique' },
  ];

  const safeguards = [
    {
      Icon: Eye,
      title: isFr ? 'Incertitude toujours visible' : 'Uncertainty always shown',
      desc: isFr
        ? 'Dossier incomplet → Niveau Gris (jamais un faux Vert).'
        : 'Incomplete record → Level Grey (never a false Green).',
    },
    {
      Icon: Lock,
      title: isFr ? '5 consentements granulaires' : '5 granular consents',
      desc: isFr
        ? 'Retrait immédiat par finalité, journal d\'accès horodaté.'
        : 'Instant purpose withdrawal, real-time Data Usage Log.',
    },
    {
      Icon: Layers,
      title: isFr ? 'Preuves vérifiables' : 'Verifiable evidence',
      desc: isFr
        ? 'Suite d\'acceptance automatisée et benchmark public.'
        : 'Automated acceptance suite and open benchmark.',
    },
  ];

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col selection:bg-[#14A39A]/20 selection:text-[#0B3B3C]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 liquid-glass border-b border-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="focus-visible:outline-none shrink-0">
            <MediBeninLogo />
          </a>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitch />
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold rounded-xl btn-liquid-primary items-center gap-2 cursor-pointer"
            >
              {isFr ? 'Accéder au portail' : 'Access portal'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="sm:hidden p-2 rounded-xl bg-white/80 border border-[#E2E8F0] text-[#0B3B3C] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E2E8F0]/80 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {portals.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onQuickRoleEnter(p.role); }}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#0B3B3C] border border-[#CBD5E1] text-xs font-semibold"
                >
                  {isFr ? p.fr : p.en} →
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onNavigateToLogin(); }}
              className="w-full py-3 rounded-xl btn-liquid-primary text-xs font-semibold flex items-center justify-center gap-2"
            >
              {isFr ? 'Accéder au portail' : 'Access portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* ── SECTION 1: HERO ── */}
      <section
        id="top"
        className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden"
        style={{ perspective: '1400px' }}
      >
        {/* Background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[#041D1E]" />
          <motion.div
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{ opacity: 1, scale: [1.05, 1.1, 1.05] }}
            transition={{ opacity: { duration: 0.9 }, scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={heroDoctorPatientImg}
              alt=""
              className="w-full h-full object-cover object-[72%_center] sm:object-[68%_center]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#041D1E]/94 via-[#041D1E]/60 to-[#041D1E]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041D1E]/80 via-transparent to-[#041D1E]/30" />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-16 sm:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl space-y-6"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-dark text-[11px] font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
              <span>Future Health Digital Innovation Challenge 2026</span>
            </div>

            {/* Title */}
            <h1
              className="font-heading font-bold text-white leading-[1.07] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', textWrap: 'balance' }}
            >
              {isFr ? (
                <>Transformez chaque risque détecté{' '}
                  <span className="font-editorial italic font-normal text-white underline decoration-white/40 decoration-2 underline-offset-8">
                    en une visite accomplie.
                  </span>
                </>
              ) : (
                <>Turn every detected health risk{' '}
                  <span className="font-editorial italic font-normal text-white underline decoration-white/40 decoration-2 underline-offset-8">
                    into a completed preventive visit.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle — one line */}
            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-lg">
              {isFr
                ? 'Règles cliniques publiées · Validation médicale · Pass QR patient · 4 portails dédiés.'
                : 'Published clinical rules · Physician sign-off · Patient QR pass · 4 dedicated portals.'}
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col xs:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-7 py-4 rounded-2xl btn-liquid-primary font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
              >
                {isFr ? 'Accéder au portail' : 'Access portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#portals"
                className="px-6 py-4 rounded-2xl liquid-glass-dark hover:bg-white/20 text-white font-semibold text-sm text-center transition-all"
              >
                {isFr ? 'Voir les 4 portails' : 'View 4 portals'}
              </a>
            </div>

            {/* Quick role entry pills */}
            <div className="pt-1 space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                {isFr ? 'Accès direct :' : 'Direct access:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {portals.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => onQuickRoleEnter(p.role)}
                    className="px-3 py-1.5 rounded-xl liquid-glass-dark hover:bg-white hover:text-[#0B3B3C] text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isFr ? p.fr : p.en} →
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: 4 PORTALS ── */}
      <section id="portals" className="py-16 sm:py-20 bg-white/60 border-y border-[#E2E8F0]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
              {isFr ? '4 portails dédiés' : '4 dedicated portals'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3B3C] font-heading">
              {isFr ? 'Un espace pour chaque acteur, zéro surcharge.' : 'One workspace per role, zero overload.'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                role: 'patient' as UserRole,
                kicker: isFr ? 'PATIENT & FAMILLE' : 'PATIENT & FAMILY',
                title: isFr ? 'Patient & Enfants' : 'Patient & Children',
                desc: isFr
                  ? 'Dossier adulte + enfants affiliés. Pass QR. 5 consentements.'
                  : 'Adult record + affiliated children. QR pass. 5 consents.',
                cta: isFr ? 'Ouvrir →' : 'Open →',
              },
              {
                role: 'clinician' as UserRole,
                kicker: isFr ? 'MÉDECIN' : 'CLINICIAN',
                title: isFr ? 'Médecin / Clinicien' : 'Physician / Clinician',
                desc: isFr
                  ? 'Écran clinique pur. Validation en un clic. Zéro score logistique.'
                  : 'Pure clinical screen. One-click sign-off. No logistics scores.',
                cta: isFr ? 'Ouvrir →' : 'Open →',
              },
              {
                role: 'coordinator' as UserRole,
                kicker: isFr ? 'COORDINATEUR' : 'COORDINATOR',
                title: isFr ? 'Coordinateur de Soins' : 'Care Coordinator',
                desc: isFr
                  ? 'File opérationnelle priorisée. Suivi des relances.'
                  : 'Prioritized outreach queue. Reminder tracking.',
                cta: isFr ? 'Ouvrir →' : 'Open →',
              },
              {
                role: 'public_health' as UserRole,
                kicker: isFr ? 'SANTÉ PUBLIQUE' : 'PUBLIC HEALTH',
                title: isFr ? 'Observatoire Équité' : 'Equity Observatory',
                desc: isFr
                  ? 'Couverture par zone, intervalles Wilson, masquage automatique.'
                  : 'Coverage by zone, Wilson intervals, auto small-group masking.',
                cta: isFr ? 'Ouvrir →' : 'Open →',
              },
            ].map((card) => (
              <GlassCard
                key={card.role}
                glow
                kicker={card.kicker}
                title={card.title}
                description={card.desc}
                ctaLabel={card.cta}
                onClick={() => onQuickRoleEnter(card.role)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: LIVE PREVIEW CARD ── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
              {isFr ? 'Aperçu en direct' : 'Live preview'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3B3C] font-heading leading-tight">
              {isFr ? 'Inspectez l\'interface clinique réelle.' : 'Inspect the real clinical interface.'}
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              {isFr
                ? '53 dossiers synthétiques préconfigurés. Règles cliniques v8 signées. Zéro configuration requise.'
                : '53 pre-loaded synthetic records. Signed clinical rules v8. Zero setup required.'}
            </p>
            <button
              type="button"
              onClick={() => onQuickRoleEnter('clinician')}
              className="px-5 py-3 rounded-2xl btn-liquid-primary text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              {isFr ? 'Ouvrir l\'espace Médecin' : 'Open Clinician Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Static preview card */}
          <GlassCard glow interactive={false} className="space-y-4 !p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14A39A]" />
                <span className="text-xs font-bold text-[#0B3B3C] font-heading uppercase tracking-wider">
                  {isFr ? 'Console Clinique' : 'Clinical Console'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">Rules v8 · Signed</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-[#64748B]">Adult Pathway · Al Bateen Centre</p>
                <h3 className="text-base font-bold text-[#0B3B3C] font-heading">Tariq Al-Nadim · 36 y</h3>
              </div>
              <div className="flex items-center gap-2">
                <LevelBadge level="orange" />
                <CertaintyBadge certainty="medium" />
              </div>
            </div>

            <div className="card-3d rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#0B3B3C]">
                  {isFr ? 'Bilan cardiométabolique préventif' : 'Cardiometabolic Preventive Check'}
                </span>
                <StatusChip state="invited" />
              </div>
              <ul className="text-xs text-[#334155] space-y-1 list-disc ps-4">
                <li>{isFr ? 'Deux lectures PA limite (134/86 mmHg)' : 'Two borderline BP readings (134/86 mmHg)'}</li>
                <li>{isFr ? 'HbA1c recommandé (antécédents familiaux)' : 'HbA1c warranted (family history)'}</li>
              </ul>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs bg-[#0B3B3C] text-white px-3 py-2.5 rounded-xl">
              <span>{isFr ? 'Vue clinique — aucun score logistique affiché' : 'Clinical view only — no logistics scores'}</span>
              <ShieldCheck className="w-4 h-4 shrink-0" />
            </div>

            <PassQrCard code="IFH3692T" facilityName="Al Bateen Healthcare Centre" />
          </GlassCard>
        </div>
      </section>

      {/* ── SECTION 4: SAFEGUARDS (DARK) ── */}
      <section className="py-16 sm:py-20 bg-[#041D1E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                {isFr ? 'Gouvernance & Sécurité' : 'Governance & Safety'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                {isFr
                  ? <>Règles cliniques. <span className="font-editorial italic font-normal underline decoration-white/40 decoration-2 underline-offset-8">IA pour la logistique uniquement.</span></>
                  : <>Published rules drive care. <span className="font-editorial italic font-normal underline decoration-white/40 decoration-2 underline-offset-8">AI supports logistics only.</span></>
                }
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.location.assign('/proof')}
              className="px-5 py-3 rounded-2xl btn-liquid-primary text-xs font-semibold inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {isFr ? 'Preuves & gouvernance' : 'Evidence & governance'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {safeguards.map((s, i) => {
              const IconC = s.Icon;
              return (
                <GlassCard
                  key={i}
                  variant="dark"
                  icon={<IconC className="w-5 h-5" />}
                  title={s.title}
                  description={s.desc}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard glow interactive={false} className="!p-8 sm:!p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-start">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B3B3C] font-heading">
                {isFr ? 'Testez les 4 portails maintenant.' : 'Explore all 4 portals now.'}
              </h2>
              <p className="text-sm text-[#475569]">
                {isFr ? 'Données 100 % synthétiques. Zéro configuration.' : '100% synthetic data. Zero setup.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-7 py-4 rounded-2xl btn-liquid-primary text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shrink-0"
            >
              {isFr ? 'Accéder au portail' : 'Access portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </GlassCard>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] py-6 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MediBeninLogo />
            <span>· Challenge 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/proof" className="font-semibold text-[#0F6B6B] hover:text-[#0B3B3C]">
              {isFr ? 'Preuves & gouvernance' : 'Evidence & governance'}
            </a>
            <LanguageSwitch />
          </div>
        </div>
        <p className="text-center mt-3 text-[11px] text-[#94A3B8]">
          {isFr
            ? 'Prototype indépendant — données 100 % synthétiques — aucune affiliation officielle.'
            : 'Independent prototype — 100% synthetic data — no official affiliation.'}
        </p>
      </footer>
    </div>
  );
};
