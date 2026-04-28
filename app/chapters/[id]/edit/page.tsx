import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateChapter } from "../../actions";
import { ChapterForm } from "../../chapter-form";
import { DeleteChapterButton } from "../../delete-chapter-button";

export default async function ChapterEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("id, name, notes")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }
  if (!chapter) notFound();

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
        Editing chapter
      </p>
      <h1 className="mb-6 text-3xl">{chapter.name}</h1>

      <ChapterForm
        defaultValues={{ name: chapter.name, notes: chapter.notes ?? "" }}
        action={updateChapter.bind(null, id)}
        submitLabel="Save changes"
      />

      <hr className="my-8 border-white/10" />
      <DeleteChapterButton id={id} name={chapter.name} />
    </main>
  );
}
