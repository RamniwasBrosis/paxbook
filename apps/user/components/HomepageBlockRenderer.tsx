import type { HomepageBlockDto, PublicStatsDto } from "@paxbook/types";
import { WhyChooseBlock } from "@/components/blocks/WhyChooseBlock";
import { HowItWorksBlock } from "@/components/blocks/HowItWorksBlock";

/**
 * Renders CMS homepage blocks in their admin sort order. `types` limits it to some block types so
 * the page can place them between its own sections (Design 2 puts "Why Choose" right under the
 * hero and "How it works" further down).
 *
 * "traveler_types" and "who_coming_along" blocks are not rendered here — WhosComingAlongSection
 * reads both (types + photos) for the "Are you a?" row.
 */
export function HomepageBlockRenderer({
  blocks,
  stats,
  siteName,
  types,
}: {
  blocks: HomepageBlockDto[];
  stats: PublicStatsDto;
  siteName?: string;
  types?: string[];
}) {
  const sorted = [...blocks].filter((b) => !types || types.includes(b.type)).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sorted.map((block) => {
        switch (block.type) {
          case "why_choose":
            return <WhyChooseBlock key={block.id} configJson={block.configJson} stats={stats} siteName={siteName} />;
          case "how_it_works":
            return <HowItWorksBlock key={block.id} configJson={block.configJson} />;
          default:
            return null;
        }
      })}
    </>
  );
}
