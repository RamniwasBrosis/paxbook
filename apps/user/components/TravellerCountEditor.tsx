"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, UserPlus, Users } from "lucide-react";
import type { SearchFlightRequestDto } from "@paxbook/types";
import { searchContextToQuery } from "@/lib/flights";

/** sessionStorage key the booking wizards read on mount to pre-fill names typed before the count changed. */
export const PAX_CARRY_KEY = "pb_flight_pax_carry";
const MAX_SEATS = 9;

type Counts = { adt: number; chd: number; inf: number };

/**
 * "Add traveller" on the passenger step. A fare is priced for an exact passenger mix (FTD's refId is
 * tied to it), so changing the count can't just add a form — it re-runs the search for the new group
 * and carries over any names already typed.
 */
export function TravellerCountEditor({
  context,
  passengersToCarry,
}: {
  context: SearchFlightRequestDto;
  passengersToCarry: unknown[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [counts, setCounts] = React.useState<Counts>({ adt: context.adt, chd: context.chd, inf: context.inf });

  const changed = counts.adt !== context.adt || counts.chd !== context.chd || counts.inf !== context.inf;
  const seats = counts.adt + counts.chd;
  const summary = [
    `${context.adt} Adult${context.adt > 1 ? "s" : ""}`,
    context.chd ? `${context.chd} Child${context.chd > 1 ? "ren" : ""}` : null,
    context.inf ? `${context.inf} Infant${context.inf > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function set(key: keyof Counts, next: number) {
    setCounts((c) => {
      const n = { ...c, [key]: next };
      if (n.inf > n.adt) n.inf = n.adt; // one infant per adult lap
      return n;
    });
  }

  function apply() {
    try {
      window.sessionStorage.setItem(PAX_CARRY_KEY, JSON.stringify(passengersToCarry));
    } catch {
      // storage blocked: the new search still works, names just need retyping
    }
    const path = context.tripType === 1 && context.serType === 1 ? "/flights/round-trip/results" : "/flights/results";
    router.push(`${path}?${searchContextToQuery({ ...context, ...counts })}`);
  }

  const rows: Array<{ key: keyof Counts; label: string; sub: string; min: number; max: number }> = [
    { key: "adt", label: "Adults", sub: "12+ years", min: 1, max: MAX_SEATS - counts.chd },
    { key: "chd", label: "Children", sub: "2–11 years", min: 0, max: MAX_SEATS - counts.adt },
    { key: "inf", label: "Infants", sub: "Under 2, on lap", min: 0, max: counts.adt },
  ];

  return (
    <div className="flat-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 text-sm font-semibold text-navy-deep">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-50">
            <Users className="h-4 w-4 text-violet-600" strokeWidth={2} />
          </span>
          Travelling: <span className="font-bold">{summary}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-navy-deep px-4 text-sm font-bold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
        >
          <UserPlus className="h-4 w-4" strokeWidth={2.25} />
          {open ? "Close" : "Add traveller"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-navy-deep">{r.label}</p>
                  <p className="text-xs text-ink-muted">{r.sub}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    aria-label={`Fewer ${r.label.toLowerCase()}`}
                    disabled={counts[r.key] <= r.min}
                    onClick={() => set(r.key, counts[r.key] - 1)}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-200 text-navy-deep hover:border-brand-blue disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  <span className="w-5 text-center font-display text-lg font-extrabold text-navy-deep" aria-live="polite">
                    {counts[r.key]}
                  </span>
                  <button
                    type="button"
                    aria-label={`More ${r.label.toLowerCase()}`}
                    disabled={counts[r.key] >= r.max}
                    onClick={() => set(r.key, counts[r.key] + 1)}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-slate-200 text-navy-deep hover:border-brand-blue disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Fares are priced for the exact group, so we&apos;ll re-check this flight for {seats + counts.inf} traveller{seats + counts.inf > 1 ? "s" : ""}. Names
            you&apos;ve already entered are kept. Max {MAX_SEATS} seats per booking.
          </p>
          <button
            type="button"
            disabled={!changed}
            onClick={apply}
            className="mt-3 inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-extrabold text-navy-deep transition-colors hover:bg-accent-dark disabled:opacity-40"
          >
            Update &amp; re-check fares
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Called by the wizards when they build fresh passenger slots: fills them, type by type and in order,
 * with the names carried over from a traveller-count change, then forgets the carried data.
 */
export function takeCarriedPassengers<T extends { pType: string }>(slots: T[]): T[] {
  let carried: Array<Record<string, unknown>> = [];
  try {
    carried = JSON.parse(window.sessionStorage.getItem(PAX_CARRY_KEY) ?? "[]");
    window.sessionStorage.removeItem(PAX_CARRY_KEY);
  } catch {
    return slots;
  }
  if (!Array.isArray(carried) || carried.length === 0) return slots;
  const pools: Record<string, Array<Record<string, unknown>>> = {};
  for (const c of carried) if (c && typeof c.pType === "string") (pools[c.pType] ??= []).push(c);
  return slots.map((slot) => {
    const c = pools[slot.pType]?.shift();
    if (!c) return slot;
    const keep = ["title", "fName", "lName", "gender", "dobIso"] as const;
    return { ...slot, ...Object.fromEntries(keep.filter((k) => typeof c[k] === "string").map((k) => [k, c[k]])) };
  });
}
