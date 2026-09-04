import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity, Building2, CheckCircle2, ArrowRight, ShieldCheck, Lock, FlaskConical, Droplets } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';

export default function PortalLaunchCards() {
  const { symptoms, waterReports } = useAlertNotification();
  const { activeRole, isGovernment, isAsha, isHygiene, isVillager } = useAuthRole();

  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);
  const pendingClassification = waterReports.filter(r => r.status === 'PENDING_CLASSIFICATION' || (!r.status && !r.isApproved));
  const pendingApproval = waterReports.filter(r => r.status === 'PENDING_APPROVAL');

  const showVillagerCard = isVillager || isGovernment;
  const showAshaCard = activeRole === ROLES.ASHA || isGovernment;
  const showHygieneCard = activeRole === ROLES.HYGIENE || isGovernment;
  const showAdminCard = isGovernment;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-extrabold text-sky-950">
          {isGovernment ? 'Government Master Portals Overview' : 'Your Dedicated Access Portal'}
        </h2>
        <p className="text-xs text-slate-600">
          {isGovernment 
            ? 'Super-user access to all national portals with full verification and publishing authority.' 
            : 'Access restricted to your authorized department. Edit permissions are locked strictly to your portal.'}
        </p>
      </div>

      <div className={`grid gap-5 ${
        isGovernment ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 max-w-xl mx-auto'
      }`}>
        
        {/* 1. Villagers Card */}
        {showVillagerCard && (
          <div className="card hover:border-sky-400 transition-all flex flex-col justify-between group bg-white">
            <div className="card-body space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="badge badge-blue">Public Access</span>
                  <span className="text-3xs font-bold text-sky-700 font-mono">/villagers</span>
                </div>
                <h3 className="text-base font-bold text-sky-950">Villagers Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Check official drinking water quality reports verified by the Government, safe boiling advisories, and report family symptoms via voice or touch.
                </p>
              </div>

              <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-2.5 text-2xs text-sky-900 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-600 flex-shrink-0" />
                  <span>View {approvedReports.length} Government-Approved Reports</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-600 flex-shrink-0" />
                  <span>Enter Family Health Condition / Symptoms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-sky-600 flex-shrink-0" />
                  <span>Direct 104 / 108 Emergency Helpline Access</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                to="/villagers"
                className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Enter Villagers Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 2. ASHA Workers Card */}
        {showAshaCard && (
          <div className="card hover:border-emerald-400 transition-all flex flex-col justify-between group bg-white">
            <div className="card-body space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="badge badge-safe">Field Healthcare</span>
                  <span className="text-3xs font-bold text-emerald-700 font-mono">/asha</span>
                </div>
                <h3 className="text-base font-bold text-sky-950">ASHA & Health Workers Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Record field water testing measurements (pH, turbidity, H2S strip result) and submit them to the Hygiene Dept for safety classification.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-2.5 text-2xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span>Field Water Testing Data Entry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span>Track Submitted Reports Status</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span>Patient Triage: {symptoms.length} case(s) reported</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                to="/asha"
                className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Enter ASHA Worker Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 3. Hygiene Department Card */}
        {showHygieneCard && (
          <div className="card hover:border-teal-400 transition-all flex flex-col justify-between group bg-white">
            <div className="card-body space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="badge badge-safe">Hygiene & Public Health</span>
                  <span className="text-3xs font-bold text-teal-700 font-mono">/hygiene</span>
                </div>
                <h3 className="text-base font-bold text-sky-950">Hygiene & Sanitation Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Evaluate ASHA field readings, assign official water safety status (Safe/Warning/Contaminated), write public advisories, and access ORS guides.
                </p>
              </div>

              <div className="bg-teal-50/70 border border-teal-100 rounded-lg p-2.5 text-2xs text-teal-900 space-y-1">
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3 text-teal-600 flex-shrink-0" />
                  <span>{pendingClassification.length} Report(s) Awaiting Classification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-teal-600 flex-shrink-0" />
                  <span>Classify Safe, Warning, or Contaminated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-teal-600 flex-shrink-0" />
                  <span>Emergency ORS Preparation Instructions</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                to="/hygiene"
                className="w-full btn-primary bg-teal-600 hover:bg-teal-700 border-teal-600 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Enter Hygiene Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 4. Government / Admin Card */}
        {showAdminCard && (
          <div className="card hover:border-sky-400 transition-all flex flex-col justify-between group bg-white">
            <div className="card-body space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="badge badge-blue">Official Authority</span>
                  <span className="text-3xs font-bold text-blue-700 font-mono">/admin</span>
                </div>
                <h3 className="text-base font-bold text-sky-950">Government & Admin Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Restricted to Government Health & Jal Shakti Officers to verify classified reports, publish them to the villagers website, and supervise all pages.
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 text-2xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-blue-950">Verify & Approve Reports ({pendingApproval.length} pending)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  <span>Full System Super-User Privileges</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  <span>District-wide Early Warning Surveillance</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                to="/admin"
                className="w-full btn-primary bg-sky-700 hover:bg-sky-800 border-sky-700 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <span>Enter Government Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

