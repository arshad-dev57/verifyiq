import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState('candidate@verifyiq.io');
  const [password, setPassword] = useState('Candidate123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const emailToUse = customEmail || email;
      const passwordToUse = customPassword || password;
      const res = await authApi.login(emailToUse, passwordToUse);
      setUser(res.user);
      setToken(res.access_token);

      if (res.user.role === 'candidate') {
        navigate('/candidate');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = (role: UserRole) => {
    if (role === 'instructor') {
      setEmail('instructor@verifyiq.io');
      setPassword('Instructor123!');
      handleLogin(undefined, 'instructor@verifyiq.io', 'Instructor123!');
    } else if (role === 'candidate') {
      setEmail('candidate@verifyiq.io');
      setPassword('Candidate123!');
      handleLogin(undefined, 'candidate@verifyiq.io', 'Candidate123!');
    } else {
      setEmail('admin@verifyiq.io');
      setPassword('Admin123!');
      handleLogin(undefined, 'admin@verifyiq.io', 'Admin123!');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-200">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Sign In to Verify<span className="text-teal-400">IQ</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Access examiner analytics or candidate assessment workspace
          </p>
        </div>

        {/* 1-Click Role Switcher Presets */}
        <div className="p-3 bg-surface rounded-2xl border border-border text-center space-y-2">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
            Demo 1-Click Role Logins:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLoginAs('instructor')}
              className="px-2 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated text-[11px] font-medium text-teal-300 border border-teal-500/30 transition-colors"
            >
              Examiner
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs('candidate')}
              className="px-2 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated text-[11px] font-medium text-text-secondary border border-border transition-colors"
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => quickLoginAs('admin')}
              className="px-2 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated text-[11px] font-medium text-text-secondary border border-border transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <Card className="p-6 md:p-8 bg-surface border-border shadow-xl space-y-4">
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-teal-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-text-subtle pt-2 border-t border-border">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-teal-400 hover:underline"
            >
              Register here
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
