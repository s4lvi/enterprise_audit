"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { SortableHeader } from "@/components/sortable-header";

export type AuditRow = {
  id: string;
  audited_on: string;
  feasibility_score: number;
  progress_score: number;
  capability_score: number;
  target_kind: "enterprise" | "chapter";
  target_id: string | null;
  target_name: string | null;
  auditor_name: string | null;
};

export const auditColumns: ColumnDef<AuditRow>[] = [
  {
    accessorKey: "audited_on",
    header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
    cell: ({ row }) => (
      <Link href={`/audits/${row.original.id}`} className="font-medium hover:underline">
        {row.original.audited_on}
      </Link>
    ),
  },
  {
    accessorKey: "target_kind",
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
        {row.original.target_kind}
      </span>
    ),
  },
  {
    accessorKey: "target_name",
    header: ({ column }) => <SortableHeader column={column}>Target</SortableHeader>,
    cell: ({ row }) => {
      const { target_id, target_kind, target_name } = row.original;
      if (!target_id) return <span className="text-white/60">—</span>;
      const href =
        target_kind === "chapter" ? `/chapters/${target_id}` : `/enterprises/${target_id}`;
      return (
        <Link href={href} className="text-white/80 hover:underline">
          {target_name ?? "—"}
        </Link>
      );
    },
  },
  {
    accessorKey: "auditor_name",
    header: ({ column }) => <SortableHeader column={column}>Auditor</SortableHeader>,
    cell: ({ row }) => <span className="text-white/60">{row.original.auditor_name ?? "—"}</span>,
  },
  {
    accessorKey: "feasibility_score",
    header: ({ column }) => <SortableHeader column={column}>Feas</SortableHeader>,
    cell: ({ row }) => <div className="text-center">{row.original.feasibility_score}</div>,
  },
  {
    accessorKey: "progress_score",
    header: ({ column }) => <SortableHeader column={column}>Prog</SortableHeader>,
    cell: ({ row }) => <div className="text-center">{row.original.progress_score}</div>,
  },
  {
    accessorKey: "capability_score",
    header: ({ column }) => <SortableHeader column={column}>Cap</SortableHeader>,
    cell: ({ row }) => <div className="text-center">{row.original.capability_score}</div>,
  },
];
