import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../lib/api';
import { UserRole } from '../../types';
import { AuthShowcase, AuthStyles } from './Authshowcase';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Config                                                             */
/* ------------------------------------------------------------------ */

const REGISTER_ROLES: {
  key: UserRole;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'candidate',
    title: 'Candidate',
    desc: 'Student or job applicant taking coding assessments.',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    key: 'instructor',
    title: 'Examiner',
    desc: 'Author assessments and review session evidence.',
    icon: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    key: 'admin',
    title: 'Admin',
    desc: 'Manage settings, audit logs, and organization access.',
    icon: <Shield className="w-5 h-5" />,
  },
];

const REGISTER_SLIDES = [
  {
    title: 'Fair for candidates.',
    text: 'Assessments run on timing signals only. Nothing you type is recorded and no camera is used.',
  },
  {
    title: 'Clear for examiners.',
    text: 'Get a 0–100 anomaly score with a plain-language summary, and make the final call yourself.',
  },
  {
    title: 'Proof you can share.',
    text: 'Passed assessments turn into signed credentials that anyone can verify with a QR scan.',
  },
];

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['bg-neutral-300', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  /* Password rules drive both the checklist and the strength meter */
  const rules = useMemo(
    () => [
      { label: 'At least 8 characters', ok: password.length >= 8 },
      { label: 'Upper and lower case letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { label: 'A number', ok: /\d/.test(password) },
      { label: 'A symbol', ok: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );
  const passed = rules.filter((r) => r.ok).length;
  // Under 8 characters is always "Too short" regardless of other rules.
  const strength = password.length === 0 ? 0 : password.length < 8 ? 0 : Math.max(1, passed);
  const strengthIndex = Math.min(strength, 4);

  /* Form completion drives the top progress bar */
  const emailValid = EMAIL_RE.test(email);
  const passwordValid = password.length >= 8;
  const completion = 33 + (emailValid ? 33 : 0) + (passwordValid ? 34 : 0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      setError('Password must be at least 8 characters.');
      setShakeKey((k) => k + 1);
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.register({ email, password, role });
      setUser(res.user);
      setToken(res.access_token);
      navigate(role === 'candidate' ? '/candidate' : '/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      setShakeKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-neutral-900 antialiased p-3"
      style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      <AuthStyles />

      <div className="min-h-[calc(100vh-1.5rem)] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3">
        {/* ------------------- Form side ------------------- */}
        <div className="flex flex-col px-6 sm:px-12 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Back to home
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </span>
              <span className="font-semibold tracking-tight">VerifyIQ</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-10">
            <div className="w-full max-w-[440px] viq-in">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/70 flex items-center justify-center shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
                <Shield className="w-6 h-6 text-neutral-900" strokeWidth={1.75} />
              </div>

              <h1 className="mt-7 text-4xl font-semibold tracking-[-0.04em] leading-tight">Create your account.</h1>
              <p className="mt-2 text-neutral-500">Register for privacy-preserving code assessments.</p>

              {/* Completion bar */}
              <div className="mt-6 h-1 rounded-full bg-neutral-100 overflow-hidden" aria-hidden>
                <div
                  className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <form onSubmit={handleRegister} className="mt-6 space-y-5">
                {/* Role cards */}
                <div>
                  <p className="text-sm font-medium mb-2">I am a</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Account role">
                    {REGISTER_ROLES.map((r) => {
                      const selected = role === r.key;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setRole(r.key)}
                          className={
                            'relative text-left rounded-2xl border p-4 transition-all duration-200 ' +
                            (selected
                              ? 'border-neutral-900 bg-white ring-4 ring-neutral-900/5'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300')
                          }
                        >
                          <span
                            className={
                              'w-9 h-9 rounded-xl flex items-center justify-center transition-colors ' +
                              (selected ? 'bg-neutral-900 text-white' : 'bg-neutral-200/70 text-neutral-700')
                            }
                          >
                            {r.icon}
                          </span>
                          <p className="mt-3 text-sm font-semibold">{r.title}</p>
                          <p className="mt-0.5 text-xs text-neutral-500 leading-snug">{r.desc}</p>
                          <span
                            className={
                              'absolute top-3 right-3 w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center transition-all duration-200 ' +
                              (selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50')
                            }
                          >
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full h-12 rounded-2xl bg-neutral-100 border border-transparent pl-11 pr-11 text-[15px] placeholder:text-neutral-400 outline-none transition focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5"
                    />
                    <span
                      className={
                        'absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all duration-200 ' +
                        (emailValid ? 'opacity-100 scale-100' : 'opacity-0 scale-50')
                      }
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                      onKeyDown={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                      onBlur={() => setCapsOn(false)}
                      placeholder="Minimum 8 characters"
                      className="w-full h-12 rounded-2xl bg-neutral-100 border border-transparent pl-11 pr-12 text-[15px] placeholder:text-neutral-400 outline-none transition focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {capsOn && (
                    <p className="viq-in mt-1.5 text-xs text-amber-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Caps Lock is on
                    </p>
                  )}

                  {/* Strength meter + checklist (only once the user starts typing) */}
                  <div
                    className={
                      'grid transition-all duration-300 ease-out ' +
                      (password ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0')
                    }
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((n) => (
                            <span
                              key={n}
                              className={
                                'h-1.5 rounded-full transition-colors duration-300 ' +
                                (strengthIndex >= n ? STRENGTH_COLORS[strengthIndex] : 'bg-neutral-200')
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-neutral-600 w-16 text-right">
                          {STRENGTH_LABELS[strengthIndex]}
                        </span>
                      </div>
                      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {rules.map((r) => (
                          <li
                            key={r.label}
                            className={
                              'flex items-center gap-2 text-xs transition-colors ' +
                              (r.ok ? 'text-emerald-600' : 'text-neutral-400')
                            }
                          >
                            <span
                              className={
                                'w-4 h-4 rounded-full flex items-center justify-center transition-colors ' +
                                (r.ok ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-transparent')
                              }
                            >
                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                            </span>
                            {r.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    key={shakeKey}
                    role="alert"
                    className="viq-shake flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-12 rounded-full bg-neutral-900 text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-neutral-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-neutral-500">
                Already registered?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-400 text-center lg:text-left">
            Zero keylogging. Zero webcam surveillance. Objective telemetry only.
          </p>
        </div>

        {/* ------------------- Showcase side ------------------- */}
        <AuthShowcase slides={REGISTER_SLIDES} />
      </div>
    </div>
  );
};