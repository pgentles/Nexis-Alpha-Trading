import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          request.cookies.getAll();
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and getUser.
  // A simple mistake here can make it very hard to debug issues with users
  // being randomly logged out.

  // Dev mode: bypass auth if dev-auth cookie present (never in production)
  const devAuthCookie = request.cookies.get('dev-auth');
  const isDevMode = process.env.NODE_ENV !== 'production' && devAuthCookie;

  let user = null;
  if (isDevMode && devAuthCookie) {
    try {
      user = JSON.parse(devAuthCookie.value);
    } catch {}
  }

  if (!user) {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser;
  }

  const protectedPaths = ['/dashboard', '/saved', '/deals', '/settings'];
  const isProtectedPath = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const redirectTo = request.nextUrl.pathname;
    // Strict validation: must start with / and NOT start with // (prevent open redirect)
    const allowedPaths = ['/dashboard', '/deals', '/saved', '/pricing', '/settings'];
    if (
      redirectTo.startsWith('/') &&
      !redirectTo.startsWith('//') &&
      allowedPaths.some(p => redirectTo.startsWith(p))
    ) {
      url.searchParams.set('redirect', redirectTo);
    }
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
