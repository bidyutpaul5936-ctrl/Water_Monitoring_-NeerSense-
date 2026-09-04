import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuthRole } from '../contexts/AuthRoleContext';
import HygienePage from '../pages/Hygiene';

/**
 * HygieneRoutes — Dedicated routing for the Hygiene & Sanitation Dept Portal (/hygiene).
 *
 * Access Rules:
 * - Hygiene Dept → allowed directly (requires Hygiene auth gate on the page)
 * - ASHA Workers → redirected to their dedicated portal (/asha)
 * - Villagers → allowed to visit; HygienePage shows its auth gate to restrict edits
 * - Government Admin → allowed (full super-user access)
 */
export default function HygieneRoutes() {
  const { activeRole, ROLES } = useAuthRole();

  return (
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
  );
}
