import React, { useState, useId } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FigmaTopHeader } from '../CaintaBranding';

const CAINTA_BARANGAYS = [
  'San Andres',
  'San Isidro',
  'San Juan',
  'San Roque',
  'Santa Rosa',
  'Santo Domingo',
  'Santo Niño',
];

const FIELD_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'\-.]+$/,
    patternMsg: 'Name may only contain letters, spaces, hyphens, and apostrophes.',
  },
  address: {
    required: true,
    minLength: 10,
    maxLength: 200,
  },
  contact_number: {
    required: true,
    pattern: /^[0-9+\s\-()]{7,20}$/,
    patternMsg: 'Enter a valid Philippine mobile number (e.g. +63 9XX XXX XXXX).',
  },
  email: {
    required: true,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMsg: 'Enter a valid email address.',
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    patternMsg: 'Password must include at least one uppercase letter, one lowercase letter, and one number.',
  },
};

function validateField(name, value) {
  const rules = FIELD_RULES[name];
  if (!rules) return '';
  const v = value.trim();
  if (rules.required && !v) return 'This field is required.';
  if (rules.minLength && v.length < rules.minLength)
    return `Must be at least ${rules.minLength} characters.`;
  if (rules.maxLength && v.length > rules.maxLength)
    return `Must be under ${rules.maxLength} characters.`;
  if (rules.pattern && !rules.pattern.test(v)) return rules.patternMsg;
  return '';
}

function sanitize(str) {
  return String(str ?? '').replace(/[<>"'`;]/g, '').trim();
}

export function SignUpScreen({ onNavigate, onRegisterSuccess }) {
  const uid = useId();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    email: '',
    password: '',
    barangay: 'San Roque',
  });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const fieldError = (name) =>
    touched[name] ? validateField(name, formData[name]) : '';

  const allValid = Object.keys(FIELD_RULES).every(
    (k) => validateField(k, formData[k]) === ''
  );

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setServerError('');
  };

  const handleBlur = (field) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const handleRegister = async (e) => {
    e.preventDefault();
    // Mark all touched on submit attempt
    setTouched(Object.fromEntries(Object.keys(FIELD_RULES).map(k => [k, true])));
    if (!allValid) return;

    setServerError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        name: sanitize(formData.name),
        address: sanitize(formData.address),
        contact_number: sanitize(formData.contact_number),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,          // never sanitize passwords
        barangay: formData.barangay,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Handle non-2xx without crashing
      const data = await res.json().catch(() => ({ success: false, message: `Server error ${res.status}` }));

      if (data.success) {
        setSuccess('Account created! Redirecting to Sign In…');
        setTimeout(() => {
          onRegisterSuccess ? onRegisterSuccess(data.user) : onNavigate('signin');
        }, 1400);
      } else {
        setServerError(data.message ?? 'Registration failed. Please check your information.');
      }
    } catch {
      setServerError('Cannot reach the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-cainta-gold shadow-sm transition-colors ${
      fieldError(field)
        ? 'border-red-400 focus:ring-red-400'
        : 'border-slate-300'
    }`;

  return (
    <div className="w-full min-h-full flex flex-col bg-[#0B1C63] text-white">
      <FigmaTopHeader titleBadge="Create Account" />

      <div className="flex-1 px-5 pt-3 pb-8 flex flex-col items-center">

        {/* Server-level error */}
        {serverError && (
          <div
            role="alert"
            className="w-full mb-3 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2 font-medium"
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="w-full mb-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-medium"
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>{success}</span>
          </div>
        )}

        <form
          onSubmit={handleRegister}
          noValidate
          aria-label="Registration form"
          className="w-full space-y-3 max-w-sm"
        >
          {/* Name */}
          <Field
            id={`${uid}-name`}
            label="Full Name"
            error={fieldError('name')}
          >
            <input
              id={`${uid}-name`}
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Juan dela Cruz"
              maxLength={100}
              aria-describedby={fieldError('name') ? `${uid}-name-err` : undefined}
              aria-invalid={!!fieldError('name')}
              className={inputClass('name')}
            />
          </Field>

          {/* Address */}
          <Field
            id={`${uid}-address`}
            label="Home Address"
            error={fieldError('address')}
          >
            <input
              id={`${uid}-address`}
              type="text"
              required
              autoComplete="street-address"
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              placeholder="House No., Street, Cainta, Rizal"
              maxLength={200}
              aria-describedby={fieldError('address') ? `${uid}-address-err` : undefined}
              aria-invalid={!!fieldError('address')}
              className={inputClass('address')}
            />
          </Field>

          {/* Barangay */}
          <div>
            <label
              htmlFor={`${uid}-barangay`}
              className="block text-xs font-semibold text-slate-200 mb-1 pl-1"
            >
              Barangay
            </label>
            <select
              id={`${uid}-barangay`}
              value={formData.barangay}
              onChange={e => handleChange('barangay', e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white text-slate-900 text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cainta-gold shadow-sm"
            >
              {CAINTA_BARANGAYS.map(bg => (
                <option key={bg} value={bg}>Barangay {bg}</option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <Field
            id={`${uid}-contact`}
            label="Contact Number"
            error={fieldError('contact_number')}
          >
            <input
              id={`${uid}-contact`}
              type="tel"
              required
              autoComplete="tel"
              value={formData.contact_number}
              onChange={e => handleChange('contact_number', e.target.value)}
              onBlur={() => handleBlur('contact_number')}
              placeholder="+63 9XX XXX XXXX"
              maxLength={20}
              aria-describedby={fieldError('contact_number') ? `${uid}-contact-err` : undefined}
              aria-invalid={!!fieldError('contact_number')}
              className={inputClass('contact_number')}
            />
          </Field>

          {/* Email */}
          <Field
            id={`${uid}-email`}
            label="Email Address"
            error={fieldError('email')}
          >
            <input
              id={`${uid}-email`}
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="example@gmail.com"
              maxLength={254}
              aria-describedby={fieldError('email') ? `${uid}-email-err` : undefined}
              aria-invalid={!!fieldError('email')}
              className={inputClass('email')}
            />
          </Field>

          {/* Password */}
          <Field
            id={`${uid}-password`}
            label="Password"
            error={fieldError('password')}
            hint="Min. 8 characters with uppercase, lowercase, and a number."
          >
            <div className="relative">
              <input
                id={`${uid}-password`}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••••••"
                maxLength={128}
                aria-describedby={
                  fieldError('password')
                    ? `${uid}-password-err`
                    : `${uid}-password-hint`
                }
                aria-invalid={!!fieldError('password')}
                className={`${inputClass('password')} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold rounded"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </Field>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || !!success}
              aria-busy={loading}
              className="w-full py-3 px-4 rounded-full bg-cainta-gold hover:bg-cainta-gold-hover text-slate-900 font-extrabold text-base tracking-wide shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </div>
        </form>

        <p className="mt-5 text-xs text-slate-300 text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signin')}
            className="text-cainta-gold font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cainta-gold rounded"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

/** Reusable accessible field wrapper */
function Field({ id, label, error, hint, children }) {
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-200 mb-1 pl-1">
        {label}
      </label>
      {React.cloneElement(children, {
        'aria-describedby': [
          error ? errId : null,
          hint ? hintId : null,
        ].filter(Boolean).join(' ') || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-[10px] text-slate-400 mt-0.5 pl-1">{hint}</p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-[10px] text-red-400 mt-0.5 pl-1 flex items-center gap-1">
          <AlertCircle size={11} aria-hidden="true" />{error}
        </p>
      )}
    </div>
  );
}
