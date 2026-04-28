"use client";

import "@xyflow/react/dist/style.css";

import dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  Handle,
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

const NODE_WIDTH = 200;
const NODE_HEIGHT = 64;

function layout(nodes: GraphNode[], edges: GraphEdge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 30, ranksep: 80 });

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

  const edgeList: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.from_id,
    target: e.to_id,
    label: e.type,
    labelBgPadding: [4, 2],
    labelBgStyle: { fill: "#f3f4f6" },
    labelBgBorderRadius: 4,
  }));

  return { nodes: positioned, edges: edgeList };
}

function EnterpriseNode({ data }: NodeProps) {
  const { name, chapter, stage } = data as { name: string; chapter: string | null; stage: string };
  return (
    <div className="rounded border border-gray-300 bg-white p-2 text-xs shadow-sm">
      <Handle type="target" position={Position.Left} />
      <div className="font-semibold leading-tight">{name}</div>
      <div className="text-gray-500">
        {chapter ?? "—"} · {stage}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { enterprise: EnterpriseNode };

export function RelationshipGraph({
  nodes: nodeData,
  edges: edgeData,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}) {
  const router = useRouter();
  const { nodes, edges } = useMemo(() => layout(nodeData, edgeData), [nodeData, edgeData]);

  return (
    <div className="h-[calc(100vh-12rem)] w-full overflow-hidden rounded border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => router.push(`/enterprises/${node.id}`)}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
