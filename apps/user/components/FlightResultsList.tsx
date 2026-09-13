"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowRight, RefreshCw, Utensils, ShieldCheck, ShieldOff, AlertTriangle, X, ChevronDown, ChevronUp, PlaneTakeoff, PlaneLanding } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto } from "@paxbook/types";
import { formatMinutes, formatTime, getClientTenantHeader, searchContextFromParams, searchContextToQuery } from "@/lib/flights";
import { findAirport } from "@/lib/airports";
import { FlightDateStrip } from "@/components/FlightDateStrip";
import { FlightLoader } from "@/components/FlightLoader";
import { AirlineLogo } from "@/components/AirlineLogo";
import { FlightSearchSummaryBar } from "@/components/FlightSearchSummaryBar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type SortKey = "price" | "duration" | "best";
const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Cheapest" },
  { key: "duration", label: "Fastest" },
  { key: "best", label: "Best" },
];
type TimeBucket = "before6" | "morning" | "afternoon" | "evening";
type DurationBucket = "short" | "medium" | "long";

const TIME_BUCKETS: { key: TimeBucket; label: string; range: string }[] = [
  { key: "before6", label: "Before 6 AM", range: "12:00 AM - 5:59 AM" },
  { key: "morning", label: "6 AM - 12 PM", range: "6:00 AM - 11:59 AM" },
  { key: "afternoon", label: "12 PM - 6 PM", range: "12:00 PM - 5:59 PM" },
  { key: "evening", label: "After 6 PM", range: "6:00 PM - 11:59 PM" },
];

const DURATION_BUCKETS: { key: DurationBucket; label: string }[] = [
  { key: "short", label: "Up to 3h" },
  { key: "medium", label: "3h – 6h" },
  { key: "long", label: "6h+" },
];

