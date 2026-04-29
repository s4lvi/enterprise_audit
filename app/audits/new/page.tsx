import { createClient } from "@/lib/supabase/server";

import { createAudit } from "../actions";
import { AuditForm, type EnterpriseOption } from "../audit-form";

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ enterprise_id?: string }>;
}) {
  const { enterprise_id } = await searchParams;
  const supabase = await createClient();
  const { data: enterprises } = await supabase
    .from("enterprises")
    .select("id, name, chapter:chapters(name)")
    .order("name");

  const options: EnterpriseOption[] = (enterprises ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    chapter_name: e.chapter?.name ?? null,
  }));

  return (
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">New audit</h1>
      <AuditForm
        enterprises={options}
        defaultValues={enterprise_id ? { enterprise_id } : undefined}
        action={createAudit}
        submitLabel="Save audit"
      />
    </main>
  );
}
