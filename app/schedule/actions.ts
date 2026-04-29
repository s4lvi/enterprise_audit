"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  scheduledAuditFormSchema,
  type ScheduledAuditFormInput,
  type ScheduledAuditFormValues,
} from "@/lib/schemas/scheduled-audit";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: ScheduledAuditFormValues } | { ok: false; error: string } {
  const result = scheduledAuditFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function createScheduledAudit(values: ScheduledAuditFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row, error } = await supabase
    .from("scheduled_audits")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single();
  if (error || !row) return { error: friendlyError(error!) };

  revalidatePath("/schedule");
  redirect(`/schedule/${row.id}`);
}

export async function updateScheduledAudit(
  id: string,
  values: ScheduledAuditFormInput,
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("scheduled_audits").update(parsed.data).eq("id", id);
  if (error) return { error: friendlyError(error) };

  revalidatePath("/schedule");
  revalidatePath(`/schedule/${id}`);
  redirect(`/schedule/${id}`);
}

export async function deleteScheduledAudit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("scheduled_audits").delete().eq("id", id);
  if (error) return { error: friendlyError(error) };

  revalidatePath("/schedule");
  redirect("/schedule");
}
