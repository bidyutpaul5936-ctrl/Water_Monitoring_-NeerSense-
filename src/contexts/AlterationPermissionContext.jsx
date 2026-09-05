import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, AlertTriangle, CheckCircle2, X, FileText, KeyRound } from 'lucide-react';
import { useAuthRole } from './AuthRoleContext';

const AlterationPermissionContext = createContext();

const STORAGE_KEY = 'neersense_alteration_permission';

export const REASON_OPTIONS = [
  'Central Laboratory Re-Test & Calibration Adjustment',
  'Correction of Typographical Field Kit Entry',
  'Sensor / Vial Cross-Validation Discrepancy',
  'Emergency Public Health Directive Override',
  'Field Staff Resampling & Verification Update',
  'Other Administrative Justification'
];

export function AlterationPermissionProvider({ children }) {
  const { isGovernment, currentUser } = useAuthRole();
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionDetails, setPermissionDetails] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState('ALL');
  const [onGrantedCallback, setOnGrantedCallback] = useState(null);

  // Restore active session from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.token) {
          setHasPermission(true);
          setPermissionDetails(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not restore alteration permission', e);
    }
  }, []);

  const requestPermission = ({ pin, reason, customReason, officerName, department = 'ALL' }) => {
    const validPins = ['1234', 'ADMIN-2026', 'ADMIN'];
    if (!validPins.includes(String(pin).trim())) {
      return { success: false, message: 'Invalid Administrative Clearance PIN. Demo PIN is 1234.' };
    }

    const finalReason = reason === 'Other Administrative Justification' && customReason?.trim()
      ? customReason.trim()
      : reason || 'Administrative data correction';

    const token = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const details = {
      token,
      officerName: officerName || currentUser?.name || 'Dr. Suresh Mishra, CDMO & District Admin',
      reason: finalReason,
      department,
      grantedAt: new Date().toISOString()
    };

    setHasPermission(true);
    setPermissionDetails(details);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (e) {
      // ignore storage fail
    }

    return { success: true, token, details };
  };

  const revokePermission = () => {
    setHasPermission(false);
    setPermissionDetails(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const openAlterationModal = ({ department = 'ALL', onGranted = null } = {}) => {
    setModalDept(department);
    setOnGrantedCallback(() => onGranted);
    setIsModalOpen(true);
  };

  const closeAlterationModal = () => {
    setIsModalOpen(false);
    setOnGrantedCallback(null);
  };

  const executeWithPermission = (dept, actionFn) => {
    if (hasPermission && permissionDetails) {
      actionFn(permissionDetails);
    } else {
      openAlterationModal({
        department: dept,
        onGranted: (details) => {
          actionFn(details);
        }
      });
    }
  };

  return (
    <AlterationPermissionContext.Provider
      value={{
        hasPermission,
        permissionDetails,
        requestPermission,
        revokePermission,
        openAlterationModal,
        closeAlterationModal,
        executeWithPermission,
        isGovernment
      }}
    >
      {children}
      {isModalOpen && (
        <AlterationPermissionModal
          department={modalDept}
          onClose={closeAlterationModal}
          onSuccess={(details) => {
            closeAlterationModal();
            if (onGrantedCallback) {
              onGrantedCallback(details);
            }
          }}
        />
      )}
    </AlterationPermissionContext.Provider>
  );
}

export function useAlterationPermission() {
  const ctx = useContext(AlterationPermissionContext);
  if (!ctx) {
    throw new Error('useAlterationPermission must be used within AlterationPermissionProvider');
  }
  return ctx;
}

/**
 * Modal to request authorization to alter data
 */
function AlterationPermissionModal({ department = 'ALL', onClose, onSuccess }) {
  const { requestPermission, currentUser } = useAlterationPermission();
  const [pin, setPin] = useState('');
  const [officerName, setOfficerName] = useState(currentUser?.name || 'Dr. Suresh Mishra, CDMO & District Admin');
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [auditAcknowledged, setAuditAcknowledged] = useState(true);
  const [error, setError] = useState('');

  const deptLabel = department === 'ASHA' 
    ? 'ASHA Field Water Reports' 
    : department === 'HYGIENE' 
    ? 'Hygiene & Sanitation Classifications' 
    : 'Departmental Surveillance Records';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!auditAcknowledged) {
      setError('You must acknowledge the statutory audit logging declaration.');
      return;
    }

    const res = requestPermission({
      pin,
      reason,
      customReason,
      officerName,
      department
    });

    if (res.success) {
      onSuccess(res.details);
    } else {
      setError(res.message || 'Authorization failed. Please check PIN.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-sky-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-850 to-sky-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-800 text-amber-300 font-bold text-3xs uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3 h-3" /> Data Integrity Protocol
              </div>
              <h3 className="text-base font-extrabold text-white">
                Request Permission to Alter Data
              </h3>
              <p className="text-2xs text-sky-200 mt-0.5">
                Target: <strong>{deptLabel}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-sky-300 hover:text-white p-1 rounded-lg hover:bg-sky-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-2xs space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-950">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Administrative Authorization Mandatory</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              In accordance with National Drinking Water Surveillance Protocol, primary ASHA field measurements and Hygiene safety classifications are statutory public records. Alterations by District Administration must be justified, verified, and tagged with an immutable permission token.
            </p>
          </div>

          {/* Officer Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Authorizing Official Name & Designation
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              placeholder="e.g. Dr. Suresh Mishra, CDMO"
              required
            />
          </div>

          {/* Justification Dropdown */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Justification / Reason for Alteration <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white font-medium focus:border-sky-500 outline-none"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {reason === 'Other Administrative Justification' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Specify Custom Reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain the technical or administrative reason for this alteration..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:border-sky-500 outline-none"
                required
              />
            </div>
          )}

          {/* Administrative PIN */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Administrative Clearance PIN <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPin('1234')}
                className="text-3xs font-semibold text-sky-600 hover:text-sky-800 underline"
              >
                ⚡ Autofill Demo PIN (1234)
              </button>
            </div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter Admin PIN (Demo: 1234)"
              className="w-full px-3 py-2.5 border-2 border-sky-300 rounded-lg font-mono tracking-widest text-center text-sm font-bold text-sky-950 focus:border-sky-600 outline-none"
              autoFocus
              required
            />
          </div>

          {/* Declaration Checkbox */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={auditAcknowledged}
                onChange={(e) => setAuditAcknowledged(e.target.checked)}
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-2xs text-slate-600 leading-tight">
                I hereby declare that I possess regulatory authority to modify these public records, and I confirm that all modifications will be permanently logged with my identifier.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1.5 transition"
            >
              <Unlock className="w-4 h-4" />
              <span>Authorize &amp; Unlock Alteration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Top Banner displayed on ASHA & Hygiene pages for Admin
 */
export function AlterationModeBanner({ department = 'ASHA' }) {
  const { isGovernment, hasPermission, permissionDetails, revokePermission, openAlterationModal } = useAlterationPermission();

  if (!isGovernment) return null;

  const deptLabel = department === 'ASHA' ? 'ASHA Field Reports' : 'Hygiene Classifications';

  if (!hasPermission) {
    return (
      <div className="card bg-amber-50/80 border-2 border-amber-300 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-950 uppercase tracking-wide">
                Admin Super-User Guard
              </span>
              <span className="text-xs font-bold text-amber-950">
                Data Alteration Locked
              </span>
            </div>
            <p className="text-2xs text-amber-900 mt-0.5">
              You have administrator view access. To alter or edit {deptLabel} data, you must formally request alteration permission.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openAlterationModal({ department })}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer whitespace-nowrap"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Request Permission to Alter</span>
        </button>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
          <Unlock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-800" />
              Alteration Mode Active
            </span>
            <span className="text-2xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900">
              Token #{permissionDetails?.token}
            </span>
            <span className="text-2xs text-emerald-850 font-medium">
              Authorized Officer: <strong>{permissionDetails?.officerName}</strong>
            </span>
          </div>
          <p className="text-2xs text-emerald-800 mt-0.5">
            <strong>Reason:</strong> {permissionDetails?.reason} &bull; You can now edit/alter records below.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className="text-3xs text-emerald-700 font-semibold hidden md:inline">
          Active Session
        </span>
        <button
          type="button"
          onClick={revokePermission}
          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 border border-slate-300 hover:border-red-300 text-2xs font-bold rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap"
          title="Revoke alteration permission and lock editing"
        >
          <Lock className="w-3 h-3" />
          <span>Lock / End Session</span>
        </button>
      </div>
    </div>
  );
}
