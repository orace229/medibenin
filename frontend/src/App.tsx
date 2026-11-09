import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, MediSenseTab } from './components/NavigationTabs';
import { PopulationPrioritizationView } from './components/PopulationPrioritizationView';
import { ClinicalIndividualView } from './components/ClinicalIndividualView';
import { PopulationSafeguardsView } from './components/PopulationSafeguardsView';
import { EngagementChoiceView } from './components/EngagementChoiceView';
import { BenchmarkEvaluationView } from './components/BenchmarkEvaluationView';
import { JuryWalkthroughBanner } from './components/JuryWalkthroughBanner';

// Modules du socle de triage de symptômes (historique académique)
import { HeroTriage } from './components/HeroTriage';
import { VoiceModal } from './components/VoiceModal';
import { TriageResultCard } from './components/TriageResultCard';
import { FacilitiesDirectory } from './components/FacilitiesDirectory';
import { TeleconsultationSection } from './components/TeleconsultationSection';
import { FamilyRecord } from './components/FamilyRecord';
import { MedicalCommitteeAudit } from './components/MedicalCommitteeAudit';
import { FooterLegal } from './components/FooterLegal';

import { SYNTHETIC_PERSONAS } from './data/personas';
import { PersonaProfile, FollowupState } from './types/medisense';
import { PatientProfile, TriageResult, LocalLanguage } from './types';
import { INITIAL_PATIENT } from './data/mockData';
import { Stethoscope } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation principale MediSense (Future Health Challenge)
  const [activeTab, setActiveTab] = useState<MediSenseTab>('population');
  const [personas, setPersonas] = useState<PersonaProfile[]>(SYNTHETIC_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState<PersonaProfile>(SYNTHETIC_PERSONAS[0]);
  
  // Mode d'affichage : Défi 04 Abu Dhabi (par défaut) vs Mode Triage Aigu
  const [showHistoricTriageMode, setShowHistoricTriageMode] = useState(false);

  // États pour le mode Triage Historique
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [currentLang, setCurrentLang] = useState<LocalLanguage>('fon');
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

  const handleWalkthroughStep = (tab: MediSenseTab, personaIndex?: number) => {
    setActiveTab(tab);
    if (personaIndex !== undefined && personas[personaIndex]) {
      setSelectedPersona(personas[personaIndex]);
    }
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] selection:bg-medigreen-100 selection:text-medigreen-800">
      {/* Header Institutionnel */}
      <Header
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        onSosClick={handleSosClick}
        onAuditClick={() => {
          setActiveTab('safeguards');
        }}
      />

      {/* Barre de Bascule Mode Défi 04 Abu Dhabi vs Triage Aigu */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">
              Future Health Digital Innovation Challenge 2026 • Challenge 04 : Precision Prevention and Screening
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoricTriageMode(false)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                !showHistoricTriageMode ? 'bg-medigreen-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              MediSense (Prévention & Dépistage de Précision)
            </button>
            <button
              onClick={() => setShowHistoricTriageMode(true)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                showHistoricTriageMode ? 'bg-medigreen-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Triage Aigu de Symptômes (Socle initial)
            </button>
          </div>
        </div>
      </div>

      {!showHistoricTriageMode ? (
        <>
          {/* Guide de Démonstration Chronométré Jury (CDC §11.2 • 8 min) */}
          <JuryWalkthroughBanner
            onNavigateStep={handleWalkthroughStep}
          />

          {/* Navigation par Onglets (Les 5 écrans du Cahier des Charges) */}
          <NavigationTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            selectedPersonaName={selectedPersona.fullName}
          />

          {/* Sélecteur rapide de Personas en mode Clinique */}
          {activeTab === 'clinical' && (
            <div className="bg-indigo-50/60 border-b border-indigo-100 py-2.5 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs flex-wrap">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-indigo-700" />
                  <span>Dossier actif face au praticien (CDC §11.2) :</span>
                </span>
                <div className="flex gap-1.5">
                  {personas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(p)}
                      className={`px-3 py-1 rounded-lg font-semibold text-xs transition border ${
                        selectedPersona.id === p.id
                          ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p.fullName} ({p.ageYears}a, {p.nationalityGroup})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
              <EngagementChoiceView />
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

      {/* Footer Institutionnel */}
      <FooterLegal />
    </div>
  );
};

export default App;
