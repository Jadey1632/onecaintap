import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FigmaTopHeader } from '../CaintaBranding';

export function ForgotPasswordScreen({ onNavigate, onCodeSent }) {
  const [email, setEmail] = useState('example@gmail.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        onCodeSent(email, data.message);
        onNavigate('verify-code');
      } else {
        setError(data.message || 'Email not found.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#0B1C63] text-white">
      <FigmaTopHeader
        showBack={true}
        onBack={() => onNavigate('signin')}
        titleBadge="Forgot Password"
      />

      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col items-center max-w-sm mx-auto w-full">
        <p className="text-xs sm:text-sm text-slate-300 text-center font-normal mb-8 leading-relaxed">
          Please enter your email address to receive a verification code
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSendCode} className="w-full space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1 pl-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cainta-gold shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-extrabold text-base tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-slate-900" />
                <span>Sending Code...</span>
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onNavigate('signin')}
            className="text-xs text-slate-300 hover:text-cainta-gold hover:underline"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
