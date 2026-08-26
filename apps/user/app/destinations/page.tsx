import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import type { DestinationDto, PackageSummaryDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { DestinationListCard } from "@/components/DestinationListCard";
import { DestinationCustomizeCard } from "@/components/DestinationCustomizeCard";
import { ScrollCarousel } from "@/components/ScrollCarousel";
import { PageHero } from "@/components/PageHero";
import { CustomizeSteps, CUSTOMIZE_STEPS } from "@/components/CustomizeSteps";

export const metadata: Metadata = { title: "Destinations" };

const REGIONS = ["Asia", "Middle East", "Europe", "Indian Ocean", "India"];
const STYLES = ["Honeymoon", "Family", "Adventure", "Luxury", "Budget", "Seasonal"];

interface SearchParams {
  category?: string;
  region?: string;
  search?: string;
}

export default async function DestinationsPage({ searchParams }: { searchParams: SearchParams }) {
  const qs = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v) as [string, string][]).toString();
  const [destinations, allPackages] = await Promise.all([
    publicFetch<DestinationDto[]>(`/public/destinations${qs ? `?${qs}` : ""}`),
    publicFetch<PackageSummaryDto[]>("/public/packages"),
  ]);

  const priceByDestination = new Map<string, number>();
  const countByDestination = new Map<string, number>();
  for (const p of allPackages) {
    countByDestination.set(p.destinationId, (countByDestination.get(p.destinationId) ?? 0) + 1);
    const current = priceByDestination.get(p.destinationId);
    if (current === undefined || p.basePrice < current) priceByDestination.set(p.destinationId, p.basePrice);
  }

  function buildHref(overrides: Partial<SearchParams>) {
    const params = new URLSearchParams({ ...searchParams, ...overrides } as Record<string, string>);
    for (const [k, v] of Object.entries(overrides)) if (!v) params.delete(k);
    const s = params.toString();
    return `/destinations${s ? `?${s}` : ""}`;
  }

  const inCustomizeFlow = Boolean(searchParams.category);

  return (
    <div>
      {inCustomizeFlow ? <CustomizeSteps steps={CUSTOMIZE_STEPS} current="Destination" /> : null}
      <PageHero
        breadcrumbs={[{ label: "Destinations" }]}
        eyebrow={inCustomizeFlow ? `Planning for: ${searchParams.category}` : "Where next"}
        title={inCustomizeFlow ? "Where do you want to go?" : "Explore Destinations"}
        subtitle={`${destinations.length}+ destinations our travel experts know inside out. Filter by region and travel style to shortlist yours.`}
      />

      <div className="shell py-10">
        <form method="get" className="mb-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search destination"
            className="w-full py-1.5 text-sm text-slate-900 focus:outline-none"
          />
          {searchParams.category ? <input type="hidden" name="category" value={searchParams.category} /> : null}
          {searchParams.region ? <input type="hidden" name="region" value={searchParams.region} /> : null}
        </form>

        <div className="mb-3 flex flex-wrap gap-2">
          <Link href={buildHref({ region: undefined })} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!searchParams.region ? "bg-brand text-white" : "bg-mist text-slate-600"}`}>
            All
          </Link>
          {REGIONS.map((r) => (
            <Link
              key={r}
              href={buildHref({ region: r })}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${searchParams.region === r ? "bg-brand text-white" : "bg-mist text-slate-600"}`}
            >
              {r}
            </Link>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link href={buildHref({ category: undefined })} className={`rounded-full px-4 py-1.5 text-sm ${!searchParams.category ? "bg-accent text-navy-deep" : "bg-slate-100 text-slate-600"}`}>
            All
          </Link>
          {STYLES.map((c) => (
            <Link
              key={c}
              href={buildHref({ category: c })}
              className={`rounded-full px-4 py-1.5 text-sm ${searchParams.category === c ? "bg-accent text-navy-deep" : "bg-slate-100 text-slate-600"}`}
            >
              {c}
            </Link>
          ))}
        </div>

        <p className="mb-6 text-sm text-slate-500">{destinations.length} destinations</p>

        {destinations.length === 0 ? (
          <p className="text-slate-500">No destinations found.</p>
        ) : inCustomizeFlow ? (
          <ScrollCarousel>
            {destinations.map((d) => (
              <DestinationCustomizeCard
                key={d.id}
                destination={d}
                tagline={d.description ?? undefined}
                href={`/customize/${d.slug}?travellerType=${encodeURIComponent(searchParams.category!)}`}
              />
            ))}
          </ScrollCarousel>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((d) => (
              <DestinationListCard
                key={d.id}
                destination={d}
                startingPrice={priceByDestination.get(d.id)}
                tripCount={countByDestination.get(d.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
