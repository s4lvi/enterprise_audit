import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createCheckItem } from "../actions";
import { CheckItemForm } from "../check-item-form";

export default async function NewCheckItemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: viewer } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin") notFound();

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
        Admin · checklist
      </p>
      <h1 className="mb-6 text-3xl">New checklist item</h1>
      <CheckItemForm action={createCheckItem} submitLabel="Create item" />
    </main>
  );
}
