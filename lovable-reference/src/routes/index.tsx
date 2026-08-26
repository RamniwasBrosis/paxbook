import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BedDouble,
  Car,
  Clock,
  Compass,
  Headset,
  LifeBuoy,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DestinationCard, PackageCard, Rail, SectionHead, Stars } from "@/components/site/bits";
import { AiTripPlanner, HeroSearchPill } from "@/components/site/planner";
import { DemoBadge, useSiteUI } from "@/components/site/site-ui";
import {
  destinations,
  durations,
  hero,
  howItWorks,
  inr,
  lovedTrips,
  packages,
  priceBands,
  testimonials,
  travelStyles,
  trustPoints,
  visaFree,
  whyPaxbook,
} from "@/data/paxbook";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paxbook — Personalised Holiday Packages & Trip Planning" },
      {
        name: "description",
        content:
          "Discover, customise and experience unforgettable journeys with Paxbook. Personalised holiday packages, expert travel assistance and 24x7 support.",
      },
      { property: "og:title", content: "Paxbook — Your Journey. Your Way." },
      {
        property: "og:description",
        content: "Discover, customise and experience unforgettable journeys with Paxbook.",
      },
    ],
  }),
  component: Home,
});

const travellerBands = [
  { label: "Couples", note: "Romantic, unhurried", slug: "maldives" },
  { label: "Family", note: "Kid-friendly pacing", slug: "singapore" },
  { label: "Friends", note: "Nightlife & activities", slug: "thailand" },
  { label: "Solo", note: "Safe, guided, flexible", slug: "bali" },
].map((b) => {
  const dest = destinations.find((d) => d.slug === b.slug) ?? destinations[0]!;
  return { ...b, image: dest.image, destination: dest.name };
});

const icons: Record<string, React.ElementType> = {
  Sparkles,
  Headset,
  ShieldCheck,
  Compass,
  LifeBuoy,
  Clock,
};

const regionTabs = ["All", "Asia", "Indian Ocean", "Middle East", "Europe", "India"] as const;

