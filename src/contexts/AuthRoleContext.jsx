import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthRoleContext = createContext();

export const ROLES = {
  VILLAGER: 'villager',
  ASHA: 'asha',
  HYGIENE: 'hygiene',
  OFFICIAL: 'official',
  PANCHAYAT: 'panchayat',
  ADMIN: 'admin'
};

const USER_PROFILES = {
  villager: {
    role: ROLES.VILLAGER,
    name: '',
    title: 'Villager / Citizen',
    villageId: '',
    villageName: '',
    district: '',
    phone: '',
    avatar: '👨‍🌾'
  },
  asha: {
    role: ROLES.ASHA,
    name: '',
    title: 'ASHA Field Worker',
    ashaId: '',
    villageId: '',
    villageName: '',
    district: '',
    phone: '',
    avatar: '👩‍⚕️'
  },
  hygiene: {
    role: ROLES.HYGIENE,
    name: '',
    title: 'Water & Sanitation Officer',
    department: 'Public Health & Hygiene Dept',
    avatar: '👩‍🔬'
  },
  official: {
    role: ROLES.OFFICIAL,
    name: '',
    title: 'Government Health Officer (CDMO)',
    jurisdiction: 'District Health Surveillance',
    department: 'Integrated Disease Surveillance Programme (IDSP)',
    avatar: '🏛️'
  },
  panchayat: {
    role: ROLES.PANCHAYAT,
    name: '',
    title: 'Gram Panchayat Representative',
    villageId: '',
    villageName: '',
    avatar: '🏢'
  },
  admin: {
    role: ROLES.ADMIN,
    name: '',
    title: 'System Administrator',
    department: 'Health Informatics & Telemetry Admin',
    avatar: '⚙️'
  }
};

export const AuthRoleProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('neersense_role') || ROLES.VILLAGER;
  });

  const currentUser = USER_PROFILES[activeRole] || USER_PROFILES.villager;

  const setRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('neersense_role', newRole);
  };

  const isGovernment = activeRole === ROLES.OFFICIAL || activeRole === ROLES.ADMIN;
  // ASHA only true if ASHA or Govt superuser
  const isAsha = activeRole === ROLES.ASHA || isGovernment;
  // Hygiene only true if HYGIENE or Govt superuser
  const isHygiene = activeRole === ROLES.HYGIENE || isGovernment;
  const isVillager = activeRole === ROLES.VILLAGER;

  const loginAsGovernment = (pin) => {
    // Accepts PIN 'GOV-2025', '1234', or empty for demo convenience
    if (!pin || pin.trim() === 'GOV-2025' || pin.trim() === '1234' || pin.trim().toLowerCase() === 'admin') {
      setRole(ROLES.OFFICIAL);
      return { success: true };
    }
    return { success: false, message: 'Invalid Government Officer PIN. Try 1234 or GOV-2025' };
  };

  const loginAsAsha = (pin) => {
    if (!pin || pin.trim() === 'ASHA-071' || pin.trim() === '1234' || pin.trim().toLowerCase() === 'asha') {
      setRole(ROLES.ASHA);
      return { success: true };
    }
    return { success: false, message: 'Invalid ASHA Worker ID. Try 1234 or ASHA-071' };
  };

  const loginAsHygiene = (pin) => {
    if (!pin || pin.trim() === 'HYG-2025' || pin.trim() === '1234' || pin.trim().toLowerCase() === 'hygiene') {
      setRole(ROLES.HYGIENE);
      return { success: true };
    }
    return { success: false, message: 'Invalid Hygiene Dept PIN. Try 1234 or HYG-2025' };
  };

  const logoutToVillager = () => {
    setRole(ROLES.VILLAGER);
  };

  return (
    <AuthRoleContext.Provider 
      value={{ 
        activeRole, 
        setRole, 
        currentUser, 
        ROLES, 
        allProfiles: USER_PROFILES,
        isGovernment,
        isAsha,
        isHygiene,
        isVillager,
        loginAsGovernment,
        loginAsAsha,
        loginAsHygiene,
        logoutToVillager
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
