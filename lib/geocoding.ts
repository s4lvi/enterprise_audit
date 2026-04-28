/**
 * Forward-geocode a free-text location using Nominatim (OpenStreetMap).
 *
 * Free, no API key. Fair-use rate-limit is 1 req/sec — fine for our
 * volume (humans occasionally entering enterprises). Nominatim requires
 * a User-Agent identifying the app.
 *
 * Returns null on miss or any error so callers can save without coords
 * rather than failing the whole save.
 */

export type GeocodeResult = {
  lat: number;
  lng: number;
  /** Nominatim's canonical display name for the matched place. */
  displayName: string;
};

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("q", trimmed);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "enterprise-audit (https://github.com/s4lvi/enterprise_audit)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const results = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>;
    const first = results[0];
    if (!first?.lat || !first?.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng, displayName: first.display_name ?? trimmed };
  } catch {
    return null;
  }
}
