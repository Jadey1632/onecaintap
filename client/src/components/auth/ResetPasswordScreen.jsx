import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { FigmaTopHeader } from '../CaintaBranding';

export function ResetPasswordScreen({ email = 'example@gmail.com', onNavigate }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate('signin');
        }, 1800);
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#0B1C63] text-white">
      <FigmaTopHeader
        showBack={true}
        onBack={() => onNavigate('signin')}
        titleBadge="Set New Password"
      />

      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col items-center max-w-sm mx-auto w-full">
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Password Reset Successful!</h3>
            <p className="text-xs text-slate-300">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-slate-300 text-center font-normal mb-6 leading-relaxed">
              Create a new secure password for your ONEcainTAP resident account.
            </p>

            {error && (
              <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-11 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cainta-gold shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 pl-1">
                  Confirm Password
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cainta-gold shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-extrabold text-base tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-slate-900" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
