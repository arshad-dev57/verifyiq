import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { UserRole } from '../../types';
import {
  Sun,
  Moon,
  Search,
  User as UserIcon,
  ChevronDown,
  Check,
  Sparkles,
  LogOut,
} from 'lucide-react';

interface TopBarProps {
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  const { user, switchRole, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const roles: Array<{ role: UserRole; label: string; desc: string }> = [
    { role: 'instructor', label: 'Examiner / Instructor', desc: 'Ask VerifyIQ, Session Review, ML Lab' },
    { role: 'candidate', label: 'Candidate Mode', desc: 'Focus exam environment & credentials' },
    { role: 'admin', label: 'System Admin', desc: 'Audit logs, model activation, system settings' },
  ];

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border hover:border-teal-500/50 text-xs text-text-muted hover:text-text-primary transition-colors max-w-sm w-72"
      >
        <Search className="w-3.5 h-3.5 text-text-muted" />
        <span className="truncate">Search sessions, models, rules...</span>
        <kbd className="ml-auto font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-text-subtle">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Backend Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE API (ACTIVE)</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors border border-transparent hover:border-border"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-subtle" />}
        </button>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border hover:border-teal-500/50 text-xs text-text-primary transition-colors"
          >
            <div className="w-5 h-5 rounded-lg bg-teal-500/20 text-teal-500 flex items-center justify-center font-semibold text-[10px]">
              {user?.role?.slice(0, 1).toUpperCase()}
            </div>
            <span className="capitalize font-medium text-text-secondary">
              {user?.role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-subtle" />
          </button>

          {isRoleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-card border border-border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 border-b border-border mb-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-teal-500" />
                    <span>Switch Role Context</span>
                  </div>
                  <p className="text-[11px] text-text-subtle">Test different permission guards</p>
                </div>

                <div className="space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-surface-elevated flex items-start justify-between group transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium text-text-primary group-hover:text-teal-500">
                          {r.label}
                        </p>
                        <p className="text-[10px] text-text-subtle line-clamp-1">{r.desc}</p>
                      </div>
                      {user?.role === r.role && (
                        <Check className="w-4 h-4 text-teal-500 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-border px-2.5 py-1">
                  <p className="text-[10px] text-text-subtle font-mono truncate">
                    ID: {user?.pseudonym_id}
                  </p>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = '/login';
                    }}
                    className="mt-2 w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
