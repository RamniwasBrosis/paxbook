import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Breadcrumbs, PageHero, SectionHead } from "@/components/site/bits";
import { DemoBadge, useSiteUI } from "@/components/site/site-ui";
import { hero, visaCountries } from "@/data/paxbook";

export const Route = createFileRoute("/visa")({
  head: () => ({
    meta: [
      { title: "Visa Guide & Assistance — Paxbook" },
      {
        name: "description",
        content:
          "Country-wise visa types, documents and indicative processing times, plus end-to-end visa assistance from the Paxbook team.",
      },
      { property: "og:title", content: "Visa Guide & Assistance — Paxbook" },
      { property: "og:description", content: "Visa types, documents and processing times, country by country." },
    ],
  }),
  component: VisaPage,
});

function VisaPage() {
  const { demo } = useSiteUI();
  return (
    <>
      <PageHero
        image={hero}
        title="Visa Guide"
        text="Indicative requirements for the destinations we book most. Rules change often — our team reconfirms every requirement before your trip."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "Visa Guide" }]} />}
      />
      <section className="section-y">
        <div className="shell">
          <SectionHead
            eyebrow="Country-wise"
            title="Visa requirements at a glance"
            action={<DemoBadge text="Demo content · not legal advice" />}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visaCountries.map((v) => (
              <article key={v.slug} className="card-lift overflow-hidden rounded-3xl border bg-card shadow-card">
                <img
                  src={v.image}
                  alt={v.country}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg">{v.country}</h3>
                    {v.freeEntry && (
                      <span className="shrink-0 rounded-full bg-gold/25 px-2.5 py-1 text-[0.68rem] font-bold text-gold-deep">
                        Visa-free
                      </span>
                    )}
                  </div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Visa type</dt>
                      <dd className="text-right font-semibold">{v.type}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Processing</dt>
                      <dd className="text-right font-semibold">{v.processing}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Fees</dt>
                      <dd className="text-right font-semibold">{v.fee}</dd>
                    </div>
                  </dl>
                  <p className="field-label mt-4">Documents</p>
                  <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                    {v.documents.map((d) => (
                      <li key={d}>· {d}</li>
                    ))}
                  </ul>
                  <Button
                    variant="gold"
                    className="mt-5 w-full"
                    onClick={() => demo(`${v.country} visa assistance`)}
                  >
                    Get Visa Assistance
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
