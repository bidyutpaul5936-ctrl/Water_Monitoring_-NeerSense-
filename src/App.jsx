import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoleProvider, useAuthRole, ROLES } from './contexts/AuthRoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { AlertNotificationProvider } from './contexts/AlertNotificationContext';
import { AlterationPermissionProvider } from './contexts/AlterationPermissionContext';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';

// Auth pages
import LoginPage from './pages/Auth/LoginPage';
import FirstTimeSignInPage from './pages/Auth/FirstTimeSignInPage';

// Portal page components
import HomePage from './pages/Home';
import VillagersPage from './pages/Villagers';
import AshaPage from './pages/Asha';
import HygienePage from './pages/Hygiene';
import AdminPage from './pages/Admin';

function MainLayout() {
  const { isAuthenticated, isGovernment, isAsha, isHygiene, isVillager } = useAuthRole();

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-10">
        <Routes>
          {/* Public Home Page with Live Status & Overview */}
          <Route path="/" element={<HomePage />} />

          {/* Dedicated Login Portal for Signed Personnels */}
          <Route path="/login" element={<LoginPage />} />

          {/* First-Time Personnel Onboarding & Sign In */}
          <Route path="/first-time-signin" element={<FirstTimeSignInPage />} />
          <Route path="/register" element={<FirstTimeSignInPage />} />
          <Route path="/signup" element={<FirstTimeSignInPage />} />

          {/* Villagers & Citizens Water Safety Portal (Public) */}
          <Route path="/villagers" element={<VillagersPage />} />

          {/* Department Portals (Protected by GovernmentAuthGate) */}
          <Route path="/asha" element={<AshaPage />} />
          <Route path="/hygiene" element={<HygienePage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* All other routes fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NotificationToast />

      <footer className="border-t border-sky-200 bg-white/95 backdrop-blur-sm py-4 text-xs text-slate-600">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <strong className="text-sky-950">NeerSense</strong>
            <span>&bull; Smart Water-Borne Disease Early Warning System</span>
          </div>
          <div className="text-2xs text-sky-800">
            Ministry of Jal Shakti &bull; Ministry of Health &amp; Family Welfare &bull; SIH 2026 (PS 25001)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthRoleProvider>
          <OfflineSyncProvider>
            <AlertNotificationProvider>
              <AlterationPermissionProvider>
                <Routes>
                  <Route path="/*" element={<MainLayout />} />
                </Routes>
              </AlterationPermissionProvider>
            </AlertNotificationProvider>
          </OfflineSyncProvider>
        </AuthRoleProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
