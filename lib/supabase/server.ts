import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/db/database.types";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions. Reads the user session from the request's cookies and writes
 * refreshed cookies back via Next's response stream.
 *
 * Important: this is async because `cookies()` is async in Next 15+.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll is called from a Server Component, where cookies are
            // read-only. The session-refresh middleware handles the write
            // path, so this is safe to swallow.
          }
        },
      },
    },
  );
}
