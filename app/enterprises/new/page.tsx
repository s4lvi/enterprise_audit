import { createClient } from "@/lib/supabase/server";

import { createEnterprise } from "../actions";
import { EnterpriseForm } from "../enterprise-form";

export default async function NewEnterprisePage() {
  const supabase = await createClient();
  const [{ data: chapters }, { data: profiles }, { data: checkItems }] = await Promise.all([
    supabase.from("chapters").select("id, name").order("name"),
    supabase.from("profiles").select("id, display_name, chapter_id").order("display_name"),
    supabase
      .from("enterprise_check_items")
      .select("id, label, description")
      .eq("archived", false)
      .order("sort_order")
      .order("label"),
  ]);

  return (
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">New enterprise</h1>
      <EnterpriseForm
        chapters={chapters ?? []}
        profiles={profiles ?? []}
        checkItems={checkItems ?? []}
        action={createEnterprise}
        submitLabel="Create enterprise"
      />
    </main>
  );
}
