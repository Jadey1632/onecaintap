import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, ShieldCheck, QrCode, Lock, ArrowRight } from 'lucide-react';
import { CaintaSeal } from './CaintaBranding';

export function DesktopNationalIdGate({ onSimulateMobile }) {
  const [qrUrl, setQrUrl] = useState('');
  const currentHostUrl = window.location.href;

  useEffect(() => {
    QRCode.toDataURL(currentHostUrl, {
      width: 200,
      margin: 1.5,
      color: {
        dark: '#0B1C63',
        light: '#FFFFFF'
      }
    }).then(setQrUrl).catch(console.error);
  }, [currentHostUrl]);

  return (
    <div className="min-h-screen w-full bg-[#030822] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main National ID & Mobile Verification Card */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0B1C63] via-[#08154D] to-[#040C2E] rounded-3xl border-2 border-amber-400/40 shadow-2xl overflow-hidden relative z-10 flex flex-col">
        
        {/* PhilSys & Cainta Official Card Header */}
        <div className="bg-[#050D38] px-6 py-4 border-b border-amber-400/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CaintaSeal size={46} />
            <div>
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-amber-300">
                Republika ng Pilipinas • Lalawigan ng Rizal
              </p>
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                Pamahalaang Bayan ng Cainta
              </h1>
              <p className="text-[10px] text-slate-300 font-medium">
                Philippine Identification System (PhilSys) Verified Gateway
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> SECURE NATIONAL ID GATE
            </span>
            <span className="text-[9px] font-mono text-slate-400 mt-1">PhilID 4820-9182-4410</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          
          {/* Left Column: QR Code & Security Stamp */}
          <div className="flex flex-col items-center shrink-0">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/60 relative group">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Mobile Access QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 sm:w-48 sm:h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  <QrCode size={40} className="animate-pulse" />
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#0B1C63] border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-md">
                  <CaintaSeal size={24} />
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Official PhilID QR Code
              </span>
              <span className="text-[10px] text-slate-400">
                Scan with smartphone camera
              </span>
            </div>
          </div>

          {/* Right Column: Prominent Notice & Instructions */}
          <div className="flex-1 text-center md:text-left space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Lock size={13} />
              <span>Mobile-Only Resident Verification</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Please continue on your mobile device
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              To safeguard resident identity and ensure electronic certificate authentication under Republic Act 10173 and PhilSys protocols, <strong>ONEcainTAP</strong> is accessed exclusively on verified mobile devices.
            </p>

            <div className="space-y-2 pt-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-cainta-gold text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </div>
                <span>Open the <strong>Camera</strong> or QR Scanner on your mobile phone.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-cainta-gold text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </div>
                <span>Scan the <strong>PhilID Verification QR Code</strong> on this screen.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-cainta-gold text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </div>
                <span>Tap the link to access ONEcainTAP on your smartphone.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Testing on laptop/PC?
              </span>
              <button
                type="button"
                onClick={onSimulateMobile}
                className="text-xs font-bold text-cainta-gold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Simulate Mobile View</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>

        </div>

        {/* Footer Security Notice */}
        <div className="bg-[#02071E] px-6 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1">
          <span>Municipality of Cainta, Rizal • E-Government Services</span>
          <span className="font-mono text-slate-500">Security Hash: CAIN-PHILID-2026-ENCRYPTED</span>
        </div>

      </div>

    </div>
  );
}
