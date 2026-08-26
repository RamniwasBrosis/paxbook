import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageHero, SectionHead, Stars } from "@/components/site/bits";
import { hero, howItWorks, testimonials, whyPaxbook } from "@/data/paxbook";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Paxbook — Travel, Explore, Experience" },
      {
        name: "description",
        content:
          "Paxbook builds personalised holidays with handpicked stays, honest fares and a dedicated travel expert from first enquiry to homecoming.",
      },
      { property: "og:title", content: "About Paxbook" },
      { property: "og:description", content: "Personalised holidays with expert assistance at every step." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        image={hero}
        title="Travel. Explore. Experience."
        text="Paxbook is a personalised travel company. We plan holidays the slow way — a real conversation, a handpicked itinerary, and one expert who stays with you until you're home."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "About Us" }]} />}
      />

      <section className="section-y">
        <div className="shell grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Who we are" title="A travel desk, not a booking engine" />
            <div className="space-y-4 text-muted-foreground">
              <p>
                Every Paxbook trip starts with a question, not a checkout page. We ask how you like to travel — the
                pace, the stays, the things you would rather skip — and shape the itinerary around that.
              </p>
              <p>
                We work with stays and local partners we have used ourselves, quote transparently, and flag the
                trade-offs instead of hiding them in fine print.
              </p>
              <p>
                From visa paperwork to airport transfers and the small change of plan on day three, your expert is one
                message away.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="gold" size="lg" asChild>
                <Link to="/contact">Talk to a travel expert</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/packages">Browse packages</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyPaxbook.map((w) => (
              <div key={w.title} className="rounded-2xl border bg-card p-5 shadow-card">
                <h3 className="text-base">{w.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-mist">
        <div className="shell">
          <SectionHead eyebrow="How we work" title="Four steps, one dedicated expert" align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <div key={s.step} className="rounded-2xl border bg-card p-6 shadow-card">
                <span className="grid size-11 place-items-center rounded-full bg-gold font-bold text-navy-deep">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="shell">
          <SectionHead eyebrow="Travellers" title="What they say" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.name} className="rounded-3xl border bg-card p-6 shadow-card">
                <Stars rating={t.rating} />
                <blockquote className="mt-3 text-sm leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-4 border-t pt-3 text-xs">
                  <span className="font-bold">{t.name}</span>
                  <span className="text-muted-foreground"> · {t.trip}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  ),
});
