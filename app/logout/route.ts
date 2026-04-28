import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * POST /logout
 *
 * Form-driven logout. Signing out clears the auth cookies via the SSR
 * cookie adapter, then we redirect to /login. We use 303 (See Other) so
 * the browser follows up with GET (per HTTP semantics for POST-redirect-GET).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
