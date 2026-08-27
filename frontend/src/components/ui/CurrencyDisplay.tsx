import React from 'react';
import { formatCurrency } from '../../lib/currency';

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, className = '' }) => {
  return <span className={className}>{formatCurrency(amount)}</span>;
};
