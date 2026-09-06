import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, subscriptions } from '../services/api';
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

  // ─── Fetch persistent data from REST API ────────────────────────────────
  const fetchFullState = useCallback(async () => {
    try {
      const [vils, wReports, syms, alts] = await Promise.all([
        api.getVillages().catch(() => []),
        api.getWaterReports().catch(() => []),
        api.getSymptoms().catch(() => []),
        api.getAlerts().catch(() => []),
      ]);
      if (Array.isArray(vils)) setVillages(vils);
      if (Array.isArray(wReports)) setWaterReports(wReports);
      if (Array.isArray(syms)) setSymptoms(syms);
      if (Array.isArray(alts)) setAlerts(alts);
    } catch (e) {
      console.warn('API fetch error', e);
    }
  }, []);

  useEffect(() => {
    fetchFullState();
    // Poll every 10s when using REST; Firestore and RTDB use real-time listeners instead
    const interval = (api.isUsingFirestore() || api.isUsingRtdb())
      ? null
      : setInterval(fetchFullState, 10000);
    return () => { if (interval) clearInterval(interval); };
  }, [fetchFullState]);

  // ─── Real-time subscriptions (active when RTDB or Firestore is configured) ──
  useEffect(() => {
    if (!api.isUsingFirestore() && !api.isUsingRtdb()) return;

    const unsubWater = subscriptions.waterReports((reports) => {
      if (Array.isArray(reports)) setWaterReports(reports);
    });

    const unsubSymptoms = subscriptions.symptoms((cases) => {
      if (Array.isArray(cases)) setSymptoms(cases);
    });

    const unsubAlerts = subscriptions.riskDashboards((alts) => {
      if (Array.isArray(alts)) setAlerts(alts);
    });

    return () => {
      unsubWater();
      unsubSymptoms();
      unsubAlerts();
    };
  }, []);

  // ─── WebSocket for live sensor telemetry (local Express server) ──────────
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl =
      window.location.port === '5173' || window.location.port === '5174'
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
              if (data.villages) setVillages(data.villages);
              if (data.waterReports) setWaterReports(data.waterReports);
              if (data.sensors) setSensors(data.sensors);
              if (data.symptoms) setSymptoms(data.symptoms);
              if (data.alerts) setAlerts(data.alerts);
            } else if (type === 'WATER_REPORTS_UPDATE') {
              if (Array.isArray(data)) setWaterReports(data);
            } else if (type === 'VILLAGES_UPDATE') {
              if (Array.isArray(data)) setVillages(data);
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

  const updateWaterReportLocally = useCallback((id, updatedFields) => {
    setWaterReports((prev) =>
      prev.map((rep) =>
        rep.id === id
          ? {
              ...rep,
              ...updatedFields,
              isAltered: true,
              alteredAt: updatedFields.alteredAt || new Date().toISOString()
            }
          : rep
      )
    );
  }, []);

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
        updateWaterReportLocally,
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
