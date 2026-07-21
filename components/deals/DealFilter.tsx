'use client';

import { useState } from 'react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Garden', 'Gaming', 'Grocery', 'Beauty'];
const SORT_OPTIONS = [
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'expiring', label: 'Expiring Soon' },
];

export default function DealFilter({
  onFilterChange,
}: {
  onFilterChange: (filters: { category: string; sort: string; search: string }) => void;
}) {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('discount');
  const [search, setSearch] = useState('');

  const handleChange = (newCategory: string, newSort: string, newSearch: string) => {
    setCategory(newCategory);
    setSort(newSort);
    setSearch(newSearch);
    onFilterChange({ category: newCategory, sort: newSort, search: newSearch });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => handleChange(category, sort, e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleChange(cat, sort, search)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted hover:text-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Sort by:</span>
        <select
          value={sort}
          onChange={(e) => handleChange(category, e.target.value, search)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-accent focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
