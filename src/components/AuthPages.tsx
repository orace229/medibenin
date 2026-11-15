import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react';
import { useI18n } from '../lib/i18n.tsx';
import { MediSenseLogo, LanguageSwitch } from './MediSenseUI.tsx';
import { UserRole } from '../lib/types.ts';
import { apiClient } from '../lib/api.ts';
// TODO: confirm licence or AI-generation disclosure for portal image
import portalPathwayImg from '../assets/images/portal_preventive_pathway_3d_1794350857982.jpg';

interface AuthPagesProps {
  mode: 'login' | 'request-access';
  initialRole?: UserRole;
  onSwitchMode: (mode: 'login' | 'request-access') => void;
  onBackToLanding: () => void;
  onSelectRoleLogin: (role: UserRole, token: string) => void;
}

interface RolePreset {
  role: UserRole;
  category: 'citizen' | 'health_agent';
  token: string;
  labelEn: string;
  labelFr: string;
  labelAr: string;
  email: string;
  subtitleEn: string;
  subtitleFr: string;
}

const ALL_ROLE_PRESETS: RolePreset[] = [
  {
    role: 'patient',
    category: 'citizen',
    token: 'demo-token-patient',
    labelEn: 'Patient Portal',
    labelFr: 'Portail Patient Unifié',
    labelAr: 'بوابة المريض الموحدة',
    email: 'tariq.nadim@demo.medisense.example',
    subtitleEn: 'Tariq Al-Nadim (36y · Personal Record + Affiliated Children)',
    subtitleFr: 'Tariq Al-Nadim (36 ans · Dossier personnel + Enfants affiliés)',
  },
  {
    role: 'parent',
    category: 'citizen',
    token: 'demo-token-parent',
    labelEn: 'Parent Portal',
    labelFr: 'Portail Parent',
    labelAr: 'بوابة الوالدين',
    email: 'amira.mansoor@demo.medisense.example',
    subtitleEn: 'Amira Al-Mansoor (Parent · Affiliated children)',
    subtitleFr: 'Amira Al-Mansoor (Parent · Enfants affiliés)',
  },
  {
    role: 'clinician',
    category: 'health_agent',
    token: 'demo-token-clinician',
    labelEn: 'Physician / Clinician',
    labelFr: 'Médecin / Clinicien',
    labelAr: 'طبيب سريري',
    email: 'dr.kpegbe@demo.medisense.example',
    subtitleEn: 'Dr. Sydney Kpegbe (Clinical consultation)',
    subtitleFr: 'Dr. Sydney Kpegbe (Consultation clinique)',
  },
  {
    role: 'coordinator',
    category: 'health_agent',
    token: 'demo-token-coordinator',
    labelEn: 'Care Coordinator',
    labelFr: 'Coordinateur de Soins',
    labelAr: 'منسق الرعاية',
    email: 'orace.coord@demo.medisense.example',
    subtitleEn: 'Orace A. (Outreach queues)',
    subtitleFr: 'Orace A. (Files de relance)',
  },
  {
    role: 'public_health',
    category: 'health_agent',
    token: 'demo-token-public-health',
    labelEn: 'Public Health Agent',
    labelFr: 'Santé Publique',
    labelAr: 'الصحة العامة',
    email: 'bienderan.epi@demo.medisense.example',
    subtitleEn: 'Bienderan E. (Population Observatory & Equity)',
    subtitleFr: 'Bienderan E. (Observatoire Population & Équité)',
  },
];

const CITIZEN_PRESETS = ALL_ROLE_PRESETS.filter((p) => p.category === 'citizen');
const HEALTH_AGENT_PRESETS = ALL_ROLE_PRESETS.filter((p) => p.category === 'health_agent');

