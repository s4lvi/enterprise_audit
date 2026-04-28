import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { RelationshipsSection, type RelationshipRow } from "./relationships-section";

const STAGE_COLORS: Record<string, string> = {
  idea: "#666666",
  validating: "#ffd600",
  building: "#c11616",
  launched: "#22c55e",
  scaling: "#22c55e",
  paused: "#444444",
};

export default async function EnterpriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: enterprise, error },
    { data: audits },
    { data: enterpriseOptions },
    { data: outgoing },
    { data: incoming },
    viewer,
  ] = await Promise.all([
    supabase
      .from("enterprises")
      .select(
        "id, chapter_id, name, outline, category, stage, location_name, lat, lng, contact_external, business_plan_url, business_plan_notes, resources_needed, founded_on, chapter:chapters(id, name), contact:profiles!contact_member_id(id, display_name)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("audits")
      .select(
        "id, audited_on, feasibility_score, progress_score, capability_score, summary, auditor:profiles!auditor_id(display_name)",
      )
      .eq("enterprise_id", id)
      .order("audited_on", { ascending: false }),
    supabase.from("enterprises").select("id, name").order("name"),
    supabase
      .from("enterprise_relationships")
      .select("id, type, notes, to:enterprises!to_id(id, name)")
      .eq("from_id", id),
    supabase
      .from("enterprise_relationships")
      .select("id, type, notes, from:enterprises!from_id(id, name)")
      .eq("to_id", id),
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, chapter_id")
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
  if (!enterprise) notFound();

  const isAdmin = viewer?.role === "admin";
  const isStaff = viewer?.role === "admin" || viewer?.role === "auditor";
  // chapter_exec / member can edit if enterprise is in their chapter
  const canEditEnterprise =
    isStaff || (viewer?.chapter_id && viewer.chapter_id === enterprise.chapter_id);

  const stageColor = STAGE_COLORS[enterprise.stage] ?? "#666";

  const relationshipRows: RelationshipRow[] = [
    ...(outgoing ?? [])
      .filter((r) => r.to)
      .map((r) => ({
        id: r.id,
        type: r.type,
        notes: r.notes,
        outgoing: true as const,
        other: { id: r.to!.id, name: r.to!.name },
      })),
    ...(incoming ?? [])
      .filter((r) => r.from)
      .map((r) => ({
        id: r.id,
        type: r.type,
        notes: r.notes,
        outgoing: false as const,
        other: { id: r.from!.id, name: r.from!.name },
      })),
  ];

  return (
    <main className="mx-auto mt-8 w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
            {enterprise.chapter ? (
              <Link href={`/chapters/${enterprise.chapter.id}`} className="hover:underline">
                {enterprise.chapter.name}
              </Link>
            ) : (
              "Enterprise"
            )}
          </p>
          <h1 className="text-4xl">{enterprise.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
              style={{
                background: stageColor,
                color: enterprise.stage === "validating" ? "#000" : "#fff",
              }}
            >
              {enterprise.stage}
            </span>
            {enterprise.category ? (
              <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                · {enterprise.category}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEditEnterprise ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/enterprises/${id}/edit`}>Edit</Link>
            </Button>
          ) : null}
          {isStaff ? (
            <Button asChild size="sm">
              <Link href={`/audits/new?enterprise_id=${id}`}>Add audit</Link>
            </Button>
          ) : null}
        </div>
      </header>

      {enterprise.outline ? (
        <section className="mb-8 max-w-3xl">
          <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Outline</p>
          <p className="mt-1 text-sm leading-relaxed text-white/80">{enterprise.outline}</p>
        </section>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card-cut border border-white/10 bg-brand-surface p-5">
          <h2 className="mb-3 text-base">Details</h2>
          <DetailRow label="Location" value={enterprise.location_name ?? "—"} />
          <DetailRow label="Founded" value={enterprise.founded_on ?? "—"} />
          <DetailRow
            label="Contact"
            value={enterprise.contact?.display_name ?? enterprise.contact_external ?? "—"}
          />
          <DetailRow
            label="Business plan"
            value={
              enterprise.business_plan_url ? (
                <a
                  href={enterprise.business_plan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  {enterprise.business_plan_url}
                </a>
              ) : (
                "—"
              )
            }
          />
          {enterprise.business_plan_notes ? (
            <DetailRow label="Plan notes" value={enterprise.business_plan_notes} multiline />
          ) : null}
          {enterprise.resources_needed ? (
            <DetailRow label="Resources needed" value={enterprise.resources_needed} multiline />
          ) : null}
        </section>

        <section className="card-cut border border-white/10 bg-brand-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base">Audits</h2>
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
              {(audits ?? []).length}
            </span>
          </div>
          {audits && audits.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {audits.map((a) => (
                <li
                  key={a.id}
                  className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2 last:border-b-0"
                >
                  <Link
                    href={`/audits/${a.id}`}
                    className="font-mono text-xs text-white/60 hover:text-brand-primary"
                  >
                    {a.audited_on}
                  </Link>
                  <span className="grow text-xs text-white/50">
                    {a.auditor?.display_name ?? "—"}
                  </span>
                  <span className="font-mono text-xs">
                    F{a.feasibility_score} · P{a.progress_score} · C{a.capability_score}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">No audits yet.</p>
          )}
        </section>
      </div>

      <hr className="my-8 border-white/10" />

      <RelationshipsSection
        enterpriseId={id}
        enterpriseOptions={enterpriseOptions ?? []}
        relationships={relationshipRows}
        canEdit={isStaff}
      />

      {isAdmin ? null : null}
    </main>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className="border-b border-white/5 py-2 last:border-b-0">
      <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">{label}</p>
      <p
        className={`mt-1 text-sm text-white/80 ${multiline ? "whitespace-pre-line leading-relaxed" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
