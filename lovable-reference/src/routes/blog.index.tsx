import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Breadcrumbs, PageHero, SectionHead } from "@/components/site/bits";
import { blogCategories, blogs, hero } from "@/data/paxbook";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Travel Guides & Blog — Paxbook" },
      {
        name: "description",
        content:
          "Practical travel guides, destination notes, visa explainers and honest planning advice from the Paxbook travel desk.",
      },
      { property: "og:title", content: "Travel Guides & Blog — Paxbook" },
      { property: "og:description", content: "Practical guides and planning advice from our travel desk." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [cat, setCat] = React.useState("All");
  const list = blogs.filter((b) => cat === "All" || b.category === cat);

  return (
    <>
      <PageHero
        image={hero}
        title="Travel Guides"
        text="Notes from our planning desk — itineraries that actually work, seasons worth paying for, and what to skip."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "Travel Guides" }]} />}
      />
      <section className="section-y">
        <div className="shell">
          <SectionHead eyebrow="Latest stories" title="Read before you book" />
          <div className="mb-8 flex flex-wrap gap-2">
            {blogCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <article key={b.slug} className="card-lift overflow-hidden rounded-3xl border bg-card shadow-card">
                <Link to="/blog/$slug" params={{ slug: b.slug }} className="block overflow-hidden">
                  <img
                    src={b.image}
                    alt={b.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="img-zoom h-48 w-full object-cover"
                  />
                </Link>
                <div className="p-5">
                  <span className="rounded-full bg-brand-blue-soft px-2.5 py-1 text-xs font-semibold text-brand-blue">
                    {b.category}
                  </span>
                  <h3 className="mt-3 text-lg leading-snug">
                    <Link to="/blog/$slug" params={{ slug: b.slug }} className="hover:text-brand-blue">
                      {b.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.excerpt}</p>
                  <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                    {b.date} · {b.readTime}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
