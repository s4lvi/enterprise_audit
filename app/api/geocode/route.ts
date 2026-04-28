import { NextResponse, type NextRequest } from "next/server";

import { geocodeAddress } from "@/lib/geocoding";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/geocode?q=<location>
 *
 * Authenticated proxy to Nominatim, used by the enterprise form to give
 * live feedback ("found / not found") as the user types. Auth-gated so
 * we don't run an open geocoding proxy.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ result: null }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 3) {
    return NextResponse.json({ result: null });
  }

  const result = await geocodeAddress(q);
  return NextResponse.json({ result });
}
