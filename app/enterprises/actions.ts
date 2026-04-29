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
import type { Database } from "@/lib/db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

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

async function withGeocoding(data: EnterpriseFormValues): Promise<EnterpriseFormValues> {
  const hasManualCoords = data.lat != null && data.lng != null;
  if (hasManualCoords || !data.location_name) return data;

  const coords = await geocodeAddress(data.location_name);
  if (!coords) return data;

  return { ...data, lat: coords.lat, lng: coords.lng };
}

/**
 * Replace this enterprise's checks with exactly the desired set.
 * Two queries (delete then insert), idempotent.
 */
async function syncChecks(
  supabase: SupabaseClient<Database>,
  enterpriseId: string,
  desiredItemIds: string[],
): Promise<{ error: string | null }> {
  const { error: delErr } = await supabase
    .from("enterprise_checks")
    .delete()
    .eq("enterprise_id", enterpriseId);
  if (delErr) return { error: friendlyError(delErr) };

  if (desiredItemIds.length === 0) return { error: null };

  const { error: insErr } = await supabase.from("enterprise_checks").insert(
    desiredItemIds.map((check_item_id) => ({
      enterprise_id: enterpriseId,
      check_item_id,
    })),
  );
  if (insErr) return { error: friendlyError(insErr) };
  return { error: null };
}

export async function createEnterprise(
  values: EnterpriseFormInput,
  checkItemIds: string[] = [],
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const enriched = await withGeocoding(parsed.data);

  const { data: row, error } = await supabase
    .from("enterprises")
    .insert({ ...enriched, created_by: user.id })
    .select("id")
    .single();
  if (error || !row) return { error: friendlyError(error!) };

  const sync = await syncChecks(supabase, row.id, checkItemIds);
  if (sync.error) return { error: sync.error };

  revalidatePath("/enterprises");
  redirect("/enterprises");
}

export async function updateEnterprise(
  id: string,
  values: EnterpriseFormInput,
  checkItemIds: string[] = [],
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const enriched = await withGeocoding(parsed.data);

  const { error } = await supabase.from("enterprises").update(enriched).eq("id", id);
  if (error) return { error: friendlyError(error) };

  const sync = await syncChecks(supabase, id, checkItemIds);
  if (sync.error) return { error: sync.error };

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
