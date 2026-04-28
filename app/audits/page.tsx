import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { auditColumns, type AuditRow } from "./columns";

export default async function AuditsPage() {
  const supabase = await createClient();
  const { data: audits, error } = await supabase
    .from("audits")
    .select(
      "id, audited_on, feasibility_score, progress_score, capability_score, enterprise:enterprises(id, name), auditor:profiles!auditor_id(display_name)",
    )
    .order("audited_on", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-5xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  const rows: AuditRow[] = (audits ?? []).map((a) => ({
    id: a.id,
    audited_on: a.audited_on,
    feasibility_score: a.feasibility_score,
    progress_score: a.progress_score,
    capability_score: a.capability_score,
    enterprise_id: a.enterprise?.id ?? null,
    enterprise_name: a.enterprise?.name ?? null,
    auditor_name: a.auditor?.display_name ?? null,
  }));

  return (
    <main className="mx-auto mt-8 max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audits</h1>
        <Button asChild>
          <Link href="/audits/new">New audit</Link>
        </Button>
      </header>

      <DataTable<AuditRow, unknown>
        columns={auditColumns}
        data={rows}
        searchPlaceholder="Search by enterprise, auditor, date…"
        emptyMessage="No audits yet."
      />
    </main>
  );
}
