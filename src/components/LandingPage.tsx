import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  Users,
  BarChart3,
  Eye,
  Lock,
  Layers,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
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
// TODO: confirm licence or AI-generation disclosure for hero image
import heroDoctorPatientImg from '../assets/images/hero_doctor_patient_medisense_1794350858815.jpg';
// TODO: confirm licence or AI-generation disclosure for pathway image
import closedLoopPathwayImg from '../assets/images/medisense_closed_loop_pathway_1794353128842.jpg';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onQuickRoleEnter: (role: UserRole) => void;
}

type SectionId = 'top' | 'problem' | 'how-it-works' | 'live-preview' | 'for-whom' | 'responsibility' | 'faq';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onQuickRoleEnter,
}) => {
  const { locale, t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewTab, setPreviewTab] = useState<'clinician' | 'patient' | 'equity'>('clinician');
  const [activeSection, setActiveSection] = useState<SectionId>('top');
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFr = locale === 'fr';
  // Track user scroll to update contextual floating CTA dock and active section
  useEffect(() => {
    const sectionIds: SectionId[] = [
      'top',
      'problem',
      'how-it-works',
      'live-preview',
      'for-whom',
      'responsibility',
      'faq',
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowFloatingDock(scrollY > 420);

      const viewportMid = scrollY + window.innerHeight * 0.38;
      let current: SectionId = 'top';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= viewportMid) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const copy = {
    heroEyebrow: isFr
      ? 'Conçu pour le Future Health Digital Innovation Challenge 2026'
      : 'Built for the Future Health Digital Innovation Challenge 2026',
    heroTitleLead: isFr
      ? 'Transformez chaque risque détecté'
      : 'Turn every detected health risk',
    heroTitleAccent: isFr
      ? 'en une visite préventive accomplie.'
      : 'into a completed preventive visit.',
    heroSubtitle: isFr
      ? 'La plateforme de prévention de précision qui relie règles cliniques publiées, validation médicale humaine et Pass QR patient en une seule visite.'
      : 'The precision prevention platform uniting published clinical rules, physician sign-off, and a patient QR pass into one closed loop.',
    ctaPrimary: isFr ? 'Accéder au portail' : t('accessDashboard'),
    ctaSecondary: isFr ? 'Découvrir l’architecture' : 'Explore the pathway',
  };

  // Grid-based Hero Value GlassCards
  const heroMetrics = [
    {
      kicker: 'COHORT SCALE',
      val: '6,000',
      label: isFr ? 'Profils synthétiques' : 'Synthetic profiles',
      sub: isFr ? 'Reproductibilité totale' : 'Deterministic seed 20261120',
    },
    {
      kicker: 'CLINICAL SAFETY',
      val: isFr ? 'Validation humaine' : 'Human check',
      label: isFr ? 'Médecin avant tout envoi' : 'Physician validation before any message',
      sub: isFr ? 'Zéro décision autonome' : 'Zero autonomous AI routing',
    },
    {
      kicker: 'PATIENT EXPERIENCE',
      val: '1 Visit',
      label: isFr ? 'Visite unique regroupée' : 'Consolidated Care',
      sub: isFr ? 'Zéro parcours dispersé' : 'All checks in one booking',
    },
    {
      kicker: 'TRANSPARENCY',
      val: isFr ? 'Toujours affichée' : 'Always shown',
      label: isFr ? 'Incertitude affichée' : 'Uncertainty always shown',
      sub: isFr ? 'Intervalles de confiance sur chaque indicateur' : 'Confidence intervals on every metric',
    },
  ];

  // Value Propositions in Section 2
  const valuePillars = [
    {
      num: '01 · PRECISION DETECTION',
      title: isFr
        ? 'Détection multidimensionnelle au-delà de l’âge'
        : 'Multidimensional detection beyond age & sex',
      desc: isFr
        ? 'Croisement des antécédents familiaux, de la pédiatrie et des facteurs de risque adaptés avec traçabilité complète.'
        : 'Combines family history, pediatric milestones, and ethnically adapted risk factors with full rule traceability.',
    },
    {
      num: '02 · PROACTIVE OUTREACH',
      title: isFr
        ? 'Relance multilingue proactive sans déclassement'
        : 'Proactive native-language outreach',
      desc: isFr
        ? 'L’IA logistique déclenche un accompagnement renforcé (transport, appel) sans jamais réduire la priorité médicale.'
        : 'Logistics prediction adds support (transport, phone outreach) and never downgrades a patient’s clinical priority.',
    },
    {
      num: '03 · UNIFIED VISIT PASS',
      title: isFr
        ? 'Une visite unique scellée par Pass QR'
        : 'One consolidated visit with a QR Pass',
      desc: isFr
        ? 'Au lieu de 3 convocations dispersées, le patient reçoit un Pass QR unique qui ferme la boucle dès l’admission.'
        : 'Replaces scattered appointments with one unified preventive booking verified at clinic check-in.',
    },
  ];

  // 5-Step Closed-Loop Value Cards
  const fiveVerbs = [
    {
      num: 'STEP 01',
      verb: isFr ? 'Repérer' : 'Identify',
      desc: isFr
        ? 'Règles cliniques explicites et badge de certitude visible.'
        : 'Published clinical rules with visible certainty badges.',
    },
    {
      num: 'STEP 02',
      verb: isFr ? 'Orienter' : 'Route',
      desc: isFr
        ? 'Séparation stricte entre file logistique et écran médecin.'
        : 'Strict separation between logistics and clinical view.',
    },
    {
      num: 'STEP 03',
      verb: isFr ? 'Engager' : 'Engage',
      desc: isFr
        ? 'Invitation multilingue et refus libre sans pénalité.'
        : 'Native-language outreach with penalty-free refusal.',
    },
    {
      num: 'STEP 04',
      verb: isFr ? 'Suivre' : 'Track',
      desc: isFr
        ? 'Pass QR à 8 caractères jusqu’à la visite réalisée.'
        : 'Closed-loop confirmation via 8-character QR pass.',
    },
    {
      num: 'STEP 05',
      verb: isFr ? 'Mesurer' : 'Measure',
      desc: isFr
        ? 'Intervalles de Wilson et masquage automatique des petits groupes.'
        : 'Wilson confidence intervals and automatic small-group masking.',
    },
  ];

  const audiences: Array<{
    role: UserRole;
    kicker: string;
    title: string;
    benefit: string;
    cta: string;
    Icon: React.FC<{ className?: string }>;
  }> = [
    {
      role: 'patient',
      kicker: 'UNIFIED PATIENT & FAMILY PORTAL',
      title: isFr ? 'Portail Patient Unifié & Enfants' : 'Unified Patient & Family Portal',
      benefit: isFr
        ? 'Dossier adulte (IFHAS) + enfants affiliés (< 18 ans) sécurisés par SMS OTP, Pass QR et 5 consentements.'
        : 'Adult IFHAS record + affiliated children (< 18y) secured via SMS OTP, QR visit pass, and 5 consent toggles.',
      cta: isFr ? 'Ouvrir le Portail Patient Unifié' : 'Open Unified Patient Portal',
      Icon: HeartHandshake,
    },
    {
      role: 'clinician',
      kicker: 'CLINICAL WORKBENCH',
      title: isFr ? 'Médecins & Cliniciens' : 'Clinicians',
      benefit: isFr
        ? 'Écran clinique pur (zéro score logistique) avec validation médicale en un clic.'
        : 'Pure clinical screen (zero priority scores) with one-click sign-off.',
      cta: isFr ? 'Ouvrir l’Écran Médecin' : 'Open Clinician View',
      Icon: Stethoscope,
    },
    {
      role: 'coordinator',
      kicker: 'CARE OPERATIONS',
      title: isFr ? 'Coordinateurs de Soins' : 'Care Coordinators',
      benefit: isFr
        ? 'File opérationnelle dédiée pour accompagner chaque patient sans jamais le déclasser.'
        : 'Operational outreach queue that adds support without ever downgrading priority.',
      cta: isFr ? 'Ouvrir la File Coordinateur' : 'Open Coordinator Queue',
      Icon: Users,
    },
    {
      role: 'public_health',
      kicker: 'POPULATION & EQUITY',
      title: isFr ? 'Observatoire Santé Publique' : 'Public Health',
      benefit: isFr
        ? 'Audit d’équité démographique avec masquage automatique des petits effectifs.'
        : 'Live demographic equity audit with automatic small-count masking.',
      cta: isFr ? 'Ouvrir l’Observatoire' : 'Open Observatory',
      Icon: BarChart3,
    },
  ];

  const faqs = [
    {
      q: isFr ? 'MediSense pose-t-il un diagnostic médical ?' : 'Is MediSense an autonomous diagnostic tool?',
      a: isFr
        ? 'Non. Chaque recommandation requiert la validation explicite d’un clinicien.'
        : 'No. Every recommendation requires explicit clinician validation.',
    },
    {
      q: isFr ? 'Pourquoi séparer l’espace Coordinateur de l’espace Médecin ?' : 'Why separate Coordinator and Clinician views?',
      a: isFr
        ? 'Les repères logistiques n’apparaissent jamais devant le médecin.'
        : 'Operational indicators never appear on the physician’s clinical screen.',
    },
    {
      q: isFr ? 'Comment le patient garde-t-il le contrôle de ses données ?' : 'How do patients control their personal health data?',
      a: isFr
        ? 'Chaque patient dispose de 5 interrupteurs de consentement indépendants, révocables instantanément, et d’un journal d’accès horodaté.'
        : 'Patients control 5 independent consent toggles with instant revocation and a real-time, timestamped Data Usage Log.',
    },
    {
      q: isFr ? 'Puis-je tester les 4 portails dédiés immédiatement ?' : 'Can I test all 4 dedicated portals right now?',
      a: isFr
        ? 'Oui. Les 4 espaces sont préconfigurés avec un panel de 53 dossiers issu d’une cohorte synthétique de 6 000 profils.'
        : 'Yes. All 4 workspaces are pre-loaded with a 53-record demo panel from a 6,000-profile synthetic cohort.',
    },
  ];

  const activePreviewRole: UserRole =
    previewTab === 'clinician'
      ? 'clinician'
      : previewTab === 'patient'
      ? 'patient'
      : 'public_health';

  // Contextual Scroll-Following CTA Configuration per active section
  const contextualCtaMap: Record<
    SectionId,
    { badge: string; message: string; primaryLabel: string; primaryAction: () => void; secondaryLabel: string; secondaryAction: () => void }
  > = {
    top: {
      badge: '00 · HERO',
      message: isFr ? 'Prêt à explorer les 4 portails préventifs ?' : 'Ready to explore all 4 preventive portals?',
      primaryLabel: copy.ctaPrimary,
      primaryAction: onNavigateToLogin,
      secondaryLabel: isFr ? 'Essayer Médecin →' : 'Try Clinician →',
      secondaryAction: () => onQuickRoleEnter('clinician'),
    },
    problem: {
      badge: '01 · VALUE PROPOSITION',
      message: isFr
        ? 'Passez d’un dépistage fragmenté à une visite préventive unique.'
        : 'Move from fragmented screening to one unified preventive visit.',
      primaryLabel: isFr ? 'Tester le parcours Patient →' : 'Test Patient Pathway →',
      primaryAction: () => onQuickRoleEnter('patient'),
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    'how-it-works': {
      badge: '02 · CLOSED-LOOP WORKFLOW',
      message: isFr
        ? 'Voyez comment le coordinateur orchestre les 5 étapes en boucle fermée.'
        : 'See how Care Coordinators orchestrate the 5-step closed loop.',
      primaryLabel: isFr ? 'Ouvrir la File Coordinateur →' : 'Open Coordinator Queue →',
      primaryAction: () => onQuickRoleEnter('coordinator'),
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    'live-preview': {
      badge: '03 · LIVE INTERFACE',
      message: isFr
        ? 'Ouvrez directement l’espace que vous êtes en train d’inspecter.'
        : 'Launch the exact workspace you are currently previewing.',
      primaryLabel:
        previewTab === 'clinician'
          ? isFr
            ? 'Lancer l’Espace Médecin →'
            : 'Launch Clinician Workspace →'
          : previewTab === 'patient'
          ? isFr
            ? 'Lancer Portail Famille & Pass QR →'
            : 'Launch Family QR Portal →'
          : isFr
          ? 'Lancer Observatoire Équité →'
          : 'Launch Equity Observatory →',
      primaryAction: () => onQuickRoleEnter(activePreviewRole),
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    'for-whom': {
      badge: '04 · 4 DEDICATED PORTALS',
      message: isFr
        ? '1 Portail Patient Unifié + 3 Espaces Agents de Santé (panel de 53 dossiers).'
        : '1 Unified Patient Portal + 3 Health Agent Workspaces (53-record demo panel).',
      primaryLabel: copy.ctaPrimary,
      primaryAction: onNavigateToLogin,
      secondaryLabel: isFr ? 'Vue Médecin directe →' : 'Direct Clinician View →',
      secondaryAction: () => onQuickRoleEnter('clinician'),
    },
    responsibility: {
      badge: '05 · EVIDENCE & GOVERNANCE',
      message: isFr
        ? 'Consultez les preuves : suite d’acceptance, simulateur et benchmark.'
        : 'Inspect the evidence: acceptance suite, simulator and benchmark.',
      primaryLabel: isFr ? 'Preuves & gouvernance →' : 'Evidence & governance →',
      primaryAction: () => {
        window.location.assign('/proof');
      },
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    faq: {
      badge: '06 · GET STARTED',
      message: isFr
        ? 'Accédez immédiatement aux 4 portails sans configuration.'
        : 'Enter all 4 role portals immediately with zero setup.',
      primaryLabel: copy.ctaPrimary,
      primaryAction: onNavigateToLogin,
      secondaryLabel: isFr ? 'Portail Patient Unifié →' : 'Unified Patient Portal →',
      secondaryAction: () => onQuickRoleEnter('patient'),
    },
  };

  const activeDock = contextualCtaMap[activeSection];

  const navLinks: Array<{ id: SectionId; label: string }> = [
    { id: 'problem', label: isFr ? 'Valeur Clinique' : 'Value Proposition' },
    { id: 'how-it-works', label: isFr ? 'Boucle Fermée' : 'Closed-Loop' },
    { id: 'live-preview', label: isFr ? 'Démonstrateur' : 'Live Preview' },
    { id: 'for-whom', label: isFr ? 'Les 4 Portails' : 'Workspaces' },
    { id: 'responsibility', label: isFr ? 'Gouvernance' : 'Governance' },
    { id: 'faq', label: isFr ? 'FAQ' : 'FAQ' },
  ];

  return (
    <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col selection:bg-[#14A39A]/20 selection:text-[#0B3B3C]">
      {/* =====================================================================
       * STICKY LIQUID GLASS HEADER + MOBILE DRAWER
       * ===================================================================== */}
      <header className="sticky top-0 z-50 liquid-glass border-b border-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-6">
          <a href="#top" className="focus-visible:outline-none shrink-0">
            <MediBeninLogo />
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-[#334155]">
            {navLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'text-[#0F6B6B] font-semibold'
                    : 'hover:text-[#0F6B6B] text-[#475569]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitch />
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="hidden sm:inline-flex px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold rounded-xl btn-liquid-primary items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{copy.ctaPrimary}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2 rounded-xl bg-white/80 border border-[#E2E8F0] text-[#0B3B3C] hover:bg-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Slide-Down Liquid Glass Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[#E2E8F0]/80 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {navLinks.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        activeSection === item.id
                          ? 'bg-[#0B3B3C] text-white'
                          : 'text-[#334155] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {isFr
                      ? 'Accès rapide aux 4 portails :'
                      : 'Instant 4-portal access:'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        {
                          role: 'patient',
                          label: isFr ? 'Patient & Enfants' : 'Patient & Children',
                        },
                        { role: 'clinician', label: isFr ? 'Médecin' : 'Clinician' },
                        { role: 'coordinator', label: isFr ? 'Coordinateur' : 'Coordinator' },
                        { role: 'public_health', label: isFr ? 'Santé Publique' : 'Public Health' },
                      ] as Array<{ role: UserRole; label: string }>
                    ).map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onQuickRoleEnter(r.role);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#0B3B3C] border border-[#CBD5E1] hover:bg-[#0B3B3C] hover:text-white text-xs font-semibold transition-colors"
                      >
                        {r.label} →
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToLogin();
                  }}
                  className="w-full py-3 rounded-xl btn-liquid-primary text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>{copy.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =====================================================================
       * SECTION 1: CLEAN GRID-BASED HERO OVER UNOBSTRUCTED 3D BACKGROUND
       * ===================================================================== */}
      <section
        id="top"
        className="relative min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-between overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-12 lg:pt-18 lg:pb-14"
        style={{ perspective: '1400px' }}
      >
        {/* Full-Bleed 3D Animated Doctor & Patient Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden z-0"
          style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute inset-0 bg-[#041D1E]" />

          <motion.div
            initial={{ scale: 1.07, opacity: 0 }}
            animate={{
              scale: [1.05, 1.11, 1.05],
              rotateX: [0, 2, -1.2, 0],
              rotateY: [-2, 2, -2],
              x: [0, -10, 6, 0],
              y: [0, -8, 5, 0],
              opacity: 1,
            }}
            transition={{
              opacity: { duration: 0.9, ease: 'easeOut' },
              scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
              rotateX: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
              rotateY: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* TODO: confirm licence or AI-generation disclosure for hero image */}
            <img
              src={heroDoctorPatientImg}
              alt="Physician and patient reviewing a personalized preventive care pathway"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[72%_center] sm:object-[68%_center]"
            />
          </motion.div>

          {/* Calibrated Directional Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#041D1E]/94 via-[#041D1E]/62 sm:via-[#041D1E]/56 to-[#041D1E]/25 lg:to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041D1E]/90 via-transparent to-[#041D1E]/35" />

          {/* Subtle 3D Specular Light Ring */}
          <motion.div
            animate={{
              rotateZ: [0, 360],
              rotateX: [62, 68, 62],
              rotateY: [-10, 10, -10],
            }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="hidden sm:block absolute top-1/3 right-[12%] w-[360px] h-[360px] lg:w-[520px] lg:h-[520px] rounded-full border border-[#14A39A]/25 shadow-[0_0_90px_rgba(20,163,154,0.2)]"
          />
        </div>

        {/* Hero 12-Column Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="lg:col-span-7 space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full liquid-glass-dark text-[11px] sm:text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                <span className="truncate">{copy.heroEyebrow}</span>
              </div>

              <h1
                className="font-heading font-bold text-white leading-[1.07] tracking-tight"
                style={{ fontSize: 'clamp(2.1rem, 4.8vw, 4.25rem)', textWrap: 'balance' }}
              >
                {copy.heroTitleLead}{' '}
                <span className="font-editorial italic font-normal text-white underline decoration-white/45 decoration-2 underline-offset-8">
                  {copy.heroTitleAccent}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-xl font-normal">
                {copy.heroSubtitle}
              </p>

              {/* Hero Conversion CTA Group */}
              <div className="flex flex-col xs:flex-row sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl btn-liquid-primary font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
                >
                  <span>{copy.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
                <a
                  href="#problem"
                  className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl liquid-glass-dark hover:bg-white/20 text-white font-semibold text-sm sm:text-base text-center transition-all"
                >
                  {copy.ctaSecondary}
                </a>
              </div>

              {/* Direct 1-Click Role Entry Strip (4 Unified Portals) */}
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/90">
                  {isFr
                    ? 'Accès par profil aux 4 portails dédiés :'
                    : 'Direct access to the 4 dedicated portals:'}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(
                    [
                      {
                        role: 'patient',
                        label: isFr
                          ? 'Portail Patient & Enfants'
                          : 'Patient & Children Portal',
                      },
                      {
                        role: 'clinician',
                        label: isFr ? 'Médecin' : 'Clinician',
                      },
                      {
                        role: 'coordinator',
                        label: isFr ? 'Coordinateur' : 'Coordinator',
                      },
                      {
                        role: 'public_health',
                        label: isFr ? 'Santé Publique' : 'Public Health',
                      },
                    ] as Array<{ role: UserRole; label: string }>
                  ).map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => onQuickRoleEnter(item.role)}
                      className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl liquid-glass-dark hover:bg-white hover:text-[#0B3B3C] text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      {item.label} →
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right 5 columns left open so the Doctor & Patient 3D background shines with zero obstruction */}
            <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
          </div>
        </div>

        {/* Bottom Hero Grid: 4 Dark GlassCards for Immediate Value Proof */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {heroMetrics.map((m, idx) => (
              <GlassCard
                key={idx}
                variant="dark"
                className="!p-3.5 sm:!p-5"
                kicker={m.kicker}
                metric={m.val}
                title={m.label}
                description={m.sub}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * SECTION 2: CORE VALUE PROPOSITIONS IN GLASSCARDS + CONTEXTUAL CTA
       * Clean 3-Column Architectural Grid (No image)
       * ===================================================================== */}
      <section id="problem" className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
              {isFr ? '01 · Proposition de Valeur' : '01 · Core Value Proposition'}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
              {isFr ? (
                <>
                  Trois ruptures décisives pour{' '}
                  <span className="font-editorial italic font-normal text-[#0F6B6B]">
                    ne perdre aucun patient.
                  </span>
                </>
              ) : (
                <>
                  Three decisive shifts so{' '}
                  <span className="font-editorial italic font-normal text-[#0F6B6B]">
                    no patient falls through.
                  </span>
                </>
              )}
            </h2>
          </div>

          {/* Contextual Section CTA #1 */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onQuickRoleEnter('patient')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl btn-liquid-primary text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>
                {isFr
                  ? 'Tester l’expérience Patient en 1 clic'
                  : 'Experience the Patient Journey (1-Click)'}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-[#F2FAF8] text-[#0B3B3C] border border-[#CBD5E1] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {copy.ctaPrimary}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {valuePillars.map((pillar) => (
            <GlassCard
              key={pillar.num}
              glow
              kicker={pillar.num}
              title={pillar.title}
              description={pillar.desc}
            />
          ))}
        </div>
      </section>

      {/* =====================================================================
       * SECTION 3: 5-STEP CLOSED-LOOP ARCHITECTURE IN GLASSCARDS + CONTEXTUAL CTA
       * ===================================================================== */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white/60 border-y border-[#E2E8F0]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
                {isFr ? '02 · Architecture en Boucle Fermée' : '02 · Closed-Loop Architecture'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
                {isFr ? (
                  <>
                    Du drapeau clinique jusqu’au{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      Pass QR confirmé.
                    </span>
                  </>
                ) : (
                  <>
                    From clinical rule trigger to{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      confirmed QR pass.
                    </span>
                  </>
                )}
              </h2>
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                {isFr
                  ? 'Chaque règle déclenchée est vérifiée par un médecin avant de générer un Pass de visite unifié et vérifiable.'
                  : 'Every triggered rule is physician-verified before generating a unified, verifiable visit pass for the patient.'}
              </p>

              {/* Contextual Section CTA #2 */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onQuickRoleEnter('coordinator')}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl btn-liquid-primary text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {isFr
                      ? 'Ouvrir la File Coordinateur'
                      : 'Launch Coordinator Queue'}
                  </span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-xl bg-white p-1.5 sm:p-2">
                {/* TODO: confirm licence or AI-generation disclosure for pathway image */}
                <img
                  src={closedLoopPathwayImg}
                  alt="MediSense 3D Closed-Loop Pathway: Clinical Rule Detection, Physician Validation Console, and Confirmed Patient QR Health Pass"
                  referrerPolicy="no-referrer"
                  className="w-full h-[220px] sm:h-[320px] lg:h-[360px] object-cover rounded-xl sm:rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {fiveVerbs.map((item) => (
              <GlassCard
                key={item.num}
                glow
                kicker={item.num}
                title={item.verb}
                description={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * SECTION 4: DEDICATED LIVE INTERACTIVE SHOWCASE + CONTEXTUAL CTA
       * ===================================================================== */}
      <section id="live-preview" className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
                {isFr ? '03 · Preuve Produit Interactive' : '03 · Interactive Product Proof'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
                {isFr ? (
                  <>
                    Inspectez l’interface réelle{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      sans quitter la page.
                    </span>
                  </>
                ) : (
                  <>
                    Inspect the live clinical interface{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      right here.
                    </span>
                  </>
                )}
              </h2>
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                {isFr
                  ? 'Basculez entre l’écran clinique du médecin (garanti sans score logistique), le Pass QR familial et la table d’équité démographique.'
                  : 'Switch between the clinician’s bias-free screen, the family QR visit pass, and the demographic equity table.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  {
                    id: 'clinician',
                    label: isFr ? '1. Espace Médecin' : '1. Clinician',
                  },
                  {
                    id: 'patient',
                    label: isFr ? '2. Pass QR Patient' : '2. Patient QR Pass',
                  },
                  {
                    id: 'equity',
                    label: isFr ? '3. Équité & Confidentialité' : '3. Equity Safeguards',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPreviewTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    previewTab === tab.id
                      ? 'bg-[#0B3B3C] text-white shadow-md'
                      : 'bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#14A39A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contextual Section CTA #3 */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onQuickRoleEnter(activePreviewRole)}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl btn-liquid-primary text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {previewTab === 'clinician'
                    ? isFr
                      ? 'Ouvrir l’Espace Médecin'
                      : 'Launch Clinician Workspace'
                    : previewTab === 'patient'
                    ? isFr
                      ? 'Ouvrir l’Espace Patient & Famille'
                      : 'Launch Patient & Family Portal'
                    : isFr
                    ? 'Ouvrir l’Observatoire de Santé Publique'
                    : 'Launch Public Health Observatory'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <GlassCard glow interactive={false} className="space-y-4 sm:space-y-5 !p-4 sm:!p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3.5 sm:pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14A39A] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-[#0B3B3C] font-heading uppercase tracking-wider">
                    {previewTab === 'clinician'
                      ? isFr
                        ? 'Console Clinique'
                        : 'Clinical Console'
                      : previewTab === 'patient'
                      ? isFr
                        ? 'Pass Préventif Unifié — Famille'
                        : 'Unified Preventive Pass — Family'
                      : isFr
                      ? 'Audit d’Équité — Wilson 95 %'
                      : 'Equity Audit — 95% Wilson CI'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">Rules v8 · Signed</span>
              </div>

              {previewTab === 'clinician' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-[#64748B]">
                        Adult Pathway · Al Bateen Healthcare Centre
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-[#0B3B3C] font-heading">
                        Tariq Al-Nadim · 36 yrs
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <LevelBadge level="orange" />
                      <CertaintyBadge certainty="medium" />
                    </div>
                  </div>

                  <div className="card-3d rounded-2xl p-4 sm:p-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#0B3B3C] font-heading">
                        Consolidated Cardiometabolic Screening Visit
                      </span>
                      <StatusChip state="invited" />
                    </div>
                    <ul className="text-xs sm:text-sm text-[#334155] space-y-1.5 list-disc ps-5">
                      <li>Two borderline blood pressure readings (134/86 mmHg)</li>
                      <li>Adapted risk factors for South Asian background &amp; family history warrant HbA1c</li>
                      <li>Clinician action required: Confirm, Modify, or Defer pathway</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs bg-[#0B3B3C] text-white px-4 py-3 rounded-xl">
                    <span className="font-medium leading-snug">
                      {isFr
                        ? 'Vue clinique uniquement — aucun score logistique ni probabilité de non-présentation affiché'
                        : 'Clinical view only — no logistics scores or no-show probabilities displayed'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  </div>
                </div>
              )}

              {previewTab === 'patient' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-[#64748B]">
                        {isFr
                          ? 'Portail Patient Unifié · Dossier Adulte (IFHAS) & Enfants Affiliés'
                          : 'Unified Patient Portal · Adult Record (IFHAS) & Affiliated Children'}
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-[#0B3B3C] font-heading">
                        Tariq Al-Nadim · 36 yrs
                      </h3>
                    </div>
                    <StatusChip state="invited" />
                  </div>

                  {/* Family Affiliation Switcher Preview (SMS OTP & 18y Majority Governance) */}
                  <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B3B3C]">
                        {isFr
                          ? 'Enfants affiliés au parent (Accès protégé par code SMS OTP)'
                          : 'Affiliated Children (< 18y · Protected via SMS OTP)'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#0F6B6B] border border-[#99F6E4]">
                        {isFr ? 'Gouvernance Clinique' : 'Clinical Governance'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-[#CBD5E1]">
                        <p className="font-bold text-[#0B3B3C]">Zayed Al-Nadim (18m)</p>
                        <p className="text-[10px] text-[#0F6B6B] font-semibold">WCV · SMS OTP vérifié</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#CBD5E1]">
                        <p className="font-bold text-[#0B3B3C]">Layla Al-Nadim (14y)</p>
                        <p className="text-[10px] text-[#64748B]">Adolescent · SMS OTP</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                        <p className="font-bold text-[#92400E]">Youssef Al-Nadim (18y)</p>
                        <p className="text-[10px] text-[#B45309] font-semibold">
                          {isFr ? 'Majorité · Détachement' : '18y Majority Transition'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <PassQrCard code="IFH3692T" facilityName="Al Bateen Healthcare Centre" />
                </div>
              )}

              {previewTab === 'equity' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-[#0B3B3C] font-heading">
                      {isFr ? 'Ce que l’observatoire montre' : 'What the observatory shows'}
                    </p>
                    <ul className="text-xs sm:text-sm text-[#334155] space-y-2 list-disc ps-5">
                      <li>{isFr ? 'Couverture et adoption par zone et par segment, avec intervalles de confiance.' : 'Coverage and adoption by region and segment, with confidence intervals.'}</li>
                      <li>{isFr ? 'Les petits groupes sont automatiquement masqués pour protéger la vie privée.' : 'Small groups are automatically masked to protect privacy.'}</li>
                      <li>{isFr ? 'Les zones en retard déclenchent une action concrète (unité mobile, horaires étendus).' : 'Lagging zones trigger concrete action (mobile unit, extended hours).'}</li>
                    </ul>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2.5 text-xs">
                      <span className="text-[#64748B]">
                        {isFr ? 'Petit sous-segment' : 'Small sub-segment'}
                      </span>
                      <span className="font-mono font-semibold text-[#475569]">
                        {isFr ? 'Masqué — groupe trop petit' : 'Masked — group too small'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {isFr ? 'Valeurs réelles affichées dans l’observatoire Santé Publique.' : 'Live values are shown inside the Public Health observatory.'}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * SECTION 5: ROLE-SPECIFIC VALUE CARDS + CONTEXTUAL CTA
       * ===================================================================== */}
      <section id="for-whom" className="py-16 sm:py-20 lg:py-24 bg-white/50 border-t border-[#E2E8F0]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
                {isFr ? '04 · Les Espaces Métier' : '04 · Role-Specific Workspaces'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
                {isFr ? (
                  <>
                    Quatre portails dédiés,{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      zéro surcharge cognitive.
                    </span>
                  </>
                ) : (
                  <>
                    Four dedicated portals,{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      zero cognitive overload.
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Contextual Section CTA #4 */}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl btn-liquid-primary text-xs sm:text-sm font-semibold inline-flex items-center gap-2 self-start md:self-auto cursor-pointer shrink-0"
            >
              <span>{copy.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {audiences.map((aud) => {
              const IconComp = aud.Icon;
              return (
                <GlassCard
                  key={aud.role}
                  glow
                  kicker={aud.kicker}
                  onClick={() => onQuickRoleEnter(aud.role)}
                  icon={<IconComp className="w-5 h-5" />}
                  title={aud.title}
                  description={aud.benefit}
                  ctaLabel={aud.cta}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * SECTION 6: CLINICAL GOVERNANCE & SAFEGUARDS IN DARK GLASSCARDS + CTA
       * ===================================================================== */}
      <section id="responsibility" className="py-16 sm:py-20 lg:py-24 bg-[#041D1E] text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 end-1/4 w-96 h-96 rounded-full bg-[#14A39A]/15 blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
            <div className="space-y-2.5 max-w-2xl">
              <p className="text-xs font-bold text-white/90 bg-white/10 border border-white/20 px-3 py-1 rounded-full inline-block uppercase tracking-widest">
                {isFr ? '05 · Gouvernance & Sécurité Clinique' : '05 · Clinical Governance & Safeguards'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-heading leading-tight">
                {isFr ? (
                  <>
                    Les règles décident du clinique.{' '}
                    <span className="font-editorial italic font-normal text-white underline decoration-white/45 decoration-2 underline-offset-8">
                      L’IA soutient la logistique.
                    </span>
                  </>
                ) : (
                  <>
                    Published rules drive clinical care.{' '}
                    <span className="font-editorial italic font-normal text-white underline decoration-white/45 decoration-2 underline-offset-8">
                      AI supports logistics only.
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Contextual Section CTA #5 */}
            <button
              type="button"
              onClick={() => window.location.assign('/proof')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl btn-liquid-primary text-xs sm:text-sm font-semibold inline-flex items-center gap-2 self-start lg:self-auto shrink-0 cursor-pointer"
            >
              <span>
                {isFr
                  ? 'Preuves & gouvernance'
                  : 'Evidence & governance'}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                kicker: 'SAFEGUARD 01',
                Icon: Eye,
                title: isFr ? 'Incertitude visible & Niveau Gris' : 'Visible Uncertainty & Level Grey',
                desc: isFr
                  ? 'Un dossier incomplet est marqué Gris (jamais un faux Vert), avec la liste exacte des mesures à compléter.'
                  : 'Incomplete records trigger Level Grey (never a false Green) with an explicit checklist of missing clinical measures.',
              },
              {
                kicker: 'SAFEGUARD 02',
                Icon: Lock,
                title: isFr ? '5 consentements & masquage des petits groupes' : '5 Granular Consents & Small-Group Masking',
                desc: isFr
                  ? 'Retrait immédiat par finalité, journal d’accès transparent et masquage automatique des petits effectifs.'
                  : 'Instant purpose-specific withdrawal, live Data Usage Log, and automatic small-group masking.',
              },
              {
                kicker: 'SAFEGUARD 03',
                Icon: Layers,
                title: isFr ? 'Preuves vérifiables en continu' : 'Verifiable evidence, always open',
                desc: isFr
                  ? 'Suite d’acceptance automatisée, simulateur reproductible et benchmark publiés sur la page Preuves & gouvernance.'
                  : 'Automated acceptance suite, reproducible simulator and benchmark, published on the Evidence & governance page.',
              },
            ].map((card, i) => {
              const IconC = card.Icon;
              return (
                <GlassCard
                  key={i}
                  variant="dark"
                  kicker={card.kicker}
                  icon={<IconC className="w-5 h-5" />}
                  title={card.title}
                  description={card.desc}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * SECTION 7: ESSENTIAL FAQ & FINAL CONVERSION GLASSCARD
       * ===================================================================== */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        <div className="text-center space-y-2.5">
          <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
            {t('navFaq')}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B3B3C] font-heading">
            {isFr ? 'Questions essentielles' : 'Essential Questions'}
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-3.5">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="card-3d rounded-2xl px-4 sm:px-6 py-4 sm:py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-start cursor-pointer"
                >
                  <span className="text-xs sm:text-base font-bold text-[#0B3B3C] font-heading">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mt-3 pt-3 border-t border-[#E2E8F0]">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Conversion Banner */}
      <section className="pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <GlassCard glow interactive={false} className="!p-6 sm:!p-12 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 text-center lg:text-start max-w-xl">
              <p className="text-xs font-bold text-[#0F6B6B] uppercase tracking-widest">
                {isFr ? 'Prêt pour l’évaluation en direct' : 'Ready for Live Evaluation'}
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B3B3C] font-heading">
                {isFr
                  ? 'Testez les 4 portails dédiés en conditions réelles.'
                  : 'Experience all 4 dedicated portals in real conditions.'}
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                {isFr
                  ? 'Données 100 % synthétiques, règles cliniques publiées et page de preuves ouverte.'
                  : '100% synthetic data, published clinical rules, and an open evidence page.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl btn-liquid-primary text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{copy.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* =====================================================================
       * SCROLL-FOLLOWING CONTEXTUAL CALL-TO-ACTION DOCK
       * ===================================================================== */}
      <AnimatePresence>
        {showFloatingDock && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-3 sm:bottom-4 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none pb-safe"
          >
            <div className="max-w-4xl mx-auto liquid-glass section-glow rounded-2xl px-3.5 py-2.5 sm:px-6 sm:py-3.5 shadow-2xl border border-white/90 flex items-center justify-between gap-2.5 sm:gap-3 pointer-events-auto">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B3B3C] text-white text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                  {activeDock.badge}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#0B3B3C] truncate">
                  {activeDock.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={activeDock.secondaryAction}
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-[#0B3B3C] border border-[#CBD5E1] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  {activeDock.secondaryLabel}
                </button>
                <button
                  type="button"
                  onClick={activeDock.primaryAction}
                  className="px-3.5 sm:px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>{activeDock.primaryLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Institutional Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] py-8 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-start">
              <MediBeninLogo />
              <span className="text-[11px]">
                ·{' '}
                {isFr
                  ? 'Conçu pour le Future Health Digital Innovation Challenge 2026'
                  : 'Built for the Future Health Digital Innovation Challenge 2026'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/proof"
                className="font-semibold text-[#0F6B6B] hover:text-[#0B3B3C] underline decoration-[#99F6E4] decoration-2 underline-offset-4"
              >
                {isFr ? 'Preuves & gouvernance' : 'Evidence & governance'}
              </a>
              <LanguageSwitch />
            </div>
          </div>
          <p className="text-[11px] text-center sm:text-start text-[#64748B] leading-relaxed">
            {isFr
              ? 'Prototype indépendant réalisé par l’équipe CareX. Sans affiliation avec, ni approbation d’une autorité de santé. Données 100 % synthétiques.'
              : 'Independent prototype built by team CareX. Not affiliated with, or endorsed by, any health authority. 100% synthetic data.'}
          </p>
        </div>
      </footer>
    </div>
  );
};