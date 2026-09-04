import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoleProvider, useAuthRole } from './contexts/AuthRoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { AlertNotificationProvider } from './contexts/AlertNotificationContext';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';

// Page components — one per section
import HomePage from './pages/Home';
import VillagersPage from './pages/Villagers';
import AshaPage from './pages/Asha';
import HygienePage from './pages/Hygiene';
import AdminPage from './pages/Admin';

function MainLayout() {
  // Note: React Router v6 requires <Route> elements to be DIRECT children
  // of <Routes>. They cannot be wrapped in custom components or fragments.
  const { activeRole, ROLES } = useAuthRole();

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-10">
        <Routes>
          {/* ─── HOME — accessible to all roles ──────────── */}
          <Route path="/" element={<HomePage />} />

          {/* ─── VILLAGERS PORTAL — /villagers ───────────── */}
          <Route
            path="/villagers"
            element={
              activeRole === ROLES.ASHA ? (
                <Navigate to="/asha" replace />
              ) : activeRole === ROLES.HYGIENE ? (
                <Navigate to="/hygiene" replace />
              ) : (
                <VillagersPage />
              )
            }
          />

          {/* ─── ASHA WORKERS PORTAL — /asha ─────────────── */}
          <Route
            path="/asha"
            element={
              activeRole === ROLES.HYGIENE ? (
                <Navigate to="/hygiene" replace />
              ) : (
                <AshaPage />
              )
            }
          />

          {/* ─── HYGIENE DEPT PORTAL — /hygiene ──────────── */}
          <Route
            path="/hygiene"
            element={
              activeRole === ROLES.ASHA ? (
                <Navigate to="/asha" replace />
              ) : (
                <HygienePage />
              )
            }
          />

          {/* ─── GOVERNMENT ADMIN PORTAL — /admin ────────── */}
          <Route
            path="/admin"
            element={
              activeRole === ROLES.ASHA ? (
                <Navigate to="/asha" replace />
              ) : activeRole === ROLES.HYGIENE ? (
                <Navigate to="/hygiene" replace />
              ) : (
                <AdminPage />
              )
            }
          />

          {/* ─── FALLBACK — all unmatched URLs → Home ─────── */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <NotificationToast />

      <footer className="border-t border-sky-200 bg-white py-4 text-xs text-slate-600">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <strong className="text-sky-950">JalSuraksha (जल सुरक्षा)</strong>
            <span>&bull; Smart Water-Borne Disease Early Warning System</span>
          </div>
          <div className="text-2xs text-sky-800">
            Ministry of Jal Shakti &bull; Ministry of Health &amp; Family Welfare &bull; SIH 2025 (PS 25001)
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
              <MainLayout />
            </AlertNotificationProvider>
          </OfflineSyncProvider>
        </AuthRoleProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
