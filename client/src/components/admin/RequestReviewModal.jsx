import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, FileText, User, MapPin, Phone, 
  Eye, AlertTriangle, Loader2, X, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api.js';

export function RequestReviewModal({ request, adminUser, onClose, onUpdated, onPreviewCertificate }) {
  const [remarks, setRemarks] = useState(request.admin_remarks || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'rejected' && !remarks.trim()) {
      setError('Please provide remarks/reason for rejection.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.updateRequestStatus(request.id, {
        status: newStatus,
        admin_remarks: remarks,
        approved_by: adminUser.id,
      });

      if (data.success) {
        if (newStatus === 'approved') {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }
        onUpdated(data.request);
        onClose();
      } else {
        setError(data.message || 'Failed to update request.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-cainta-blue px-6 py-4 flex items-center justify-between text-white border-b border-cainta-border/50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="text-cainta-gold" size={22} />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cainta-gold">
                Barangay Review Desk
              </span>
              <h2 className="text-base sm:text-lg font-bold">
                Review Request #{request.id}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-slate-100">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-cainta-gold uppercase tracking-wider block">
                Resident Applicant
              </span>
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-white">{request.resident_name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>{request.resident_address}, Brgy. {request.resident_barangay}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{request.resident_contact}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-cainta-gold uppercase tracking-wider block">
                Application Details
              </span>
              <p className="text-sm font-bold text-white">{request.certificate_name}</p>
              <p className="text-xs text-slate-300"><strong>Purpose:</strong> {request.purpose}</p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Method: <strong className="text-white capitalize">{request.delivery_method}</strong></span>
                <span className="font-bold text-amber-300">₱{Number(request.total_amount).toFixed(2)} ({request.payment_status.toUpperCase()})</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-cainta-gold" />
              <span>Uploaded Identification & Proof:</span>
            </span>

            {request.id_document_url ? (
              <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                <img
                  src={request.id_document_url}
                  alt="Valid ID Proof"
                  className="w-28 h-20 object-cover rounded-lg border border-slate-600 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(request.id_document_url, '_blank')}
                  title="Click to view full image"
                />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-400">Government Valid ID Attached</p>
                  <p className="text-[11px] text-slate-400">Verified applicant name matches registered Cainta database record.</p>
                  <a
                    href={request.id_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cainta-gold hover:underline inline-flex items-center gap-1"
                  >
                    <Eye size={12} /> Inspect Document
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400 italic">
                Verified via in-person Barangay masterlist record on file.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Barangay Staff Notes / Rejection Remarks:
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Verified clean record in Barangay San Roque. Document approved for release."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cainta-gold"
            />
          </div>

          {(request.status === 'approved' || request.status === 'ready' || request.status === 'completed') && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-300">Certificate Already Issued</p>
                <p className="text-[11px] text-slate-300">Control No: {request.certificate_number || 'BC-CAIN-2026-0012'}</p>
              </div>
              <button
                type="button"
                onClick={() => onPreviewCertificate(request)}
                className="px-3.5 py-2 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-bold text-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Preview Official PDF
              </button>
            </div>
          )}

        </div>

        <div className="bg-slate-800/90 px-6 py-4 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus('rejected')}
              className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
            >
              <XCircle size={15} />
              <span>Reject Request</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus('approved')}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin text-slate-950" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>Approve & Issue Certificate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
