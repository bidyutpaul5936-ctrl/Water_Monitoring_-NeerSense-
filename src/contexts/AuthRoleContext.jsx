import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ref,
  set,
  get,
  update,
} from 'firebase/database';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { rtdb, db } from '../services/firebase';

const AuthRoleContext = createContext();

export const ROLES = {
  VILLAGER: 'villager',
  ASHA: 'asha',
  HYGIENE: 'hygiene',
  OFFICIAL: 'official',
  PANCHAYAT: 'panchayat',
  ADMIN: 'admin',
};

// ─── Fixed Credentials Archetypes for Each Role (Single Admin System) ────────
export const FIXED_CREDENTIALS = {
  [ROLES.VILLAGER]: { phone: '', pin: '', name: 'Citizen User', requiresPin: false },
  [ROLES.ASHA]:     { phone: '', pin: '', name: 'ASHA Field Worker', requiresPin: true },
  [ROLES.HYGIENE]:  { phone: '', pin: '', name: 'Hygiene & Sanitation Officer', requiresPin: true },
  [ROLES.OFFICIAL]: { phone: '', pin: '', name: 'District CDMO Admin', requiresPin: true },
  [ROLES.ADMIN]:    { phone: '', pin: '', name: 'District CDMO Admin', requiresPin: true },
};

const ROLE_DEFAULTS = {
  villager: { title: 'Villager / Citizen',              avatar: '👨‍🌾', department: 'Public Health & Citizen Services' },
  asha:     { title: 'ASHA Field Worker',               avatar: '👩‍⚕️', department: 'Community Health Surveillance' },
  hygiene:  { title: 'Water & Sanitation Officer',      avatar: '👩‍🔬', department: 'Hygiene & Lab Testing Dept' },
  official: { title: 'Government Health Officer (CDMO)',avatar: '🏛️',  department: 'District Administration' },
  panchayat:{ title: 'Gram Panchayat Representative',   avatar: '🏢',  department: 'Local Village Governance' },
  admin:    { title: 'District Surveillance Administrator',avatar:'⚙️', department: 'Jal Shakti & Health Ministry' },
};

const SESSION_KEY = 'neersense_auth_session';

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role) return parsed;
    }
  } catch {}
  return null;
}

const withTimeout = (promise, ms = 3500) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);

// ─── Realtime Database helpers ──────────────────────────────────────────────
async function rtdbSet(path, data) {
  if (!rtdb) return;
  try {
    await withTimeout(set(ref(rtdb, path), data));
  } catch (err) {
    console.warn(`[NeerSense RTDB] write ${path}:`, err.message);
  }
}

async function rtdbGet(path) {
  if (!rtdb) return null;
  try {
    const snap = await withTimeout(get(ref(rtdb, path)));
    return snap.exists() ? snap.val() : null;
  } catch { return null; }
}

async function rtdbUpdate(path, data) {
  if (!rtdb) return;
  try {
    await withTimeout(update(ref(rtdb, path), data));
  } catch (err) {
    console.warn(`[NeerSense RTDB] update ${path}:`, err.message);
  }
}

// ─── Firestore helpers (dual-storage) ───────────────────────────────────────
async function fsSet(path, data) {
  if (!db) return;
  const [col, ...rest] = path.split('/');
  const docId = rest.join('/');
  try {
    await withTimeout(setDoc(doc(db, col, docId), data, { merge: true }));
  } catch (err) {
    console.warn(`[NeerSense FS] write ${path}:`, err.message);
  }
}

async function fsGet(path) {
  if (!db) return null;
  const [col, ...rest] = path.split('/');
  const docId = rest.join('/');
  try {
    const snap = await withTimeout(getDoc(doc(db, col, docId)));
    return snap.exists() ? snap.val?.() ?? snap.data() : null;
  } catch { return null; }
}

