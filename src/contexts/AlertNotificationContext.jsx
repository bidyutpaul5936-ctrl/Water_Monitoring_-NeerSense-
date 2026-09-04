import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../services/firestoreService';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { useLanguage } from './LanguageContext';

const AlertNotificationContext = createContext();

export const AlertNotificationProvider = ({ children }) => {
  const { lang } = useLanguage();
  const [villages, setVillages] = useState([]);
  const [waterReports, setWaterReports] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentNotification, setRecentNotification] = useState(null);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // ─── Fetch persistent data from Firestore ────────────────────────────────
  const fetchFullState = useCallback(async () => {
    try {
      const [vils, wReports, syms, alts] = await Promise.all([
        firestoreService.getVillages().catch(() => []),
        firestoreService.getWaterReports().catch(() => []),
        firestoreService.getSymptoms().catch(() => []),
        firestoreService.getAlerts().catch(() => []),
      ]);
      if (Array.isArray(vils)) setVillages(vils);
      if (Array.isArray(wReports)) setWaterReports(wReports);
      if (Array.isArray(syms)) setSymptoms(syms);
      if (Array.isArray(alts)) setAlerts(alts);
    } catch (e) {
      console.warn('Firestore fetch fallback', e);
      // Try REST as a fallback if Firestore is unavailable
      try {
        const [vils, wReports, syms, alts] = await Promise.all([
          api.getVillages().catch(() => []),
          api.getWaterReports().catch(() => []),
          api.getSymptoms().catch(() => []),
          api.getAlerts().catch(() => [])
        ]);
        if (Array.isArray(vils)) setVillages(vils);
        if (Array.isArray(wReports)) setWaterReports(wReports);
        if (Array.isArray(syms)) setSymptoms(syms);
        if (Array.isArray(alts)) setAlerts(alts);
      } catch (restErr) {
        console.warn('REST fallback also failed', restErr);
      }
    }
  }, []);

  // ─── Firestore real-time listeners ───────────────────────────────────────
  useEffect(() => {
    // Initial load
    fetchFullState();

    // Subscribe to real-time Firestore updates
    const unsubReports = firestoreService.subscribeToWaterReports(setWaterReports);
    const unsubAlerts = firestoreService.subscribeToAlerts((newAlerts) => {
      setAlerts((prev) => {
        // Detect truly new alerts and fire notifications
        const prevIds = new Set(prev.map((a) => a.id));
        const fresh = newAlerts.filter((a) => !prevIds.has(a.id));
        fresh.forEach((data) => {
          setRecentNotification({
            type: 'CRITICAL_ALERT',
            title: data.title,
            message: data.message,
            village: data.villageName,
            id: data.id,
            time: new Date().toLocaleTimeString(),
          });
          if (voiceAlertsEnabled) {
            const voiceMsg =
              lang === 'hi'
                ? `चेतावनी: ${data.villageName} में पानी में जीवाणु संक्रमण बढ़ा। पानी उबालकर पिएं।`
                : `Alert: High water contamination reported in ${data.villageName}. Boil water before drinking.`;
            speechService.speak(voiceMsg, lang);
          }
        });
        return newAlerts;
      });
    });
    const unsubSymptoms = firestoreService.subscribeToSymptoms(setSymptoms);

    return () => {
      unsubReports();
      unsubAlerts();
      unsubSymptoms();
    };
  }, [fetchFullState, voiceAlertsEnabled, lang]);

  // ─── WebSocket for live sensor telemetry (local Express server) ──────────
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl =
      window.location.port === '5173'
        ? `${wsProtocol}//${window.location.hostname}:5000`
        : `${wsProtocol}//${window.location.host}`;
    let ws = null;
    let reconnectTimeout = null;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => { setIsConnected(true); };

        ws.onmessage = (event) => {
          try {
            const { type, data } = JSON.parse(event.data);
            if (type === 'INITIAL_STATE') {
              // Only use sensor data from WebSocket — Firestore handles the rest
              if (data.sensors) setSensors(data.sensors);
            } else if (type === 'SENSOR_STREAM') {
              setSensors(data);
            } else if (type === 'SENSOR_UPDATE') {
              setSensors((prev) => prev.map((s) => (s.id === data.id ? data : s)));
            }
          } catch (err) {
            console.warn('WS message parse error', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws && ws.close();
        };
      } catch (err) {
        console.warn('WS connection setup error', err);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const clearNotification = () => setRecentNotification(null);

  return (
    <AlertNotificationContext.Provider
      value={{
        villages,
        waterReports,
        sensors,
        symptoms,
        alerts,
        recentNotification,
        clearNotification,
        voiceAlertsEnabled,
        setVoiceAlertsEnabled,
        isConnected,
        refreshData: fetchFullState,
        setVillages,
        setWaterReports,
        setSensors,
        setSymptoms,
        setAlerts,
      }}
    >
      {children}
    </AlertNotificationContext.Provider>
  );
};

export const useAlertNotification = () => useContext(AlertNotificationContext);
