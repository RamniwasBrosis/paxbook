import type { HomepageBlockDto, PublicStatsDto } from "@paxbook/types";
import { WhyChooseBlock } from "@/components/blocks/WhyChooseBlock";
import { HowItWorksBlock } from "@/components/blocks/HowItWorksBlock";

/**
 * "traveler_types" blocks stay admin-editable in the CMS but are intentionally not
 * rendered here — WhosComingAlongSection now owns that role on the homepage with the
 * approved design's dark overlapping panel treatment.
 */
export function HomepageBlockRenderer({ blocks, stats }: { blocks: HomepageBlockDto[]; stats: PublicStatsDto }) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sorted.map((block) => {
        switch (block.type) {
          case "why_choose":
            return <WhyChooseBlock key={block.id} configJson={block.configJson} stats={stats} />;
          case "how_it_works":
            return <HowItWorksBlock key={block.id} configJson={block.configJson} />;
          default:
            return null;
        }
      })}
    </>
  );
}
