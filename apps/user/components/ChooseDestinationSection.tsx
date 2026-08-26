import type { DestinationDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";
import { DestinationCard } from "@/components/DestinationCard";
import { ScrollCarousel } from "@/components/ScrollCarousel";

export function ChooseDestinationSection({
  destinations,
  priceByDestinationId,
}: {
  destinations: DestinationDto[];
  priceByDestinationId?: Record<string, number>;
}) {
  if (destinations.length === 0) return null;

  return (
    <section className="shell py-16 lg:py-20">
      <SectionHeading
        eyebrow="Explore destinations"
        title="Where would you like to wake up?"
        subtitle="Destinations our travellers ask for most, each with curated stays and experiences."
      />
      <ScrollCarousel>
        {destinations.map((d) => (
          <div key={d.id} className="w-64 shrink-0 snap-start sm:w-72">
            <DestinationCard destination={d} startingPrice={priceByDestinationId?.[d.id]} />
          </div>
        ))}
      </ScrollCarousel>
    </section>
  );
}
