import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { Sun, Moon, Search, ChevronDown, LogOut } from 'lucide-react';

interface TopBarProps {
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
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

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE API (ACTIVE)</span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors border border-transparent hover:border-border"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-subtle" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border hover:border-teal-500/50 text-xs text-text-primary transition-colors"
          >
            <div className="w-5 h-5 rounded-lg bg-teal-500/20 text-teal-500 flex items-center justify-center font-semibold text-[10px]">
              {user?.role?.slice(0, 1).toUpperCase()}
            </div>
            <span className="capitalize font-medium text-text-secondary">{user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-subtle" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-card border border-border p-2 shadow-2xl z-50">
                <p className="px-2.5 py-1.5 text-[10px] text-text-subtle font-mono truncate">
                  {user?.email}
                </p>
                <p className="px-2.5 pb-2 text-[10px] text-text-subtle font-mono truncate border-b border-border">
                  ID: {user?.pseudonym_id}
                </p>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="mt-2 w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
