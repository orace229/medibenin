import React from 'react';
import { ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface FooterLegalProps {
  currentLang?: Language;
}

export const FooterLegal: React.FC<FooterLegalProps> = ({ currentLang = 'fr' }) => {
  const t = TRANSLATIONS[currentLang].footer;

  return (
    <footer className="bg-gray-950 text-white pt-12 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Avertissement Médical Légal Obligatoire */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5 text-xs text-gray-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-white uppercase tracking-wider block mb-1">
              {t.disclaimerTitle}
            </span>
            {t.disclaimerText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-white/10 text-xs">
          {/* Colonne 1 : Vision */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-medigreen-500" />
              <span className="font-black text-sm tracking-wider">MEDIBENIN • CareX</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              <span className="text-gray-200 font-semibold">{t.brandTagline}</span>{' '}
              {t.brandMission}
            </p>
          </div>

          {/* Colonne 2 : Protection APDP Bénin */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">
              {t.complianceTitle}
            </h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>{t.complianceLaw}</li>
              <li>{t.complianceEncryption}</li>
              <li>{t.compliancePseudonymization}</li>
              <li>{t.complianceDhis2}</li>
            </ul>
          </div>

          {/* Colonne 3 : Challenge 04 Future Health */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">
              {t.challengeTitle}
            </h4>
            <p className="text-gray-400 leading-relaxed mb-2">
              {t.challengeTopic}
            </p>
            <p className="text-gray-500 text-[11px]">
              {t.challengeOrg}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <div>{t.copyright}</div>
          <div className="flex items-center gap-1">
            <span>{t.developedWith}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>{t.forBenin}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
