"use client";

import * as React from "react";
import Link from "next/link";
import type { FlightSearchResultDto, SearchFlightRequestDto } from "@paxbook/types";
import { getClientTenantHeader, searchContextToQuery } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
/** Days shown on either side of the selected date — 7 date cards total, matching the OTA-standard strip. */
const WINDOW_DAYS = 3;

function addDaysToYyyymmdd(yyyymmdd: string, days: number): Date {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const date = new Date(Date.UTC(y, m, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function toYyyymmdd(date: Date): string {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Live per-date lowest fares for the nearby dates — each a real search call against the real API,
 * not a guess. A date with no flights (or that failed to load) shows "—", never a fabricated price. */
export function FlightDateStrip({ searchContext }: { searchContext: SearchFlightRequestDto }) {
  const [fares, setFares] = React.useState<Record<string, number | null>>({});

  const dates = React.useMemo(() => {
    const arr: string[] = [];
    for (let i = -WINDOW_DAYS; i <= WINDOW_DAYS; i++) arr.push(toYyyymmdd(addDaysToYyyymmdd(searchContext.onDate, i)));
    return arr;
  }, [searchContext.onDate]);

  React.useEffect(() => {
    let cancelled = false;
    setFares({});
    dates.forEach(async (date) => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/flights/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
          body: JSON.stringify({ ...searchContext, onDate: date }),
        });
        const json = await res.json();
        if (cancelled) return;
        const options = json.success ? (json.data as FlightSearchResultDto).options : [];
        const min = options.length > 0 ? Math.min(...options.map((o) => o.fare.total)) : null;
        setFares((prev) => ({ ...prev, [date]: min }));
      } catch {
        if (!cancelled) setFares((prev) => ({ ...prev, [date]: null }));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates.join(",")]);

  const known = Object.values(fares).filter((f): f is number => typeof f === "number");
  // Only worth flagging when the nearby dates actually differ in price.
  const lowest = known.length > 1 && Math.min(...known) < Math.max(...known) ? Math.min(...known) : null;

  return (
    <div className="flat-card mb-5 overflow-x-auto p-2.5 no-scrollbar">
      <div className="flex gap-2">
        {dates.map((date) => {
          const d = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8))));
          const selected = date === searchContext.onDate;
          const fare = fares[date];
          const query = searchContextToQuery({ ...searchContext, onDate: date });
          return (
            <Link
              key={date}
              href={`/flights/results?${query}`}
              aria-current={selected ? "date" : undefined}
              className={`relative flex min-w-[96px] flex-1 flex-col items-center rounded-2xl px-3 pb-2.5 pt-3 text-center transition-colors ${
                selected ? "bg-navy-deep text-white shadow-soft" : "bg-mist text-ink-muted hover:bg-brand-blue-soft"
              }`}
            >
              {fare != null && fare === lowest ? (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-b-lg bg-green-600 px-2 text-[0.6rem] font-extrabold uppercase tracking-wide text-white">Lowest</span>
              ) : null}
              <span className="text-[11px] font-semibold uppercase">{d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" })}</span>
              <span className="text-sm font-bold">{d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" })}</span>
              <span className={`mt-1 text-sm font-extrabold ${selected ? "text-accent" : fare != null && fare === lowest ? "text-green-700" : "text-navy-deep"}`}>
                {fare === undefined ? "…" : fare === null ? "—" : `₹${fare.toLocaleString("en-IN")}`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
