import React, { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, FileCheck, Activity, Database, BookOpen, Users, Home, PieChart } from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';
import { seedNeerSenseData } from '../../services/seedData';
import GovernmentAuthGate from '../../components/GovernmentAuthGate';

import GovtReportVerificationDesk from './GovtReportVerificationDesk';
import CommunitySurveillanceFeed from './CommunitySurveillanceFeed';
import SystemControlToolbar from './SystemControlToolbar';
import WaterQualityInputForm from './WaterQualityInputForm';
import StateQualityChart from './StateQualityChart';

// Embedded pages for Admin Unified Hub
import { AshaDashboardContent } from '../Asha';
import { HygieneDashboardContent } from '../Hygiene';
import VillagersPage from '../Villagers';
import HomePage from '../Home';

function AdminDashboardContent() {
  const { adminActivePage = 'admin', setAdminActivePage } = useAuthRole() || {};
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
              <span className="badge badge-neutral text-3xs font-mono">URL: /admin (Locked)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-sky-950">
              National Drinking Water Safety Command & Verification Desk
            </h1>
            <p className="text-xs text-sky-800 mt-0.5">
              Super-User Unified Central Console &bull; View and manage all portal modules directly within the Government Admin link.
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

      {/* Admin Multi-Page Switcher: All pages rendered strictly under the /admin link */}
      <div className="bg-white border-2 border-sky-300 rounded-2xl p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <div className="px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-sky-950 flex items-center gap-1 border-r border-sky-200 mr-1 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Admin Modules:</span>
        </div>

        <button
          onClick={() => setAdminActivePage && setAdminActivePage('admin')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            adminActivePage === 'admin'
              ? 'bg-sky-700 text-white shadow-md'
              : 'text-sky-900 hover:bg-sky-100/70'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏛️ Govt Admin Command Desk</span>
        </button>

        <button
          onClick={() => setAdminActivePage && setAdminActivePage('asha')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            adminActivePage === 'asha'
              ? 'bg-sky-700 text-white shadow-md'
              : 'text-sky-900 hover:bg-sky-100/70'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>👩‍⚕️ ASHA Field Worker Portal</span>
        </button>

        <button
          onClick={() => setAdminActivePage && setAdminActivePage('hygiene')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            adminActivePage === 'hygiene'
              ? 'bg-sky-700 text-white shadow-md'
              : 'text-sky-900 hover:bg-sky-100/70'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>👩‍🔬 Hygiene &amp; Sanitation Portal</span>
        </button>

        <button
          onClick={() => setAdminActivePage && setAdminActivePage('villagers')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            adminActivePage === 'villagers'
              ? 'bg-sky-700 text-white shadow-md'
              : 'text-sky-900 hover:bg-sky-100/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👨‍🌾 Villagers Public Portal</span>
        </button>

        <button
          onClick={() => setAdminActivePage && setAdminActivePage('home')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            adminActivePage === 'home'
              ? 'bg-sky-700 text-white shadow-md'
              : 'text-sky-900 hover:bg-sky-100/70'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>🏠 System Overview / Home</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Conditional Module Content Rendered Inside /admin */}
      {adminActivePage === 'asha' ? (
        <div className="animate-fadeIn">
          <AshaDashboardContent />
        </div>
      ) : adminActivePage === 'hygiene' ? (
        <div className="animate-fadeIn">
          <HygieneDashboardContent />
        </div>
      ) : adminActivePage === 'villagers' ? (
        <div className="animate-fadeIn">
          <VillagersPage />
        </div>
      ) : adminActivePage === 'home' ? (
        <div className="animate-fadeIn">
          <HomePage />
        </div>
      ) : (
        /* Default: Government Admin Command Desk */
        <div className="space-y-6 animate-fadeIn">
          {/* Internal Command Desk Tabs */}
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

            <button
              onClick={() => setAdminTab('analytics')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
                adminTab === 'analytics'
                  ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
                  : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>📈 Statewide Analytics</span>
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
            {adminTab === 'analytics' && <StateQualityChart />}
          </div>
        </div>
      )}
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
