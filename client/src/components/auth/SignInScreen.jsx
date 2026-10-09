import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { FigmaTopHeader, MunicipalHallCard } from '../CaintaBranding';

export function SignInScreen({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#0B1C63] text-white">
      <FigmaTopHeader />
      <MunicipalHallCard />

      <div className="flex-1 px-5 pt-1 pb-6 flex flex-col items-center">
        <div className="px-6 py-1.5 rounded-full bg-[#050E3A] border border-white/20 text-white text-sm font-semibold tracking-wide shadow-inner mb-4">
          Sign In
        </div>

        {error && (
          <div className="w-full mb-3 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-3.5 max-w-sm">
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
              className="w-full px-4 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cainta-gold focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1 pl-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 pr-11 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cainta-gold focus:border-transparent shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-extrabold text-base tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin text-slate-900" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-3.5 mt-5">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
            title="Sign in with Apple"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.34-.57.65-1.06 1.71-.93 2.73 1.01.08 2.02-.49 2.63-1.22z"/>
            </svg>
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
            title="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            </svg>
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
            title="Sign in with Facebook"
          >
            <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        <div className="mt-4 text-center space-y-1">
          <p className="text-xs text-slate-300">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="text-cainta-gold font-bold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </p>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-xs text-slate-300 hover:text-cainta-gold hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
