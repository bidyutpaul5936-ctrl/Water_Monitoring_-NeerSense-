import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, set, get, update } from 'firebase/database';
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

// ─── Fixed Credentials for Each Role (Single Admin System) ──────────────────
// These are the ONLY valid credentials. Stored in DB on first use.
export const FIXED_CREDENTIALS = {
  [ROLES.VILLAGER]: {
    phone: '0000000000',
    pin: '',
    name: 'Citizen User',
    requiresPin: false,
  },
  [ROLES.ASHA]: {
    phone: '9876543211',
    pin: '5678',
    name: 'Kuni Majhi (ASHA-071)',
    requiresPin: true,
  },
  [ROLES.HYGIENE]: {
    phone: '9876543212',
    pin: '4321',
    name: 'Dr. Meena Kumari (Hygiene Dept)',
    requiresPin: true,
  },
  [ROLES.OFFICIAL]: {
    phone: '9876543213',
    pin: '1234',
    name: 'Dr. Suresh Mishra (CDMO)',
    requiresPin: true,
  },
  [ROLES.ADMIN]: {
    phone: '9876543213',
    pin: '1234',
    name: 'Dr. Suresh Mishra (CDMO)',
    requiresPin: true,
  },
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

// ─── Store fixed credentials in Firebase on first boot ─────────────────────
async function seedFixedCredentialsToDatabase() {
  if (!rtdb) return;
  try {
    // Seed each role individually if it doesn't already exist (never overwrite user-set PINs)
    for (const [role, cred] of Object.entries(FIXED_CREDENTIALS)) {
      if (role === ROLES.PANCHAYAT) continue;
      const roleRef = ref(rtdb, `system/credentials/${role}`);
      const snapshot = await get(roleRef);
      if (!snapshot.exists()) {
        await set(roleRef, {
          phone: cred.phone,
          pin: cred.pin,
          name: cred.name,
          requiresPin: cred.requiresPin,
          role,
          createdAt: new Date().toISOString(),
        });
        console.info(`[NeerSense Auth] ✅ Default credentials seeded for role: ${role}`);
      }
    }
  } catch (err) {
    console.warn('[NeerSense Auth] Credential seed warning:', err.message);
  }
}

// ─── Fetch the live PIN for a role from RTDB ────────────────────────────────
// Falls back to hardcoded default if RTDB is unavailable
async function fetchLivePin(role) {
  if (!rtdb) return FIXED_CREDENTIALS[role]?.pin || '';
  try {
    const snap = await get(ref(rtdb, `system/credentials/${role}/pin`));
    if (snap.exists()) return String(snap.val());
  } catch {}
  return FIXED_CREDENTIALS[role]?.pin || '';
}

export const AuthRoleProvider = ({ children }) => {
  const initialSession = getStoredSession();

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialSession));
  const [activeRole, setActiveRoleState] = useState(initialSession ? initialSession.role : null);
  const [currentUserState, setCurrentUserState] = useState(
    initialSession ? { ...ROLE_DEFAULTS[initialSession.role], ...initialSession } : null
  );
  const [adminActivePage, setAdminActivePage] = useState('admin');

  // Seed fixed credentials to Firebase on mount
  useEffect(() => {
    seedFixedCredentialsToDatabase();
  }, []);

  // Single Admin Heartbeat: maintain active admin session lock while logged in
  useEffect(() => {
    if ((activeRole === ROLES.ADMIN || activeRole === ROLES.OFFICIAL) && rtdb) {
      const heartbeatInterval = setInterval(() => {
        update(ref(rtdb, 'system/adminSession'), {
          lastHeartbeat: Date.now()
        }).catch(() => {});
      }, 45000);
      return () => clearInterval(heartbeatInterval);
    }
  }, [activeRole]);

  // ─── Derived role flags ────────────────────────────────────────────────────
  const isGovernment = activeRole === ROLES.OFFICIAL || activeRole === ROLES.ADMIN;
  const isAsha = activeRole === ROLES.ASHA;
  const isHygiene = activeRole === ROLES.HYGIENE;
  const isVillager = activeRole === ROLES.VILLAGER;

  const currentUser = currentUserState || {
    role: activeRole || ROLES.VILLAGER,
    ...ROLE_DEFAULTS[activeRole || ROLES.VILLAGER],
  };

