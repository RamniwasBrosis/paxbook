"use client";

import * as React from "react";
import type {
  FlightBaggageOptionDto,
  FlightMealOptionDto,
  FlightPassengerSsrInputDto,
  FlightSeatLookupResultDto,
  FlightSsrDto,
} from "@paxbook/types";

export interface SsrLegChoice {
  baggageId?: string;
  mealIds?: string[];
  seatId?: string;
}
export interface PassengerSsrChoice {
  onward?: SsrLegChoice;
  return?: SsrLegChoice;
}

/** Sums the real amounts of a passenger's chosen options against the SSR list actually quoted —
 * display-only; the server independently re-validates and recomputes this from scratch on submit. */
export function sumSsrChoice(choice: PassengerSsrChoice | undefined, ssr: FlightSsrDto | null): number {
  if (!choice || !ssr) return 0;
  const addLeg = (leg: SsrLegChoice | undefined, legSsr: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] } | undefined) => {
    if (!leg || !legSsr) return 0;
    let sum = 0;
    if (leg.baggageId) sum += legSsr.baggage.find((b) => b.id === leg.baggageId)?.amount ?? 0;
    for (const mealId of leg.mealIds ?? []) sum += legSsr.meals.find((m) => m.id === mealId)?.amount ?? 0;
    return sum;
  };
  return addLeg(choice.onward, ssr.onward) + addLeg(choice.return, ssr.return);
}

/** Seat prices live in the separately-fetched seat map, not FlightSsrDto — sums against whichever
 * seat maps were actually loaded (undefined for a fare with no seat map, e.g. skipped seat step). */
export function sumSeatChoice(choices: Record<number, PassengerSsrChoice>, seatMap: FlightSeatLookupResultDto | null): number {
  if (!seatMap) return 0;
  const flatten = (maps: typeof seatMap.onward | undefined) => (maps ?? []).flatMap((m) => m.seatMap);
  const onwardSeats = flatten(seatMap.onward);
  const returnSeats = flatten(seatMap.return);
  let sum = 0;
  for (const choice of Object.values(choices)) {
    if (choice.onward?.seatId) sum += onwardSeats.find((s) => s.seatID === choice.onward!.seatId)?.seatAmt ?? 0;
    if (choice.return?.seatId) sum += returnSeats.find((s) => s.seatID === choice.return!.seatId)?.seatAmt ?? 0;
  }
  return sum;
}

/** Drops empty legs so the create-booking payload only ever carries a passenger's real selections. */
export function cleanSsrChoice(choice: PassengerSsrChoice | undefined): FlightPassengerSsrInputDto | undefined {
  if (!choice) return undefined;
  const cleanLeg = (leg: SsrLegChoice | undefined) => {
    if (!leg) return undefined;
    const mealIds = (leg.mealIds ?? []).filter(Boolean);
    if (!leg.baggageId && !leg.seatId && mealIds.length === 0) return undefined;
    return { ...(leg.baggageId ? { baggageId: leg.baggageId } : {}), ...(mealIds.length ? { mealIds } : {}), ...(leg.seatId ? { seatId: leg.seatId } : {}) };
  };
  const onward = cleanLeg(choice.onward);
  const returnLeg = cleanLeg(choice.return);
  if (!onward && !returnLeg) return undefined;
  return { ...(onward ? { onward } : {}), ...(returnLeg ? { return: returnLeg } : {}) };
}

const SSR_PAX_TYPE_LABEL: Record<"A" | "C", "Adult" | "Child"> = { A: "Adult", C: "Child" };

function ssrOptionMatchesPax(optionPaxType: "Adult" | "Child" | "All", pType: "A" | "C"): boolean {
  return optionPaxType === "All" || optionPaxType === SSR_PAX_TYPE_LABEL[pType];
}

