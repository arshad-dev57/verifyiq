import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../lib/api';
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
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      setToken(res.access_token);
      navigate(res.user.role === 'candidate' ? '/candidate' : '/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Check your email and password.');
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
            <div className="w-full max-w-[420px] viq-in">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/70 flex items-center justify-center shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
                <Shield className="w-6 h-6 text-neutral-900" strokeWidth={1.75} />
              </div>

              <h1 className="mt-7 text-4xl font-semibold tracking-[-0.04em] leading-tight">Welcome back.</h1>
              <p className="mt-2 text-neutral-500">Sign in with the account you registered.</p>

              <form onSubmit={(e) => handleLogin(e)} className="mt-8 space-y-4">
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
                      className="w-full h-12 rounded-2xl bg-neutral-100 border border-transparent pl-11 pr-4 text-[15px] placeholder:text-neutral-400 outline-none transition focus:bg-white focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5"
                    />
                  </div>
                </div>

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
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                      onKeyDown={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                      onBlur={() => setCapsOn(false)}
                      placeholder="Enter your password"
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
                </div>

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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-12 rounded-full bg-neutral-900 text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-neutral-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-neutral-500">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-medium text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>

        <AuthShowcase />
      </div>
    </div>
  );
};
