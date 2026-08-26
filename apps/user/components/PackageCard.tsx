import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { LockedPrice } from "@/components/LockedPrice";

export function PackageCard({ pkg }: { pkg: PackageSummaryDto }) {
  const badge = pkg.categoryNames?.[0];

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-light to-white">
        {pkg.coverImageUrl ? (
          <img src={pkg.coverImageUrl} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="text-sm font-medium text-brand">{pkg.destinationName}</span>
        )}
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand shadow-sm">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{pkg.destinationName}</p>
        <h3 className="font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand">{pkg.title}</h3>
        <p className="text-sm text-slate-500">
          {pkg.durationDays}D / {pkg.durationNights}N
        </p>
        <div className="mt-auto flex items-baseline justify-between border-t border-slate-50 pt-3">
          <span className="text-xs text-slate-400">Per person</span>
          <LockedPrice amount={pkg.basePrice} size="lg" asLink={false} />
        </div>
      </div>
    </Link>
  );
}
