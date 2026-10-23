import React from 'react';
import { AssistantSource } from '../../types';
import { cn } from '../../lib/utils';
import { AnomalyBadge } from './AnomalyBadge';
import { ExternalLink, Database, Activity, Cpu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SourceCardProps {
  source: AssistantSource;
  index: number;
  className?: string;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index, className }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (source.type) {
      case 'session':
        return <Activity className="w-3.5 h-3.5 text-teal-400" />;
      case 'model':
        return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      case 'rule':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Database className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const handleClick = () => {
    if (source.type === 'session') {
      navigate(`/sessions/${source.id}`);
    } else if (source.type === 'model') {
      navigate('/ml-lab');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex flex-col justify-between p-3.5 rounded-xl bg-surface border border-border/80 hover:border-teal-500/50 transition-all duration-200 cursor-pointer hover:shadow-sm text-left',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-surface-elevated text-[10px] font-mono font-medium text-text-muted">
              {index + 1}
            </span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              {getIcon()}
              <span className="capitalize text-[11px] font-medium tracking-wide">
                {source.type}
              </span>
            </div>
          </div>
          <ExternalLink className="w-3 h-3 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h4 className="text-xs font-semibold text-text-secondary line-clamp-1 group-hover:text-teal-400 transition-colors">
          {source.label}
        </h4>

        {source.snippet && (
          <p className="mt-1 text-[11px] text-text-muted line-clamp-2 leading-relaxed">
            {source.snippet}
          </p>
        )}
      </div>

      {(source.anomaly_score !== undefined || source.category) && (
        <div className="mt-2.5 pt-2 border-t border-border/60">
          <AnomalyBadge
            category={source.category}
            score={source.anomaly_score}
            size="sm"
          />
        </div>
      )}
    </div>
  );
};
