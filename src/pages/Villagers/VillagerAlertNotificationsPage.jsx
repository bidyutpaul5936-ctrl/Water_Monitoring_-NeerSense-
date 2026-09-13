import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  MapPin,
  Clock,
  Info,
  Zap,
  ChevronDown,
  ChevronUp,
  Phone,
  HeartHandshake,
  Flame,
  Skull,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuthRole, ROLES } from '../../contexts/AuthRoleContext';
import { useAlertNotification } from '../../contexts/AlertNotificationContext';
const ALERT_STYLES = {
  danger: {
    border: 'border-red-300',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-800 border border-red-300',
    icon: <Skull className="w-5 h-5 text-red-600" />,
    dot: 'bg-red-500',
    label: 'CRITICAL ALERT',
    labelColor: 'text-red-700',
  },
  warning: {
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    dot: 'bg-amber-500',
    label: 'WARNING',
    labelColor: 'text-amber-700',
  },
  info: {
    border: 'border-sky-300',
    bg: 'bg-sky-50',
    badge: 'bg-sky-100 text-sky-800 border border-sky-300',
    icon: <Info className="w-5 h-5 text-sky-600" />,
    dot: 'bg-sky-500',
    label: 'NOTICE',
    labelColor: 'text-sky-700',
  },
  safe: {
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    dot: 'bg-emerald-500',
    label: 'SAFE',
    labelColor: 'text-emerald-700',
  },
};

