"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null; sent: boolean };

export async function signInWithOtp(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "");

  if (!email) {
    return { error: "Email is required.", sent: false };
  }

  const supabase = await createClient();
  const headerList = await headers();
  // Build the callback URL using the request's origin so it works on
  // localhost, preview, and production without env-specific config.
  const origin = headerList.get("origin") ?? headerList.get("host") ?? "";
  const base = origin.startsWith("http") ? origin : `https://${origin}`;
  const callbackUrl = new URL("/auth/callback", base);
  if (next) callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl.toString() },
  });

  if (error) {
    return { error: error.message, sent: false };
  }

  return { error: null, sent: true };
}
