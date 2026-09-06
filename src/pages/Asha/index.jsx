import React, { useState } from 'react';
import { Activity, FlaskConical, FileText, Stethoscope, TestTube2, ShieldCheck } from 'lucide-react';
import { useAuthRole } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import GovernmentAuthGate from '../../components/GovernmentAuthGate';
import { AlterationModeBanner } from '../../contexts/AlterationPermissionContext';

import AshaWaterDataEntryForm from './AshaWaterDataEntryForm';
import AshaSubmittedReportsList from './AshaSubmittedReportsList';
import PatientCasesFeed from './PatientCasesFeed';
import H2SFieldTestLogger from './H2SFieldTestLogger';

export function AshaDashboardContent() {
  const { isGovernment, currentUser = {} } = useAuthRole() || {};
  const { symptoms = [], waterReports = [] } = useAlertNotification() || {};
  const [activeTab, setActiveTab] = useState('dataEntry'); // 'dataEntry', 'myReports', 'cases', 'h2sGuide'
  const [retestReport, setRetestReport] = useState(null); // pre-fill data for re-test

  const handleRetestRequest = (report) => {
    setRetestReport(report);
    setActiveTab('dataEntry');
  };

  const handleTabChange = (tab) => {
    if (tab !== 'dataEntry') setRetestReport(null);
    setActiveTab(tab);
  };

  const safeWaterReports = Array.isArray(waterReports) ? waterReports : [];
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];

  const pendingReportsCount = safeWaterReports.filter(r => r && (r.status === 'PENDING_APPROVAL' || (!r.isApproved && r.status !== 'REJECTED'))).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-sky-100 via-sky-50 to-white border-sky-300 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-safe">
                <Activity className="w-3 h-3" /> ASHA & Field Health Worker Portal
              </span>
              <span className="badge badge-neutral">National Rural Health Mission (NRHM)</span>
              {isGovernment && (
                <span className="badge badge-blue">
                  <ShieldCheck className="w-3 h-3" /> Government Super-User View
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-sky-950">
              Community Water Testing & Health Surveillance Desk
            </h1>
            <p className="text-xs text-sky-800 mt-0.5">
              Logged in Field Worker: <strong>{currentUser.name || 'Kuni Majhi (ASHA-071)'}</strong> &bull; Primary Health Center (PHC)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-warning">
              {pendingReportsCount} Report(s) Awaiting Govt Approval
            </span>
            <span className="badge badge-blue">
              {safeSymptoms.length} Patient Case(s) in Triage
            </span>
          </div>
        </div>
      </div>

      {/* Admin Alteration Mode Guard / Banner */}
      <AlterationModeBanner department="ASHA" />

      {/* Navigation Tabs */}
      <div className="flex border-b border-sky-200 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('dataEntry')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            activeTab === 'dataEntry'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>➕ Enter Water Test Data (Send to Govt)</span>
        </button>

        <button
          onClick={() => handleTabChange('myReports')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            activeTab === 'myReports'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>📑 Submitted Reports Tracker ({safeWaterReports.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('cases')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            activeTab === 'cases'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>🤒 Villager Patient Symptoms ({safeSymptoms.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('h2sGuide')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
            activeTab === 'h2sGuide'
              ? 'bg-white border-sky-300 text-sky-900 border-b-white -mb-px shadow-sm'
              : 'border-transparent text-sky-700 hover:text-sky-900 hover:bg-sky-100/50'
          }`}
        >
          <TestTube2 className="w-3.5 h-3.5" />
          <span>🧪 Rapid Field Test Kit Guide</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'dataEntry' && (
          <AshaWaterDataEntryForm 
            prefillData={retestReport}
            onReportSubmitted={() => { setRetestReport(null); setActiveTab('myReports'); }} 
          />
        )}
        {activeTab === 'myReports' && <AshaSubmittedReportsList onRetestRequest={handleRetestRequest} />}
        {activeTab === 'cases' && <PatientCasesFeed />}
        {activeTab === 'h2sGuide' && <H2SFieldTestLogger />}
      </div>
    </div>
  );
}

export default function AshaPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <GovernmentAuthGate title="ASHA & Field Healthcare Portal Access" requiredRole="ASHA">
        <AshaDashboardContent />
      </GovernmentAuthGate>
    </div>
  );
}
