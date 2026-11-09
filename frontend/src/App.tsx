import React, { useState } from 'react';
import { SidebarNavigation } from './components/SidebarNavigation';
import { ContentTopBar } from './components/ContentTopBar';
import { MediSenseTab } from './components/NavigationTabs';
import { PopulationPrioritizationView } from './components/PopulationPrioritizationView';
import { ClinicalIndividualView } from './components/ClinicalIndividualView';
import { PopulationSafeguardsView } from './components/PopulationSafeguardsView';
import { EngagementChoiceView } from './components/EngagementChoiceView';
import { BenchmarkEvaluationView } from './components/BenchmarkEvaluationView';

// Modules du socle de triage de symptômes (historique académique)
import { HeroTriage } from './components/HeroTriage';
import { VoiceModal } from './components/VoiceModal';
import { TriageResultCard } from './components/TriageResultCard';
import { FacilitiesDirectory } from './components/FacilitiesDirectory';
import { TeleconsultationSection } from './components/TeleconsultationSection';
import { FamilyRecord } from './components/FamilyRecord';
import { MedicalCommitteeAudit } from './components/MedicalCommitteeAudit';
import { FooterLegal } from './components/FooterLegal';

import { Language } from './i18n/translations';
import { SYNTHETIC_PERSONAS } from './data/personas';
import { PersonaProfile, FollowupState } from './types/medisense';
import { PatientProfile, TriageResult, LocalLanguage } from './types';
import { INITIAL_PATIENT } from './data/mockData';

export const App: React.FC = () => {
  // Navigation principale MediSense (Future Health Challenge)
  const [activeTab, setActiveTab] = useState<MediSenseTab>('population');
  const [personas, setPersonas] = useState<PersonaProfile[]>(SYNTHETIC_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<PersonaProfile>(SYNTHETIC_PERSONAS[0]);
  const [appLang, setAppLang] = useState<Language>('fr');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Mode d'affichage : Défi 04 Abu Dhabi (par défaut) vs Mode Triage Aigu
  const [showHistoricTriageMode, setShowHistoricTriageMode] = useState(false);

  // États pour le mode Triage Historique
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [currentLang] = useState<LocalLanguage>('fon');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeTriageResult, setActiveTriageResult] = useState<TriageResult | null>(null);
  const [consultationsHistory] = useState<TriageResult[]>([]);

  // Mise à jour de l'état de suivi à 8 états
  const handleUpdateActionState = (personaId: string, actionId: string, newState: FollowupState) => {
    setPersonas(prev => prev.map(p => {
      if (p.id !== personaId) return p;
      return {
        ...p,
        carePlan: p.carePlan.map(act => act.id === actionId ? { ...act, currentState: newState } : act)
      };
    }));
  };

  const handleSelectPersonaForClinical = (p: PersonaProfile) => {
    setSelectedPersona(p);
    setActiveTab('clinical');
  };

  const handleBatchApprove = (ids: string[]) => {
    setPersonas(prev => prev.map(p => {
      if (!ids.includes(p.id)) return p;
      return {
        ...p,
        carePlan: p.carePlan.map(act => act.currentState === 'Validee' ? { ...act, currentState: 'Invitee' } : act)
      };
    }));
  };

  const handleSosClick = () => {
    const sosResult: TriageResult = {
      id: `TRG-SOS-${Date.now()}`,
      patientName: selectedPersona.fullName,
      urgency: 'ROUGE',
      conditionName: 'Urgence Vitale Immédiate (Alerte Déclenchée)',
      icd10Code: 'R56.0',
      adviceFrench: 'URGENCE VITALE : Orientation immédiate vers les urgences hospitalières les plus proches (Règle d’échappement E0).',
      adviceLocalLanguage: 'URGENCE VITALE ! Allez au service d’urgences le plus proche.',
      recommendedFacility: 'Sheikh Shakhbout Medical City (Abu Dhabi) / CHU Urgences',
      xaiExplanation: 'Déclenchement direct par touche d’urgence SOS (Règle de sortie de sécurité E0).',
      ruleBasedOverride: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setActiveTriageResult(sosResult);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-emerald-100 selection:text-emerald-900 w-full overflow-x-hidden flex flex-col">
      {/* Tiroir Latéral Rétractable (S'ouvre au clic sur le bouton Menu en haut à gauche) */}
      {!showHistoricTriageMode && (
        <SidebarNavigation
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentLang={appLang}
          onToggleLang={setAppLang}
          onSosClick={handleSosClick}
        />
      )}

      {/* Zone de contenu principale (Pleine largeur 100% respirante) */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {!showHistoricTriageMode ? (
          <>
            {/* TopBar épurée avec bouton Menu, logo, titre et sélection de patient compacte */}
            <ContentTopBar
              activeTab={activeTab}
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              selectedPersona={selectedPersona}
              personas={personas}
              onSelectPersona={setSelectedPersona}
              currentLang={appLang}
              onToggleLang={setAppLang}
              onSosClick={handleSosClick}
            />

            {/* Contenu de l'onglet actif */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
              {activeTab === 'population' && (
                <PopulationPrioritizationView
                  personas={personas}
                  onSelectPersonaForClinicalView={handleSelectPersonaForClinical}
                  onApproveInvitationsBatch={handleBatchApprove}
                />
              )}

              {activeTab === 'clinical' && (
                <ClinicalIndividualView
                  persona={selectedPersona}
                  onBackToPopulationView={() => setActiveTab('population')}
                  onUpdateActionState={handleUpdateActionState}
                />
              )}

              {activeTab === 'safeguards' && (
                <PopulationSafeguardsView />
              )}

              {activeTab === 'engagement' && (
                <EngagementChoiceView
                  currentLang={appLang}
                  onToggleLang={setAppLang}
                />
              )}

              {activeTab === 'benchmark' && (
                <BenchmarkEvaluationView />
              )}
            </main>
          </>
        ) : (
          /* Mode historique : Triage vocal aigu PCIME */
          <main className="flex-1">
            <HeroTriage
              patient={patient}
              onUpdatePatient={setPatient}
              currentLang={currentLang}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onTriageComputed={(res) => setActiveTriageResult(res)}
            />
            <FacilitiesDirectory />
            <TeleconsultationSection />
            <FamilyRecord consultations={consultationsHistory} />
            <MedicalCommitteeAudit />
          </main>
        )}

        {/* Modal Vocal (si activé) */}
        <VoiceModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          lang={currentLang}
          onConfirmText={(_t) => {}}
        />

        {/* Modal Résultat de Triage (si actif) */}
        {activeTriageResult && (
          <TriageResultCard
            result={activeTriageResult}
            currentLang={currentLang}
            onClose={() => setActiveTriageResult(null)}
            onSelectTeleconsult={() => {}}
            onViewFacilities={() => {}}
          />
        )}

        {/* Bascule discrète pour le mode Triage Historique PCIME */}
        <div className="py-2.5 px-4 text-center text-xs text-slate-500 bg-slate-100/80 border-t border-slate-200">
          <button
            onClick={() => setShowHistoricTriageMode(!showHistoricTriageMode)}
            className="hover:text-slate-900 font-medium underline underline-offset-2 transition"
          >
            {showHistoricTriageMode
              ? '← Revenir à MediSense (Défi 04 Abu Dhabi • Prévention de Précision)'
              : 'Basculer vers le socle académique initial (Triage Aigu de Symptômes)'}
          </button>
        </div>

        {/* Footer Institutionnel */}
        <FooterLegal />
      </div>
    </div>
  );
};

export default App;
