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
  enterpriseFormSchema,
  enterpriseStages,
  type EnterpriseFormInput,
} from "@/lib/schemas/enterprise";

import type { ActionResult } from "./actions";

export type ChapterOption = { id: string; name: string };
export type ProfileOption = { id: string; display_name: string; chapter_id: string | null };

type Props = {
  chapters: ChapterOption[];
  profiles: ProfileOption[];
  defaultValues?: Partial<EnterpriseFormInput>;
  action: (values: EnterpriseFormInput) => Promise<ActionResult>;
  submitLabel?: string;
};

const NONE = "__none__";

const empty: EnterpriseFormInput = {
  chapter_id: "",
  name: "",
  outline: "",
  category: "",
  stage: "idea",
  location_name: "",
  lat: "",
  lng: "",
  contact_member_id: "",
  contact_external: "",
  business_plan_url: "",
  business_plan_notes: "",
  resources_needed: "",
  founded_on: "",
};

export function EnterpriseForm({
  chapters,
  profiles,
  defaultValues,
  action,
  submitLabel = "Save",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<EnterpriseFormInput>({
    resolver: standardSchemaResolver(enterpriseFormSchema),
    defaultValues: { ...empty, ...defaultValues },
  });

  const selectedChapter = useWatch({ control: form.control, name: "chapter_id" });

  const contactOptions = useMemo(
    () => profiles.filter((p) => selectedChapter && p.chapter_id === selectedChapter),
    [profiles, selectedChapter],
  );

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Identity">
        <Field label="Chapter" required error={errors.chapter_id?.message}>
          <Controller
            control={form.control}
            name="chapter_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a state…" />
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
        </Field>

        <Field label="Name" required error={errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>

        <Field label="Stage" required error={errors.stage?.message}>
          <Controller
            control={form.control}
            name="stage"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enterpriseStages.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </Section>

      <Section title="Description">
        <Field label="Outline" error={errors.outline?.message}>
          <Textarea rows={4} {...form.register("outline")} />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <Input placeholder="e.g. food-beverage, services" {...form.register("category")} />
        </Field>
      </Section>

      <Section title="Location">
        <Field label="Location" error={errors.location_name?.message}>
          <Input
            placeholder="Street address, city, or ZIP code"
            {...form.register("location_name")}
          />
        </Field>
      </Section>

      <Section title="Contact">
        <Field
          label={`Member contact${selectedChapter ? "" : " (pick a chapter first)"}`}
          error={errors.contact_member_id?.message}
        >
          <Controller
            control={form.control}
            name="contact_member_id"
            render={({ field }) => (
              <Select
                value={field.value === "" ? NONE : field.value}
                onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                disabled={!selectedChapter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="— None —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— None —</SelectItem>
                  {contactOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="External contact (free text)" error={errors.contact_external?.message}>
          <Input
            placeholder="Name and email/phone for non-member contacts"
            {...form.register("contact_external")}
          />
        </Field>
      </Section>

      <Section title="Business plan">
        <Field label="URL" error={errors.business_plan_url?.message}>
          <Input type="url" placeholder="https://…" {...form.register("business_plan_url")} />
        </Field>
        <Field label="Notes" error={errors.business_plan_notes?.message}>
          <Textarea rows={4} {...form.register("business_plan_notes")} />
        </Field>
      </Section>

      <Section title="Other">
        <Field label="Resources needed" error={errors.resources_needed?.message}>
          <Textarea rows={3} {...form.register("resources_needed")} />
        </Field>
        <Field label="Founded on" error={errors.founded_on?.message}>
          <Input type="date" {...form.register("founded_on")} />
        </Field>
      </Section>

      {errors.root?.message ? (
        <p className="text-sm text-brand-danger">{errors.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-white/50">
        {title}
      </h2>
      {children}
    </div>
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
