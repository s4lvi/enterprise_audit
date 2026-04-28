"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { SortableHeader } from "@/components/sortable-header";

export type ChapterRow = {
  id: string;
  name: string;
  notes: string | null;
};

export const chapterColumns: ColumnDef<ChapterRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>State</SortableHeader>,
    cell: ({ row }) => (
      <Link href={`/chapters/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <span className="text-gray-600">{row.original.notes ?? "—"}</span>,
    enableSorting: false,
  },
];
