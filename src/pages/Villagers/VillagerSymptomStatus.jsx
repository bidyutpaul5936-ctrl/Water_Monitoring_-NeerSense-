import React from 'react';
import { CheckCircle2, Clock, SendHorizonal, HeartPulse, AlertTriangle } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

const STATUS_STEPS = [
  { key: 'REPORTED',          label: 'Report Submitted',     icon: HeartPulse,     color: 'text-sky-600',    bg: 'bg-sky-50',    border: 'border-sky-200' },
  { key: 'FORWARDED_TO_ASHA', label: 'Reviewed by Health Dept — ASHA Visit Ordered', icon: SendHorizonal, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'RESOLVED',          label: 'Treatment Done',       icon: CheckCircle2,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const STATUS_ORDER = { REPORTED: 0, FORWARDED_TO_ASHA: 1, RESOLVED: 2 };

export default function VillagerSymptomStatus({ villageId }) {
  const { symptoms = [] } = useAlertNotification() || {};
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];

  // Show last 10 from same village or all if no villageId filter
  const relevantSymptoms = (villageId
    ? safeSymptoms.filter(s => s.villageId === villageId || s.villageName === villageId)
    : safeSymptoms
  ).slice(0, 10);

  if (relevantSymptoms.length === 0) return null;

  return (
    <div className="card border-sky-200 shadow-sm">
      <div className="card-header bg-gradient-to-r from-sky-50 to-white border-b border-sky-200">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">Your Health Report Status</h2>
            <p className="text-2xs text-sky-700">Track the progress of recently submitted health condition reports from your village</p>
          </div>
        </div>
        <span className="badge badge-blue">{relevantSymptoms.length} Report(s)</span>
      </div>

      <div className="card-body space-y-4">
        {relevantSymptoms.map(s => {
          const status = s.status || 'REPORTED';
          const currentStepIndex = STATUS_ORDER[status] ?? 0;

          return (
            <div key={s.id} className="p-4 rounded-xl border border-sky-100 bg-white shadow-xs space-y-3">
              {/* Report Header */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="text-xs font-bold text-sky-950">{s.patientName}</div>
                  <div className="text-2xs text-slate-500">{s.villageName} &bull; {new Date(s.timestamp).toLocaleDateString()}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(Array.isArray(s.symptoms) ? s.symptoms : [s.symptoms]).map((sym, i) => (
                      <span key={i} className="badge badge-blue text-2xs">{sym}</span>
                    ))}
                  </div>
                </div>
                {status === 'RESOLVED' ? (
                  <span className="badge badge-safe flex items-center gap-1 text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Treatment Done ✓
                  </span>
                ) : status === 'FORWARDED_TO_ASHA' ? (
                  <span className="badge badge-warning flex items-center gap-1 text-xs">
                    <SendHorizonal className="w-3 h-3" />
                    ASHA Visit Ordered
                  </span>
                ) : (
                  <span className="badge badge-blue flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    Under Review
                  </span>
                )}
              </div>

              {/* Step Progress Tracker */}
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={step.key}>
                      <div className={`flex flex-col items-center gap-1 flex-shrink-0 ${isCompleted ? step.color : 'text-slate-300'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? `${step.bg} ${step.border} ${step.color} shadow-sm`
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        } ${isCurrent ? 'ring-2 ring-offset-1 ring-sky-400' : ''}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-3xs font-semibold text-center leading-tight max-w-[70px] ${isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${currentStepIndex > idx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Resolution note */}
              {status === 'RESOLVED' && s.resolvedAction && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2 text-2xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ASHA Action: {s.resolvedAction}
                </div>
              )}
              {status === 'FORWARDED_TO_ASHA' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 text-2xs text-amber-800 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  Your ASHA worker has been dispatched and will visit you shortly.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
