import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ChevronRight } from 'lucide-react';
import { useAuthRole, ROLES } from '../contexts/AuthRoleContext';

const ROLES_CONFIG = [
  {
    role: ROLES.VILLAGER,
    label: 'Community Member / Villager',
    avatar: '👨‍🌾',
    description: 'Report symptoms, check local water safety, access hygiene guides.',
    badge: 'Voice & Icon First',
    badgeClass: 'badge-safe',
  },
  {
    role: ROLES.ASHA,
    label: 'ASHA / ANM Health Worker',
    avatar: '👩‍⚕️',
    description: 'Field case triage, manual H2S water testing, household mapping, microlearning.',
    badge: 'Field Surveillance',
    badgeClass: 'badge-moderate',
  },
  {
    role: ROLES.HYGIENE,
    label: 'Hygiene & Sanitation Dept',
    avatar: '👩‍🔬',
    description: 'Scientific water safety classification, advisory formulations & sanitary guidelines.',
    badge: 'Water Safety Desk',
    badgeClass: 'badge-safe',
  },
  {
    role: ROLES.OFFICIAL,
    label: 'District Health Official',
    avatar: '🏛️',
    description: 'GIS command centre, AI outbreak risk scores, response team dispatch, reports.',
    badge: 'GIS Command',
    badgeClass: 'badge-neutral',
  },
  {
    role: ROLES.PANCHAYAT,
    label: 'Panchayat / Local Governance',
    avatar: '🏢',
    description: 'Village safety status, broadcast emergency alerts, resource requisition.',
    badge: 'Governance',
    badgeClass: 'badge-high',
  },
  {
    role: ROLES.ADMIN,
    label: 'System Admin & IoT Console',
    avatar: '⚙️',
    description: 'Sensor registry, live telemetry, ML threshold tuning, audit trail.',
    badge: 'IoT & ML',
    badgeClass: 'badge-neutral',
  },
];

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { activeRole, setRole } = useAuthRole();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectRole = (newRole) => {
    setRole(newRole);
    onClose();
    if (newRole === ROLES.VILLAGER) {
      navigate('/villagers');
    } else if (newRole === ROLES.ASHA) {
      navigate('/asha');
    } else if (newRole === ROLES.HYGIENE) {
      navigate('/hygiene');
    } else if (newRole === ROLES.OFFICIAL || newRole === ROLES.ADMIN || newRole === ROLES.PANCHAYAT) {
      navigate('/admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Switch User Role</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a stakeholder perspective to explore.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-3 space-y-1.5">
          {ROLES_CONFIG.map(r => {
            const isActive = activeRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => handleSelectRole(r.role)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3.5 group ${
                  isActive
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{r.avatar}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-800' : 'text-slate-800'}`}>
                      {r.label}
                    </span>
                    <span className={`badge ${r.badgeClass}`}>{r.badge}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{r.description}</p>
                </div>

                {isActive
                  ? <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition" />
                }
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}
