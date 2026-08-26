import Link from "next/link";
import { Search, Plane, Star, ArrowRight } from "lucide-react";
import type { DestinationDto, PublicStatsDto } from "@paxbook/types";
import { PlanTripButton } from "@/components/PlanTripButton";

export function ClassicHero({
  backgroundImageUrl,
  stats,
  destinations = [],
}: {
  backgroundImageUrl?: string | null;
  stats?: PublicStatsDto;
  destinations?: DestinationDto[];
}) {
  const chips = destinations.slice(0, 7);

  return (
    <section className="relative overflow-hidden pb-24 pt-16 text-white sm:pb-32 sm:pt-20">
      {backgroundImageUrl ? (
        <img src={backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-deep via-brand to-navy-deep" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-navy-deep/10" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
          <Plane className="h-3.5 w-3.5" strokeWidth={2} />
          Travel · Explore · Experience
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl uppercase leading-[1.1] tracking-tight sm:text-6xl">
          Your Journey.
          <br />
          Your Way.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/85 sm:text-lg">
          Discover, customize and experience unforgettable journeys with Paxbook.
        </p>

        {stats?.averageRating ? (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-white/90">
            <span className="flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-accent" strokeWidth={0} />
              {stats.averageRating}/5
            </span>
            <span className="text-white/50">·</span>
            <span>{stats.reviewCount}+ happy travellers</span>
            <span className="text-white/50">·</span>
            <span>{stats.tripsBookedCount}+ trips booked</span>
          </div>
        ) : null}

        <form action="/packages" className="search-pill mx-auto mt-8 flex max-w-xl flex-col gap-2 p-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 px-4">
            <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
            <input
              name="destination"
              placeholder="Search countries, cities"
              list="hero-destinations"
              className="w-full rounded-full py-3 text-sm text-slate-900 focus:outline-none"
            />
            <datalist id="hero-destinations">
              {destinations.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          </div>
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:bg-accent-dark hover:shadow-md"
          >
            Start Planning
          </button>
        </form>

        {chips.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {chips.map((d) => (
              <Link
                key={d.id}
                href={`/destinations/${d.slug}`}
                className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:border-accent hover:bg-white/20"
              >
                {d.name}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PlanTripButton
            destinations={destinations}
            className="flex items-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-md"
          >
            Plan My Trip
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </PlanTripButton>
          <Link
            href="/packages"
            className="rounded-full border border-white/50 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
          >
            Explore Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
