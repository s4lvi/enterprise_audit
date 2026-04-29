"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Map, Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";

import { regionCentroid } from "@/lib/region-centroids";

export type EnterprisePoint = {
  id: string;
  name: string;
  stage: string;
  lat: number;
  lng: number;
  location_name: string | null;
  chapter_name: string | null;
};

export type ChapterPin = {
  id: string;
  name: string;
  enterpriseCount: number;
};

type Selection = { kind: "enterprise"; id: string } | { kind: "chapter"; id: string };

type Props = {
  points: EnterprisePoint[];
  chapters?: ChapterPin[];
  /** Tailwind class for the wrapper div. Default fills the page; pass a
   * fixed height for embedded use (dashboard, sidebars). */
  className?: string;
  /** Hide marker popups + nav controls (useful for non-interactive embeds). */
  interactive?: boolean;
};

const EMPTY_VIEW = { longitude: -98.5, latitude: 39.5, zoom: 3.5 }; // continental US

// Dark basemap via Carto's free dark_all tile service. No API key required;
// attribution is required and rendered by the map's default control.
const DARK_MAP_STYLE = {
  version: 8 as const,
  sources: {
    "carto-dark": {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-dark",
      type: "raster" as const,
      source: "carto-dark",
    },
  ],
};

export function EnterpriseMap({
  points,
  chapters = [],
  className = "h-[calc(100vh-10rem)]",
  interactive = true,
}: Props) {
  const [selected, setSelected] = useState<Selection | null>(null);

  // Resolve chapter state-centroid pins
  const chapterPins = useMemo(
    () =>
      chapters
        .map((c) => {
          const center = regionCentroid(c.name);
          if (!center) return null;
          return { ...c, lng: center.lng, lat: center.lat };
        })
        .filter((c): c is ChapterPin & { lng: number; lat: number } => c !== null),
    [chapters],
  );

  const initialView = useMemo(() => {
    const allPts: Array<{ lat: number; lng: number }> = [...points, ...chapterPins];
    if (allPts.length === 0) return EMPTY_VIEW;
    const lngs = allPts.map((p) => p.lng);
    const lats = allPts.map((p) => p.lat);
    const longitude = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
    return { longitude, latitude, zoom: 3.5 };
  }, [points, chapterPins]);

  const selectedEnterprise = useMemo(
    () =>
      selected?.kind === "enterprise" ? (points.find((p) => p.id === selected.id) ?? null) : null,
    [points, selected],
  );

  const selectedChapter = useMemo(
    () =>
      selected?.kind === "chapter" ? (chapterPins.find((c) => c.id === selected.id) ?? null) : null,
    [chapterPins, selected],
  );

  return (
    <div className={`relative w-full overflow-hidden border border-white/10 ${className}`}>
      <Map
        initialViewState={initialView}
        style={{ position: "absolute", inset: 0 }}
        mapStyle={DARK_MAP_STYLE}
        attributionControl={interactive ? undefined : false}
        dragRotate={interactive}
      >
        {interactive ? <NavigationControl position="top-right" /> : null}

        {/* Chapter markers — yellow, larger, behind enterprises */}
        {chapterPins.map((c) => (
          <Marker
            key={`chapter-${c.id}`}
            longitude={c.lng}
            latitude={c.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected({ kind: "chapter", id: c.id });
            }}
          >
            <div
              className="size-5 cursor-pointer rounded-sm border-2 border-black/60 bg-brand-accent shadow-lg"
              style={{ transform: "rotate(45deg)" }}
              title={c.name}
            />
          </Marker>
        ))}

        {/* Enterprise markers — red, smaller, on top */}
        {points.map((p) => (
          <Marker
            key={`enterprise-${p.id}`}
            longitude={p.lng}
            latitude={p.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected({ kind: "enterprise", id: p.id });
            }}
          >
            <div
              className="size-3 cursor-pointer rounded-full border-2 border-white bg-brand-primary shadow"
              title={p.name}
            />
          </Marker>
        ))}

        {selectedEnterprise && interactive ? (
          <Popup
            longitude={selectedEnterprise.lng}
            latitude={selectedEnterprise.lat}
            anchor="top"
            offset={12}
            onClose={() => setSelected(null)}
            closeButton
            closeOnClick={false}
            maxWidth="280px"
          >
            <div className="space-y-1.5 p-1">
              <div className="text-[9px] font-bold tracking-widest text-brand-primary uppercase">
                Enterprise
              </div>
              <div className="font-semibold">{selectedEnterprise.name}</div>
              <div className="text-xs text-white/60">
                {selectedEnterprise.chapter_name ?? "—"} · {selectedEnterprise.stage}
              </div>
              {selectedEnterprise.location_name ? (
                <div className="text-xs text-white/50">{selectedEnterprise.location_name}</div>
              ) : null}
              <Link
                href={`/enterprises/${selectedEnterprise.id}`}
                className="inline-block text-xs text-brand-primary hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        ) : null}

        {selectedChapter && interactive ? (
          <Popup
            longitude={selectedChapter.lng}
            latitude={selectedChapter.lat}
            anchor="top"
            offset={12}
            onClose={() => setSelected(null)}
            closeButton
            closeOnClick={false}
            maxWidth="240px"
          >
            <div className="space-y-1.5 p-1">
              <div className="text-[9px] font-bold tracking-widest text-brand-accent uppercase">
                Chapter
              </div>
              <div className="font-semibold">{selectedChapter.name}</div>
              <div className="text-xs text-white/60">
                {selectedChapter.enterpriseCount} enterprise
                {selectedChapter.enterpriseCount === 1 ? "" : "s"}
              </div>
              <Link
                href={`/chapters/${selectedChapter.id}`}
                className="inline-block text-xs text-brand-primary hover:underline"
              >
                View chapter →
              </Link>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}

// Re-export for symmetry; ref typing is awkward across react-map-gl versions.
export type { MapRef };
