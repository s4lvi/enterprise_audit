import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/db/database.types";

/**
 * Runs on every matching request via the root middleware.ts.
 * - Reads Supabase auth cookies from the incoming request.
 * - Refreshes the session if the access token is expired; writes any new
 *   cookies onto the outgoing response.
 * - Redirects unauthenticated users to /login (preserving the destination
 *   in a ?next= query param).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the request so downstream handlers see the new cookies.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          // Recreate the response so it carries the request's mutated cookies.
          response = NextResponse.next({ request });
          // Set the cookies on the response that goes back to the browser.
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANT: do not put any logic between createServerClient and
  // supabase.auth.getUser(). getUser revalidates the session with Supabase;
  // anything in between can desync the request and the response.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow auth-related routes through unauthenticated.
  const path = request.nextUrl.pathname;
  const isPublicRoute = path.startsWith("/login") || path.startsWith("/auth");

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}
