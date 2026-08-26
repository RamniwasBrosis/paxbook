import Link from "next/link";
import { Search, MapPin, Star } from "lucide-react";
import type { DestinationDto, PublicStatsDto } from "@paxbook/types";

const CHIP_HUES = ["bg-brand", "bg-brand-blue", "bg-accent"];

export function ModernHero({
  backgroundImageUrl,
  stats,
  destinations = [],
}: {
  backgroundImageUrl?: string | null;
  stats?: PublicStatsDto;
  destinations?: DestinationDto[];
}) {
  const chips = destinations.slice(0, 4);

  return (
    <section className="bg-mist">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">Travel · Explore · Experience</p>
          <h1 className="font-display text-4xl leading-[1.15] tracking-tight text-navy-deep sm:text-6xl">Your Journey. Your Way.</h1>
          <p className="mt-5 max-w-md text-lg text-slate-600">
            Discover, customize and experience unforgettable journeys with Paxbook.
          </p>

          {stats?.averageRating ? (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-1 text-accent">
                <Star className="h-4 w-4 fill-accent" strokeWidth={0} />
                {stats.averageRating}/5
              </span>
              <span className="text-slate-300">·</span>
              <span>{stats.reviewCount}+ happy travellers</span>
            </div>
          ) : null}

          <form action="/packages" className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 focus-within:border-brand">
              <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
              <input
                name="destination"
                placeholder="Search countries, cities"
                className="w-full py-3 text-sm text-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:bg-accent-dark hover:shadow-md"
            >
              Start Planning
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/packages"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md"
            >
              Plan My Trip
            </Link>
            <Link
              href="/packages"
              className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-navy-deep transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
            >
              Explore Packages
            </Link>
          </div>

          {chips.length > 0 ? (
            <div className="mt-6 grid grid-cols-4 gap-2">
              {chips.map((d, i) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.slug}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${CHIP_HUES[i % CHIP_HUES.length]}`}>
                    <MapPin className="h-4 w-4 text-white" strokeWidth={2} />
                  </span>
                  <span className="font-display text-xs text-slate-600">{d.name}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {backgroundImageUrl ? (
            <img src={backgroundImageUrl} alt="" className="col-span-2 h-56 w-full rounded-2xl object-cover shadow-premium" />
          ) : (
            <div className="col-span-2 h-32 rounded-2xl bg-brand" />
          )}
          <div className="h-40 rounded-2xl bg-navy-deep shadow-sm" />
          <div className="h-40 rounded-2xl border border-brand/20 bg-white shadow-sm" />
        </div>
      </div>
    </section>
  );
}
