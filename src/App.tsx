import React, { useState } from 'react';
import { I18nProvider } from './lib/i18n.tsx';
import { setApiAuthToken } from './lib/api.ts';
import { UserRole } from './lib/types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthPages } from './components/AuthPages.tsx';
import { PatientPortal } from './components/PatientPortal.tsx';
import { ClinicianPortal } from './components/ClinicianPortal.tsx';
import { PopulationPortals } from './components/PopulationPortals.tsx';
import { EvidenceGovernance } from './components/EvidenceGovernance.tsx';

type AppView = 'landing' | 'login' | 'request-access' | 'portal' | 'proof';

const ROLE_TO_DEMO_TOKEN: Record<UserRole, string> = {
  patient: 'demo-token-patient',
  parent: 'demo-token-parent',
  clinician: 'demo-token-clinician',
  coordinator: 'demo-token-coordinator',
  public_health: 'demo-token-public-health',
};

const SESSION_STORAGE_KEY = 'MediBenin.session';

function readStoredSessionRole(): UserRole | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const role = JSON.parse(raw) as UserRole;
    return role in ROLE_TO_DEMO_TOKEN ? role : null;
  } catch {
    return null;
  }
}

// Restored synchronously at module scope so the portal survives a page refresh.
const storedSessionRole = readStoredSessionRole();

function MediBeninApplication() {
  const [view, setView] = useState<AppView>(storedSessionRole ? 'portal' : 'landing');
  const [currentRole, setCurrentRole] = useState<UserRole>(storedSessionRole ?? 'patient');
  const [preselectedLoginRole, setPreselectedLoginRole] = useState<UserRole>('patient');

  const handleEnterRolePortal = (role: UserRole, customToken?: string) => {
    const token = customToken || ROLE_TO_DEMO_TOKEN[role];
    setApiAuthToken(token);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(role));
    } catch {
      /* storage unavailable â€” session kept in memory only */
    }
    setCurrentRole(role);
    setView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLoginWithRole = (role: UserRole = 'patient') => {
    setPreselectedLoginRole(role);
    setView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem('MediBenin.authToken');
    } catch {
      /* ignore */
    }
    setPreselectedLoginRole('patient');
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (window.location.pathname === '/proof' || view === 'proof') {
    return <EvidenceGovernance />;
  }

  if (view === 'landing') {
    return (
      <LandingPage
        onNavigateToLogin={() => handleOpenLoginWithRole('patient')}
        onQuickRoleEnter={(role) => handleOpenLoginWithRole(role)}
      />
    );
  }

  if (view === 'login' || view === 'request-access') {
    return (
      <AuthPages
        mode={view}
        initialRole={preselectedLoginRole}
        onSwitchMode={(m) => setView(m)}
        onBackToLanding={() => setView('landing')}
        onSelectRoleLogin={(role, token) => handleEnterRolePortal(role, token)}
      />
    );
  }

  // Active Role Portal (Strict RBAC session isolation â€” no in-app role switcher)
  if (currentRole === 'patient' || currentRole === 'parent') {
    return <PatientPortal role={currentRole} onLogout={handleLogout} />;
  }

  if (currentRole === 'clinician') {
    return <ClinicianPortal onLogout={handleLogout} />;
  }

  return <PopulationPortals role={currentRole} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <I18nProvider>
      <MediBeninApplication />
    </I18nProvider>
  );
}
