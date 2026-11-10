/**
 * Format numeric amount into INR currency string (e.g. ₹1,250.00)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format ISO date string into readable Indian standard format (e.g. 10 Nov 2026, 06:45 PM)
 */
export function formatDateTime(isoString: string | null): string {
  if (!isoString) return 'No Expiry';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Generate a simulated Razorpay short URL
 */
export function generateShortUrl(id: string): string {
  const hash = id.replace('plink_', '').slice(0, 8);
  return `https://rzp.io/l/${hash}`;
}
