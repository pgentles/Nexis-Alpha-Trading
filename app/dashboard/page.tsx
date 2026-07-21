'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setEmail(user.email || '');
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-text-muted">Welcome, {email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/deals"
          className="rounded-xl border border-border bg-surface p-6 hover:border-accent/30 transition-colors"
        >
          <h3 className="font-semibold text-text">Browse Deals</h3>
          <p className="mt-1 text-sm text-text-muted">View all available deals</p>
        </Link>
        <Link
          href="/saved"
          className="rounded-xl border border-border bg-surface p-6 hover:border-accent/30 transition-colors"
        >
          <h3 className="font-semibold text-text">Saved Deals</h3>
          <p className="mt-1 text-sm text-text-muted">Your saved deals</p>
        </Link>
      </div>
    </div>
  );
}
