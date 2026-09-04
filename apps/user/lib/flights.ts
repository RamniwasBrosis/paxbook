import type { SearchFlightRequestDto } from "@paxbook/types";

export function getClientTenantHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/(?:^|;\s*)pb_tenant_slug=([^;]*)/);
  const slug = match?.[1] ? decodeURIComponent(match[1]) : null;
  return slug ? { "X-Tenant-Slug": slug } : {};
}

/** <input type="date"> gives YYYY-MM-DD; FTD wants YYYYMMDD. */
export function toYyyymmdd(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

/** YYYYMMDD -> YYYY-MM-DD, for pre-filling <input type="date">. */
export function fromYyyymmdd(value: string): string {
  if (!/^\d{8}$/.test(value)) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

/** <input type="date"> gives YYYY-MM-DD; FTD wants DD-MM-YYYY for passenger DOB. */
export function isoToDdMmYyyy(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return "";
  return `${d}-${m}-${y}`;
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function formatDateTimeLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export const CABIN_LABELS: Record<string, string> = { E: "Economy", P: "Premium Economy", B: "Business", F: "First" };
export const FARE_TYPE_LABELS: Record<string, string> = { A: "Regular", S: "Student", C: "Senior Citizen", D: "Defence" };

const SEARCH_PARAM_KEYS = ["tripType", "serType", "depCity", "arrCity", "onDate", "reDate", "adt", "chd", "inf", "cabin", "fareType"] as const;

export function searchContextFromParams(params: URLSearchParams): SearchFlightRequestDto | null {
  const tripType = Number(params.get("tripType"));
  const serType = Number(params.get("serType"));
  const depCity = params.get("depCity") ?? "";
  const arrCity = params.get("arrCity") ?? "";
  const onDate = params.get("onDate") ?? "";
  const adt = Number(params.get("adt") ?? "1");
  const chd = Number(params.get("chd") ?? "0");
  const inf = Number(params.get("inf") ?? "0");
  const cabin = params.get("cabin") ?? "E";
  const fareType = params.get("fareType") ?? "A";
  if (!depCity || !arrCity || !onDate || Number.isNaN(tripType) || Number.isNaN(serType)) return null;
  const reDate = params.get("reDate") || undefined;
  return { tripType, serType, depCity, arrCity, onDate, reDate, adt, chd, inf, cabin, fareType };
}

export function searchContextToQuery(ctx: SearchFlightRequestDto): string {
  const params = new URLSearchParams();
  for (const key of SEARCH_PARAM_KEYS) {
    const value = ctx[key as keyof SearchFlightRequestDto];
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.toString();
}
