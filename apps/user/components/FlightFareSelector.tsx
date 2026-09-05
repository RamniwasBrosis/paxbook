"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plane, Loader2, Luggage, ShieldCheck, ShieldOff, Utensils, Info } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto } from "@paxbook/types";
import { formatDateTimeLong, formatMinutes, getClientTenantHeader, searchContextFromParams } from "@/lib/flights";

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
      <div className="flat-card flex items-center justify-center gap-2 p-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading fare options…
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flat-card p-5">
        <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Flight details</p>
        <div className="flex flex-col gap-3">
          {legs.map((leg, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                <Plane className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-navy-deep">
                  {leg.airlineName} {leg.flightNo} · {leg.cabin}
                </p>
                <p className="text-slate-600">
                  {leg.depCityName} ({leg.depCode}) {formatDateTimeLong(leg.depDateTime)} → {leg.arrCityName} ({leg.arrCode}) {formatDateTimeLong(leg.arrDateTime)}
                </p>
                <p className="text-xs text-slate-400">Duration {formatMinutes(leg.durationMinutes)}{leg.layoverAirport ? ` · Layover at ${leg.layoverAirport}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-navy-deep">Choose your fare</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.options.map((option) => (
            <FareCard key={option.id} option={option} refId={result.refId} query={passThroughQuery} />
          ))}
        </div>
      </div>
    </div>
  );
}

const GST_LABELS: Record<number, string> = { 0: "GST not applicable", 1: "GST mandatory for this fare", 2: "GST invoice available on request" };

function FareCard({ option, refId, query }: { option: FlightOptionDto; refId: string; query: string }) {
  return (
    <div className="flat-card flex flex-col gap-3 p-5">
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
          {option.fare.refundable ? (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
          ) : (
            <ShieldOff className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
          )}
          {option.fare.refundable ? "Refundable" : "Non-refundable"}
        </span>
        {option.validation.freeMeal ? (
          <span className="flex items-center gap-1.5">
            <Utensils className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} /> Free meal included
          </span>
        ) : null}
        <span>Seats left: {option.fare.seatsAvailable || "—"}</span>
        {GST_LABELS[option.validation.gstIndicator] ? <span className="text-slate-400">{GST_LABELS[option.validation.gstIndicator]}</span> : null}
        {option.validation.remarks ? <span className="text-slate-400">{option.validation.remarks}</span> : null}
      </div>
      <Link
        href={`/flights/passengers?flightId=${option.id}&refId=${encodeURIComponent(refId)}&${query}`}
        className="mt-1 rounded-full bg-accent px-4 py-2.5 text-center text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
      >
        Continue with this fare
      </Link>
    </div>
  );
}
