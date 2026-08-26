import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs, DestinationCard, PageHero } from "@/components/site/bits";
import { destinations, hero, travelStyles } from "@/data/paxbook";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/destinations/")({
  head: () => ({
    meta: [
      { title: "Explore Destinations — Paxbook Holidays" },
      {
        name: "description",
        content:
          "Browse 14 handpicked Paxbook destinations across Asia, Europe, the Indian Ocean, the Middle East and India, with ideal duration and starting prices.",
      },
      { property: "og:title", content: "Explore Destinations — Paxbook" },
      {
        property: "og:description",
        content: "Handpicked destinations with ideal duration, best season and starting prices.",
      },
    ],
  }),
  component: DestinationsPage,
});

const regions = ["All", "Asia", "Middle East", "Europe", "Indian Ocean", "India"] as const;

function DestinationsPage() {
  const [q, setQ] = React.useState("");
  const [region, setRegion] = React.useState<string>("All");
  const [style, setStyle] = React.useState<string>("All");

  const list = destinations.filter((d) => {
    const matchQ = `${d.name} ${d.country}`.toLowerCase().includes(q.trim().toLowerCase());
    const matchR = region === "All" || d.region === region;
    const matchS = style === "All" || d.styles.includes(style as never);
    return matchQ && matchR && matchS;
  });

  return (
    <>
      <PageHero
        image={hero}
        title="Explore Destinations"
        text="Fourteen destinations our travel experts know inside out. Filter by region and travel style to shortlist yours."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "Destinations" }]} />}
      />

      <section className="section-y">
        <div className="shell">
          <div className="mb-8 grid gap-4 rounded-3xl border bg-card p-5 shadow-card lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <label className="field-label" htmlFor="dest-search">
                Search destination
              </label>
              <Input
                id="dest-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Bali, Dubai, Kerala…"
                className="mt-1.5 h-11"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      region === r ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", ...travelStyles.map((s) => s.id)].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      style === s ? "border-gold bg-gold text-navy-deep" : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mb-5 text-sm text-muted-foreground">{list.length} destinations</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
          {list.length === 0 && (
            <p className="rounded-2xl border bg-mist p-8 text-center text-sm text-muted-foreground">
              Nothing matches those filters yet — try a wider region.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
