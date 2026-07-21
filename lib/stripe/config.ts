import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
});

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export function getURL(path: string = '') {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production'
      ? 'https://nexus-alpha-trading.app'
      : 'http://localhost:3000');
  return `${base.replace(/\/$/, '')}${path}`;
}

/**
 * Plans we offer, keyed by Stripe price ID (populated at runtime from env or DB).
 */
export const PLANS = {
  MONTHLY: {
    name: 'Monthly',
    description: 'Full access to Nexus Alpha Trading, billed monthly',
    interval: 'month' as const,
  },
  YEARLY: {
    name: 'Yearly',
    description: 'Full access to Nexus Alpha Trading, billed annually (save 20%)',
    interval: 'year' as const,
  },
} as const;
