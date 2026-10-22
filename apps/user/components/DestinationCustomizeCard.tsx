import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";

/**
 * Destination pick in the customize flow (Pickyourtrail style): a compact arched card with the
 * photo inset, "Name, Country", a one-line tagline and the travel-style tags.
 */
export function DestinationCustomizeCard({
  destination,
  href,
  tagline,
}: {
  destination: DestinationDto;
  href: string;
  tagline?: string;
}) {
  const place = destination.countryName && destination.countryName !== destination.name ? `${destination.name}, ${destination.countryName}` : destination.name;
  const tags = destination.categoryNames.slice(0, 2);

  return (
    <Link
      href={href}
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
      {tagline ? <span className="mt-1 line-clamp-1 px-3 text-sm text-ink-muted">{tagline}</span> : null}
      <span aria-hidden="true" className="my-3 h-px w-16 bg-sand-frame" />
      <span className="flex flex-wrap justify-center gap-1.5 px-2">
        {tags.map((t, i) => (
          <span key={t} className={`${i > 0 ? "hidden sm:inline" : ""} rounded-full border border-slate-200 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-ink-muted`}>
            {t}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-navy-deep">
          Customize <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
        </span>
      </span>
    </Link>
  );
}
