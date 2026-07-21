'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkRateLimit } from '@/lib/rate-limit';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting: 10 login attempts per minute
    const ip = typeof window !== 'undefined' ? '' : '';
    const { allowed } = checkRateLimit(
      `login:${email}`,
      10,
      60 * 1000
    );
    if (!allowed) {
      setError('Too many login attempts. Please try again later.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/deals');
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Sign in to access your deals.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-urgent/30 bg-urgent/10 p-3 text-sm text-urgent">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-all hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-border bg-surface py-3 text-sm font-medium text-text transition-colors hover:border-accent/30"
        >
          Continue with Google
        </button>

        {/* Dev mode test login */}
        {process.env.NODE_ENV !== 'production' && (
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/dev-login', { method: 'POST' });
                if (res.ok) {
                  // Small delay to ensure cookie is set before redirect
                  setTimeout(() => {
                    window.location.href = '/deals';
                  }, 100);
                } else {
                  setError('Dev login failed. Please try again.');
                }
              } catch (err) {
                setError('Connection error. Please try again.');
              }
            }}
            className="mt-3 w-full rounded-lg border border-dashed border-gold/40 bg-gold/5 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
          >
            🧪 Dev Test Login
          </button>
        )}

        <p className="mt-6 text-center text-xs text-text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
