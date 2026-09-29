import type { Metadata } from "next";
import type { DestinationDto } from "@paxbook/types";
import { notFound } from "next/navigation";
import { publicFetch } from "@/lib/api";
import { getBranding } from "@/lib/branding";
import { AiPlannerMock } from "@/components/AiPlannerMock";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "AI Trip Planner" };

export default async function AiPlannerPage() {
  // Switched off in admin Settings -> Branding: behave as if the page doesn't exist.
  if (!(await getBranding()).aiPlannerEnabled) notFound();
  const destinations = await publicFetch<DestinationDto[]>("/public/destinations");

  return (
    <div>
      <PageHero
        breadcrumbs={[{ label: "AI Trip Planner" }]}
        eyebrow="Plan in seconds"
        title="Tell us your dream trip. We'll build the plan."
        subtitle="Our planner drafts a realistic day-by-day outline in seconds. Your travel expert then fine-tunes stays, pace and pricing."
      />

      <AiPlannerMock destinations={destinations} showHeading={false} />
    </div>
  );
}
