import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs, PageHero } from "@/components/site/bits";
import { AiTripPlanner } from "@/components/site/planner";
import { hero } from "@/data/paxbook";

export const Route = createFileRoute("/ai-planner")({
  head: () => ({
    meta: [
      { title: "AI Trip Planner — Build Your Itinerary | Paxbook" },
      {
        name: "description",
        content:
          "Answer five quick questions and see a day-by-day holiday draft instantly. A Paxbook travel expert refines it with you.",
      },
      { property: "og:title", content: "AI Trip Planner — Paxbook" },
      { property: "og:description", content: "Tell us your dream trip. We'll build the plan." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        image={hero}
        title="Tell us your dream trip. We'll build the plan."
        text="Our planner drafts a realistic day-by-day outline in seconds. Your travel expert then fine-tunes stays, pace and pricing."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "AI Trip Planner" }]} />}
      />
      <section className="section-y">
        <div className="shell">
          <AiTripPlanner />
        </div>
      </section>
    </>
  ),
});
