import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error.message);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
