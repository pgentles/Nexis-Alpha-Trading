import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/deals';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  // Validate the redirect path is internal (prevent path traversal)
  const normalizePath = (p: string) => {
    try {
      const segments = p.split('/').filter(Boolean);
      const resolved: string[] = [];
      for (const seg of segments) {
        if (seg === '..') resolved.pop();
        else if (seg !== '.' && seg !== '') resolved.push(seg);
      }
      return '/' + resolved.join('/');
    } catch {
      return '/deals';
    }
  };

  const normalized = normalizePath(next);
  const allowedPaths = ['/deals', '/dashboard', '/pricing', '/'];
  const validNext = allowedPaths.some(p => normalized === p || normalized.startsWith(p + '/')) ? normalized : '/deals';

  return NextResponse.redirect(new URL(validNext, request.url));
}
