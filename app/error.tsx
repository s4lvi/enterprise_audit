"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-2xl  p-6">
      <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
      <p className="mb-4 text-sm text-white/60">
        {error.message || "An unexpected error occurred."}
        {error.digest ? (
          <span className="ml-2 font-mono text-xs text-white/50">({error.digest})</span>
        ) : null}
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
