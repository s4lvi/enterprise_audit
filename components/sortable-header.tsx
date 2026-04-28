"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

/**
 * Click-to-sort column header. Use inside a TanStack Table column def:
 *   header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>
 */
export function SortableHeader<TData, TValue>({
  column,
  children,
}: {
  column: Column<TData, TValue>;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="-ml-3 h-7 px-2 text-xs font-semibold uppercase tracking-wide"
    >
      {children}
      <Icon className="ml-1 size-3" />
    </Button>
  );
}
