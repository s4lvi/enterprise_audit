import { createClient } from "@/lib/supabase/server";

import { EnterpriseMap, type EnterprisePoint } from "./enterprise-map";

export default async function MapPage() {
  const supabase = await createClient();
  const { data: enterprises, error } = await supabase
    .from("enterprises")
    .select("id, name, stage, lat, lng, location_name, chapter:chapters(name)")
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (error) {
    return (
      <main className="mx-auto mt-8 max-w-6xl p-6">
        <p className="text-red-600">{error.message}</p>
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

  const totalSelectable = (enterprises ?? []).length;
  const totalShown = points.length;

  return (
    <main className="mx-auto mt-8 max-w-6xl p-6">
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Map</h1>
        <p className="text-sm text-gray-500">
          {totalShown} of {totalSelectable} enterprises pinned
        </p>
      </header>

      <EnterpriseMap points={points} />

      {totalSelectable > totalShown ? (
        <p className="mt-3 text-sm text-gray-500">
          {totalSelectable - totalShown} enterprises don&apos;t have lat/lng set and are hidden. Add
          coordinates on the enterprise edit page to include them here.
        </p>
      ) : null}
    </main>
  );
}
