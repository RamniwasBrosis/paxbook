"use client";

import * as React from "react";
import { Check, Loader2, Minus, Sparkles } from "lucide-react";
import type { FlightOptionDto, FlightSearchResultDto } from "@paxbook/types";
import { formatBaggage, getClientTenantHeader } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** All fares of one flight (from Fare Details), cheapest first; empty when the lookup fails. */
export function useFareOptions(searchFlightId: string | null, refId: string | null): FlightOptionDto[] {
  const [options, setOptions] = React.useState<FlightOptionDto[]>([]);
  React.useEffect(() => {
    if (!searchFlightId || !refId) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/public/flights/fare-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
      body: JSON.stringify({ flightID: Number(searchFlightId), refID: refId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        setOptions([...(json.data as FlightSearchResultDto).options].sort((a, b) => a.fare.total - b.fare.total));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [searchFlightId, refId]);
  return options;
}

/**
 * "Get more benefits by upgrading your fare" (MakeMyTrip style): the other fares of the same flight
 * next to the chosen one, with what each adds. Picking one swaps the fare; the booking page then
 * re-checks the price with the provider.
 */
export function FareUpgradeCards({
  options,
  currentId,
  currentTotal,
  onChoose,
  label,
}: {
  options: FlightOptionDto[];
  currentId: string;
  currentTotal: number;
  onChoose: (option: FlightOptionDto) => void;
  label?: string;
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  if (options.length < 2) return null;

  return (
    <div>
      {label ? <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-muted">{label}</p> : null}
      <div role="radiogroup" aria-label={label ? `${label} fare` : "Fare"} className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-3">
        {options.map((o) => {
          const selected = o.id === currentId;
          const diff = Math.round((o.fare.total - currentTotal) * 100) / 100;
          const meal = o.validation.freeMeal;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pendingId !== null}
              onClick={() => {
                if (selected) return;
                setPendingId(o.id);
                onChoose(o);
              }}
              className={`flex w-[82%] shrink-0 snap-start flex-col rounded-2xl border-2 p-4 text-left transition-all sm:w-auto ${
                selected ? "border-brand-blue bg-gradient-to-br from-brand-blue-soft/70 to-white shadow-soft" : "border-slate-200 bg-white hover:border-brand-blue/50"
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-brand-blue" : "border-slate-300"}`}
                >
                  {selected ? <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold text-navy-deep">{selected ? "Your selection" : o.fare.fareTypeLabel || "Standard fare"}</span>
                  {selected ? <span className="block text-xs font-semibold text-ink-muted">{o.fare.fareTypeLabel || "Standard fare"}</span> : null}
                  <span className="mt-1 flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-xl font-extrabold text-navy-deep">₹{o.fare.total.toLocaleString("en-IN")}</span>
                    {!selected && diff !== 0 ? (
                      <span className={`text-xs font-bold ${diff > 0 ? "text-ink-muted" : "text-emerald-700"}`}>
                        {diff > 0 ? `+₹${diff.toLocaleString("en-IN")}` : `Save ₹${Math.abs(diff).toLocaleString("en-IN")}`}
                      </span>
                    ) : null}
                  </span>
                </span>
                {pendingId === o.id ? <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin text-brand-blue" /> : null}
              </span>
              <span className="my-3 block border-t border-dashed border-slate-200" />
              <ul className="flex flex-col gap-2 text-[13px] leading-snug text-navy-deep">
                <Benefit ok>Cabin bag {formatBaggage(o.fare.baggageCabin)}</Benefit>
                <Benefit ok>Check-in {formatBaggage(o.fare.baggageCheckIn)}</Benefit>
                <Benefit ok={o.fare.refundable}>{o.fare.refundable ? "Refundable, cancellation fee applies" : "Non-refundable"}</Benefit>
                <Benefit ok={meal}>{meal ? "Free meal included" : "Meals at extra cost"}</Benefit>
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Benefit({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full ${ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
        {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <Minus className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className={ok ? "" : "text-ink-muted"}>{children}</span>
    </li>
  );
}

export function FareUpgradeSection({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show) return null;
  return (
    <section aria-labelledby="fare-upgrade-title" className="flat-card p-5 sm:p-6">
      <h2 id="fare-upgrade-title" className="flex items-center gap-2 font-display text-xl font-extrabold text-navy-deep">
        <Sparkles className="h-5 w-5 text-accent-ink" strokeWidth={2.25} />
        Get more benefits by upgrading your fare
      </h2>
      <p className="mb-4 mt-1 text-sm text-ink-muted">Same flight, more included. Switch any time before you pay.</p>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
