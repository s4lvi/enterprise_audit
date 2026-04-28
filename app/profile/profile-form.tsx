"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSelfFormSchema, type ProfileSelfFormInput } from "@/lib/schemas/profile";

import { updateOwnProfile } from "./actions";

export function ProfileSelfForm({ defaultValues }: { defaultValues: ProfileSelfFormInput }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProfileSelfFormInput>({
    resolver: standardSchemaResolver(profileSelfFormSchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit(() => {
    const values = form.getValues();
    startTransition(async () => {
      const result = await updateOwnProfile(values);
      if (result?.error) form.setError("root", { message: result.error });
    });
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input {...form.register("display_name")} />
        {errors.display_name?.message ? (
          <p className="text-sm text-brand-danger">{errors.display_name.message}</p>
        ) : null}
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
