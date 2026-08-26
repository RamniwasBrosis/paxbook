"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface RoutePoint {
  id?: string;
  lat: number;
  lng: number;
  label?: string;
  sortOrder?: number;
}

export function RouteMap({ points }: { points: RoutePoint[] }) {
  const sorted = [...points].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const center: [number, number] = [sorted[0]!.lat, sorted[0]!.lng];
  const path: [number, number][] = sorted.map((p) => [p.lat, p.lng]);

  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-slate-100">
      <MapContainer center={center} zoom={6} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {sorted.length > 1 ? <Polyline positions={path} pathOptions={{ color: "#f1ba4b", weight: 3 }} /> : null}
        {sorted.map((p, i) => (
          <Marker key={p.id ?? i} position={[p.lat, p.lng]} icon={markerIcon}>
            <Popup>{p.label ?? `Stop ${i + 1}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
