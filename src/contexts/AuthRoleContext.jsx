import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { firestoreService } from '../services/firestoreService';

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

export const AuthRoleProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);   // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null);     // Firestore profile
  const [activeRole, setActiveRoleState] = useState(ROLES.VILLAGER);
  const [authLoading, setAuthLoading] = useState(true);     // true until onAuthStateChanged resolves
  const [authError, setAuthError] = useState(null);

  // ─── Listen for Firebase Auth state ───────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await firestoreService.getUserProfile(fbUser.uid);
          if (profile) {
            setUserProfile(profile);
            setActiveRoleState(profile.role || ROLES.VILLAGER);
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      } else {
        setFirebaseUser(null);
        setUserProfile(null);
        setActiveRoleState(ROLES.VILLAGER);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ─── Derived role flags ────────────────────────────────────────────────────
  const isGovernment = activeRole === ROLES.OFFICIAL || activeRole === ROLES.ADMIN;
  const isAsha = activeRole === ROLES.ASHA || isGovernment;
  const isHygiene = activeRole === ROLES.HYGIENE || isGovernment;
  const isVillager = activeRole === ROLES.VILLAGER;
  const isAuthenticated = !!firebaseUser;

  // Build currentUser from Firestore profile + ROLE_DEFAULTS
  const currentUser = userProfile
    ? {
        ...ROLE_DEFAULTS[userProfile.role] || ROLE_DEFAULTS.villager,
        ...userProfile,
      }
    : { role: ROLES.VILLAGER, ...ROLE_DEFAULTS.villager };

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  /**
   * Register a new user with email/password and create a Firestore profile.
   * @param {string} email
   * @param {string} password
   * @param {string} role - One of ROLES values
   * @param {object} extraData - name, villageId, villageName, phone, etc.
   */
  const registerWithEmail = async (email, password, role, extraData = {}) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = cred.user;

      // Set Firebase display name
      if (extraData.name) {
        await updateProfile(cred.user, { displayName: extraData.name });
      }

      // Create Firestore user profile
      const profile = {
        uid,
        email,
        role: role || ROLES.VILLAGER,
        name: extraData.name || '',
        villageId: extraData.villageId || '',
        villageName: extraData.villageName || '',
        district: extraData.district || '',
        phone: extraData.phone || '',
        ashaId: extraData.ashaId || '',
        department: extraData.department || '',
        ...ROLE_DEFAULTS[role] || ROLE_DEFAULTS.villager,
      };

      await firestoreService.createUserProfile(uid, profile);
      setUserProfile(profile);
      setActiveRoleState(role || ROLES.VILLAGER);
      return { success: true };
    } catch (err) {
      const msg = getFriendlyAuthError(err.code);
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Sign in with email/password.
   */
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle loading the profile
      return { success: true };
    } catch (err) {
      const msg = getFriendlyAuthError(err.code);
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Sign out.
   */
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setActiveRoleState(ROLES.VILLAGER);
  };

  // Keep legacy alias used in some components
  const logoutToVillager = logout;

  // ─── Error Messages ────────────────────────────────────────────────────────
  function getFriendlyAuthError(code) {
    const map = {
      'auth/email-already-in-use': 'This email is already registered. Please log in.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Incorrect email or password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
    };
    return map[code] || 'An unexpected error occurred. Please try again.';
  }

  return (
    <AuthRoleContext.Provider
      value={{
        // State
        firebaseUser,
        userProfile,
        activeRole,
        currentUser,
        authLoading,
        authError,
        isAuthenticated,
        // Role flags
        ROLES,
        isGovernment,
        isAsha,
        isHygiene,
        isVillager,
        // Auth actions
        registerWithEmail,
        loginWithEmail,
        logout,
        logoutToVillager,
        // Legacy (no-op stubs to avoid breaking existing components)
        setRole: () => {},
        loginAsGovernment: () => ({ success: false, message: 'Use email login' }),
        loginAsAsha: () => ({ success: false, message: 'Use email login' }),
        loginAsHygiene: () => ({ success: false, message: 'Use email login' }),
        allProfiles: ROLE_DEFAULTS,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
