import { createClient } from "@/lib/supabase/server";

import { createAudit } from "../actions";
import { AuditForm, type ChapterOption, type EnterpriseOption } from "../audit-form";

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ enterprise_id?: string; chapter_id?: string }>;
}) {
  const { enterprise_id, chapter_id } = await searchParams;
  const supabase = await createClient();
  const [{ data: enterprises }, { data: chapters }] = await Promise.all([
    supabase.from("enterprises").select("id, name, chapter:chapters(name)").order("name"),
    supabase.from("chapters").select("id, name").order("name"),
  ]);

  const enterpriseOptions: EnterpriseOption[] = (enterprises ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    chapter_name: e.chapter?.name ?? null,
  }));
  const chapterOptions: ChapterOption[] = chapters ?? [];

  const prefill = chapter_id
    ? { target_kind: "chapter" as const, target_id: chapter_id }
    : enterprise_id
      ? { target_kind: "enterprise" as const, target_id: enterprise_id }
      : undefined;

  return (
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">New audit</h1>
      <AuditForm
        enterprises={enterpriseOptions}
        chapters={chapterOptions}
        defaultValues={prefill}
        action={createAudit}
        submitLabel="Save audit"
      />
    </main>
  );
}
