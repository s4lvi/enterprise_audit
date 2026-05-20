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

/** Map the form's discriminated target onto the two nullable DB columns. */
function targetColumns(data: AuditFormValues): {
  enterprise_id: string | null;
  chapter_id: string | null;
} {
  return data.target_kind === "chapter"
    ? { enterprise_id: null, chapter_id: data.target_id }
    : { enterprise_id: data.target_id, chapter_id: null };
}

/** Drop the form-only discriminator fields before passing to the DB. */
function stripTarget(data: AuditFormValues): Omit<AuditFormValues, "target_kind" | "target_id"> {
  const { target_kind, target_id, ...rest } = data;
  void target_kind;
  void target_id;
  return rest;
}

function revalidateTarget(data: AuditFormValues) {
  if (data.target_kind === "chapter") {
    revalidatePath(`/chapters/${data.target_id}`);
  } else {
    revalidatePath(`/enterprises/${data.target_id}`);
  }
}

export async function createAudit(values: AuditFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const scalar = stripTarget(parsed.data);
  const cols = targetColumns(parsed.data);

  const { error, data } = await supabase
    .from("audits")
    .insert({ ...scalar, ...cols, auditor_id: user.id })
    .select("id")
    .single();

  if (error) return { error: friendlyError(error) };

  revalidatePath("/audits");
  revalidateTarget(parsed.data);
  redirect(`/audits/${data.id}`);
}

export async function updateAudit(id: string, values: AuditFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const scalar = stripTarget(parsed.data);
  const cols = targetColumns(parsed.data);

  const { error } = await supabase
    .from("audits")
    .update({ ...scalar, ...cols })
    .eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/audits");
  revalidatePath(`/audits/${id}`);
  revalidateTarget(parsed.data);
  redirect(`/audits/${id}`);
}

export async function deleteAudit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("audits").delete().eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/audits");
  redirect("/audits");
}
