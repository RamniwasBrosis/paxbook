import Link from "next/link";
import type { DestinationDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";

const BANDS = [
  { label: "2 – 3 Days", subtitle: "Weekend resets close to home", min: 2, max: 3, destinationSlug: "goa" },
  { label: "4 – 6 Days", subtitle: "One country, no rush", min: 4, max: 6, destinationSlug: "dubai" },
  { label: "7 – 10 Days", subtitle: "Two bases, proper depth", min: 7, max: 10, destinationSlug: "bali" },
  { label: "10 – 15 Days", subtitle: "Multi-country, once in a while", min: 10, max: 15, destinationSlug: "interlaken" },
];

export function PackagesByDurationSection({ destinations }: { destinations: DestinationDto[] }) {
  if (destinations.length === 0) return null;
  const bySlug = Object.fromEntries(destinations.map((d) => [d.slug, d]));

  return (
    <section className="bg-navy-deep py-16 lg:py-20">
      <div className="shell">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-0.5 w-8 rounded-full bg-accent" />
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Packages by duration</p>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">How long do you want to escape?</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BANDS.map((band) => {
            const dest = bySlug[band.destinationSlug];
            return (
              <Link
                key={band.label}
                href={`/packages?minDuration=${band.min}&maxDuration=${band.max}`}
                className="group relative block h-56 overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1.5"
              >
                {dest?.heroImageUrl ? (
                  <img
                    src={dest.heroImageUrl}
                    alt={band.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-brand" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-navy-deep/10" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-2xl font-bold text-accent">{band.label}</p>
                  <h3 className="mt-1 font-display text-lg text-white">{band.subtitle.split(" ").slice(0, 2).join(" ")}</h3>
                  <p className="mt-1 text-xs text-white/60">{band.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
