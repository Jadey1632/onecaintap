import React, { useState, useCallback } from 'react';
import {
  ShieldCheck, Home, HeartHandshake, FileCheck, CreditCard, Briefcase, GraduationCap,
  Upload, Calendar, MapPin, CheckCircle2, ChevronRight, ChevronLeft,
  X, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { api } from '../../api.js';

const ICON_MAP = {
  ShieldCheck, Home, HeartHandshake, FileCheck, CreditCard, Briefcase, GraduationCap,
};

const PURPOSES = [
  'Local Employment / Job Application',
  'Postal ID / Government ID Application',
  'Bank Account Opening / Financial Transaction',
  'Proof of Residency / Utility Connection',
  'Medical Assistance / DSWD / PCSO',
  'Scholarship / Educational Requirement',
  'Barangay Business Clearance / Mayor\'s Permit',
  'Other / Specific Custom Purpose',
];

const PICKUP_SLOTS = [
  '09:00 AM – 11:00 AM',
  '01:00 PM – 03:00 PM',
  '03:00 PM – 05:00 PM',
];

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function sanitizeText(str) {
  return String(str ?? '').replace(/[<>"'`;]/g, '').trim();
}

function getMinPickupDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

export function CertificateRequestWizard({ user, catalog = [], onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [selectedCertId, setSelectedCertId] = useState(catalog[0]?.id ?? '');
  const [purpose, setPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');

  // Step 2
  const [uploadedIdUrl, setUploadedIdUrl] = useState(null);
  const [uploadedIdName, setUploadedIdName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Step 3
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [pickupDate, setPickupDate] = useState(getMinPickupDate);
  const [pickupTime, setPickupTime] = useState(PICKUP_SLOTS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState(
    sanitizeText(user?.address ?? '')
  );
  const [deliveryContact, setDeliveryContact] = useState(
    sanitizeText(user?.contact_number ?? '')
  );

  const activeCert = catalog.find(c => c.id === selectedCertId) ?? catalog[0] ?? null;

  // ── Validation per step ──────────────────────────────────────────────────
  const validateStep = useCallback((s) => {
    if (s === 1) {
      if (!activeCert) return 'No certificate available to select.';
      const finalPurpose = purpose === 'Other / Specific Custom Purpose'
        ? customPurpose.trim()
        : purpose;
      if (!finalPurpose) return 'Please select or describe a purpose.';
      if (finalPurpose.length > 300) return 'Purpose must be under 300 characters.';
    }
    if (s === 2) {
      if (!uploadedIdUrl) return 'Please upload a valid government ID.';
    }
    if (s === 3) {
      if (deliveryMethod === 'delivery') {
        if (!deliveryAddress.trim()) return 'Please enter your delivery address.';
        if (!deliveryContact.trim()) return 'Please enter a contact number for delivery.';
        if (!/^[0-9+\s\-()]{7,20}$/.test(deliveryContact.trim()))
          return 'Enter a valid contact number (e.g. +63 9XX XXX XXXX).';
      }
      if (deliveryMethod === 'pickup' && !pickupDate)
        return 'Please select a pickup date.';
    }
    return '';
  }, [activeCert, purpose, customPurpose, uploadedIdUrl, deliveryMethod, deliveryAddress, deliveryContact, pickupDate]);

  const advance = () => {
    const msg = validateStep(step);
    if (msg) { setError(msg); return; }
    setError('');
    setStep(s => s + 1);
  };

  const back = () => { setError(''); setStep(s => s - 1); };

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (!ALLOWED_MIME.includes(file.type)) {
      setUploadError('Only JPEG, PNG, WEBP, or PDF files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError('File must be under 10 MB.');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedIdUrl(ev.target.result);
      setUploadedIdName(file.name);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const data = await api.uploadFile(file);
      if (data.success && data.url) {
        setUploadedIdUrl(data.url);
      }
    } catch {
      // Keep local preview; log silently
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setUploadedIdUrl(null);
    setUploadedIdName('');
    setUploadError('');
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const msg = validateStep(3);
    if (msg) { setError(msg); return; }

    const finalPurpose = purpose === 'Other / Specific Custom Purpose'
      ? sanitizeText(customPurpose)
      : sanitizeText(purpose);

    setLoading(true);
    setError('');

    try {
      const payload = {
        user_id: user.id,
        certificate_id: activeCert.id,
        purpose: finalPurpose,
        delivery_method: deliveryMethod,
        pickup_date: deliveryMethod === 'pickup' ? pickupDate : null,
        pickup_time: deliveryMethod === 'pickup' ? pickupTime : null,
        delivery_address: deliveryMethod === 'delivery' ? sanitizeText(deliveryAddress) : null,
        delivery_contact: deliveryMethod === 'delivery' ? sanitizeText(deliveryContact) : null,
        delivery_fee: 0,
        total_amount: 0,
        id_document_url: uploadedIdUrl,
      };

      const data = await api.createRequest(payload);
      if (data.success) {
        onSuccess(data.request);
      } else {
        setError(data.message ?? 'Failed to submit request. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const STEP_LABELS = [
    'Certificate & Purpose',
    'Identity Document',
    'Release Schedule',
  ];

  const progressPct = `${(step / 3) * 100}%`;

  if (!activeCert && catalog.length === 0) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Certificate Request"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      >
        <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 text-center space-y-4 border border-slate-700">
          <FileText size={40} className="mx-auto text-slate-500" />
          <p className="text-sm text-slate-300 font-medium">
            No certificates are available at this time. Please try again later.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Certificate Request Wizard"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="bg-cainta-blue px-5 py-4 flex items-start justify-between text-white border-b border-white/10 rounded-t-2xl">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cainta-gold">
              Step {step} of 3 &bull; Online Application
            </span>
            <h2 className="text-base sm:text-lg font-bold leading-tight mt-0.5">
              {STEP_LABELS[step - 1]}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wizard"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors mt-0.5 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="w-full bg-slate-800 h-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
          <div
            className="h-full bg-cainta-gold transition-all duration-300 ease-out"
            style={{ width: progressPct }}
          />
        </div>

        {/* ── Body ── */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-slate-100">

          {/* Global error */}
          {error && (
            <div role="alert" className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ══ STEP 1: Certificate & Purpose ══ */}
          {step === 1 && (
            <div className="space-y-4">
              <fieldset>
                <legend className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Certificate Type
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {catalog.map(cert => {
                    const Icon = ICON_MAP[cert.icon] ?? FileCheck;
                    const isSelected = selectedCertId === cert.id;
                    return (
                      <button
                        key={cert.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedCertId(cert.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-left flex items-start gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold ${
                          isSelected
                            ? 'bg-blue-950/80 border-cainta-gold shadow-md'
                            : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-cainta-gold text-slate-900' : 'bg-slate-700 text-cainta-gold'}`}>
                          <Icon size={18} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-snug">{cert.name}</p>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-snug">{cert.description}</p>
                          <div className="flex items-center justify-between mt-1.5 text-[10px]">
                            <span className="font-bold text-emerald-400">
                              {Number(cert.fee) === 0 ? 'FREE' : `₱${Number(cert.fee).toFixed(2)}`}
                            </span>
                            <span className="text-slate-400">{cert.processing_time}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="purpose-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Purpose of Request <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <select
                  id="purpose-select"
                  value={purpose}
                  onChange={e => { setPurpose(e.target.value); setError(''); }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:border-cainta-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
                >
                  <option value="">— Select purpose —</option>
                  {PURPOSES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {purpose === 'Other / Specific Custom Purpose' && (
                  <div className="mt-2">
                    <label htmlFor="custom-purpose" className="sr-only">Custom purpose</label>
                    <input
                      id="custom-purpose"
                      type="text"
                      maxLength={300}
                      required
                      placeholder="Describe your specific purpose (e.g. Court requirement, Meralco meter)"
                      value={customPurpose}
                      onChange={e => { setCustomPurpose(e.target.value); setError(''); }}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-cainta-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5 text-right">
                      {customPurpose.length}/300
                    </p>
                  </div>
                )}
              </div>

              {/* Requirements preview */}
              {activeCert && (
                <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-amber-300">Requirements for {activeCert.name}:</p>
                  <p className="text-slate-300 leading-relaxed">{activeCert.requirements}</p>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 2: Identity Document ══ */}
          {step === 2 && (
            <div className="space-y-4">
              {activeCert && (
                <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs">
                  <p className="font-bold text-amber-300 mb-1">Required for {activeCert.name}:</p>
                  <p className="text-slate-300">{activeCert.requirements}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2" id="upload-label">
                  Upload Valid Government ID <span aria-hidden="true" className="text-red-400">*</span>
                </p>

                {uploadError && (
                  <div role="alert" className="mb-2 p-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadedIdUrl ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 flex items-center gap-3">
                    {uploadedIdUrl.startsWith('data:image') || uploadedIdUrl.match(/\.(jpe?g|png|webp)$/i) ? (
                      <img
                        src={uploadedIdUrl}
                        alt="Uploaded ID preview"
                        className="w-20 h-14 object-cover rounded-lg border border-slate-600 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-lg border border-slate-600 bg-slate-700 flex items-center justify-center shrink-0">
                        <FileText size={24} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} aria-hidden="true" /> Attached successfully
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {uploadedIdName || 'ID_Document'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearUpload}
                      className="text-xs text-red-400 hover:text-red-300 underline px-1 shrink-0"
                      aria-label="Remove uploaded ID"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-slate-700 hover:border-cainta-gold rounded-2xl p-6 text-center bg-slate-800/30 transition-colors"
                    aria-labelledby="upload-label"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={28} className="text-cainta-gold animate-spin" />
                        <p className="text-xs text-slate-300">Uploading…</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="mx-auto text-slate-400 mb-2" aria-hidden="true" />
                        <p className="text-xs font-semibold text-slate-200">
                          Driver's License, UMID, Passport, National ID, or Voter's ID
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG, WEBP or PDF · max 10 MB</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="id-file-input"
                          aria-label="Upload government ID"
                        />
                        <label
                          htmlFor="id-file-input"
                          className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer focus-within:ring-2 focus-within:ring-cainta-gold"
                        >
                          Browse Device
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 3: Release Method ══ */}
          {step === 3 && (
            <div className="space-y-4">
              <fieldset>
                <legend className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Release Method
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pickup', Icon: Calendar, label: 'Barangay Hall Pick-up', sub: 'Free · No charge' },
                    { value: 'delivery', Icon: MapPin, label: 'Home Delivery', sub: 'Free · No charge' },
                  ].map(({ value, Icon, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={deliveryMethod === value}
                      onClick={() => { setDeliveryMethod(value); setError(''); }}
                      className={`p-3.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold ${
                        deliveryMethod === value
                          ? 'bg-blue-950/80 border-cainta-gold'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <Icon className="text-cainta-gold" size={22} aria-hidden="true" />
                      <p className="text-xs font-bold text-white text-center leading-snug">{label}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">{sub}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {deliveryMethod === 'pickup' ? (
                <div className="space-y-3 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-cainta-gold">Preferred Pickup Schedule</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pickup-date" className="block text-[11px] text-slate-400 mb-1">
                        Date <span aria-hidden="true" className="text-red-400">*</span>
                      </label>
                      <input
                        id="pickup-date"
                        type="date"
                        value={pickupDate}
                        min={getMinPickupDate()}
                        onChange={e => { setPickupDate(e.target.value); setError(''); }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-cainta-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="pickup-time" className="block text-[11px] text-slate-400 mb-1">
                        Time Slot
                      </label>
                      <select
                        id="pickup-time"
                        value={pickupTime}
                        onChange={e => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-cainta-gold focus:outline-none"
                      >
                        {PICKUP_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Location: Barangay Hall of {user.barangay || 'San Roque'}, Cainta, Rizal
                  </p>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-cainta-gold">Delivery Address</p>
                  <div>
                    <label htmlFor="delivery-address" className="sr-only">Delivery address</label>
                    <input
                      id="delivery-address"
                      type="text"
                      value={deliveryAddress}
                      maxLength={200}
                      onChange={e => { setDeliveryAddress(e.target.value); setError(''); }}
                      placeholder="House No., Street, Subdivision/Sitio, Cainta"
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-cainta-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="delivery-contact" className="block text-[11px] text-slate-400 mb-1">
                      Contact for Delivery Rider <span aria-hidden="true" className="text-red-400">*</span>
                    </label>
                    <input
                      id="delivery-contact"
                      type="tel"
                      value={deliveryContact}
                      maxLength={20}
                      onChange={e => { setDeliveryContact(e.target.value); setError(''); }}
                      placeholder="+63 9XX XXX XXXX"
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-cainta-gold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Summary card */}
              {activeCert && (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                  <p className="font-bold text-slate-200 mb-2">Request Summary</p>
                  <div className="flex justify-between text-slate-300">
                    <span>Certificate:</span>
                    <span className="font-semibold text-white text-right max-w-[60%]">{activeCert.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Purpose:</span>
                    <span className="font-semibold text-white text-right max-w-[60%] truncate">
                      {purpose === 'Other / Specific Custom Purpose' ? customPurpose : purpose}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Release:</span>
                    <span className="font-semibold text-white capitalize">{deliveryMethod}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Total Amount Due:</span>
                    <span className="text-emerald-400 text-base">FREE (₱0.00)</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-200 leading-relaxed">
                ✓ Once submitted, your application is logged into the Cainta Barangay Database and assigned a live tracking number. All barangay services are provided free of charge.
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-slate-800/90 px-5 py-3 border-t border-slate-700 flex items-center justify-between rounded-b-2xl">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft size={16} aria-hidden="true" /> Back
            </button>
          ) : (
            <div aria-hidden="true" />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={advance}
              className="px-5 py-2 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 text-xs font-bold flex items-center gap-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
            >
              Next <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              aria-busy={loading}
              className="px-6 py-2.5 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 text-xs font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Submitting…</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
