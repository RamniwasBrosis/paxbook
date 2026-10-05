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

/**
 * FTD sends baggage per segment joined with "|" ("1 Pc||", "15 Kg|15 Kg"); empty parts mean "same as
 * before". Shows the distinct values, with "Pc" spelled out.
 */
export function formatBaggage(raw: string | null | undefined): string {
  const parts = [...new Set((raw ?? "").split("|").map((p) => p.trim()).filter(Boolean))];
  if (parts.length === 0) return "—";
  return parts.map((p) => p.replace(/(\d+)\s*Pcs?\b/i, (_, n) => `${n} Piece${n === "1" ? "" : "s"}`)).join(" / ");
}

/** FTD sends seats per segment ("5,18,6"); the bookable count is the smallest of them. */
export function seatsLeft(raw: string | null | undefined): number | null {
  const counts = (raw ?? "").split(/[,|]/).map((p) => parseInt(p, 10)).filter((n) => Number.isFinite(n) && n >= 0);
  return counts.length ? Math.min(...counts) : null;
}

export function formatSeatsLeft(raw: string | null | undefined): string {
  const n = seatsLeft(raw);
  if (n === null) return "—";
  return `${n} seat${n === 1 ? "" : "s"} left`;
}

/** Door-to-door minutes from first departure to last arrival, so layovers count; falls back to flying time. */
export function journeyMinutes(legs: { depDateTime: string; arrDateTime: string; durationMinutes: number }[]): number {
  const first = legs[0];
  const last = legs[legs.length - 1];
  if (!first || !last) return 0;
  const elapsed = Math.round((new Date(last.arrDateTime).getTime() - new Date(first.depDateTime).getTime()) / 60000);
  return Number.isFinite(elapsed) && elapsed > 0 ? elapsed : legs.reduce((sum, l) => sum + l.durationMinutes, 0);
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

/** Mirrors the API's rule (flights.service dobIsOptional): DOB may be left empty only for adults on a
 * domestic Regular fare — the API then sends a standard adult date to FTD. Everyone else needs it. */
export function isDobOptional(pType: string, context: { serType: number; fareType?: string | null }): boolean {
  return pType === "A" && context.serType === 1 && (context.fareType ?? "A") === "A";
}
