"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chapterFormSchema, type ChapterFormInput } from "@/lib/schemas/chapter";

import type { ActionResult } from "./actions";

export type CheckItemOption = { id: string; label: string; description: string | null };

type Props = {
  defaultValues?: Partial<ChapterFormInput>;
  checkItems?: CheckItemOption[];
  defaultCheckedIds?: string[];
  /** Server action — pass `createChapter` or `updateChapter.bind(null, id)`. */
  action: (values: ChapterFormInput, checkItemIds: string[]) => Promise<ActionResult>;
  submitLabel?: string;
};

const empty: ChapterFormInput = {
  name: "",
  notes: "",
};

export function ChapterForm({
  defaultValues,
  checkItems = [],
  defaultCheckedIds = [],
  action,
  submitLabel = "Save",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(defaultCheckedIds));
  const toggleCheck = (id: string) =>
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const form = useForm<ChapterFormInput>({
    resolver: standardSchemaResolver(chapterFormSchema),
    defaultValues: { ...empty, ...defaultValues },
  });

  const handleSubmit = form.handleSubmit(() => {
    const values = form.getValues();
    const ids = Array.from(checkedIds);
    startTransition(async () => {
      const result = await action(values, ids);
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

      {checkItems.length > 0 ? (
        <div className="space-y-2 pt-2">
          <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-white/50">
            Checklist
          </h2>
          <p className="text-xs text-white/40">
            Tick what applies. Manage the list at /admin/chapter-checklist.
          </p>
          <ul className="space-y-2">
            {checkItems.map((it) => (
              <li key={it.id}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checkedIds.has(it.id)}
                    onChange={() => toggleCheck(it.id)}
                    className="mt-0.5 size-4 accent-brand-primary"
                  />
                  <span>
                    <span className="text-sm">{it.label}</span>
                    {it.description ? (
                      <span className="block text-xs text-white/50">{it.description}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {errors.root?.message ? (
        <p className="text-sm text-brand-danger">{errors.root.message}</p>
      ) : null}

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
        {required ? <span className="text-brand-danger"> *</span> : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
    </div>
  );
}
