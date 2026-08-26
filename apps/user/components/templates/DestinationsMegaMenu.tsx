import Link from "next/link";
import type { DestinationDto } from "@paxbook/types";

const TRAVEL_STYLES = ["Honeymoon", "Family", "Adventure", "Luxury", "Budget", "Seasonal"];
const TRENDING_SLUGS = ["bali", "maldives", "dubai", "bangkok", "singapore", "ha-long-bay"];

/** Shared by both templates' headers — hover-triggered mega-menu, CSS-only (group-hover), no JS. */
export function DestinationsMegaMenu({ destinations, triggerClassName }: { destinations: DestinationDto[]; triggerClassName: string }) {
  const trending = TRENDING_SLUGS.map((slug) => destinations.find((d) => d.slug === slug)).filter(
    (d): d is DestinationDto => Boolean(d),
  );

  return (
    <div className="group relative">
      <button type="button" className={triggerClassName}>
        Explore
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
        <div className="grid grid-cols-2 gap-6 rounded-xl border border-slate-100 bg-white p-6 shadow-xl">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent-dark">By Travel Style</p>
            <div className="flex flex-col gap-2">
              {TRAVEL_STYLES.map((style) => (
                <Link key={style} href={`/packages?category=${encodeURIComponent(style)}`} className="text-sm text-slate-600 hover:text-brand">
                  {style}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent-dark">Trending Destinations</p>
            <div className="flex flex-col gap-2">
              {(trending.length > 0 ? trending : destinations.slice(0, 6)).map((d) => (
                <Link key={d.id} href={`/destinations/${d.slug}`} className="text-sm text-slate-600 hover:text-brand">
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
