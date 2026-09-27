"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Luggage, ShieldCheck, ShieldOff, Utensils, Info, Plane, Armchair, ArrowLeft } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto } from "@paxbook/types";
import { formatDateTimeLong, formatMinutes, getClientTenantHeader, searchContextFromParams } from "@/lib/flights";
import { FlightLoader } from "@/components/FlightLoader";
import { AirlineLogo } from "@/components/AirlineLogo";
import { FareRulesLink } from "@/components/FareRulesLink";
import { FlightStepper, FLIGHT_JOURNEY_STEPS } from "@/components/FlightStepper";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export function FlightFareSelector() {
  const params = useSearchParams();
  const flightId = params.get("flightId");
  const refId = params.get("refId");
  const searchContext = React.useMemo(() => searchContextFromParams(params), [params]);
  const passThroughQuery = React.useMemo(() => {
    const p = new URLSearchParams(params);
    p.delete("flightId");
    return p.toString();
  }, [params]);

  const [result, setResult] = React.useState<FlightSearchResultDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!flightId || !refId) {
      setError("Missing flight details. Please search again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/public/flights/fare-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
      body: JSON.stringify({ flightID: Number(flightId), refID: refId }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Could not load fare options.");
        setResult(json.data as FlightSearchResultDto);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load fare options."))
      .finally(() => setLoading(false));
  }, [flightId, refId]);

  if (!flightId || !refId || !searchContext) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-slate-500">This flight link looks incomplete.</p>
        <Link href="/flights" className="mt-3 inline-block font-semibold text-brand hover:underline">
          Start a new search
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flat-card">
        <FlightLoader message="Loading fare options for this flight…" />
      </div>
    );
  }

  if (error || !result || result.options.length === 0) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-red-600">{error ?? "No fare options available for this flight."}</p>
        <Link href={`/flights/results?${passThroughQuery}`} className="mt-3 inline-block font-semibold text-brand hover:underline">
          ← Back to results
        </Link>
      </div>
    );
  }

  const legs = result.options[0]!.legs;
  const sortedOptions = [...result.options].sort((a, b) => a.fare.total - b.fare.total);
  const recommendedId =
    sortedOptions.find((o) => o.fare.refundable && !o.validation.isLowCostCarrier)?.id ?? sortedOptions[Math.floor(sortedOptions.length / 2)]?.id;

  const firstLeg = legs[0]!;
  const lastLeg = legs[legs.length - 1]!;
  const totalMinutes = legs.reduce((sum, l) => sum + l.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-7">
      <FlightStepper steps={FLIGHT_JOURNEY_STEPS} activeIndex={2} />
      <Link href={`/flights/results?${passThroughQuery}`} className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-navy-deep">
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back to results
      </Link>

      <section aria-label="Flight details" className="overflow-hidden rounded-[1.75rem] bg-navy-deep text-white shadow-float">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white">
              <AirlineLogo code={firstLeg.airlineCode} size={34} />
            </span>
            <div>
              <p className="font-bold">
                {legs.map((l) => `${l.airlineName} ${l.flightNo}`).join(" + ")}
              </p>
              <p className="text-xs text-white/70">{firstLeg.cabin}</p>
            </div>
          </div>
          <span className="script-eyebrow text-2xl !text-accent">Your flight</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-6 sm:gap-6 sm:px-7">
          <div>
            <p className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{firstLeg.depCode}</p>
            <p className="mt-1.5 text-sm font-semibold text-white/80">{firstLeg.depCityName}</p>
            <p className="mt-0.5 text-xs text-white/60">{formatDateTimeLong(firstLeg.depDateTime)}</p>
          </div>
          <div className="flex w-24 flex-col items-center gap-1 sm:w-48">
            <span className="text-xs font-semibold text-white/70">{formatMinutes(totalMinutes)}</span>
            <span className="flex w-full items-center" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="flex-1 border-t-2 border-dashed border-white/30" />
              <Plane className="h-5 w-5 text-accent" strokeWidth={2.25} />
            </span>
            <span className="text-xs font-bold text-accent">
              {legs.length === 1 ? "Non-stop" : `${legs.length - 1} stop${legs.length > 2 ? "s" : ""}`}
            </span>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{lastLeg.arrCode}</p>
            <p className="mt-1.5 text-sm font-semibold text-white/80">{lastLeg.arrCityName}</p>
            <p className="mt-0.5 text-xs text-white/60">{formatDateTimeLong(lastLeg.arrDateTime)}</p>
          </div>
        </div>
        {legs.length > 1 ? (
          <div className="border-t border-white/10 px-5 py-3 text-xs text-white/70 sm:px-7">
            {legs.map((l, i) => (
              <span key={i}>
                {i > 0 ? " · " : ""}
                {l.depCode}→{l.arrCode} {formatMinutes(l.durationMinutes)}
                {l.layoverAirport ? ` (layover ${l.layoverAirport})` : ""}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <div>
        <p className="script-eyebrow text-[1.7rem]">Pick what suits you</p>
        <h2 className="mb-5 font-display text-3xl font-extrabold tracking-tight text-navy-deep">Choose your fare</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedOptions.map((option, idx) => (
            <FareCard key={option.id} option={option} refId={result.refId} query={passThroughQuery} tierIndex={idx} recommended={option.id === recommendedId} />
          ))}
        </div>
      </div>

      {sortedOptions.length > 1 ? (
        <div>
          <h2 className="mb-4 font-display text-2xl font-extrabold tracking-tight text-navy-deep">Compare fares in detail</h2>
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-mist/60">
                  <th className="p-3 text-xs font-semibold uppercase text-slate-400">Feature</th>
                  {sortedOptions.map((option) => (
                    <th key={option.id} className="p-3">
                      <p className="font-bold text-navy-deep">{option.fare.fareTypeLabel || "Standard fare"}</p>
                      <p className="text-sm font-extrabold text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <ComparisonRow label="Baggage check-in" values={sortedOptions.map((o) => o.fare.baggageCheckIn || "—")} />
                <ComparisonRow label="Baggage cabin" values={sortedOptions.map((o) => o.fare.baggageCabin || "—")} />
                <ComparisonRow label="Refundable" values={sortedOptions.map((o) => (o.fare.refundable ? "Yes" : "No"))} />
                <ComparisonRow label="Free meal" values={sortedOptions.map((o) => (o.validation.freeMeal ? "Yes" : "No"))} />
                <ComparisonRow label="Seats left" values={sortedOptions.map((o) => o.fare.seatsAvailable || "—")} />
                <ComparisonRow label="GST" values={sortedOptions.map((o) => GST_LABELS[o.validation.gstIndicator] ?? "—")} />
              </tbody>
            </table>
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

function ComparisonRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="p-3 text-xs font-semibold uppercase text-slate-400">{label}</td>
      {values.map((v, idx) => (
        <td key={idx} className="p-3 text-slate-600">
          {v}
        </td>
      ))}
    </tr>
  );
}

function FareCard({
  option,
  refId,
  query,
  tierIndex,
  recommended,
}: {
  option: FlightOptionDto;
  refId: string;
  query: string;
  tierIndex: number;
  recommended: boolean;
}) {
  const tier = TIERS[tierIndex % TIERS.length]!;
  return (
    <div className={`flat-card relative flex flex-col overflow-hidden ${recommended ? "border-2 border-accent shadow-float" : ""}`}>
      {recommended ? (
        <span className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-navy-deep">Recommended</span>
      ) : null}
      <div className={`px-5 pb-4 pt-5 ${tier.head}`}>
        <p className={`flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide ${tier.ink}`}>
          {option.fare.fareTypeLabel || "Standard fare"}
          {option.validation.isLowCostCarrier ? <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">LCC</span> : null}
        </p>
        <p className="mt-2 font-display text-3xl font-extrabold text-navy-deep">₹{option.fare.total.toLocaleString("en-IN")}</p>
        <p className="text-xs text-ink-muted">
          Base ₹{option.fare.base.toLocaleString("en-IN")} + Tax ₹{option.fare.tax.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {option.fare.popupMessage ? (
          <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} /> {option.fare.popupMessage}
          </p>
        ) : null}
        <ul className="flex flex-col gap-2.5 text-sm text-navy-deep">
          <li className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50"><Luggage className="h-4 w-4 text-violet-600" strokeWidth={2} /></span>
            <span>Check-in {option.fare.baggageCheckIn || "—"} · Cabin {option.fare.baggageCabin || "—"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${option.fare.refundable ? "bg-green-50" : "bg-slate-100"}`}>
              {option.fare.refundable ? <ShieldCheck className="h-4 w-4 text-green-600" strokeWidth={2} /> : <ShieldOff className="h-4 w-4 text-ink-muted" strokeWidth={2} />}
            </span>
            <span className={option.fare.refundable ? "font-semibold text-green-700" : "text-ink-muted"}>{option.fare.refundable ? "Refundable" : "Non-refundable"}</span>
          </li>
          {option.validation.freeMeal ? (
            <li className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50"><Utensils className="h-4 w-4 text-orange-600" strokeWidth={2} /></span>
              Free meal included
            </li>
          ) : null}
          <li className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50"><Armchair className="h-4 w-4 text-blue-600" strokeWidth={2} /></span>
            Seats left: {option.fare.seatsAvailable || "—"}
          </li>
        </ul>
        {GST_LABELS[option.validation.gstIndicator] ? <p className="text-xs text-ink-muted">{GST_LABELS[option.validation.gstIndicator]}</p> : null}
        {option.validation.remarks ? <p className="text-xs text-ink-muted">{option.validation.remarks}</p> : null}
        <FareRulesLink flightId={option.id} />
        <Link
          href={`/flights/passengers?flightId=${option.id}&refId=${encodeURIComponent(refId)}&${query}`}
          className="mt-auto inline-flex h-12 items-center justify-center rounded-full bg-accent px-4 text-center text-sm font-extrabold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
        >
          Continue with this fare
        </Link>
      </div>
    </div>
  );
}
