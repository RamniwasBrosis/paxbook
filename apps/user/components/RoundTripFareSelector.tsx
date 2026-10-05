"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Luggage, ShieldCheck, ShieldOff, Info, Briefcase, Utensils, Armchair, Check } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto, SearchFlightRequestDto } from "@paxbook/types";
import { formatBaggage, formatSeatsLeft, getClientTenantHeader, seatsLeft } from "@/lib/flights";
import { FlightLoader } from "@/components/FlightLoader";
import { FlightJourneyCard } from "@/components/FlightJourneyCard";
import { RoundTripLegSummary } from "@/components/RoundTripLegSummary";
import { FareRulesLink } from "@/components/FareRulesLink";

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
  const { adt, chd, inf } = selection.onward.context;
  const travellers = adt + (chd ?? 0) + (inf ?? 0);

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
    <div className="flex flex-col gap-6 pb-44 md:pb-28">
      <button type="button" onClick={() => router.back()} className="inline-flex w-fit items-center gap-1 text-sm font-bold text-brand-blue hover:text-navy-deep">
        ← Back to results
      </button>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
        <LegFareSection title="Departure" leg={selection.onward} state={onwardState} onChoose={chooseOnward} />
        <LegFareSection title="Return" leg={selection.return} state={returnState} onChoose={chooseReturn} />
      </div>

      {onwardState.chosen || returnState.chosen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-navy-deep py-3 text-white shadow-[0_-8px_24px_rgba(18,42,99,0.25)] sm:py-4">
          <div className="shell flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid min-w-0 grid-cols-2 gap-4 md:flex md:gap-10">
              <RoundTripLegSummary label="Departure" option={onwardState.chosen} />
              <RoundTripLegSummary label="Return" option={returnState.chosen} />
            </div>
            <div className="flex items-center justify-between gap-4 md:justify-end">
              <div className="leading-tight">
                <p className="font-display text-2xl font-extrabold text-accent">₹{combinedTotal.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-white/60">
                  Round trip for {travellers} traveller{travellers > 1 ? "s" : ""}, incl. taxes
                </p>
              </div>
              <button
                type="button"
                disabled={!onwardState.chosen || !returnState.chosen}
                onClick={handleContinue}
                className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-base font-extrabold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
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

const TIERS = [
  { head: "bg-blue-50", ink: "text-blue-700" },
  { head: "bg-green-50", ink: "text-green-700" },
  { head: "bg-violet-50", ink: "text-violet-700" },
  { head: "bg-orange-50", ink: "text-orange-700" },
];

function LegFareSection({ title, state, onChoose }: { title: string; leg: StoredLegSelection; state: LegFareState; onChoose: (o: FlightOptionDto) => void }) {
  const legs = state.options[0]?.legs ?? [];
  const sorted = React.useMemo(() => [...state.options].sort((a, b) => a.fare.total - b.fare.total), [state.options]);
  return (
    <div className="flex min-w-0 flex-col gap-5">
      {legs.length > 0 ? <FlightJourneyCard legs={legs} label={title} /> : <p className="font-display text-2xl font-extrabold text-navy-deep">{title}</p>}

      {state.loading ? (
        <div className="flat-card">
          <FlightLoader message="Loading fare options…" compact />
        </div>
      ) : state.error ? (
        <div className="flat-card p-6 text-center text-red-600">{state.error}</div>
      ) : (
        <div>
          <p className="mb-3 font-display text-lg font-extrabold text-navy-deep">
            Choose your {title.toLowerCase()} fare <span className="text-sm font-semibold text-ink-muted">· {sorted.length} option{sorted.length > 1 ? "s" : ""}</span>
          </p>
          <div role="radiogroup" aria-label={`${title} fare`} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {sorted.map((option, idx) => (
              <FareOptionCard key={option.id} option={option} tierIndex={idx} chosen={state.chosen?.id === option.id} onChoose={() => onChoose(option)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FareOptionCard({ option, tierIndex, chosen, onChoose }: { option: FlightOptionDto; tierIndex: number; chosen: boolean; onChoose: () => void }) {
  const tier = TIERS[tierIndex % TIERS.length]!;
  const seats = seatsLeft(option.fare.seatsAvailable);
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white transition-all duration-200 ${
        chosen ? "border-brand-blue shadow-float" : "border-slate-200/80 shadow-soft hover:border-brand-blue/40"
      }`}
    >
      <button type="button" role="radio" aria-checked={chosen} onClick={onChoose} className="flex flex-1 flex-col text-left">
        <div className={`flex items-start justify-between gap-3 px-5 pb-4 pt-5 ${tier.head}`}>
          <div>
            <p className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide ${tier.ink}`}>
              {option.fare.fareTypeLabel || "Standard fare"}
              {option.validation.isLowCostCarrier ? <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">LCC</span> : null}
            </p>
            <p className="mt-1.5 font-display text-[1.7rem] font-extrabold leading-none text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
            {tierIndex === 0 ? <p className="mt-1.5 text-[11px] font-bold text-green-700">Lowest fare</p> : null}
          </div>
          <span
            aria-hidden="true"
            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${chosen ? "border-brand-blue bg-brand-blue" : "border-slate-300 bg-white"}`}
          >
            {chosen ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} /> : null}
          </span>
        </div>
        <ul className="flex flex-col gap-2.5 px-5 py-4 text-sm text-navy-deep">
          {option.fare.popupMessage ? (
            <li className="flex items-start gap-1.5 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} /> {option.fare.popupMessage}
            </li>
          ) : null}
          <FareFeature icon={<Briefcase className="h-4 w-4 text-violet-600" strokeWidth={2} />} tint="bg-violet-50">
            Cabin <strong>{formatBaggage(option.fare.baggageCabin)}</strong>
          </FareFeature>
          <FareFeature icon={<Luggage className="h-4 w-4 text-blue-600" strokeWidth={2} />} tint="bg-blue-50">
            Check-in <strong>{formatBaggage(option.fare.baggageCheckIn)}</strong>
          </FareFeature>
          <FareFeature
            icon={option.fare.refundable ? <ShieldCheck className="h-4 w-4 text-green-600" strokeWidth={2} /> : <ShieldOff className="h-4 w-4 text-ink-muted" strokeWidth={2} />}
            tint={option.fare.refundable ? "bg-green-50" : "bg-slate-100"}
          >
            <span className={option.fare.refundable ? "font-semibold text-green-700" : "text-ink-muted"}>
              {option.fare.refundable ? "Refundable (cancellation fee applies)" : "Non-refundable"}
            </span>
          </FareFeature>
          {option.validation.freeMeal ? (
            <FareFeature icon={<Utensils className="h-4 w-4 text-orange-600" strokeWidth={2} />} tint="bg-orange-50">
              Free meal included
            </FareFeature>
          ) : null}
        </ul>
      </button>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
        {seats !== null ? (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${seats <= 5 ? "text-red-600" : "text-ink-muted"}`}>
            <Armchair className="h-3.5 w-3.5" strokeWidth={2.25} />
            {seats <= 5 ? `Only ${formatSeatsLeft(option.fare.seatsAvailable)}` : formatSeatsLeft(option.fare.seatsAvailable)}
          </span>
        ) : (
          <span />
        )}
        {GST_LABELS[option.validation.gstIndicator] ? <span className="text-[11px] text-ink-muted">{GST_LABELS[option.validation.gstIndicator]}</span> : null}
        <div className="w-full [&_button]:text-sm">
          <FareRulesLink flightId={option.id} />
        </div>
      </div>
    </div>
  );
}

function FareFeature({ icon, tint, children }: { icon: React.ReactNode; tint: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${tint}`}>{icon}</span>
      <span>{children}</span>
    </li>
  );
}
