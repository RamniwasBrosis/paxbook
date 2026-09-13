"use client";

import * as React from "react";
import { ArrowRight, Pencil, X } from "lucide-react";
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
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="flat-card mb-4 flex w-full flex-wrap items-center justify-between gap-2 p-3.5 text-left"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-bold text-navy-deep">{depLabel}</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300" strokeWidth={2.5} />
        <span className="font-bold text-navy-deep">{arrLabel}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">
          {formatSearchDate(context.onDate)}
          {context.reDate ? ` – ${formatSearchDate(context.reDate)}` : ""} · {paxCount} traveller{paxCount > 1 ? "s" : ""} ·{" "}
          {CABIN_LABELS[context.cabin] ?? context.cabin}
        </span>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-brand">
        <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} /> Edit search
      </span>
    </button>
  );
}
