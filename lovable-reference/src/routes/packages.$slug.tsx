import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Plane } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs, PackageCard, PageHero, SectionHead, Stars } from "@/components/site/bits";
import { useSiteUI } from "@/components/site/site-ui";
import { destinationBySlug, inr, packageBySlug, packages, testimonials } from "@/data/paxbook";

export const Route = createFileRoute("/packages/$slug")({
  loader: ({ params }) => {
    const pkg = packageBySlug(params.slug);
    if (!pkg) throw notFound();
    return { pkg };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Package unavailable — Paxbook" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.pkg;
    const title = `${p.title} — ${p.nights}N/${p.days}D | Paxbook`;
    const description = `${p.title}: ${p.highlights.slice(0, 3).join(", ")}. Fully customisable with a Paxbook travel expert.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: PackageDetail,
});

function PackageDetail() {
  const { pkg: p } = Route.useLoaderData();
  const { openPlanner, openBooking, demo } = useSiteUI();
  const dest = destinationBySlug(p.destinationSlug)!;
  const similar = packages.filter((x) => x.slug !== p.slug && x.styles.some((s) => p.styles.includes(s))).slice(0, 3);

  return (
    <>
      <PageHero
        image={dest.image}
        title={p.title}
        text={`${p.nights} Nights / ${p.days} Days · ${p.destination} · ${p.hotelCategory} stays`}
        trail={
          <Breadcrumbs
            trail={[
              { label: "Home", to: "/" },
              { label: "Holiday Packages", to: "/packages" },
              { label: p.title },
            ]}
          />
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <Stars rating={p.rating} className="on-dark" />
          <span className="on-dark-muted text-sm">
            {p.rating} · {p.reviews} reviews
          </span>
        </div>
      </PageHero>

      <section className="section-y">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <h2 className="text-2xl">Overview</h2>
            <p className="mt-3 text-muted-foreground">{dest.intro}</p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {p.highlights.map((h) => (
                <p key={h} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-blue" /> {h}
                </p>
              ))}
            </div>

            <h2 className="mt-12 text-2xl">Day-wise itinerary</h2>
            <ol className="mt-5 space-y-4">
              {p.itinerary.map((d) => (
                <li key={d.day} className="rounded-2xl border bg-card p-5 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">{d.day}</p>
                  <h3 className="mt-1.5 text-lg">{d.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{d.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border bg-mist p-5">
                <h3 className="text-lg">Hotels</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {dest.hotels.map((h) => (
                    <li key={h.name}>
                      {h.name} · {h.category}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border bg-mist p-5">
                <h3 className="flex items-center gap-2 text-lg">
                  <Plane className="size-4 text-brand-blue" /> Flights
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{p.flights}</p>
                <h3 className="mt-5 text-lg">Inclusions</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {p.inclusions.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h2 className="mt-12 text-2xl">Reviews</h2>
            <div className="mt-4 space-y-4">
              {testimonials.slice(0, 2).map((t) => (
                <figure key={t.name} className="rounded-2xl border bg-card p-5 shadow-card">
                  <Stars rating={t.rating} />
                  <blockquote className="mt-2 text-sm">“{t.quote}”</blockquote>
                  <figcaption className="mt-3 text-xs text-muted-foreground">
                    {t.name} · {t.trip}
                  </figcaption>
                </figure>
              ))}
            </div>

            <h2 className="mt-12 text-2xl">FAQs</h2>
            <Accordion type="single" collapsible className="mt-3">
              {dest.faqs.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <aside className="h-max min-w-0 lg:sticky lg:top-24">
            <div className="rounded-3xl border bg-card p-6 shadow-lift">
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-3xl font-bold text-primary">{inr(p.fromPrice)}</p>
              <p className="mt-1 text-xs text-muted-foreground">per person on twin sharing · demo pricing</p>
              <Button variant="gold" size="lg" className="mt-5 w-full" onClick={() => openPlanner(p.destination)}>
                Customize This Trip <ArrowRight />
              </Button>
              <Button variant="outline" size="lg" className="mt-3 w-full" onClick={() => openBooking(p.title)}>
                Request booking
              </Button>
              <Button variant="ghost" size="lg" className="mt-1 w-full" asChild>
                <Link to="/contact">Talk to Expert</Link>
              </Button>
              <button
                type="button"
                onClick={() => demo("Route map")}
                className="mt-4 w-full text-center text-xs font-semibold text-brand-blue underline-offset-4 hover:underline"
              >
                View route map & package comparison
              </button>
            </div>
          </aside>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section-y bg-mist">
          <div className="shell">
            <SectionHead eyebrow="Similar packages" title="Other trips in this style" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PackageCard key={s.slug} p={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
