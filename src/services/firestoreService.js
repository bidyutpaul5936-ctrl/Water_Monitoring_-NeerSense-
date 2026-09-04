// src/services/firestoreService.js — Firestore CRUD layer for NeerSense
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Collection References ─────────────────────────────────────────────────
const COLLECTIONS = {
  USERS: 'users',
  VILLAGES: 'villages',
  WATER_REPORTS: 'waterReports',
  SYMPTOMS: 'symptoms',
  ALERTS: 'alerts',
  MANUAL_TESTS: 'manualTests',
  SENSORS: 'sensors',
};

// ─── User Profile ──────────────────────────────────────────────────────────
export const firestoreService = {
  // Create user profile document after Firebase Auth registration
  async createUserProfile(uid, profileData) {
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Get user profile by UID
  async getUserProfile(uid) {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  // Update user profile
  async updateUserProfile(uid, data) {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  // ─── Villages ─────────────────────────────────────────────────────────────
  async getVillages() {
    const snap = await getDocs(collection(db, COLLECTIONS.VILLAGES));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getVillageById(id) {
    const snap = await getDoc(doc(db, COLLECTIONS.VILLAGES, id));
    if (!snap.exists()) throw new Error('Village not found');
    return { id: snap.id, ...snap.data() };
  },

  // Seed villages (admin only, used once)
  async seedVillage(village) {
    const { id, ...rest } = village;
    await setDoc(doc(db, COLLECTIONS.VILLAGES, id), {
      ...rest,
      createdAt: serverTimestamp(),
    });
  },

  // ─── Water Reports ─────────────────────────────────────────────────────────
  async getWaterReports() {
    const q = query(
      collection(db, COLLECTIONS.WATER_REPORTS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async createWaterReport(reportData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.WATER_REPORTS), {
      ...reportData,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...reportData, status: 'PENDING' };
  },

  async classifyWaterReport(id, classificationData) {
    await updateDoc(doc(db, COLLECTIONS.WATER_REPORTS, id), {
      ...classificationData,
      status: 'CLASSIFIED',
      classifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async verifyWaterReport(id, verificationData) {
    await updateDoc(doc(db, COLLECTIONS.WATER_REPORTS, id), {
      ...verificationData,
      status: 'VERIFIED',
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async rejectWaterReport(id, reasonData) {
    await updateDoc(doc(db, COLLECTIONS.WATER_REPORTS, id), {
      ...reasonData,
      status: 'REJECTED',
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async deleteWaterReport(id) {
    await deleteDoc(doc(db, COLLECTIONS.WATER_REPORTS, id));
    return { success: true };
  },

  // ─── Symptoms ──────────────────────────────────────────────────────────────
  async getSymptoms() {
    const q = query(
      collection(db, COLLECTIONS.SYMPTOMS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async submitSymptoms(data) {
    const docRef = await addDoc(collection(db, COLLECTIONS.SYMPTOMS), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  },

  // ─── Alerts ────────────────────────────────────────────────────────────────
  async getAlerts() {
    const q = query(
      collection(db, COLLECTIONS.ALERTS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async createAlert(alertData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.ALERTS), {
      ...alertData,
      acknowledged: false,
      actions: [],
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...alertData };
  },

  async acknowledgeAlert(alertId, acknowledgedBy) {
    await updateDoc(doc(db, COLLECTIONS.ALERTS, alertId), {
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: serverTimestamp(),
    });
  },

  async dispatchResponseAction(alertId, actionData) {
    const alertRef = doc(db, COLLECTIONS.ALERTS, alertId);
    const snap = await getDoc(alertRef);
    if (!snap.exists()) throw new Error('Alert not found');
    const existing = snap.data().actions || [];
    const newAction = {
      id: `action-${Date.now()}`,
      ...actionData,
      status: 'DISPATCHED',
      dispatchedAt: new Date().toISOString(),
    };
    await updateDoc(alertRef, { actions: [...existing, newAction] });
    return newAction;
  },

  async updateActionStatus(alertId, actionId, status) {
    const alertRef = doc(db, COLLECTIONS.ALERTS, alertId);
    const snap = await getDoc(alertRef);
    if (!snap.exists()) throw new Error('Alert not found');
    const actions = (snap.data().actions || []).map((a) =>
      a.id === actionId ? { ...a, status } : a
    );
    await updateDoc(alertRef, { actions });
  },

  // ─── Manual Tests ──────────────────────────────────────────────────────────
  async getManualTests() {
    const q = query(
      collection(db, COLLECTIONS.MANUAL_TESTS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async submitManualTest(testData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.MANUAL_TESTS), {
      ...testData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...testData };
  },

  // ─── Real-time Listener ────────────────────────────────────────────────────
  // Subscribe to water reports in real-time
  subscribeToWaterReports(callback) {
    const q = query(
      collection(db, COLLECTIONS.WATER_REPORTS),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(reports);
    });
  },

  // Subscribe to alerts in real-time
  subscribeToAlerts(callback) {
    const q = query(
      collection(db, COLLECTIONS.ALERTS),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const alerts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(alerts);
    });
  },

  // Subscribe to symptoms in real-time
  subscribeToSymptoms(callback) {
    const q = query(
      collection(db, COLLECTIONS.SYMPTOMS),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const symptoms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(symptoms);
    });
  },
};
