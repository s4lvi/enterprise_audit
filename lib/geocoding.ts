/**
 * Forward-geocode a free-text address using Nominatim (OpenStreetMap).
 *
 * Free, no API key. Fair-use rate-limit is 1 req/sec — fine for our
 * volume (humans occasionally entering enterprises). Nominatim requires
 * a User-Agent identifying the app.
 *
 * Returns null on miss or any error so callers can save without coords
 * rather than failing the whole save.
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", trimmed);

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires identifying the app.
        "User-Agent": "enterprise-audit (https://github.com/s4lvi/enterprise_audit)",
        Accept: "application/json",
      },
      // Don't let geocoding wait too long.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const results = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const first = results[0];
    if (!first?.lat || !first?.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    // Timeout, network, parse error — degrade silently.
    return null;
  }
}
