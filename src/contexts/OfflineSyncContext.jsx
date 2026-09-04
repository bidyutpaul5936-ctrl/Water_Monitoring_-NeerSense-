import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineDb } from '../services/offlineDb';
import { api } from '../services/api';

const OfflineSyncContext = createContext();

export const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSymptoms, setPendingSymptoms] = useState([]);
  const [pendingWaterTests, setPendingWaterTests] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const refreshPendingCounts = useCallback(async () => {
    try {
      const syms = await offlineDb.getPendingSymptoms();
      const tests = await offlineDb.getPendingWaterTests();
      setPendingSymptoms(syms);
      setPendingWaterTests(tests);
    } catch (e) {
      console.warn('Error fetching pending offline items', e);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const syms = await offlineDb.getPendingSymptoms();
      if (syms.length > 0) {
        for (const sym of syms) {
          await api.submitSymptoms(sym);
        }
        await offlineDb.removeSyncedSymptoms(syms.map(s => s.id));
      }

      const tests = await offlineDb.getPendingWaterTests();
      if (tests.length > 0) {
        for (const test of tests) {
          await api.submitManualTest(test);
        }
        await offlineDb.removeSyncedWaterTests(tests.map(t => t.id));
      }

      setLastSyncTime(new Date().toISOString());
      await refreshPendingCounts();
    } catch (err) {
      console.warn('Sync failed, will retry when network stabilizes:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCounts]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCounts();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow, refreshPendingCounts]);

  const queueSymptomReport = async (report) => {
    if (isOnline) {
      try {
        await api.submitSymptoms(report);
        return { success: true, mode: 'ONLINE' };
      } catch {
        await offlineDb.saveSymptomOffline(report);
        await refreshPendingCounts();
        return { success: true, mode: 'OFFLINE_QUEUED' };
      }
    } else {
      await offlineDb.saveSymptomOffline(report);
      await refreshPendingCounts();
      return { success: true, mode: 'OFFLINE_QUEUED' };
    }
  };

  const queueWaterTest = async (test) => {
    if (isOnline) {
      try {
        await api.submitManualTest(test);
        return { success: true, mode: 'ONLINE' };
      } catch {
        await offlineDb.saveWaterTestOffline(test);
        await refreshPendingCounts();
        return { success: true, mode: 'OFFLINE_QUEUED' };
      }
    } else {
      await offlineDb.saveWaterTestOffline(test);
      await refreshPendingCounts();
      return { success: true, mode: 'OFFLINE_QUEUED' };
    }
  };

  const totalPending = pendingSymptoms.length + pendingWaterTests.length;

  return (
    <OfflineSyncContext.Provider value={{
      isOnline,
      isSyncing,
      pendingSymptoms,
      pendingWaterTests,
      totalPending,
      lastSyncTime,
      syncNow,
      queueSymptomReport,
      queueWaterTest,
      refreshPendingCounts
    }}>
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => useContext(OfflineSyncContext);
