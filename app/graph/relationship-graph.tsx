"use client";

import "@xyflow/react/dist/style.css";

import dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export type GraphNode = {
  id: string;
  name: string;
  chapter: string | null;
  stage: string;
};

export type GraphEdge = {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 84;

// Stage color hints — visualize maturity at a glance.
const STAGE_COLORS: Record<string, string> = {
  idea: "#666666",
  validating: "#ffd600",
  building: "#c11616",
  launched: "#22c55e",
  scaling: "#22c55e",
  paused: "#444444",
};

// Edge type → color, for a quick visual read of relationship variety.
const TYPE_COLORS: Record<string, string> = {
  partner: "#ffd600",
  supplier: "#22c55e",
  customer: "#22c55e",
  competitor: "#c11616",
  parent: "#ffffff",
  spinoff: "#888888",
};

function layout(nodes: GraphNode[], edges: GraphEdge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 100 });

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of edges) {
    g.setEdge(e.from_id, e.to_id);
  }

  dagre.layout(g);

  const positioned: Node[] = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: "enterprise",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { name: n.name, chapter: n.chapter, stage: n.stage },
    };
  });

  const edgeList: Edge[] = edges.map((e) => {
    const color = TYPE_COLORS[e.type] ?? "#ffffff";
    return {
      id: e.id,
      source: e.from_id,
      target: e.to_id,
      label: e.type,
      animated: false,
      style: { stroke: color, strokeWidth: 2 },
      labelStyle: {
        fill: color,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      },
      labelBgPadding: [6, 3],
      labelBgStyle: { fill: "rgba(0,0,0,0.85)" },
      labelBgBorderRadius: 0,
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
    };
  });

  return { nodes: positioned, edges: edgeList };
}

function EnterpriseNode({ data }: NodeProps) {
  const { name, chapter, stage } = data as {
    name: string;
    chapter: string | null;
    stage: string;
  };
  const stageColor = STAGE_COLORS[stage] ?? "#666";
  return (
    <div
      className="card-cut min-w-[200px] border bg-[#0a0a0a] px-3 py-2.5 shadow-sm"
      style={{ borderColor: stageColor }}
    >
      <Handle type="target" position={Position.Left} style={{ background: stageColor }} />
      <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
        {chapter ?? "—"}
      </div>
      <div className="text-sm leading-tight font-black text-white uppercase">{name}</div>
      <div
        className="mt-1 inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase"
        style={{
          background: stageColor,
          color: stage === "validating" ? "#000" : "#fff",
        }}
      >
        {stage}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: stageColor }} />
    </div>
  );
}

const nodeTypes = { enterprise: EnterpriseNode };

export function RelationshipGraph({
  nodes: nodeData,
  edges: edgeData,
  className = "h-[calc(100vh-14rem)]",
  interactive = true,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
  interactive?: boolean;
}) {
  const router = useRouter();
  const { nodes, edges } = useMemo(() => layout(nodeData, edgeData), [nodeData, edgeData]);

  return (
    <div
      className={`relative w-full overflow-hidden border border-white/10 bg-[#050505] ${className}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        zoomOnScroll={interactive}
        panOnDrag={interactive}
        onNodeClick={(_, node) => router.push(`/enterprises/${node.id}`)}
      >
        <Background color="#1a1a1a" gap={24} />
        {interactive ? <Controls showInteractive={false} /> : null}
      </ReactFlow>
    </div>
  );
}
