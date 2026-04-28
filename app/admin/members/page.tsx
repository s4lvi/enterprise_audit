import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
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

  const [{ data: profiles }, { data: chapters }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, role, chapter_id").order("display_name"),
    supabase.from("chapters").select("id, name").order("name"),
  ]);

  const chapterMap = new Map((chapters ?? []).map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto mt-8 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Admin</p>
        <h1 className="text-3xl">Members</h1>
        <p className="mt-2 text-sm tracking-wide text-white/60">
          Anyone who has signed in via magic link appears here. Assign their chapter and role.
        </p>
      </header>

      <div className="card-cut overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="border-b border-white/10">
              <th className="p-3 text-left text-xs font-bold tracking-widest text-white/50 uppercase">
                Name
              </th>
              <th className="p-3 text-left text-xs font-bold tracking-widest text-white/50 uppercase">
                Role
              </th>
              <th className="p-3 text-left text-xs font-bold tracking-widest text-white/50 uppercase">
                Chapter
              </th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 font-medium">{p.display_name}</td>
                <td className="p-3 text-white/70">{p.role}</td>
                <td className="p-3 text-white/70">
                  {p.chapter_id ? (chapterMap.get(p.chapter_id) ?? "—") : "—"}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/members/${p.id}`}
                    className="text-xs font-bold tracking-widest text-brand-primary uppercase hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
