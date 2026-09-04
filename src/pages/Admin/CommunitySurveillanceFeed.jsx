import React from 'react';
import { Users, Info } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';

export default function CommunitySurveillanceFeed() {
  const { symptoms } = useAlertNotification();

  return (
    <div className="card">
      <div className="card-header bg-sky-100/70 border-b border-sky-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-700" />
          <div>
            <h2 className="text-sm font-bold text-sky-950">Community Health Condition Surveillance Feed</h2>
            <p className="text-2xs text-sky-700">Real-time health reports entered by villagers across all rural health sub-centers</p>
          </div>
        </div>
        <span className="badge badge-blue">{symptoms.length} Total Report(s)</span>
      </div>

      <div className="card-body">
        {symptoms.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <Info className="w-8 h-8 text-sky-600 mx-auto" />
            <div className="text-sm font-bold text-sky-950">No Villager Health Reports Submitted Yet</div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              When villagers submit symptoms or health conditions from the Villagers Portal or via feature phone (*999#), they will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Village</th>
                  <th>Age / Gender</th>
                  <th>Symptoms Reported</th>
                  <th>Severity</th>
                  <th>Drinking Water Source</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {symptoms.map(s => (
                  <tr key={s.id}>
                    <td className="font-bold text-sky-950 text-xs">{s.patientName}</td>
                    <td className="text-xs text-slate-700">{s.villageName || s.villageId}</td>
                    <td className="text-xs text-slate-600">{s.age} y/o &bull; {s.gender}</td>
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
                    <td className="text-2xs text-slate-400">{new Date(s.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
