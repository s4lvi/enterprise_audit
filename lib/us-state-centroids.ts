/**
 * Approximate geographic centroids for the 50 US states + DC.
 * Used to plot chapter markers on the map (chapters represent states).
 *
 * Keys are case-insensitive: lookup normalizes to title case.
 */

const CENTROIDS: Record<string, { lng: number; lat: number }> = {
  alabama: { lng: -86.79, lat: 32.81 },
  alaska: { lng: -152.4, lat: 61.39 },
  arizona: { lng: -111.43, lat: 34.46 },
  arkansas: { lng: -92.44, lat: 34.97 },
  california: { lng: -119.68, lat: 37.18 },
  colorado: { lng: -105.55, lat: 39.06 },
  connecticut: { lng: -72.76, lat: 41.6 },
  delaware: { lng: -75.51, lat: 38.99 },
  "district of columbia": { lng: -77.03, lat: 38.91 },
  florida: { lng: -81.69, lat: 27.77 },
  georgia: { lng: -83.32, lat: 32.69 },
  hawaii: { lng: -156.66, lat: 20.6 },
  idaho: { lng: -114.74, lat: 44.24 },
  illinois: { lng: -89.2, lat: 40.06 },
  indiana: { lng: -86.28, lat: 39.89 },
  iowa: { lng: -93.5, lat: 42.07 },
  kansas: { lng: -98.38, lat: 38.5 },
  kentucky: { lng: -84.86, lat: 37.65 },
  louisiana: { lng: -91.87, lat: 31.17 },
  maine: { lng: -69.32, lat: 45.37 },
  maryland: { lng: -76.79, lat: 38.95 },
  massachusetts: { lng: -71.81, lat: 42.23 },
  michigan: { lng: -84.54, lat: 43.32 },
  minnesota: { lng: -94.31, lat: 46.28 },
  mississippi: { lng: -89.65, lat: 32.74 },
  missouri: { lng: -92.46, lat: 38.36 },
  montana: { lng: -109.63, lat: 47.05 },
  nebraska: { lng: -99.81, lat: 41.53 },
  nevada: { lng: -116.85, lat: 38.5 },
  "new hampshire": { lng: -71.58, lat: 43.45 },
  "new jersey": { lng: -74.66, lat: 40.27 },
  "new mexico": { lng: -106.11, lat: 34.41 },
  "new york": { lng: -75.5, lat: 42.95 },
  "north carolina": { lng: -79.81, lat: 35.63 },
  "north dakota": { lng: -100.3, lat: 47.53 },
  ohio: { lng: -82.79, lat: 40.39 },
  oklahoma: { lng: -97.49, lat: 35.31 },
  oregon: { lng: -120.55, lat: 43.93 },
  pennsylvania: { lng: -77.21, lat: 40.59 },
  "rhode island": { lng: -71.51, lat: 41.68 },
  "south carolina": { lng: -80.95, lat: 33.86 },
  "south dakota": { lng: -100.23, lat: 44.3 },
  tennessee: { lng: -86.69, lat: 35.75 },
  texas: { lng: -99.34, lat: 31.05 },
  utah: { lng: -111.86, lat: 39.32 },
  vermont: { lng: -72.71, lat: 44.07 },
  virginia: { lng: -78.17, lat: 37.77 },
  washington: { lng: -120.45, lat: 47.4 },
  "west virginia": { lng: -80.95, lat: 38.49 },
  wisconsin: { lng: -89.62, lat: 44.27 },
  wyoming: { lng: -107.3, lat: 42.99 },
};

export function stateCentroid(name: string): { lng: number; lat: number } | null {
  return CENTROIDS[name.trim().toLowerCase()] ?? null;
}
