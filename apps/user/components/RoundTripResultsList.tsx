"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plane, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto, SearchFlightRequestDto } from "@paxbook/types";
import { formatMinutes, formatTime, getClientTenantHeader, searchContextFromParams } from "@/lib/flights";
import { findAirport } from "@/lib/airports";
import { FlightLoader } from "@/components/FlightLoader";
import { AirlineLogo } from "@/components/AirlineLogo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const MAX_POLL_ATTEMPTS = 8;

interface LegSearchState {
  result: FlightSearchResultDto | null;
  loading: boolean;
  polling: boolean;
  error: string | null;
}

/** Runs a real one-way search for one leg, polling until the provider reports isComplete (per FTD's
 * own spec — large result sets stream back incomplete first and must be re-polled with the refID). */
function useLegSearch(context: SearchFlightRequestDto | null): LegSearchState {
  const [state, setState] = React.useState<LegSearchState>({ result: null, loading: true, polling: false, error: null });

  React.useEffect(() => {
    if (!context) {
      setState({ result: null, loading: false, polling: false, error: "Missing search details." });
      return;
    }
    let cancelled = false;
    setState({ result: null, loading: true, polling: false, error: null });

    async function poll(refID?: string, attempt = 0) {
      try {
        const res = await fetch(`${API_BASE_URL}/public/flights/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
          body: JSON.stringify({ ...context, refID }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Search failed.");
        if (cancelled) return;
        const data = json.data as FlightSearchResultDto;
        setState({ result: data, loading: false, polling: !data.isComplete && attempt < MAX_POLL_ATTEMPTS, error: null });
        if (!data.isComplete && attempt < MAX_POLL_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (!cancelled) await poll(data.refId, attempt + 1);
        }
      } catch (err) {
        if (!cancelled) setState({ result: null, loading: false, polling: false, error: err instanceof Error ? err.message : "Search failed." });
      }
    }
    void poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.depCity, context?.arrCity, context?.onDate, context?.adt, context?.chd, context?.inf, context?.cabin, context?.fareType]);

  return state;
}

export function RoundTripResultsList() {
  const router = useRouter();
  const params = useSearchParams();
  const searchContext = React.useMemo(() => searchContextFromParams(params), [params]);

  const onwardContext = React.useMemo<SearchFlightRequestDto | null>(
    () => (searchContext ? { ...searchContext, tripType: 0, reDate: undefined } : null),
    [searchContext],
  );
  const returnContext = React.useMemo<SearchFlightRequestDto | null>(
    () =>
      searchContext?.reDate
        ? { ...searchContext, tripType: 0, depCity: searchContext.arrCity, arrCity: searchContext.depCity, onDate: searchContext.reDate, reDate: undefined }
        : null,
    [searchContext],
  );

  const onward = useLegSearch(onwardContext);
  const returnLeg = useLegSearch(returnContext);

  const [selectedOnward, setSelectedOnward] = React.useState<FlightOptionDto | null>(null);
  const [selectedReturn, setSelectedReturn] = React.useState<FlightOptionDto | null>(null);

  if (!searchContext || !searchContext.reDate) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-slate-500">That round-trip search link looks incomplete.</p>
      </div>
    );
  }

  const depCityLabel = onward.result?.options[0]?.legs[0]?.depCityName || findAirport(searchContext.depCity)?.city || searchContext.depCity;
  const arrCityLabel = onward.result?.options[0]?.legs[0]?.arrCityName || findAirport(searchContext.arrCity)?.city || searchContext.arrCity;

  const combinedTotal = (selectedOnward?.fare.total ?? 0) + (selectedReturn?.fare.total ?? 0);

  function handleContinue() {
    if (!selectedOnward || !selectedReturn || !onward.result || !returnLeg.result || !onwardContext || !returnContext) return;
    const payload = {
      onward: { flightId: selectedOnward.id, refId: onward.result.refId, context: onwardContext },
      return: { flightId: selectedReturn.id, refId: returnLeg.result.refId, context: returnContext },
    };
    sessionStorage.setItem("pb_round_trip_selection", JSON.stringify(payload));
    router.push("/flights/round-trip/fare");
  }

  return (
    <div className="pb-28">
      <Link href="/flights" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
        ← Modify search
      </Link>
      <div className="flat-card mb-4 p-4">
        <p className="font-bold text-navy-deep">
          Flights from {depCityLabel} <ArrowRight className="inline h-3.5 w-3.5" strokeWidth={2.5} /> {arrCityLabel}, and back
        </p>
        <p className="text-xs text-slate-400">
          {searchContext.depCity} → {searchContext.arrCity} · {searchContext.adt} adult(s) · Round trip
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LegColumn
          title={`${searchContext.depCity} → ${searchContext.arrCity}`}
          subtitle="Select departure flight"
          state={onward}
          selected={selectedOnward}
          onSelect={setSelectedOnward}
        />
        <LegColumn
          title={`${searchContext.arrCity} → ${searchContext.depCity}`}
          subtitle="Select return flight"
          state={returnLeg}
          selected={selectedReturn}
          onSelect={setSelectedReturn}
        />
      </div>

      {selectedOnward || selectedReturn ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="shell flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <SelectionSummary label="Departure" option={selectedOnward} />
              <SelectionSummary label="Return" option={selectedReturn} />
            </div>
            <div className="flex items-center gap-4">
              {combinedTotal > 0 ? <p className="text-xl font-extrabold text-navy-deep">₹{combinedTotal.toLocaleString("en-IN")}</p> : null}
              <button
                type="button"
                disabled={!selectedOnward || !selectedReturn}
                onClick={handleContinue}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectionSummary({ label, option }: { label: string; option: FlightOptionDto | null }) {
  const leg = option?.legs[0];
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      {leg ? (
        <p className="font-semibold text-navy-deep">
          {leg.airlineCode}-{leg.flightNo} · {formatTime(leg.depDateTime)} → {formatTime(option!.legs[option!.legs.length - 1]!.arrDateTime)}
        </p>
      ) : (
        <p className="text-slate-400">Not selected</p>
      )}
    </div>
  );
}

function LegColumn({
  title,
  subtitle,
  state,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  state: LegSearchState;
  selected: FlightOptionDto | null;
  onSelect: (option: FlightOptionDto) => void;
}) {
  const sorted = React.useMemo(() => [...(state.result?.options ?? [])].sort((a, b) => a.fare.total - b.fare.total), [state.result]);

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-bold text-navy-deep">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      {state.loading ? (
        <div className="flat-card">
          <FlightLoader message="Searching live fares…" compact />
        </div>
      ) : state.error ? (
        <div className="flat-card p-6 text-center text-red-600">{state.error}</div>
      ) : sorted.length === 0 ? (
        <div className="flat-card p-6 text-center text-slate-500">{state.polling ? "Still searching more airlines…" : "No flights found for this date."}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((option) => (
            <LegOptionCard key={option.id} option={option} selected={selected?.id === option.id} onSelect={() => onSelect(option)} />
          ))}
          {state.polling ? <p className="flex items-center gap-1.5 text-xs text-slate-400"><Loader2 className="h-3 w-3 animate-spin" /> Still searching more airlines…</p> : null}
        </div>
      )}
    </div>
  );
}

function LegOptionCard({ option, selected, onSelect }: { option: FlightOptionDto; selected: boolean; onSelect: () => void }) {
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  if (!firstLeg || !lastLeg) return null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flat-card flex items-center justify-between gap-3 p-4 text-left transition-colors ${selected ? "border-2 border-brand bg-brand/5" : "hover:border-brand/40"}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
          {selected ? <CheckCircle2 className="h-5 w-5 text-brand" strokeWidth={2} /> : <Plane className="h-4 w-4" strokeWidth={1.75} />}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <AirlineLogo code={firstLeg.airlineCode} size={16} />
            {firstLeg.airlineName} {firstLeg.airlineCode}-{firstLeg.flightNo}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-navy-deep">{formatTime(firstLeg.depDateTime)}</span>
            <span className="text-slate-300">—— {formatMinutes(option.durationTotalMinutes)} ——</span>
            <span className="font-bold text-navy-deep">{formatTime(lastLeg.arrDateTime)}</span>
          </div>
          <p className="text-xs text-slate-400">{option.stops === 0 ? "Non-stop" : `${option.stops} stop${option.stops > 1 ? "s" : ""}`}</p>
        </div>
      </div>
      <p className="text-lg font-extrabold text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
    </button>
  );
}
