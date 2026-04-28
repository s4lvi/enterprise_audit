"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { geocodeAddress } from "@/lib/geocoding";
import {
  enterpriseFormSchema,
  type EnterpriseFormInput,
  type EnterpriseFormValues,
} from "@/lib/schemas/enterprise";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: EnterpriseFormValues } | { ok: false; error: string } {
  const result = enterpriseFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

/**
 * Best-effort auto-geocode: if the user supplied an address but didn't
 * also fill in lat/lng manually, look up coordinates so the enterprise
 * shows up on the map. If geocoding fails (timeout, no match, etc),
 * leave coords as-is — the save still succeeds.
 */
async function withGeocoding(data: EnterpriseFormValues): Promise<EnterpriseFormValues> {
  const hasManualCoords = data.lat != null && data.lng != null;
  if (hasManualCoords || !data.location_name) return data;

  const coords = await geocodeAddress(data.location_name);
  if (!coords) return data;

  return { ...data, lat: coords.lat, lng: coords.lng };
}

export async function createEnterprise(values: EnterpriseFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const enriched = await withGeocoding(parsed.data);

  const { error } = await supabase.from("enterprises").insert({ ...enriched, created_by: user.id });

  if (error) return { error: friendlyError(error) };

  revalidatePath("/enterprises");
  redirect("/enterprises");
}

export async function updateEnterprise(
  id: string,
  values: EnterpriseFormInput,
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();

  // For updates, only re-geocode when the form left coords blank but did
  // supply an address. If the user manually set coords, never overwrite.
  const enriched = await withGeocoding(parsed.data);

  const { error } = await supabase.from("enterprises").update(enriched).eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/enterprises");
  revalidatePath(`/enterprises/${id}`);
  redirect(`/enterprises/${id}`);
}

export async function deleteEnterprise(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("enterprises").delete().eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/enterprises");
  redirect("/enterprises");
}
