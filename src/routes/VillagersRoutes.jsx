import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuthRole } from '../contexts/AuthRoleContext';
import VillagersPage from '../pages/Villagers';

/**
 * VillagersRoutes — Dedicated routing for the public Villagers Portal (/villagers).
 * 
 * Access Rules:
 * - Villagers (public) → allowed directly
 * - ASHA Workers → redirected to their dedicated portal (/asha)
 * - Hygiene Dept → redirected to their dedicated portal (/hygiene)
 * - Government Admin → allowed (full super-user access)
 */
export default function VillagersRoutes() {
  const { activeRole, ROLES } = useAuthRole();

  return (
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
  );
}
