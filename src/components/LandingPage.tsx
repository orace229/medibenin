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
  const isAr = locale === 'ar';

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
    heroEyebrow: isAr
      ? 'ØµÙÙ…Ù… Ù„Ù…Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„Ø§Ø¨ØªÙƒØ§Ø± Ø§Ù„ØµØ­ÙŠ Ø§Ù„Ø±Ù‚Ù…ÙŠ Ù„Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ 2026'
      : isFr
      ? 'ConÃ§u pour le Future Health Digital Innovation Challenge 2026'
      : 'Built for the Future Health Digital Innovation Challenge 2026',
    heroTitleLead: isAr
      ? 'Ø­ÙˆÙ‘Ù„ ÙƒÙ„ Ø®Ø·Ø± ØµØ­ÙŠ Ù…Ø±ØµÙˆØ¯'
      : isFr
      ? 'Transformez chaque risque dÃ©tectÃ©'
      : 'Turn every detected health risk',
    heroTitleAccent: isAr
      ? 'Ø¥Ù„Ù‰ Ø²ÙŠØ§Ø±Ø© ÙˆÙ‚Ø§Ø¦ÙŠØ© Ù…ÙƒØªÙ…Ù„Ø©.'
      : isFr
      ? 'en une visite prÃ©ventive accomplie.'
      : 'into a completed preventive visit.',
    heroSubtitle: isAr
      ? 'Ù…Ù†ØµØ© Ø§Ù„ÙˆÙ‚Ø§ÙŠØ© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø© Ø§Ù„ØªÙŠ ØªÙˆØ­Ø¯ Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø³Ø±ÙŠØ±ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©ØŒ ÙˆÙ…ØµØ§Ø¯Ù‚Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨ØŒ ÙˆØ¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø±ÙŠØ¶ Ø§Ù„Ø°ÙƒÙŠØ© ÙÙŠ Ù…Ø³Ø§Ø± ÙˆØ§Ø­Ø¯ Ù…ØºÙ„Ù‚ Ø§Ù„Ø­Ù„Ù‚Ø©.'
      : isFr
      ? 'La plateforme de prÃ©vention de prÃ©cision qui relie rÃ¨gles cliniques publiÃ©es, validation mÃ©dicale humaine et Pass QR patient en une seule visite.'
      : 'The precision prevention platform uniting published clinical rules, physician sign-off, and a patient QR pass into one closed loop.',
    ctaPrimary: isAr ? 'Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ©' : isFr ? 'AccÃ©der au portail' : t('accessDashboard'),
    ctaSecondary: isAr ? 'Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ù…Ø³Ø§Ø±' : isFr ? 'DÃ©couvrir lâ€™architecture' : 'Explore the pathway',
  };

  // Grid-based Hero Value GlassCards
  const heroMetrics = [
    {
      kicker: 'COHORT SCALE',
      val: '6,000',
      label: isAr ? 'Ù…Ù„Ù ØµØ­ÙŠ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ' : isFr ? 'Profils synthÃ©tiques' : 'Synthetic profiles',
      sub: isAr ? 'Ø¨Ø°Ø±Ø© Ø­ØªÙ…ÙŠØ© Ù¢Ù Ù¢Ù¦Ù¡Ù¡Ù¢Ù ' : isFr ? 'ReproductibilitÃ© totale' : 'Deterministic seed 20261120',
    },
    {
      kicker: 'CLINICAL SAFETY',
      val: isAr ? 'ØªØ¯Ù‚ÙŠÙ‚ Ø¨Ø´Ø±ÙŠ' : isFr ? 'Validation humaine' : 'Human check',
      label: isAr ? 'Ù…ØµØ§Ø¯Ù‚Ø© Ø·Ø¨ÙŠØ© Ù‚Ø¨Ù„ Ø£ÙŠ Ø±Ø³Ø§Ù„Ø©' : isFr ? 'MÃ©decin avant tout envoi' : 'Physician validation before any message',
      sub: isAr ? 'Ù„Ø§ Ù‚Ø±Ø§Ø± Ø¢Ù„ÙŠ Ù…Ù†ÙØ±Ø¯' : isFr ? 'ZÃ©ro dÃ©cision autonome' : 'Zero autonomous AI routing',
    },
    {
      kicker: 'PATIENT EXPERIENCE',
      val: '1 Visit',
      label: isAr ? 'Ø²ÙŠØ§Ø±Ø© ÙˆÙ‚Ø§Ø¦ÙŠØ© Ù…ÙˆØ­Ø¯Ø©' : isFr ? 'Visite unique regroupÃ©e' : 'Consolidated Care',
      sub: isAr ? 'Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ø¨Ø¹Ø«Ø±Ø©' : isFr ? 'ZÃ©ro parcours dispersÃ©' : 'All checks in one booking',
    },
    {
      kicker: 'TRANSPARENCY',
      val: isAr ? 'Ø¯Ø§Ø¦Ù…Ø§Ù‹' : isFr ? 'Toujours affichÃ©e' : 'Always shown',
      label: isAr ? 'Ø¥Ø¸Ù‡Ø§Ø± Ø¹Ø¯Ù… Ø§Ù„ÙŠÙ‚ÙŠÙ†' : isFr ? 'Incertitude affichÃ©e' : 'Uncertainty always shown',
      sub: isAr ? 'ÙØªØ±Ø§Øª Ø«Ù‚Ø© Ø¹Ù„Ù‰ ÙƒÙ„ Ù…Ø¤Ø´Ø±' : isFr ? 'Intervalles de confiance sur chaque indicateur' : 'Confidence intervals on every metric',
    },
  ];

  // Value Propositions in Section 2
  const valuePillars = [
    {
      num: '01 Â· PRECISION DETECTION',
      title: isAr
        ? 'Ø±ØµØ¯ Ù…ØªØ¹Ø¯Ø¯ Ø§Ù„Ø£Ø¨Ø¹Ø§Ø¯ ÙŠØªØ¬Ø§ÙˆØ² Ø§Ù„Ø¹Ù…Ø± ÙˆØ§Ù„Ø¬Ù†Ø³'
        : isFr
        ? 'DÃ©tection multidimensionnelle au-delÃ  de lâ€™Ã¢ge'
        : 'Multidimensional detection beyond age & sex',
      desc: isAr
        ? 'Ø¯Ù…Ø¬ Ø§Ù„ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¹Ø§Ø¦Ù„ÙŠØŒ ÙˆÙ…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù†Ù…ÙˆØŒ ÙˆØ¹ÙˆØ§Ù…Ù„ Ø§Ù„Ø®Ø·Ø± Ø§Ù„Ù…ÙƒÙŠÙØ© Ø¥Ø«Ù†ÙŠØ§Ù‹ ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø³Ø±ÙŠØ±ÙŠØ© Ø´ÙØ§ÙØ©.'
        : isFr
        ? 'Croisement des antÃ©cÃ©dents familiaux, de la pÃ©diatrie et des facteurs de risque adaptÃ©s avec traÃ§abilitÃ© complÃ¨te.'
        : 'Combines family history, pediatric milestones, and ethnically adapted risk factors with full rule traceability.',
    },
    {
      num: '02 Â· PROACTIVE OUTREACH',
      title: isAr
        ? 'ØªÙˆØ§ØµÙ„ Ø§Ø³ØªØ¨Ø§Ù‚ÙŠ Ø¨Ù„ØºØ© Ø§Ù„Ù…Ø±ÙŠØ¶ Ø¯ÙˆÙ† Ø®ÙØ¶ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©'
        : isFr
        ? 'Relance multilingue proactive sans dÃ©classement'
        : 'Proactive native-language outreach',
      desc: isAr
        ? 'ØªÙˆÙ‚Ø¹Ø§Øª Ø§Ù„Ù„ÙˆØ¬Ø³ØªÙŠØ§Øª ØªØ¶ÙŠÙ Ø¯Ø¹Ù…Ø§Ù‹ (Ù†Ù‚Ù„ØŒ ØªØ°ÙƒÙŠØ± Ù‡Ø§ØªÙÙŠ) ÙˆÙ„Ø§ ØªØ­Ø±Ù… Ø£ÙŠ Ù…Ø±ÙŠØ¶ Ù…Ù† Ø£ÙˆÙ„ÙˆÙŠØªÙ‡ Ø§Ù„Ø³Ø±ÙŠØ±ÙŠØ©.'
        : isFr
        ? 'Lâ€™IA logistique dÃ©clenche un accompagnement renforcÃ© (transport, appel) sans jamais rÃ©duire la prioritÃ© mÃ©dicale.'
        : 'Logistics prediction adds support (transport, phone outreach) and never downgrades a patientâ€™s clinical priority.',
    },
    {
      num: '03 Â· UNIFIED VISIT PASS',
      title: isAr
        ? 'Ø²ÙŠØ§Ø±Ø© ÙˆØ§Ø­Ø¯Ø© Ø´Ø§Ù…Ù„Ø© Ø¨Ø¨Ø·Ø§Ù‚Ø© Ù…Ø±ÙˆØ± QR Ù…Ø¤ÙƒØ¯Ø©'
        : isFr
        ? 'Une visite unique scellÃ©e par Pass QR'
        : 'One consolidated visit with a QR Pass',
      desc: isAr
        ? 'Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† Ù£ Ù…ÙˆØ§Ø¹ÙŠØ¯ Ù…Ù†ÙØµÙ„Ø©ØŒ ÙŠØ­ØµÙ„ Ø§Ù„Ù…Ø±ÙŠØ¶ Ø¹Ù„Ù‰ Ù…ÙˆØ¹Ø¯ ÙˆÙ‚Ø§Ø¦ÙŠ ÙˆØ§Ø­Ø¯ ÙŠØºÙ„Ù‚ Ø§Ù„Ø­Ù„Ù‚Ø© Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø¶ÙˆØ±.'
        : isFr
        ? 'Au lieu de 3 convocations dispersÃ©es, le patient reÃ§oit un Pass QR unique qui ferme la boucle dÃ¨s lâ€™admission.'
        : 'Replaces scattered appointments with one unified preventive booking verified at clinic check-in.',
    },
  ];

  // 5-Step Closed-Loop Value Cards
  const fiveVerbs = [
    {
      num: 'STEP 01',
      verb: isAr ? 'Ø§Ù„Ø±ØµØ¯' : isFr ? 'RepÃ©rer' : 'Identify',
      desc: isAr
        ? 'Ù‚ÙˆØ§Ø¹Ø¯ Ø³Ø±ÙŠØ±ÙŠØ© Ù…ÙˆØ«Ù‚Ø© Ù…Ø¹ Ø´Ø§Ø±Ø© ÙŠÙ‚ÙŠÙ† ÙˆØ§Ø¶Ø­Ø©.'
        : isFr
        ? 'RÃ¨gles cliniques explicites et badge de certitude visible.'
        : 'Published clinical rules with visible certainty badges.',
    },
    {
      num: 'STEP 02',
      verb: isAr ? 'Ø§Ù„ØªÙˆØ¬ÙŠÙ‡' : isFr ? 'Orienter' : 'Route',
      desc: isAr
        ? 'ÙØµÙ„ ØµØ§Ø±Ù… Ø¨ÙŠÙ† Ø§Ù„Ù„ÙˆØ¬Ø³ØªÙŠØ§Øª ÙˆÙ‚Ø±Ø§Ø± Ø§Ù„Ø·Ø¨ÙŠØ¨.'
        : isFr
        ? 'SÃ©paration stricte entre file logistique et Ã©cran mÃ©decin.'
        : 'Strict separation between logistics and clinical view.',
    },
    {
      num: 'STEP 03',
      verb: isAr ? 'Ø§Ù„ØªÙØ§Ø¹Ù„' : isFr ? 'Engager' : 'Engage',
      desc: isAr
        ? 'Ø¯Ø¹ÙˆØ© Ø¨Ù„ØºØ© Ø§Ù„Ù…Ø±ÙŠØ¶ Ù…Ø¹ Ø­Ø±ÙŠØ© Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ø£Ùˆ Ø§Ù„Ø±ÙØ¶.'
        : isFr
        ? 'Invitation multilingue et refus libre sans pÃ©nalitÃ©.'
        : 'Native-language outreach with penalty-free refusal.',
    },
    {
      num: 'STEP 04',
      verb: isAr ? 'Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©' : isFr ? 'Suivre' : 'Track',
      desc: isAr
        ? 'Ø¨Ø·Ø§Ù‚Ø© Ù…Ø±ÙˆØ± QR Ù…Ù† Ù¨ Ø®Ø§Ù†Ø§Øª Ù„Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ø­Ù„Ù‚Ø©.'
        : isFr
        ? 'Pass QR Ã  8 caractÃ¨res jusquâ€™Ã  la visite rÃ©alisÃ©e.'
        : 'Closed-loop confirmation via 8-character QR pass.',
    },
    {
      num: 'STEP 05',
      verb: isAr ? 'Ø§Ù„Ù‚ÙŠØ§Ø³' : isFr ? 'Mesurer' : 'Measure',
      desc: isAr
        ? 'ÙØªØ±Ø§Øª Ø«Ù‚Ø© ÙˆÙŠÙ„Ø³ÙˆÙ† ÙˆØ¥Ø®ÙØ§Ø¡ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„ØµØºÙŠØ±Ø©.'
        : isFr
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
      title: isAr ? 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø±ÙŠØ¶ ÙˆØ§Ù„Ø¹Ø§Ø¦Ù„Ø© Ø§Ù„Ù…ÙˆØ­Ø¯Ø©' : isFr ? 'Portail Patient UnifiÃ© & Enfants' : 'Unified Patient & Family Portal',
      benefit: isAr
        ? 'Ù…Ù„Ù Ø§Ù„Ù…Ø±ÙŠØ¶ Ø§Ù„Ø¨Ø§Ù„Øº (IFHAS) ÙˆØ£Ø·ÙØ§Ù„Ù‡ Ø§Ù„Ù…Ø±ØªØ¨Ø·ÙˆÙ† Ø¹Ø¨Ø± Ø±Ù…Ø² SMSØŒ ÙˆØ¨Ø·Ø§Ù‚Ø© QR ÙˆÙ¥ Ù…ÙˆØ§ÙÙ‚Ø§Øª Ù…Ø³ØªÙ‚Ù„Ø©.'
        : isFr
        ? 'Dossier adulte (IFHAS) + enfants affiliÃ©s (< 18 ans) sÃ©curisÃ©s par SMS OTP, Pass QR et 5 consentements.'
        : 'Adult IFHAS record + affiliated children (< 18y) secured via SMS OTP, QR visit pass, and 5 consent toggles.',
      cta: isAr ? 'ÙØªØ­ Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø±ÙŠØ¶ Ø§Ù„Ù…ÙˆØ­Ø¯Ø©' : isFr ? 'Ouvrir le Portail Patient UnifiÃ©' : 'Open Unified Patient Portal',
      Icon: HeartHandshake,
    },
    {
      role: 'clinician',
      kicker: 'CLINICAL WORKBENCH',
      title: isAr ? 'Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙˆØ§Ù„Ø¹ÙŠØ§Ø¯Ø§Øª' : isFr ? 'MÃ©decins & Cliniciens' : 'Clinicians',
      benefit: isAr
        ? 'Ø´Ø§Ø´Ø© Ø³Ø±ÙŠØ±ÙŠØ© ØµØ§ÙÙŠØ© Ø¨Ø¯ÙˆÙ† Ø¯Ø±Ø¬Ø§Øª Ø£ÙˆÙ„ÙˆÙŠØ© Ù…Ø¹ Ù…ØµØ§Ø¯Ù‚Ø© Ø¨Ù†Ù‚Ø±Ø© ÙˆØ§Ø­Ø¯Ø©.'
        : isFr
        ? 'Ã‰cran clinique pur (zÃ©ro score logistique) avec validation mÃ©dicale en un clic.'
        : 'Pure clinical screen (zero priority scores) with one-click sign-off.',
      cta: isAr ? 'ÙØªØ­ Ø´Ø§Ø´Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨' : isFr ? 'Ouvrir lâ€™Ã‰cran MÃ©decin' : 'Open Clinician View',
      Icon: Stethoscope,
    },
    {
      role: 'coordinator',
      kicker: 'CARE OPERATIONS',
      title: isAr ? 'Ù…Ù†Ø³Ù‚Ùˆ Ø§Ù„Ø±Ø¹Ø§ÙŠØ©' : isFr ? 'Coordinateurs de Soins' : 'Care Coordinators',
      benefit: isAr
        ? 'Ù‚ÙˆØ§Ø¦Ù… ÙŠÙˆÙ…ÙŠØ© Ø°ÙƒÙŠØ© Ù„ØªØ¹Ø²ÙŠØ² Ø§Ù„Ù…Ø±Ø§ÙÙ‚Ø© Ø¯ÙˆÙ† Ø®ÙØ¶ Ø£ÙˆÙ„ÙˆÙŠØ© Ø£ÙŠ Ù…Ø±ÙŠØ¶.'
        : isFr
        ? 'File opÃ©rationnelle dÃ©diÃ©e pour accompagner chaque patient sans jamais le dÃ©classer.'
        : 'Operational outreach queue that adds support without ever downgrading priority.',
      cta: isAr ? 'ÙØªØ­ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù†Ø³Ù‚' : isFr ? 'Ouvrir la File Coordinateur' : 'Open Coordinator Queue',
      Icon: Users,
    },
    {
      role: 'public_health',
      kicker: 'POPULATION & EQUITY',
      title: isAr ? 'Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©' : isFr ? 'Observatoire SantÃ© Publique' : 'Public Health',
      benefit: isAr
        ? 'Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ø³ÙƒØ§Ù†ÙŠØ© Ù…Ø¹ Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„ØµØºÙŠØ±Ø© ÙÙŠ Ø§Ù„ÙˆÙ‚Øª Ø§Ù„ÙØ¹Ù„ÙŠ.'
        : isFr
        ? 'Audit dâ€™Ã©quitÃ© dÃ©mographique avec masquage automatique des petits effectifs.'
        : 'Live demographic equity audit with automatic small-count masking.',
      cta: isAr ? 'ÙØªØ­ Ø§Ù„Ù…Ø±ØµØ¯ Ø§Ù„Ø³ÙƒØ§Ù†ÙŠ' : isFr ? 'Ouvrir lâ€™Observatoire' : 'Open Observatory',
      Icon: BarChart3,
    },
  ];

  const faqs = [
    {
      q: isAr ? 'Ù‡Ù„ MediBenin Ø£Ø¯Ø§Ø© ØªØ´Ø®ÙŠØµ Ø·Ø¨ÙŠØŸ' : isFr ? 'MediBenin pose-t-il un diagnostic mÃ©dical ?' : 'Is MediBenin an autonomous diagnostic tool?',
      a: isAr
        ? 'Ù„Ø§. Ø¥Ù†Ù‡ Ù†Ø¸Ø§Ù… Ù„ØªÙ†Ø³ÙŠÙ‚ Ø§Ù„ÙˆÙ‚Ø§ÙŠØ© Ù…Ø¨Ù†ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø±Ø´Ø§Ø¯Ø§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©Ø› Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙŠØ±Ø§Ø¬Ø¹ ÙˆÙŠÙ‚Ø±Ø± Ø¯Ø§Ø¦Ù…Ø§Ù‹.'
        : isFr
        ? 'Non. Chaque recommandation requiert la validation explicite dâ€™un clinicien.'
        : 'No. Every recommendation requires explicit clinician validation.',
    },
    {
      q: isAr ? 'Ù„Ù…Ø§Ø°Ø§ ØªÙØµÙ„ÙˆÙ† Ø¨ÙŠÙ† Ø´Ø§Ø´Ø© Ø§Ù„Ù…Ù†Ø³Ù‚ ÙˆØ´Ø§Ø´Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨ØŸ' : isFr ? 'Pourquoi sÃ©parer lâ€™espace Coordinateur de lâ€™espace MÃ©decin ?' : 'Why separate Coordinator and Clinician views?',
      a: isAr
        ? 'Ù„Ù…Ù†Ø¹ Ø£ÙŠ ØªØ­ÙŠØ² Ù„ÙˆØ¬Ø³ØªÙŠ Ù…Ù† Ø§Ù„ØªØ£Ø«ÙŠØ± Ø¹Ù„Ù‰ Ø§Ù„Ø­ÙƒÙ… Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ Ù„Ù„Ø·Ø¨ÙŠØ¨ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©.'
        : isFr
        ? 'Les repÃ¨res logistiques nâ€™apparaissent jamais devant le mÃ©decin.'
        : 'Operational indicators never appear on the physicianâ€™s clinical screen.',
    },
    {
      q: isAr ? 'Ù…Ù† ÙŠØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„Ù…ÙˆØ§ÙÙ‚Ø§ØªØŸ' : isFr ? 'Comment le patient garde-t-il le contrÃ´le de ses donnÃ©es ?' : 'How do patients control their personal health data?',
      a: isAr
        ? 'ÙŠØªØ­ÙƒÙ… Ø§Ù„Ù…Ø±ÙŠØ¶ ÙÙŠ Ù¥ Ù…ÙˆØ§ÙÙ‚Ø§Øª Ù…Ø³ØªÙ‚Ù„Ø© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ÙÙˆØ±ÙŠ Ù…Ø¹ Ø³Ø¬Ù„ Ø´ÙØ§Ù Ù„ÙƒÙ„ ÙˆØµÙˆÙ„.'
        : isFr
        ? 'Chaque patient dispose de 5 interrupteurs de consentement indÃ©pendants, rÃ©vocables instantanÃ©ment, et dâ€™un journal dâ€™accÃ¨s horodatÃ©.'
        : 'Patients control 5 independent consent toggles with instant revocation and a real-time, timestamped Data Usage Log.',
    },
    {
      q: isAr ? 'Ù‡Ù„ ÙŠÙ…ÙƒÙ† ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹ Ø§Ù„Ø¢Ù†ØŸ' : isFr ? 'Puis-je tester les 4 portails dÃ©diÃ©s immÃ©diatement ?' : 'Can I test all 4 dedicated portals right now?',
      a: isAr
        ? 'Ù†Ø¹Ù…. Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹ (Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø±ÙŠØ¶ Ø§Ù„Ù…ÙˆØ­Ø¯Ø© Ù…Ø¹ Ø£Ø·ÙØ§Ù„Ù‡ Ø§Ù„Ù…Ø±ØªØ¨Ø·ÙŠÙ† + Ù£ Ø¨ÙˆØ§Ø¨Ø§Øª Ù„Ù„ÙƒÙˆØ§Ø¯Ø± Ø§Ù„ØµØ­ÙŠØ©) Ø¬Ø§Ù‡Ø²Ø© Ø¨Ø¨ÙŠØ§Ù†Ø§Øª Ø§ØµØ·Ù†Ø§Ø¹ÙŠØ© ÙƒØ§Ù…Ù„Ø©.'
        : isFr
        ? 'Oui. Les 4 espaces sont prÃ©configurÃ©s avec un panel de 53 dossiers issu dâ€™une cohorte synthÃ©tique de 6 000 profils.'
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
      badge: '00 Â· HERO',
      message: isFr ? 'PrÃªt Ã  explorer les 4 portails prÃ©ventifs ?' : 'Ready to explore all 4 preventive portals?',
      primaryLabel: copy.ctaPrimary,
      primaryAction: onNavigateToLogin,
      secondaryLabel: isFr ? 'Essayer MÃ©decin â†’' : 'Try Clinician â†’',
      secondaryAction: () => onQuickRoleEnter('clinician'),
    },
    problem: {
      badge: '01 Â· VALUE PROPOSITION',
      message: isFr
        ? 'Passez dâ€™un dÃ©pistage fragmentÃ© Ã  une visite prÃ©ventive unique.'
        : 'Move from fragmented screening to one unified preventive visit.',
      primaryLabel: isFr ? 'Tester le parcours Patient â†’' : 'Test Patient Pathway â†’',
      primaryAction: () => onQuickRoleEnter('patient'),
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    'how-it-works': {
      badge: '02 Â· CLOSED-LOOP WORKFLOW',
      message: isFr
        ? 'Voyez comment le coordinateur orchestre les 5 Ã©tapes en boucle fermÃ©e.'
        : 'See how Care Coordinators orchestrate the 5-step closed loop.',
      primaryLabel: isFr ? 'Ouvrir la File Coordinateur â†’' : 'Open Coordinator Queue â†’',
      primaryAction: () => onQuickRoleEnter('coordinator'),
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    'live-preview': {
      badge: '03 Â· LIVE INTERFACE',
      message: isFr
        ? 'Ouvrez directement lâ€™espace que vous Ãªtes en train dâ€™inspecter.'
        : 'Launch the exact workspace you are currently previewing.',
      primaryLabel:
        previewTab === 'clinician'
          ? isFr
            ? 'Lancer lâ€™Espace MÃ©decin â†’'
            : 'Launch Clinician Workspace â†’'
          : previewTab === 'patient'
          ? isFr
            ? 'Lancer Portail Famille & Pass QR â†’'
            : 'Launch Family QR Portal â†’'
          : isFr
          ? 'Lancer Observatoire Ã‰quitÃ© â†’'
          : 'Launch Equity Observatory â†’',
      primaryAction: () => onQuickRoleEnter(activePreviewRole),
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    'for-whom': {
      badge: '04 Â· 4 DEDICATED PORTALS',
      message: isFr
        ? '1 Portail Patient UnifiÃ© + 3 Espaces Agents de SantÃ© (panel de 53 dossiers).'
        : '1 Unified Patient Portal + 3 Health Agent Workspaces (53-record demo panel).',
      primaryLabel: copy.ctaPrimary,
      primaryAction: onNavigateToLogin,
      secondaryLabel: isFr ? 'Vue MÃ©decin directe â†’' : 'Direct Clinician View â†’',
      secondaryAction: () => onQuickRoleEnter('clinician'),
    },
    responsibility: {
      badge: '05 Â· EVIDENCE & GOVERNANCE',
      message: isFr
        ? 'Consultez les preuves : suite dâ€™acceptance, simulateur et benchmark.'
        : 'Inspect the evidence: acceptance suite, simulator and benchmark.',
      primaryLabel: isFr ? 'Preuves & gouvernance â†’' : 'Evidence & governance â†’',
      primaryAction: () => {
        window.location.assign('/proof');
      },
      secondaryLabel: copy.ctaPrimary,
      secondaryAction: onNavigateToLogin,
    },
    faq: {
      badge: '06 Â· GET STARTED',
      message: isFr
        ? 'AccÃ©dez immÃ©diatement aux 4 portails sans configuration.'
        : 'Enter all 4 role portals immediately with zero setup.',
      primaryLabel: copy.ctaPrimary,
      primaryAction: onNavigateToLogin,
      secondaryLabel: isFr ? 'Portail Patient UnifiÃ© â†’' : 'Unified Patient Portal â†’',
      secondaryAction: () => onQuickRoleEnter('patient'),
    },
  };

  const activeDock = contextualCtaMap[activeSection];

  const navLinks: Array<{ id: SectionId; label: string }> = [
    { id: 'problem', label: isAr ? 'Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…Ø¶Ø§ÙØ©' : isFr ? 'Valeur Clinique' : 'Value Proposition' },
    { id: 'how-it-works', label: isAr ? 'Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…ØªÙƒØ§Ù…Ù„' : isFr ? 'Boucle FermÃ©e' : 'Closed-Loop' },
    { id: 'live-preview', label: isAr ? 'Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠ' : isFr ? 'DÃ©monstrateur' : 'Live Preview' },
    { id: 'for-whom', label: isAr ? 'Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹' : isFr ? 'Les 4 Portails' : 'Workspaces' },
    { id: 'responsibility', label: isAr ? 'Ø§Ù„Ø­ÙˆÙƒÙ…Ø© ÙˆØ§Ù„Ø¹Ø¯Ø§Ù„Ø©' : isFr ? 'Gouvernance' : 'Governance' },
    { id: 'faq', label: isAr ? 'Ø§Ù„Ø£Ø³Ø¦Ù„Ø©' : isFr ? 'FAQ' : 'FAQ' },
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
                    {isAr
                      ? 'Ø¯Ø®ÙˆÙ„ Ø³Ø±ÙŠØ¹ Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹:'
                      : isFr
                      ? 'AccÃ¨s rapide aux 4 portails :'
                      : 'Instant 4-portal access:'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        {
                          role: 'patient',
                          label: isAr ? 'Ø§Ù„Ù…Ø±ÙŠØ¶ ÙˆØ£Ø·ÙØ§Ù„Ù‡' : isFr ? 'Patient & Enfants' : 'Patient & Children',
                        },
                        { role: 'clinician', label: isAr ? 'Ø·Ø¨ÙŠØ¨' : isFr ? 'MÃ©decin' : 'Clinician' },
                        { role: 'coordinator', label: isAr ? 'Ù…Ù†Ø³Ù‚' : isFr ? 'Coordinateur' : 'Coordinator' },
                        { role: 'public_health', label: isAr ? 'Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©' : isFr ? 'SantÃ© Publique' : 'Public Health' },
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
                        {r.label} â†’
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
                  {isAr
                    ? 'Ø¯Ø®ÙˆÙ„ Ù…Ø¨Ø§Ø´Ø± Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©:'
                    : isFr
                    ? 'AccÃ¨s par profil aux 4 portails dÃ©diÃ©s :'
                    : 'Direct access to the 4 dedicated portals:'}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(
                    [
                      {
                        role: 'patient',
                        label: isAr
                          ? 'Ø§Ù„Ù…Ø±ÙŠØ¶ ÙˆØ£Ø·ÙØ§Ù„Ù‡ (SMS)'
                          : isFr
                          ? 'Portail Patient & Enfants'
                          : 'Patient & Children Portal',
                      },
                      {
                        role: 'clinician',
                        label: isAr ? 'Ø·Ø¨ÙŠØ¨' : isFr ? 'MÃ©decin' : 'Clinician',
                      },
                      {
                        role: 'coordinator',
                        label: isAr ? 'Ù…Ù†Ø³Ù‚' : isFr ? 'Coordinateur' : 'Coordinator',
                      },
                      {
                        role: 'public_health',
                        label: isAr ? 'Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©' : isFr ? 'SantÃ© Publique' : 'Public Health',
                      },
                    ] as Array<{ role: UserRole; label: string }>
                  ).map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => onQuickRoleEnter(item.role)}
                      className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl liquid-glass-dark hover:bg-white hover:text-[#0B3B3C] text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      {item.label} â†’
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
              {isAr ? 'Ù Ù¡ Â· Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ø³Ø±ÙŠØ±ÙŠØ© Ø§Ù„Ù…Ø¶Ø§ÙØ©' : isFr ? '01 Â· Proposition de Valeur' : '01 Â· Core Value Proposition'}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
              {isAr ? (
                'Ù„Ù…Ø§Ø°Ø§ ÙŠØªÙÙˆÙ‚ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…ØºÙ„Ù‚ Ø¹Ù„Ù‰ Ø§Ù„ÙØ­Øµ Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØŸ'
              ) : isFr ? (
                <>
                  Trois ruptures dÃ©cisives pour{' '}
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
                {isAr
                  ? 'Ø¬Ø±Ø¨ Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø±ÙŠØ¶ Ø§Ù„Ø¢Ù†'
                  : isFr
                  ? 'Tester lâ€™expÃ©rience Patient en 1 clic'
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
                {isAr ? 'Ù Ù¢ Â· Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…ØºÙ„Ù‚' : isFr ? '02 Â· Architecture en Boucle FermÃ©e' : '02 Â· Closed-Loop Architecture'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
                {isAr ? (
                  'Ø®Ù…Ø³ Ø®Ø·ÙˆØ§Øª Ù…ØªØ±Ø§Ø¨Ø·Ø© Ù…Ù† Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ Ø¥Ù„Ù‰ Ø§Ù„Ø²ÙŠØ§Ø±Ø© Ø§Ù„Ù…Ø¤ÙƒØ¯Ø©'
                ) : isFr ? (
                  <>
                    Du drapeau clinique jusquâ€™au{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      Pass QR confirmÃ©.
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
                {isAr
                  ? 'ÙƒÙ„ ØªÙˆØµÙŠØ© ØªÙ†Ø·Ù„Ù‚ Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø·Ø¨ÙŠØ© Ù…Ù†Ø´ÙˆØ±Ø©ØŒ ÙŠØµØ§Ø¯Ù‚ Ø¹Ù„ÙŠÙ‡Ø§ Ø§Ù„Ø·Ø¨ÙŠØ¨ØŒ ÙˆØªØµÙ„ Ù„Ù„Ù…Ø±ÙŠØ¶ ÙƒØ¨Ø·Ø§Ù‚Ø© Ø²ÙŠØ§Ø±Ø© Ù…ÙˆØ­Ø¯Ø©.'
                  : isFr
                  ? 'Chaque rÃ¨gle dÃ©clenchÃ©e est vÃ©rifiÃ©e par un mÃ©decin avant de gÃ©nÃ©rer un Pass de visite unifiÃ© et vÃ©rifiable.'
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
                    {isAr
                      ? 'Ø§ÙØªØ­ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù†Ø³Ù‚'
                      : isFr
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
                  alt="MediBenin 3D Closed-Loop Pathway: Clinical Rule Detection, Physician Validation Console, and Confirmed Patient QR Health Pass"
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
                {isAr ? 'Ù Ù£ Â· Ù…Ø¹Ø§ÙŠÙ†Ø© Ø­ÙŠØ© Ù„Ù„Ù†Ø¸Ø§Ù…' : isFr ? '03 Â· Preuve Produit Interactive' : '03 Â· Interactive Product Proof'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
                {isAr ? (
                  'Ø´ÙØ§ÙÙŠØ© ÙƒØ§Ù…Ù„Ø© ÙÙŠ ÙƒÙ„ Ø´Ø§Ø´Ø©ØŒ Ù…ØµÙ…Ù…Ø© Ù„ÙƒÙ„ Ø¯ÙˆØ±.'
                ) : isFr ? (
                  <>
                    Inspectez lâ€™interface rÃ©elle{' '}
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
                {isAr
                  ? 'Ø¨Ø¯Ù‘Ù„ Ø¨ÙŠÙ† Ø´Ø§Ø´Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨ Ø§Ù„Ø®Ø§Ù„ÙŠØ© Ù…Ù† Ø§Ù„ØªØ­ÙŠØ²ØŒ ÙˆØ¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø±ÙŠØ¶ Ø§Ù„Ø°ÙƒÙŠØ©ØŒ ÙˆÙ…Ø±ØµØ¯ Ø§Ù„Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ø³ÙƒØ§Ù†ÙŠØ©.'
                  : isFr
                  ? 'Basculez entre lâ€™Ã©cran clinique du mÃ©decin (garanti sans score logistique), le Pass QR familial et la table dâ€™Ã©quitÃ© dÃ©mographique.'
                  : 'Switch between the clinicianâ€™s bias-free screen, the family QR visit pass, and the demographic equity table.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  {
                    id: 'clinician',
                    label: isAr ? 'Ù¡. Ø´Ø§Ø´Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨' : isFr ? '1. Espace MÃ©decin' : '1. Clinician',
                  },
                  {
                    id: 'patient',
                    label: isAr ? 'Ù¢. Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…Ø±ÙŠØ¶ QR' : isFr ? '2. Pass QR Patient' : '2. Patient QR Pass',
                  },
                  {
                    id: 'equity',
                    label: isAr ? 'Ù£. Ù…Ø±ØµØ¯ Ø§Ù„Ø¹Ø¯Ø§Ù„Ø©' : isFr ? '3. Ã‰quitÃ© & ConfidentialitÃ©' : '3. Equity Safeguards',
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
                      ? 'Ouvrir lâ€™Espace MÃ©decin'
                      : 'Launch Clinician Workspace'
                    : previewTab === 'patient'
                    ? isFr
                      ? 'Ouvrir lâ€™Espace Patient & Famille'
                      : 'Launch Patient & Family Portal'
                    : isFr
                    ? 'Ouvrir lâ€™Observatoire de SantÃ© Publique'
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
                        ? 'Pass PrÃ©ventif UnifiÃ© â€” Famille'
                        : 'Unified Preventive Pass â€” Family'
                      : isFr
                      ? 'Audit dâ€™Ã‰quitÃ© â€” Wilson 95 %'
                      : 'Equity Audit â€” 95% Wilson CI'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B]">Rules v8 Â· Signed</span>
              </div>

              {previewTab === 'clinician' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-[#64748B]">
                        Adult Pathway Â· Al Bateen Healthcare Centre
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-[#0B3B3C] font-heading">
                        Tariq Al-Nadim Â· 36 yrs
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
                        ? 'Vue clinique uniquement â€” aucun score logistique ni probabilitÃ© de non-prÃ©sentation affichÃ©'
                        : 'Clinical view only â€” no logistics scores or no-show probabilities displayed'}
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
                          ? 'Portail Patient UnifiÃ© Â· Dossier Adulte (IFHAS) & Enfants AffiliÃ©s'
                          : 'Unified Patient Portal Â· Adult Record (IFHAS) & Affiliated Children'}
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-[#0B3B3C] font-heading">
                        Tariq Al-Nadim Â· 36 yrs
                      </h3>
                    </div>
                    <StatusChip state="invited" />
                  </div>

                  {/* Family Affiliation Switcher Preview (SMS OTP & 18y Majority Governance) */}
                  <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B3B3C]">
                        {isFr
                          ? 'Enfants affiliÃ©s au parent (AccÃ¨s protÃ©gÃ© par code SMS OTP)'
                          : 'Affiliated Children (< 18y Â· Protected via SMS OTP)'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#0F6B6B] border border-[#99F6E4]">
                        {isFr ? 'Gouvernance Clinique' : 'Clinical Governance'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-[#CBD5E1]">
                        <p className="font-bold text-[#0B3B3C]">Zayed Al-Nadim (18m)</p>
                        <p className="text-[10px] text-[#0F6B6B] font-semibold">WCV Â· SMS OTP vÃ©rifiÃ©</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#CBD5E1]">
                        <p className="font-bold text-[#0B3B3C]">Layla Al-Nadim (14y)</p>
                        <p className="text-[10px] text-[#64748B]">Adolescent Â· SMS OTP</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                        <p className="font-bold text-[#92400E]">Youssef Al-Nadim (18y)</p>
                        <p className="text-[10px] text-[#B45309] font-semibold">
                          {isFr ? 'MajoritÃ© Â· DÃ©tachement' : '18y Majority Transition'}
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
                      {isFr ? 'Ce que lâ€™observatoire montre' : 'What the observatory shows'}
                    </p>
                    <ul className="text-xs sm:text-sm text-[#334155] space-y-2 list-disc ps-5">
                      <li>{isFr ? 'Couverture et adoption par zone et par segment, avec intervalles de confiance.' : 'Coverage and adoption by region and segment, with confidence intervals.'}</li>
                      <li>{isFr ? 'Les petits groupes sont automatiquement masquÃ©s pour protÃ©ger la vie privÃ©e.' : 'Small groups are automatically masked to protect privacy.'}</li>
                      <li>{isFr ? 'Les zones en retard dÃ©clenchent une action concrÃ¨te (unitÃ© mobile, horaires Ã©tendus).' : 'Lagging zones trigger concrete action (mobile unit, extended hours).'}</li>
                    </ul>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2.5 text-xs">
                      <span className="text-[#64748B]">
                        {isFr ? 'Petit sous-segment' : 'Small sub-segment'}
                      </span>
                      <span className="font-mono font-semibold text-[#475569]">
                        {isFr ? 'MasquÃ© â€” groupe trop petit' : 'Masked â€” group too small'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {isFr ? 'Valeurs rÃ©elles affichÃ©es dans lâ€™observatoire SantÃ© Publique.' : 'Live values are shown inside the Public Health observatory.'}
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
                {isAr ? 'Ù Ù¤ Â· Ø¨ÙˆØ§Ø¨Ø§Øª Ù…ØªØ®ØµØµØ©' : isFr ? '04 Â· Les Espaces MÃ©tier' : '04 Â· Role-Specific Workspaces'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3B3C] font-heading leading-tight">
                {isAr ? (
                  'Ø£Ø±Ø¨Ø¹ ØªØ¬Ø§Ø±Ø¨ Ù…ØµÙ…Ù…Ø© Ø¨Ø¯Ù‚Ø©ØŒ ÙƒÙ„ÙŒÙ‘ Ø­Ø³Ø¨ Ù…Ø³Ø¤ÙˆÙ„ÙŠØªÙ‡'
                ) : isFr ? (
                  <>
                    Quatre portails dÃ©diÃ©s,{' '}
                    <span className="font-editorial italic font-normal text-[#0F6B6B]">
                      zÃ©ro surcharge cognitive.
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
                {isAr ? 'Ù Ù¥ Â· Ø§Ù„Ø­ÙˆÙƒÙ…Ø© ÙˆØ§Ù„Ø£Ø®Ù„Ø§Ù‚ÙŠØ§Øª' : isFr ? '05 Â· Gouvernance & SÃ©curitÃ© Clinique' : '05 Â· Clinical Governance & Safeguards'}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-heading leading-tight">
                {isAr ? (
                  'Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ© ØªÙ‚Ø±Ø± Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ. Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙŠØ®Ø¯Ù… Ø§Ù„Ù„ÙˆØ¬Ø³ØªÙŠ ÙÙ‚Ø·.'
                ) : isFr ? (
                  <>
                    Les rÃ¨gles dÃ©cident du clinique.{' '}
                    <span className="font-editorial italic font-normal text-white underline decoration-white/45 decoration-2 underline-offset-8">
                      Lâ€™IA soutient la logistique.
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
                {isAr
                  ? 'Ø§Ù„Ø£Ø¯Ù„Ø© ÙˆØ§Ù„Ø­ÙˆÙƒÙ…Ø©'
                  : isFr
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
                  ? 'Un dossier incomplet est marquÃ© Gris (jamais un faux Vert), avec la liste exacte des mesures Ã  complÃ©ter.'
                  : 'Incomplete records trigger Level Grey (never a false Green) with an explicit checklist of missing clinical measures.',
              },
              {
                kicker: 'SAFEGUARD 02',
                Icon: Lock,
                title: isFr ? '5 consentements & masquage des petits groupes' : '5 Granular Consents & Small-Group Masking',
                desc: isFr
                  ? 'Retrait immÃ©diat par finalitÃ©, journal dâ€™accÃ¨s transparent et masquage automatique des petits effectifs.'
                  : 'Instant purpose-specific withdrawal, live Data Usage Log, and automatic small-group masking.',
              },
              {
                kicker: 'SAFEGUARD 03',
                Icon: Layers,
                title: isFr ? 'Preuves vÃ©rifiables en continu' : 'Verifiable evidence, always open',
                desc: isFr
                  ? 'Suite dâ€™acceptance automatisÃ©e, simulateur reproductible et benchmark publiÃ©s sur la page Preuves & gouvernance.'
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
            {isAr ? 'Ø¥Ø¬Ø§Ø¨Ø§Øª ÙˆØ§Ø¶Ø­Ø© ÙˆÙ…Ø¨Ø§Ø´Ø±Ø©' : isFr ? 'Questions essentielles' : 'Essential Questions'}
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
                {isAr ? 'Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ø¢Ù†' : isFr ? 'PrÃªt pour lâ€™Ã©valuation en direct' : 'Ready for Live Evaluation'}
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B3B3C] font-heading">
                {isAr
                  ? 'Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø¨Ø¨ÙŠØ§Ù†Ø§Øª ÙƒØ§Ù…Ù„Ø©.'
                  : isFr
                  ? 'Testez les 4 portails dÃ©diÃ©s en conditions rÃ©elles.'
                  : 'Experience all 4 dedicated portals in real conditions.'}
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                {isAr
                  ? 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§ØµØ·Ù†Ø§Ø¹ÙŠØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ØŒ Ù‚ÙˆØ§Ø¹Ø¯ Ø³Ø±ÙŠØ±ÙŠØ© Ù…ÙˆØ«Ù‚Ø©ØŒ ÙˆØµÙØ­Ø© Ø£Ø¯Ù„Ø© Ù…ÙØªÙˆØ­Ø©.'
                  : isFr
                  ? 'DonnÃ©es 100 % synthÃ©tiques, rÃ¨gles cliniques publiÃ©es et page de preuves ouverte.'
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
                Â·{' '}
                {isFr
                  ? 'ConÃ§u pour le Future Health Digital Innovation Challenge 2026'
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
              ? 'Prototype indÃ©pendant rÃ©alisÃ© par lâ€™Ã©quipe CareX. Sans affiliation avec, ni approbation dâ€™une autoritÃ© de santÃ©. DonnÃ©es 100 % synthÃ©tiques.'
              : 'Independent prototype built by team CareX. Not affiliated with, or endorsed by, any health authority. 100% synthetic data.'}
          </p>
        </div>
      </footer>
    </div>
  );
};
