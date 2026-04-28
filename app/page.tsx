import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { EnterpriseMap, type EnterprisePoint } from "./map/enterprise-map";
import { RelationshipGraph, type GraphEdge, type GraphNode } from "./graph/relationship-graph";

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
    { data: mapEnterprises },
    { data: graphEnterprises },
    { data: relationships },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name, role, chapter_id").eq("id", user.id).single(),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("enterprises").select("*", { count: "exact", head: true }),
    supabase.from("audits").select("*", { count: "exact", head: true }),
    supabase
      .from("enterprises")
      .select("id, name, stage, lat, lng, location_name, chapter:chapters(name)")
      .not("lat", "is", null)
      .not("lng", "is", null),
    supabase.from("enterprises").select("id, name, stage, chapter:chapters(name)").order("name"),
    supabase.from("enterprise_relationships").select("id, from_id, to_id, type"),
  ]);

  const points: EnterprisePoint[] = (mapEnterprises ?? [])
    .filter((e): e is typeof e & { lat: number; lng: number } => e.lat != null && e.lng != null)
    .map((e) => ({
      id: e.id,
      name: e.name,
      stage: e.stage,
      lat: e.lat,
      lng: e.lng,
      location_name: e.location_name,
      chapter_name: e.chapter?.name ?? null,
    }));

  const graphNodes: GraphNode[] = (graphEnterprises ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    stage: e.stage,
    chapter: e.chapter?.name ?? null,
  }));
  const graphEdges: GraphEdge[] = (relationships ?? []).map((r) => ({
    id: r.id,
    from_id: r.from_id,
    to_id: r.to_id,
    type: r.type,
  }));

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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PreviewCard
          href="/map"
          label="Map"
          subtitle={`${points.length} enterprise${points.length === 1 ? "" : "s"} pinned`}
        >
          {points.length > 0 ? (
            <EnterpriseMap points={points} className="h-72" interactive={false} />
          ) : (
            <EmptyPanel
              text="No enterprises with coordinates yet."
              cta="Add lat/lng on an enterprise's edit page"
            />
          )}
        </PreviewCard>

        <PreviewCard
          href="/graph"
          label="Graph"
          subtitle={`${graphEdges.length} relationship${graphEdges.length === 1 ? "" : "s"} across ${graphNodes.length} enterprises`}
        >
          {graphNodes.length > 0 ? (
            <RelationshipGraph
              nodes={graphNodes}
              edges={graphEdges}
              className="h-72"
              interactive={false}
            />
          ) : (
            <EmptyPanel text="No enterprises yet." cta="Add some to see the graph." />
          )}
        </PreviewCard>
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

function PreviewCard({
  href,
  label,
  subtitle,
  children,
}: {
  href: string;
  label: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-cut group block border border-white/10 bg-brand-surface transition-colors hover:border-brand-primary/40">
      <div className="flex items-baseline justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{label}</p>
          <p className="mt-0.5 text-xs tracking-wide text-white/60">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="text-[10px] font-bold tracking-widest text-brand-primary uppercase hover:underline"
        >
          Open →
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyPanel({ text, cta }: { text: string; cta: string }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-1 px-6 text-center">
      <p className="text-sm text-white/60">{text}</p>
      <p className="text-[10px] tracking-widest text-white/30 uppercase">{cta}</p>
    </div>
  );
}
