import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroTriage } from './components/HeroTriage';
import { VoiceModal } from './components/VoiceModal';
import { TriageResultCard } from './components/TriageResultCard';
import { FacilitiesDirectory } from './components/FacilitiesDirectory';
import { TeleconsultationSection } from './components/TeleconsultationSection';
import { FamilyRecord } from './components/FamilyRecord';
import { MedicalCommitteeAudit } from './components/MedicalCommitteeAudit';
import { FooterLegal } from './components/FooterLegal';
import { PatientProfile, TriageResult, LocalLanguage } from './types';
import { INITIAL_PATIENT } from './data/mockData';

export const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [currentLang, setCurrentLang] = useState<LocalLanguage>('fon');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeTriageResult, setActiveTriageResult] = useState<TriageResult | null>(null);

  const [consultationsHistory, setConsultationsHistory] = useState<TriageResult[]>([
    {
      id: 'TRG-HIST-01',
      patientName: 'Koffi (Enfant 3 ans)',
      urgency: 'ROUGE',
      conditionName: 'Fièvre et refus de téter (PCIME)',
      icd10Code: 'R56.0',
      adviceFrench: 'Transfert d\'urgence à l\'hôpital le plus proche validé.',
      adviceLocalLanguage: 'ALODO ! Vi mitɔn ɖo tagba mɛ.',
      recommendedFacility: 'CHU-MEL Cotonou (Urgences Pédiatriques)',
      xaiExplanation: 'Signe de danger général PCIME confirmé.',
      ruleBasedOverride: true,
      timestamp: 'Il y a 3 jours',
    },
    {
      id: 'TRG-HIST-02',
      patientName: 'Maman (Adulte 32 ans)',
      urgency: 'VERT',
      conditionName: 'Courbatures légères',
      icd10Code: 'R53',
      adviceFrench: 'Hydratation, repos et conseils de votre pharmacien.',
      adviceLocalLanguage: 'Gbɔjɛ bo nu sin ganji.',
      recommendedFacility: 'Pharmacie Akassato Calavi',
      xaiExplanation: 'Fatigue physique sans fièvre ni détresse respiratoire.',
      ruleBasedOverride: false,
      timestamp: 'Il y a 12 jours',
    },
  ]);

  const handleTriageComputed = (result: TriageResult) => {
    setActiveTriageResult(result);
    setConsultationsHistory((prev) => [result, ...prev]);
  };

  const handleSosClick = () => {
    const sosResult: TriageResult = {
      id: `TRG-SOS-${Date.now()}`,
      patientName: patient.name,
      urgency: 'ROUGE',
      conditionName: 'Urgence Vitale Immédiate (Alerte Déclenchée)',
      icd10Code: 'R56.0',
      adviceFrench:
        'URGENCE VITALE : Veuillez contacter sans délai le SAMU Bénin (112) ou vous rendre aux urgences hospitalières les plus proches.',
      adviceLocalLanguage: 'ALODO SYƐNSYƐN ! Mi hɛn yi dotoxwe klewun !',
      recommendedFacility: 'CHU-MEL Cotonou / Hôpital de Zone Calavi',
      xaiExplanation: 'Déclenchement direct par touche d\'urgence SOS.',
      ruleBasedOverride: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    handleTriageComputed(sosResult);
  };

  const handleScrollToAudit = () => {
    const el = document.getElementById('audit-portal');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToTeleconsult = () => {
    setActiveTriageResult(null);
    const el = document.getElementById('teleconsultation');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToFacilities = () => {
    setActiveTriageResult(null);
    window.scrollTo({ top: 1200, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] selection:bg-medigreen-100 selection:text-medigreen-800">
      {/* Header */}
      <Header
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        onSosClick={handleSosClick}
        onAuditClick={handleScrollToAudit}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero & Clinical Triage Input */}
        <HeroTriage
          patient={patient}
          onUpdatePatient={setPatient}
          currentLang={currentLang}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onTriageComputed={handleTriageComputed}
        />

        {/* Directory of Hospitals and Pharmacies */}
        <FacilitiesDirectory />

        {/* Teleconsultation Section & Mobile Money */}
        <TeleconsultationSection />

        {/* Family Health Record & Follow-up (J+2) */}
        <FamilyRecord consultations={consultationsHistory} />

        {/* Medical Committee Audit Section */}
        <MedicalCommitteeAudit />
      </main>

      {/* Modal Saisie Vocale */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        lang={currentLang}
        onConfirmText={(_text) => {
          handleTriageComputed({
            id: `TRG-${Date.now()}`,
            patientName: patient.name,
            urgency: 'ROUGE',
            conditionName: 'Urgence Pédiatrique Majeure (PCIME)',
            icd10Code: 'R56.0',
            adviceFrench:
              'URGENCE VITALE : Signe général de danger détecté. L\'enfant vomit tout et refuse de téter. Conduisez-le d\'urgence au centre de santé ou à l\'hôpital le plus proche.',
            adviceLocalLanguage:
              'ALODO ! Vi mitɔn ɖo tagba syɛnsyɛn mɛ. Mi hɛn yi dotoxwe klewun !',
            recommendedFacility: 'CHU-MEL Cotonou (Urgences Pédiatriques)',
            xaiExplanation:
              'Transcription vocale : "Refus de téter" + "Vomit tout" -> 2 Signes Généraux de Danger PCIME confirmés.',
            ruleBasedOverride: true,
            timestamp: new Date().toLocaleTimeString(),
          });
        }}
      />

      {/* Modal Résultat de Triage 3 Niveaux */}
      {activeTriageResult && (
        <TriageResultCard
          result={activeTriageResult}
          currentLang={currentLang}
          onClose={() => setActiveTriageResult(null)}
          onSelectTeleconsult={handleScrollToTeleconsult}
          onViewFacilities={handleScrollToFacilities}
        />
      )}

      {/* Footer & Legal */}
      <FooterLegal />
    </div>
  );
};

export default App;
