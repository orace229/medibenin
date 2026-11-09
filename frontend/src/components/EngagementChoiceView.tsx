import React, { useState } from 'react';
import { ConsentPurposes } from '../types/medisense';
import { 
  CheckCircle2, XCircle, 
  Clock, Shield, MessageSquare
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface EngagementChoiceViewProps {
  currentLang?: Language;
  onToggleLang?: (lang: Language) => void;
}

export const EngagementChoiceView: React.FC<EngagementChoiceViewProps> = ({
  currentLang = 'fr',
  onToggleLang
}) => {
  const t = TRANSLATIONS[currentLang];
  const [decisionAidTopic, setDecisionAidTopic] = useState<'fit' | 'wcv' | 'diabetes'>('fit');
  const [refusalRecorded, setRefusalRecorded] = useState(false);
  const [consentState, setConsentState] = useState<ConsentPurposes>({
    evaluationCalendar: true,
    channelReminders: true,
    transmissionToFacility: true,
    anonymousAggregatedStats: true,
    genomicExistingUse: false
  });

  const toggleConsent = (key: keyof ConsentPurposes) => {
    setConsentState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRefusal = () => {
    setRefusalRecorded(true);
  };

  return (
    <div className="space-y-6">
      {/* Header explicatif pour le jury */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[11px] font-bold uppercase tracking-wider">
                {currentLang === 'fr' ? 'Écran 4 • Engagement & Consentement' : 'Screen 4 • Engagement & Consent'}
              </span>
              <span className="text-xs text-purple-200 font-medium">CDC §3.3 & §6</span>
            </div>
            <h2 className="text-xl font-black mt-1">{t.engagement.headerTitle}</h2>
            <p className="text-xs text-purple-100 max-w-2xl mt-1 leading-relaxed">
              {t.engagement.headerDesc}
            </p>
          </div>

          {/* Sélecteur de Langue FR / EN */}
          {onToggleLang && (
            <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/20 shrink-0">
              <button
                onClick={() => onToggleLang('fr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentLang === 'fr' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
                }`}
              >
                Français (FR)
              </button>
              <button
                onClick={() => onToggleLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentLang === 'en' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
                }`}
              >
                English (EN)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Aides à la Décision & Messages d'Invitation */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-700" />
                <span>{t.engagement.decisionAidsTitle}</span>
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setDecisionAidTopic('fit')}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                    decisionAidTopic === 'fit' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.engagement.topics.fit}
                </button>
                <button
                  onClick={() => setDecisionAidTopic('wcv')}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                    decisionAidTopic === 'wcv' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.engagement.topics.wcv}
                </button>
                <button
                  onClick={() => setDecisionAidTopic('diabetes')}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                    decisionAidTopic === 'diabetes' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.engagement.topics.diabetes}
                </button>
              </div>
            </div>

            {/* Contenu de l'aide à la décision (Bilingue FR / EN) */}
            <div className="p-4 rounded-xl border bg-purple-50/40 border-purple-100">
              {decisionAidTopic === 'fit' ? (
                <div className="text-xs text-gray-800 space-y-2 leading-relaxed">
                  <p className="font-bold text-purple-900">{t.engagement.fitText.title}</p>
                  <p>{t.engagement.fitText.p1}</p>
                  <p>{t.engagement.fitText.p2}</p>
                  <p>{t.engagement.fitText.p3}</p>
                  <p className="text-gray-500 font-semibold">{t.engagement.fitText.disclaimer}</p>
                </div>
              ) : decisionAidTopic === 'wcv' ? (
                <div className="text-xs text-gray-800 space-y-2 leading-relaxed">
                  <p className="font-bold text-purple-900">{t.engagement.wcvText.title}</p>
                  <p>{t.engagement.wcvText.p1}</p>
                  <p>{t.engagement.wcvText.p2}</p>
                  <p>{t.engagement.wcvText.p3}</p>
                  <p className="text-gray-500 font-semibold">{t.engagement.wcvText.disclaimer}</p>
                </div>
              ) : (
                <div className="text-xs text-gray-800 space-y-2 leading-relaxed">
                  <p className="font-bold text-purple-900">{t.engagement.diabetesText.title}</p>
                  <p>{t.engagement.diabetesText.p1}</p>
                  <p>{t.engagement.diabetesText.p2}</p>
                  <p className="text-gray-500 font-semibold">{t.engagement.diabetesText.disclaimer}</p>
                </div>
              )}
            </div>

            {/* Boutons d'action du patient : Choix Réel (Section 6.5) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition active:scale-95">
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Confirmer le rendez-vous' : 'Confirm Appointment'}</span>
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition">
                <Clock className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Reporter la date' : 'Postpone Date'}</span>
              </button>
              <button
                onClick={handleRefusal}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Refuser (Arrêter les relances)' : 'Decline (Stop Reminders)'}</span>
              </button>
            </div>

            {/* Message immédiat de prise en compte du refus */}
            {refusalRecorded && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {currentLang === 'fr' ? 'Refus enregistré conformément au CDC §6.5' : 'Refusal recorded per CDC §6.5'}
                  </div>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    {t.engagement.refusalNotice}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Journal d'usage des données (Transparence) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>{currentLang === 'fr' ? 'Journal d’Usage des Données (Audit Patient)' : 'Data Usage Log (Patient Audit)'}</span>
            </h3>
            <p className="text-xs text-gray-500">
              {currentLang === 'fr'
                ? 'Conformément au CDC §6.4, chaque lecture ou calcul algorithmique est tracé et consultable par la famille :'
                : 'Per CDC §6.4, every data access or algorithmic inference is logged and visible to the family:'}
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span>08/11/2026 14:32</span>
                <span className="font-bold text-gray-700">Calcul Sprio (Coordination)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Finalité 1</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span>08/11/2026 09:15</span>
                <span className="font-bold text-gray-700">Envoi SMS Rappel (Al Bateen)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Finalité 2</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span>05/11/2026 18:00</span>
                <span className="font-bold text-gray-700">Agrégation Statistique Anonyme</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Finalité 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 2 : Les 5 Finalités de Consentement Granulaire */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">
              {t.engagement.consentPurposesTitle}
            </h3>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Opt-in Indépendant
            </span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            {currentLang === 'fr'
              ? 'Conformément au CDC §6.3, le consentement n’est jamais global. Le refus d’une finalité (ex: recherche) ne bloque jamais les soins :'
              : 'Per CDC §6.3, consent is never bundled. Declining one purpose (e.g., research) never blocks clinical care:'}
          </p>

          <div className="space-y-3">
            {/* Finalité 1 */}
            <div className="p-3.5 rounded-xl border border-gray-200 flex items-start justify-between gap-3 bg-gray-50/50">
              <div>
                <div className="font-bold text-xs text-gray-900">1. Évaluation du calendrier de prévention</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Autorise l'algorithme à calculer les lacunes selon votre profil et âge.
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentState.evaluationCalendar}
                onChange={() => toggleConsent('evaluationCalendar')}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* Finalité 2 */}
            <div className="p-3.5 rounded-xl border border-gray-200 flex items-start justify-between gap-3 bg-gray-50/50">
              <div>
                <div className="font-bold text-xs text-gray-900">2. Envoi des rappels et invitations</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Réception de notifications WhatsApp, SMS ou portail pour vos rendez-vous.
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentState.channelReminders}
                onChange={() => toggleConsent('channelReminders')}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* Finalité 3 */}
            <div className="p-3.5 rounded-xl border border-gray-200 flex items-start justify-between gap-3 bg-gray-50/50">
              <div>
                <div className="font-bold text-xs text-gray-900">3. Transmission au centre de soins sélectionné</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Partage sécurisé du dossier préalable avec le praticien pour préparer la visite.
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentState.transmissionToFacility}
                onChange={() => toggleConsent('transmissionToFacility')}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* Finalité 4 */}
            <div className="p-3.5 rounded-xl border border-gray-200 flex items-start justify-between gap-3 bg-gray-50/50">
              <div>
                <div className="font-bold text-xs text-gray-900">4. Statistiques agrégées et anonymes de santé publique</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Contribution anonymisée au pilotage territorial d'Abu Dhabi (ADPHC).
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentState.anonymousAggregatedStats}
                onChange={() => toggleConsent('anonymousAggregatedStats')}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer mt-0.5"
              />
            </div>

            {/* Finalité 5 (Génomique) */}
            <div className="p-3.5 rounded-xl border border-purple-200 flex items-start justify-between gap-3 bg-purple-50/30">
              <div>
                <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <span>5. Utilisation des données génomiques existantes (Emirati Genome Program)</span>
                  <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-bold">Spécifique</span>
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">
                  Recherche de variants monogéniques actionnables uniquement si vous avez déjà participé au programme national.
                </div>
              </div>
              <input
                type="checkbox"
                checked={consentState.genomicExistingUse}
                onChange={() => toggleConsent('genomicExistingUse')}
                className="w-5 h-5 text-purple-600 rounded cursor-pointer mt-0.5"
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] text-gray-400 border-t border-gray-100 flex items-center justify-between">
            <span>Révocation possible à tout instant via l'application mobile.</span>
            <span className="font-mono font-bold text-emerald-700">Chiffré AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
};
