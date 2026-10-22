import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";

/** Destinations listing card, same compact arched style as the customize-flow picks, with price and trip count. */
export function DestinationListCard({
  destination,
  startingPrice,
  tripCount,
}: {
  destination: DestinationDto;
  startingPrice?: number;
  tripCount?: number;
}) {
  const place = destination.countryName && destination.countryName !== destination.name ? `${destination.name}, ${destination.countryName}` : destination.name;
  const tag = destination.categoryNames[0];

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group flex flex-col items-center rounded-b-3xl rounded-t-[999px] border-2 border-sand-frame bg-white p-3 pb-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-navy-deep hover:shadow-card"
    >
      <span className="block aspect-[5/4] w-full overflow-hidden rounded-b-2xl rounded-t-[999px] bg-mist">
        {destination.heroImageUrl ? (
          <img src={destination.heroImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue to-navy-deep font-display font-bold text-white/80">{destination.name}</span>
        )}
      </span>
      <span className="mt-4 px-2 font-display text-lg font-bold leading-snug text-navy-deep">{place}</span>
      {destination.description ? <span className="mt-1 line-clamp-1 px-3 text-sm text-ink-muted">{destination.description}</span> : null}
      <span aria-hidden="true" className="my-3 h-px w-16 bg-sand-frame" />
      <span className="flex items-baseline gap-1.5 text-xs text-ink-muted">
        {startingPrice ? (
          <>
            from <LockedPrice amount={startingPrice} size="sm" asLink={false} colorClassName="text-navy-deep" />
          </>
        ) : (
          "Ask for pricing"
        )}
      </span>
      <span className="mt-3 flex flex-wrap justify-center gap-1.5 px-2">
        {tag ? (
          <span className="hidden rounded-full border border-slate-200 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-ink-muted sm:inline">{tag}</span>
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-navy-deep">
          {tripCount ? `${tripCount} ${tripCount === 1 ? "trip" : "trips"}` : "Explore"}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
        </span>
      </span>
    </Link>
  );
}