function timeBucketOf(iso: string): TimeBucket {
  const hour = new Date(iso).getHours();
  if (hour < 6) return "before6";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function durationBucketOf(mins: number): DurationBucket {
  if (mins <= 180) return "short";
  if (mins <= 360) return "medium";
  return "long";
}

/** Toggle-membership helper for the multi-select filter checkboxes below — returns a new Set with
 * `value` added/removed, never mutates the one passed in (so it plays nicely with React state). */
function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function FlightResultsList() {
  const params = useSearchParams();
  const searchContext = React.useMemo(() => searchContextFromParams(params), [params]);

  const [result, setResult] = React.useState<FlightSearchResultDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [polling, setPolling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sortKey, setSortKey] = React.useState<SortKey>("price");
  const [stopsFilter, setStopsFilter] = React.useState<Set<number>>(new Set());
  const [airlineFilters, setAirlineFilters] = React.useState<Set<string>>(new Set());
  const [depTimeFilters, setDepTimeFilters] = React.useState<Set<TimeBucket>>(new Set());
  const [arrTimeFilters, setArrTimeFilters] = React.useState<Set<TimeBucket>>(new Set());
  const [durationFilters, setDurationFilters] = React.useState<Set<DurationBucket>>(new Set());
  const [layoverFilters, setLayoverFilters] = React.useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = React.useState<number | null>(null);
  const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
  const [refundableOnly, setRefundableOnly] = React.useState(false);

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
    const counts = new Map<string, { code: string; count: number }>();
    (result?.options ?? []).forEach((o) => {
      const name = o.legs[0]?.airlineName;
      const code = o.legs[0]?.airlineCode ?? "";
      if (name) counts.set(name, { code, count: (counts.get(name)?.count ?? 0) + 1 });
    });
    return counts;
  }, [result]);

  const stopsCounts = React.useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0 } as Record<number, number>;
    (result?.options ?? []).forEach((o) => {
      counts[Math.min(o.stops, 2)] = (counts[Math.min(o.stops, 2)] ?? 0) + 1;
    });
    return counts;
  }, [result]);

  const layoverCities = React.useMemo(() => {
    const cities = new Set<string>();
    (result?.options ?? []).forEach((o) => {
      o.legs.slice(0, -1).forEach((leg) => {
        if (leg.arrCityName) cities.add(leg.arrCityName);
      });
    });
    return Array.from(cities).sort();
  }, [result]);

  const priceBounds = React.useMemo(() => {
    const prices = (result?.options ?? []).map((o) => o.fare.total);
    return prices.length > 0 ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) } : { min: 0, max: 0 };
  }, [result]);

  const durationBounds = React.useMemo(() => {
    const durations = (result?.options ?? []).map((o) => o.durationTotalMinutes);
    return durations.length > 0 ? { min: Math.min(...durations), max: Math.max(...durations) } : { min: 0, max: 0 };
  }, [result]);

  const bestScore = React.useCallback(
    (o: FlightOptionDto) => {
      const priceScore = priceBounds.max > priceBounds.min ? (o.fare.total - priceBounds.min) / (priceBounds.max - priceBounds.min) : 0;
      const durationScore = durationBounds.max > durationBounds.min ? (o.durationTotalMinutes - durationBounds.min) / (durationBounds.max - durationBounds.min) : 0;
      return priceScore * 0.6 + durationScore * 0.4;
    },
    [priceBounds, durationBounds],
  );

  const visibleOptions = React.useMemo(() => {
    if (!result) return [];
    let options = result.options;
    if (stopsFilter.size > 0) options = options.filter((o) => stopsFilter.has(Math.min(o.stops, 2)));
    if (airlineFilters.size > 0) options = options.filter((o) => o.legs[0] && airlineFilters.has(o.legs[0].airlineName));
    if (depTimeFilters.size > 0) options = options.filter((o) => o.legs[0] && depTimeFilters.has(timeBucketOf(o.legs[0].depDateTime)));
    if (arrTimeFilters.size > 0) options = options.filter((o) => o.legs.length > 0 && arrTimeFilters.has(timeBucketOf(o.legs[o.legs.length - 1]!.arrDateTime)));
    if (durationFilters.size > 0) options = options.filter((o) => durationFilters.has(durationBucketOf(o.durationTotalMinutes)));
    if (layoverFilters.size > 0) options = options.filter((o) => o.legs.slice(0, -1).some((leg) => layoverFilters.has(leg.arrCityName)));
    if (minPrice !== null) options = options.filter((o) => o.fare.total >= minPrice);
    if (maxPrice !== null) options = options.filter((o) => o.fare.total <= maxPrice);
    if (refundableOnly) options = options.filter((o) => o.fare.refundable);
    const sorted = [...options];
    if (sortKey === "price") sorted.sort((a, b) => a.fare.total - b.fare.total);
    if (sortKey === "duration") sorted.sort((a, b) => a.durationTotalMinutes - b.durationTotalMinutes);
    if (sortKey === "best") sorted.sort((a, b) => bestScore(a) - bestScore(b));
    return sorted;
  }, [
    result,
    sortKey,
    stopsFilter,
    airlineFilters,
    depTimeFilters,
    arrTimeFilters,
    durationFilters,
    layoverFilters,
    minPrice,
    maxPrice,
    refundableOnly,
    bestScore,
  ]);

  const cheapestId = React.useMemo(
    () => (result?.options ?? []).reduce((best: FlightOptionDto | null, o) => (!best || o.fare.total < best.fare.total ? o : best), null)?.id,
    [result],
  );
  const fastestId = React.useMemo(
    () => (result?.options ?? []).reduce((best: FlightOptionDto | null, o) => (!best || o.durationTotalMinutes < best.durationTotalMinutes ? o : best), null)?.id,
    [result],
  );

  const refundableCount = React.useMemo(() => (result?.options ?? []).filter((o) => o.fare.refundable).length, [result]);

  // Prefer the real city name the airline/provider returned for this exact route; fall back to our
  // static airport reference (for the loading state, before any result has come back yet).
  const depCityLabel = result?.options[0]?.legs[0]?.depCityName || findAirport(searchContext?.depCity ?? "")?.city || searchContext?.depCity || "";
  const arrCityLabel =
    result?.options[0]?.legs[result.options[0].legs.length - 1]?.arrCityName || findAirport(searchContext?.arrCity ?? "")?.city || searchContext?.arrCity || "";

  const STOPS_LABEL: Record<number, string> = { 0: "Non-stop", 1: "1 stop", 2: "2+ stops" };

  const appliedFilters = React.useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    stopsFilter.forEach((s) => chips.push({ key: `stops-${s}`, label: STOPS_LABEL[s] ?? String(s), onRemove: () => setStopsFilter((prev) => toggled(prev, s)) }));
    depTimeFilters.forEach((t) =>
      chips.push({ key: `dep-${t}`, label: `Departs: ${TIME_BUCKETS.find((b) => b.key === t)?.label ?? t}`, onRemove: () => setDepTimeFilters((prev) => toggled(prev, t)) }),
    );
    arrTimeFilters.forEach((t) =>
      chips.push({ key: `arr-${t}`, label: `Arrives: ${TIME_BUCKETS.find((b) => b.key === t)?.label ?? t}`, onRemove: () => setArrTimeFilters((prev) => toggled(prev, t)) }),
    );
    durationFilters.forEach((d) =>
      chips.push({ key: `dur-${d}`, label: DURATION_BUCKETS.find((b) => b.key === d)?.label ?? d, onRemove: () => setDurationFilters((prev) => toggled(prev, d)) }),
    );
    layoverFilters.forEach((c) => chips.push({ key: `layover-${c}`, label: `Via ${c}`, onRemove: () => setLayoverFilters((prev) => toggled(prev, c)) }));
    airlineFilters.forEach((a) => chips.push({ key: `airline-${a}`, label: a, onRemove: () => setAirlineFilters((prev) => toggled(prev, a)) }));
    if (minPrice !== null) chips.push({ key: "minPrice", label: `From ₹${minPrice.toLocaleString("en-IN")}`, onRemove: () => setMinPrice(null) });
    if (maxPrice !== null) chips.push({ key: "maxPrice", label: `Up to ₹${maxPrice.toLocaleString("en-IN")}`, onRemove: () => setMaxPrice(null) });
    if (refundableOnly) chips.push({ key: "refundable", label: "Refundable only", onRemove: () => setRefundableOnly(false) });
    return chips;
  }, [stopsFilter, depTimeFilters, arrTimeFilters, durationFilters, layoverFilters, airlineFilters, minPrice, maxPrice, refundableOnly]);

  function clearAllFilters() {
    setStopsFilter(new Set());
    setAirlineFilters(new Set());
    setDepTimeFilters(new Set());
    setArrTimeFilters(new Set());
    setDurationFilters(new Set());
    setLayoverFilters(new Set());
    setMinPrice(null);
    setMaxPrice(null);
    setRefundableOnly(false);
  }

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
    <div>
      <FlightDateStrip searchContext={searchContext} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        {appliedFilters.length > 0 ? (
          <div className="flat-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Applied filters</span>
              <button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-brand hover:underline">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {appliedFilters.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="flex items-center gap-1 rounded-full border border-brand/30 bg-brand/5 px-2.5 py-1 text-xs font-medium text-brand"
                >
                  {chip.label}
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flat-card p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Stops</p>
          <div className="mt-2 flex flex-col text-sm">
            {[0, 1, 2].map((s) => (
              <label key={s} className="filter-check justify-between">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={stopsFilter.has(s)} onChange={() => setStopsFilter((prev) => toggled(prev, s))} className="accent-brand" />
                  {STOPS_LABEL[s]}
                </span>
                <span className="text-xs text-slate-400">{stopsCounts[s] ?? 0}</span>
              </label>
            ))}
          </div>
          {refundableCount > 0 ? (
            <label className="filter-check mt-2 justify-between border-t border-slate-100 pt-3">
              <span className="flex items-center gap-2">
                <input type="checkbox" checked={refundableOnly} onChange={(e) => setRefundableOnly(e.target.checked)} className="accent-brand" />
                Refundable fares
              </span>
              <span className="text-xs text-slate-400">{refundableCount}</span>
            </label>
          ) : null}
        </div>

        {priceBounds.max > priceBounds.min ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Price range</p>
            <p className="mt-1 text-sm font-semibold text-navy-deep">
              ₹{(minPrice ?? priceBounds.min).toLocaleString("en-IN")} – ₹{(maxPrice ?? priceBounds.max).toLocaleString("en-IN")}
            </p>
            <div className="mt-2">
              <label className="text-[11px] text-slate-400">Min</label>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={minPrice ?? priceBounds.min}
                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice ?? priceBounds.max))}
                className="block w-full accent-brand"
              />
            </div>
            <div className="mt-1">
              <label className="text-[11px] text-slate-400">Max</label>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={maxPrice ?? priceBounds.max}
                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice ?? priceBounds.min))}
                className="block w-full accent-brand"
              />
            </div>
          </div>
        ) : null}

        {durationBounds.max > durationBounds.min ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Duration</p>
            <div className="mt-2 flex flex-col text-sm">
              {DURATION_BUCKETS.map((b) => (
                <label key={b.key} className="filter-check">
                  <input type="checkbox" checked={durationFilters.has(b.key)} onChange={() => setDurationFilters((prev) => toggled(prev, b.key))} className="accent-brand" />
                  {b.label}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flat-card p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Departure time</p>
          <div className="mt-2 flex flex-col text-sm">
            {TIME_BUCKETS.map((b) => (
              <label key={b.key} className="filter-check" title={b.range}>
                <input type="checkbox" checked={depTimeFilters.has(b.key)} onChange={() => setDepTimeFilters((prev) => toggled(prev, b.key))} className="accent-brand" />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flat-card p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Arrival time</p>
          <div className="mt-2 flex flex-col text-sm">
            {TIME_BUCKETS.map((b) => (
              <label key={b.key} className="filter-check" title={b.range}>
                <input type="checkbox" checked={arrTimeFilters.has(b.key)} onChange={() => setArrTimeFilters((prev) => toggled(prev, b.key))} className="accent-brand" />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        {airlineCounts.size > 0 ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Airline</p>
            <div className="mt-2 flex flex-col text-sm">
              {Array.from(airlineCounts.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([name, { code, count }]) => (
                  <label key={name} className="filter-check justify-between">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={airlineFilters.has(name)} onChange={() => setAirlineFilters((prev) => toggled(prev, name))} className="accent-brand" />
                      <AirlineLogo code={code} size={18} />
                      {name}
                    </span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </label>
                ))}
            </div>
          </div>
        ) : null}

        {layoverCities.length > 0 ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Layover city</p>
            <div className="mt-2 flex flex-col text-sm">
              {layoverCities.map((city) => (
                <label key={city} className="filter-check">
                  <input type="checkbox" checked={layoverFilters.has(city)} onChange={() => setLayoverFilters((prev) => toggled(prev, city))} className="accent-brand" />
                  Via {city}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <div>
        <FlightSearchSummaryBar context={searchContext} />
        <div className="flat-card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold text-navy-deep">
              Flights from {depCityLabel} <ArrowRight className="inline h-3.5 w-3.5" strokeWidth={2.5} /> {arrCityLabel}
            </p>
            <p className="text-xs text-slate-400">
              {searchContext.depCity} → {searchContext.arrCity} ·{" "}
              {result ? `${visibleOptions.length} of ${result.options.length} flight(s)` : "Searching…"}
              {polling ? " · still searching more airlines…" : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {SORT_TABS.map((tab) => (
              <button key={tab.key} type="button" className="tab-underline px-2" data-active={sortKey === tab.key} onClick={() => setSortKey(tab.key)}>
                {tab.label}
              </button>
            ))}
            <button type="button" onClick={runSearch} aria-label="Refresh results" className="ml-2 rounded-full border border-slate-200 p-1.5 text-slate-500 hover:border-brand hover:text-brand">
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flat-card">
            <FlightLoader message="Searching live fares across airlines…" />
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
              <FlightOptionCard
                key={option.id}
                option={option}
                query={searchContextToQuery(searchContext)}
                refId={result!.refId}
                badge={option.id === cheapestId ? "cheapest" : option.id === fastestId ? "fastest" : null}
              />
            ))}
            {polling ? (
              <>
                <ResultCardSkeleton />
                <ResultCardSkeleton />
              </>
            ) : null}
          </div>
        )}
      </div>
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

/** Skeleton placeholder shown below already-loaded results while the provider streams in more
 * airlines, so the page doesn't jump back to a full-screen spinner once real results exist. */
function ResultCardSkeleton() {
  return (
    <div className="flat-card animate-pulse p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-40 rounded bg-slate-100" />
          <div className="h-3 w-56 rounded bg-slate-100" />
        </div>
        <div className="h-6 w-16 shrink-0 rounded bg-slate-100" />
      </div>
    </div>
  );
}

const BADGE_LABEL: Record<"cheapest" | "fastest", string> = { cheapest: "Cheapest", fastest: "Fastest" };

function FlightOptionCard({
  option,
  query,
  refId,
  badge,
}: {
  option: FlightOptionDto;
  query: string;
  refId: string;
  badge?: "cheapest" | "fastest" | null;
}) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  if (!firstLeg || !lastLeg) return null;
  const seats = lowestSeatCount(option.fare.seatsAvailable);

  return (
    <div className="flat-card relative p-4">
      {badge ? (
        <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-deep shadow-sm">
          {BADGE_LABEL[badge]}
        </span>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AirlineLogo code={firstLeg.airlineCode} size={40} />
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

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500 hover:text-brand"
      >
        Flight details {detailsOpen ? <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} /> : <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />}
      </button>

      {detailsOpen ? (
        <div className="mt-3 flex flex-col gap-3">
          {option.legs.map((leg, idx) => {
            const prevLeg = idx > 0 ? option.legs[idx - 1] : undefined;
            return (
            <React.Fragment key={idx}>
              {prevLeg ? (
                <div className="ml-4 flex items-center gap-2 border-l-2 border-dashed border-slate-200 pl-3 text-xs text-slate-400">
                  Layover at {leg.depCityName || leg.depCode}
                  {` · ${formatMinutes(Math.max(0, Math.round((new Date(leg.depDateTime).getTime() - new Date(prevLeg.arrDateTime).getTime()) / 60000)))} wait`}
                </div>
              ) : null}
              <div className="rounded-lg bg-mist/60 p-3 text-xs text-slate-600">
                <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-navy-deep">
                  <AirlineLogo code={leg.airlineCode} size={18} />
                  {leg.airlineName} {leg.flightNo} · {leg.cabin} ({leg.fareClass}){leg.aircraftType ? ` · ${leg.aircraftType}` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <PlaneTakeoff className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                  <span>
                    {formatTime(leg.depDateTime)} · {leg.depAirportName || leg.depCode} ({leg.depCode}){leg.depTerminal ? `, Terminal ${leg.depTerminal}` : ""}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <PlaneLanding className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                  <span>
                    {formatTime(leg.arrDateTime)} · {leg.arrAirportName || leg.arrCode} ({leg.arrCode}){leg.arrTerminal ? `, Terminal ${leg.arrTerminal}` : ""}
                  </span>
                </div>
              </div>
            </React.Fragment>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
