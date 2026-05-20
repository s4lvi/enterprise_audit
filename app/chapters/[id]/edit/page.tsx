import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateChapter } from "../../actions";
import { ChapterForm } from "../../chapter-form";
import { DeleteChapterButton } from "../../delete-chapter-button";

export default async function ChapterEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: chapter, error }, { data: checkItems }, { data: existingChecks }] =
    await Promise.all([
      supabase.from("chapters").select("id, name, notes").eq("id", id).maybeSingle(),
      supabase
        .from("chapter_check_items")
        .select("id, label, description")
        .eq("archived", false)
        .order("sort_order")
        .order("label"),
      supabase.from("chapter_checks").select("check_item_id").eq("chapter_id", id),
    ]);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }
  if (!chapter) notFound();

  const defaultCheckedIds = (existingChecks ?? []).map((c) => c.check_item_id);

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
        Editing chapter
      </p>
      <h1 className="mb-6 text-3xl">{chapter.name}</h1>

      <ChapterForm
        defaultValues={{ name: chapter.name, notes: chapter.notes ?? "" }}
        checkItems={checkItems ?? []}
        defaultCheckedIds={defaultCheckedIds}
        action={updateChapter.bind(null, id)}
        submitLabel="Save changes"
      />

      <hr className="my-8 border-white/10" />
      <DeleteChapterButton id={id} name={chapter.name} />
    </main>
  );
}
