import Link from "next/link";
import type { DestinationDto, PackageSummaryDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";

const BANDS = [
  {
    range: "2-3",
    label: "Quick Getaway",
    min: 2,
    max: 3,
    destinationSlug: "goa",
    tone: { card: "bg-blue-50 border-blue-100", badge: "bg-blue-600 shadow-blue-600/40", ink: "text-blue-700" },
  },
  {
    range: "4-6",
    label: "Short & Sweet",
    min: 4,
    max: 6,
    destinationSlug: "maldives",
    tone: { card: "bg-green-50 border-green-100", badge: "bg-green-600 shadow-green-600/40", ink: "text-green-700" },
  },
  {
    range: "7-10",
    label: "More to Explore",
    min: 7,
    max: 10,
    destinationSlug: "thailand",
    tone: { card: "bg-orange-50 border-orange-100", badge: "bg-orange-600 shadow-orange-600/40", ink: "text-orange-700" },
  },
  {
    range: "10-15",
    label: "The Ultimate Journey",
    min: 10,
    max: 15,
    destinationSlug: "switzerland",
    tone: { card: "bg-violet-50 border-violet-100", badge: "bg-violet-600 shadow-violet-600/40", ink: "text-violet-700" },
  },
];

/**
 * Design 2 "How Many Days?": four colour-coded duration bands, each with its day-range badge, a
 * photo, and the destinations that actually have a package of that length.
 */
export function PackagesByDurationSection({ destinations, packages = [] }: { destinations: DestinationDto[]; packages?: PackageSummaryDto[] }) {
  if (destinations.length === 0) return null;
  const bySlug = Object.fromEntries(destinations.map((d) => [d.slug, d]));
  const fallbackImages = destinations.filter((d) => d.heroImageUrl);

  return (
    <section className="py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          title="How Many Days?"
          highlight="Days?"
          align="center"
          subtitle="More days, more destinations, more memories!"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {BANDS.map((band, i) => {
            const image = bySlug[band.destinationSlug]?.heroImageUrl ?? fallbackImages[i % Math.max(fallbackImages.length, 1)]?.heroImageUrl;
            const names = Array.from(
              new Set(packages.filter((p) => p.durationDays >= band.min && p.durationDays <= band.max).map((p) => p.destinationName)),
            );
            return (
              <Link
                key={band.range}
                href={`/packages?minDuration=${band.min}&maxDuration=${band.max}`}
                className={`group flex flex-col items-center gap-3 rounded-[1.75rem] border p-4 text-center sm:gap-5 sm:p-6 transition-transform duration-300 hover:-translate-y-1.5 ${band.tone.card}`}
              >
                <span className={`flex flex-col items-center rounded-2xl px-5 py-2.5 text-white shadow-lg sm:px-7 sm:py-3 ${band.tone.badge}`}>
                  <span className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{band.range}</span>
                  <span className="mt-1 text-sm font-extrabold tracking-[0.14em]">DAYS</span>
                </span>
                <span className="hidden h-44 w-full overflow-hidden rounded-2xl bg-white sm:block">
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : null}
                </span>
                <span className={`rounded-xl bg-white px-3 py-2 font-display text-xs font-extrabold uppercase tracking-wide sm:px-4 sm:text-sm ${band.tone.ink}`}>{band.label}</span>
                <span className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                  {names.length > 0 ? names.slice(0, 5).join(", ") : "Planned on request — talk to an expert"}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="script-eyebrow mt-10 text-center text-4xl !text-violet-700">Your Journey, Your Way!</p>
      </div>
    </section>
  );
}
