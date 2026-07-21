'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ========================================
          HERO SECTION — Full screen, text only
          ======================================== */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#060616]" />

        {/* Animated gradient orbs — background ambiance */}
        <div
          className="absolute top-1/4 -left-32 h-[600px] w-[600px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)',
            transform: `translate(${scrollY * 0.02}px, ${scrollY * 0.08}px)`,
            animation: 'orb1 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[700px] w-[700px] rounded-full opacity-25 blur-[160px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #7B2FFF 0%, transparent 70%)',
            transform: `translate(${-scrollY * 0.03}px, ${scrollY * 0.12}px)`,
            animation: 'orb2 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #00FF88 0%, transparent 70%)',
            animation: 'orb3 16s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-20 right-1/4 h-[250px] w-[250px] rounded-full opacity-15 blur-[80px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)',
            animation: 'orb4 12s ease-in-out infinite',
          }}
        />

        {/* Subtle dot grid — barely visible */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* ——— Hero content (centered) ——— */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <div
            className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 backdrop-blur-md"
            style={{ animation: 'fadeInUp 0.7s ease-out 0.1s both' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF88] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF88]" />
            </span>
            <span className="text-sm font-medium text-white/60">Live deals updating in real-time</span>
          </div>

          {/* Headline */}
          <h1
            className="mb-6 text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.5rem] lg:leading-[1.05]"
            style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
          >
            Deals worth{' '}
            <span className="bg-gradient-to-r from-[#0066FF] via-[#7B2FFF] to-[#00FF88] bg-clip-text text-transparent">
              paying for.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mb-10 max-w-xl text-lg leading-[1.6] text-white/40 sm:text-xl"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.35s both' }}
          >
            Curated shopping deals from major retailers. Real discounts, verified prices, zero clutter.
            Members save an average of <span className="text-[#00FF88] font-medium">$200 per month</span>.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#0066FF] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,102,255,0.2)] transition-all duration-300 hover:bg-[#0052CC] hover:shadow-[0_0_50px_rgba(0,102,255,0.4)]"
            >
              Start 3-Day Free Trial
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              View Pricing
            </Link>
          </div>

          {/* Trust row */}
          <div
            className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/25"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.65s both' }}
          >
            {['No credit card required', 'Cancel anytime', '15+ retailers'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-[#00FF88]/60" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          LIVE DEALS PREVIEW — own section
          ======================================== */}
      <section className="relative overflow-hidden bg-[#08081a] py-20">
        {/* Fade from hero background */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Background ornament */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-5 blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="mb-14 text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0066FF]/60">Live Now</div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
              Today&apos;s top deals
            </h2>
          </div>

          {/* Deal cards row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              { retailer: 'Amazon', title: 'AirPods Pro 2', price: '$189', old: '$249', discount: '-25%', color: '#0066FF' },
              { retailer: 'Best Buy', title: 'Sony WH-1000XM5', price: '$298', old: '$399', discount: '-33%', color: '#F5A623' },
              { retailer: 'Target', title: 'iPad Air M2', price: '$499', old: '$599', discount: '-17%', color: '#00FF88' },
              { retailer: 'Walmart', title: 'Dyson V15', price: '$599', old: '$749', discount: '-20%', color: '#FF4444' },
              { retailer: 'Nordstrom', title: 'Nike Air Max', price: '$89', old: '$149', discount: '-40%', color: '#7B2FFF' },
            ].map((deal, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                {/* Color accent bar */}
                <div className="absolute left-0 top-0 h-full w-[2px]" style={{ background: deal.color, opacity: 0.7 }} />
                <div className="pl-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/25">{deal.retailer}</div>
                  <div className="mt-1.5 truncate text-sm font-medium text-white/80">{deal.title}</div>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-base font-bold text-white">{deal.price}</span>
                    <span className="text-xs text-white/25 line-through">{deal.old}</span>
                  </div>
                  <div className="mt-1.5 text-xs font-bold" style={{ color: '#00FF88' }}>{deal.discount}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA under deals */}
          <div className="mt-10 text-center">
            <Link href="/deals" className="text-sm font-medium text-white/40 transition-colors hover:text-white/70">
              View all 500+ deals →
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          STATS BAR
          ======================================== */}
      <section className="relative border-y border-white/[0.04] bg-[#060616]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-16 sm:grid-cols-4">
          {[
            { value: '$200+', label: 'Avg. monthly savings' },
            { value: '500+', label: 'Deals at any time' },
            { value: '15+', label: 'Major retailers' },
            { value: '0', label: 'Ads, ever' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-mono text-4xl font-bold text-white lg:text-5xl">{stat.value}</div>
              <div className="mt-2 text-sm text-white/25">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================
          HOW IT WORKS
          ======================================== */}
      <section className="relative overflow-hidden bg-[#060616] py-28">
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.05] blur-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2
            className="mb-4 text-center text-4xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
          >
            How it works
          </h2>
          <p className="mx-auto mb-16 max-w-md text-center text-white/30">
            Start saving in under 60 seconds. No complicated setup.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { num: '01', title: 'Sign up', desc: 'Create your account in 30 seconds. Start your 3-day free trial — no credit card required.', color: '#0066FF', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { num: '02', title: 'Browse deals', desc: 'Search and filter hundreds of curated deals from major retailers. Save your favorites.', color: '#7B2FFF', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { num: '03', title: 'Save money', desc: 'Click through to the retailer and checkout. The membership pays for itself in one purchase.', color: '#00FF88', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((step) => (
              <div
                key={step.num}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${step.color}12`, color: step.color }}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                  </svg>
                </div>
                <div className="mb-3 font-mono text-xs font-medium" style={{ color: step.color }}>{step.num}</div>
                <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/35">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURED DEALS — detailed grid
          ======================================== */}
      <section className="relative overflow-hidden bg-[#08081a] py-28">
        <div
          className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full opacity-10 blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7B2FFF, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <h2
            className="mb-4 text-center text-4xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
          >
            Featured deals
          </h2>
          <p className="mx-auto mb-16 max-w-md text-center text-white/30">
            Hand-picked savings updated daily. No bloat, no filler.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { retailer: 'Amazon', title: 'AirPods Pro 2', price: '$189', old: '$249', discount: '-25%', color: '#0066FF' },
              { retailer: 'Best Buy', title: 'Sony WH-1000XM5', price: '$298', old: '$399', discount: '-33%', color: '#F5A623' },
              { retailer: 'Target', title: 'iPad Air M2', price: '$499', old: '$599', discount: '-17%', color: '#00FF88' },
              { retailer: 'Walmart', title: 'Dyson V15 Detect', price: '$599', old: '$749', discount: '-20%', color: '#FF4444' },
              { retailer: 'Nordstrom', title: 'Nike Air Max 90', price: '$89', old: '$149', discount: '-40%', color: '#7B2FFF' },
              { retailer: 'Costco', title: 'LG OLED 65"', price: '$999', old: '$1,499', discount: '-33%', color: '#0066FF' },
            ].map((deal, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="absolute left-0 top-0 h-full w-[3px] opacity-0 transition-opacity group-hover:opacity-100" style={{ background: deal.color }} />
                <div className="p-6">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/20">{deal.retailer}</div>
                  <h3 className="mb-4 text-lg font-semibold text-white">{deal.title}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">{deal.price}</div>
                      <div className="text-sm text-white/25 line-through">{deal.old}</div>
                    </div>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-bold" style={{ background: `${deal.color}12`, color: deal.color }}>
                      {deal.discount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          CTA SECTION
          ======================================== */}
      <section className="relative overflow-hidden bg-[#060616] py-32">
        <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full opacity-10 blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }} />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-[0.07] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #7B2FFF, transparent 70%)' }} />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2
            className="mb-6 text-4xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
          >
            Stop scrolling.{' '}
            <span className="bg-gradient-to-r from-[#0066FF] to-[#00FF88] bg-clip-text text-transparent">
              Start saving.
            </span>
          </h2>
          <p className="mx-auto mb-10 max-w-md text-lg text-white/35">
            Join DealVault today. Your first 3 days are free. No credit card needed.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#0066FF] px-10 py-5 text-base font-semibold text-white shadow-[0_0_40px_rgba(0,102,255,0.2)] transition-all duration-300 hover:bg-[#0052CC] hover:shadow-[0_0_60px_rgba(0,102,255,0.4)]"
          >
            Get Started Free
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="border-t border-white/[0.04] bg-[#060616] py-10">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-white/15">
          <p>© {new Date().getFullYear()} DealVault — Deals worth paying for.</p>
        </div>
      </footer>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.1); }
          66% { transform: translate(30px, -40px) scale(0.9); }
        }
        @keyframes orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-30px, 10px) scale(0.95); }
        }
        @keyframes orb4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 30px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
