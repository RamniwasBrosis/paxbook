import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs, PackageCard, PageHero } from "@/components/site/bits";
import { destinations, hero, packages, priceBands, travelStyles } from "@/data/paxbook";

export const Route = createFileRoute("/packages/")({
  head: () => ({
    meta: [
      { title: "Holiday Packages — Paxbook Customised Trips" },
      {
        name: "description",
        content:
          "Browse Paxbook holiday packages by destination, budget, duration and hotel category. Every itinerary is fully customisable with an expert.",
      },
      { property: "og:title", content: "Holiday Packages — Paxbook" },
      {
        property: "og:description",
        content: "Customisable holiday packages with handpicked stays and expert support.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const [style, setStyle] = React.useState<string>("All");
  const [dest, setDest] = React.useState("All");
  const [band, setBand] = React.useState("all");
  const [hotel, setHotel] = React.useState("All");
  const [sort, setSort] = React.useState("popular");

  let list = packages.filter((p) => {
    const b = priceBands.find((x) => x.id === band);
    const matchBand = !b || !("test" in b) ? true : b.test(p.fromPrice);
    return (
      matchBand &&
      (style === "All" || p.styles.includes(style as never)) &&
      (dest === "All" || p.destinationSlug === dest) &&
      (hotel === "All" || p.hotelCategory === hotel)
    );
  });
  list = [...list].sort((a, b) =>
    sort === "low" ? a.fromPrice - b.fromPrice : sort === "high" ? b.fromPrice - a.fromPrice : b.rating - a.rating,
  );

  const select = "mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm";

  return (
    <>
      <PageHero
        image={hero}
        title="Holiday Packages"
        text="Sample itineraries built by our planning desk. Use them as a starting point — your expert reshapes the pace, stays and inclusions."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "Holiday Packages" }]} />}
      />

      <section className="section-y">
        <div className="shell grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="h-max min-w-0 rounded-3xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
            <p className="text-sm font-bold">Filters</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="f-dest">Destination</label>
                <select id="f-dest" className={select} value={dest} onChange={(e) => setDest(e.target.value)}>
                  <option value="All">All destinations</option>
                  {destinations.map((d) => (
                    <option key={d.slug} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="f-style">Travel type</label>
                <select id="f-style" className={select} value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="All">All styles</option>
                  {travelStyles.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="f-band">Budget</label>
                <select id="f-band" className={select} value={band} onChange={(e) => setBand(e.target.value)}>
                  {priceBands.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="f-hotel">Hotel category</label>
                <select id="f-hotel" className={select} value={hotel} onChange={(e) => setHotel(e.target.value)}>
                  {["All", "3★", "4★", "5★"].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="f-sort">Sort by</label>
                <select id="f-sort" className={select} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="popular">Most loved</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <p className="mb-5 text-sm text-muted-foreground">{list.length} packages</p>
            <div className="space-y-5">
              {list.map((p) => (
                <PackageCard key={p.slug} p={p} layout="row" />
              ))}
            </div>
            {list.length === 0 && (
              <p className="rounded-2xl border bg-mist p-8 text-center text-sm text-muted-foreground">
                No packages match those filters — widen the budget or destination.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
