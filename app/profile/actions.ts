"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  profileSelfFormSchema,
  type ProfileSelfFormInput,
  type ProfileSelfFormValues,
} from "@/lib/schemas/profile";
import { friendlyError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string | null };

function parse(
  values: unknown,
): { ok: true; data: ProfileSelfFormValues } | { ok: false; error: string } {
  const result = profileSelfFormSchema.safeParse(values);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

export async function updateOwnProfile(values: ProfileSelfFormInput): Promise<ActionResult> {
  const parsed = parse(values);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);

  if (error) return { error: friendlyError(error) };

  revalidatePath("/profile");
  revalidatePath("/");
  redirect("/");
}
