import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";

export function DestinationCustomizeCard({
  destination,
  href,
  tagline,
}: {
  destination: DestinationDto;
  href: string;
  tagline?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex w-[19rem] shrink-0 snap-start flex-col overflow-hidden rounded-t-full rounded-b-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:w-[23rem]"
    >
      <div className="relative h-[29rem] overflow-hidden sm:h-[34rem]">
        {destination.heroImageUrl ? (
          <img
            src={destination.heroImageUrl}
            alt={destination.name}
            className="img-zoom h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-dark text-white/40">
            <span className="text-sm">{destination.name}</span>
          </div>
        )}
        <div className="overlay-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          {tagline ? <p className="eyebrow on-dark-muted">{tagline}</p> : null}
          <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">{destination.name}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-slate-500">{destination.countryName}</span>
        <span className="flex items-center gap-1 text-sm font-bold text-brand transition-transform duration-300 group-hover:translate-x-1">
          Customize
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}
