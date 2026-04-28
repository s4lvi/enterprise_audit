import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { updateProfileAsAdmin } from "../actions";
import { ProfileAdminForm } from "../profile-form";

export default async function MemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const [{ data: profile, error }, { data: chapters }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, role, chapter_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("chapters").select("id, name").order("name"),
  ]);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }
  if (!profile) notFound();

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
        Member · admin
      </p>
      <h1 className="mb-6 text-3xl">{profile.display_name}</h1>
      <ProfileAdminForm
        chapters={chapters ?? []}
        defaultValues={{
          display_name: profile.display_name,
          role: profile.role,
          chapter_id: profile.chapter_id ?? "",
        }}
        action={updateProfileAsAdmin.bind(null, id)}
      />
    </main>
  );
}
