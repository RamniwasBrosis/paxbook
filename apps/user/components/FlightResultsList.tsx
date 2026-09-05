"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plane, Loader2, ArrowRight, RefreshCw, Utensils, ShieldCheck, ShieldOff, AlertTriangle } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto } from "@paxbook/types";
import { formatMinutes, formatTime, getClientTenantHeader, searchContextFromParams, searchContextToQuery } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type SortKey = "price" | "duration" | "departure";
type TimeBucket = "before6" | "morning" | "afternoon" | "evening";

const TIME_BUCKETS: { key: TimeBucket; label: string; range: string }[] = [
  { key: "before6", label: "Before 6 AM", range: "12:00 AM - 5:59 AM" },
  { key: "morning", label: "6 AM - 12 PM", range: "6:00 AM - 11:59 AM" },
  { key: "afternoon", label: "12 PM - 6 PM", range: "12:00 PM - 5:59 PM" },
  { key: "evening", label: "After 6 PM", range: "6:00 PM - 11:59 PM" },
];

function timeBucketOf(iso: string): TimeBucket {
  const hour = new Date(iso).getHours();
  if (hour < 6) return "before6";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function FlightResultsList() {
  const params = useSearchParams();
  const searchContext = React.useMemo(() => searchContextFromParams(params), [params]);

  const [result, setResult] = React.useState<FlightSearchResultDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [polling, setPolling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sortKey, setSortKey] = React.useState<SortKey>("price");
  const [maxStops, setMaxStops] = React.useState<number | null>(null);
  const [airlineFilter, setAirlineFilter] = React.useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = React.useState<TimeBucket | null>(null);
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);

  const MAX_POLL_ATTEMPTS = 8;

  const runSearch = React.useCallback(() => {
    if (!searchContext) {
      setError("Missing or invalid search details.");
      setLoading(false);
      return () => {};
    }
    let cancelled = false;
    setLoading(true);
    setPolling(false);
    setError(null);
    setResult(null);

    // The provider streams large result sets: a response can come back with isComplete:false and
    // few/no options yet. Per the FTD spec, the client must keep re-hitting search with the returned
    // refID until isComplete is true, rather than treating an early partial response as "no flights".
    async function poll(refID?: string, attempt = 0) {
      try {
        const res = await fetch(`${API_BASE_URL}/public/flights/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
          body: JSON.stringify({ ...searchContext, refID }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Search failed.");
        if (cancelled) return;
        const data = json.data as FlightSearchResultDto;
        setResult(data);
        setLoading(false);
        if (!data.isComplete && attempt < MAX_POLL_ATTEMPTS) {
          setPolling(true);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (!cancelled) await poll(data.refId, attempt + 1);
        } else {
          setPolling(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Search failed. Please try again.");
          setLoading(false);
          setPolling(false);
        }
      }
    }
    void poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  React.useEffect(() => {
    return runSearch();
  }, [runSearch]);

  const airlineCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    (result?.options ?? []).forEach((o) => {
      const name = o.legs[0]?.airlineName;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return counts;
  }, [result]);

  const stopsCounts = React.useMemo(() => {
    const counts = { nonstop: 0, oneOrFewer: 0 };
    (result?.options ?? []).forEach((o) => {
      if (o.stops === 0) counts.nonstop += 1;
      if (o.stops <= 1) counts.oneOrFewer += 1;
    });
    return counts;
  }, [result]);

  const priceBounds = React.useMemo(() => {
    const prices = (result?.options ?? []).map((o) => o.fare.total);
    return prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
  }, [result]);

  const visibleOptions = React.useMemo(() => {
    if (!result) return [];
    let options = result.options;
    if (maxStops !== null) options = options.filter((o) => o.stops <= maxStops);
    if (airlineFilter) options = options.filter((o) => o.legs[0]?.airlineName === airlineFilter);
    if (timeOfDay) options = options.filter((o) => o.legs[0] && timeBucketOf(o.legs[0].depDateTime) === timeOfDay);
    if (maxPrice !== null) options = options.filter((o) => o.fare.total <= maxPrice);
    const sorted = [...options];
    if (sortKey === "price") sorted.sort((a, b) => a.fare.total - b.fare.total);
    if (sortKey === "duration") sorted.sort((a, b) => a.durationTotalMinutes - b.durationTotalMinutes);
    if (sortKey === "departure") sorted.sort((a, b) => new Date(a.legs[0]?.depDateTime ?? 0).getTime() - new Date(b.legs[0]?.depDateTime ?? 0).getTime());
    return sorted;
  }, [result, sortKey, maxStops, airlineFilter, timeOfDay, maxPrice]);

  if (!searchContext) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-slate-500">That search link looks incomplete.</p>
        <Link href="/flights" className="mt-3 inline-block font-semibold text-brand hover:underline">
          Start a new search
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        {(maxStops !== null || airlineFilter || timeOfDay || maxPrice !== null) ? (
          <button
            type="button"
            onClick={() => {
              setMaxStops(null);
              setAirlineFilter(null);
              setTimeOfDay(null);
              setMaxPrice(null);
            }}
            className="self-start text-xs font-semibold text-brand hover:underline"
          >
            Clear all filters
          </button>
        ) : null}

        <div className="flat-card p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Stops</p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={maxStops === null} onChange={() => setMaxStops(null)} className="accent-brand" />
              Any
            </label>
            <label className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <input type="radio" checked={maxStops === 0} onChange={() => setMaxStops(0)} className="accent-brand" />
                Non-stop
              </span>
              <span className="text-xs text-slate-400">{stopsCounts.nonstop}</span>
            </label>
            <label className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <input type="radio" checked={maxStops === 1} onChange={() => setMaxStops(1)} className="accent-brand" />
                1 stop or fewer
              </span>
              <span className="text-xs text-slate-400">{stopsCounts.oneOrFewer}</span>
            </label>
          </div>
        </div>

        {priceBounds.max > priceBounds.min ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Max price</p>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxPrice ?? priceBounds.max}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-brand"
            />
            <p className="mt-1 text-sm font-semibold text-navy-deep">Up to ₹{(maxPrice ?? priceBounds.max).toLocaleString("en-IN")}</p>
          </div>
        ) : null}

        <div className="flat-card p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Departure time</p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={timeOfDay === null} onChange={() => setTimeOfDay(null)} className="accent-brand" />
              Any time
            </label>
            {TIME_BUCKETS.map((b) => (
              <label key={b.key} className="flex items-center gap-2" title={b.range}>
                <input type="radio" checked={timeOfDay === b.key} onChange={() => setTimeOfDay(b.key)} className="accent-brand" />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        {airlineCounts.size > 0 ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Airline</p>
            <div className="mt-2 flex flex-col gap-1.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={airlineFilter === null} onChange={() => setAirlineFilter(null)} className="accent-brand" />
                All airlines
              </label>
              {Array.from(airlineCounts.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, count]) => (
                  <label key={name} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <input type="radio" checked={airlineFilter === name} onChange={() => setAirlineFilter(name)} className="accent-brand" />
                      {name}
                    </span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </label>
                ))}
            </div>
          </div>
        ) : null}
      </aside>

      <div>
        <div className="flat-card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold text-navy-deep">
              {searchContext.depCity} <ArrowRight className="inline h-3.5 w-3.5" strokeWidth={2.5} /> {searchContext.arrCity}
            </p>
            <p className="text-xs text-slate-400">
              {result ? `${visibleOptions.length} of ${result.options.length} flight(s)` : "Searching…"}
              {polling ? " · still searching more airlines…" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Sort</span>
            {(["price", "duration", "departure"] as SortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${sortKey === key ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600"}`}
              >
                {key}
              </button>
            ))}
            <button type="button" onClick={runSearch} aria-label="Refresh results" className="rounded-full border border-slate-200 p-1.5 text-slate-500 hover:border-brand hover:text-brand">
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flat-card flex items-center justify-center gap-2 p-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Searching live fares…
          </div>
        ) : error ? (
          <div className="flat-card p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button type="button" onClick={runSearch} className="mt-3 font-semibold text-brand hover:underline">
              Try again
            </button>
          </div>
        ) : visibleOptions.length === 0 ? (
          <div className="flat-card flex items-center justify-center gap-2 p-8 text-center text-slate-500">
            {polling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Still searching more airlines…
              </>
            ) : (
              "No flights match your filters. Try widening your search."
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleOptions.map((option) => (
              <FlightOptionCard key={option.id} option={option} query={searchContextToQuery(searchContext)} refId={result!.refId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function lowestSeatCount(seatsAvailable: string): number | null {
  const nums = seatsAvailable
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  return nums.length > 0 ? Math.min(...nums) : null;
}

function FlightOptionCard({ option, query, refId }: { option: FlightOptionDto; query: string; refId: string }) {
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  if (!firstLeg || !lastLeg) return null;
  const seats = lowestSeatCount(option.fare.seatsAvailable);

  return (
    <div className="flat-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
          <Plane className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-navy-deep">
            {firstLeg.airlineName} · {firstLeg.flightNo}
            {option.validation.isLowCostCarrier ? <span className="ml-1.5 text-xs font-normal text-slate-400">LCC</span> : null}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-bold text-navy-deep">{formatTime(firstLeg.depDateTime)}</span>
            <span>{firstLeg.depCode}</span>
            <span className="text-slate-300">—— {formatMinutes(option.durationTotalMinutes)} ——</span>
            <span className="font-bold text-navy-deep">{formatTime(lastLeg.arrDateTime)}</span>
            <span>{lastLeg.arrCode}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {option.stops === 0 ? "Non-stop" : `${option.stops} stop${option.stops > 1 ? "s" : ""}`} · {option.fare.baggageCheckIn || "Baggage per airline policy"} check-in
            {option.fare.baggageCabin ? `, ${option.fare.baggageCabin} cabin` : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-slate-600">{option.fare.fareTypeLabel}</span>
            <span className={`flex items-center gap-1 text-[11px] font-semibold ${option.fare.refundable ? "text-emerald-600" : "text-slate-400"}`}>
              {option.fare.refundable ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
              {option.fare.refundable ? "Refundable" : "Non-refundable"}
            </span>
            {option.validation.freeMeal ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <Utensils className="h-3 w-3" /> Free meal
              </span>
            ) : null}
            {seats !== null && seats <= 5 ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                <AlertTriangle className="h-3 w-3" /> Only {seats} seat{seats === 1 ? "" : "s"} left
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
        <div className="text-right">
          <p className="text-xl font-extrabold text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-400">
            Base ₹{option.fare.base.toLocaleString("en-IN")} + Tax ₹{option.fare.tax.toLocaleString("en-IN")}
          </p>
        </div>
        <Link
          href={`/flights/fare?flightId=${option.id}&refId=${encodeURIComponent(refId)}&${query}`}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
        >
          Select
        </Link>
      </div>
    </div>
  );
}
