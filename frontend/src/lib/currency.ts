/**
 * Formats a monetary amount into Nepalese Rupees (NPR / Rs.).
 * Example: 1750 -> "Rs. 1,750.00"
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rs. 0.00';
  }

  const num = Number(amount);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `Rs. ${formatted}`;
}
