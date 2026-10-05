import { Briefcase, Luggage, Clock } from "lucide-react";
import type { FlightFareDto, FlightLegDto } from "@paxbook/types";
import { CABIN_LABELS, formatBaggage, formatMinutes, formatTime, journeyMinutes } from "@/lib/flights";
import { AirlineLogo } from "@/components/AirlineLogo";
import { FareRulesLink } from "@/components/FareRulesLink";

function longDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * One direction of the booked journey on the booking page, MakeMyTrip style: route and date,
 * refund badge and fare rules, then each flight with times, airports and terminals, layovers in
 * between, and the baggage allowance.
 */
export function FlightTripDetails({ legs, fare, fareRulesFlightId }: { legs: FlightLegDto[]; fare: FlightFareDto; fareRulesFlightId: string }) {
  const first = legs[0];
  const last = legs[legs.length - 1];
  if (!first || !last) return null;
  const stops = legs.length - 1;

  return (
    <article className="flat-card relative overflow-hidden p-5 sm:p-6">
      <span className="absolute inset-y-6 left-0 w-1 rounded-r-full bg-brand-blue" aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-extrabold text-navy-deep sm:text-2xl">
            {first.depCityName} → {last.arrCityName}
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span className="rounded-lg bg-cream px-2.5 py-1 font-bold text-navy-deep">{longDate(first.depDateTime)}</span>
            <span className="font-semibold">
              {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`} · {formatMinutes(journeyMinutes(legs))}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-md px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
              fare.refundable ? "bg-emerald-600 text-white" : "bg-red-100 text-red-700"
            }`}
          >
            {fare.refundable ? "Cancellation fees apply" : "Non-refundable"}
          </span>
          <div className="[&_button]:text-sm">
            <FareRulesLink flightId={fareRulesFlightId} />
          </div>
        </div>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {legs.map((leg, i) => {
          const next = legs[i + 1];
          const layover = next ? Math.round((new Date(next.depDateTime).getTime() - new Date(leg.arrDateTime).getTime()) / 60000) : 0;
          return (
            <li key={i}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-bold text-navy-deep">
                  <AirlineLogo code={leg.airlineCode} size={26} />
                  {leg.airlineName}
                  <span className="font-semibold text-ink-muted">
                    {leg.airlineCode} {leg.flightNo}
                  </span>
                  {leg.aircraftType ? <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">{leg.aircraftType}</span> : null}
                </p>
                <p className="text-xs font-semibold text-ink-muted">
                  {CABIN_LABELS[leg.cabin] ?? leg.cabin}
                  {fare.fareTypeLabel ? (
                    <>
                      {" "}
                      &gt; <span className="font-extrabold uppercase text-emerald-700">{fare.fareTypeLabel}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="grid grid-cols-[4.75rem_1rem_minmax(0,1fr)] gap-x-3 rounded-2xl bg-mist/70 px-4 py-4 sm:grid-cols-[5.25rem_1rem_minmax(0,1fr)] sm:px-5">
                <TimelineStop time={leg.depDateTime} city={leg.depCityName} code={leg.depCode} airport={leg.depAirportName} terminal={leg.depTerminal} />
                <span />
                <span className="mx-auto h-full min-h-8 border-l-2 border-dashed border-slate-300" aria-hidden="true" />
                <span className="self-center py-2 text-xs font-semibold text-ink-muted">{formatMinutes(leg.durationMinutes)}</span>
                <TimelineStop time={leg.arrDateTime} city={leg.arrCityName} code={leg.arrCode} airport={leg.arrAirportName} terminal={leg.arrTerminal} />
              </div>
              {next ? (
                <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-900">
                  <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {layover > 0 ? `${formatMinutes(layover)} layover in ${leg.arrCityName}` : `Connection in ${leg.arrCityName}`}
                  {next.flightNo !== leg.flightNo || next.airlineCode !== leg.airlineCode ? " · Change of planes" : ""}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-navy-deep sm:flex-row sm:flex-wrap sm:gap-x-8">
        <p className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-accent-ink" strokeWidth={2} />
          <span className="font-bold">Cabin baggage:</span> {formatBaggage(fare.baggageCabin)} / Adult
        </p>
        <p className="flex items-center gap-2">
          <Luggage className="h-4 w-4 text-accent-ink" strokeWidth={2} />
          <span className="font-bold">Check-in baggage:</span> {formatBaggage(fare.baggageCheckIn)} / Adult
        </p>
      </div>
    </article>
  );
}

/** Three cells of the timeline grid: time and date, the dot, then the city and airport. */
function TimelineStop({ time, city, code, airport, terminal }: { time: string; city: string; code: string; airport: string; terminal: string | null }) {
  return (
    <>
      <div className="leading-tight">
        <p className="whitespace-nowrap font-display text-base font-extrabold text-navy-deep">{formatTime(time)}</p>
        <p className="text-[11px] font-semibold text-ink-muted">{shortDate(time)}</p>
      </div>
      <span className="mx-auto mt-1 h-3.5 w-3.5 rounded-full border-2 border-slate-400 bg-white" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-bold text-navy-deep">
          {city} <span className="font-semibold text-ink-muted">({code})</span>
        </p>
        <p className="text-sm text-ink-muted">
          {airport}
          {terminal ? `, Terminal ${terminal}` : ""}
        </p>
      </div>
    </>
  );
}
