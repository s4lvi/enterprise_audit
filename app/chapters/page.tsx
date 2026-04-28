import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { chapterColumns, type ChapterRow } from "./columns";

export default async function ChaptersPage() {
  const supabase = await createClient();
  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("id, name, notes")
    .order("name");

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-4xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-8 max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chapters</h1>
        <Button asChild>
          <Link href="/chapters/new">New chapter</Link>
        </Button>
      </header>

      <DataTable<ChapterRow, unknown>
        columns={chapterColumns}
        data={chapters ?? []}
        searchPlaceholder="Search chapters…"
        emptyMessage="No chapters yet."
      />
    </main>
  );
}