function Home() {
  const { openPlanner, demo } = useSiteUI();
  const [band, setBand] = React.useState<string>("all");
  const [style, setStyle] = React.useState(travelStyles[0]!.id);
  const [region, setRegion] = React.useState<(typeof regionTabs)[number]>("All");

  const filteredTrips = lovedTrips.filter((t) => {
    const b = priceBands.find((x) => x.id === band);
    return !b || !("test" in b) ? true : b.test(t.price);
  });

  const regionDestinations = destinations
    .filter((d) => region === "All" || d.region === region)
    .slice(0, 8);

  const styledPackages = packages.filter((p) => p.styles.includes(style));

  return (
    <>
      {/* HERO — cinematic, centered search */}
      <section className="relative isolate -mt-16 flex min-h-[92svh] items-end lg:-mt-[4.5rem]">
        <img
          src={hero}
          alt="Overwater villas above a turquoise lagoon at sunrise"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="shell relative w-full pb-24 pt-28 text-center sm:pb-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-md">
            <Plane className="size-3.5" /> Travel · Explore · Experience
          </span>
          <h1 className="display-xl on-dark mx-auto mt-6 max-w-4xl">
            Your Journey. Your Way.
          </h1>
          <p className="on-dark-muted mx-auto mt-5 max-w-xl text-base sm:text-lg">
            Discover, customize and experience unforgettable journeys with Paxbook.
          </p>
          <div className="mt-9">
            <HeroSearchPill />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="gold" size="xl" className="rounded-full" onClick={() => openPlanner()}>
              Plan My Trip <ArrowRight />
            </Button>
            <Button variant="glass" size="xl" className="rounded-full" asChild>
              <Link to="/packages">Explore Packages</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHO'S COMING ALONG — curved brand band */}
      <section className="curve-top relative z-10 -mt-12 bg-primary pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="shell">
          <div className="dashed-frame p-6 sm:p-10">
            <h2 className="on-dark text-center text-3xl sm:text-[2.35rem]">Who's coming along?</h2>
            <p className="on-dark-muted mx-auto mt-3 max-w-lg text-center text-sm">
              Every Paxbook itinerary is shaped around who is travelling — pace, stays and experiences included.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {travellerBands.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => openPlanner(b.destination)}
                  className="arrow-card group relative overflow-hidden text-left transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <img
                    src={b.image}
                    alt={b.label}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="img-zoom h-44 w-full object-cover sm:h-60"
                  />
                  <div className="overlay-scrim absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 p-4 pr-10">
                    <h3 className="on-dark text-lg">{b.label}</h3>
                    <p className="text-xs font-semibold text-gold">{b.note}</p>
                    <span className="on-dark mt-2 inline-flex items-center gap-1 text-[0.72rem] font-bold underline decoration-gold decoration-2 underline-offset-4">
                      Start planning <ArrowRight className="size-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustPoints.map((t) => (
              <div key={t.title} className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gold/25">
                  <Star className="size-4 text-gold" />
                </span>
                <div className="min-w-0">
                  <p className="on-dark text-sm font-bold">{t.title}</p>
                  <p className="on-dark-muted text-xs">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* LOVED TRIPS */}
      <section className="section-y">
        <div className="shell">
          <SectionHead
            eyebrow="Recently booked"
            title="Trips Travellers Are Loving"
            text="Sample itineraries from our planning desk. Every one of them can be reshaped around your dates and budget."
            action={
              <Button variant="outline" asChild>
                <Link to="/packages">
                  All packages <ArrowRight />
                </Link>
              </Button>
            }
          />

          <div className="mb-6 flex flex-wrap gap-2">
            {priceBands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBand(b.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  band === b.id
                    ? "border-gold bg-gold text-navy-deep"
                    : "border-border hover:border-brand-blue hover:text-brand-blue"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <Rail label="Popular trips">
            {filteredTrips.map((t) => (
              <article key={t.slug} className="flat-card group w-[17.5rem] overflow-hidden">
                <Link to="/packages/$slug" params={{ slug: t.slug }} className="relative block overflow-hidden">
                  <div className="aspect-16/11 overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="img-zoom size-full object-cover"
                    />
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[0.7rem] font-bold text-primary shadow-card">
                    {t.duration}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.7rem] font-bold text-navy-deep">
                    {t.travellerType}
                  </span>
                </Link>
                <div className="p-4">
                  <h3 className="text-[1.05rem] font-bold leading-snug">{t.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t.destination}</p>
                  <ul className="dashed-rule mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 pt-3 text-[0.72rem] font-semibold text-foreground/75">
                    <li className="flex items-center gap-1.5">
                      <Plane className="size-3.5 text-brand-blue" /> Flights
                    </li>
                    <li className="flex items-center gap-1.5">
                      <BedDouble className="size-3.5 text-brand-blue" /> Hotels
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Car className="size-3.5 text-brand-blue" /> Transfers
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Ticket className="size-3.5 text-brand-blue" /> Activities
                    </li>
                  </ul>
                  <div className="dashed-rule mt-3 flex items-end justify-between pt-3">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Starting from</p>
                      <p className="text-lg font-bold text-primary">{inr(t.price)}</p>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      className="rounded-full"
                      onClick={() => openPlanner(t.destination)}
                    >
                      Customise
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </Rail>
          {filteredTrips.length === 0 && (
            <p className="rounded-2xl border bg-mist p-6 text-sm text-muted-foreground">
              No sample trips in this band yet — tell us your budget and we'll build one.
            </p>
          )}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section-y bg-mist">
        <div className="shell">
          <SectionHead
            eyebrow="Explore destinations"
            title="Where would you like to wake up?"
            text="Fourteen destinations our travellers ask for most, each with curated stays and experiences."
            action={
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/destinations">
                  View all destinations <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="no-scrollbar -mt-2 mb-7 flex items-center gap-6 overflow-x-auto border-b">
            {regionTabs.map((r) => (
              <button
                key={r}
                type="button"
                data-active={region === r}
                onClick={() => setRegion(r)}
                className="tab-underline text-sm"
              >
                {r}
              </button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {regionDestinations.map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </div>
      </section>

      {/* VISA FREE */}
      <section className="section-y">
        <div className="shell">
          <SectionHead
            eyebrow="Low paperwork, high reward"
            title="Visa-Free Escapes"
            text="Destinations that are usually quick to enter for Indian passport holders. Rules change often — our team reconfirms before every booking."
            action={<DemoBadge text="Demo content · CMS-driven" />}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visaFree.map((v) => (
              <Link
                key={v.name}
                to="/destinations/$slug"
                params={{ slug: v.slug }}
                className="card-lift group relative flex items-end overflow-hidden rounded-3xl shadow-card"
              >
                <img
                  src={v.image}
                  alt={v.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="img-zoom h-52 w-full object-cover"
                />
                <div className="overlay-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <h3 className="on-dark text-lg">{v.name}</h3>
                    <p className="text-xs font-semibold text-gold">{v.note}</p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-transform group-hover:translate-x-1">
                    <ArrowRight className="size-4 text-gold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link to="/visa">
                Full visa guide <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PACKAGES BY STYLE */}
      <section className="section-y bg-mist">
        <div className="shell">
          <SectionHead
            eyebrow="Packages by travel style"
            title="Trips built around how you travel"
            text="Same destination, very different holiday. Pick the style and we'll shape the pace, stays and add-ons accordingly."
          />
          <div className="mb-7 flex flex-wrap gap-2">
            {travelStyles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  style === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-brand-blue hover:text-brand-blue"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mb-6 max-w-xl text-sm text-muted-foreground">
            {travelStyles.find((s) => s.id === style)?.blurb}
          </p>
          <Rail label={`${style} packages`}>
            {styledPackages.map((p) => (
              <div key={p.slug} className="w-[19rem]">
                <PackageCard p={p} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      {/* DURATION */}
      <section className="section-y">
        <div className="shell">
          <SectionHead eyebrow="Packages by duration" title="How long do you want to escape?" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {durations.map((d) => {
              const dest = destinations.find((x) => x.slug === d.slug)!;
              return (
                <Link
                  key={d.range}
                  to="/packages"
                  className="card-lift group relative block overflow-hidden rounded-3xl shadow-card"
                >
                  <img
                    src={dest.image}
                    alt={d.label}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="img-zoom h-64 w-full object-cover"
                  />
                  <div className="overlay-scrim absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-2xl font-bold text-gold">{d.range}</p>
                    <h3 className="on-dark text-lg">{d.label}</h3>
                    <p className="on-dark-muted text-xs">{d.note}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY PAXBOOK */}
      <section className="section-y bg-primary">
        <div className="shell">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow !text-gold">Why Paxbook</p>
            <h2 className="on-dark mt-2 text-3xl sm:text-[2.35rem]">
              A travel company that stays on the line
            </h2>
            <p className="on-dark-muted mt-3">
              Handpicked stays, honest fares, and a dedicated expert with you from booking to boarding pass.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyPaxbook.map((w) => {
              const Icon = icons[w.icon] ?? Sparkles;
              return (
                <div
                  key={w.title}
                  className="rounded-2xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-gold/60"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-gold/20">
                    <Icon className="size-5 text-gold" />
                  </span>
                  <h3 className="on-dark mt-4 text-lg">{w.title}</h3>
                  <p className="on-dark-muted mt-2 text-sm">{w.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-y">
        <div className="shell">
          <SectionHead eyebrow="How it works" title="Four steps from idea to boarding pass" align="center" />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute inset-x-0 top-6 hidden border-t border-dashed lg:block" />
            {howItWorks.map((s) => (
              <div key={s.step} className="relative rounded-2xl border bg-card p-6 shadow-card">
                <span className="grid size-12 place-items-center rounded-full bg-gold text-lg font-bold text-navy-deep">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PLANNER */}
      <section className="section-y bg-mist">
        <div className="shell">
          <SectionHead
            eyebrow="AI Trip Planner"
            title="Tell us your dream trip. We'll build the plan."
            text="Answer five quick questions and see a day-by-day draft instantly. Your travel expert refines it from there."
            action={
              <Button variant="outline" asChild>
                <Link to="/ai-planner">
                  Open full planner <ArrowRight />
                </Link>
              </Button>
            }
          />
          <AiTripPlanner />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-y">
        <div className="shell">
          <SectionHead
            eyebrow="Words from the road"
            title="Real trips, real travellers"
            action={<DemoBadge text="Sample reviews for layout" />}
          />
          <Rail label="Traveller reviews">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className="card-lift w-[20rem] overflow-hidden rounded-3xl border bg-card shadow-card sm:w-[24rem]"
              >
                <img
                  src={t.image}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-40 w-full object-cover"
                />
                <div className="p-6">
                  <Stars rating={t.rating} />
                  <blockquote className="mt-3 text-sm leading-relaxed">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 border-t pt-3 text-xs">
                    <span className="font-bold">{t.name}</span>
                    <span className="text-muted-foreground"> · {t.trip}</span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </Rail>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
        <div className="hero-scrim absolute inset-0" />
        <div className="shell relative py-16 text-center sm:py-20">
          <h2 className="on-dark mx-auto max-w-2xl text-3xl sm:text-[2.6rem]">
            Your Next Adventure Starts Here.
          </h2>
          <p className="on-dark-muted mx-auto mt-4 max-w-xl">
            Tell us where you want to go. We'll help you plan the journey.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="gold" size="xl" onClick={() => openPlanner()}>
              Plan My Trip
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/contact">Talk to an Expert</Link>
            </Button>
          </div>
          <button
            type="button"
            onClick={() => demo("WhatsApp chat")}
            className="mx-auto mt-6 block text-xs font-semibold text-gold underline-offset-4 hover:underline"
          >
            Prefer WhatsApp? Chat with a travel expert
          </button>
        </div>
      </section>
    </>
  );
}
