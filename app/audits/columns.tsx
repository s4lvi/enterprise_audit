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
  enterprise_id: string | null;
  enterprise_name: string | null;
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
    accessorKey: "enterprise_name",
    header: ({ column }) => <SortableHeader column={column}>Enterprise</SortableHeader>,
    cell: ({ row }) =>
      row.original.enterprise_id ? (
        <Link
          href={`/enterprises/${row.original.enterprise_id}`}
          className="text-gray-600 hover:underline"
        >
          {row.original.enterprise_name ?? "—"}
        </Link>
      ) : (
        <span className="text-gray-600">—</span>
      ),
  },
  {
    accessorKey: "auditor_name",
    header: ({ column }) => <SortableHeader column={column}>Auditor</SortableHeader>,
    cell: ({ row }) => <span className="text-gray-600">{row.original.auditor_name ?? "—"}</span>,
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
