import React, { useState } from 'react';
import { ConsentPurposes } from '../types/medisense';
import { 
  CheckCircle2, XCircle, 
  Clock, Shield, MessageSquare
} from 'lucide-react';

export const EngagementChoiceView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'ar' | 'en'>('ar');
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
                Écran 4 • Engagement & Consentement
              </span>
              <span className="text-xs text-purple-200 font-medium">CDC §3.3 & §6</span>
            </div>
            <h2 className="text-xl font-black mt-1">Engagement Culturellement Adapté & Choix Éclairé</h2>
            <p className="text-xs text-purple-100 max-w-2xl mt-1 leading-relaxed">
              MediSense respecte l'autonomie des familles : <strong>aides à la décision courtes en arabe et anglais</strong>, 
              <strong>consentement granulaire par finalité</strong>, et <strong>arrêt immédiat des relances en cas de refus</strong> sans pénalité d'accès aux soins.
            </p>
          </div>

          {/* Sélecteur de Langue Arabe / Anglais */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/20">
            <button
              onClick={() => setSelectedLang('ar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedLang === 'ar' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              العربية (Arabe)
            </button>
            <button
              onClick={() => setSelectedLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedLang === 'en' ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-200 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne 1 : Aides à la Décision & Messages d'Invitation */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-700" />
                <span>Aide à la Décision (3 à 5 phrases)</span>
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setDecisionAidTopic('fit')}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                    decisionAidTopic === 'fit' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Dépistage FIT
                </button>
                <button
                  onClick={() => setDecisionAidTopic('wcv')}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                    decisionAidTopic === 'wcv' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Visite Enfant
                </button>
                <button
                  onClick={() => setDecisionAidTopic('diabetes')}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg transition ${
                    decisionAidTopic === 'diabetes' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Bilan Diabète
                </button>
              </div>
            </div>

            {/* Contenu de l'aide à la décision (Annexe D) */}
            <div className={`p-4 rounded-xl border ${selectedLang === 'ar' ? 'text-right' : 'text-left'} bg-purple-50/40 border-purple-100`}>
              {selectedLang === 'ar' ? (
                decisionAidTopic === 'fit' ? (
                  <div className="text-xs text-gray-800 space-y-2 leading-relaxed" dir="rtl">
                    <p className="font-bold text-purple-900">فحص الكشف المبكر عن سرطان القولون (FIT) :</p>
                    <p>هذا الفحص البسيط يبحث عن آثار دم خفية في البراز ويتم إجراؤه في منزلك خلال دقائق معدودة.</p>
                    <p>يساعد الفحص في اكتشاف الأورام الحميدة في مرحلة مبكرة حيث يسهل علاجها بنجاح كبير.</p>
                    <p>النتيجة الإيجابية لا تعني بالضرورة وجود ورم خبيث، بل تتطلب فقط فحصاً تأكيدياً بالمنظار.</p>
                    <p className="text-gray-500 font-semibold">يحق لك الرفض أو تأجيل الموعد دون أي تأثير على رعايتك الصحية.</p>
                  </div>
                ) : decisionAidTopic === 'wcv' ? (
                  <div className="text-xs text-gray-800 space-y-2 leading-relaxed" dir="rtl">
                    <p className="font-bold text-purple-900">زيارة صحة الطفل الدورية (18 شهراً) :</p>
                    <p>تهدف هذه الزيارة إلى متابعة نمو طفلكم، واكتمال تطوره الحركي واللغوي، وتلقي الجرعات التنشيطية.</p>
                    <p>تشمل الزيارة فحصاً مبكراً للأنيميا واختبار التفاعل الاجتماعي المعتمد من دائرة الصحة.</p>
                    <p className="text-gray-500 font-semibold">المشاركة تضمن حماية الطفل وتسهيل تسجيله في الروضة والمدرسة.</p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-800 space-y-2 leading-relaxed" dir="rtl">
                    <p className="font-bold text-purple-900">فحص السكري والكوليسترول الشامل (IFHAS) :</p>
                    <p>فحص دوري موصى به للأفراد المعرضين لعوامل الخطر الأسرية أو نمط الحياة للوقاية قبل ظهور الأعراض.</p>
                    <p className="text-gray-500 font-semibold">تحليل دم بسيط على الريق يتيح ضبط الخطة الوقائية مبكراً.</p>
                  </div>
                )
              ) : (
                decisionAidTopic === 'fit' ? (
                  <div className="text-xs text-gray-800 space-y-2 leading-relaxed">
                    <p className="font-bold text-purple-900">Colorectal Cancer Screening (FIT Test):</p>
                    <p>This test checks for invisible traces of blood in the stool. It takes only a few minutes in the privacy of your home.</p>
                    <p>It helps find early non-cancerous growths when treatment is easiest and most effective.</p>
                    <p>A positive result does not mean cancer: most follow-up checks are reassuring, but an assessment is necessary.</p>
                    <p className="text-gray-500 font-semibold">You have the full right to accept, postpone, or refuse without any penalty to your healthcare access.</p>
                  </div>
                ) : decisionAidTopic === 'wcv' ? (
                  <div className="text-xs text-gray-800 space-y-2 leading-relaxed">
                    <p className="font-bold text-purple-900">Well-Child Preventive Visit (18 Months):</p>
                    <p>This visit tracks your child's physical growth, speech milestones, and required immunization booster doses.</p>
                    <p>It includes a painless screening for infant anemia and developmental milestones per Abu Dhabi DoH standards.</p>
                    <p className="text-gray-500 font-semibold">Supporting your child’s health now prevents future delays and supports school readiness.</p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-800 space-y-2 leading-relaxed">
                    <p className="font-bold text-purple-900">Cardiometabolic Screening (IFHAS Program):</p>
                    <p>A comprehensive assessment to detect high blood pressure and blood sugar risks before any symptoms arise.</p>
                    <p className="text-gray-500 font-semibold">Early detection enables personalized nutrition and physical activity to prevent complications.</p>
                  </div>
                )
              )}
            </div>

            {/* Boutons d'action du patient : Choix Réel (Section 6.5) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-medigreen-700 hover:bg-medigreen-800 text-white font-bold text-xs transition active:scale-95">
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedLang === 'ar' ? 'تأكيد الموعد (Confirmer)' : 'Confirm Appointment'}</span>
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition">
                <Clock className="w-4 h-4" />
                <span>{selectedLang === 'ar' ? 'اختيار تاريخ آخر (Reporter)' : 'Postpone Date'}</span>
              </button>
              <button
                onClick={handleRefusal}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>{selectedLang === 'ar' ? 'رفض المشاركة (Refuser)' : 'Decline (No penalty)'}</span>
              </button>
            </div>

            {refusalRecorded && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Refus pris en compte immédiatement (CDC §5.4) :</strong> Toutes les relances de rappel sont désactivées. La personne reste pleinement couverte pour ses soins futurs.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Colonne 2 : Consentement Granulaire par Finalité (CDC §3.3) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-medigreen-700" />
                <span>Consentement Granulaire par Finalité (5 Clés)</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Conformité Loi Fédérale n°2/2019 et Décret PDPL n°45/2021
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'evaluationCalendar' as keyof ConsentPurposes,
                title: '1. Évaluation et calendrier de prévention',
                desc: 'Permet le croisement des données d’âge, mesures cliniques et antécédents familiaux.'
              },
              {
                key: 'channelReminders' as keyof ConsentPurposes,
                title: '2. Envoi de rappels sur le canal choisi',
                desc: 'Permet la notification par SMS ou WhatsApp sécurisé avant l’échéance du dépistage.'
              },
              {
                key: 'transmissionToFacility' as keyof ConsentPurposes,
                title: '3. Transmission de l’orientation au centre de santé',
                desc: 'Transmet le code d’orientation (CarePlan FHIR) à la clinique de rattachement DoH.'
              },
              {
                key: 'anonymousAggregatedStats' as keyof ConsentPurposes,
                title: '4. Statistiques de santé publique anonymisées',
                desc: 'Participe aux indicateurs de couverture régionale sans transmission de données nominatives.'
              },
              {
                key: 'genomicExistingUse' as keyof ConsentPurposes,
                title: '5. Utilisation d’un score génomique existant',
                desc: 'Permet uniquement de vérifier l’éligibilité à un bilan précoce (Règle G1). Ne retarde jamais un soin.'
              }
            ].map((purpose) => {
              const isChecked = consentState[purpose.key];

              return (
                <div
                  key={purpose.key}
                  onClick={() => toggleConsent(purpose.key)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                    isChecked
                      ? 'bg-medigreen-50/50 border-medigreen-300'
                      : 'bg-gray-50 border-gray-200 opacity-70'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900">{purpose.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{purpose.desc}</div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-medigreen-700 rounded border-gray-300 mt-0.5 pointer-events-none"
                  />
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500">
            <strong>Droit de retrait permanent :</strong> Chaque case peut être décochée à tout instant. Les données sont alors immédiatement exclues du moteur de calcul.
          </div>
        </div>
      </div>
    </div>
  );
};
