import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, FileCheck, Activity, Database } from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';
import { seedNeerSenseData } from '../../services/seedData';
import GovernmentAuthGate from '../../components/GovernmentAuthGate';

import GovtReportVerificationDesk from './GovtReportVerificationDesk';
import CommunitySurveillanceFeed from './CommunitySurveillanceFeed';
import SystemControlToolbar from './SystemControlToolbar';
import WaterQualityInputForm from './WaterQualityInputForm';

function AdminDashboardContent() {
  const { waterReports = [], symptoms = [], refreshData = () => {} } = useAlertNotification() || {};
  const [adminTab, setAdminTab] = useState('verification'); // 'verification', 'surveillance', 'directLab', 'controls'
  const [toastMessage, setToastMessage] = useState(null);

  const safeWaterReports = Array.isArray(waterReports) ? waterReports : [];
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];

  const pendingReportsCount = safeWaterReports.filter(r => r && (r.status === 'PENDING_APPROVAL' || (!r.isApproved && r.status !== 'REJECTED'))).length;

  const handleClearAll = async () => {
    if (confirm('Reset entire system to empty state? All water reports, symptoms, and alerts will be cleared.')) {
      try {
        await api.clearAllData();
        refreshData();
        setToastMessage({ type: 'success', text: 'All data cleared. System is in clean initial empty state.' });
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const [seeding, setSeeding] = useState(false);
  const handleSeedData = async () => {
    if (!confirm('Load sample demo village data into system? This is safe to run multiple times.')) return;
    setSeeding(true);
    try {
      const result = await seedNeerSenseData();
      refreshData();
      setToastMessage({ type: 'success', text: `✅ Loaded sample data for ${result.villages} villages.` });
    } catch (err) {
      setToastMessage({ type: 'error', text: `Load failed: ${err.message}` });
    } finally {
      setSeeding(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* Government Top Header Banner */}
      <div className="card bg-gradient-to-r from-sky-100 via-sky-50 to-white border-sky-300 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-blue flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Ministry of Jal Shakti &bull; MoHFW
              </span>
              <span className="badge badge-safe">Super-User Authorization</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-sky-950">
              National Drinking Water Safety Command & Verification Desk
            </h1>
            <p className="text-xs text-sky-800 mt-0.5">
              Review ASHA field reports, verify laboratory test parameters, and publish verified advisories to the public.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SystemControlToolbar onClearAll={handleClearAll} />
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition disabled:opacity-60 cursor-pointer"
              title="Load sample demo village data"
            >
              <Database className="w-3.5 h-3.5" />
              {seeding ? 'Loading…' : '🌱 Load Sample Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-sky-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('verification')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            adminTab === 'verification'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>🛡️ Verify & Approve ASHA Reports ({pendingReportsCount} Pending)</span>
        </button>

        <button
          onClick={() => setAdminTab('surveillance')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            adminTab === 'surveillance'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>📊 Community Health Cases ({safeSymptoms.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('directLab')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            adminTab === 'directLab'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>🔬 Direct Central Lab Test Entry</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {adminTab === 'verification' && <GovtReportVerificationDesk />}
        {adminTab === 'surveillance' && <CommunitySurveillanceFeed />}
        {adminTab === 'directLab' && (
          <WaterQualityInputForm 
            onSuccess={() => {
              setToastMessage({ type: 'success', text: 'Central Lab Report directly published to the system!' });
              setAdminTab('verification');
            }} 
          />
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <GovernmentAuthGate 
        title="Government Administration Portal Access" 
        requiredRole="Government"
      >
        <AdminDashboardContent />
      </GovernmentAuthGate>
    </div>
  );
}
