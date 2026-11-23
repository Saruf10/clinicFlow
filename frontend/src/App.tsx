import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Doctors } from './pages/Doctors';
import { Appointments } from './pages/Appointments';
import { Billing } from './pages/Billing';
import type { User, AuthResponse } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [billingTargetApptId, setBillingTargetApptId] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('clinicflow_user');
    const token = localStorage.getItem('clinicflow_token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const handleLoginSuccess = (authData: AuthResponse) => {
    setCurrentUser(authData);
  };

  const handleLogout = () => {
    localStorage.removeItem('clinicflow_token');
    localStorage.removeItem('clinicflow_user');
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleNavigateToBilling = (appointmentId: number) => {
    setBillingTargetApptId(appointmentId);
    setCurrentTab('billing');
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'billing') setBillingTargetApptId(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Clinical Viewport */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentTab === 'dashboard' && <Dashboard />}
          {currentTab === 'patients' && <Patients currentUserRole={currentUser.role} />}
          {currentTab === 'doctors' && <Doctors />}
          {currentTab === 'appointments' && (
            <Appointments onNavigateToBilling={handleNavigateToBilling} />
          )}
          {currentTab === 'billing' && (
            <Billing initialAppointmentId={billingTargetApptId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
