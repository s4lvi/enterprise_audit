import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { enterpriseColumns, type EnterpriseRow } from "./columns";

export default async function EnterprisesPage() {
  const supabase = await createClient();
  const { data: enterprises, error } = await supabase
    .from("enterprises")
    .select("id, name, stage, location_name, chapter:chapters(name)")
    .order("name");

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-5xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  const rows: EnterpriseRow[] = (enterprises ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    stage: e.stage,
    location_name: e.location_name,
    chapter_name: e.chapter?.name ?? null,
  }));

  return (
    <main className="mx-auto mt-8 max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Enterprises</h1>
        <Button asChild>
          <Link href="/enterprises/new">New enterprise</Link>
        </Button>
      </header>

      <DataTable<EnterpriseRow, unknown>
        columns={enterpriseColumns}
        data={rows}
        searchPlaceholder="Search by name, chapter, stage, location…"
        emptyMessage="No enterprises yet."
      />
    </main>
  );
}
