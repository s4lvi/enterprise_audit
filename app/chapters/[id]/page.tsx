import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateChapter } from "../actions";
import { ChapterForm } from "../chapter-form";
import { DeleteChapterButton } from "../delete-chapter-button";

export default async function ChapterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("id, name, city, region, lat, lng, notes")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-red-600">{error.message}</p>
      </main>
    );
  }
  if (!chapter) notFound();

  return (
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">{chapter.name}</h1>

      <ChapterForm
        defaultValues={{
          name: chapter.name,
          city: chapter.city ?? "",
          region: chapter.region ?? "",
          lat: chapter.lat == null ? "" : String(chapter.lat),
          lng: chapter.lng == null ? "" : String(chapter.lng),
          notes: chapter.notes ?? "",
        }}
        action={updateChapter.bind(null, id)}
        submitLabel="Save changes"
      />

      <hr className="my-8" />
      <DeleteChapterButton id={id} name={chapter.name} />
    </main>
  );
}
