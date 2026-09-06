import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoleProvider, useAuthRole, ROLES } from './contexts/AuthRoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { AlertNotificationProvider } from './contexts/AlertNotificationContext';
import { AlterationPermissionProvider } from './contexts/AlterationPermissionContext';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';

// Auth page
import LoginPage from './pages/Auth/LoginPage';

// Portal page components
import HomePage from './pages/Home';
import VillagersPage from './pages/Villagers';
import AshaPage from './pages/Asha';
import HygienePage from './pages/Hygiene';
import AdminPage from './pages/Admin';

function MainLayout() {
  const { isAuthenticated, activeRole, isGovernment, isAsha, isHygiene, isVillager } = useAuthRole();

  // 1. If not logged in, show the Login Portal immediately
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 2. Once logged in, show the Home page & dedicated role portal (with no cross-portal links)
  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-10">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Dedicated Villagers Portal (accessible only to villagers) */}
          <Route
            path="/villagers"
            element={isVillager ? <VillagersPage /> : <Navigate to="/" replace />}
          />

          {/* Dedicated ASHA Portal (accessible only to ASHA workers) */}
          <Route
            path="/asha"
            element={isAsha ? <AshaPage /> : <Navigate to="/" replace />}
          />

          {/* Dedicated Hygiene Portal (accessible only to Hygiene Dept) */}
          <Route
            path="/hygiene"
            element={isHygiene ? <HygienePage /> : <Navigate to="/" replace />}
          />

          {/* Dedicated Admin Portal (accessible only to Government Officials) */}
          <Route
            path="/admin"
            element={isGovernment ? <AdminPage /> : <Navigate to="/" replace />}
          />

          {/* All other routes fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NotificationToast />

      <footer className="border-t border-sky-200 bg-white py-4 text-xs text-slate-600">
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
