import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollCarousel } from "@/components/ScrollCarousel";
import { PackageCard } from "@/components/PackageCard";

export function TripsLovingSection({ packages }: { packages: PackageSummaryDto[] }) {
  if (packages.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Handpicked with care" title="Popular holiday packages" />
          <Link
            href="/packages"
            className="mb-10 inline-flex h-12 items-center rounded-full border-2 border-navy-deep px-6 text-sm font-bold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
          >
            View all packages
          </Link>
        </div>
        <ScrollCarousel>
          {packages.map((pkg) => (
            <div key={pkg.id} className="w-72 shrink-0 snap-start sm:w-80">
              <PackageCard pkg={pkg} />
            </div>
          ))}
        </ScrollCarousel>
      </div>
    </section>
  );
}
