"use client";

import { useState } from "react";
import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";
import { durationBadgeClass } from "@/lib/duration";

export function PackagesByStyleSection({ packages }: { packages: PackageSummaryDto[] }) {
  const [active, setActive] = useState(0);

  const styles = Array.from(new Set(packages.flatMap((p) => p.categoryNames))).sort();
  if (styles.length === 0) return null;

  const activeStyle = styles[Math.min(active, styles.length - 1)]!;
  const shown = packages.filter((p) => p.categoryNames.includes(activeStyle));

  return (
    <section className="bg-mist py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          eyebrow="Packages by travel style"
          title="Trips built around how you travel"
          subtitle="Same destination, very different holiday. Pick the style and we'll shape the pace, stays and add-ons accordingly."
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {styles.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setActive(i)}
              className={`h-11 rounded-full px-5 text-sm font-bold transition-colors ${
                i === active ? "bg-navy-deep text-white shadow-sm" : "bg-white text-navy-deep hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.slice(0, 6).map((pkg) => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5"
            >
              <span className="relative block h-52 overflow-hidden bg-white">
                {pkg.coverImageUrl ? (
                  <img src={pkg.coverImageUrl} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span className="flex h-full items-center justify-center font-display text-lg font-bold text-brand">{pkg.destinationName}</span>
                )}
                <span className={`absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-xs font-extrabold text-white ${durationBadgeClass(pkg.durationDays)}`}>
                  {pkg.durationDays}D / {pkg.durationNights}N
                </span>
              </span>
              <span className="flex flex-1 flex-col gap-2 p-5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{pkg.destinationName}</span>
                <span className="font-display text-lg font-bold leading-snug text-navy-deep group-hover:text-brand-blue">{pkg.title}</span>
                <span className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-4">
                  <span className="flex flex-col">
                    <span className="text-xs text-ink-muted">Starting from</span>
                    <span className="font-display text-xl font-bold text-navy-deep">₹{pkg.basePrice.toLocaleString("en-IN")}</span>
                  </span>
                  <span className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-extrabold text-navy-deep group-hover:bg-accent-dark">
                    View
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
