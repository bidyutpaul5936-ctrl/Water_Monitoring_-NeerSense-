import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoleProvider, useAuthRole } from './contexts/AuthRoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import { AlertNotificationProvider } from './contexts/AlertNotificationContext';
import { AlterationPermissionProvider } from './contexts/AlterationPermissionContext';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';

// Page components — one per section
import HomePage from './pages/Home';
import VillagersPage from './pages/Villagers';
import AshaPage from './pages/Asha';
import HygienePage from './pages/Hygiene';
import AdminPage from './pages/Admin';

function MainLayout() {
  const { activeRole, isGovernment, ROLES, loginAsAsha, loginAsHygiene, loginAsGovernment } = useAuthRole();

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
              isGovernment ? (
                <Navigate to="/admin" replace />
              ) : activeRole === ROLES.VILLAGER ? (
                <VillagersPage />
              ) : activeRole === ROLES.ASHA ? (
                <Navigate to="/asha" replace />
              ) : activeRole === ROLES.HYGIENE ? (
                <Navigate to="/hygiene" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* ─── ASHA WORKERS PORTAL — /asha ─────────────── */}
          <Route
            path="/asha"
            element={
              isGovernment ? (
                <Navigate to="/admin" replace />
              ) : (
                <ProtectedRoute
                  requiredRoles={[ROLES.ASHA]}
                  loginFn={loginAsAsha}
                  roleLabel="ASHA Health Worker"
                  demoPin="5678"
                  redirectIfWrongRole={activeRole === ROLES.HYGIENE ? '/hygiene' : null}
                >
                  <AshaPage />
                </ProtectedRoute>
              )
            }
          />

          {/* ─── HYGIENE DEPT PORTAL — /hygiene ──────────── */}
          <Route
            path="/hygiene"
            element={
              isGovernment ? (
                <Navigate to="/admin" replace />
              ) : (
                <ProtectedRoute
                  requiredRoles={[ROLES.HYGIENE]}
                  loginFn={loginAsHygiene}
                  roleLabel="Hygiene & Sanitation Department"
                  demoPin="4321"
                  redirectIfWrongRole={activeRole === ROLES.ASHA ? '/asha' : null}
                >
                  <HygienePage />
                </ProtectedRoute>
              )
            }
          />

          {/* ─── GOVERNMENT ADMIN PORTAL — /admin ────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                requiredRoles={[ROLES.OFFICIAL, ROLES.ADMIN]}
                loginFn={loginAsGovernment}
                roleLabel="Government Health Officer (CDMO)"
                demoPin="1234"
                redirectIfWrongRole={
                  activeRole === ROLES.ASHA
                    ? '/asha'
                    : activeRole === ROLES.HYGIENE
                    ? '/hygiene'
                    : null
                }
              >
                <AdminPage />
              </ProtectedRoute>
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
