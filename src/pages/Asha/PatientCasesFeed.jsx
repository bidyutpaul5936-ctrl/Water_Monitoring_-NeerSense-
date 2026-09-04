import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

export default function PatientCasesFeed() {
  const { symptoms } = useAlertNotification();
  const [triagedCases, setTriagedCases] = useState({});

  const handleTriageAction = (caseId, actionType) => {
    setTriagedCases(prev => ({
      ...prev,
      [caseId]: actionType
    }));
  };

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div>
          <h2 className="text-sm font-bold text-sky-950">Patient Symptoms Feed (Submitted by Villagers)</h2>
          <p className="text-2xs text-sky-700">Door-to-door follow-up queue for gastrointestinal and fever symptoms</p>
        </div>
        <span className="badge badge-blue">{symptoms.length} Reported Cases</span>
      </div>

      <div className="card-body">
        {symptoms.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <Info className="w-8 h-8 text-sky-600 mx-auto" />
            <div className="text-sm font-bold text-sky-950">No Patient Health Cases Reported Yet</div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              When villagers submit symptoms via the Villagers Portal or through feature phone reporting (*999#), they will appear here instantly for your field triage.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient & Household</th>
                  <th>Village</th>
                  <th>Reported Symptoms</th>
                  <th>Severity</th>
                  <th>Water Source Used</th>
                  <th>Date / Time</th>
                  <th>ASHA Field Action</th>
                </tr>
              </thead>
              <tbody>
                {symptoms.map(s => {
                  const triageState = triagedCases[s.id];
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
                        {s.severity === 'SEVERE' && <span className="badge badge-high">Severe</span>}
                        {s.severity === 'MODERATE' && <span className="badge badge-blue">Moderate</span>}
                      </td>
                      <td className="text-xs text-slate-600">{s.waterSourceUsed}</td>
                      <td className="text-2xs text-slate-400">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        {triageState ? (
                          <span className="badge badge-safe text-2xs">
                            <Check className="w-3 h-3" /> {triageState}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTriageAction(s.id, 'ORS & Zinc Given')}
                              className="btn text-2xs px-2 py-1 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            >
                              Give ORS/Zinc
                            </button>
                            <button
                              onClick={() => handleTriageAction(s.id, 'Home Visit Done')}
                              className="btn text-2xs px-2 py-1 bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100"
                            >
                              Mark Visited
                            </button>
                            <button
                              onClick={() => handleTriageAction(s.id, 'Referred to PHC')}
                              className="btn text-2xs px-2 py-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                            >
                              Refer PHC
                            </button>
                          </div>
                        )}
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