// ─── Store user account in RTDB + Firestore ─────────────────────────────────
async function saveAccountToDatabase(account) {
  const { phone, role, name, villageId, villageName } = account;
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const timestamp = Date.now();

  const userPayload = {
    phone: cleanPhone, role,
    name: name || 'Authorized User',
    villageId: villageId || null,
    villageName: villageName || '',
    updatedAt: timestamp,
    lastLogin: new Date().toISOString(),
  };

  // 1. Save to Realtime Database
  if (rtdb) {
    try {
      await rtdbSet(`users/${cleanPhone}`, userPayload);
      if (role === ROLES.ASHA) {
        const ashaKey = `ASHA_${cleanPhone.slice(-6)}`;
        await rtdbSet(`asha_workers/${ashaKey}`, {
          ashaKey, ashaId: ashaKey, ashaName: name,
          contactNumber: cleanPhone, villageId, villageName,
          role: 'ASHA', updatedAt: timestamp,
        });
      } else if (role === ROLES.VILLAGER) {
        await rtdbSet(`villagers/${cleanPhone}`, {
          phone: cleanPhone, name, villageId, villageName,
          role: 'VILLAGER', updatedAt: timestamp,
        });
      } else if (role === ROLES.HYGIENE) {
        await rtdbSet(`hygiene_users/${cleanPhone}`, {
          phone: cleanPhone, name, role: 'HYGIENE',
          department: 'Water Quality & Health Surveillance', updatedAt: timestamp,
        });
      } else if (role === ROLES.OFFICIAL || role === ROLES.ADMIN) {
        await rtdbSet(`admin_users/${cleanPhone}`, {
          phone: cleanPhone, name, role: 'ADMIN',
          designation: 'Government Health Officer / CDMO', updatedAt: timestamp,
        });
      }
      console.info(`[NeerSense RTDB] ✅ Account ${cleanPhone} (${role}) saved`);
    } catch (err) {
      console.warn('[NeerSense RTDB] Account save warning:', err.message);
    }
  }

  // 2. Dual-save to Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'users', cleanPhone), userPayload, { merge: true });
      if (role === ROLES.ASHA) {
        const ashaKey = `ASHA_${cleanPhone.slice(-6)}`;
        await setDoc(doc(db, 'asha_workers', ashaKey), {
          ashaKey, ashaId: ashaKey, ashaName: name,
          contactNumber: cleanPhone, villageId, villageName,
          role: 'ASHA', updatedAt: timestamp,
        }, { merge: true });
      } else if (role === ROLES.VILLAGER) {
        await setDoc(doc(db, 'villagers', cleanPhone), {
          phone: cleanPhone, name, villageId, villageName,
          role: 'VILLAGER', updatedAt: timestamp,
        }, { merge: true });
      } else if (role === ROLES.HYGIENE) {
        await setDoc(doc(db, 'hygiene_users', cleanPhone), {
          phone: cleanPhone, name, role: 'HYGIENE',
          department: 'Water Quality & Health Surveillance', updatedAt: timestamp,
        }, { merge: true });
      } else if (role === ROLES.OFFICIAL || role === ROLES.ADMIN) {
        await setDoc(doc(db, 'admin_users', cleanPhone), {
          phone: cleanPhone, name, role: 'ADMIN',
          designation: 'Government Health Officer / CDMO', updatedAt: timestamp,
        }, { merge: true });
      }
    } catch (err) {
      console.warn('[NeerSense Firestore] Account save warning:', err.message);
    }
  }
}

// ─── Do not seed demo credentials — only store real accounts registered by users
async function seedFixedCredentialsToDatabase() {
  // Fresh mode: Accounts are stored when real users register via the sign up portal
}

// ─── Fetch live PIN for a role from RTDB / Firestore ────────────────────────
async function fetchLivePin(role) {
  // 1. Try RTDB
  if (rtdb) {
    try {
      const snap = await rtdbGet(`system_credentials/${role}`);
      if (snap && snap.pin) return String(snap.pin);
    } catch {}
  }
  // 2. Try Firestore
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'system_credentials', role));
      if (snap.exists() && snap.data().pin) return String(snap.data().pin);
    } catch {}
  }
  return '';
}

