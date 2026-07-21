import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for server-side admin operations.
 * This bypasses Row Level Security and should ONLY be used in
 * webhook handlers and other trusted server environments.
 *
 * NEVER expose this client to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
