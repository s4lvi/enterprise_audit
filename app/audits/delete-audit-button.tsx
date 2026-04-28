"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteAudit } from "./actions";

export function DeleteAuditButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Delete this audit? This cannot be undone.")) return;
        startTransition(async () => {
          await deleteAudit(id);
        });
      }}
    >
      {isPending ? "Deleting..." : "Delete audit"}
    </Button>
  );
}
