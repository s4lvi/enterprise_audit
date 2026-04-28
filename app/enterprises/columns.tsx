"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { SortableHeader } from "@/components/sortable-header";

export type EnterpriseRow = {
  id: string;
  name: string;
  stage: string;
  location_name: string | null;
  chapter_name: string | null;
};

export const enterpriseColumns: ColumnDef<EnterpriseRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <Link href={`/enterprises/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "chapter_name",
    header: ({ column }) => <SortableHeader column={column}>Chapter</SortableHeader>,
    cell: ({ row }) => <span className="text-gray-600">{row.original.chapter_name ?? "—"}</span>,
  },
  {
    accessorKey: "stage",
    header: ({ column }) => <SortableHeader column={column}>Stage</SortableHeader>,
    cell: ({ row }) => <span className="text-gray-600">{row.original.stage}</span>,
  },
  {
    accessorKey: "location_name",
    header: "Location",
    cell: ({ row }) => <span className="text-gray-600">{row.original.location_name ?? "—"}</span>,
    enableSorting: false,
  },
];
