import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createScheduledAudit } from "../actions";
import { ScheduledAuditForm } from "../scheduled-audit-form";

export default async function NewScheduledAuditPage() {
  const supabase = await createClient();

  // Page is gated to staff (auditor + admin) — RLS would reject inserts
  // anyway, but it's friendlier to hide the form.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: viewer } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin" && viewer?.role !== "auditor") notFound();

  const [{ data: chapters }, { data: profiles }] = await Promise.all([
    supabase.from("chapters").select("id, name").order("name"),
    supabase.from("profiles").select("id, display_name, role").order("display_name"),
  ]);

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Schedule</p>
      <h1 className="mb-6 text-3xl">New scheduled audit</h1>
      <ScheduledAuditForm
        chapters={chapters ?? []}
        assignees={profiles ?? []}
        defaultValues={{ assigned_to: user.id }}
        action={createScheduledAudit}
        submitLabel="Schedule audit"
      />
    </main>
  );
}
