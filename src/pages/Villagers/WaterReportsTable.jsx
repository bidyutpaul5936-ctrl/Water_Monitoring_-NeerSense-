import React, { useState } from 'react';
import { Droplet, Info, CheckCircle2, AlertTriangle, AlertOctagon, ShieldCheck, Search, MapPin, Sparkles } from 'lucide-react';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
import { WEST_BENGAL_VILLAGES } from '../../utils/westBengalVillages';

export default function WaterReportsTable() {
  const { waterReports } = useAlertNotification();
  const [villageSearch, setVillageSearch] = useState('');

  // STRICT REQUIREMENT: Only show reports that have been approved by the Government!
  const approvedReports = waterReports.filter(r => r.status === 'APPROVED' || r.isApproved === true);

  // Filter by village name search (case-insensitive partial match)
  const filteredReports = villageSearch.trim()
    ? approvedReports.filter(r =>
        (r.villageName || '').toLowerCase().includes(villageSearch.trim().toLowerCase()) ||
        (r.sourceName || '').toLowerCase().includes(villageSearch.trim().toLowerCase())
      )
    : approvedReports;

  return (
    <div className="card border-sky-300 shadow-sm">
      <div className="card-header bg-sky-100/70 border-b border-sky-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sky-950">Official Drinking Water Quality Reports for Villagers</h2>
            <p className="text-2xs text-sky-700">Only verified reports approved and signed off by the Government Health Authority appear here</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-safe flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{approvedReports.length} Government Approved</span>
          </span>
        </div>
      </div>

      <div className="card-body p-4 space-y-4">
        {/* Search input for village */}
        <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              placeholder="Search by Village Name or Water Source (e.g. Gosaba, Rangabelia, Handpump)..."
              list="reports-village-datalist"
              className="form-input pl-9 text-xs w-full bg-white"
            />
            <datalist id="reports-village-datalist">
              {WEST_BENGAL_VILLAGES.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.district} ({v.nameBn})
                </option>
              ))}
            </datalist>
          </div>
          {villageSearch && (
            <button
              onClick={() => setVillageSearch('')}
              className="btn btn-secondary text-xs px-3 py-1.5"
            >
              Clear Filter
            </button>
          )}
          <span className="text-2xs text-sky-800 font-semibold whitespace-nowrap">
            Showing {filteredReports.length} of {approvedReports.length} reports
          </span>
        </div>

        {/* Autofill West Bengal Villages Section */}
        <div className="bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 p-3 rounded-xl border border-sky-200 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <div>
                <span className="text-xs font-bold text-sky-950">Autofill West Bengal Villages (পশ্চিমবঙ্গের গ্রাম):</span>
                <span className="text-3xs text-sky-700 ml-1.5 hidden sm:inline">Click any village to instantly fill the search</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) setVillageSearch(e.target.value);
                }}
                value=""
                className="form-select text-2xs py-1 px-2.5 bg-white border-sky-300 text-sky-900 font-semibold max-w-xs"
              >
                <option value="">-- Choose WB Village from list --</option>
                {WEST_BENGAL_VILLAGES.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} &bull; {v.district} ({v.nameBn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Click Badges for West Bengal */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVillageSearch('West Bengal')}
              className={`text-3xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                villageSearch === 'West Bengal'
                  ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                  : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-100 hover:border-sky-300'
              }`}
            >
              🏛️ All West Bengal
            </button>
            {WEST_BENGAL_VILLAGES.slice(0, 7).map((v) => {
              const shortName = v.name.split('(')[0].trim();
              const isSelected = villageSearch.toLowerCase().includes(shortName.toLowerCase());
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVillageSearch(v.name)}
                  className={`text-3xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                      : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-100 hover:border-sky-300'
                  }`}
                  title={`${v.name} - ${v.district} (${v.nameBn})`}
                >
                  📍 {shortName} ({v.district})
                </button>
              );
            })}
          </div>
        </div>

        {approvedReports.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-sky-100 border border-sky-300 mx-auto flex items-center justify-center text-sky-700">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-sky-950">No Official Water Reports Approved Yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Field test data entered by ASHA workers is currently under laboratory verification by the District Health Authority (CDMO). Only reports officially verified and approved by the Government are published to this website.
            </p>
            <div className="inline-flex items-center gap-2 text-2xs font-bold text-sky-900 bg-white border border-sky-300 px-3.5 py-1.5 rounded-lg shadow-sm">
              <span>Universal Precaution: Boil all drinking water for at least 10 minutes before consumption.</span>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-300 mx-auto flex items-center justify-center text-sky-700">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-sky-950">No Reports Found for "{villageSearch}"</h3>
            <p className="text-xs text-slate-600">
              No approved drinking water reports match your search. Please check the spelling or search for another village.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Village & Source</th>
                  <th>Source Type</th>
                  <th>Water Safety</th>
                  <th>pH</th>
                  <th>Turbidity</th>
                  <th>TDS</th>
                  <th>Bacterial Count</th>
                  <th>Official Government Advisory</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-sky-50/40 transition">
                    <td>
                      <div className="font-bold text-sky-950 text-xs">{report.sourceName}</div>
                      <div className="text-2xs text-slate-500">{report.villageName}</div>
                      <div className="text-3xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Approved by: {report.verifiedBy || 'Dr. Suresh Mishra, CDMO'}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">{report.sourceType}</td>
                    <td>
                      {report.safetyStatus === 'SAFE' && (
                        <span className="badge badge-safe">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Safe
                        </span>
                      )}
                      {report.safetyStatus === 'WARNING' && (
                        <span className="badge badge-warning">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
                        </span>
                      )}
                      {report.safetyStatus === 'CONTAMINATED' && (
                        <span className="badge badge-danger">
                          <AlertOctagon className="w-3 h-3 text-red-600" /> Contaminated
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-sky-950 font-bold">{report.ph}</td>
                    <td className="font-mono text-xs text-sky-950 font-bold">{report.turbidity} NTU</td>
                    <td className="font-mono text-xs text-sky-950 font-bold">{report.tds} mg/L</td>
                    <td className="font-mono text-xs text-sky-950 font-bold">
                      {report.bacterialCfu > 0 ? (
                        <span className="text-red-700 font-bold">{report.bacterialCfu} CFU</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0 (None)</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs text-slate-700 font-medium max-w-xs leading-snug">
                        {report.advisory}
                      </div>
                    </td>
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
