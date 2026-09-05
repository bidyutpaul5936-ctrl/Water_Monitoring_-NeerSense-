import React, { createContext, useContext, useState } from 'react';

const AuthRoleContext = createContext();

export const ROLES = {
  VILLAGER: 'villager',
  ASHA: 'asha',
  HYGIENE: 'hygiene',
  OFFICIAL: 'official',
  PANCHAYAT: 'panchayat',
  ADMIN: 'admin',
};

const ROLE_DEFAULTS = {
  villager: { title: 'Villager / Citizen', avatar: '👨‍🌾' },
  asha: { title: 'ASHA Field Worker', avatar: '👩‍⚕️' },
  hygiene: { title: 'Water & Sanitation Officer', avatar: '👩‍🔬' },
  official: { title: 'Government Health Officer (CDMO)', avatar: '🏛️' },
  panchayat: { title: 'Gram Panchayat Representative', avatar: '🏢' },
  admin: { title: 'System Administrator', avatar: '⚙️' },
};

// The PINs used to switch into restricted roles
const ROLE_PINS = {
  official: '1234',
  admin: '1234',
  asha: '5678',
  hygiene: '4321',
};

export const AuthRoleProvider = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState(ROLES.VILLAGER);
  const [adminActivePage, setAdminActivePage] = useState('admin'); // 'admin' | 'asha' | 'hygiene' | 'villagers' | 'home'

  // ─── Derived role flags ────────────────────────────────────────────────────
  const isGovernment = activeRole === ROLES.OFFICIAL || activeRole === ROLES.ADMIN;
  const isAsha = activeRole === ROLES.ASHA || isGovernment;
  const isHygiene = activeRole === ROLES.HYGIENE || isGovernment;
  const isVillager = activeRole === ROLES.VILLAGER;

  const currentUser = {
    role: activeRole,
    ...ROLE_DEFAULTS[activeRole] || ROLE_DEFAULTS.villager,
  };

  // ─── Role Switching ────────────────────────────────────────────────────────
  const setRole = (role) => {
    if (ROLES[role.toUpperCase()] || Object.values(ROLES).includes(role)) {
      setActiveRoleState(role);
    }
  };

  const loginAsGovernment = (pin) => {
    if (pin === ROLE_PINS.official || pin === ROLE_PINS.admin || pin === '1234') {
      setActiveRoleState(ROLES.OFFICIAL);
      return { success: true };
    }
    return { success: false, message: 'Incorrect PIN. Demo PIN is 1234' };
  };

  const loginAsAsha = (pin) => {
    if (pin === ROLE_PINS.asha || pin === '1234' || pin === '5678') {
      setActiveRoleState(ROLES.ASHA);
      return { success: true };
    }
    return { success: false, message: 'Incorrect ASHA PIN. Demo PIN is 5678 or 1234' };
  };

  const loginAsHygiene = (pin) => {
    if (pin === ROLE_PINS.hygiene || pin === '1234' || pin === '4321') {
      setActiveRoleState(ROLES.HYGIENE);
      return { success: true };
    }
    return { success: false, message: 'Incorrect Hygiene PIN. Demo PIN is 4321 or 1234' };
  };

  const logoutToVillager = () => {
    setActiveRoleState(ROLES.VILLAGER);
  };

  const logout = logoutToVillager;

  return (
    <AuthRoleContext.Provider
      value={{
        // State
        activeRole,
        currentUser,
        adminActivePage,
        setAdminActivePage,
        authLoading: false,
        isAuthenticated: true,
        // Role flags
        ROLES,
        isGovernment,
        isAsha,
        isHygiene,
        isVillager,
        // Role switching
        setRole,
        loginAsGovernment,
        loginAsAsha,
        loginAsHygiene,
        logout,
        logoutToVillager,
        allProfiles: ROLE_DEFAULTS,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
