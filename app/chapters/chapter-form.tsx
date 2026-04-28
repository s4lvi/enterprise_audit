"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chapterFormSchema, type ChapterFormInput } from "@/lib/schemas/chapter";

import type { ActionResult } from "./actions";

type Props = {
  defaultValues?: Partial<ChapterFormInput>;
  /** Server action — pass `createChapter` or `updateChapter.bind(null, id)`. */
  action: (values: ChapterFormInput) => Promise<ActionResult>;
  submitLabel?: string;
};

const empty: ChapterFormInput = {
  name: "",
  notes: "",
};

export function ChapterForm({ defaultValues, action, submitLabel = "Save" }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ChapterFormInput>({
    resolver: standardSchemaResolver(chapterFormSchema),
    defaultValues: { ...empty, ...defaultValues },
  });

  const handleSubmit = form.handleSubmit(() => {
    // Pass the raw form input (strings) to the action; it re-parses
    // server-side via the same schema. Don't use the resolver-transformed
    // values here — the schema's transform shape isn't reusable as input
    // to a second parse.
    const values = form.getValues();
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) {
        form.setError("root", { message: result.error });
      }
    });
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="State" required error={errors.name?.message}>
        <Input placeholder="e.g. Illinois" {...form.register("name")} />
      </Field>

      <Field label="Notes" error={errors.notes?.message}>
        <Textarea rows={4} {...form.register("notes")} />
      </Field>

      {errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
