import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.register({ email, password, role });
      setUser(res.user);
      setToken(res.access_token);
      navigate(role === 'candidate' ? '/candidate' : '/ask');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
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
            Create Verify<span className="text-teal-400">IQ</span> Account
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Register for privacy-preserving code assessments
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-surface border-border shadow-xl space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-teal-500"
              >
                <option value="candidate">Candidate (Student / Job Applicant)</option>
                <option value="instructor">Examiner / Assessment Author</option>
              </select>
            </div>

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
                placeholder="Minimum 8 characters"
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
              Create Account <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          <div className="text-center text-xs text-text-subtle pt-2 border-t border-border">
            Already registered?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-teal-400 hover:underline"
            >
              Sign In
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
