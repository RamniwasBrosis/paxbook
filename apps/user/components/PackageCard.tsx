import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";
import { durationBadgeClass } from "@/lib/duration";

/** Design 2 package card: photo with colour-coded duration badge, dashed price row, gold "View" pill. */
export function PackageCard({ pkg }: { pkg: PackageSummaryDto }) {
  const badge = pkg.categoryNames?.[0];

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5"
    >
      <div className="relative h-52 overflow-hidden bg-mist">
        {pkg.coverImageUrl ? (
          <img src={pkg.coverImageUrl} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex h-full items-center justify-center font-display text-lg font-bold text-brand">{pkg.destinationName}</span>
        )}
        <span className={`absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-xs font-extrabold text-white ${durationBadgeClass(pkg.durationDays)}`}>
          {pkg.durationDays}D / {pkg.durationNights}N
        </span>
        {badge ? (
          <span className="absolute right-3.5 top-3.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-navy-deep">{badge}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{pkg.destinationName}</p>
        <h3 className="font-display text-lg font-bold leading-snug text-navy-deep transition-colors group-hover:text-brand-blue">{pkg.title}</h3>
        {pkg.inclusions?.length ? <p className="text-sm text-ink-muted">{pkg.inclusions.join(" · ")}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-ink-muted">Starting from</span>
            <LockedPrice amount={pkg.basePrice} size="md" asLink={false} colorClassName="text-navy-deep font-display" />
          </div>
          <span className="inline-flex h-10 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-extrabold text-navy-deep transition-colors group-hover:bg-accent-dark">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
