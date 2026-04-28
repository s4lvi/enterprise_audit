import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AuditLogPage() {
  const supabase = await createClient();

  // Gate the page client-side too: RLS will return [] for non-admins,
  // but a 404 communicates intent better than a mysterious empty page.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") notFound();

  const { data: entries, error } = await supabase
    .from("audit_log")
    .select("id, occurred_at, actor_id, table_name, operation, row_id")
    .order("occurred_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-5xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  // Look up actor display names in one extra query.
  const actorIds = Array.from(
    new Set((entries ?? []).map((e) => e.actor_id).filter((v): v is string => !!v)),
  );
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", actorIds)
    : { data: [] };
  const actorMap = new Map((actors ?? []).map((a) => [a.id, a.display_name]));

  return (
    <main className="mx-auto mt-8 max-w-5xl p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-white/50">
          Sensitive writes only — deletes on content tables and role/chapter changes on profiles.
          Most recent 200 entries.
        </p>
      </header>

      {entries && entries.length > 0 ? (
        <div className="overflow-hidden rounded border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Table</th>
                <th className="p-3">Op</th>
                <th className="p-3">Row id</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 font-mono text-xs">
                    {new Date(e.occurred_at).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="p-3 text-white/60">
                    {(e.actor_id && actorMap.get(e.actor_id)) ?? "—"}
                  </td>
                  <td className="p-3 text-white/60">{e.table_name}</td>
                  <td className="p-3 text-white/60">{e.operation}</td>
                  <td className="p-3 font-mono text-xs text-white/50">{e.row_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white/60">No entries yet.</p>
      )}
    </main>
  );
}
