import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuthRole } from '../contexts/AuthRoleContext';
import AshaPage from '../pages/Asha';

/**
 * AshaRoutes — Dedicated routing for the ASHA Worker Field Portal (/asha).
 *
 * Access Rules:
 * - ASHA Workers → allowed directly (requires ASHA auth gate on the page)
 * - Hygiene Dept → redirected to their dedicated portal (/hygiene)
 * - Villagers → allowed to visit; AshaPage shows its auth gate to restrict edits
 * - Government Admin → allowed (full super-user access)
 */
export default function AshaRoutes() {
  const { activeRole, ROLES } = useAuthRole();

  return (
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
  );
}
