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
  city: "",
  region: "",
  lat: "",
  lng: "",
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
      <Field label="Name" required error={errors.name?.message}>
        <Input {...form.register("name")} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errors.city?.message}>
          <Input {...form.register("city")} />
        </Field>
        <Field label="Region" error={errors.region?.message}>
          <Input {...form.register("region")} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude" error={errors.lat?.message}>
          <Input type="number" step="any" {...form.register("lat")} />
        </Field>
        <Field label="Longitude" error={errors.lng?.message}>
          <Input type="number" step="any" {...form.register("lng")} />
        </Field>
      </div>

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
