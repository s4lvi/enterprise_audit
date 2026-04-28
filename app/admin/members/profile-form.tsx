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
import {
  profileAdminFormSchema,
  userRoles,
  type ProfileAdminFormInput,
} from "@/lib/schemas/profile";

import type { ActionResult } from "./actions";

const NONE = "__none__";

type Props = {
  chapters: Array<{ id: string; name: string }>;
  defaultValues: ProfileAdminFormInput;
  action: (values: ProfileAdminFormInput) => Promise<ActionResult>;
};

export function ProfileAdminForm({ chapters, defaultValues, action }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProfileAdminFormInput>({
    resolver: standardSchemaResolver(profileAdminFormSchema),
    defaultValues,
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
        <Label>Display name</Label>
        <Input {...form.register("display_name")} />
        {errors.display_name?.message ? (
          <p className="text-sm text-brand-danger">{errors.display_name.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Role</Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Chapter</Label>
        <Controller
          control={form.control}
          name="chapter_id"
          render={({ field }) => (
            <Select
              value={field.value === "" || field.value == null ? NONE : field.value}
              onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="— None —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— None —</SelectItem>
                {chapters.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {errors.root?.message ? (
        <p className="text-sm text-brand-danger">{errors.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
