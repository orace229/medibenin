import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from './types.ts';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    demoBanner: 'Demonstration environment — 100% synthetic data · Not for clinical use',
    brandTagline: 'Precision Prevention & Screening',
    navProblem: 'The Problem',
    navHowItWorks: 'How It Works',
    navForWhom: 'Who It Serves',
    navResponsibility: 'Responsible AI',
    navFaq: 'FAQ',
    signIn: 'Sign In',
    accessDashboard: 'Access Dashboard',
    levelRed: 'Urgent',
    levelOrange: 'Priority',
    levelYellow: 'To schedule',
    levelGreen: 'Up to date',
    levelGrey: 'Insufficient data',
    certaintyHigh: 'High certainty',
    certaintyMedium: 'Medium certainty',
    certaintyLow: 'Low certainty (To confirm)',
    certaintyHighTooltip: 'Recent and complete clinical measurements',
    certaintyMediumTooltip: 'Some data is self-reported or older than 12 months',
    certaintyLowTooltip: 'To be confirmed with a new clinical measurement',
    stateCreated: 'Created',
    stateValidated: 'Validated',
    stateInvited: 'Invited',
    stateScheduled: 'Scheduled',
    statePostponed: 'Postponed',
    stateOverdue: 'Overdue',
    stateDone: 'Completed & Confirmed',
    stateRefused: 'Declined',
    aiSuggestionBadge: 'AI-generated suggestion — requires clinician validation',
    validateBtn: 'Validate',
    editBtn: 'Modify',
    ignoreBtn: 'Ignore',
    confirmBtn: 'Confirm',
    postponeBtn: 'Reschedule',
    refuseBtn: 'Decline (No impact on care)',
    passQrLabel: 'Present this 8-character pass at the health centre reception',
  },
  fr: {
    demoBanner: 'Environnement de démonstration — données synthétiques · Non destiné à un usage clinique',
    brandTagline: 'Prévention et dépistage de précision',
    navProblem: 'Le problème',
    navHowItWorks: 'Comment ça marche',
    navForWhom: 'Pour qui',
    navResponsibility: 'Responsabilité',
    navFaq: 'FAQ',
    signIn: 'Se connecter',
    accessDashboard: 'Accéder au tableau de bord',
    levelRed: 'Urgent',
    levelOrange: 'Prioritaire',
    levelYellow: 'À planifier',
    levelGreen: 'À jour',
    levelGrey: 'Données insuffisantes',
    certaintyHigh: 'Certitude Haute',
    certaintyMedium: 'Certitude Moyenne',
    certaintyLow: 'Certitude Faible (À confirmer)',
    certaintyHighTooltip: 'Données récentes et complètes',
    certaintyMediumTooltip: 'Certaines données sont déclarées ou anciennes',
    certaintyLowTooltip: 'À confirmer par une nouvelle mesure',
    stateCreated: 'Créée',
    stateValidated: 'Validée',
    stateInvited: 'Invitée',
    stateScheduled: 'Planifiée',
    statePostponed: 'Reportée',
    stateOverdue: 'En retard',
    stateDone: 'Réalisée (Confirmée)',
    stateRefused: 'Refusée',
    aiSuggestionBadge: 'Suggestion générée par IA — à valider par le soignant',
    validateBtn: 'Valider',
    editBtn: 'Modifier',
    ignoreBtn: 'Ignorer',
    confirmBtn: 'Confirmer',
    postponeBtn: 'Reporter',
    refuseBtn: 'Refuser (Sans conséquence)',
    passQrLabel: "Présentez ce code à 8 caractères à l'accueil du centre",
  },
  ar: {
    demoBanner: 'بيئة تجريبية — بيانات اصطناعية بالكامل · غير مخصصة للاستخدام السريري الفعلي',
    brandTagline: 'الوقاية والفحص الدقيق',
    navProblem: 'المشكلة',
    navHowItWorks: 'كيف يعمل',
    navForWhom: 'لمن صُمم',
    navResponsibility: 'ذكاء اصطناعي مسؤول',
    navFaq: 'الأسئلة الشائعة',
    signIn: 'تسجيل الدخول',
    accessDashboard: 'الدخول إلى لوحة التحكم',
    levelRed: 'عاجل',
    levelOrange: 'أولوية',
    levelYellow: 'للجدولة',
    levelGreen: 'محدّث',
    levelGrey: 'بيانات غير كافية',
    certaintyHigh: 'موثوقية عالية',
    certaintyMedium: 'موثوقية متوسطة',
    certaintyLow: 'موثوقية منخفضة (للتأكيد)',
    certaintyHighTooltip: 'بيانات سريرية حديثة ومكتملة',
    certaintyMediumTooltip: 'بعض البيانات مصرح بها ذاتياً أو قديمة',
    certaintyLowTooltip: 'يتطلب التأكيد بقياس سريري جديد',
    stateCreated: 'تم الإنشاء',
    stateValidated: 'تم الاعتماد',
    stateInvited: 'تمت الدعوة',
    stateScheduled: 'مجدول',
    statePostponed: 'مؤجل',
    stateOverdue: 'متأخر',
    stateDone: 'مكتمل ومؤكد',
    stateRefused: 'مرفوض باختيار المريض',
    aiSuggestionBadge: 'اقتراح مولّد بالذكاء الاصطناعي — يتطلب مصادقة الطبيب',
    validateBtn: 'اعتماد',
    editBtn: 'تعديل',
    ignoreBtn: 'تجاهل',
    confirmBtn: 'تأكيد الموعد',
    postponeBtn: 'تأجيل',
    refuseBtn: 'رفض (دون أي تأثير على الرعاية)',
    passQrLabel: 'يرجى إبراز رمز التوجيه المكون من 8 خانات في استقبال المركز الصحي',
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
  isRtl: false,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const isRtl = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [locale, isRtl]);

  const t = (key: string) => translations[locale][key] || translations.en[key] || key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
