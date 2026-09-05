import React, { useState } from 'react';
import { Info, CheckCircle2, Clock, SendHorizonal } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { api } from '../../services/api';

export default function PatientCasesFeed() {
  const { symptoms = [], setSymptoms } = useAlertNotification();
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];

  // Only show reports forwarded by Health Dept to ASHA
  const forwardedCases = safeSymptoms.filter(s => s.status === 'FORWARDED_TO_ASHA');

  const [loadingId, setLoadingId] = useState(null);

  const handleMarkDone = async (caseId, action) => {
    setLoadingId(caseId);
    try {
      await api.updateSymptomStatus(caseId, 'RESOLVED');
      setSymptoms(prev =>
        prev.map(s => s.id === caseId ? { ...s, status: 'RESOLVED', resolvedAction: action } : s)
      );
    } catch (err) {
      console.error('Failed to mark as resolved:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div>
          <h2 className="text-sm font-bold text-sky-950">Patient Symptoms Feed — Forwarded by Health Dept</h2>
          <p className="text-2xs text-sky-700">Cases forwarded from the Health Department for ASHA home visit and treatment</p>
        </div>
        <span className="badge badge-warning flex items-center gap-1">
          <SendHorizonal className="w-3 h-3" />
          {forwardedCases.length} Forwarded Case(s)
        </span>
      </div>

      <div className="card-body">
        {forwardedCases.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <Info className="w-8 h-8 text-sky-600 mx-auto" />
            <div className="text-sm font-bold text-sky-950">No Cases Assigned Yet</div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              When the Health Department reviews villager symptom reports and decides an ASHA home visit is required, the cases will appear here for your action.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient &amp; Household</th>
                  <th>Village</th>
                  <th>Reported Symptoms</th>
                  <th>Severity</th>
                  <th>Water Source Used</th>
                  <th>Date / Time</th>
                  <th>ASHA Field Action</th>
                </tr>
              </thead>
              <tbody>
                {forwardedCases.map(s => {
                  const isLoading = loadingId === s.id;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="font-bold text-sky-950 text-xs">{s.patientName}</div>
                        <div className="text-2xs text-slate-500">{s.age} y/o &bull; {s.gender}</div>
                      </td>
                      <td className="text-xs text-slate-700">{s.villageName || s.villageId}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(s.symptoms) ? s.symptoms : [s.symptoms]).map((sym, i) => (
                            <span key={i} className="badge badge-blue text-2xs">{sym}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {s.severity === 'CRITICAL' && <span className="badge badge-critical">Critical</span>}
                        {s.severity === 'SEVERE'   && <span className="badge badge-high">Severe</span>}
                        {s.severity === 'MODERATE' && <span className="badge badge-blue">Moderate</span>}
                      </td>
                      <td className="text-xs text-slate-600">{s.waterSourceUsed}</td>
                      <td className="text-2xs text-slate-400">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleMarkDone(s.id, 'ORS & Zinc Given')}
                            disabled={isLoading}
                            className="btn text-2xs px-2 py-1 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            ✅ Give ORS/Zinc &amp; Done
                          </button>
                          <button
                            onClick={() => handleMarkDone(s.id, 'Home Visit Done')}
                            disabled={isLoading}
                            className="btn text-2xs px-2 py-1 bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100 disabled:opacity-50"
                          >
                            🏠 Home Visit Done
                          </button>
                          <button
                            onClick={() => handleMarkDone(s.id, 'Referred to PHC')}
                            disabled={isLoading}
                            className="btn text-2xs px-2 py-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100 disabled:opacity-50"
                          >
                            🏥 Refer to PHC
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
