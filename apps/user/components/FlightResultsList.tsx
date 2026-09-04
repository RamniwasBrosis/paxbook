"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plane, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto } from "@paxbook/types";
import { formatMinutes, formatTime, getClientTenantHeader, searchContextFromParams, searchContextToQuery } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type SortKey = "price" | "duration" | "departure";

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

  const airlines = React.useMemo(() => {
    if (!result) return [];
    const set = new Set<string>();
    result.options.forEach((o) => o.legs[0] && set.add(o.legs[0].airlineName));
    return Array.from(set).sort();
  }, [result]);

  const visibleOptions = React.useMemo(() => {
    if (!result) return [];
    let options = result.options;
    if (maxStops !== null) options = options.filter((o) => o.stops <= maxStops);
    if (airlineFilter) options = options.filter((o) => o.legs[0]?.airlineName === airlineFilter);
    const sorted = [...options];
    if (sortKey === "price") sorted.sort((a, b) => a.fare.total - b.fare.total);
    if (sortKey === "duration") sorted.sort((a, b) => a.durationTotalMinutes - b.durationTotalMinutes);
    if (sortKey === "departure") sorted.sort((a, b) => new Date(a.legs[0]?.depDateTime ?? 0).getTime() - new Date(b.legs[0]?.depDateTime ?? 0).getTime());
    return sorted;
  }, [result, sortKey, maxStops, airlineFilter]);

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
        <div className="flat-card p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Stops</p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm">
            {[
              { label: "Any", value: null },
              { label: "Non-stop", value: 0 },
              { label: "1 stop or fewer", value: 1 },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2">
                <input type="radio" checked={maxStops === opt.value} onChange={() => setMaxStops(opt.value)} className="accent-brand" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        {airlines.length > 0 ? (
          <div className="flat-card p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Airline</p>
            <div className="mt-2 flex flex-col gap-1.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={airlineFilter === null} onChange={() => setAirlineFilter(null)} className="accent-brand" />
                All airlines
              </label>
              {airlines.map((a) => (
                <label key={a} className="flex items-center gap-2">
                  <input type="radio" checked={airlineFilter === a} onChange={() => setAirlineFilter(a)} className="accent-brand" />
                  {a}
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

function FlightOptionCard({ option, query, refId }: { option: FlightOptionDto; query: string; refId: string }) {
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  if (!firstLeg || !lastLeg) return null;

  return (
    <div className="flat-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
          <Plane className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-navy-deep">
            {firstLeg.airlineName} · {firstLeg.flightNo}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-bold text-navy-deep">{formatTime(firstLeg.depDateTime)}</span>
            <span>{firstLeg.depCode}</span>
            <span className="text-slate-300">—— {formatMinutes(option.durationTotalMinutes)} ——</span>
            <span className="font-bold text-navy-deep">{formatTime(lastLeg.arrDateTime)}</span>
            <span>{lastLeg.arrCode}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {option.stops === 0 ? "Non-stop" : `${option.stops} stop${option.stops > 1 ? "s" : ""}`} · {option.fare.baggageCheckIn || "Baggage per airline policy"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
        <p className="text-xl font-extrabold text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
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
