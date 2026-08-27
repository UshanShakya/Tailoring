import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-surface border border-border text-ink rounded-md px-3 py-2 text-sm placeholder:text-muted/60 transition-colors focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal',
              error && 'border-error focus:border-error focus:ring-error',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-error font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
