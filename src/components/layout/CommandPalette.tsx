import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, FileCode, Cpu, ArrowRight, X } from 'lucide-react';
import { useSessions, useAssessments } from '../../hooks/queries';
import { AnomalyBadge } from '../ui/AnomalyBadge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: sessionsData } = useSessions({ limit: 20 });
  const { data: assessmentsData } = useAssessments();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sessionsList = sessionsData?.sessions || [];
  const assessmentsList = assessmentsData || [];

  const filteredSessions = sessionsList
    .filter(
      (s) =>
        s.id.toLowerCase().includes(query.toLowerCase()) ||
        s.candidate_name?.toLowerCase().includes(query.toLowerCase()) ||
        s.pseudonym_id.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const filteredAssessments = assessmentsList
    .filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const pages = [
    { label: 'Ask VerifyIQ Assistant', path: '/ask', group: 'Navigation' },
    { label: 'Live Sessions Table', path: '/sessions', group: 'Navigation' },
    { label: 'ML Research Lab & Metrics', path: '/ml-lab', group: 'Navigation' },
    { label: 'Verifiable Credentials', path: '/credentials', group: 'Navigation' },
    { label: 'System Retention & Settings', path: '/settings', group: 'Navigation' },
    { label: 'Plans & Pricing', path: '/plans', group: 'Navigation' },
  ].filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search sessions, assessments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-subtle focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="font-mono text-[10px] bg-surface-elevated px-2 py-0.5 rounded border border-border text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Nav Pages */}
          {pages.length > 0 && (
            <div>
              <span className="px-3 py-1 text-[10px] font-semibold tracking-wider text-text-subtle uppercase block">
                Workspace Pages
              </span>
              <div className="mt-1 space-y-0.5">
                {pages.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors group"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-teal-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assessment Challenges */}
          {filteredAssessments.length > 0 && (
            <div>
              <span className="px-3 py-1 text-[10px] font-semibold tracking-wider text-text-subtle uppercase block">
                Assessments
              </span>
              <div className="mt-1 space-y-0.5">
                {filteredAssessments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect('/assessments')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-teal-400" />
                      <span>{a.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-text-subtle uppercase">
                      {a.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Candidate Sessions */}
          {filteredSessions.length > 0 && (
            <div>
              <span className="px-3 py-1 text-[10px] font-semibold tracking-wider text-text-subtle uppercase block">
                Assessment Sessions
              </span>
              <div className="mt-1 space-y-0.5">
                {filteredSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/sessions/${s.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <Activity className="w-3.5 h-3.5 text-text-muted group-hover:text-teal-400" />
                      <span className="text-teal-300 font-semibold">{s.id}</span>
                      <span className="text-text-muted">({s.pseudonym_id})</span>
                    </div>
                    {s.anomaly_score !== undefined && s.category && (
                      <AnomalyBadge score={s.anomaly_score} category={s.category} size="sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pages.length === 0 && filteredAssessments.length === 0 && filteredSessions.length === 0 && (
            <div className="p-8 text-center text-xs text-text-subtle">
              No matching commands or entities found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
