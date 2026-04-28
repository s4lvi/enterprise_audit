import { createClient } from "@/lib/supabase/server";

import { RelationshipGraph, type GraphEdge, type GraphNode } from "./relationship-graph";

const STAGE_LEGEND: Array<{ stage: string; color: string }> = [
  { stage: "idea", color: "#666666" },
  { stage: "validating", color: "#ffd600" },
  { stage: "building", color: "#c11616" },
  { stage: "launched", color: "#22c55e" },
  { stage: "scaling", color: "#22c55e" },
  { stage: "paused", color: "#444444" },
];

const TYPE_LEGEND: Array<{ type: string; color: string }> = [
  { type: "partner", color: "#ffd600" },
  { type: "supplier/customer", color: "#22c55e" },
  { type: "competitor", color: "#c11616" },
  { type: "parent", color: "#ffffff" },
  { type: "spinoff", color: "#888888" },
];

export default async function GraphPage() {
  const supabase = await createClient();

  const [{ data: enterprises, error: enterprisesError }, { data: relationships, error: relError }] =
    await Promise.all([
      supabase.from("enterprises").select("id, name, stage, chapter:chapters(name)").order("name"),
      supabase.from("enterprise_relationships").select("id, from_id, to_id, type"),
    ]);

  const error = enterprisesError ?? relError;
  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-7xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  const nodes: GraphNode[] = (enterprises ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    stage: e.stage,
    chapter: e.chapter?.name ?? null,
  }));

  const edges: GraphEdge[] = (relationships ?? []).map((r) => ({
    id: r.id,
    from_id: r.from_id,
    to_id: r.to_id,
    type: r.type,
  }));

  return (
    <main className="mx-auto mt-6 max-w-7xl p-6">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl">Graph</h1>
          <p className="mt-1 text-xs tracking-wider text-white/50 uppercase">
            {nodes.length} enterprises · {edges.length} relationship
            {edges.length === 1 ? "" : "s"} · click a node to open it
          </p>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] tracking-widest uppercase">
        <span className="font-bold text-white/40">Stage</span>
        {STAGE_LEGEND.map((s) => (
          <span key={s.stage} className="flex items-center gap-1.5 text-white/60">
            <span className="size-2.5" style={{ background: s.color }} />
            {s.stage}
          </span>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] tracking-widest uppercase">
        <span className="font-bold text-white/40">Edge</span>
        {TYPE_LEGEND.map((t) => (
          <span key={t.type} className="flex items-center gap-1.5 text-white/60">
            <span className="h-px w-6" style={{ background: t.color, height: 2 }} />
            {t.type}
          </span>
        ))}
      </div>

      {nodes.length === 0 ? (
        <p className="text-white/60">No enterprises to graph yet.</p>
      ) : (
        <RelationshipGraph nodes={nodes} edges={edges} />
      )}

      {edges.length === 0 && nodes.length > 0 ? (
        <p className="mt-3 text-sm text-white/50">
          No relationships yet — nodes will appear scattered. Add relationships from the
          &quot;Relationships&quot; section of each enterprise to see them connect.
        </p>
      ) : null}
    </main>
  );
}
