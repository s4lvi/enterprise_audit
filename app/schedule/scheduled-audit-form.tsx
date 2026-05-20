"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  scheduledAuditFormSchema,
  type ScheduledAuditFormInput,
} from "@/lib/schemas/scheduled-audit";

import type { ActionResult } from "./actions";

export type EnterpriseOption = { id: string; name: string; chapter_id: string };

type Props = {
  chapters: Array<{ id: string; name: string }>;
  assignees: Array<{ id: string; display_name: string; role: string }>;
  enterprises: EnterpriseOption[];
  defaultValues?: Partial<ScheduledAuditFormInput>;
  action: (values: ScheduledAuditFormInput) => Promise<ActionResult>;
  submitLabel?: string;
};

const NONE = "__none__";

const empty: ScheduledAuditFormInput = {
  scheduled_at: "",
  chapter_id: "",
  enterprise_id: "",
  assigned_to: "",
  notes: "",
};

export function ScheduledAuditForm({
  chapters,
  assignees,
  enterprises,
  defaultValues,
  action,
  submitLabel = "Save",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ScheduledAuditFormInput>({
    resolver: standardSchemaResolver(scheduledAuditFormSchema),
    defaultValues: { ...empty, ...defaultValues },
  });

  const chapterId = useWatch({ control: form.control, name: "chapter_id" });
  const enterprisesForChapter = useMemo(
    () => enterprises.filter((e) => e.chapter_id === chapterId),
    [enterprises, chapterId],
  );

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
        <Label>When</Label>
        <Input type="datetime-local" {...form.register("scheduled_at")} />
        {errors.scheduled_at?.message ? (
          <p className="text-sm text-brand-danger">{errors.scheduled_at.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Chapter</Label>
        <Controller
          control={form.control}
          name="chapter_id"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                // Reset enterprise selection when chapter changes — the
                // previously-picked enterprise probably isn't in the new
                // chapter.
                form.setValue("enterprise_id", "", { shouldDirty: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a chapter…" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.chapter_id?.message ? (
          <p className="text-sm text-brand-danger">{errors.chapter_id.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Target enterprise (leave blank for chapter audit)</Label>
        <Controller
          control={form.control}
          name="enterprise_id"
          render={({ field }) => (
            <Select
              value={field.value === "" ? NONE : field.value}
              onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
              disabled={!chapterId}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Chapter audit —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— Chapter audit —</SelectItem>
                {enterprisesForChapter.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.enterprise_id?.message ? (
          <p className="text-sm text-brand-danger">{errors.enterprise_id.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Assigned to</Label>
        <Controller
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a member…" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.display_name}
                    <span className="ml-2 text-xs text-white/40">{a.role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.assigned_to?.message ? (
          <p className="text-sm text-brand-danger">{errors.assigned_to.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea rows={3} {...form.register("notes")} />
      </div>

      {errors.root?.message ? (
        <p className="text-sm text-brand-danger">{errors.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
