import React from 'react';
import { AnomalyCategory } from '../../types';
import { getCategoryMeta, cn } from '../../lib/utils';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface AnomalyBadgeProps {
  category?: AnomalyCategory;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  className?: string;
}

export const AnomalyBadge: React.FC<AnomalyBadgeProps> = ({
  category,
  score,
  size = 'md',
  showScore = true,
  className,
}) => {
  const meta = getCategoryMeta(category);

  const getIcon = () => {
    switch (category) {
      case 'normal':
        return <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />;
      case 'review_recommended':
        return <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />;
      case 'high_anomaly_signal':
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />;
      default:
        return null;
    }
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border transition-colors',
        meta.badgeBg,
        sizeStyles[size],
        className
      )}
      title={meta.description}
    >
      {getIcon()}
      <span>{meta.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[11px] opacity-80 border-l border-current/20 pl-1.5">
          {score.toFixed(0)}/100
        </span>
      )}
    </div>
  );
};
