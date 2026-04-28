"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Map, Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";

export type EnterprisePoint = {
  id: string;
  name: string;
  stage: string;
  lat: number;
  lng: number;
  location_name: string | null;
  chapter_name: string | null;
};

type Props = { points: EnterprisePoint[] };

const EMPTY_VIEW = { longitude: -98.5, latitude: 39.5, zoom: 3.5 }; // continental US

export function EnterpriseMap({ points }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialView = useMemo(() => {
    if (points.length === 0) return EMPTY_VIEW;
    const lngs = points.map((p) => p.lng);
    const lats = points.map((p) => p.lat);
    const longitude = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
    return { longitude, latitude, zoom: 3.5 };
  }, [points]);

  const selected = useMemo(
    () => points.find((p) => p.id === selectedId) ?? null,
    [points, selectedId],
  );

  return (
    <div className="h-[calc(100vh-12rem)] w-full overflow-hidden rounded border border-gray-200">
      <Map
        initialViewState={initialView}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <NavigationControl position="top-right" />

        {points.map((p) => (
          <Marker
            key={p.id}
            longitude={p.lng}
            latitude={p.lat}
            anchor="bottom"
            onClick={(e) => {
              // Prevent the click from propagating to the map (which would close popups).
              e.originalEvent.stopPropagation();
              setSelectedId(p.id);
            }}
          >
            <div
              className="size-3 cursor-pointer rounded-full border-2 border-white bg-blue-600 shadow"
              title={p.name}
            />
          </Marker>
        ))}

        {selected ? (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            offset={12}
            onClose={() => setSelectedId(null)}
            closeButton
            closeOnClick={false}
            maxWidth="280px"
          >
            <div className="space-y-1.5 p-1">
              <div className="font-semibold">{selected.name}</div>
              <div className="text-xs text-gray-600">
                {selected.chapter_name ?? "—"} · {selected.stage}
              </div>
              {selected.location_name ? (
                <div className="text-xs text-gray-500">{selected.location_name}</div>
              ) : null}
              <Link
                href={`/enterprises/${selected.id}`}
                className="inline-block text-xs text-blue-600 hover:underline"
              >
                View details →
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
