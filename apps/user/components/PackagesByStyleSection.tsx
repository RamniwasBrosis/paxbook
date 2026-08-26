"use client";

import { useState } from "react";
import Link from "next/link";
import type { PackageSummaryDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";

const STYLES = [
  { label: "Honeymoon", subtitle: "Private villas, slow mornings and dinners that matter." },
  { label: "Family", subtitle: "Easy pacing, connecting rooms and things kids actually enjoy." },
  { label: "Adventure", subtitle: "Treks, dives and days built around your adrenaline." },
  { label: "Luxury", subtitle: "Five-star stays and experiences with nothing left to chance." },
  { label: "Budget", subtitle: "Real value trips that never feel like you skimped." },
  { label: "Seasonal", subtitle: "Trips timed to the best weather window for each destination." },
];

export function PackagesByStyleSection({ packages }: { packages: PackageSummaryDto[] }) {
  const [active, setActive] = useState(0);
  if (packages.length === 0) return null;

  const style = STYLES[active]!;
  const filtered = packages.filter((p) => p.categoryNames?.includes(style.label));
  const shown = filtered.length > 0 ? filtered : packages.slice(0, 6);

  return (
    <section className="bg-mist py-16 lg:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow="Packages by travel style"
          title="Trips built around how you travel"
          subtitle="Same destination, very different holiday. Pick the style and we'll shape the pace, stays and add-ons accordingly."
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {STYLES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                i === active ? "bg-brand text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mb-6 max-w-xl text-sm text-slate-500">{style.subtitle}</p>

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