export const AuthPages: React.FC<AuthPagesProps> = ({
  mode,
  initialRole = 'patient',
  onSwitchMode,
  onBackToLanding,
  onSelectRoleLogin,
}) => {
  const { locale } = useI18n();
  const isFr = locale === 'fr';
  const isAr = locale === 'ar';

  const initialPreset =
    ALL_ROLE_PRESETS.find((p) => p.role === initialRole) || CITIZEN_PRESETS[0];

  const [portalCategory, setPortalCategory] = useState<'citizen' | 'health_agent'>(
    initialPreset.category
  );
  const [email, setEmail] = useState(initialPreset.email);
  const [password, setPassword] = useState('MediSense-Demo-2026');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialPreset.role);
  const [selectedToken, setSelectedToken] = useState(initialPreset.token);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqProfession, setReqProfession] = useState('Family Medicine Physician');
  const [reqFacility, setReqFacility] = useState('Al Bateen Healthcare Centre');
  const [reqLicense, setReqLicense] = useState('');
  const [reqConfirmed, setReqConfirmed] = useState(false);
  const [reqSubmitted, setReqSubmitted] = useState(false);

  // Sync if initialRole changes when navigating from Landing Page
  useEffect(() => {
    const found = ALL_ROLE_PRESETS.find((p) => p.role === initialRole) || CITIZEN_PRESETS[0];
    setPortalCategory(found.category);
    setEmail(found.email);
    setPassword('MediSense-Demo-2026');
    setSelectedRole(found.role);
    setSelectedToken(found.token);
    setErrorMsg(null);
  }, [initialRole]);

  const handlePresetClick = (preset: RolePreset) => {
    setEmail(preset.email);
    setPassword('MediSense-Demo-2026');
    setSelectedRole(preset.role);
    setSelectedToken(preset.token);
    setErrorMsg(null);
  };

  const handleSwitchPortalCategory = (nextCat: 'citizen' | 'health_agent') => {
    setPortalCategory(nextCat);
    const defaultPreset =
      nextCat === 'citizen' ? CITIZEN_PRESETS[0] : HEALTH_AGENT_PRESETS[0];
    setEmail(defaultPreset.email);
    setPassword('MediSense-Demo-2026');
    setSelectedRole(defaultPreset.role);
    setSelectedToken(defaultPreset.token);
    setErrorMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 4) {
      setErrorMsg(isFr ? 'Vérifiez vos identifiants.' : 'Please check your credentials.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSelectRoleLogin(selectedRole, selectedToken);
    }, 200);
  };

  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqEmail.includes('@') || !reqLicense || !reqConfirmed) {
      setErrorMsg(isFr ? 'Tous les champs sont requis.' : 'All fields are required.');
      return;
    }
    try {
      setLoading(true);
      await apiClient.requestAccess({
        fullName: reqName,
        professionalEmail: reqEmail,
        profession: reqProfession,
        facility: reqFacility,
        licenseNumber: reqLicense,
        preferredLanguage: locale,
      });
      setReqSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const activePresets =
    portalCategory === 'citizen' ? CITIZEN_PRESETS : HEALTH_AGENT_PRESETS;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-[#041D1E] lg:bg-[#F4FAF9]"
      style={{ perspective: '1400px' }}
    >
      {/* =====================================================================
       * SMALL SCREEN ONLY (< lg): Full-Page Image Background + Light Glass
       * ===================================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0 lg:hidden"
        style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
      >
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{
            scale: [1.04, 1.1, 1.04],
            rotateX: [0, 1.5, -1, 0],
            rotateY: [-2, 2, -2],
            x: [0, -8, 8, 0],
            y: [0, -6, 5, 0],
            opacity: 1,
          }}
          transition={{
            opacity: { duration: 0.7, ease: 'easeOut' },
            scale: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
            rotateX: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
            rotateY: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 13, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={portalPathwayImg}
            alt="Physician welcoming a patient with a confirmed preventive visit pass"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Subtle glass effect on mobile background */}
        <div className="absolute inset-0 bg-[#041D1E]/28 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#041D1E]/45 via-transparent to-[#041D1E]/55" />
      </div>

      {/* =====================================================================
       * LEFT SECTION (Large Screen `lg:flex`): Full-Bleed Image Filling Entire
       * Left Half of Screen, Zero Borders, with Subtle Glass Veil
       * ===================================================================== */}
      <div
        style={{ perspective: '1400px' }}
        className="hidden lg:flex lg:flex-col lg:justify-between relative min-h-screen w-full h-full overflow-hidden p-8 xl:p-12 bg-[#041D1E]"
      >
        <motion.div
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{
            scale: [1.04, 1.09, 1.04],
            rotateX: [0, 1.5, -1, 0],
            rotateY: [-2, 2, -2],
            x: [0, -6, 6, 0],
            y: [0, -5, 4, 0],
            opacity: 1,
          }}
          transition={{
            opacity: { duration: 0.6, ease: 'easeOut' },
            scale: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
            rotateX: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
            rotateY: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 13, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={portalPathwayImg}
            alt="Physician welcoming a patient with a confirmed preventive visit pass"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Light, subtle glass effect across the entire left image section */}
        <div className="absolute inset-0 bg-[#041D1E]/18 backdrop-blur-[1.5px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041D1E]/75 via-transparent to-[#041D1E]/35 pointer-events-none" />

        {/* Top Left Bar inside Left Full-Height Image Section */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-black/30 hover:bg-black/45 backdrop-blur-md px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{isAr ? 'العودة' : isFr ? 'Accueil' : 'Home'}</span>
            </button>
            <MediSenseLogo variant="light" />
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-black/30 backdrop-blur-md text-white">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
            <span>
              {isAr
                ? 'الوقاية والفحص الدقيق · 2026'
                : isFr
                ? 'Démo MediSense · Challenge 2026'
                : 'MediSense demo · Challenge 2026'}
            </span>
          </span>
        </div>

        {/* Bottom Caption Overlay inside Left Full-Height Image Section */}
        <div className="relative z-10 rounded-2xl bg-[#041D1E]/45 backdrop-blur-sm p-6 space-y-2 text-white max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/85">
            {isAr
              ? 'رعاية وقائية متكاملة'
              : isFr
              ? 'Parcours Clinique & Logistique Unifié'
              : 'Unified Clinical & Logistics Pathway'}
          </p>
          <h2 className="text-xl xl:text-2xl font-extrabold font-heading leading-snug text-white">
            {isAr
              ? 'تحويل الإرشادات الوقائية إلى مواعيد مؤكدة'
              : isFr
              ? 'Du dépistage préventif au rendez-vous confirmé en une seule visite.'
              : 'From preventive screening rules to a confirmed single-visit care plan.'}
          </h2>
        </div>
      </div>

      {/* =====================================================================
       * RIGHT SECTION: Full-Height Login Column (Desktop Right / Mobile Center)
       * ===================================================================== */}
      <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-12 relative z-10 lg:ambient-mesh">
        {/* Top Bar (Mobile has Back + Logo + Language; Desktop has Language aligned to end) */}
        <header className="w-full flex items-center justify-between lg:justify-end gap-3">
          <div className="flex items-center gap-2.5 sm:gap-4 lg:hidden">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-white bg-black/35 hover:bg-black/50 backdrop-blur-md px-3 sm:px-3.5 py-2 rounded-xl cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{isAr ? 'العودة' : isFr ? 'Accueil' : 'Home'}</span>
            </button>
            <MediSenseLogo variant="light" />
          </div>
          <LanguageSwitch />
        </header>

        {/* Centered Authentication Card */}
        <main className="flex-1 flex items-center justify-center py-6">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md w-full mx-auto bg-white/90 lg:bg-white/95 backdrop-blur-md border border-white/90 lg:border-[#E2E8F0] shadow-[0_28px_60px_-16px_rgba(4,29,30,0.45)] lg:shadow-[0_24px_48px_-16px_rgba(11,59,60,0.14)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6"
          >
            {mode === 'login' ? (
              <>
                {/* Portal Category Security Badge + Heading */}
                <div className="space-y-2 text-center sm:text-start">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F0FDFA] text-[#0B3B3C] border border-[#99F6E4]">
                    {portalCategory === 'citizen' ? (
                      <>
                        <HeartHandshake className="w-3.5 h-3.5 text-[#0F6B6B]" />
                        <span>
                          {isAr
                            ? 'بوابة المريض والعائلة'
                            : isFr
                            ? 'Portail Citoyen · Patient & Famille'
                            : 'Citizen Portal · Patient & Family'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-3.5 h-3.5 text-[#0F6B6B]" />
                        <span>
                          {isAr
                            ? 'بوابة الكوادر الصحية المعتمدة'
                            : isFr
                            ? 'Portail Professionnel · Agents de Santé'
                            : 'Professional Portal · Healthcare Agents'}
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-[#0B3B3C] font-heading">
                    {portalCategory === 'citizen'
                      ? isAr
                        ? 'تسجيل الدخول إلى بوابة المريض الموحدة'
                        : isFr
                        ? 'Connexion au Portail Patient Unifié'
                        : 'Unified Patient Portal Sign In'
                      : isAr
                      ? 'تسجيل دخول الكوادر الصحية'
                      : isFr
                      ? 'Connexion Agents de Santé'
                      : 'Healthcare Agent Sign In'}
                  </h1>
                </div>

                {/* Role Credential Pre-fill Selector (Pre-fills credentials ONLY — never bypasses Sign In) */}
                <div className="bg-[#F8FAFC]/95 border border-[#CBD5E1] rounded-2xl p-3 sm:p-3.5 space-y-2.5">
                  <div className="flex items-center text-[11px] font-bold text-[#0B3B3C]">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#0F6B6B] shrink-0" />
                      <span>
                        {portalCategory === 'citizen'
                          ? isAr
                            ? 'اختر الملف'
                            : isFr
                            ? 'Choisissez votre profil'
                            : 'Choose your profile'
                          : isAr
                          ? 'اختر دورك'
                          : isFr
                          ? 'Choisissez votre rôle'
                          : 'Choose your role'}
                      </span>
                    </span>
                  </div>

                  <div
                    className={`grid gap-2 ${
                      portalCategory === 'citizen'
                        ? 'grid-cols-1'
                        : 'grid-cols-1 sm:grid-cols-3'
                    }`}
                  >
                    {activePresets.map((preset) => {
                      const active = selectedRole === preset.role;
                      const label = isAr
                        ? preset.labelAr
                        : isFr
                        ? preset.labelFr
                        : preset.labelEn;
                      const sub = isFr ? preset.subtitleFr : preset.subtitleEn;
                      return (
                        <button
                          key={preset.role}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`p-3 rounded-xl text-xs text-start transition-all cursor-pointer border ${
                            active
                              ? 'bg-[#0B3B3C] text-white border-[#0B3B3C] shadow-sm'
                              : 'bg-white text-[#0B3B3C] border-[#E2E8F0] hover:border-[#0B3B3C]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold block truncate">{label}</span>
                            {portalCategory === 'citizen' && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                  active
                                    ? 'bg-[#14A39A]/30 text-[#99F6E4] border border-[#2DD4BF]/40'
                                    : 'bg-[#F0FDFA] text-[#0F6B6B] border border-[#99F6E4]'
                                }`}
                              >
                                {isFr ? '+ 3 enfants' : '+ 3 children'}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] block truncate mt-1 ${
                              active ? 'text-white/85' : 'text-[#64748B]'
                            }`}
                          >
                            {sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-[#FEF2F2] text-[#B91C1C] text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {forgotNotice && (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B3B3C] text-xs font-medium">
                    {isFr ? 'Réinitialisation simulée envoyée.' : 'Simulated reset link sent.'}
                  </div>
                )}

                {/* Step 2: Explicit Authentication Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-email" className="block text-xs font-semibold text-[#0B3B3C]">
                        {portalCategory === 'citizen'
                          ? isAr
                            ? 'البريد الإلكتروني'
                            : isFr
                            ? 'Email'
                            : 'Email'
                          : isAr
                          ? 'البريد المهني'
                          : isFr
                          ? 'Email professionnel'
                          : 'Work email'}
                      </label>
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#0B3B3C] font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-xs font-semibold text-[#0B3B3C]">
                        {isAr ? 'كلمة المرور' : isFr ? 'Mot de passe' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotNotice(!forgotNotice)}
                        className="text-[11px] font-medium text-[#0B3B3C] hover:underline"
                      >
                        {isFr ? 'Oublié ?' : 'Forgot?'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pe-10 rounded-xl border border-[#CBD5E1] text-xs bg-white text-[#0B3B3C]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 end-0 px-3 text-[#64748B]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl btn-liquid-primary text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {loading
                        ? isFr
                          ? 'Vérification des droits d’accès...'
                          : 'Verifying access...'
                        : isAr
                        ? 'تسجيل الدخول'
                        : isFr
                        ? 'Se connecter'
                        : 'Sign In'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </form>

                {/* Bottom Switch Link: Patient <-> Health Agent Portal */}
                <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-center">
                  {portalCategory === 'citizen' ? (
                    <button
                      type="button"
                      onClick={() => handleSwitchPortalCategory('health_agent')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6B6B] hover:text-[#0B3B3C] hover:underline cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>
                        {isAr
                          ? 'الدخول إلى بوابة الكوادر الصحية ←'
                          : isFr
                          ? 'Accéder au portail Agents de Santé →'
                          : 'Access Healthcare Agent Portal →'}
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                        <button
                          type="button"
                          onClick={() => handleSwitchPortalCategory('citizen')}
                          className="font-semibold text-[#0F6B6B] hover:text-[#0B3B3C] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                          <span>
                            {isAr
                              ? 'العودة إلى بوابة المريض الموحدة'
                              : isFr
                              ? 'Retour au Portail Patient Unifié'
                              : 'Back to Unified Patient Portal'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSwitchMode('request-access')}
                          className="font-semibold text-[#0B3B3C] hover:underline cursor-pointer"
                        >
                          {isAr
                            ? 'طلب صلاحية ممارس صحي'
                            : isFr
                            ? 'Demander un accès professionnel'
                            : 'Request access'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Request Access Form */
              <div className="space-y-4">
                <h1 className="text-lg sm:text-xl font-bold text-[#0B3B3C] font-heading">
                  {isFr ? 'Demande d’accès médecin' : 'Request Clinician Access'}
                </h1>

                {reqSubmitted ? (
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-[#0B3B3C] mx-auto" />
                    <p className="text-sm font-bold text-[#0B3B3C]">
                      {isFr ? 'Demande reçue — en attente de validation' : 'Request received — pending validation'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setReqSubmitted(false);
                        onSwitchMode('login');
                      }}
                      className="px-4 py-2 rounded-xl btn-liquid-primary text-xs font-semibold"
                    >
                      {isFr ? 'Retour' : 'Back to Sign In'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRequestAccessSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="Full Name (e.g. Dr. Amina Al-Hosani)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs bg-white"
                      required
                    />
                    <input
                      type="email"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="Professional Email"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs bg-white"
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={reqProfession}
                        onChange={(e) => setReqProfession(e.target.value)}
                        placeholder="Profession"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs bg-white"
                        required
                      />
                      <input
                        type="text"
                        value={reqLicense}
                        onChange={(e) => setReqLicense(e.target.value)}
                        placeholder="Professional licence number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs bg-white font-mono"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={reqFacility}
                      onChange={(e) => setReqFacility(e.target.value)}
                      placeholder="Facility"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs bg-white"
                      required
                    />
                    <label className="flex items-start gap-2 text-xs text-[#475569] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reqConfirmed}
                        onChange={(e) => setReqConfirmed(e.target.checked)}
                        className="mt-0.5 shrink-0"
                      />
                      <span>I confirm professional healthcare authorization.</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl btn-liquid-primary text-xs font-semibold cursor-pointer"
                      >
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={() => onSwitchMode('login')}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </main>

        <footer className="text-center text-[11px] text-white/85 lg:text-[#64748B] px-4">
          <p>
            {isFr
              ? 'Prototype indépendant réalisé par l’équipe CareX. Sans affiliation avec, ni approbation d’une autorité de santé. Données 100 % synthétiques.'
              : 'Independent prototype built by team CareX. Not affiliated with, or endorsed by, any health authority. 100% synthetic data.'}
          </p>
        </footer>
      </div>
    </div>
  );
};
