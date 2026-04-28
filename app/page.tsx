import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { count: chaptersCount },
    { count: enterprisesCount },
    { count: auditsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name, role, chapter_id").eq("id", user.id).single(),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("enterprises").select("*", { count: "exact", head: true }),
    supabase.from("audits").select("*", { count: "exact", head: true }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold tracking-widest text-brand-primary uppercase">
          Welcome
        </p>
        <h1 className="text-4xl leading-tight md:text-5xl">
          {profile?.display_name ?? user.email}
        </h1>
        <p className="mt-2 text-xs tracking-widest text-white/40 uppercase">
          {profile?.role ?? "unknown"}
          {profile?.chapter_id == null ? " · No chapter assigned" : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard href="/chapters" label="Chapters" count={chaptersCount ?? 0} />
        <StatCard href="/enterprises" label="Enterprises" count={enterprisesCount ?? 0} />
        <StatCard href="/audits" label="Audits" count={auditsCount ?? 0} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ViewCard
          href="/map"
          label="Map"
          description="Geographic view of all enterprises with coordinates."
        />
        <ViewCard
          href="/graph"
          label="Graph"
          description="Relationships across enterprises (partner, supplier, parent, etc)."
        />
      </div>
    </main>
  );
}

function StatCard({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link
      href={href}
      className="card-cut group block border border-white/10 bg-brand-surface p-5 transition-colors hover:border-brand-primary/50"
    >
      <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{label}</p>
      <p className="mt-2 text-4xl text-white">{count}</p>
      <p className="mt-3 text-[10px] font-bold tracking-widest text-brand-primary uppercase opacity-0 transition-opacity group-hover:opacity-100">
        View →
      </p>
    </Link>
  );
}

function ViewCard({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card-cut group block border border-white/10 bg-brand-surface p-5 transition-colors hover:border-brand-primary/50"
    >
      <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{label}</p>
      <p className="mt-2 text-base font-bold text-white normal-case">{description}</p>
    </Link>
  );
}
