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
    name: 'Suresh Das',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas, West Bengal',
    phone: '+91-98765-12345',
    avatar: '👨‍🌾'
  },
  asha: {
    role: ROLES.ASHA,
    name: 'Priyanka Mondal',
    ashaId: 'ASHA-109',
    villageId: 'vil-01',
    villageName: 'Gosaba Island (Rangabelia)',
    district: 'South 24 Parganas, West Bengal',
    phone: '+91-94371-99881',
    avatar: '👩‍⚕️'
  },
  hygiene: {
    role: ROLES.HYGIENE,
    name: 'Dr. Meena Kumari',
    title: 'District Water & Sanitation Officer',
    department: 'West Bengal Public Health & Hygiene Dept',
    avatar: '👩‍🔬'
  },
  official: {
    role: ROLES.OFFICIAL,
    name: 'Dr. Suresh Mishra, CDMO',
    title: 'Chief District Medical Officer & Surveillance In-Charge',
    jurisdiction: 'West Bengal Monitored Districts',
    department: 'Integrated Disease Surveillance Programme (IDSP WB)',
    avatar: '🏛️'
  },
  panchayat: {
    role: ROLES.PANCHAYAT,
    name: 'Subrata Das',
    title: 'Pradhan / Panchayat Head',
    villageId: 'vil-01',
    villageName: 'Rangabelia Gram Panchayat (Gosaba, WB)',
    avatar: '🏢'
  },
  admin: {
    role: ROLES.ADMIN,
    name: 'Admin - NIC Health Informatics WB',
    title: 'System & IoT Telemetry Administrator',
    avatar: '⚙️'
  }
};

export const AuthRoleProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('jalsuraksha_role') || ROLES.VILLAGER;
  });

  const currentUser = USER_PROFILES[activeRole] || USER_PROFILES.villager;

  const setRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('jalsuraksha_role', newRole);
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