function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;

  return (
    <div
      className={`rounded-2xl border-2 ${style.border} ${style.bg} overflow-hidden transition-all duration-200`}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-3 focus:outline-none"
      >
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">{style.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className={`text-3xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}
            >
              {style.label}
            </span>
            {alert.resolved && (
              <span className="text-3xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                ✓ Resolved
              </span>
            )}
          </div>
          <div className="text-sm font-black text-slate-900 leading-snug">{alert.title}</div>
          <div className="text-2xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {alert.village}
            <span>•</span>
            <Clock className="w-3 h-3" />
            {alert.time}
          </div>
        </div>

        {/* Toggle */}
        <div className="flex-shrink-0 text-slate-400 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-200/60 pt-3">
          <p className="text-xs text-slate-700 leading-relaxed">{alert.body}</p>

          {/* Parameter reading */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/80 border border-slate-200 p-2.5">
              <div className="text-2xs text-slate-500 mb-0.5">Parameter</div>
              <div className="text-xs font-bold text-slate-800">{alert.parameter}</div>
            </div>
            <div className="rounded-xl bg-white/80 border border-slate-200 p-2.5">
              <div className="text-2xs text-slate-500 mb-0.5">Detected</div>
              <div className="text-xs font-bold text-red-700">{alert.reading}</div>
            </div>
            <div className="rounded-xl bg-white/80 border border-slate-200 p-2.5">
              <div className="text-2xs text-slate-500 mb-0.5">Safe Limit</div>
              <div className="text-xs font-bold text-emerald-700">{alert.safe}</div>
            </div>
          </div>

          {/* Recommended action */}
          <div className="rounded-xl bg-white/90 border border-slate-200 p-3 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-3xs font-extrabold text-amber-700 uppercase tracking-wide mb-0.5">
                Recommended Action
              </div>
              <div className="text-xs text-slate-700">{alert.action}</div>
            </div>
          </div>

          {/* Issued by */}
          <div className="text-2xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Issued by: <strong className="ml-1 text-slate-700">{alert.issuedBy}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VillagerAlertNotificationsPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, activeRole, logout } = useAuthRole();
  const { alerts = [], fetchFullState } = useAlertNotification() || {};
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated || activeRole !== ROLES.VILLAGER) {
      navigate('/villagers/login', { replace: true });
    }
  }, [isAuthenticated, activeRole, navigate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (fetchFullState) fetchFullState();
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleLogout = () => {
    logout();
    navigate('/villagers');
  };

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const filteredAlerts =
    filter === 'all'
      ? safeAlerts
      : filter === 'active'
      ? safeAlerts.filter((a) => !a.resolved)
      : safeAlerts.filter((a) => a.resolved);

  const activeCount = safeAlerts.filter((a) => !a.resolved).length;
  const resolvedCount = safeAlerts.filter((a) => a.resolved).length;

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6 space-y-5">
      {/* Top nav */}
      <div className="flex items-center gap-2">
        <Link
          to="/villagers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs hover:shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Villagers Home
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full border border-sky-200 transition ${
              isRefreshing ? 'opacity-60' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-emerald-100" />
          </div>
          <div className="flex-1">
            <div className="text-3xs font-extrabold uppercase tracking-wider text-emerald-200 mb-0.5">
              Water Alert Notifications
            </div>
            <h1 className="text-lg sm:text-xl font-black leading-tight">
              My Village Alerts
            </h1>
            <p className="text-2xs text-emerald-100/80 mt-0.5">
              {currentUser?.name || 'Citizen'} · {currentUser?.villageName || 'Your Village'}
            </p>
          </div>
          {activeCount > 0 && (
            <div className="flex-shrink-0 bg-red-500 text-white text-xs font-extrabold rounded-full w-7 h-7 flex items-center justify-center shadow-md animate-pulse">
              {activeCount}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/15 rounded-xl p-2.5">
            <div className="text-lg font-black">{safeAlerts.length}</div>
            <div className="text-3xs text-emerald-200">Total Alerts</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5">
            <div className="text-lg font-black text-red-300">{activeCount}</div>
            <div className="text-3xs text-emerald-200">Active</div>
          </div>
          <div className="bg-white/15 rounded-xl p-2.5">
            <div className="text-lg font-black text-emerald-300">
              {resolvedCount}
            </div>
            <div className="text-3xs text-emerald-200">Resolved</div>
          </div>
        </div>
      </div>

      {/* Active danger banner */}
      {activeCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-300 animate-pulse-once">
          <Flame className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-red-800">
              {activeCount} ACTIVE WATER SAFETY ALERT{activeCount > 1 ? 'S' : ''} IN YOUR AREA
            </div>
            <div className="text-2xs text-red-700 mt-0.5">
              Read the critical alerts below and follow the recommended actions immediately.
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm">
        {[
          { key: 'all', label: 'All Alerts', count: safeAlerts.length },
          { key: 'active', label: 'Active', count: activeCount },
          { key: 'resolved', label: 'Resolved', count: resolvedCount },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === f.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
            <span
              className={`text-3xs px-1.5 py-0.5 rounded-full font-extrabold ${
                filter === f.key ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <BellOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <div className="text-sm font-semibold">No alerts in this category</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        )}
      </div>

      {/* Emergency contact footer */}
      <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 flex items-start gap-3">
        <Phone className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-red-900">
          <div className="font-black mb-0.5">Emergency Helplines</div>
          <div className="space-y-0.5 text-2xs text-red-800">
            <div>🏥 National Health Helpline: <strong>104</strong></div>
            <div>🚑 Emergency Ambulance: <strong>108</strong></div>
            <div>💧 Jal Shakti Helpline: <strong>1800-180-1551</strong></div>
          </div>
        </div>
        <div className="ml-auto">
          <HeartHandshake className="w-6 h-6 text-red-400 opacity-60" />
        </div>
      </div>

      {/* Subscription status */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <div className="text-xs font-bold text-emerald-900">Subscribed to Instant Alerts</div>
          <div className="text-2xs text-emerald-700 mt-0.5">
            You will receive SMS notifications whenever water contamination is detected in{' '}
            <strong>{currentUser?.villageName || 'your village'}</strong>.
          </div>
        </div>
        <Link
          to="/villagers/signup"
          className="ml-auto text-2xs font-bold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap"
        >
          Update
        </Link>
      </div>
    </div>
  );
}
