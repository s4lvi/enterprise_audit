import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { updateEnterprise } from "../actions";
import { DeleteEnterpriseButton } from "../delete-enterprise-button";
import { EnterpriseForm } from "../enterprise-form";
import { RelationshipsSection, type RelationshipRow } from "./relationships-section";

export default async function EnterpriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: enterprise, error },
    { data: chapters },
    { data: profiles },
    { data: audits },
    { data: enterpriseOptions },
    { data: outgoing },
    { data: incoming },
    viewer,
  ] = await Promise.all([
    supabase
      .from("enterprises")
      .select(
        "id, chapter_id, name, outline, category, stage, location_name, lat, lng, contact_member_id, contact_external, business_plan_url, business_plan_notes, resources_needed, founded_on",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("chapters").select("id, name").order("name"),
    supabase.from("profiles").select("id, display_name, chapter_id").order("display_name"),
    supabase
      .from("audits")
      .select(
        "id, audited_on, feasibility_score, progress_score, capability_score, auditor:profiles!auditor_id(display_name)",
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
  if (!enterprise) notFound();

  const isAdmin = viewer?.role === "admin";
  const canEditRelationships = viewer?.role === "admin" || viewer?.role === "auditor";

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
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">{enterprise.name}</h1>

      <EnterpriseForm
        chapters={chapters ?? []}
        profiles={profiles ?? []}
        defaultValues={{
          chapter_id: enterprise.chapter_id,
          name: enterprise.name,
          outline: enterprise.outline ?? "",
          category: enterprise.category ?? "",
          stage: enterprise.stage,
          location_name: enterprise.location_name ?? "",
          lat: enterprise.lat == null ? "" : String(enterprise.lat),
          lng: enterprise.lng == null ? "" : String(enterprise.lng),
          contact_member_id: enterprise.contact_member_id ?? "",
          contact_external: enterprise.contact_external ?? "",
          business_plan_url: enterprise.business_plan_url ?? "",
          business_plan_notes: enterprise.business_plan_notes ?? "",
          resources_needed: enterprise.resources_needed ?? "",
          founded_on: enterprise.founded_on ?? "",
        }}
        action={updateEnterprise.bind(null, id)}
        submitLabel="Save changes"
      />

      <hr className="my-8" />

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Audits</h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/audits/new?enterprise_id=${id}`}>Add audit</Link>
          </Button>
        </div>
        {audits && audits.length > 0 ? (
          <div className="overflow-hidden rounded border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/50">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Auditor</th>
                  <th className="p-2 text-center">Feas</th>
                  <th className="p-2 text-center">Prog</th>
                  <th className="p-2 text-center">Cap</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-white/5">
                    <td className="p-2">
                      <Link href={`/audits/${a.id}`} className="hover:underline">
                        {a.audited_on}
                      </Link>
                    </td>
                    <td className="p-2 text-white/60">{a.auditor?.display_name ?? "—"}</td>
                    <td className="p-2 text-center">{a.feasibility_score}</td>
                    <td className="p-2 text-center">{a.progress_score}</td>
                    <td className="p-2 text-center">{a.capability_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-white/60">No audits yet for this enterprise.</p>
        )}
      </section>

      <hr className="my-8" />

      <RelationshipsSection
        enterpriseId={id}
        enterpriseOptions={enterpriseOptions ?? []}
        relationships={relationshipRows}
        canEdit={canEditRelationships}
      />

      {isAdmin ? (
        <>
          <hr className="my-8" />
          <DeleteEnterpriseButton id={id} name={enterprise.name} />
        </>
      ) : null}
    </main>
  );
}
