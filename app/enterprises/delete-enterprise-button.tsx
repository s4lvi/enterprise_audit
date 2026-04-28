"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteEnterprise } from "./actions";

export function DeleteEnterpriseButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete enterprise "${name}"? Audits and members will cascade.`)) {
          return;
        }
        startTransition(async () => {
          await deleteEnterprise(id);
        });
      }}
    >
      {isPending ? "Deleting..." : "Delete enterprise"}
    </Button>
  );
}
