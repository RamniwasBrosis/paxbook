"use client";

import * as React from "react";
import { Calendar, Pencil, Plane, Users, X } from "lucide-react";
import type { SearchFlightRequestDto } from "@paxbook/types";
import { CABIN_LABELS } from "@/lib/flights";
import { findAirport } from "@/lib/airports";
import { FlightSearchForm } from "@/components/FlightSearchForm";

function formatSearchDate(yyyymmdd: string): string {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd;
  const iso = `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return yyyymmdd;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/** Collapsed one-line recap of the active search, sticky at the top of the results page, that
 * expands into the full search form to edit — the MMT "edit search" pattern, so users don't have
 * to navigate back to /flights to change dates/pax/cities. */
export function FlightSearchSummaryBar({ context }: { context: SearchFlightRequestDto }) {
  const [expanded, setExpanded] = React.useState(false);
  const depLabel = findAirport(context.depCity)?.city ?? context.depCity;
  const arrLabel = findAirport(context.arrCity)?.city ?? context.arrCity;
  const paxCount = context.adt + context.chd + context.inf;

  if (expanded) {
    return (
      <div className="relative mb-4">
        <FlightSearchForm compact initialContext={context} />
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Close edit search"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-mist text-slate-500 hover:text-brand"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-5 overflow-hidden rounded-[1.75rem] bg-cream px-5 py-5 sm:px-8 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="min-w-0">
            <p className="font-display text-3xl font-extrabold leading-none text-navy-deep sm:text-4xl">{context.depCity}</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink-muted">{depLabel}</p>
          </div>
          <div className="relative flex w-20 shrink-0 items-center sm:w-36" aria-hidden="true">
            <span className="w-full border-t-2 border-dashed border-navy-deep/30" />
            <span className="absolute left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-navy-deep text-white shadow-soft">
              <Plane className="h-4 w-4" strokeWidth={2.25} />
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-3xl font-extrabold leading-none text-navy-deep sm:text-4xl">{context.arrCity}</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink-muted">{arrLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-navy-deep">
            <Calendar className="h-4 w-4 text-brand-blue" strokeWidth={2} />
            {formatSearchDate(context.onDate)}
            {context.reDate ? ` – ${formatSearchDate(context.reDate)}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-navy-deep">
            <Users className="h-4 w-4 text-violet-600" strokeWidth={2} />
            {paxCount} traveller{paxCount > 1 ? "s" : ""} · {CABIN_LABELS[context.cabin] ?? context.cabin}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-navy-deep px-4 text-sm font-bold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} /> Modify search
          </button>
        </div>
      </div>
    </div>
  );
}
