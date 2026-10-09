  import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, XCircle, DollarSign, 
  Search, RefreshCw, Database, Eye, Download, Receipt, History
} from 'lucide-react';
import { CaintaSeal } from '../CaintaBranding';
import { RequestReviewModal } from './RequestReviewModal';
import { CertificateViewer } from '../resident/CertificateViewer';
import { api } from '../../api.js';

export function AdminDashboard({ user, onLogout, onSwitchToResident }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReviewRequest, setSelectedReviewRequest] = useState(null);
  const [previewCertRequest, setPreviewCertRequest] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, reqRes, txnRes, logsRes] = await Promise.all([
        api.getAnalytics(),
        api.getRequests(),         // no user_id = fetch all (admin)
        api.getTransactions(),
        api.getAuditLogs()
      ]);

      if (analyticsRes.success) setStats(analyticsRes.stats);
      if (reqRes.success) setRequests(reqRes.requests);
      if (txnRes.success) setTransactions(txnRes.transactions);
      if (logsRes.success) setAuditLogs(logsRes.logs);
    } catch (e) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRequestUpdated = (updatedReq) => {
    setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
    fetchAdminData();
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.certificate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'ready':
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Approved</span>;
      case 'reviewing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Reviewing</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">Pending</span>;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#030822] text-slate-100">
      
      {/* Top Admin Header */}
      <header className="bg-cainta-blue/90 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <CaintaSeal size={40} />
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[9px] font-bold tracking-widest text-white uppercase">ONE</span>
              <span className="text-sm font-black text-cainta-gold">CAINTAP</span>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold">Admin Desk</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 w-full p-4 space-y-4 max-w-4xl mx-auto">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Requests</span>
            <span className="text-xl font-black text-white">{stats?.totalRequests ?? 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-blue-900/40">
            <span className="text-[10px] text-blue-300 block">Pending Queue</span>
            <span className="text-xl font-black text-blue-400">{stats?.pendingCount ?? 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-900/40">
            <span className="text-[10px] text-emerald-300 block">Issued</span>
            <span className="text-xl font-black text-emerald-400">{stats?.approvedCount ?? 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40">
            <span className="text-[10px] text-amber-300 block">Revenue</span>
            <span className="text-xl font-black text-cainta-gold">₱{Number(stats?.totalRevenue ?? 0).toFixed(0)}</span>
          </div>
        </div>

        {/* Requests Queue */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-1">
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize ${
                    statusFilter === status
                      ? 'bg-cainta-blue text-cainta-gold border border-cainta-gold/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No requests found.</div>
            ) : (
              filteredRequests.map(req => (
                <div key={req.id} className="p-3.5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-cainta-gold">{req.id}</span>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-xs font-bold text-white truncate">{req.resident_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{req.certificate_name}</p>
                  </div>

                  <button
                    onClick={() => setSelectedReviewRequest(req)}
                    className="px-3 py-1.5 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-950 font-bold text-xs shrink-0"
                  >
                    Process
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {selectedReviewRequest && (
        <RequestReviewModal
          request={selectedReviewRequest}
          adminUser={user}
          onClose={() => setSelectedReviewRequest(null)}
          onUpdated={handleRequestUpdated}
          onPreviewCertificate={(req) => {
            setSelectedReviewRequest(null);
            setPreviewCertRequest(req);
          }}
        />
      )}

      {previewCertRequest && (
        <CertificateViewer
          request={previewCertRequest}
          onClose={() => setPreviewCertRequest(null)}
        />
      )}

    </div>
  );
}