export const AuthRoleProvider = ({ children }) => {
  const initialSession = getStoredSession();

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialSession));
  const [activeRole, setActiveRoleState] = useState(initialSession ? initialSession.role : null);
  const [currentUserState, setCurrentUserState] = useState(
    initialSession ? { ...ROLE_DEFAULTS[initialSession.role], ...initialSession } : null
  );
  const [adminActivePage, setAdminActivePage] = useState('admin');

  // No automatic demo seeding — fresh DB
  useEffect(() => {}, []);

  // Admin heartbeat
  useEffect(() => {
    if (activeRole === ROLES.ADMIN || activeRole === ROLES.OFFICIAL) {
      const iv = setInterval(() => {
        if (rtdb) rtdbUpdate('system/adminSession', { lastHeartbeat: Date.now() }).catch(() => {});
        if (db) updateDoc(doc(db, 'system', 'adminSession'), { lastHeartbeat: Date.now() }).catch(() => {});
      }, 45000);
      return () => clearInterval(iv);
    }
  }, [activeRole]);

  const isGovernment = activeRole === ROLES.OFFICIAL || activeRole === ROLES.ADMIN;
  const isAsha      = activeRole === ROLES.ASHA;
  const isHygiene   = activeRole === ROLES.HYGIENE;
  const isVillager  = activeRole === ROLES.VILLAGER;

  const currentUser = currentUserState || {
    role: activeRole || ROLES.VILLAGER,
    ...ROLE_DEFAULTS[activeRole || ROLES.VILLAGER],
  };

  // ─── Fetch a registered user from RTDB / Firestore ──────────────────────
  async function fetchRegisteredUser(phone) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone) return null;
    if (rtdb) {
      try {
        const snap = await rtdbGet(`users/${cleanPhone}`);
        if (snap) return snap;
        const ashaSnap = await rtdbGet(`asha_workers/ASHA_${cleanPhone.slice(-6)}`);
        if (ashaSnap) return ashaSnap;
        const hygieneSnap = await rtdbGet(`hygiene_users/${cleanPhone}`);
        if (hygieneSnap) return hygieneSnap;
        const citizenSnap = await rtdbGet(`citizens/${cleanPhone}`);
        if (citizenSnap) return citizenSnap;
        const villagerSnap = await rtdbGet(`villagers/${cleanPhone}`);
        if (villagerSnap) return villagerSnap;
        const adminSnap = await rtdbGet('system_credentials/admin');
        if (adminSnap && String(adminSnap.phone).replace(/\D/g, '') === cleanPhone) {
          return { ...adminSnap, role: ROLES.ADMIN };
        }
        const ashaCredSnap = await rtdbGet('system_credentials/asha');
        if (ashaCredSnap && String(ashaCredSnap.phone).replace(/\D/g, '') === cleanPhone) {
          return { ...ashaCredSnap, role: ROLES.ASHA };
        }
        const hygCredSnap = await rtdbGet('system_credentials/hygiene');
        if (hygCredSnap && String(hygCredSnap.phone).replace(/\D/g, '') === cleanPhone) {
          return { ...hygCredSnap, role: ROLES.HYGIENE };
        }
      } catch {}
    }
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', cleanPhone));
        if (snap.exists()) return snap.data();
      } catch {}
    }
    return null;
  }

  // ─── Live lookup helper to check if a phone number is registered ─────────
  const checkPhoneRegistration = async (phone, role) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) return { isRegistered: false };

    // Check fixed role credentials only if phone is set
    if (role && FIXED_CREDENTIALS[role]?.phone && cleanPhone === FIXED_CREDENTIALS[role].phone) {
      return {
        isRegistered: true,
        isDefaultDemo: true,
        user: { name: FIXED_CREDENTIALS[role].name, role },
      };
    }

    const reg = await fetchRegisteredUser(cleanPhone);
    if (reg) {
      return {
        isRegistered: true,
        isDefaultDemo: false,
        user: reg,
      };
    }
    return { isRegistered: false, phone: cleanPhone };
  };

  // ─── Login with Phone & Role ─────────────────────────────────────────────
  const loginWithPhone = async ({ phone, pin, role, name, villageId, villageName }) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const roleKey = role || ROLES.VILLAGER;

    if (cleanPhone.length < 10)
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };

    // Villager: open access — no PIN
    if (roleKey === ROLES.VILLAGER) {
      const defaultObj = ROLE_DEFAULTS.villager;
      const userAccount = {
        phone: cleanPhone, role: ROLES.VILLAGER,
        name: name?.trim() || 'Citizen User',
        villageId: villageId || 'vil-01',
        villageName: villageName || 'Gosaba Island (Rangabelia)',
        avatar: defaultObj.avatar, title: defaultObj.title,
        department: defaultObj.department,
        lastLogin: new Date().toISOString(),
      };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount)); } catch {}
      saveAccountToDatabase(userAccount).catch(() => {});
      setActiveRoleState(ROLES.VILLAGER);
      setCurrentUserState(userAccount);
      setIsAuthenticated(true);
      return { success: true, user: userAccount };
    }

    // Restricted personnel roles
    const fixedCred = FIXED_CREDENTIALS[roleKey];
    if (!fixedCred) return { success: false, message: 'Invalid role selected.' };

    const isAdminRole = roleKey === ROLES.ADMIN || roleKey === ROLES.OFFICIAL;

    // Single-admin enforcement
    if (isAdminRole) {
      let designatedAdminPhone = null;
      if (rtdb) {
        try {
          const snap = await rtdbGet('system_credentials/admin');
          if (snap && snap.phone) designatedAdminPhone = String(snap.phone).replace(/\D/g, '');
        } catch {}
      }
      if (!designatedAdminPhone && db) {
        try {
          const snap = await getDoc(doc(db, 'system_credentials', 'admin'));
          if (snap.exists() && snap.data().phone) {
            designatedAdminPhone = String(snap.data().phone).replace(/\D/g, '');
          }
        } catch {}
      }
      if (!designatedAdminPhone) {
        return {
          success: false,
          isUnregistered: true,
          message: 'No District Admin account has been registered yet. Please click Register to initialize the District Admin account.',
        };
      }
      if (cleanPhone !== designatedAdminPhone) {
        return {
          success: false,
          isUnregistered: true,
          message: `Access Denied: Number +91 ${cleanPhone} is not registered as the designated District CDMO Admin. NeerSense strictly enforces a single registered District Admin account.`,
        };
      }

      let sess = null;
      if (rtdb) {
        try {
          sess = await rtdbGet('system/adminSession');
        } catch {}
      }
      if (!sess && db) {
        try {
          const sessSnap = await getDoc(doc(db, 'system', 'adminSession'));
          if (sessSnap.exists()) sess = sessSnap.data();
        } catch {}
      }
      if (sess) {
        const mySessionId = localStorage.getItem('neersense_admin_session_id');
        const isRecent = (Date.now() - (sess.lastHeartbeat || 0)) < 15 * 60 * 1000;
        if (sess.isLoggedIn && isRecent && sess.sessionId && sess.sessionId !== mySessionId) {
          return {
            success: false,
            isAdminLocked: true,
            message: 'Admin Access Locked: An active Admin session is already open.',
          };
        }
      }
    }

    const registeredUser = await fetchRegisteredUser(cleanPhone);
    let matchedPin  = null;
    let userName    = name?.trim() || fixedCred.name;
    let userVillageId   = villageId || 'vil-01';
    let userVillageName = villageName || 'Gosaba Island (Rangabelia)';

    if (registeredUser) {
      if (
        registeredUser.role &&
        registeredUser.role !== roleKey &&
        !(registeredUser.role === 'official' && roleKey === 'admin')
      ) {
        return {
          success: false,
          message: `This number is registered as ${registeredUser.role.toUpperCase()}, not ${roleKey.toUpperCase()}.`,
        };
      }
      userName        = registeredUser.name || userName;
      userVillageId   = registeredUser.villageId || userVillageId;
      userVillageName = registeredUser.villageName || userVillageName;
      matchedPin      = registeredUser.pin;
    } else if (cleanPhone === fixedCred.phone && fixedCred.phone) {
      matchedPin = await fetchLivePin(roleKey);
      userName   = fixedCred.name;
    } else {
      return {
        success: false,
        isUnregistered: true,
        message: 'No registered personnel account found for this mobile number. Please click Register to create your account.',
      };
    }

    if (!pin) return { success: false, message: 'Security PIN is required for personnel login.' };

    const liveRolePin = await fetchLivePin(roleKey);
    const pinToCheck  = String(pin).trim();
    if (pinToCheck !== String(matchedPin).trim() && pinToCheck !== String(liveRolePin).trim()) {
      return { success: false, message: 'Incorrect Security PIN. Please try again.' };
    }

    const defaultObj = ROLE_DEFAULTS[roleKey] || ROLE_DEFAULTS.villager;
    const userAccount = {
      phone: cleanPhone, role: roleKey, name: userName,
      villageId: userVillageId, villageName: userVillageName,
      avatar: defaultObj.avatar, title: defaultObj.title,
      department: defaultObj.department,
      lastLogin: new Date().toISOString(),
    };

    if (isAdminRole) {
      const newSessionId = 'ADMIN_SESS_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      try { localStorage.setItem('neersense_admin_session_id', newSessionId); } catch {}
      const sessData = {
        isLoggedIn: true, phone: cleanPhone, name: userName,
        sessionId: newSessionId, loginTime: new Date().toISOString(),
        lastHeartbeat: Date.now(),
      };
      if (rtdb) rtdbSet('system/adminSession', sessData).catch(() => {});
      if (db) setDoc(doc(db, 'system', 'adminSession'), sessData, { merge: true }).catch(() => {});
    }

    try { localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount)); } catch {}
    saveAccountToDatabase(userAccount).catch(() => {});
    setActiveRoleState(roleKey);
    setCurrentUserState(userAccount);
    setIsAuthenticated(true);
    return { success: true, user: userAccount };
  };

  // ─── First-Time Personnel Sign In / Registration ─────────────────────────
  const registerPersonnel = async ({ name, phone, role, pin, villageId, villageName, adminKey }) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10)
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };

    const roleKey = role || ROLES.ASHA;

    if (roleKey === ROLES.ADMIN || roleKey === ROLES.OFFICIAL) {
      if (rtdb) {
        try {
          const snap = await rtdbGet('system_credentials/admin');
          if (snap && snap.phone && snap.phone !== cleanPhone) {
            return { success: false, message: 'Registration Denied: Admin account is already registered.' };
          }
        } catch {}
      } else if (db) {
        try {
          const snap = await getDoc(doc(db, 'system_credentials', 'admin'));
          if (snap.exists() && snap.data().phone && snap.data().phone !== cleanPhone) {
            return { success: false, message: 'Registration Denied: Admin account is already registered.' };
          }
        } catch {}
      }
      if (adminKey !== 'NEER-ADMIN-2026' && adminKey !== '1234') {
        return { success: false, message: 'Admin Authorization Code is required.' };
      }
    }

    if (roleKey !== ROLES.VILLAGER && (!pin || String(pin).trim().length < 4)) {
      return { success: false, message: 'Security PIN must be at least 4 digits.' };
    }

    const pinStr = pin ? String(pin).trim() : '1234';
    const defaultObj = ROLE_DEFAULTS[roleKey] || ROLE_DEFAULTS.villager;
    const finalName  = name?.trim() || defaultObj.title;

    const userAccount = {
      phone: cleanPhone, role: roleKey, name: finalName, pin: pinStr,
      villageId: villageId || 'vil-01',
      villageName: villageName || 'Gosaba Island (Rangabelia)',
      avatar: defaultObj.avatar, title: defaultObj.title,
      department: defaultObj.department,
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    try {
      // 1. RTDB save
      if (rtdb) {
        await rtdbSet(`users/${cleanPhone}`, userAccount);
        await rtdbSet(`system_credentials/${roleKey}`, {
          phone: cleanPhone, pin: pinStr, name: finalName,
          requiresPin: roleKey !== ROLES.VILLAGER,
          updatedAt: new Date().toISOString(),
        });

        if (roleKey === ROLES.ASHA) {
          const ashaKey = `ASHA_${cleanPhone.slice(-6)}`;
          await rtdbSet(`asha_workers/${ashaKey}`, {
            ashaKey, ashaId: ashaKey, ashaName: finalName,
            contactNumber: cleanPhone,
            villageId: userAccount.villageId,
            villageName: userAccount.villageName,
            role: 'ASHA', pin: pinStr, updatedAt: Date.now(),
          });
        } else if (roleKey === ROLES.HYGIENE) {
          await rtdbSet(`hygiene_users/${cleanPhone}`, {
            phone: cleanPhone, name: finalName, role: 'HYGIENE',
            department: 'Water Quality & Health Surveillance',
            pin: pinStr, updatedAt: Date.now(),
          });
        } else if (roleKey === ROLES.ADMIN || roleKey === ROLES.OFFICIAL) {
          await rtdbSet(`admin_users/${cleanPhone}`, {
            phone: cleanPhone, name: finalName, role: 'ADMIN',
            pin: pinStr, updatedAt: Date.now(),
          });
        }
      }

      // 2. Firestore dual-save (safe, non-blocking fallback)
      if (db) {
        try {
          await setDoc(doc(db, 'users', cleanPhone), userAccount, { merge: true });
          await setDoc(doc(db, 'system_credentials', roleKey), {
            phone: cleanPhone, pin: pinStr, name: finalName,
            requiresPin: roleKey !== ROLES.VILLAGER,
            updatedAt: new Date().toISOString(),
          }, { merge: true });

          if (roleKey === ROLES.ASHA) {
            const ashaKey = `ASHA_${cleanPhone.slice(-6)}`;
            await setDoc(doc(db, 'asha_workers', ashaKey), {
              ashaKey, ashaId: ashaKey, ashaName: finalName,
              contactNumber: cleanPhone,
              villageId: userAccount.villageId,
              villageName: userAccount.villageName,
              role: 'ASHA', pin: pinStr, updatedAt: Date.now(),
            }, { merge: true });
          } else if (roleKey === ROLES.HYGIENE) {
            await setDoc(doc(db, 'hygiene_users', cleanPhone), {
              phone: cleanPhone, name: finalName, role: 'HYGIENE',
              department: 'Water Quality & Health Surveillance',
              pin: pinStr, updatedAt: Date.now(),
            }, { merge: true });
          }
        } catch (fsErr) {
          console.warn('[NeerSense Firestore] Registration dual-write note:', fsErr.message);
        }
      }

      try { localStorage.setItem(SESSION_KEY, JSON.stringify(userAccount)); } catch {}
      setActiveRoleState(roleKey);
      setCurrentUserState(userAccount);
      setIsAuthenticated(true);

      console.info(`[NeerSense Auth] 🌟 Personnel registered: ${finalName} (${cleanPhone} - ${roleKey})`);
      return { success: true, user: userAccount };
    } catch (err) {
      console.error('[NeerSense Auth] Registration error:', err);
      return { success: false, message: 'Failed to save to database: ' + (err.message || 'Please try again.') };
    }
  };

  // ─── Change PIN ───────────────────────────────────────────────────────────
  const changePin = async ({ currentPin, newPin }) => {
    const role = activeRole;
    if (!role || role === ROLES.VILLAGER)
      return { success: false, message: 'PIN change not available for your role.' };
    if (!newPin || newPin.length < 4)
      return { success: false, message: 'New PIN must be at least 4 characters.' };
    const livePin = await fetchLivePin(role);
    if (currentPin !== livePin)
      return { success: false, message: 'Current PIN is incorrect.' };
    try {
      const pinPayload = {
        pin: newPin, pinUpdatedAt: new Date().toISOString(),
        pinUpdatedBy: currentUser?.name || role,
      };
      if (rtdb) await rtdbUpdate(`system_credentials/${role}`, pinPayload);
      if (db) {
        try {
          await updateDoc(doc(db, 'system_credentials', role), pinPayload);
        } catch {}
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to save new PIN: ' + err.message };
    }
  };

  // ─── Set Security PIN ─────────────────────────────────────────────────────
  const setSecurityPin = async ({ role, phone, newPin }) => {
    const roleKey = role || activeRole;
    if (!roleKey || roleKey === ROLES.VILLAGER)
      return { success: false, message: 'PIN setup only for department login personnel.' };
    const fixedCred = FIXED_CREDENTIALS[roleKey];
    if (!fixedCred) return { success: false, message: 'Invalid role.' };
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone !== fixedCred.phone)
      return { success: false, message: `Phone does not match registered number for ${fixedCred.name}.` };
    if (!newPin || String(newPin).trim().length < 4)
      return { success: false, message: 'PIN must be at least 4 digits.' };
    const pinStr = String(newPin).trim();
    try {
      const pinPayload = {
        pin: pinStr, pinUpdatedAt: new Date().toISOString(),
        pinUpdatedBy: currentUser?.name || fixedCred.name || roleKey,
      };
      if (rtdb) await rtdbUpdate(`system_credentials/${roleKey}`, pinPayload);
      if (db) {
        try {
          await setDoc(doc(db, 'system_credentials', roleKey), pinPayload, { merge: true });
        } catch {}
      }
      return { success: true, pin: pinStr };
    } catch (err) {
      return { success: false, message: 'Failed to save PIN: ' + err.message };
    }
  };

  // ─── Force Release Admin Lock ─────────────────────────────────────────────
  const forceReleaseAdminLock = async ({ pin }) => {
    const livePin = await fetchLivePin(ROLES.ADMIN);
    if (String(pin).trim() !== String(livePin).trim())
      return { success: false, message: 'Incorrect Admin PIN.' };
    try {
      const lockPayload = {
        isLoggedIn: false, phone: null, sessionId: null,
        forcedReleaseAt: new Date().toISOString(),
      };
      if (rtdb) await rtdbUpdate('system/adminSession', lockPayload);
      if (db) {
        try {
          await setDoc(doc(db, 'system', 'adminSession'), lockPayload, { merge: true });
        } catch {}
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to release lock: ' + err.message };
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    if (activeRole === ROLES.ADMIN || activeRole === ROLES.OFFICIAL) {
      try { localStorage.removeItem('neersense_admin_session_id'); } catch {}
      const logoutPayload = {
        isLoggedIn: false, phone: null, sessionId: null,
        loggedOutAt: new Date().toISOString(),
      };
      if (rtdb) rtdbUpdate('system/adminSession', logoutPayload).catch(() => {});
      if (db) {
        setDoc(doc(db, 'system', 'adminSession'), logoutPayload, { merge: true }).catch(() => {});
      }
    }
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    setIsAuthenticated(false);
    setActiveRoleState(null);
    setCurrentUserState(null);
  };

  return (
    <AuthRoleContext.Provider
      value={{
        isAuthenticated,
        activeRole,
        currentUser,
        adminActivePage,
        setAdminActivePage,
        authLoading: false,
        ROLES,
        isGovernment,
        isAsha,
        isHygiene,
        isVillager,
        loginWithPhone,
        registerPersonnel,
        logout,
        changePin,
        setSecurityPin,
        forceReleaseAdminLock,
        checkPhoneRegistration,
        fetchRegisteredUser,
        FIXED_CREDENTIALS,
        allProfiles: ROLE_DEFAULTS,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
