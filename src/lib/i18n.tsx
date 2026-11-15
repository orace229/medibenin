import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from './types.ts';
import { en } from './i18n/en.ts';
import { fr } from './i18n/fr.ts';

const translations: Record<Locale, Record<string, string>> = { en, fr };

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
  const isRtl = false;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
  }, [locale, isRtl]);

  const t = (key: string) => translations[locale][key] || translations.en[key] || key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
