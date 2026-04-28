"use server";

import { revalidatePath } from "next/cache";

import {
  relationshipFormSchema,
  type RelationshipFormInput,
  type RelationshipFormValues,
} from "@/lib/schemas/relationship";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: RelationshipFormValues } | { ok: false; error: string } {
  const result = relationshipFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function createRelationship(values: RelationshipFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("enterprise_relationships")
    .insert({ ...parsed.data, created_by: user.id });

  if (error) return { error: friendlyError(error) };

  revalidatePath("/graph");
  revalidatePath(`/enterprises/${parsed.data.from_id}`);
  revalidatePath(`/enterprises/${parsed.data.to_id}`);
  return { error: null };
}

export async function deleteRelationship(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("enterprise_relationships").delete().eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/graph");
  return { error: null };
}
