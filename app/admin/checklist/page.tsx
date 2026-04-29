import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function ChecklistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: viewer } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin") notFound();

  const { data: items } = await supabase
    .from("enterprise_check_items")
    .select("id, label, description, sort_order, archived")
    .order("sort_order")
    .order("label");

  return (
    <main className="mx-auto mt-8 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
            Admin
          </p>
          <h1 className="text-3xl">Checklist items</h1>
          <p className="mt-2 text-sm tracking-wide text-white/60">
            Configurable checks shown on every enterprise edit form.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/checklist/new">New item</Link>
        </Button>
      </header>

      <div className="card-cut overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="border-b border-white/10">
              <th className="p-3 text-left text-xs font-bold tracking-widest text-white/50 uppercase">
                Order
              </th>
              <th className="p-3 text-left text-xs font-bold tracking-widest text-white/50 uppercase">
                Label
              </th>
              <th className="p-3 text-left text-xs font-bold tracking-widest text-white/50 uppercase">
                Status
              </th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(items ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/50">
                  No checklist items yet. Add one to populate the enterprise form.
                </td>
              </tr>
            ) : (
              (items ?? []).map((it) => (
                <tr key={it.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-3 font-mono text-xs text-white/60">{it.sort_order}</td>
                  <td className="p-3">
                    <p className="font-medium">{it.label}</p>
                    {it.description ? (
                      <p className="text-xs text-white/50">{it.description}</p>
                    ) : null}
                  </td>
                  <td className="p-3 text-[10px] font-bold tracking-widest text-white/50 uppercase">
                    {it.archived ? "Archived" : "Active"}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/checklist/${it.id}`}
                      className="text-xs font-bold tracking-widest text-brand-primary uppercase hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
