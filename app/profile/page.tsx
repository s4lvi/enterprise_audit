import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ProfileSelfForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, chapter_id")
    .eq("id", user.id)
    .single();

  const { data: chapter } = profile?.chapter_id
    ? await supabase.from("chapters").select("name").eq("id", profile.chapter_id).single()
    : { data: null };

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Profile</p>
      <h1 className="mb-2 text-3xl">{profile?.display_name ?? user.email}</h1>
      <p className="mb-8 text-xs tracking-widest text-white/40 uppercase">
        {profile?.role ?? "—"}
        {chapter?.name ? ` · ${chapter.name}` : ""}
        <span className="mx-2 text-white/20">·</span>
        {user.email}
      </p>

      <ProfileSelfForm defaultValues={{ display_name: profile?.display_name ?? "" }} />

      <p className="mt-6 text-xs tracking-wide text-white/40">
        Role and chapter are admin-managed. Ask an admin to change them.
      </p>
    </main>
  );
}
