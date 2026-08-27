import React from 'react';
import { BackButton } from './BackButton';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  backFallbackRoute?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backFallbackRoute,
  showBack = false,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && <BackButton fallbackRoute={backFallbackRoute} />}
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">{title}</h2>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
