import type { DestinationDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { SectionHeading } from "@/components/SectionHeading";
import { DestinationCard } from "@/components/DestinationCard";
import { ScrollCarousel } from "@/components/ScrollCarousel";

const MIN_DESTINATIONS_TO_SHOW = 2;

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await publicFetch<T>(path);
  } catch {
    return fallback;
  }
}

/** Real category-filtered destination showcase — pickyourtrail's "Adventures Worth Chasing"-style row, sourced from real DestinationCategory data instead of a curated list. */
export async function ThemedDestinationsSection({ category, eyebrow, title }: { category: string; eyebrow: string; title: string }) {
  const destinations = await safeFetch<DestinationDto[]>(`/public/destinations?category=${encodeURIComponent(category)}`, []);
  if (destinations.length < MIN_DESTINATIONS_TO_SHOW) return null;

  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="shell">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ScrollCarousel>
          {destinations.map((d) => (
            <div key={d.id} className="w-64 shrink-0 snap-start sm:w-72">
              <DestinationCard destination={d} />
            </div>
          ))}
        </ScrollCarousel>
      </div>
    </section>
  );
}
