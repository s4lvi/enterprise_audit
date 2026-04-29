import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const TILES: Array<{ href: string; label: string; description: string }> = [
  {
    href: "/admin/members",
    label: "Members",
    description: "Assign roles and chapter membership.",
  },
  {
    href: "/admin/checklist",
    label: "Checklist",
    description: "Configure the per-enterprise checklist (registered, insured, etc).",
  },
  {
    href: "/admin/audit-log",
    label: "Audit log",
    description: "Sensitive writes (deletes, role changes).",
  },
];

export default async function AdminPage() {
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

  const [{ count: memberCount }, { count: itemCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("enterprise_check_items").select("*", { count: "exact", head: true }),
  ]);

  return (
    <main className="mx-auto mt-8 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Admin</p>
        <h1 className="text-4xl">Dashboard</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card-cut block border border-white/10 bg-brand-surface p-5 transition-colors hover:border-brand-primary/50"
          >
            <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
              {t.label}
            </p>
            <p className="mt-1 text-2xl text-white">
              {t.href === "/admin/members" ? (memberCount ?? 0) : null}
              {t.href === "/admin/checklist" ? (itemCount ?? 0) : null}
              {t.href === "/admin/audit-log" ? "→" : null}
            </p>
            <p className="mt-3 text-xs text-white/60">{t.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
