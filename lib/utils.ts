import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS class names intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in cents to a dollar string.
 * @param cents - Price in cents (e.g. 1999 => "$19.99")
 * @param currency - ISO currency code (default: USD)
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  const isZeroDecimal = currency.toUpperCase() === 'JPY' || currency.toUpperCase() === 'KRW';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(amount);
}

/**
 * Format a discount percentage.
 * @param percent - Discount percentage (e.g. 25.5 => "25.5% off")
 * @param options.label - Whether to include the "off" label
 */
export function formatDiscount(
  percent: number,
  options: { label?: boolean } = {}
): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const rounded = Math.round(clamped * 10) / 10;
  const str = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return options.label ? `${str}% off` : `${str}%`;
}

/**
 * Format a date for display.
 * @param date - Date string, number, or Date object
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format a relative time (e.g. "3 days ago", "in 2 hours").
 */
export function formatRelativeTime(date: string | number | Date): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = Date.now();
  const diff = d.getTime() - now;
  const absDiff = Math.abs(diff);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  let duration = absDiff / 1000;
  for (const division of divisions) {
    if (duration < division.amount) {
      const sign = diff < 0 ? -1 : 1;
      return rtf.format(Math.round(sign * duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatDate(d);
}

/**
 * Generate a stable hash for deduplication of deals.
 * Uses SHA-256 for collision resistance.
 */
export async function generateSourceHash(
  title: string,
  retailer: string,
  salePrice: number
): Promise<string> {
  const input = `${title.toLowerCase().trim()}:${retailer.toLowerCase().trim()}:${salePrice}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(await hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

/**
 * Truncate text to a maximum length, adding an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + '…';
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validates that a URL is safe for rendering (http/https only).
 * Rejects javascript:, data:, and other dangerous schemes.
 */
export function safeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}
