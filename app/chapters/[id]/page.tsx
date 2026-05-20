import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function ChapterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: chapter, error },
    { data: members },
    { data: enterprises },
    { data: audits },
    { data: checks },
    viewer,
  ] = await Promise.all([
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
    supabase
      .from("audits")
      .select(
        "id, audited_on, feasibility_score, progress_score, capability_score, summary, auditor:profiles!auditor_id(display_name)",
      )
      .eq("chapter_id", id)
      .order("audited_on", { ascending: false }),
    supabase
      .from("chapter_checks")
      .select("check_item:chapter_check_items(id, label, description, sort_order)")
      .eq("chapter_id", id),
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

  const isAdmin = viewer?.role === "admin";
  const isStaff = viewer?.role === "admin" || viewer?.role === "auditor";

  const checkedItems = (checks ?? [])
    .filter(
      (c): c is typeof c & { check_item: NonNullable<typeof c.check_item> } => c.check_item != null,
    )
    .map((c) => c.check_item)
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));

  return (
    <main className="mx-auto mt-8 w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
            Chapter
          </p>
          <h1 className="text-4xl">{chapter.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/chapters/${id}/edit`}>Edit</Link>
            </Button>
          ) : null}
          {isStaff ? (
            <Button asChild size="sm">
              <Link href={`/audits/new?chapter_id=${id}`}>Add audit</Link>
            </Button>
          ) : null}
        </div>
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
              {isAdmin ? (
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

        <section className="card-cut border border-white/10 bg-brand-surface p-5 md:col-span-2">
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

        {checkedItems.length > 0 ? (
          <section className="card-cut border border-white/10 bg-brand-surface p-5 md:col-span-2">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base">Checklist</h2>
              <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                {checkedItems.length}
              </span>
            </div>
            <ul className="space-y-1.5 text-sm">
              {checkedItems.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="mt-1 inline-block size-2 shrink-0 bg-brand-success" />
                  <span>
                    <span className="text-white/90">{c.label}</span>
                    {c.description ? (
                      <span className="block text-xs text-white/50">{c.description}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
