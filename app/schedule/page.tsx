import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { ScheduleCalendar, type CalendarEvent } from "./calendar";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; month?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "calendar" ? "calendar" : "list";

  const supabase = await createClient();
  const { data: scheduled, error } = await supabase
    .from("scheduled_audits")
    .select(
      "id, scheduled_at, notes, chapter:chapters(id, name), assignee:profiles!assigned_to(id, display_name)",
    )
    .order("scheduled_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-5xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  const rows = scheduled ?? [];
  const now = new Date();
  const upcoming = rows.filter((s) => new Date(s.scheduled_at) >= now).reverse();
  const past = rows.filter((s) => new Date(s.scheduled_at) < now);

  // Calendar month — default to current month if not specified.
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const yearMonth = /^\d{4}-\d{2}$/.test(params.month ?? "") ? params.month! : defaultMonth;

  const events: CalendarEvent[] = rows.map((s) => ({
    id: s.id,
    scheduled_at: s.scheduled_at,
    chapter_name: s.chapter?.name ?? null,
    assignee_name: s.assignee?.display_name ?? null,
  }));

  return (
    <main className="mx-auto mt-8 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl">Schedule</h1>
          <p className="mt-1 text-xs tracking-wider text-white/50 uppercase">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle current={view} />
          <Button asChild size="sm">
            <Link href="/schedule/new">Schedule audit</Link>
          </Button>
        </div>
      </header>

      {view === "calendar" ? (
        <ScheduleCalendar yearMonth={yearMonth} events={events} />
      ) : (
        <>
          <Section title="Upcoming" rows={upcoming} emptyText="Nothing scheduled yet." />
          <hr className="my-8 border-white/10" />
          <Section title="Past" rows={past} emptyText="No past audits." dim />
        </>
      )}
    </main>
  );
}

function ViewToggle({ current }: { current: "list" | "calendar" }) {
  const base = "btn-cut px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors";
  return (
    <div className="flex">
      <Link
        href="/schedule?view=list"
        className={`${base} ${
          current === "list" ? "bg-brand-primary text-white" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        List
      </Link>
      <Link
        href="/schedule?view=calendar"
        className={`${base} ${
          current === "calendar" ? "bg-brand-primary text-white" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        Calendar
      </Link>
    </div>
  );
}

type Row = {
  id: string;
  scheduled_at: string;
  notes: string | null;
  chapter: { id: string; name: string } | null;
  assignee: { id: string; display_name: string } | null;
};

function Section({
  title,
  rows,
  emptyText,
  dim,
}: {
  title: string;
  rows: Row[];
  emptyText: string;
  dim?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-base">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-white/50">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/schedule/${r.id}`}
                className={`card-cut block border border-white/10 bg-brand-surface p-4 transition-colors hover:border-brand-primary/50 ${
                  dim ? "opacity-70" : ""
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
                      {r.chapter?.name ?? "—"}
                    </p>
                    <p className="text-base font-bold text-white">{formatWhen(r.scheduled_at)}</p>
                  </div>
                  <p className="text-xs tracking-wide text-white/60">
                    {r.assignee?.display_name ?? "—"}
                  </p>
                </div>
                {r.notes ? (
                  <p className="mt-2 text-xs text-white/50 line-clamp-2">{r.notes}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
