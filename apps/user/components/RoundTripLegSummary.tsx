import type { FlightOptionDto } from "@paxbook/types";
import { formatMinutes, formatTime, journeyMinutes } from "@/lib/flights";
import { AirlineLogo } from "@/components/AirlineLogo";

/** One leg in the round-trip bottom bar (white on navy): airline, times, door-to-door duration, stops, fare. */
export function RoundTripLegSummary({ label, option }: { label: string; option: FlightOptionDto | null }) {
  const first = option?.legs[0];
  const last = option?.legs[option.legs.length - 1];
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</p>
      {option && first && last ? (
        <div className="mt-1 flex items-center gap-2.5">
          <span className="hidden h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-white sm:grid">
            <AirlineLogo code={first.airlineCode} size={24} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-white">
              {formatTime(first.depDateTime)} → {formatTime(last.arrDateTime)}
              <span className="ml-1.5 hidden font-semibold text-white/70 sm:inline">
                {first.depCode}–{last.arrCode}
              </span>
            </p>
            <p className="truncate text-xs text-white/70">
              {formatMinutes(journeyMinutes(option.legs))} · {option.stops === 0 ? "Non-stop" : `${option.stops} stop${option.stops > 1 ? "s" : ""}`} ·{" "}
              {first.airlineName}
              <span className="ml-1.5 hidden font-bold text-accent sm:inline">₹{option.fare.total.toLocaleString("en-IN")}</span>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm font-semibold text-white/50">Not selected yet</p>
      )}
    </div>
  );
}
