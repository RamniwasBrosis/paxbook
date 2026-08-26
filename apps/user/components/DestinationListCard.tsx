import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";

export function DestinationListCard({
  destination,
  startingPrice,
  tripCount,
}: {
  destination: DestinationDto;
  startingPrice?: number;
  tripCount?: number;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative h-44 overflow-hidden">
        {destination.heroImageUrl ? (
          <img
            src={destination.heroImageUrl}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-dark text-white/40">
            <span className="text-sm">{destination.name}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-navy-deep backdrop-blur-sm">
          <MapPin className="h-3 w-3" strokeWidth={2} />
          {destination.countryName}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg tracking-tight text-navy-deep">{destination.name}</h3>
        {destination.description ? <p className="line-clamp-2 text-sm text-slate-500">{destination.description}</p> : null}
        <div className="mt-auto flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <div>
            {startingPrice ? (
              <>
                <p className="text-[0.65rem] uppercase tracking-wider text-slate-400">Starting from</p>
                <LockedPrice amount={startingPrice} asLink={false} />
              </>
            ) : (
              <p className="text-xs text-slate-400">Ask for pricing</p>
            )}
          </div>
          {tripCount ? (
            <span className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors group-hover:border-brand group-hover:text-brand">
              {tripCount} {tripCount === 1 ? "trip" : "trips"}
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
