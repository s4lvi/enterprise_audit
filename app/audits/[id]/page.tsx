import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateAudit } from "../actions";
import { AuditForm } from "../audit-form";
import { DeleteAuditButton } from "../delete-audit-button";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: audit, error }, { data: enterprises }, viewer] = await Promise.all([
    supabase
      .from("audits")
      .select(
        "id, enterprise_id, audited_on, feasibility_score, progress_score, capability_score, summary, auditor_id, enterprise:enterprises(id, name)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("enterprises").select("id, name").order("name"),
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      return profile;
    }),
  ]);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }
  if (!audit) notFound();

  const isAdmin = viewer?.role === "admin";

  return (
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">
        Audit · {audit.enterprise?.name ?? "(unknown)"}
      </h1>
      <p className="mb-6 text-sm text-white/60">{audit.audited_on}</p>

      <AuditForm
        enterprises={enterprises ?? []}
        defaultValues={{
          enterprise_id: audit.enterprise_id,
          audited_on: audit.audited_on,
          feasibility_score: String(audit.feasibility_score),
          progress_score: String(audit.progress_score),
          capability_score: String(audit.capability_score),
          summary: audit.summary ?? "",
        }}
        action={updateAudit.bind(null, id)}
        submitLabel="Save changes"
      />

      {isAdmin ? (
        <>
          <hr className="my-8" />
          <DeleteAuditButton id={id} />
        </>
      ) : null}
    </main>
  );
}
