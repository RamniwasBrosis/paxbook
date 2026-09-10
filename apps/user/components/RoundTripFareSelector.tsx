"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Luggage, ShieldCheck, ShieldOff, Info } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto, SearchFlightRequestDto } from "@paxbook/types";
import { formatDateTimeLong, formatMinutes, getClientTenantHeader } from "@/lib/flights";
import { FlightLoader } from "@/components/FlightLoader";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface StoredLegSelection {
  flightId: string;
  refId: string;
  context: SearchFlightRequestDto;
}
interface StoredSelection {
  onward: StoredLegSelection;
  return: StoredLegSelection;
}

interface LegFareState {
  options: FlightOptionDto[];
  loading: boolean;
  error: string | null;
  chosen: FlightOptionDto | null;
}

function useLegFareDetails(leg: StoredLegSelection | null): [LegFareState, (option: FlightOptionDto) => void] {
  const [state, setState] = React.useState<LegFareState>({ options: [], loading: true, error: null, chosen: null });

  React.useEffect(() => {
    if (!leg) {
      setState({ options: [], loading: false, error: "Missing flight selection.", chosen: null });
      return;
    }
    fetch(`${API_BASE_URL}/public/flights/fare-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
      body: JSON.stringify({ flightID: Number(leg.flightId), refID: leg.refId }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Could not load fare options.");
        const data = json.data as FlightSearchResultDto;
        setState({ options: data.options, loading: false, error: data.options.length === 0 ? "No fare options available." : null, chosen: data.options[0] ?? null });
      })
      .catch((err) => setState({ options: [], loading: false, error: err instanceof Error ? err.message : "Could not load fare options.", chosen: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leg?.flightId, leg?.refId]);

  const choose = React.useCallback((option: FlightOptionDto) => setState((s) => ({ ...s, chosen: option })), []);
  return [state, choose];
}

export function RoundTripFareSelector() {
  const router = useRouter();
  const [selection, setSelection] = React.useState<StoredSelection | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const raw = sessionStorage.getItem("pb_round_trip_selection");
    if (raw) {
      try {
        setSelection(JSON.parse(raw));
      } catch {
        setSelection(null);
      }
    }
    setLoaded(true);
  }, []);

  const [onwardState, chooseOnward] = useLegFareDetails(selection?.onward ?? null);
  const [returnState, chooseReturn] = useLegFareDetails(selection?.return ?? null);

  if (!loaded) {
    return (
      <div className="flat-card">
        <FlightLoader message="Loading your selected flights…" />
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-slate-500">Your flight selection was lost. Please search again.</p>
      </div>
    );
  }

  const combinedTotal = (onwardState.chosen?.fare.total ?? 0) + (returnState.chosen?.fare.total ?? 0);

  function handleContinue() {
    if (!onwardState.chosen || !returnState.chosen || !selection) return;
    sessionStorage.setItem(
      "pb_round_trip_fare",
      JSON.stringify({
        onward: { flightId: onwardState.chosen.id, refId: selection.onward.refId, context: selection.onward.context },
        return: { flightId: returnState.chosen.id, refId: selection.return.refId, context: selection.return.context },
      }),
    );
    router.push("/flights/round-trip/passengers");
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <button type="button" onClick={() => router.back()} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
        ← Back to results
      </button>
      <LegFareSection title="Departure" leg={selection.onward} state={onwardState} onChoose={chooseOnward} />
      <LegFareSection title="Return" leg={selection.return} state={returnState} onChoose={chooseReturn} />

      {onwardState.chosen || returnState.chosen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="shell flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">Roundtrip fare for {selection.onward.context.adt} adult(s)</p>
            <div className="flex items-center gap-4">
              <p className="text-xl font-extrabold text-navy-deep">₹{combinedTotal.toLocaleString("en-IN")}</p>
              <button
                type="button"
                disabled={!onwardState.chosen || !returnState.chosen}
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

const GST_LABELS: Record<number, string> = { 0: "GST not applicable", 1: "GST mandatory for this fare", 2: "GST invoice available on request" };

function LegFareSection({ title, leg, state, onChoose }: { title: string; leg: StoredLegSelection; state: LegFareState; onChoose: (o: FlightOptionDto) => void }) {
  const legs = state.options[0]?.legs ?? [];
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-navy-deep">{title}</p>
      {legs.length > 0 ? (
        <div className="flat-card mb-3 p-4">
          <div className="flex flex-col gap-2">
            {legs.map((flightLeg, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                  <Plane className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-navy-deep">
                    {flightLeg.airlineName} {flightLeg.flightNo} · {flightLeg.cabin}
                  </p>
                  <p className="text-slate-600">
                    {flightLeg.depCityName} ({flightLeg.depCode}) {formatDateTimeLong(flightLeg.depDateTime)} → {flightLeg.arrCityName} ({flightLeg.arrCode}){" "}
                    {formatDateTimeLong(flightLeg.arrDateTime)}
                  </p>
                  <p className="text-xs text-slate-400">Duration {formatMinutes(flightLeg.durationMinutes)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {state.loading ? (
        <div className="flat-card">
          <FlightLoader message="Loading fare options…" compact />
        </div>
      ) : state.error ? (
        <div className="flat-card p-6 text-center text-red-600">{state.error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.options.map((option) => (
            <button key={option.id} type="button" onClick={() => onChoose(option)} className={`flat-card flex flex-col gap-3 p-5 text-left ${state.chosen?.id === option.id ? "border-2 border-brand" : ""}`}>
              <div>
                <p className="flex items-center gap-1.5 font-bold text-navy-deep">
                  {option.fare.fareTypeLabel || "Standard fare"}
                  {option.validation.isLowCostCarrier ? <span className="rounded-full bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">LCC</span> : null}
                </p>
                <p className="text-2xl font-extrabold text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
                <p className="text-xs text-slate-400">
                  Base ₹{option.fare.base.toLocaleString("en-IN")} + Tax ₹{option.fare.tax.toLocaleString("en-IN")}
                </p>
              </div>
              {option.fare.popupMessage ? (
                <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} /> {option.fare.popupMessage}
                </p>
              ) : null}
              <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Luggage className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} /> Check-in: {option.fare.baggageCheckIn || "—"} · Cabin: {option.fare.baggageCabin || "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  {option.fare.refundable ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} /> : <ShieldOff className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />}
                  {option.fare.refundable ? "Refundable" : "Non-refundable"}
                </span>
                <span>Seats left: {option.fare.seatsAvailable || "—"}</span>
                {GST_LABELS[option.validation.gstIndicator] ? <span className="text-slate-400">{GST_LABELS[option.validation.gstIndicator]}</span> : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
