import { Plane, Clock } from "lucide-react";
import type { FlightLegDto } from "@paxbook/types";
import { formatMinutes, formatTime, journeyMinutes } from "@/lib/flights";
import { AirlineLogo } from "@/components/AirlineLogo";

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

function stopsLabel(legs: FlightLegDto[]): string {
  return legs.length <= 1 ? "Non-stop" : `${legs.length - 1} stop${legs.length > 2 ? "s" : ""} · via ${legs.slice(0, -1).map((l) => l.arrCode).join(", ")}`;
}

/**
 * The selected flight, MakeMyTrip style: a navy summary with the door-to-door time, then each
 * segment with its own times, airports and terminals, and the layover between segments.
 */
export function FlightJourneyCard({ legs, label }: { legs: FlightLegDto[]; label: string }) {
  const first = legs[0];
  const last = legs[legs.length - 1];
  if (!first || !last) return null;
  const total = journeyMinutes(legs);
  const carriers = [...new Map(legs.map((l) => [l.airlineCode, l.airlineName])).entries()];

  return (
    <section aria-label={`${label} flight details`} className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-float">
      <div className="bg-navy-deep text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 -space-x-2">
              {carriers.map(([code]) => (
                <span key={code} className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white ring-2 ring-navy-deep">
                  <AirlineLogo code={code} size={34} />
                </span>
              ))}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold">{carriers.map(([, name]) => name).join(" + ")}</p>
              <p className="text-xs text-white/70">
                {formatDay(first.depDateTime)} · {first.cabin}
              </p>
            </div>
          </div>
          <span className="script-eyebrow text-2xl !text-accent">{label}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-6 sm:gap-6 sm:px-7">
          <div>
            <p className="whitespace-nowrap font-display text-xl font-extrabold leading-none sm:text-3xl">{formatTime(first.depDateTime)}</p>
            <p className="mt-1.5 text-xs font-semibold text-white/85 sm:text-sm">
              {first.depCityName} <span className="text-white/60">({first.depCode})</span>
            </p>
          </div>
          <div className="flex w-20 flex-col items-center gap-1 sm:w-44">
            <span className="flex items-center gap-1 text-xs font-bold text-white">
              <Clock className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
              {formatMinutes(total)}
            </span>
            <span className="flex w-full items-center" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="flex-1 border-t-2 border-dashed border-white/30" />
              <Plane className="h-5 w-5 text-accent" strokeWidth={2.25} />
            </span>
            <span className="text-center text-[11px] font-bold leading-tight text-accent">{stopsLabel(legs)}</span>
          </div>
          <div className="text-right">
            <p className="whitespace-nowrap font-display text-xl font-extrabold leading-none sm:text-3xl">{formatTime(last.arrDateTime)}</p>
            <p className="mt-1.5 text-xs font-semibold text-white/85 sm:text-sm">
              {last.arrCityName} <span className="text-white/60">({last.arrCode})</span>
            </p>
          </div>
        </div>
      </div>

      <ol className="px-5 py-5 sm:px-7">
        {legs.map((leg, i) => {
          const next = legs[i + 1];
          const layover = next ? Math.round((new Date(next.depDateTime).getTime() - new Date(leg.arrDateTime).getTime()) / 60000) : 0;
          const planeChange = next ? next.airlineCode !== leg.airlineCode || next.flightNo !== leg.flightNo : false;
          const terminalChange = next ? Boolean(leg.arrTerminal && next.depTerminal && leg.arrTerminal !== next.depTerminal) : false;
          return (
            <li key={i}>
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <AirlineLogo code={leg.airlineCode} size={18} />
                <span className="font-bold text-navy-deep">
                  {leg.airlineName} {leg.airlineCode}-{leg.flightNo}
                </span>
                <span>· {leg.cabin}</span>
                {leg.aircraftType ? <span className="hidden sm:inline">· {leg.aircraftType}</span> : null}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-5">
                <SegmentEnd time={leg.depDateTime} code={leg.depCode} city={leg.depCityName} airport={leg.depAirportName} terminal={leg.depTerminal} />
                <div className="flex w-16 flex-col items-center pt-1.5 sm:w-28">
                  <span className="text-[11px] font-bold text-ink-muted">{formatMinutes(leg.durationMinutes)}</span>
                  <span className="mt-1 flex w-full items-center" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <span className="flex-1 border-t-2 border-slate-200" />
                    <Plane className="h-3.5 w-3.5 text-brand-blue" strokeWidth={2.25} />
                  </span>
                </div>
                <SegmentEnd align="right" time={leg.arrDateTime} code={leg.arrCode} city={leg.arrCityName} airport={leg.arrAirportName} terminal={leg.arrTerminal} />
              </div>
              {next ? (
                <div className="my-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-semibold text-amber-900">
                  <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  {layover > 0 ? `${formatMinutes(layover)} layover in ${leg.arrCityName}` : `Connection in ${leg.arrCityName}`}
                  {planeChange ? <span className="font-bold">· Change of planes</span> : null}
                  {terminalChange ? <span className="font-bold">· Terminal change</span> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SegmentEnd({
  time,
  code,
  city,
  airport,
  terminal,
  align = "left",
}: {
  time: string;
  code: string;
  city: string;
  airport: string;
  terminal: string | null;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="whitespace-nowrap font-display text-lg font-extrabold leading-none text-navy-deep sm:text-xl">{formatTime(time)}</p>
      <p className="mt-1 text-xs font-semibold text-ink-muted">{formatDay(time)}</p>
      <p className="mt-1.5 text-sm font-bold text-navy-deep">
        {city} ({code})
      </p>
      {airport ? <p className="text-xs leading-snug text-ink-muted">{airport}</p> : null}
      {terminal ? <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-blue">Terminal {terminal}</p> : null}
    </div>
  );
}
