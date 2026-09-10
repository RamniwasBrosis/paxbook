import { Plane } from "lucide-react";

/** Branded loading state for the flight search/fare/booking flow — an animated plane over a moving
 * dashed "runway", matching the tone of major OTA loading screens without pulling in an external GIF.
 * `compact` shrinks it for narrower contexts (e.g. a single column of a round-trip side-by-side view). */
export function FlightLoader({ message = "Hold on, we're fetching flights for you", compact = false }: { message?: string; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${compact ? "p-6" : "p-12 gap-5"}`}>
      <div className={`relative overflow-hidden ${compact ? "h-10 w-40" : "h-14 w-64"}`}>
        <div
          className="absolute left-0 top-1/2 h-0.5 w-[200%] -translate-y-1/2 animate-runway bg-[repeating-linear-gradient(90deg,theme(colors.slate.200)_0px,theme(colors.slate.200)_16px,transparent_16px,transparent_32px)]"
          aria-hidden
        />
        <Plane className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fly text-brand ${compact ? "h-6 w-6" : "h-9 w-9"}`} strokeWidth={1.75} aria-hidden />
      </div>
      <p className={`font-semibold text-slate-500 ${compact ? "text-xs" : "text-sm"}`}>{message}</p>
    </div>
  );
}
