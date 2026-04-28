import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { count: chaptersCount },
    { count: enterprisesCount },
    { count: auditsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name, role, chapter_id").eq("id", user.id).single(),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("enterprises").select("*", { count: "exact", head: true }),
    supabase.from("audits").select("*", { count: "exact", head: true }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6">
      <h1 className="mb-1 text-2xl font-semibold">
        Welcome, {profile?.display_name ?? user.email}
      </h1>
      <p className="mb-8 text-sm text-gray-600">
        Role: <span className="font-medium">{profile?.role ?? "unknown"}</span>
        {profile?.chapter_id == null ? " · No chapter assigned yet" : ""}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard href="/chapters" title="Chapters" count={chaptersCount ?? 0} />
        <SummaryCard href="/enterprises" title="Enterprises" count={enterprisesCount ?? 0} />
        <SummaryCard href="/audits" title="Audits" count={auditsCount ?? 0} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SummaryCard href="/map" title="Map" subtitle="Plotted enterprises" />
        <SummaryCard href="/graph" title="Graph" subtitle="Relationships across enterprises" />
      </div>
    </main>
  );
}

function SummaryCard({
  href,
  title,
  count,
  subtitle,
}: {
  href: string;
  title: string;
  count?: number;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="block focus:outline-none">
      <Card className="transition hover:border-gray-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {typeof count === "number" ? <p className="text-2xl font-semibold">{count}</p> : null}
          {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
