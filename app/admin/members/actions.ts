"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  profileAdminFormSchema,
  type ProfileAdminFormInput,
  type ProfileAdminFormValues,
} from "@/lib/schemas/profile";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: ProfileAdminFormValues } | { ok: false; error: string } {
  const result = profileAdminFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function updateProfileAsAdmin(
  id: string,
  values: ProfileAdminFormInput,
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  redirect("/admin/members");
}
