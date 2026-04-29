import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { deleteScheduledAudit, updateScheduledAudit } from "../actions";
import { ScheduledAuditForm } from "../scheduled-audit-form";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function ScheduledAuditDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === "1";

  const supabase = await createClient();

  const [{ data: scheduled, error }, { data: chapters }, { data: profiles }, viewer] =
    await Promise.all([
      supabase
        .from("scheduled_audits")
        .select(
          "id, scheduled_at, chapter_id, assigned_to, notes, completed_audit_id, chapter:chapters(id, name), assignee:profiles!assigned_to(id, display_name)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("chapters").select("id, name").order("name"),
      supabase.from("profiles").select("id, display_name, role").order("display_name"),
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return null;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        return profile ? { id: data.user.id, role: profile.role } : null;
      }),
    ]);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-2xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }
  if (!scheduled) notFound();

  const isStaff = viewer?.role === "admin" || viewer?.role === "auditor";
  const isAssignee = viewer?.id === scheduled.assigned_to;
  const canEdit = isStaff || isAssignee;
  const canDelete = viewer?.role === "admin";

  const remove = async () => {
    "use server";
    await deleteScheduledAudit(id);
  };

  if (isEditing && canEdit) {
    return (
      <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
          Schedule
        </p>
        <h1 className="mb-6 text-3xl">Edit scheduled audit</h1>
        <ScheduledAuditForm
          chapters={chapters ?? []}
          assignees={profiles ?? []}
          defaultValues={{
            scheduled_at: toDateTimeLocalValue(scheduled.scheduled_at),
            chapter_id: scheduled.chapter_id,
            assigned_to: scheduled.assigned_to,
            notes: scheduled.notes ?? "",
          }}
          action={updateScheduledAudit.bind(null, id)}
          submitLabel="Save changes"
        />

        {canDelete ? (
          <>
            <hr className="my-8 border-white/10" />
            <form action={remove}>
              <Button type="submit" variant="destructive" size="sm">
                Cancel & delete
              </Button>
            </form>
          </>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto mt-8 w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
            Scheduled audit
          </p>
          <h1 className="text-3xl">{formatWhen(scheduled.scheduled_at)}</h1>
        </div>
        <div className="flex gap-2">
          {canEdit ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/schedule/${id}?edit=1`}>Edit</Link>
            </Button>
          ) : null}
          {scheduled.chapter ? (
            <Button asChild size="sm">
              <Link href={`/chapters/${scheduled.chapter.id}`}>
                Open {scheduled.chapter.name} →
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="card-cut border border-white/10 bg-brand-surface p-5">
        <DetailRow label="Chapter" value={scheduled.chapter?.name ?? "—"} />
        <DetailRow label="Assignee" value={scheduled.assignee?.display_name ?? "—"} />
        <DetailRow label="Notes" value={scheduled.notes ?? "—"} multiline={!!scheduled.notes} />
      </div>
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
