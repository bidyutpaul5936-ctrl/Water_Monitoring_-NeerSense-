import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthRoleProvider, useAuthRole } from './contexts/AuthRoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { AlertNotificationProvider } from './contexts/AlertNotificationContext';
import { AlterationPermissionProvider } from './contexts/AlterationPermissionContext';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';

// Dedicated, Unlinked Auth Pages
import HealthLoginPage from './pages/Auth/HealthLoginPage';
import HealthSignUpPage from './pages/Auth/HealthSignUpPage';
import AdminLoginPage from './pages/Auth/AdminLoginPage';
import VillagerSignUpPage from './pages/Auth/VillagerSignUpPage';

// Portal page components
import HomePage from './pages/Home';
import VillagersPage from './pages/Villagers';
import AshaPage from './pages/Asha';
import HygienePage from './pages/Hygiene';
import AdminPage from './pages/Admin';

function MainLayout() {
  const location = useLocation();
  const isVillagerPortal =
    location.pathname === '/' ||
    location.pathname.startsWith('/village') ||
    location.pathname.startsWith('/villagers');

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-10">
        <Routes>
          {/* ─── 1. VILLAGERS COMMUNITY HOME PAGES (Zero Login, Zero Logout, Fully Isolated) ─── */}
          {/* Villagers opening '/', '/village', or '/villagers' see strictly the Village Home Page */}
          <Route path="/" element={<VillagersPage />} />
          <Route path="/village" element={<VillagersPage />} />
          <Route path="/village/home" element={<VillagersPage />} />
          <Route path="/villagers" element={<VillagersPage />} />
          <Route path="/villagers/home" element={<VillagersPage />} />
          <Route path="/villagers/signup" element={<VillagerSignUpPage />} />
          <Route path="/village/alerts" element={<VillagerSignUpPage />} />

          {/* ─── 2. HEALTH & FIELD STAFF AUTH (ASHA & Hygiene Only) ─── */}
          <Route path="/health/login" element={<HealthLoginPage />} />
          <Route path="/health/signup" element={<HealthSignUpPage />} />

          {/* ─── 3. DISTRICT ADMIN / CDMO AUTH (Admin Only, Single Admin) ─── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Department Portals (Protected by GovernmentAuthGate) */}
          <Route path="/asha" element={<AshaPage />} />
          <Route path="/hygiene" element={<HygienePage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Legacy / Direct Route Fallbacks */}
          <Route path="/login" element={<Navigate to="/health/login" replace />} />
          <Route path="/first-time-signin" element={<Navigate to="/health/signup" replace />} />
          <Route path="/register" element={<Navigate to="/health/signup" replace />} />
          <Route path="/signup" element={<Navigate to="/health/signup" replace />} />

          {/* All other routes fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NotificationToast />

      {/* Footer: Context-Aware (Isolated for Villagers vs Administrative) */}
      <footer className="border-t border-sky-200 bg-white/95 backdrop-blur-sm py-4 text-xs text-slate-600">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          {isVillagerPortal ? (
            <>
              <div className="flex items-center gap-1.5 font-medium">
                <strong className="text-emerald-950">NeerSense Gramin Seva</strong>
                <span>&bull; Drinking Water Safety &amp; Health Portal for Citizens</span>
              </div>
              <div className="text-2xs text-emerald-800">
                National Health Helpline: <strong>104</strong> &bull; Emergency Ambulance: <strong>108</strong> &bull; Free Community Service
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 font-medium">
                <strong className="text-sky-950">NeerSense</strong>
                <span>&bull; Smart Water-Borne Disease Early Warning System</span>
              </div>
              <div className="text-2xs text-sky-800">
                Ministry of Jal Shakti &bull; Ministry of Health &amp; Family Welfare &bull; SIH 2026 (PS 25001)
              </div>
            </>
          )}
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
