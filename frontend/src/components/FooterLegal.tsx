import React from 'react';
import { ShieldCheck, Heart, AlertCircle } from 'lucide-react';

export const FooterLegal: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-white pt-12 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Avertissement Médical Légal Obligatoire */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5 text-xs text-gray-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-white uppercase tracking-wider block mb-1">
              Avertissement Médical Légal Obligatoire :
            </span>
            « MediBenin est un outil d'aide à l'orientation et au triage médical. Il ne se substitue pas à une consultation médicale présentielle et ne pose aucun diagnostic définitif. En cas de détresse respiratoire, convulsion ou perte de connaissance, appelez immédiatement le SAMU Bénin au 112 ou rendez-vous au centre de santé le plus proche. »
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
              « La santé est un droit, pas un privilège urbain. »
              Conçu pour combler les déserts médicaux en Afrique de l'Ouest grâce à une IA vocale multilingue adaptée aux réalités du Bénin.
            </p>
          </div>

          {/* Colonne 2 : Protection APDP Bénin */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">
              Conformité Numérique & APDP
            </h4>
            <ul className="space-y-1.5 text-gray-400">
              <li>• Loi n° 2017-20 portant Code du Numérique au Bénin</li>
              <li>• Chiffrement fort des données de santé (AES-256)</li>
              <li>• Pseudonymisation intégrale des identités patients</li>
              <li>• Interopérabilité sanitaire format DHIS2</li>
            </ul>
          </div>

          {/* Colonne 3 : Challenge 04 Future Health */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">
              Future Health Challenge 2026
            </h4>
            <p className="text-gray-400 leading-relaxed mb-2">
              Défi 04 : Prévention & Dépistage de Précision.
            </p>
            <p className="text-gray-500 text-[11px]">
              Mohamed bin Zayed University of Artificial Intelligence (MBZUAI) • Abu Dhabi, EAU.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <div>© 2026 MediBenin • CareX. Tous droits réservés.</div>
          <div className="flex items-center gap-1">
            <span>Développé avec</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>pour le Bénin</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
