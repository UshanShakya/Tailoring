import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx('bg-surface border border-border rounded-lg shadow-sm p-6', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
