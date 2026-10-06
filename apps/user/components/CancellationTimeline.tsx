"use client";

import * as React from "react";
import type { FareRuleWindowDto, FareRulesDto } from "@paxbook/types";
import { getClientTenantHeader } from "@/lib/flights";
import { AirlineLogo } from "@/components/AirlineLogo";
import { FareRulesLink } from "@/components/FareRulesLink";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const HOUR = 60 * 60 * 1000;

interface Step {
  from: Date;
  to: Date;
  label: string;
}

function hours(value: number, type: 0 | 1): number {
  return type === 1 ? value * 24 : value;
}

function feeLabel(w: FareRuleWindowDto): string {
  if (w.amountType === 1) return w.amount >= 100 ? "No refund" : `${w.amount}% of fare`;
  return w.amount === 0 ? "Free" : `₹${w.amount.toLocaleString("en-IN")}`;
}

function when(d: Date, now: Date): { day: string; time: string } {
  if (Math.abs(d.getTime() - now.getTime()) < 60_000) return { day: "Now", time: "" };
  return {
    day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

/**
 * The airline's cancellation fee from now until departure, MakeMyTrip style: one coloured band per
 * fee window, cheapest first. Built only from FTD's structured fare rules (windows are hours before
 * departure); a fare with text-only rules shows the fare rules link instead of invented numbers.
 */
export function CancellationTimeline({
  flightId,
  route,
  depDateTime,
  airlineCode,
}: {
  flightId: string;
  /** "DEL-BOM": the journey's overall origin and destination, as FTD scopes its windows. */
  route: string;
  depDateTime: string;
  airlineCode: string;
}) {
  const [rules, setRules] = React.useState<FareRulesDto | null | "error">(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/public/flights/fare-rules?flightID=${encodeURIComponent(flightId)}`, { headers: getClientTenantHeader() })
      .then((res) => res.json())
      .then((json) => !cancelled && setRules(json.success ? (json.data as FareRulesDto) : "error"))
      .catch(() => !cancelled && setRules("error"));
    return () => {
      cancelled = true;
    };
  }, [flightId]);

  const steps = React.useMemo<Step[]>(() => {
    if (!rules || rules === "error" || rules.kind !== "structured") return [];
    const forRoute = rules.cancellation.filter((w) => w.journeySegment === route);
    const windows = (forRoute.length ? forRoute : rules.cancellation).slice().sort((a, b) => hours(b.start, b.startType) - hours(a.start, a.startType));
    const departure = new Date(depDateTime);
    const now = new Date();
    const out: Step[] = [];
    for (const w of windows) {
      const from = new Date(Math.max(now.getTime(), departure.getTime() - hours(w.end, w.endType) * HOUR));
      const to = new Date(departure.getTime() - hours(w.start, w.startType) * HOUR);
      if (to <= now || from >= to) continue;
      out.push({ from, to, label: feeLabel(w) });
    }
    const last = out[out.length - 1];
    if (last && last.to < departure) out.push({ from: last.to, to: departure, label: "No refund" });
    return out;
  }, [rules, route, depDateTime]);

  const header = (
    <p className="flex items-center gap-2 text-sm font-extrabold text-navy-deep">
      <AirlineLogo code={airlineCode} size={22} />
      {route}
    </p>
  );

  if (rules === null) {
    return (
      <div>
        {header}
        <div className="mt-3 h-14 animate-pulse rounded-xl bg-mist" />
      </div>
    );
  }
  if (steps.length === 0) {
    return (
      <div>
        {header}
        <p className="mt-2 text-sm text-ink-muted">The airline shares this fare&apos;s cancellation terms as text only.</p>
        <div className="mt-1 [&_button]:text-sm">
          <FareRulesLink flightId={flightId} />
        </div>
      </div>
    );
  }

  const now = new Date();
  const tones = ["bg-emerald-500", "bg-lime-500", "bg-amber-400", "bg-orange-500", "bg-red-500"];
  const tone = (i: number) => (steps[i]!.label === "No refund" ? "bg-red-500" : tones[Math.min(i, tones.length - 2)]!);

  return (
    <div>
      {header}
      {/* Wide screens: a band per window with the fee above and the cut-off times below. */}
      <div className="mt-3 hidden sm:block">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => (
            <p key={i} className={`pb-1.5 text-center font-display text-base font-extrabold ${s.label === "No refund" ? "text-red-600" : "text-navy-deep"}`}>
              {s.label}
            </p>
          ))}
        </div>
        <div className="flex h-2 overflow-hidden rounded-full">
          {steps.map((_, i) => (
            <span key={i} className={`flex-1 ${tone(i)} ${i > 0 ? "border-l-2 border-white" : ""}`} />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs">
          {[steps[0]!.from, ...steps.map((s) => s.to)].map((d, i, all) => {
            const w = when(d, now);
            return (
              <span key={i} className={`leading-tight ${i === 0 ? "text-left" : i === all.length - 1 ? "text-right" : "text-center"}`}>
                <span className="block font-bold text-navy-deep">{i === all.length - 1 ? "Departure" : w.day}</span>
                <span className="text-ink-muted">{i === all.length - 1 ? `${when(d, now).day}, ${when(d, now).time}` : w.time}</span>
              </span>
            );
          })}
        </div>
      </div>
      {/* Phones: the same windows as a list. */}
      <ol className="mt-3 space-y-2 sm:hidden">
        {steps.map((s, i) => {
          const a = when(s.from, now);
          const b = when(s.to, now);
          return (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className={`h-8 w-1.5 shrink-0 rounded-full ${tone(i)}`} />
              <span className="flex-1 text-ink-muted">
                {a.day}
                {a.time ? `, ${a.time}` : ""} → {i === steps.length - 1 ? "departure" : `${b.day}, ${b.time}`}
              </span>
              <span className={`font-extrabold ${s.label === "No refund" ? "text-red-600" : "text-navy-deep"}`}>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** "Cancellation policy" section for the booking page, one timeline per direction. */
export function CancellationPolicySection({ journeys }: { journeys: Array<{ flightId: string; route: string; depDateTime: string; airlineCode: string }> }) {
  return (
    <section aria-labelledby="cancel-policy-title" className="flat-card p-5 sm:p-6">
      <h2 id="cancel-policy-title" className="font-display text-xl font-extrabold text-navy-deep">
        Cancellation policy
      </h2>
      <p className="mt-1 text-sm text-ink-muted">Airline cancellation fee per traveller, depending on when you cancel. Paxbook&apos;s service fee is not refundable.</p>
      <div className="mt-5 flex flex-col gap-6 divide-y divide-slate-100 [&>*+*]:pt-6">
        {journeys.map((j) => (
          <CancellationTimeline key={`${j.flightId}-${j.route}`} {...j} />
        ))}
      </div>
    </section>
  );
}
