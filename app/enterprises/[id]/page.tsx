import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateEnterprise } from "../actions";
import { DeleteEnterpriseButton } from "../delete-enterprise-button";
import { EnterpriseForm } from "../enterprise-form";

export default async function EnterpriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: enterprise, error }, { data: chapters }, { data: profiles }] = await Promise.all([
    supabase
      .from("enterprises")
      .select(
        "id, chapter_id, name, outline, category, stage, location_name, lat, lng, contact_member_id, contact_external, business_plan_url, business_plan_notes, resources_needed, founded_on",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("chapters").select("id, name").order("name"),
    supabase.from("profiles").select("id, display_name, chapter_id").order("display_name"),
  ]);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-red-600">{error.message}</p>
      </main>
    );
  }
  if (!enterprise) notFound();

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
      <DeleteEnterpriseButton id={id} name={enterprise.name} />
    </main>
  );
}
