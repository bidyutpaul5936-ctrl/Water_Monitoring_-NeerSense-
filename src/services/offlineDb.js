// offlineDb.js - IndexedDB storage for offline-first symptom and water test caching

const DB_NAME = 'JalSurakshaOfflineDB';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('symptomsQueue')) {
        db.createObjectStore('symptomsQueue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('waterTestsQueue')) {
        db.createObjectStore('waterTestsQueue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineDb = {
  async saveSymptomOffline(symptomReport) {
    try {
      const db = await openDB();
      const tx = db.transaction('symptomsQueue', 'readwrite');
      const store = tx.objectStore('symptomsQueue');
      const item = {
        ...symptomReport,
        id: symptomReport.id || `off-sym-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        queuedAt: new Date().toISOString(),
        syncStatus: 'PENDING'
      };
      await new Promise((res, rej) => {
        const req = store.put(item);
        req.onsuccess = () => res(item);
        req.onerror = () => rej(req.error);
      });
      return item;
    } catch (err) {
      console.warn('IndexedDB fallback to localStorage', err);
      const queue = JSON.parse(localStorage.getItem('jalsuraksha_offline_symptoms') || '[]');
      queue.push(symptomReport);
      localStorage.setItem('jalsuraksha_offline_symptoms', JSON.stringify(queue));
      return symptomReport;
    }
  },

  async getPendingSymptoms() {
    try {
      const db = await openDB();
      const tx = db.transaction('symptomsQueue', 'readonly');
      const store = tx.objectStore('symptomsQueue');
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return JSON.parse(localStorage.getItem('jalsuraksha_offline_symptoms') || '[]');
    }
  },

  async removeSyncedSymptoms(ids) {
    try {
      const db = await openDB();
      const tx = db.transaction('symptomsQueue', 'readwrite');
      const store = tx.objectStore('symptomsQueue');
      for (const id of ids) {
        store.delete(id);
      }
    } catch {
      let queue = JSON.parse(localStorage.getItem('jalsuraksha_offline_symptoms') || '[]');
      queue = queue.filter(item => !ids.includes(item.id));
      localStorage.setItem('jalsuraksha_offline_symptoms', JSON.stringify(queue));
    }
  },

  async saveWaterTestOffline(testReport) {
    try {
      const db = await openDB();
      const tx = db.transaction('waterTestsQueue', 'readwrite');
      const store = tx.objectStore('waterTestsQueue');
      const item = {
        ...testReport,
        id: testReport.id || `off-tst-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        queuedAt: new Date().toISOString(),
        syncStatus: 'PENDING'
      };
      await new Promise((res, rej) => {
        const req = store.put(item);
        req.onsuccess = () => res(item);
        req.onerror = () => rej(req.error);
      });
      return item;
    } catch {
      const queue = JSON.parse(localStorage.getItem('jalsuraksha_offline_tests') || '[]');
      queue.push(testReport);
      localStorage.setItem('jalsuraksha_offline_tests', JSON.stringify(queue));
      return testReport;
    }
  },

  async getPendingWaterTests() {
    try {
      const db = await openDB();
      const tx = db.transaction('waterTestsQueue', 'readonly');
      const store = tx.objectStore('waterTestsQueue');
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return JSON.parse(localStorage.getItem('jalsuraksha_offline_tests') || '[]');
    }
  },

  async removeSyncedWaterTests(ids) {
    try {
      const db = await openDB();
      const tx = db.transaction('waterTestsQueue', 'readwrite');
      const store = tx.objectStore('waterTestsQueue');
      for (const id of ids) {
        store.delete(id);
      }
    } catch {
      let queue = JSON.parse(localStorage.getItem('jalsuraksha_offline_tests') || '[]');
      queue = queue.filter(item => !ids.includes(item.id));
      localStorage.setItem('jalsuraksha_offline_tests', JSON.stringify(queue));
    }
  }
};
