import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PackageSummaryDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";
import { BandScroller } from "@/components/BandScroller";

const MARQUEE_LINES = [
  "#PaxbookHolidays",
  "100% customisable itineraries",
  "Visa assistance on every trip",
  "24×7 on-trip support",
  "No hidden charges",
  "Handpicked stays & transfers",
  "#TravelYourWay",
  "Best-price promise",
  "Trusted by happy travellers",
];

/**
 * "Exclusive with Paxbook" (Pickyourtrail style): a dark band of horizontal package cards (photo on
 * the left, title, starting price per person and nights) with arrows, then a running marquee of
 * brand lines. Shows the popular packages from the homepage feed.
 */
export function FeaturedPackagesBand({ packages }: { packages: PackageSummaryDto[] }) {
  if (packages.length === 0) return null;

  return (
    <section aria-labelledby="featured-packages" className="relative overflow-hidden bg-[#0b1530] text-white">
      <span aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-blue/30 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <div className="shell relative py-14 lg:py-20">
        <BandScroller
          heading={
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent">
                <Sparkles className="h-4 w-4" /> Featured packages
              </p>
              <h2 id="featured-packages" className="mt-3 font-display text-3xl font-extrabold uppercase tracking-[0.04em] sm:text-4xl">
                Exclusive with Paxbook
              </h2>
              <p className="mt-2 max-w-xl text-base text-white/70">Our most-loved holidays, curated by travel experts and ready to customise.</p>
            </div>
          }
        >
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.slug}`}
              className="group flex w-[19rem] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-navy-deep shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-1 sm:w-[23rem]"
            >
              <span className="relative block w-32 shrink-0 overflow-hidden bg-mist sm:w-40">
                {pkg.coverImageUrl ? (
                  <img src={pkg.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue to-navy-deep px-2 text-center font-display text-sm font-bold uppercase tracking-[0.14em] text-white/90">
                    {pkg.destinationName}
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-muted">{pkg.destinationName}</span>
                <span className="line-clamp-2 font-display text-base font-bold leading-snug group-hover:text-brand-blue">{pkg.title}</span>
                <span className="mt-auto pt-2 text-xs text-ink-muted">Packages starts from</span>
                <span className="flex flex-wrap items-baseline gap-x-1.5">
                  <LockedPrice amount={pkg.basePrice} size="md" asLink={false} colorClassName="text-navy-deep" />
                  <span className="text-xs text-ink-muted">
                    /Person · {pkg.durationNights} night{pkg.durationNights === 1 ? "" : "s"}
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </BandScroller>

        <div className="mt-8 text-center">
          <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-bold text-accent underline-offset-4 hover:underline">
            View all packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-accent py-3.5 text-navy-deep">
        <div className="flex w-max motion-safe:animate-marquee" aria-hidden="true">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {MARQUEE_LINES.map((line) => (
                <li key={line} className="flex items-center whitespace-nowrap px-6 font-display text-base font-extrabold uppercase tracking-[0.08em] sm:text-lg">
                  {line}
                  <span className="ml-12 text-navy-deep/50">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <p className="sr-only">{MARQUEE_LINES.join(", ")}</p>
      </div>
    </section>
  );
}
