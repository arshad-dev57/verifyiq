import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const CandidateLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Minimal Top Strip */}
      <header className="h-12 border-b border-border bg-surface px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-text-secondary">
            Verify<span className="text-teal-400">IQ</span>
          </span>
          <span className="text-[11px] text-text-subtle font-mono border-l border-border pl-2.5">
            Focus Assessment Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border text-[11px] text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">ID: {user?.pseudonym_id || 'CND-ACTIVE'}</span>
          </div>
        </div>
      </header>

      {/* Main Focus View */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
