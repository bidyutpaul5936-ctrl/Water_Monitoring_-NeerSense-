import React from 'react';
import { Route } from 'react-router-dom';
import { useAuthRole } from '../contexts/AuthRoleContext';
import HomePage from '../pages/Home';
import VillagersPage from '../pages/Villagers';
import AshaPage from '../pages/Asha';
import HygienePage from '../pages/Hygiene';
import AdminPage from '../pages/Admin';
import { Navigate } from 'react-router-dom';

/**
 * AppRoutes — Centralised routing for all sections.
 * Must be rendered inside <Routes> in App.jsx.
 *
 * Each section's routing logic is grouped here with comments.
 * Individual pages live in src/pages/<Section>/index.jsx.
 */
export default function AppRoutes() {
  const { activeRole, ROLES } = useAuthRole();

  return (
    <>
      {/* ─── HOME PAGE ────────────────────────────────────── */}
      {/* All roles: public landing page */}
      <Route path="/" element={<HomePage />} />

      {/* ─── VILLAGERS PORTAL ─────────────────────────────── */}
      {/* Villagers & Govt Admin: view approved reports & submit symptoms */}
      {/* ASHA Workers → redirected to /asha */}
      {/* Hygiene Dept → redirected to /hygiene */}
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

      {/* ─── ASHA WORKERS PORTAL ──────────────────────────── */}
      {/* ASHA Workers & Govt Admin: field water testing & submission */}
      {/* Hygiene Dept → redirected to /hygiene */}
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

      {/* ─── HYGIENE & SANITATION DEPT PORTAL ────────────── */}
      {/* Hygiene Dept & Govt Admin: water safety classification desk */}
      {/* ASHA Workers → redirected to /asha */}
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

      {/* ─── GOVERNMENT ADMIN PORTAL ─────────────────────── */}
      {/* Govt Admin only: verification, approval, GIS dashboards */}
      {/* ASHA Workers → redirected to /asha */}
      {/* Hygiene Dept → redirected to /hygiene */}
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

      {/* ─── FALLBACK ─────────────────────────────────────── */}
      {/* All unmatched URLs → Home */}
      <Route path="*" element={<HomePage />} />
    </>
  );
}
