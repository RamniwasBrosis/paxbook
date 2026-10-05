"use client";

import * as React from "react";
import { ChevronDown, Utensils } from "lucide-react";
import type { FlightSsrDto } from "@paxbook/types";
import { SsrPicker, sumSsrChoice, type PassengerSsrChoice } from "@/components/FlightSsr";

export function ssrHasOptions(ssr: FlightSsrDto | null | undefined): boolean {
  if (!ssr) return false;
  const leg = (l: FlightSsrDto["onward"] | undefined) => Boolean(l && (l.baggage.length > 0 || l.meals.length > 0));
  return leg(ssr.onward) || leg(ssr.return);
}

/**
 * Meals and extra baggage, as their own section after the traveller details (not inside each
 * traveller's form). One panel per traveller who can have add-ons; infants can't.
 */
export function FlightAddOns({
  passengers,
  ssr,
  choices,
  onChange,
}: {
  passengers: Array<{ fName: string; lName: string; pType: "A" | "C" | "I" }>;
  ssr: FlightSsrDto | null;
  choices: Record<number, PassengerSsrChoice>;
  onChange: (index: number, next: PassengerSsrChoice) => void;
}) {
  const [open, setOpen] = React.useState(0);
  if (!ssr || !ssrHasOptions(ssr)) return null;
  const eligible = passengers.map((p, index) => ({ ...p, index })).filter((p): p is typeof p & { pType: "A" | "C" } => p.pType !== "I");
  if (eligible.length === 0) return null;

  return (
    <section aria-labelledby="addons-title" className="flat-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-50">
          <Utensils className="h-5 w-5 text-orange-600" strokeWidth={2} />
        </span>
        <div>
          <h2 id="addons-title" className="font-display text-lg font-extrabold text-navy-deep">
            Meals &amp; extra baggage
          </h2>
          <p className="text-sm text-ink-muted">Optional. Pre-book for each traveller at airline prices.</p>
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {eligible.map((p) => {
          const isOpen = open === p.index;
          const added = sumSsrChoice(choices[p.index], ssr);
          const name = `${p.fName} ${p.lName}`.trim() || `Traveller ${p.index + 1}`;
          return (
            <li key={p.index}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : p.index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-mist/50 sm:px-6"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-deep font-display text-xs font-extrabold text-white">{p.index + 1}</span>
                  <span className="font-bold text-navy-deep">{name}</span>
                  <span className="text-xs font-semibold text-ink-muted">{p.pType === "A" ? "Adult" : "Child"}</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  {added > 0 ? <span className="font-bold text-emerald-700">+₹{added.toLocaleString("en-IN")}</span> : <span className="text-ink-muted">None added</span>}
                  <ChevronDown className={`h-4 w-4 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
                </span>
              </button>
              {isOpen ? (
                <div className="px-5 pb-5 sm:px-6 [&>div:first-child]:mt-0 [&>div:first-child]:border-t-0 [&>div:first-child]:pt-1">
                  <SsrPicker ssr={ssr} pType={p.pType} choice={choices[p.index]} onChange={(next) => onChange(p.index, next)} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
