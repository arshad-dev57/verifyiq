import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-surface border border-border shadow-sm',
    elevated: 'bg-surface-elevated border border-border/80 shadow-md',
    glass: 'bg-surface/80 backdrop-blur-md border border-border/60 shadow-lg',
    interactive:
      'bg-surface border border-border hover:border-border transition-all duration-200 hover:shadow-md cursor-pointer',
  };

  return (
    <div className={cn('rounded-2xl p-5', variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
