import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AuditsPage() {
  const supabase = await createClient();
  const { data: audits, error } = await supabase
    .from("audits")
    .select(
      "id, audited_on, feasibility_score, progress_score, capability_score, enterprise:enterprises(id, name), auditor:profiles!auditor_id(id, display_name)",
    )
    .order("audited_on", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-5xl p-6">
        <p className="text-red-600">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-8 max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audits</h1>
        <Button asChild>
          <Link href="/audits/new">New audit</Link>
        </Button>
      </header>

      {audits.length === 0 ? (
        <p className="text-gray-600">No audits yet.</p>
      ) : (
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Enterprise</th>
                <th className="p-3">Auditor</th>
                <th className="p-3 text-center">Feas</th>
                <th className="p-3 text-center">Prog</th>
                <th className="p-3 text-center">Cap</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/audits/${a.id}`} className="font-medium hover:underline">
                      {a.audited_on}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{a.enterprise?.name ?? "—"}</td>
                  <td className="p-3 text-gray-600">{a.auditor?.display_name ?? "—"}</td>
                  <td className="p-3 text-center">{a.feasibility_score}</td>
                  <td className="p-3 text-center">{a.progress_score}</td>
                  <td className="p-3 text-center">{a.capability_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
