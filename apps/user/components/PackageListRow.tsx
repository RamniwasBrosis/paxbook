import Link from "next/link";
import { Star } from "lucide-react";
import type { PackageSummaryDto } from "@paxbook/types";
import { Inclusions } from "@/components/Inclusions";
import { CompareCheckbox } from "@/components/CompareBar";
import { LockedPrice } from "@/components/LockedPrice";
import { durationBadgeClass } from "@/lib/duration";

export function PackageListRow({ pkg }: { pkg: PackageSummaryDto }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-0.5 sm:flex-row sm:p-4">
      <Link href={`/packages/${pkg.slug}`} className="relative block h-48 shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-60">
        {pkg.coverImageUrl ? (
          <img src={pkg.coverImageUrl} alt={pkg.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-mist text-sm font-medium text-brand">{pkg.destinationName}</div>
        )}
        <span className={`absolute left-2.5 top-2.5 rounded-full px-3 py-1.5 text-xs font-extrabold text-white ${durationBadgeClass(pkg.durationDays)}`}>
          {pkg.durationNights}N / {pkg.durationDays}D
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{pkg.destinationName}</span>
          {pkg.avgRating ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
              {pkg.avgRating} ({pkg.reviewCount})
            </span>
          ) : null}
        </div>
        <Link href={`/packages/${pkg.slug}`} className="font-display text-xl font-bold leading-snug text-navy-deep hover:text-brand-blue">
          {pkg.title}
        </Link>
        <Inclusions inclusions={pkg.inclusions} />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wider text-slate-400">Starting from</p>
            <LockedPrice amount={pkg.basePrice} size="lg" />
            <p className="text-[0.65rem] text-slate-400">per person · demo pricing</p>
            <div className="mt-1">
              <CompareCheckbox slug={pkg.slug} title={pkg.title} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/packages/${pkg.slug}`}
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-extrabold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
            >
              Customise
            </Link>
            <Link
              href={`/packages/${pkg.slug}`}
              className="inline-flex h-11 items-center rounded-full border-2 border-navy-deep px-5 text-sm font-bold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
            >
              View trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
