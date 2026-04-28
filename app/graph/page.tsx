import { createClient } from "@/lib/supabase/server";

import { RelationshipGraph, type GraphEdge, type GraphNode } from "./relationship-graph";

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
      <main className="mx-auto mt-8 max-w-6xl p-6">
        <p className="text-red-600">{error.message}</p>
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
    <main className="mx-auto mt-8 max-w-6xl p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Graph</h1>
        <p className="text-sm text-gray-500">
          {nodes.length} enterprises · {edges.length} relationship
          {edges.length === 1 ? "" : "s"}
        </p>
      </header>

      <RelationshipGraph nodes={nodes} edges={edges} />

      <p className="mt-3 text-sm text-gray-500">
        Click a node to open its detail page. Add relationships from the &quot;Relationships&quot;
        section on each enterprise.
      </p>
    </main>
  );
}
