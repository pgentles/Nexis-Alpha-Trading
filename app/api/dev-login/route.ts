import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev-only endpoint: creates a mock authenticated session for testing.
 * Only works when NODE_ENV !== 'production' (never in prod).
 *
 * Usage: POST /api/dev-login from the login page
 * Returns: { email: 'test@nexus-alpha-trading.dev', role: 'user' }
 *
 * This bypasses Supabase auth entirely for local development/testing.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const testUser = {
    id: 'dev-test-user-001',
    email: 'test@nexus-alpha-trading.dev',
    role: 'user',
    created_at: new Date().toISOString(),
  };

  const response = NextResponse.json({ user: testUser });

  // Set a mock session cookie (dev only)
  response.cookies.set('dev-auth', JSON.stringify(testUser), {
    httpOnly: false, // Readable client-side for dev mode
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}

// Also support GET for easy browser testing
export async function GET(request: NextRequest) {
  return POST(request);
}
