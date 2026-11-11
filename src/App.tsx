import React, { useState } from 'react';
import { I18nProvider } from './lib/i18n.tsx';
import { setApiAuthToken } from './lib/api.ts';
import { UserRole } from './lib/types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthPages } from './components/AuthPages.tsx';
import { PatientPortal } from './components/PatientPortal.tsx';
import { ClinicianPortal } from './components/ClinicianPortal.tsx';
import { PopulationPortals } from './components/PopulationPortals.tsx';

type AppView = 'landing' | 'login' | 'request-access' | 'portal';

const ROLE_TO_DEMO_TOKEN: Record<UserRole, string> = {
  patient: 'demo-token-patient',
  parent: 'demo-token-parent',
  clinician: 'demo-token-clinician',
  coordinator: 'demo-token-coordinator',
  public_health: 'demo-token-public-health',
};

function MediSenseApplication() {
  const [view, setView] = useState<AppView>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [preselectedLoginRole, setPreselectedLoginRole] = useState<UserRole>('patient');

  const handleEnterRolePortal = (role: UserRole, customToken?: string) => {
    const normalizedRole: UserRole = role === 'parent' ? 'patient' : role;
    const token = customToken || ROLE_TO_DEMO_TOKEN[normalizedRole];
    setApiAuthToken(token);
    setCurrentRole(normalizedRole);
    setView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLoginWithRole = (role: UserRole = 'patient') => {
    const normalizedRole: UserRole = role === 'parent' ? 'patient' : role;
    setPreselectedLoginRole(normalizedRole);
    setView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setPreselectedLoginRole('patient');
    setView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Active Role Portal (Strict RBAC session isolation — no in-app role switcher)
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
      <MediSenseApplication />
    </I18nProvider>
  );
}
