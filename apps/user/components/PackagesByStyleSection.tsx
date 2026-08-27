"use client";

import { useState } from "react";
import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";

export function PackagesByStyleSection({ packages }: { packages: PackageSummaryDto[] }) {
  const [active, setActive] = useState(0);

  const styles = Array.from(new Set(packages.flatMap((p) => p.categoryNames))).sort();
  if (styles.length === 0) return null;

  const activeStyle = styles[Math.min(active, styles.length - 1)]!;
  const shown = packages.filter((p) => p.categoryNames.includes(activeStyle));

  return (
    <section className="bg-mist py-16 lg:py-20">
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
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                i === active ? "bg-brand text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.slice(0, 6).map((pkg) => (
            <div key={pkg.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-premium">
              <Link href={`/packages/${pkg.slug}`} className="block h-40 overflow-hidden bg-white">
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
              <div className="flex flex-1 flex-col gap-1 p-5">
                <Link href={`/packages/${pkg.slug}`} className="font-display text-base tracking-tight text-navy-deep hover:text-brand">
                  {pkg.title}
                </Link>
                <p className="text-sm text-slate-500">{pkg.destinationName}</p>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-wider text-slate-400">Starting from</p>
                    <p className="text-xl font-bold text-brand">₹{pkg.basePrice.toLocaleString("en-IN")}</p>
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
          ))}
        </div>
      </div>
    </section>
  );
}
