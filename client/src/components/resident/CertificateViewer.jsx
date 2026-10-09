import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Shield, X } from 'lucide-react';
import { CaintaSeal } from '../CaintaBranding';

export function CertificateViewer({ request, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    if (request?.qr_code_hash || request?.id) {
      const verifyUrl = `${window.location.origin}/api/verify-certificate/${request.qr_code_hash || request.id}`;
      QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0B1C63',
          light: '#FFFFFF'
        }
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [request]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      if (!certRef.current) return;

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ONEcainTAP_${request.certificate_name.replace(/\s+/g, '_')}_${request.id}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (!request) return null;

  const dateIssued = request.approved_at 
    ? new Date(request.approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden my-auto">
        
        {/* Top Action Bar */}
        <div className="no-print bg-slate-800/90 border-b border-slate-700 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <Shield className="text-cainta-gold" size={20} />
            <span>Official E-Certificate Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-lg bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-75"
            >
              <Download size={15} />
              <span>{downloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="p-4 sm:p-8 bg-slate-950/50 flex justify-center max-h-[80vh] overflow-y-auto">
          <div
            id="printable-certificate"
            ref={certRef}
            className="w-full max-w-[650px] bg-white text-slate-900 p-8 sm:p-12 rounded-lg shadow-2xl border-8 border-double border-[#0B1C63] relative overflow-hidden font-serif"
            style={{ minHeight: '850px' }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
              <CaintaSeal size={420} />
            </div>

            <div className="text-center relative z-10 border-b-2 border-[#0B1C63] pb-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <CaintaSeal size={72} />
                <div className="flex-1 text-center px-2">
                  <p className="text-[11px] uppercase tracking-wider font-sans font-medium text-slate-600">
                    Republic of the Philippines
                  </p>
                  <p className="text-xs uppercase tracking-wide font-sans font-semibold text-slate-800">
                    Province of Rizal
                  </p>
                  <p className="text-sm font-bold tracking-wide font-sans text-[#0B1C63] uppercase">
                    MUNICIPALITY OF CAINTA
                  </p>
                  <p className="text-xs font-bold font-sans text-amber-700 uppercase">
                    BARANGAY {request.resident_barangay?.toUpperCase() || 'SAN ROQUE'}
                  </p>
                  <p className="text-[10px] italic font-sans text-slate-500 mt-0.5">
                    Tanggapan ng Punong Barangay (Office of the Barangay Captain)
                  </p>
                </div>
                <div className="w-[72px] h-[72px] rounded-full border-2 border-slate-300 flex items-center justify-center bg-slate-50">
                  <span className="text-[9px] font-sans font-bold text-slate-500 text-center leading-tight">
                    OFFICIAL<br/>SEAL
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center my-6 relative z-10">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-[#0B1C63] uppercase font-sans border-b-2 border-amber-500 inline-block pb-1">
                {request.certificate_name || 'BARANGAY CLEARANCE'}
              </h1>
              <p className="text-[11px] font-sans text-slate-600 mt-1 font-semibold tracking-wider">
                CONTROL NO: <span className="text-red-700 font-mono">{request.certificate_number || 'BC-CAIN-2026-0012'}</span>
              </p>
            </div>

            <div className="relative z-10 text-xs sm:text-sm leading-relaxed text-justify space-y-4 my-6 text-slate-800 font-serif">
              <p className="font-semibold text-sm">
                TO WHOM IT MAY CONCERN:
              </p>

              <p className="indent-8">
                This is to certify that <span className="font-bold underline text-slate-950">{request.resident_name?.toUpperCase() || 'RESIDENT NAME'}</span>, of legal age, Filipino citizen, is a bonafide resident of <span className="font-semibold">{request.resident_address || 'Cainta, Rizal'}</span>, Barangay {request.resident_barangay || 'San Roque'}, Municipality of Cainta, Province of Rizal.
              </p>

              <p className="indent-8">
                Based on existing records filed in this Barangay, the aforementioned individual is known to be of <span className="font-semibold">Good Moral</span>, a law-abiding citizen, and has <span className="font-semibold">NO DEROGATORY RECORD</span> or pending criminal/civil case filed against them in this office.
              </p>

              <p className="indent-8">
                This certification is being issued upon the request of the interested party for the purpose of:
              </p>

              <div className="bg-amber-50/80 border-l-4 border-amber-500 p-3 my-2 font-sans font-bold text-center text-slate-900 text-sm uppercase rounded">
                "{request.purpose || 'LEGAL TRANSACTIONS / EMPLOYMENT'}"
              </div>

              <p className="indent-8">
                Issued this <span className="font-semibold underline">{dateIssued}</span> at Barangay {request.resident_barangay || 'San Roque'}, Cainta, Rizal, Philippines.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-300 relative z-10 flex items-end justify-between">
              <div className="flex flex-col items-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Verification QR Code" className="w-24 h-24 border-2 border-slate-300 p-1 bg-white rounded" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                    QR CODE
                  </div>
                )}
                <span className="text-[9px] font-sans font-bold text-slate-600 mt-1 uppercase tracking-tight">
                  Scan to Authenticate
                </span>
                <span className="text-[8px] font-mono text-slate-500">
                  {request.id}
                </span>
              </div>

              <div className="text-center w-56">
                <div className="relative inline-block w-full">
                  <svg viewBox="0 0 160 50" className="w-36 h-12 mx-auto text-blue-900 opacity-90">
                    <path d="M10 35 Q 40 10, 70 30 T 110 20 T 150 25 M 60 15 Q 80 45, 100 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <div className="w-full border-b-2 border-slate-900 mt-1"></div>
                </div>
                <p className="font-sans font-black text-xs text-slate-900 uppercase mt-1">
                 NIETO
                </p>
                <p className="font-sans text-[10px] font-semibold text-slate-600 uppercase">
                  Punong Barangay / Municipal Officer
                </p>
                <p className="font-sans text-[9px] text-amber-800 font-bold">
                  ONEcainTAP Digital Verification
                </p>
              </div>
            </div>

            <div className="mt-8 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[8px] font-sans text-slate-500">
              <span>Official Receipt (OR) No: <strong className="text-slate-800">{request.payment_status === 'paid' ? 'OR-CAIN-2026-9041' : 'EXEMPTED / WAIVED'}</strong></span>
              <span>Barangay Dry Seal Affixed Digitally</span>
              <span>Document Verification: onecaintap.cainta.gov.ph</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
