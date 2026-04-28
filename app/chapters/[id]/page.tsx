import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function ChapterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: chapter, error }, { data: members }, { data: enterprises }, viewer] =
    await Promise.all([
      supabase.from("chapters").select("id, name, notes").eq("id", id).maybeSingle(),
      supabase
        .from("profiles")
        .select("id, display_name, role")
        .eq("chapter_id", id)
        .order("display_name"),
      supabase
        .from("enterprises")
        .select("id, name, stage, location_name")
        .eq("chapter_id", id)
        .order("name"),
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
  if (!chapter) notFound();

  const canEdit = viewer?.role === "admin";

  return (
    <main className="mx-auto mt-8 w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
            Chapter
          </p>
          <h1 className="text-4xl">{chapter.name}</h1>
        </div>
        {canEdit ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/chapters/${id}/edit`}>Edit</Link>
          </Button>
        ) : null}
      </header>

      {chapter.notes ? (
        <section className="mb-8">
          <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Notes</p>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-white/80">{chapter.notes}</p>
        </section>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card-cut border border-white/10 bg-brand-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base">Enterprises</h2>
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
              {(enterprises ?? []).length}
            </span>
          </div>
          {enterprises && enterprises.length > 0 ? (
            <ul className="space-y-2">
              {enterprises.map((e) => (
                <li
                  key={e.id}
                  className="flex items-baseline justify-between border-b border-white/5 pb-2 last:border-b-0"
                >
                  <Link
                    href={`/enterprises/${e.id}`}
                    className="text-sm font-bold uppercase hover:text-brand-primary"
                  >
                    {e.name}
                  </Link>
                  <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
                    {e.stage}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">No enterprises yet.</p>
          )}
        </section>

        <section className="card-cut border border-white/10 bg-brand-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base">Members</h2>
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
              {(members ?? []).length}
            </span>
          </div>
          {members && members.length > 0 ? (
            <ul className="space-y-2">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-baseline justify-between border-b border-white/5 pb-2 last:border-b-0"
                >
                  <span className="text-sm">{m.display_name}</span>
                  <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">
              No members assigned yet.
              {canEdit ? (
                <>
                  {" "}
                  <Link href="/admin/members" className="text-brand-primary hover:underline">
                    Manage members →
                  </Link>
                </>
              ) : null}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
