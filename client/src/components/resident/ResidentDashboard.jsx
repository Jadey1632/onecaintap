import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Clock, CheckCircle2, AlertTriangle, Download,
  Eye, RefreshCw, Bell, X, WifiOff,
  ShieldCheck, Home, HeartHandshake, FileCheck, CreditCard, Briefcase, GraduationCap
} from 'lucide-react';
import { CaintaSeal } from '../CaintaBranding';
import { CertificateRequestWizard } from './CertificateRequestWizard';
import { CertificateViewer } from './CertificateViewer';
import { api } from '../../api.js';

const ICON_MAP = {
  ShieldCheck, Home, HeartHandshake, FileCheck, CreditCard, Briefcase, GraduationCap,
};

// ── Skeleton primitives ──────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-700/60 ${className}`}
    />
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-2.5" aria-label="Loading services…">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-7 w-14 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

function RequestSkeleton() {
  return (
    <div className="space-y-2.5" aria-label="Loading requests…">
      {[1, 2].map(i => (
        <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  switch (status) {
    case 'approved':
    case 'ready':
    case 'completed':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
          <CheckCircle2 size={12} aria-hidden="true" /> Approved &amp; Ready
        </span>
      );
    case 'reviewing':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
          <Clock size={12} aria-hidden="true" /> Under Review
        </span>
      );
    case 'rejected':
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 inline-flex items-center gap-1">
          <AlertTriangle size={12} aria-hidden="true" /> Action Needed
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 inline-flex items-center gap-1">
          <Clock size={12} aria-hidden="true" /> Pending Verification
        </span>
      );
  }
}

// ── Notification panel ───────────────────────────────────────────────────────
function NotificationPanel({ notifications, onClose, onMarkRead }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label="Notifications"
      className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
        <span className="text-xs font-bold text-white">Notifications</span>
        <button
          onClick={onClose}
          aria-label="Close notifications"
          className="text-slate-400 hover:text-white transition-colors p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2" role="list">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              role="listitem"
              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                n.is_read
                  ? 'bg-slate-800/50 border-slate-700/50'
                  : 'bg-slate-800 border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="font-bold text-cainta-gold leading-snug">{n.title}</p>
                {!n.is_read && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    className="text-[10px] text-slate-400 hover:text-white shrink-0 underline focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                    aria-label={`Mark "${n.title}" as read`}
                  >
                    Mark read
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{n.message}</p>
              <time
                className="text-[9px] text-slate-500 mt-1 block"
                dateTime={n.created_at}
              >
                {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </time>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Tracking modal ───────────────────────────────────────────────────────────
function TrackingModal({ req, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const steps = [
    { label: 'Submitted', sub: 'Logged in Cainta LGU database', done: true },
    {
      label: 'Barangay Verification',
      sub: 'Checking resident masterlist & ID',
      done: req.status !== 'pending',
      active: req.status === 'pending',
    },
    {
      label: 'Approved & E-Cert Ready',
      sub: 'Digitally signed by Barangay Captain',
      done: req.status === 'approved' || req.status === 'ready' || req.status === 'completed',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Tracking: ${req.certificate_name}`}
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-start border-b border-slate-700 pb-3">
          <div>
            <p className="text-[11px] font-mono text-cainta-gold">{req.id}</p>
            <h3 className="text-xs font-bold text-white mt-0.5">{req.certificate_name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tracking"
            className="text-slate-400 hover:text-white transition-colors p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <ol className="space-y-3 text-xs">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div
                aria-hidden="true"
                className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                  s.done
                    ? 'bg-emerald-500 text-slate-950'
                    : s.active
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {s.done ? '✓' : i + 1}
              </div>
              <div>
                <p className="font-bold text-white">{i + 1}. {s.label}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{s.sub}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────────────
export function ResidentDashboard({ user, onLogout, onSwitchToAdmin }) {
  const [catalog, setCatalog] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [showWizard, setShowWizard] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [trackingRequest, setTrackingRequest] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [catData, reqData, notifData] = await Promise.all([
        api.getCertificates(),
        api.getRequests({ user_id: user.id }),
        api.getNotifications(user.id),
      ]);

      if (catData.success) setCatalog(catData.catalog ?? []);
      if (reqData.success) setRequests(reqData.requests ?? []);
      if (notifData.success) setNotifications(notifData.notifications ?? []);

      if (!catData.success && !reqData.success) {
        setFetchError('Could not load your data. Please refresh.');
      }
    } catch {
      setFetchError('Connection error. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
    } catch {
      // silent — non-critical
    }
  };

  const handleRequestSuccess = () => {
    setShowWizard(false);
    fetchData();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-full flex flex-col bg-[#050D38] text-slate-100">

      {/* ── Header ── */}
      <header className="bg-cainta-blue/90 border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <CaintaSeal size={38} />
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[9px] font-bold tracking-widest text-white uppercase">ONE</span>
              <span className="text-sm font-black text-cainta-gold">CAINTAP</span>
            </div>
            <p className="text-[10px] text-slate-300">Brgy. {user.barangay ?? 'San Roque'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(v => !v)}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={showNotifications}
              aria-haspopup="dialog"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Bell size={16} aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onMarkRead={handleMarkRead}
              />
            )}
          </div>

          <button
            onClick={onLogout}
            className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-full p-4 space-y-5">

        {/* Fetch error banner */}
        {fetchError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs"
          >
            <WifiOff size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <span>{fetchError}</span>
              <button
                onClick={fetchData}
                className="ml-2 underline hover:no-underline font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-red-300 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-cainta-blue via-[#173299] to-[#0A1754] p-5 border border-white/15 shadow-xl">
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-cainta-gold mb-1 uppercase tracking-wider">
              Digital Barangay Services · 24/7
            </p>
            <h1 className="text-lg font-black text-white tracking-tight">
              Mabuhay, {user.name?.split(' ')[0] ?? 'Resident'}! 🏛️
            </h1>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Request official Barangay certificates from home — all services are free.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setShowWizard(true)}
                disabled={loading && catalog.length === 0}
                className="px-4 py-2 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
              >
                <Plus size={15} aria-hidden="true" />
                <span>New Certificate Request</span>
              </button>

              <button
                onClick={fetchData}
                aria-label="Refresh data"
                disabled={loading}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <RefreshCw
                  size={13}
                  aria-hidden="true"
                  className={loading ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Services */}
        <section aria-labelledby="services-heading">
          <div className="flex items-center justify-between mb-2.5">
            <h2 id="services-heading" className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="text-cainta-gold" size={15} aria-hidden="true" />
              Barangay Services
            </h2>
            <span className="text-[10px] text-slate-400">Brgy. {user.barangay}</span>
          </div>

          {loading ? (
            <CatalogSkeleton />
          ) : catalog.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <FileText size={32} className="mx-auto text-slate-600" aria-hidden="true" />
              <p className="text-xs font-semibold text-slate-300">No services available right now.</p>
              <button
                onClick={fetchData}
                className="text-xs text-cainta-gold hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-cainta-gold rounded"
              >
                Try refreshing
              </button>
            </div>
          ) : (
            <ul className="space-y-2.5" role="list">
              {catalog.map(cert => {
                const Icon = ICON_MAP[cert.icon] ?? FileCheck;
                return (
                  <li
                    key={cert.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cainta-gold/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg bg-cainta-blue text-cainta-gold flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">{cert.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{cert.processing_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {Number(cert.fee) === 0 ? 'FREE' : `₱${Number(cert.fee).toFixed(0)}`}
                      </span>
                      <button
                        onClick={() => setShowWizard(true)}
                        className="px-2.5 py-1 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-950 font-bold text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
                        aria-label={`Apply for ${cert.name}`}
                      >
                        Apply
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Requests */}
        <section aria-labelledby="requests-heading">
          <div className="flex items-center justify-between mb-2.5">
            <h2 id="requests-heading" className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="text-cainta-gold" size={15} aria-hidden="true" />
              My Requests &amp; E-Certificates
            </h2>
            {!loading && (
              <span className="text-[10px] text-slate-400">
                {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
              </span>
            )}
          </div>

          {loading ? (
            <RequestSkeleton />
          ) : requests.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <FileText size={32} className="mx-auto text-slate-600" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-slate-300">No requests yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tap "New Certificate Request" above to get started.
                </p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                disabled={catalog.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-bold text-xs disabled:opacity-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
              >
                <Plus size={13} aria-hidden="true" /> Make a Request
              </button>
            </div>
          ) : (
            <ul className="space-y-2.5" role="list">
              {requests.map(req => (
                <li
                  key={req.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-mono text-[11px] font-bold text-cainta-gold">{req.id}</span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{req.certificate_name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      <strong>Purpose:</strong> {req.purpose}
                    </p>
                  </div>

                  {req.admin_remarks && (
                    <div className="p-2 rounded bg-slate-800 border-l-2 border-amber-400 text-[10px] text-slate-200">
                      <span className="font-bold text-amber-300">Staff Note: </span>
                      {req.admin_remarks}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-end">
                    {(req.status === 'approved' || req.status === 'ready' || req.status === 'completed') ? (
                      <button
                        onClick={() => setViewingCertificate(req)}
                        className="px-3 py-1.5 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
                        aria-label={`Download e-certificate for ${req.certificate_name}`}
                      >
                        <Download size={13} aria-hidden="true" />
                        Download E-Cert PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => setTrackingRequest(req)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label={`Track status of ${req.certificate_name}`}
                      >
                        <Eye size={13} aria-hidden="true" />
                        Track Status
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* ── Modals ── */}
      {showWizard && (
        <CertificateRequestWizard
          user={user}
          catalog={catalog}
          onClose={() => setShowWizard(false)}
          onSuccess={handleRequestSuccess}
        />
      )}

      {viewingCertificate && (
        <CertificateViewer
          request={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}

      {trackingRequest && (
        <TrackingModal
          req={trackingRequest}
          onClose={() => setTrackingRequest(null)}
        />
      )}
    </div>
  );
}
