"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function createEnterprise(values: EnterpriseFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("enterprises")
    .insert({ ...parsed.data, created_by: user.id });

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
  const { error } = await supabase.from("enterprises").update(parsed.data).eq("id", id);

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
