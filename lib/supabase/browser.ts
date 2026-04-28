import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/db/database.types";

/**
 * Supabase client for use in Client Components ("use client").
 *
 * @supabase/ssr's createBrowserClient memoizes internally, so calling this
 * many times returns the same underlying client.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
