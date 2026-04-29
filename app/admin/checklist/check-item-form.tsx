"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkItemFormSchema, type CheckItemFormInput } from "@/lib/schemas/check-item";

import type { ActionResult } from "./actions";

type Props = {
  defaultValues?: Partial<CheckItemFormInput>;
  action: (values: CheckItemFormInput) => Promise<ActionResult>;
  submitLabel?: string;
};

const empty: CheckItemFormInput = {
  label: "",
  description: "",
  sort_order: "0",
  archived: "",
};

export function CheckItemForm({ defaultValues, action, submitLabel = "Save" }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CheckItemFormInput>({
    resolver: standardSchemaResolver(checkItemFormSchema),
    defaultValues: { ...empty, ...defaultValues },
  });

  const onSubmit = form.handleSubmit(() => {
    const values = form.getValues();
    startTransition(async () => {
      const result = await action(values);
      if (result?.error) form.setError("root", { message: result.error });
    });
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input placeholder="e.g. Has insurance" {...form.register("label")} />
        {errors.label?.message ? (
          <p className="text-sm text-brand-danger">{errors.label.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Description (optional)</Label>
        <Textarea rows={2} {...form.register("description")} />
      </div>

      <div className="space-y-1.5">
        <Label>Sort order</Label>
        <Input type="number" step="1" {...form.register("sort_order")} />
        {errors.sort_order?.message ? (
          <p className="text-sm text-brand-danger">{errors.sort_order.message}</p>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase">
        <input
          type="checkbox"
          className="size-4 accent-brand-primary"
          {...form.register("archived")}
        />
        Archived (hidden from enterprise forms)
      </label>

      {errors.root?.message ? (
        <p className="text-sm text-brand-danger">{errors.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
