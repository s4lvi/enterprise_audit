"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  chapterFormSchema,
  type ChapterFormInput,
  type ChapterFormValues,
} from "@/lib/schemas/chapter";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

/**
 * Server-side authoritative validator. Takes the raw form input shape
 * (strings) and parses to the transformed shape (nulls / numbers).
 * The client form runs the same schema; this re-runs it because we
 * never trust the client.
 */
function parse(
  values: unknown,
): { ok: true; data: ChapterFormValues } | { ok: false; error: string } {
  const result = chapterFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function createChapter(values: ChapterFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("chapters").insert(parsed.data);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/chapters");
  redirect("/chapters");
}

export async function updateChapter(id: string, values: ChapterFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("chapters").update(parsed.data).eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/chapters");
  revalidatePath(`/chapters/${id}`);
  redirect(`/chapters/${id}`);
}

export async function deleteChapter(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("chapters").delete().eq("id", id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/chapters");
  redirect("/chapters");
}
