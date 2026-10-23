import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface-elevated/80 border border-border rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder:text-text-subtle transition-colors focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-subtle">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
