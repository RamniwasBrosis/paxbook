import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollCarousel } from "@/components/ScrollCarousel";

export function TripsLovingSection({ packages }: { packages: PackageSummaryDto[] }) {
  if (packages.length === 0) return null;

  return (
    <section className="shell py-16 lg:py-20">
      <SectionHeading
        eyebrow="Recently booked"
        title="Trips Travellers Are Loving"
        subtitle="Real itineraries from our planning desk. Every one of them can be reshaped around your dates and budget."
      />
      <ScrollCarousel>
        {packages.map((pkg) => (
          <div key={pkg.id} className="w-64 shrink-0 snap-start sm:w-72">
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium">
              <Link href={`/packages/${pkg.slug}`} className="block h-40 overflow-hidden bg-mist">
                {pkg.coverImageUrl ? (
                  <img
                    src={pkg.coverImageUrl}
                    alt={pkg.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-brand">{pkg.destinationName}</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <Link href={`/packages/${pkg.slug}`} className="font-display text-sm tracking-tight text-navy-deep hover:text-brand">
                  {pkg.title}
                </Link>
                <p className="text-xs text-slate-500">{pkg.destinationName}</p>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-wider text-slate-400">Starting from</p>
                    <p className="text-lg font-bold text-brand">₹{pkg.basePrice.toLocaleString("en-IN")}</p>
                  </div>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
                  >
                    Customise
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ScrollCarousel>
    </section>
  );
}
