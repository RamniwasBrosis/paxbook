import Link from "next/link";
import type { DestinationDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";

export function DestinationCard({ destination, startingPrice }: { destination: DestinationDto; startingPrice?: number }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative block h-64 overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
    >
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-white/70">{destination.countryName}</p>
        <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">{destination.name}</h3>
        {destination.description ? <p className="mt-0.5 line-clamp-2 text-sm text-white/80">{destination.description}</p> : null}
        {startingPrice ? (
          <div className="mt-2 border-t border-white/20 pt-2">
            <p className="text-[0.65rem] uppercase tracking-wider text-white/60">Starting from</p>
            <LockedPrice amount={startingPrice} asLink={false} colorClassName="text-accent" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
