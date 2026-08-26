import type { Metadata } from "next";
import Link from "next/link";
import type { DestinationDto, PackageSummaryDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { PackageListRow } from "@/components/PackageListRow";
import { PageHero } from "@/components/PageHero";
import { CompareBar } from "@/components/CompareBar";

export const metadata: Metadata = { title: "Holiday Packages" };

interface SearchParams {
  destination?: string;
  category?: string;
  minDuration?: string;
  maxDuration?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

const CATEGORIES = ["Honeymoon", "Family", "Adventure", "Seasonal", "Budget", "Luxury"];
const DURATION_CHIPS = [
  { label: "2-3 Days", subtitle: "Quick Getaway", min: 2, max: 3 },
  { label: "4-6 Days", subtitle: "Short & Sweet", min: 4, max: 6 },
  { label: "7-10 Days", subtitle: "More to Explore", min: 7, max: 10 },
  { label: "10-15 Days", subtitle: "The Ultimate Journey", min: 10, max: 15 },
];

export default async function PackagesPage({ searchParams }: { searchParams: SearchParams }) {
  const qs = new URLSearchParams(Object.entries(searchParams).filter(([k, v]) => v && k !== "sort") as [string, string][]).toString();
  const [packages, destinations] = await Promise.all([
    publicFetch<PackageSummaryDto[]>(`/public/packages${qs ? `?${qs}` : ""}`),
    publicFetch<DestinationDto[]>("/public/destinations"),
  ]);

  const sorted = [...packages].sort((a, b) => {
    if (searchParams.sort === "price-asc") return a.basePrice - b.basePrice;
    if (searchParams.sort === "price-desc") return b.basePrice - a.basePrice;
    if (searchParams.sort === "duration") return a.durationDays - b.durationDays;
    return (b.avgRating ?? 0) - (a.avgRating ?? 0);
  });

  return (
    <div>
      <PageHero
        breadcrumbs={[{ label: "Holiday Packages" }]}
        eyebrow="Handpicked itineraries"
        title="Holiday Packages"
        subtitle="Real itineraries built by our planning desk. Use them as a starting point — your expert reshapes the pace, stays and inclusions."
      />

      <div className="shell py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {DURATION_CHIPS.map((chip) => (
            <a
              key={chip.label}
              href={`/packages?minDuration=${chip.min}&maxDuration=${chip.max}`}
              className={`rounded-full px-4 py-1.5 text-sm ${
                searchParams.minDuration === String(chip.min) && searchParams.maxDuration === String(chip.max) ? "bg-brand text-white" : "bg-mist text-slate-600"
              }`}
            >
              {chip.label} <span className="opacity-70">· {chip.subtitle}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm text-navy-deep">Filters</h2>
            <form method="get" className="mt-4 flex flex-col gap-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Destination</span>
                <select name="destination" defaultValue={searchParams.destination ?? ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All destinations</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Travel style</span>
                <select name="category" defaultValue={searchParams.category ?? ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">All styles</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Min budget (₹)</span>
                <input name="minPrice" type="number" min={0} defaultValue={searchParams.minPrice} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">Max budget (₹)</span>
                <input name="maxPrice" type="number" min={0} defaultValue={searchParams.maxPrice} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <button type="submit" className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                Apply filters
              </button>
              <Link href="/packages" className="text-center text-xs text-slate-400 hover:text-brand">
                Clear all
              </Link>
            </form>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{sorted.length} packages</p>
              <form method="get" className="flex items-center gap-2 text-sm">
                {Object.entries(searchParams)
                  .filter(([k]) => k !== "sort")
                  .map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
                <label className="text-slate-500">Sort by</label>
                <select name="sort" defaultValue={searchParams.sort ?? "rating"} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                  <option value="rating">Most loved</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="duration">Duration</option>
                </select>
                <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Go</button>
              </form>
            </div>

            {sorted.length === 0 ? (
              <p className="text-slate-500">No packages match those filters yet.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {sorted.map((p) => (
                  <PackageListRow key={p.id} pkg={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <CompareBar />
    </div>
  );
}
