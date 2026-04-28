"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

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
import { auditFormSchema, type AuditFormInput } from "@/lib/schemas/audit";

import type { ActionResult } from "./actions";

export type EnterpriseOption = { id: string; name: string };

type Props = {
  enterprises: EnterpriseOption[];
  defaultValues?: Partial<AuditFormInput>;
  action: (values: AuditFormInput) => Promise<ActionResult>;
  submitLabel?: string;
};

const SCORES = ["1", "2", "3", "4", "5"] as const;

const todayIso = () => new Date().toISOString().slice(0, 10);

const empty: AuditFormInput = {
  enterprise_id: "",
  audited_on: todayIso(),
  feasibility_score: "3",
  progress_score: "3",
  capability_score: "3",
  summary: "",
};

export function AuditForm({ enterprises, defaultValues, action, submitLabel = "Save" }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<AuditFormInput>({
    resolver: standardSchemaResolver(auditFormSchema),
    defaultValues: { ...empty, ...defaultValues },
  });

  const handleSubmit = form.handleSubmit(() => {
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
      <Field label="Enterprise" required error={errors.enterprise_id?.message}>
        <Controller
          control={form.control}
          name="enterprise_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an enterprise…" />
              </SelectTrigger>
              <SelectContent>
                {enterprises.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Audited on" required error={errors.audited_on?.message}>
        <Input type="date" {...form.register("audited_on")} />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <ScoreField
          label="Feasibility"
          name="feasibility_score"
          control={form.control}
          error={errors.feasibility_score?.message}
        />
        <ScoreField
          label="Progress"
          name="progress_score"
          control={form.control}
          error={errors.progress_score?.message}
        />
        <ScoreField
          label="Capability"
          name="capability_score"
          control={form.control}
          error={errors.capability_score?.message}
        />
      </div>

      <Field label="Summary" error={errors.summary?.message}>
        <Textarea
          rows={5}
          placeholder="Notes from this visit / assessment…"
          {...form.register("summary")}
        />
      </Field>

      {errors.root?.message ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function ScoreField({
  label,
  name,
  control,
  error,
}: {
  label: string;
  name: "feasibility_score" | "progress_score" | "capability_score";
  control: ReturnType<typeof useForm<AuditFormInput>>["control"];
  error?: string;
}) {
  return (
    <Field label={label} required error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCORES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
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
