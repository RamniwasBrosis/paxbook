import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import type { PackageSummaryDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { Inclusions } from "@/components/Inclusions";
import { Button } from "@/components/Button";
import { LockedPrice } from "@/components/LockedPrice";

export const metadata: Metadata = { title: "Compare Packages" };

const ROWS: Array<{ label: string; render: (p: PackageSummaryDto) => React.ReactNode }> = [
  { label: "Destination", render: (p) => p.destinationName },
  { label: "Duration", render: (p) => `${p.durationNights}N / ${p.durationDays}D` },
  {
    label: "Starting price",
    render: (p) => <LockedPrice amount={p.basePrice} size="md" asLink={false} />,
  },
  {
    label: "Rating",
    render: (p) =>
      p.avgRating ? (
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
          {p.avgRating} ({p.reviewCount})
        </span>
      ) : (
        <span className="text-slate-400">No reviews yet</span>
      ),
  },
  { label: "Travel style", render: (p) => (p.categoryNames?.length ? p.categoryNames.join(", ") : "—") },
  { label: "Inclusions", render: (p) => <Inclusions inclusions={p.inclusions} /> },
];

export default async function ComparePackagesPage({ searchParams }: { searchParams: { slugs?: string } }) {
  const slugs = (searchParams.slugs ?? "").split(",").filter(Boolean);
  const allPackages = await publicFetch<PackageSummaryDto[]>("/public/packages");
  const packages = slugs.map((slug) => allPackages.find((p) => p.slug === slug)).filter((p): p is PackageSummaryDto => Boolean(p));

  return (
    <div>
      <PageHero
        breadcrumbs={[{ label: "Holiday Packages", href: "/packages" }, { label: "Compare" }]}
        eyebrow="Side by side"
        title="Compare Packages"
        subtitle="A quick look at price, duration, rating and inclusions across your shortlisted trips."
      />

      <div className="shell py-10">
        {packages.length < 2 ? (
          <div className="rounded-2xl bg-mist p-8 text-center">
            <p className="text-slate-600">Pick at least 2 packages to compare.</p>
            <Button href="/packages" variant="gold" size="md" className="mt-4">
              Browse packages
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-40"></th>
                  {packages.map((p) => (
                    <th key={p.id} className="p-3 text-left align-bottom">
                      <div className="flat-card overflow-hidden">
                        <Link href={`/packages/${p.slug}`} className="block h-32 w-full overflow-hidden">
                          {p.coverImageUrl ? (
                            <img src={p.coverImageUrl} alt={p.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-mist text-sm text-brand">{p.destinationName}</div>
                          )}
                        </Link>
                        <div className="p-3">
                          <Link href={`/packages/${p.slug}`} className="font-display text-sm text-navy-deep hover:text-brand">
                            {p.title}
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-slate-100">
                    <td className="p-3 text-xs font-bold uppercase tracking-wide text-slate-400">{row.label}</td>
                    {packages.map((p) => (
                      <td key={p.id} className="p-3 text-sm text-slate-700">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-slate-100">
                  <td className="p-3"></td>
                  {packages.map((p) => (
                    <td key={p.id} className="p-3">
                      <Button href={`/packages/${p.slug}`} variant="gold" size="sm">
                        View trip
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
