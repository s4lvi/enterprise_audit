"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { deleteChapter } from "./actions";

export function DeleteChapterButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (
          !window.confirm(
            `Delete chapter "${name}"? Enterprises in this chapter will block the delete.`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          await deleteChapter(id);
        });
      }}
    >
      {isPending ? "Deleting..." : "Delete chapter"}
    </Button>
  );
}
