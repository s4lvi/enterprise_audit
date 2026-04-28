"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auditFormSchema, type AuditFormInput, type AuditFormValues } from "@/lib/schemas/audit";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: AuditFormValues } | { ok: false; error: string } {
  const result = auditFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function createAudit(values: AuditFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const enterpriseId = parsed.data.enterprise_id;
  const { error, data } = await supabase
    .from("audits")
    .insert({ ...parsed.data, auditor_id: user.id })
    .select("id")
    .single();

  if (error) return { error: friendlyError(error) };

  revalidatePath("/audits");
  revalidatePath(`/enterprises/${enterpriseId}`);
  redirect(`/audits/${data.id}`);
}

export async function updateAudit(id: string, values: AuditFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("audits").update(parsed.data).eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/audits");
  revalidatePath(`/audits/${id}`);
  revalidatePath(`/enterprises/${parsed.data.enterprise_id}`);
  redirect(`/audits/${id}`);
}

export async function deleteAudit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("audits").delete().eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/audits");
  redirect("/audits");
}
