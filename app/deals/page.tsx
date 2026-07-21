'use client';

import { useState, useEffect } from 'react';
import DealGrid from '@/components/deals/DealGrid';
import DealFilter from '@/components/deals/DealFilter';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

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

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'All', sort: 'discount', search: '' });
  const supabase = createClient();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      let query = supabase
        .from('deals')
        .select('*, retailers(name)')
        .eq('is_active', true);

      if (filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,retailers.name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching deals:', error);
        setLoading(false);
        return;
      }

      const fetched: Deal[] = (data || []).map((d) => ({
        id: d.id,
        title: d.title,
        retailer: d.retailers?.name || 'Unknown',
        category: d.source || 'Other',
        original_price: parseFloat(d.original_price) || 0,
        sale_price: parseFloat(d.sale_price) || 0,
        discount_percent: parseFloat(d.discount_percent) || 0,
        image_url: d.image_url,
        product_url: d.product_url || '#',
        is_featured: d.is_featured || false,
        expires_at: d.ends_at,
      }));

      // Apply sorting client-side
      switch (filters.sort) {
        case 'discount':
          fetched.sort((a, b) => b.discount_percent - a.discount_percent);
          break;
        case 'price_low':
          fetched.sort((a, b) => a.sale_price - b.sale_price);
          break;
        case 'price_high':
          fetched.sort((a, b) => b.sale_price - a.sale_price);
          break;
        case 'newest':
          fetched.sort((a, b) => b.id.localeCompare(a.id));
          break;
        case 'expiring':
          fetched.sort((a, b) => {
            if (!a.expires_at) return 1;
            if (!b.expires_at) return -1;
            return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
          });
          break;
      }

      setDeals(fetched);
      setLoading(false);
    };

    fetchDeals();
  }, [filters, supabase]);

  const handleFilterChange = (newFilters: { category: string; sort: string; search: string }) => {
    setFilters(newFilters);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Deals Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {loading ? 'Loading...' : `${deals.length} deals available`}
          </p>
        </div>
        <Link
          href="/saved"
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-muted hover:text-text hover:border-accent/30"
        >
          Saved Deals
        </Link>
      </div>

      {/* Filter */}
      <DealFilter onFilterChange={handleFilterChange} />

      {/* Deals grid */}
      <DealGrid deals={deals} loading={loading} />
    </div>
  );
}
