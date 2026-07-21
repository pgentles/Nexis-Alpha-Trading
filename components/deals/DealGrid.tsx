'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface Deal {
  id: string;
  title: string;
  retailer: string;
  category: string;
  original_price: number;
  sale_price: number;
  discount_percent: number;
  image_url: string | null;
  product_url: string;
  is_featured: boolean;
  expires_at: string | null;
}

function DealCard({ deal }: { deal: Deal }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`);
  };

  const handleMouseLeave = (_e: React.MouseEvent<HTMLAnchorElement>) => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) translateZ(0)');
  };

  const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date();
  const isUrgent = useMemo(() => {
    if (!deal.expires_at || isExpired) return false;
    return new Date(deal.expires_at).getTime() - now < 24 * 60 * 60 * 1000;
  }, [deal.expires_at, isExpired, now]);

  return (
    <a
      href={deal.product_url && deal.product_url.startsWith('http') ? deal.product_url : '#'}
      target="_blank"
      rel="noopener noreferrer"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.2s ease-out' }}
      className={`group relative block overflow-hidden rounded-xl border bg-surface p-4 transition-shadow duration-300 ${
        deal.is_featured
          ? 'border-gold/40 shadow-[0_0_20px_rgba(245,166,35,0.1)]'
          : 'border-border hover:border-accent/30'
      } ${isExpired ? 'opacity-50' : ''}`}
    >
      {/* Featured badge */}
      {deal.is_featured && (
        <div className="absolute right-3 top-3 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
          Featured
        </div>
      )}

      {/* Urgent badge */}
      {isUrgent && (
        <div className="absolute left-3 top-3 rounded-full bg-urgent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-urgent">
          Ending Soon
        </div>
      )}

      {/* Image placeholder */}
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-bg">
        {deal.image_url ? (
          <img src={deal.image_url} alt={deal.title} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <span className="font-mono text-2xl text-text-muted">{deal.retailer.charAt(0)}</span>
        )}
      </div>

      {/* Category */}
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {deal.category}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-sm font-medium text-text leading-tight">{deal.title}</h3>

      {/* Prices */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold text-accent">
          ${deal.sale_price.toFixed(2)}
        </span>
        {deal.original_price > 0 && (
          <span className="font-mono text-xs text-text-muted line-through">
            ${deal.original_price.toFixed(2)}
          </span>
        )}
        <span className="ml-auto font-mono text-sm font-semibold text-deal">
          -{deal.discount_percent.toFixed(0)}%
        </span>
      </div>

      {/* Retailer */}
      <div className="mt-2 text-[11px] text-text-muted">
        at <span className="text-text">{deal.retailer}</span>
      </div>
    </a>
  );
}

export default function DealGrid({ deals, loading }: { deals: Deal[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-surface p-4">
            <div className="mb-3 h-32 rounded-lg bg-bg" />
            <div className="mb-2 h-4 w-20 rounded bg-bg" />
            <div className="mb-2 h-4 w-3/4 rounded bg-bg" />
            <div className="h-4 w-1/2 rounded bg-bg" />
          </div>
        ))}
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        No deals found. Check back soon!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