/** Real, selectable baggage/meal add-ons for one passenger — "None" plus one radio per option,
 * grouped by leg direction and (for meals) by legRef, since a connecting flight's segments can each
 * offer different meals. Rendered inside each passenger's own card since FTD prices these per
 * passenger, per direction, not once for the whole booking. */
export function SsrPicker({
  ssr,
  pType,
  choice,
  onChange,
}: {
  ssr: FlightSsrDto;
  pType: "A" | "C";
  choice: PassengerSsrChoice | undefined;
  onChange: (next: PassengerSsrChoice) => void;
}) {
  function setBaggage(direction: "onward" | "return", baggageId: string | undefined) {
    const legChoice = choice?.[direction] ?? {};
    onChange({ ...choice, [direction]: { ...legChoice, baggageId } });
  }

  function setMeal(direction: "onward" | "return", legMeals: FlightMealOptionDto[], mealId: string | undefined) {
    const legChoice = choice?.[direction] ?? {};
    const otherIds = (legChoice.mealIds ?? []).filter((id) => !legMeals.some((m) => m.id === id));
    onChange({ ...choice, [direction]: { ...legChoice, mealIds: mealId ? [...otherIds, mealId] : otherIds } });
  }

  function renderLeg(direction: "onward" | "return", legSsr: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] } | undefined, label: string) {
    if (!legSsr) return null;
    const baggageOptions = legSsr.baggage.filter((b) => ssrOptionMatchesPax(b.paxType, pType));
    const mealsByLegRef = new Map<number, FlightMealOptionDto[]>();
    legSsr.meals
      .filter((m) => ssrOptionMatchesPax(m.paxType, pType))
      .forEach((m) => mealsByLegRef.set(m.legRef, [...(mealsByLegRef.get(m.legRef) ?? []), m]));
    if (baggageOptions.length === 0 && mealsByLegRef.size === 0) return null;

    const legChoice = choice?.[direction];

    return (
      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-3 font-display text-sm font-bold text-navy-deep">{label} extras</p>
        {baggageOptions.length > 0 ? (
          <div className="mb-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-700">Extra baggage</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-navy-deep transition-colors hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                <input type="radio" checked={!legChoice?.baggageId} onChange={() => setBaggage(direction, undefined)} className="accent-brand" />
                None
              </label>
              {baggageOptions.map((b) => (
                <label key={b.id} className="flex items-center justify-between gap-2 cursor-pointer rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-navy-deep transition-colors hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                  <span className="flex items-center gap-2">
                    <input type="radio" checked={legChoice?.baggageId === b.id} onChange={() => setBaggage(direction, b.id)} className="accent-brand" />
                    {b.description}
                  </span>
                  <span className="shrink-0 whitespace-nowrap font-semibold text-navy-deep">+₹{b.amount.toLocaleString("en-IN")}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {Array.from(mealsByLegRef.entries()).map(([legRef, meals]) => {
          const chosenMealId = legChoice?.mealIds?.find((id) => meals.some((m) => m.id === id));
          return (
            <div key={legRef} className="mb-2 last:mb-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-orange-700">Meal{mealsByLegRef.size > 1 ? ` (segment ${legRef})` : ""}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-navy-deep transition-colors hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                  <input type="radio" checked={!chosenMealId} onChange={() => setMeal(direction, meals, undefined)} className="accent-brand" />
                  None
                </label>
                {meals.map((m) => (
                  <label key={m.id} className="flex items-center justify-between gap-2 cursor-pointer rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-navy-deep transition-colors hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                    <span className="flex items-center gap-2">
                      <input type="radio" checked={chosenMealId === m.id} onChange={() => setMeal(direction, meals, m.id)} className="accent-brand" />
                      {m.description}
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-semibold text-navy-deep">+₹{m.amount.toLocaleString("en-IN")}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {renderLeg("onward", ssr.onward, ssr.return ? "Departure" : "Flight")}
      {ssr.return ? renderLeg("return", ssr.return, "Return") : null}
    </>
  );
}
