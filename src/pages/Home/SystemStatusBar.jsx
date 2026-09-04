import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, ArrowRight } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';

export default function SystemStatusBar() {
  const { waterReports } = useAlertNotification();
  const { activeRole, isGovernment } = useAuthRole();

  // Only count approved reports for public status
  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);
  const pendingCount = waterReports.filter(r => r.status === 'PENDING_APPROVAL' || (!r.isApproved && r.status !== 'REJECTED')).length;

  const safeCount = approvedReports.filter(r => r.safetyStatus === 'SAFE').length;
  const warningCount = approvedReports.filter(r => r.safetyStatus === 'WARNING').length;
  const criticalCount = approvedReports.filter(r => r.safetyStatus === 'CONTAMINATED').length;

  return (
    <div className="card bg-white border border-sky-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            approvedReports.length === 0 
              ? 'bg-sky-100 text-sky-700' 
              : criticalCount > 0 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-sky-950 flex flex-wrap items-center gap-2">
              <span>Drinking Water Surveillance Status:</span>
              {approvedReports.length === 0 ? (
                <span className="badge badge-neutral">Awaiting Government-Approved Data</span>
              ) : criticalCount > 0 ? (
                <span className="badge badge-critical">{criticalCount} Contaminated Source(s)</span>
              ) : (
                <span className="badge badge-safe">All Tested Sources Normal</span>
              )}
              {pendingCount > 0 && (
                <span className="badge badge-warning text-3xs">{pendingCount} ASHA Report(s) Pending Verification</span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {approvedReports.length === 0 ? (
                'No government-verified water reports published yet. ASHA workers submit field data → Government officers verify & approve → Reports appear for villagers.'
              ) : (
                `${approvedReports.length} government-approved water source(s) tested — ${safeCount} Safe, ${warningCount} Moderate Warning, ${criticalCount} Contaminated.`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isGovernment ? (
            <Link
              to="/admin"
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
            >
              <span>Government Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : activeRole === ROLES.ASHA ? (
            <Link
              to="/asha"
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
            >
              <span>ASHA Testing Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : activeRole === ROLES.HYGIENE ? (
            <Link
              to="/hygiene"
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
            >
              <span>Hygiene Classification Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/villagers"
              className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
            >
              <span>View Water Quality Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
