import { createClient } from "@/lib/supabase/server";

import { EnterpriseMap, type ChapterPin, type EnterprisePoint } from "./enterprise-map";

export default async function MapPage() {
  const supabase = await createClient();
  const [{ data: enterprises, error }, { data: chapters }, { data: enterpriseCounts }] =
    await Promise.all([
      supabase
        .from("enterprises")
        .select("id, name, stage, lat, lng, location_name, chapter:chapters(name)")
        .not("lat", "is", null)
        .not("lng", "is", null),
      supabase.from("chapters").select("id, name").order("name"),
      // Group enterprises by chapter to label each chapter pin with a count.
      supabase.from("enterprises").select("chapter_id"),
    ]);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-7xl p-6">
        <p className="text-brand-danger">{error.message}</p>
      </main>
    );
  }

  const points: EnterprisePoint[] = (enterprises ?? [])
    .filter((e): e is typeof e & { lat: number; lng: number } => e.lat != null && e.lng != null)
    .map((e) => ({
      id: e.id,
      name: e.name,
      stage: e.stage,
      lat: e.lat,
      lng: e.lng,
      location_name: e.location_name,
      chapter_name: e.chapter?.name ?? null,
    }));

  const counts = new Map<string, number>();
  for (const row of enterpriseCounts ?? []) {
    counts.set(row.chapter_id, (counts.get(row.chapter_id) ?? 0) + 1);
  }
  const chapterPins: ChapterPin[] = (chapters ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    enterpriseCount: counts.get(c.id) ?? 0,
  }));

  const totalSelectable = (enterprises ?? []).length;
  const totalShown = points.length;

  return (
    <main className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl">Map</h1>
          <p className="mt-1 text-xs tracking-wider text-white/50 uppercase">
            {chapterPins.length} chapter
            {chapterPins.length === 1 ? "" : "s"} · {totalShown} of {totalSelectable} enterprises
            pinned
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase">
          <span className="flex items-center gap-1.5 text-white/60">
            <span
              className="size-3 rounded-sm bg-brand-accent"
              style={{ transform: "rotate(45deg)" }}
            />
            Chapter (state / province)
          </span>
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="size-2.5 rounded-full border border-white bg-brand-primary" />
            Enterprise
          </span>
        </div>
      </header>

      <EnterpriseMap points={points} chapters={chapterPins} />

      {totalSelectable > totalShown ? (
        <p className="mt-3 text-sm text-white/50">
          {totalSelectable - totalShown} enterprises don&apos;t have lat/lng set and are hidden. Add
          coordinates on the enterprise edit page to include them here.
        </p>
      ) : null}
    </main>
  );
}
