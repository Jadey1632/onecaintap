import React from 'react';

export function CaintaSeal({ size = 56, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" width="100%" height="100%" className="drop-shadow-md">
        <defs>
          <linearGradient id="sealGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="50%" stopColor="#F6D83B" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="shieldBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0B1C63" />
          </linearGradient>
          <linearGradient id="shieldRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="80" cy="80" r="76" fill="#0B1C63" stroke="url(#sealGoldGrad)" strokeWidth="5"/>
        <circle cx="80" cy="80" r="69" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="3,2"/>
        <circle cx="80" cy="80" r="54" fill="#FFFFFF"/>

        {/* Text Arc Top */}
        <path id="sealTopTextArc" d="M 24 80 A 56 56 0 0 1 136 80" fill="none"/>
        <text fontFamily="Arial, sans-serif" fontSize="7" fontWeight="900" fill="#FFFFFF" letterSpacing="1.1">
          <textPath href="#sealTopTextArc" startOffset="50%" textAnchor="middle">
            PAMAHALAANG BAYAN NG CAINTA
          </textPath>
        </text>

        {/* Text Arc Bottom */}
        <path id="sealBottomTextArc" d="M 136 80 A 56 56 0 0 1 24 80" fill="none"/>
        <text fontFamily="Arial, sans-serif" fontSize="7.5" fontWeight="900" fill="#FFFFFF" letterSpacing="1.4">
          <textPath href="#sealBottomTextArc" startOffset="50%" textAnchor="middle">
            LALAWIGAN NG RIZAL
          </textPath>
        </text>

        {/* Inner Shield Coat of Arms */}
        <g transform="translate(48, 45) scale(0.4)">
          <path d="M80 5 C120 5 150 15 150 50 C150 110 80 150 80 155 C80 150 10 110 10 50 C10 15 40 5 80 5 Z" fill="#F8FAFC" stroke="#0B1C63" strokeWidth="6"/>
          <path d="M80 10 C115 10 142 18 144 48 L80 75 Z" fill="url(#shieldBlueGrad)"/>
          <path d="M80 10 C45 10 18 18 16 48 L80 75 Z" fill="url(#shieldRedGrad)"/>
          <path d="M16 48 C16 95 75 140 80 148 C85 140 144 95 144 48 L80 75 Z" fill="#F1F5F9"/>

          {/* Philippine Sun */}
          <circle cx="80" cy="75" r="16" fill="url(#sealGoldGrad)" stroke="#D97706" strokeWidth="2"/>
          <g stroke="url(#sealGoldGrad)" strokeWidth="3" strokeLinecap="round">
            <line x1="80" y1="52" x2="80" y2="45"/>
            <line x1="80" y1="98" x2="80" y2="105"/>
            <line x1="57" y1="75" x2="50" y2="75"/>
            <line x1="103" y1="75" x2="110" y2="75"/>
            <line x1="64" y1="59" x2="59" y2="54"/>
            <line x1="96" y1="91" x2="101" y2="96"/>
            <line x1="64" y1="91" x2="59" y2="96"/>
            <line x1="96" y1="59" x2="101" y2="54"/>
          </g>

          <path d="M35 110 Q55 102 80 110 Q105 118 125 110" stroke="#0284C7" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d="M45 125 Q62 118 80 125 Q98 132 115 125" stroke="#0284C7" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}

export function OneCainTapLogo({ className = "", theme = "dark" }) {
  return (
    <div className={`flex flex-col items-start leading-none select-none ${className}`}>
      <div className="flex items-center gap-1">
        <span className={`text-[10px] tracking-[0.2em] font-extrabold uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          ONE
        </span>
        <div className={`h-[1px] w-6 ${theme === 'dark' ? 'bg-white/60' : 'bg-slate-400'}`}></div>
      </div>
      <span className="text-xl sm:text-2xl font-black tracking-tight text-cainta-gold font-sans drop-shadow-sm">
        CAINTAP
      </span>
    </div>
  );
}

export function FigmaTopHeader({ showBack = false, onBack = null, titleBadge = null }) {
  return (
    <div className="w-full bg-cainta-blue text-white px-5 pt-8 pb-5 flex flex-col items-center relative border-b border-cainta-border/50">
      {showBack && (
        <button
          onClick={onBack}
          type="button"
          className="absolute left-4 top-8 w-9 h-9 rounded-full bg-white text-cainta-blue flex items-center justify-center shadow-md hover:bg-slate-100 transition-transform active:scale-95"
          aria-label="Go Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Center Crest & Logo */}
      <div className="flex items-center justify-center gap-3 mt-1">
        <CaintaSeal size={52} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-[0.22em] font-bold text-white uppercase">ONE</span>
            <div className="h-[1.5px] w-8 bg-white/70"></div>
          </div>
          <span className="text-2xl font-black tracking-normal text-cainta-gold leading-tight">
            CAINTAP
          </span>
        </div>
      </div>

      {titleBadge && (
        <div className="mt-4 px-5 py-1.5 rounded-full bg-[#050E3A] border border-white/20 text-white text-sm font-semibold tracking-wide shadow-inner">
          {titleBadge}
        </div>
      )}
    </div>
  );
}

export function MunicipalHallCard() {
  return (
    <div className="w-full px-5 pt-3 pb-2">
      <div className="relative w-full h-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 group">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C63] via-[#1E3A8A]/60 to-[#60A5FA]/80">
          <div className="absolute top-2 left-6 w-24 h-8 bg-white/20 rounded-full blur-sm"></div>
          <div className="absolute top-4 right-8 w-32 h-10 bg-white/25 rounded-full blur-sm"></div>

          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            <rect width="400" height="200" fill="#4B77BE" opacity="0.5"/>
            <path d="M0 130 Q100 90 200 120 T400 100 L400 200 L0 200 Z" fill="#2C3E50" opacity="0.4"/>
            <circle cx="40" cy="140" r="24" fill="#27AE60" opacity="0.7"/>
            <circle cx="80" cy="145" r="20" fill="#2ECC71" opacity="0.7"/>
            <circle cx="320" cy="140" r="26" fill="#27AE60" opacity="0.7"/>
            <circle cx="360" cy="145" r="22" fill="#2ECC71" opacity="0.7"/>

            <rect x="70" y="80" width="260" height="90" fill="#F8FAFC" rx="4"/>
            <polygon points="200,45 130,80 270,80" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2"/>
            <rect x="145" y="80" width="110" height="90" fill="#FFFFFF"/>
            <rect x="155" y="80" width="8" height="85" fill="#CBD5E1"/>
            <rect x="180" y="80" width="8" height="85" fill="#CBD5E1"/>
            <rect x="212" y="80" width="8" height="85" fill="#CBD5E1"/>
            <rect x="237" y="80" width="8" height="85" fill="#CBD5E1"/>
            <rect x="150" y="70" width="100" height="12" fill="#0B1C63" rx="2"/>
            <text x="200" y="79" fill="#F6D83B" fontSize="6.5" fontWeight="bold" textAnchor="middle">PAMAHALAANG BAYAN NG CAINTA</text>
            
            <g fill="#0B1C63" opacity="0.75">
              <rect x="85" y="95" width="16" height="20" rx="1"/>
              <rect x="110" y="95" width="16" height="20" rx="1"/>
              <rect x="274" y="95" width="16" height="20" rx="1"/>
              <rect x="299" y="95" width="16" height="20" rx="1"/>
              
              <rect x="85" y="125" width="16" height="22" rx="1"/>
              <rect x="110" y="125" width="16" height="22" rx="1"/>
              <rect x="274" y="125" width="16" height="22" rx="1"/>
              <rect x="299" y="125" width="16" height="22" rx="1"/>
            </g>
            
            <rect x="190" y="128" width="20" height="42" fill="#0B1C63" rx="2"/>
            <rect x="0" y="170" width="400" height="30" fill="#E2E8F0"/>
            <line x1="0" y1="170" x2="400" y2="170" stroke="#94A3B8" strokeWidth="2"/>
          </svg>
        </div>

        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Cainta Municipal Hall
          </span>
          <span className="text-[9px] font-medium text-amber-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Province of Rizal
          </span>
        </div>
      </div>
    </div>
  );
}
