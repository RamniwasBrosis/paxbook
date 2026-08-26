import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumbs, DestinationCard, PackageCard, PageHero, SectionHead } from "@/components/site/bits";
import { useSiteUI } from "@/components/site/site-ui";
import { destinationBySlug, destinations, inr, packages } from "@/data/paxbook";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const destination = destinationBySlug(params.slug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Destination unavailable — Paxbook" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.destination;
    const title = `${d.name} Holiday Packages — Paxbook`;
    return {
      meta: [
        { title },
        { name: "description", content: d.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: d.blurb },
      ],
    };
  },
  component: DestinationDetail,
});

function DestinationDetail() {
  const { destination: d } = Route.useLoaderData();
  const { openPlanner, demo } = useSiteUI();
  const related = packages.filter((p) => p.destinationSlug === d.slug);
  const similar = destinations
    .filter((x) => x.slug !== d.slug && x.region === d.region)
    .slice(0, 4);

  return (
    <>
      <PageHero
        image={d.image}
        title={`${d.name}, ${d.country}`}
        text={d.intro}
        trail={
          <Breadcrumbs
            trail={[
              { label: "Home", to: "/" },
              { label: "Destinations", to: "/destinations" },
              { label: d.name },
            ]}
          />
        }
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="gold" size="lg" onClick={() => openPlanner(d.name)}>
            Customize My {d.name} Trip <ArrowRight />
          </Button>
          <Button variant="glass" size="lg" asChild>
            <Link to="/visa">Visa information</Link>
          </Button>
        </div>
      </PageHero>

      <section className="border-b bg-mist">
        <div className="shell grid gap-4 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Best time", d.bestTime],
            ["Ideal duration", d.idealDuration],
            ["Travel styles", d.styles.join(", ")],
            ["Starting from", inr(d.fromPrice)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <p className="field-label">{k}</p>
              <p className="mt-1 text-sm font-bold capitalize">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y">
          <div className="shell">
            <SectionHead eyebrow="Popular packages" title={`Ready-to-shape ${d.name} itineraries`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PackageCard key={p.slug} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-y bg-mist">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <SectionHead eyebrow="Things to do" title={`Highlights of ${d.name}`} />
            <div className="grid gap-4 sm:grid-cols-2">
              {d.thingsToDo.map((t) => (
                <div key={t.title} className="rounded-2xl border bg-card p-5 shadow-card">
                  <h3 className="text-base">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-10 text-xl">Activities we can add</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.activities.map((a) => (
                <span key={a} className="rounded-full border bg-card px-3.5 py-1.5 text-sm">
                  {a}
                </span>
              ))}
            </div>

            <h3 className="mt-10 text-xl">Frequently asked</h3>
            <Accordion type="single" collapsible className="mt-3">
              {d.faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <aside className="min-w-0 space-y-5">
            <div className="rounded-3xl border bg-card p-6 shadow-card">
              <h3 className="text-lg">Where you could stay</h3>
              <ul className="mt-4 space-y-3">
                {d.hotels.map((h) => (
                  <li key={h.name} className="border-b pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-bold">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.category} · {h.area}
                    </p>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant="blue" onClick={() => demo("Hotel availability")}>
                Check availability
              </Button>
            </div>
            <div className="rounded-3xl border bg-primary p-6">
              <h3 className="on-dark text-lg">Travel guide</h3>
              <p className="on-dark-muted mt-2 text-sm">{d.visaNote}</p>
              <Button variant="gold" className="mt-5 w-full" asChild>
                <Link to="/blog">Read travel guides</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section-y">
          <div className="shell">
            <SectionHead eyebrow="Similar destinations" title="You may also like" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => (
                <DestinationCard key={s.slug} d={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
