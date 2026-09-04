import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuthRole } from '../contexts/AuthRoleContext';
import AdminPage from '../pages/Admin';

/**
 * AdminRoutes — Dedicated routing for the Government Admin Portal (/admin).
 *
 * Access Rules:
 * - Government Admin (OFFICIAL / ADMIN roles) → allowed directly
 * - ASHA Workers → redirected to their dedicated portal (/asha)
 * - Hygiene Dept → redirected to their dedicated portal (/hygiene)
 * - Villagers → shown Admin page; AdminPage's GovernmentAuthGate handles auth
 */
export default function AdminRoutes() {
  const { activeRole, ROLES } = useAuthRole();

  return (
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
  );
}
