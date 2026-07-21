'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Monthly',
      price: billing === 'monthly' ? 9.99 : 9.99,
      display: '$9.99',
      period: '/month',
      description: 'Full access, cancel anytime',
      features: [
        'Access to all deals',
        'Search & filter',
        'Unlimited saved deals',
        'Deal alerts via email',
        'Early access to flash deals',
        'Cancel anytime',
      ],
      cta: 'Start Free Trial',
      href: '/signup?plan=monthly',
    },
    {
      name: 'Annual',
      price: 79.99,
      display: '$79.99',
      period: '/year',
      description: 'Save 33% — $6.67/month',
      features: [
        'Everything in Monthly',
        'Save 33% vs monthly',
        'Members-only deals',
        'Priority deal alerts',
        'Exclusive flash deals (30 min early)',
        'Price drop notifications',
      ],
      cta: 'Start Free Trial',
      href: '/signup?plan=annual',
      featured: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Simple pricing
        </h1>
        <p className="mt-3 text-text-muted">
          One membership. Unlimited deals. Cancel anytime.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mb-10 flex items-center justify-center gap-4">
        <button
          onClick={() => setBilling('monthly')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            billing === 'monthly' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('annual')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            billing === 'annual' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
          }`}
        >
          Annual
          <span className="ml-2 text-xs text-deal">Save 33%</span>
        </button>
      </div>

      {/* Plans */}
      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 ${
              plan.featured
                ? 'border-accent bg-surface shadow-[0_0_30px_rgba(0,102,255,0.1)]'
                : 'border-border bg-surface'
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Best Value
              </div>
            )}

            <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
            <p className="mt-1 text-xs text-text-muted">{plan.description}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-text">{plan.display}</span>
              <span className="text-sm text-text-muted">{plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="mt-0.5 text-deal">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                plan.featured
                  ? 'bg-accent text-white hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(0,102,255,0.3)]'
                  : 'border border-border text-text hover:border-accent/30'
              }`}
            >
              {plan.cta}
            </Link>

            <p className="mt-3 text-center text-[10px] text-text-muted">
              3-day free trial • No credit card required
            </p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="mb-6 text-center text-xl font-semibold text-text">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {[
            { q: 'Do I need a credit card to start?', a: 'No. Your 3-day free trial starts immediately. Add a payment method whenever you decide to continue.' },
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click from your account dashboard. You keep access until the end of your billing period.' },
            { q: 'How are deals curated?', a: 'We aggregate deals from major retailers via official APIs and affiliate feeds. Featured deals are manually verified for quality.' },
            { q: 'What makes this different from free deal sites?', a: 'No ads, no clutter, no fake deals. Just curated, verified discounts that actually save you money.' },
          ].map((faq, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4">
              <h4 className="text-sm font-medium text-text">{faq.q}</h4>
              <p className="mt-1 text-sm text-text-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