// ─── Fetch a registered user from RTDB ──────────────────────────────────────
async function fetchRegisteredUser(phone) {
  if (!rtdb) return null;
  try {
    const snap = await get(ref(rtdb, `users/${phone}`));
    if (snap.exists()) return snap.val();
  } catch {}
  return null;
}

// ─── Login with Phone & Role (PIN Validated Against RTDB Live Credentials) ─
  const loginWithPhone = async ({ phone, pin, role, name, villageId, villageName }) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const roleKey = role || ROLES.VILLAGER;

    if (cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    // Villager: open access
    if (roleKey === ROLES.VILLAGER) {
      const defaultObj = ROLE_DEFAULTS.villager;
      const userAccount = {
        phone: cleanPhone,
        role: ROLES.VILLAGER,
        name: name?.trim() || 'Citizen User',
        villageId: villageId || 'vil-01',
        villageName: villageName || 'Gosaba Island (Rangabelia)',
        avatar: defaultObj.avatar,
        title: defaultObj.title,
        department: defaultObj.department,
        lastLogin: new Date().toISOString()
      };

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount));
      } catch {}
      saveAccountToDatabase(userAccount).catch(() => {});

      setActiveRoleState(ROLES.VILLAGER);
      setCurrentUserState(userAccount);
      setIsAuthenticated(true);
      return { success: true, user: userAccount };
    }

    // Restricted personnel roles (ASHA, HYGIENE, ADMIN, OFFICIAL)
    const fixedCred = FIXED_CREDENTIALS[roleKey];
    if (!fixedCred) {
      return { success: false, message: 'Invalid role selected.' };
    }

    const isAdminRole = roleKey === ROLES.ADMIN || roleKey === ROLES.OFFICIAL;

    // ─── STRICT SINGLE-ADMIN ENFORCEMENT ──────────────────────────────────
    if (isAdminRole) {
      // 1. Only the single designated admin user can log in as Admin
      let designatedAdminPhone = FIXED_CREDENTIALS[ROLES.ADMIN].phone;
      if (rtdb) {
        try {
          const adminSnap = await get(ref(rtdb, 'system/credentials/admin/phone'));
          if (adminSnap.exists() && adminSnap.val()) {
            designatedAdminPhone = String(adminSnap.val()).replace(/\D/g, '');
          }
        } catch {}
      }

      if (cleanPhone !== designatedAdminPhone) {
        return {
          success: false,
          message: 'Access Denied: In NeerSense, there is strictly only ONE authorized District Admin user. Other users cannot log in as Admin.'
        };
      }

      // 2. Only ONE admin user can be logged in at a time — check active session lock
      if (rtdb) {
        try {
          const sessSnap = await get(ref(rtdb, 'system/adminSession'));
          if (sessSnap.exists()) {
            const sess = sessSnap.val();
            const mySessionId = localStorage.getItem('neersense_admin_session_id');
            const lastActive = sess.lastHeartbeat || 0;
            const isRecent = (Date.now() - lastActive) < 15 * 60 * 1000;

            if (sess.isLoggedIn && isRecent && sess.sessionId && sess.sessionId !== mySessionId) {
              return {
                success: false,
                isAdminLocked: true,
                message: 'Admin Access Locked: Only one user can log in as Admin. An active Admin session is already open. Other logins are blocked until the current admin logs out.'
              };
            }
          }
        } catch {}
      }
    }

    // 1. Check if user is registered in the database
    const registeredUser = await fetchRegisteredUser(cleanPhone);
    let matchedPin = null;
    let userName = name?.trim() || fixedCred.name;
    let userVillageId = villageId || 'vil-01';
    let userVillageName = villageName || 'Gosaba Island (Rangabelia)';

    if (registeredUser) {
      // Validate role
      if (registeredUser.role && registeredUser.role !== roleKey && !(registeredUser.role === 'official' && roleKey === 'admin')) {
        return {
          success: false,
          message: `This mobile number is registered as ${registeredUser.role.toUpperCase()}, not ${roleKey.toUpperCase()}. Please select your registered role.`
        };
      }
      userName = registeredUser.name || userName;
      userVillageId = registeredUser.villageId || userVillageId;
      userVillageName = registeredUser.villageName || userVillageName;
      matchedPin = registeredUser.pin;
    } else if (cleanPhone === fixedCred.phone) {
      // Default / seeded system credentials
      matchedPin = await fetchLivePin(roleKey);
      userName = fixedCred.name;
    } else {
      // Unrecognized phone number for restricted personnel
      return {
        success: false,
        isUnregistered: true,
        message: 'No registered personnel account found for this mobile number. Please register using the First-Time Sign In page.'
      };
    }

    // Verify Security PIN
    if (!pin) {
      return { success: false, message: 'Security PIN is required for personnel login.' };
    }

    const liveRolePin = await fetchLivePin(roleKey);
    const pinToCheck = String(pin).trim();

    if (pinToCheck !== String(matchedPin).trim() && pinToCheck !== String(liveRolePin).trim()) {
      return { success: false, message: 'Incorrect Security PIN. Please verify your PIN.' };
    }

    const defaultObj = ROLE_DEFAULTS[roleKey] || ROLE_DEFAULTS.villager;
    const userAccount = {
      phone: cleanPhone,
      role: roleKey,
      name: userName,
      villageId: userVillageId,
      villageName: userVillageName,
      avatar: defaultObj.avatar,
      title: defaultObj.title,
      department: defaultObj.department,
      lastLogin: new Date().toISOString()
    };

    // If Admin, lock the active session in RTDB & local storage
    if (isAdminRole) {
      const newSessionId = 'ADMIN_SESS_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      try {
        localStorage.setItem('neersense_admin_session_id', newSessionId);
      } catch {}

      if (rtdb) {
        update(ref(rtdb, 'system/adminSession'), {
          isLoggedIn: true,
          phone: cleanPhone,
          name: userName,
          sessionId: newSessionId,
          loginTime: new Date().toISOString(),
          lastHeartbeat: Date.now()
        }).catch(() => {});
      }

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', phone: cleanPhone, pin: pinToCheck, sessionId: newSessionId })
      }).catch(() => {});
    }

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount));
    } catch {}

    saveAccountToDatabase(userAccount).catch(() => {});

    setActiveRoleState(roleKey);
    setCurrentUserState(userAccount);
    setIsAuthenticated(true);

    return { success: true, user: userAccount };
  };

  // ─── First-Time Personnel Sign In / Registration ──────────────────────────
  const registerPersonnel = async ({ name, phone, role, pin, villageId, villageName, adminKey }) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const roleKey = role || ROLES.ASHA;

    // Single admin protection
    if (roleKey === ROLES.ADMIN || roleKey === ROLES.OFFICIAL) {
      // Check if an admin is already registered in RTDB
      if (rtdb) {
        try {
          const adminSnap = await get(ref(rtdb, 'system/credentials/admin'));
          if (adminSnap.exists() && adminSnap.val().phone && adminSnap.val().phone !== cleanPhone) {
            return {
              success: false,
              message: 'Registration Denied: In NeerSense, there can only be ONE Admin user. The District Admin account is already registered.'
            };
          }
        } catch {}
      }

      if (adminKey !== 'NEER-ADMIN-2026' && adminKey !== '1234') {
        return {
          success: false,
          message: 'Admin Authorization Code is required. District Admin role is restricted to a single verified health official.'
        };
      }
    }

    if (roleKey !== ROLES.VILLAGER) {
      if (!pin || String(pin).trim().length < 4) {
        return { success: false, message: 'Security PIN must be at least 4 digits or characters.' };
      }
    }

    const pinStr = pin ? String(pin).trim() : '1234';
    const defaultObj = ROLE_DEFAULTS[roleKey] || ROLE_DEFAULTS.villager;
    const finalName = name?.trim() || defaultObj.title;

    const userAccount = {
      phone: cleanPhone,
      role: roleKey,
      name: finalName,
      pin: pinStr,
      villageId: villageId || 'vil-01',
      villageName: villageName || 'Gosaba Island (Rangabelia)',
      avatar: defaultObj.avatar,
      title: defaultObj.title,
      department: defaultObj.department,
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      // 1. Save into Firebase Realtime Database
      if (rtdb) {
        await set(ref(rtdb, `users/${cleanPhone}`), userAccount);
        // Also update role credentials in RTDB
        await update(ref(rtdb, `system/credentials/${roleKey}`), {
          phone: cleanPhone,
          pin: pinStr,
          name: finalName,
          requiresPin: roleKey !== ROLES.VILLAGER,
          updatedAt: new Date().toISOString(),
          pinUpdatedAt: new Date().toISOString()
        });

        // Department-specific records
        if (roleKey === ROLES.ASHA) {
          const ashaKey = `ASHA_${cleanPhone.slice(-6)}`;
          await set(ref(rtdb, `Asha_Workers/${ashaKey}/profile`), {
            ashaKey,
            ashaId: ashaKey,
            ashaName: finalName,
            contactNumber: cleanPhone,
            villageId: userAccount.villageId,
            villageName: userAccount.villageName,
            role: 'ASHA',
            pin: pinStr,
            updatedAt: Date.now()
          });
        } else if (roleKey === ROLES.HYGIENE) {
          await set(ref(rtdb, `Hygiene_Department/users/${cleanPhone}`), {
            phone: cleanPhone,
            name: finalName,
            role: 'HYGIENE',
            department: 'Water Quality & Health Surveillance',
            pin: pinStr,
            updatedAt: Date.now()
          });
        }
      }

      // 2. Notify backend Express server
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          pin: pinStr,
          role: roleKey,
          name: finalName,
          villageId: userAccount.villageId,
          villageName: userAccount.villageName
        })
      }).catch(() => {});

      // 3. Store active session
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount));
      } catch {}

      setActiveRoleState(roleKey);
      setCurrentUserState(userAccount);
      setIsAuthenticated(true);

      console.info(`[NeerSense Auth] 🌟 First-time personnel signed in: ${finalName} (${cleanPhone} - ${roleKey})`);
      return { success: true, user: userAccount };
    } catch (err) {
      console.error('[NeerSense Auth] Registration error:', err);
      return { success: false, message: 'Failed to complete registration in database. Please try again.' };
    }
  };

  // ─── Change PIN (Self-Service) ─────────────────────────────────────────────
  // Any logged-in staff member can update their own PIN stored in RTDB
  const changePin = async ({ currentPin, newPin }) => {
    const role = activeRole;
    if (!role || role === ROLES.VILLAGER) {
      return { success: false, message: 'PIN change is not available for your role.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'New PIN must be at least 4 characters long.' };
    }

    // 1. Verify current PIN against live RTDB value
    const livePin = await fetchLivePin(role);
    if (currentPin !== livePin) {
      return { success: false, message: 'Current PIN is incorrect. Please try again.' };
    }

    // 2. Write new PIN to RTDB
    try {
      if (rtdb) {
        await update(ref(rtdb, `system/credentials/${role}`), {
          pin: newPin,
          pinUpdatedAt: new Date().toISOString(),
          pinUpdatedBy: currentUser?.name || role,
        });
        console.info(`[NeerSense Auth] ⚡ PIN updated for role: ${role}`);
      }
      // Also update the Express server-side credential store
      fetch('/api/auth/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, newPin }),
      }).catch(() => {});

      return { success: true };
    } catch (err) {
      console.error('[NeerSense Auth] PIN update error:', err);
      return { success: false, message: 'Failed to save new PIN to database. Please try again.' };
    }
  };

  // ─── Set/Reset Security PIN (Personnel Independence) ──────────────────────
  // Allows department personnel to independently set or reset their security PIN
  // and store it directly in Firebase Realtime Database and backend server.
  const setSecurityPin = async ({ role, phone, newPin }) => {
    const roleKey = role || activeRole;
    if (!roleKey || roleKey === ROLES.VILLAGER) {
      return { success: false, message: 'PIN setup is only required for department login personnel.' };
    }

    const fixedCred = FIXED_CREDENTIALS[roleKey];
    if (!fixedCred) {
      return { success: false, message: 'Invalid role selected.' };
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone !== fixedCred.phone) {
      return { success: false, message: `Provided phone does not match the registered number for ${fixedCred.name}.` };
    }

    if (!newPin || String(newPin).trim().length < 4) {
      return { success: false, message: 'Security PIN must be at least 4 digits or characters.' };
    }

    const pinStr = String(newPin).trim();

    try {
      if (rtdb) {
        await update(ref(rtdb, `system/credentials/${roleKey}`), {
          pin: pinStr,
          pinUpdatedAt: new Date().toISOString(),
          pinUpdatedBy: currentUser?.name || fixedCred.name || roleKey,
        });
        console.info(`[NeerSense Auth] ⚡ Security PIN stored in Firebase RTDB for ${roleKey}`);
      }
      // Also update the Express server-side credential store
      fetch('/api/auth/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleKey, newPin: pinStr }),
      }).catch(() => {});

      return { success: true, pin: pinStr };
    } catch (err) {
      console.error('[NeerSense Auth] Set PIN error:', err);
      return { success: false, message: 'Failed to save new PIN to database. Please check your network connection.' };
    }
  };

  // ─── Force Release Admin Lock (Single Admin Recovery with Correct PIN) ────
  const forceReleaseAdminLock = async ({ pin }) => {
    const livePin = await fetchLivePin(ROLES.ADMIN);
    if (String(pin).trim() !== String(livePin).trim()) {
      return { success: false, message: 'Incorrect Admin PIN. Cannot release admin session lock.' };
    }
    try {
      if (rtdb) {
        await update(ref(rtdb, 'system/adminSession'), {
          isLoggedIn: false,
          phone: null,
          sessionId: null,
          forcedReleaseAt: new Date().toISOString()
        });
      }
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' })
      }).catch(() => {});
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to release lock: ' + err.message };
    }
  };

  // ─── Logout (Releases Single Admin Lock if Admin) ─────────────────────────
  const logout = () => {
    if (activeRole === ROLES.ADMIN || activeRole === ROLES.OFFICIAL) {
      try {
        localStorage.removeItem('neersense_admin_session_id');
      } catch {}
      if (rtdb) {
        update(ref(rtdb, 'system/adminSession'), {
          isLoggedIn: false,
          phone: null,
          sessionId: null,
          loggedOutAt: new Date().toISOString()
        }).catch(() => {});
      }
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' })
      }).catch(() => {});
    }

    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setIsAuthenticated(false);
    setActiveRoleState(null);
    setCurrentUserState(null);
  };

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
        registerPersonnel,
        logout,
        changePin,
        setSecurityPin,
        forceReleaseAdminLock,
        // Expose fixed credentials config (for GovernmentAuthGate validation)
        FIXED_CREDENTIALS,
        allProfiles: ROLE_DEFAULTS,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
