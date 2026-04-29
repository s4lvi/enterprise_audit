"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkItemFormSchema,
  type CheckItemFormInput,
  type CheckItemFormValues,
} from "@/lib/schemas/check-item";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: CheckItemFormValues } | { ok: false; error: string } {
  const result = checkItemFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function createCheckItem(values: CheckItemFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("enterprise_check_items").insert(parsed.data);
  if (error) return { error: friendlyError(error) };

  revalidatePath("/admin/checklist");
  redirect("/admin/checklist");
}

export async function updateCheckItem(
  id: string,
  values: CheckItemFormInput,
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("enterprise_check_items").update(parsed.data).eq("id", id);
  if (error) return { error: friendlyError(error) };

  revalidatePath("/admin/checklist");
  redirect("/admin/checklist");
}

export async function deleteCheckItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("enterprise_check_items").delete().eq("id", id);
  if (error) return { error: friendlyError(error) };

  revalidatePath("/admin/checklist");
  redirect("/admin/checklist");
}
