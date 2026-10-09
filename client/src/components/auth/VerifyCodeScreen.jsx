import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { FigmaTopHeader } from '../CaintaBranding';

export function VerifyCodeScreen({ email = 'example@gmail.com', onNavigate, onCodeVerified }) {
  const [digits, setDigits] = useState(['2', '4', '5', '0']);
  const [countdown, setCountdown] = useState(34);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    const val = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);

    if (val && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const code = digits.join('');
    if (code.length < 4) {
      setError('Please enter all 4 digits of the verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();

      if (data.success) {
        onCodeVerified ? onCodeVerified(code) : onNavigate('reset-password');
      } else {
        setError(data.message || 'Invalid verification code.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = () => {
    setCountdown(45);
    setError('');
    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  };

  const formatCountdown = (s) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min} : ${sec}`;
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#0B1C63] text-white">
      <FigmaTopHeader
        showBack={true}
        onBack={() => onNavigate('forgot-password')}
        titleBadge="Verify Code"
      />

      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col items-center max-w-sm mx-auto w-full">
        <p className="text-xs sm:text-sm text-slate-300 text-center font-normal mb-8 leading-relaxed">
          Please enter the code we just sent to email <br />
          <span className="text-cainta-gold font-semibold">{email}</span>
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="w-full space-y-7">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl sm:rounded-3xl bg-white text-slate-900 border-2 border-slate-300 focus:border-cainta-gold focus:outline-none focus:ring-4 focus:ring-cainta-gold/20 shadow-md transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-extrabold text-base tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-slate-900" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          {countdown > 0 ? (
            <p className="text-xs text-cainta-gold font-medium">
              <span className="underline cursor-default">Send code again</span>{' '}
              <span className="font-mono text-slate-200">{formatCountdown(countdown)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={resendCode}
              className="text-xs text-cainta-gold font-bold underline hover:text-white cursor-pointer"
            >
              Send code again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
