import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Activity,
  FileCode,
  FlaskConical,
  Award,
  Settings,
  LayoutDashboard,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

export const IconRail: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role || 'instructor';

  interface NavItem {
    label: string;
    path: string;
    icon: any;
    badge?: string;
    count?: string;
  }

  const instructorNav: NavItem[] = [
    { label: 'Ask VerifyIQ', path: '/ask', icon: Search, badge: 'AI' },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Sessions', path: '/sessions', icon: Activity, count: '40' },
    { label: 'Assessments', path: '/assessments', icon: FileCode },
    { label: 'ML Lab', path: '/ml-lab', icon: FlaskConical, badge: 'v3.1' },
    { label: 'Credentials', path: '/credentials', icon: Award },
    { label: 'Audit Logs', path: '/audit-logs', icon: Layers },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const candidateNav: NavItem[] = [
    { label: 'My Dashboard', path: '/candidate', icon: LayoutDashboard },
    { label: 'Active Assessment', path: '/candidate/assessment', icon: FileCode },
    { label: 'My Credentials', path: '/candidate/credentials', icon: Award },
  ];

  const navItems = role === 'candidate' ? candidateNav : instructorNav;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 bg-surface border-r border-border flex flex-col justify-between py-4 transition-all duration-300 ease-in-out select-none',
        isHovered ? 'w-60 shadow-2xl' : 'w-16'
      )}
    >
      {/* Brand Logo */}
      <div className="px-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-teal-500" />
        </div>
        {isHovered && (
          <div className="overflow-hidden transition-opacity duration-200">
            <span className="font-semibold text-text-primary text-sm tracking-tight flex items-center gap-1.5">
              Verify<span className="text-teal-500">IQ</span>
            </span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block font-mono">
              Telemetry AI
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 mt-8 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                  isActive
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {isHovered ? (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30 font-mono">
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-text-muted font-mono">
                      {item.count}
                    </span>
                  )}
                </div>
              ) : (
                // Mini Tooltip when collapsed
                <div className="absolute left-16 ml-2 px-2.5 py-1 bg-surface-card border border-border rounded-lg text-xs font-medium text-text-primary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Expand Hint / Rail Footer */}
      <div className="px-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3 px-1.5 py-1 text-text-subtle text-xs">
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform duration-300 shrink-0',
              isHovered && 'rotate-180'
            )}
          />
          {isHovered && (
            <span className="text-[11px] text-text-muted truncate">
              {role === 'instructor' ? 'Examiner Console' : 'Candidate Portal'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
