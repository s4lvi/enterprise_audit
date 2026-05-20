"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  chapterFormSchema,
  type ChapterFormInput,
  type ChapterFormValues,
} from "@/lib/schemas/chapter";
import type { Database } from "@/lib/db/database.types";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActionResult = { error: string | null };

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

async function syncChecks(
  supabase: SupabaseClient<Database>,
  chapterId: string,
  desiredItemIds: string[],
): Promise<{ error: string | null }> {
  const { error: delErr } = await supabase
    .from("chapter_checks")
    .delete()
    .eq("chapter_id", chapterId);
  if (delErr) return { error: friendlyError(delErr) };

  if (desiredItemIds.length === 0) return { error: null };

  const { error: insErr } = await supabase
    .from("chapter_checks")
    .insert(desiredItemIds.map((check_item_id) => ({ chapter_id: chapterId, check_item_id })));
  if (insErr) return { error: friendlyError(insErr) };
  return { error: null };
}

export async function createChapter(
  values: ChapterFormInput,
  checkItemIds: string[] = [],
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("chapters")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !row) return { error: friendlyError(error!) };

  const sync = await syncChecks(supabase, row.id, checkItemIds);
  if (sync.error) return { error: sync.error };

  revalidatePath("/chapters");
  redirect("/chapters");
}

export async function updateChapter(
  id: string,
  values: ChapterFormInput,
  checkItemIds: string[] = [],
): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("chapters").update(parsed.data).eq("id", id);

  if (error) return { error: friendlyError(error) };

  const sync = await syncChecks(supabase, id, checkItemIds);
  if (sync.error) return { error: sync.error };

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
