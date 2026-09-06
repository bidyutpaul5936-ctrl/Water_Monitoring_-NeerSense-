import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { rtdb } from '../services/firebase';

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
  villager: { title: 'Villager / Citizen', avatar: '👨‍🌾', department: 'Public Health & Citizen Services' },
  asha: { title: 'ASHA Field Worker', avatar: '👩‍⚕️', department: 'Community Health Surveillance' },
  hygiene: { title: 'Water & Sanitation Officer', avatar: '👩‍🔬', department: 'Hygiene & Lab Testing Dept' },
  official: { title: 'Government Health Officer (CDMO)', avatar: '🏛️', department: 'District Administration' },
  panchayat: { title: 'Gram Panchayat Representative', avatar: '🏢', department: 'Local Village Governance' },
  admin: { title: 'District Surveillance Administrator', avatar: '⚙️', department: 'Jal Shakti & Health Ministry' },
};

const SESSION_KEY = 'neersense_auth_session';

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

// ─── Store User Account in Firebase Realtime Database ───────────────────────
async function saveAccountToDatabase(account) {
  if (!rtdb) return;
  const { phone, role, name, villageId, villageName } = account;
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const timestamp = Date.now();

  const userPayload = {
    phone: cleanPhone,
    role,
    name: name || 'Authorized User',
    villageId: villageId || null,
    villageName: villageName || '',
    updatedAt: timestamp,
    lastLogin: new Date().toISOString()
  };

  try {
    // 1. Universal users directory (/users/{phone})
    await set(ref(rtdb, `users/${cleanPhone}`), userPayload);

    // 2. Role-specific database key
    if (role === ROLES.ASHA) {
      const ashaKey = `ASHA_${cleanPhone.slice(-6)}`;
      await set(ref(rtdb, `Asha_Workers/${ashaKey}/profile`), {
        ashaKey,
        ashaId: ashaKey,
        ashaName: name,
        contactNumber: cleanPhone,
        villageId,
        villageName,
        role: 'ASHA',
        updatedAt: timestamp
      });
    } else if (role === ROLES.VILLAGER) {
      await set(ref(rtdb, `Villagers/profiles/${cleanPhone}`), {
        phone: cleanPhone,
        name,
        villageId,
        villageName,
        role: 'VILLAGER',
        updatedAt: timestamp
      });
    } else if (role === ROLES.HYGIENE) {
      await set(ref(rtdb, `Hygiene_Department/users/${cleanPhone}`), {
        phone: cleanPhone,
        name,
        role: 'HYGIENE',
        department: 'Water Quality & Health Surveillance',
        updatedAt: timestamp
      });
    } else if (role === ROLES.OFFICIAL || role === ROLES.ADMIN) {
      await set(ref(rtdb, `Admin/users/${cleanPhone}`), {
        phone: cleanPhone,
        name,
        role: 'ADMIN',
        designation: 'Government Health Officer / CDMO',
        updatedAt: timestamp
      });
    }
    console.info(`[NeerSense Auth] ⚡ Account ${cleanPhone} (${role}) stored in database`);
  } catch (err) {
    console.warn('[NeerSense Auth] Database account store warning:', err.message);
  }
}

export const AuthRoleProvider = ({ children }) => {
  const initialSession = getStoredSession();

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialSession));
  const [activeRole, setActiveRoleState] = useState(initialSession ? initialSession.role : null);
  const [currentUserState, setCurrentUserState] = useState(
    initialSession ? { ...ROLE_DEFAULTS[initialSession.role], ...initialSession } : null
  );
  const [adminActivePage, setAdminActivePage] = useState('admin');

  // ─── Derived role flags ────────────────────────────────────────────────────
  const isGovernment = activeRole === ROLES.OFFICIAL || activeRole === ROLES.ADMIN;
  const isAsha = activeRole === ROLES.ASHA;
  const isHygiene = activeRole === ROLES.HYGIENE;
  const isVillager = activeRole === ROLES.VILLAGER;

  const currentUser = currentUserState || {
    role: activeRole || ROLES.VILLAGER,
    ...ROLE_DEFAULTS[activeRole || ROLES.VILLAGER],
  };

  // ─── Login with Phone & Role (Universal Phone Login) ──────────────────────
  const loginWithPhone = async ({ phone, pin, role, name, villageId, villageName }) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const roleKey = role || ROLES.VILLAGER;
    const defaultObj = ROLE_DEFAULTS[roleKey] || ROLE_DEFAULTS.villager;
    const userName = name?.trim() || defaultObj.title;

    const userAccount = {
      phone: cleanPhone,
      pin: pin || '1234',
      role: roleKey,
      name: userName,
      villageId: villageId || 'vil-01',
      villageName: villageName || 'Gosaba Island (Rangabelia)',
      avatar: defaultObj.avatar,
      title: defaultObj.title,
      department: defaultObj.department,
      lastLogin: new Date().toISOString()
    };

    // Store in localStorage
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount));
    } catch {}

    // Store in Realtime Database under role-specific key and /users
    saveAccountToDatabase(userAccount).catch(() => {});

    setActiveRoleState(roleKey);
    setCurrentUserState(userAccount);
    setIsAuthenticated(true);

    return { success: true, user: userAccount };
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setIsAuthenticated(false);
    setActiveRoleState(null);
    setCurrentUserState(null);
  };

  const logoutToVillager = logout;

  // Legacy compatibility helpers
  const setRole = (role) => {
    if (ROLES[role.toUpperCase()] || Object.values(ROLES).includes(role)) {
      loginWithPhone({ phone: '9876543210', role, name: ROLE_DEFAULTS[role]?.title });
    }
  };
  const loginAsGovernment = () => loginWithPhone({ phone: '9876543213', role: ROLES.OFFICIAL, name: 'Dr. Suresh Mishra (CDMO)' });
  const loginAsAsha = () => loginWithPhone({ phone: '9876543211', role: ROLES.ASHA, name: 'Kuni Majhi (ASHA-071)' });
  const loginAsHygiene = () => loginWithPhone({ phone: '9876543212', role: ROLES.HYGIENE, name: 'Dr. Meena Kumari (Hygiene Officer)' });

  return (
    <AuthRoleContext.Provider
      value={{
        // State
        isAuthenticated,
        activeRole,
        currentUser,
        adminActivePage,
        setAdminActivePage,
        authLoading: false,
        // Role flags
        ROLES,
        isGovernment,
        isAsha,
        isHygiene,
        isVillager,
        // Authentication methods
        loginWithPhone,
        logout,
        logoutToVillager,
        // Legacy helpers
        setRole,
        loginAsGovernment,
        loginAsAsha,
        loginAsHygiene,
        allProfiles: ROLE_DEFAULTS,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
