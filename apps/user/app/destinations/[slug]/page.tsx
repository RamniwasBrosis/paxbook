import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ChevronDown } from "lucide-react";
import type { PublicDestinationDetailDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { SectionHeading } from "@/components/SectionHeading";
import { PackageCard } from "@/components/PackageCard";
import { DestinationCard } from "@/components/DestinationCard";
import { PlanTripButton } from "@/components/PlanTripButton";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { LockedPrice } from "@/components/LockedPrice";

async function getDestination(slug: string) {
  return publicFetchOrNull<PublicDestinationDetailDto>(`/public/destinations/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const destination = await getDestination(params.slug);
  if (!destination) return {};
  return {
    title: destination.seo?.title ?? `${destination.name} Holiday Packages`,
    description: destination.seo?.description ?? destination.description ?? undefined,
    alternates: destination.seo?.canonicalUrl ? { canonical: destination.seo.canonicalUrl } : undefined,
    openGraph: destination.seo?.ogImageUrl ? { images: [destination.seo.ogImageUrl] } : undefined,
  };
}

export default async function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const destination = await getDestination(params.slug);
  if (!destination) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.description ?? undefined,
    image: destination.heroImageUrl ?? undefined,
    touristType: destination.categoryNames,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        breadcrumbs={[{ label: "Destinations", href: "/destinations" }, { label: destination.name }]}
        eyebrow={destination.countryName}
        title={`${destination.name}, ${destination.countryName}`}
        subtitle={destination.description ?? undefined}
        imageUrl={destination.heroImageUrl}
        actions={
          <>
            <PlanTripButton
              destinations={[destination]}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
            >
              Customize My {destination.name} Trip →
            </PlanTripButton>
            <Button href="/visa-guide" variant="glass" size="md">
              Visa information
            </Button>
          </>
        }
      />

      {destination.bestTimeToVisit || destination.idealDurationRange || destination.categoryNames.length > 0 || destination.startingFromPrice ? (
        <section className="border-b border-slate-100 bg-mist">
          <div className="shell grid grid-cols-2 gap-6 py-6 sm:grid-cols-4">
            {destination.bestTimeToVisit ? (
              <div>
                <p className="text-xs text-slate-400">Best time</p>
                <p className="mt-0.5 font-semibold text-navy-deep">{destination.bestTimeToVisit}</p>
              </div>
            ) : null}
            {destination.idealDurationRange ? (
              <div>
                <p className="text-xs text-slate-400">Ideal duration</p>
                <p className="mt-0.5 font-semibold text-navy-deep">{destination.idealDurationRange}</p>
              </div>
            ) : null}
            {destination.categoryNames.length > 0 ? (
              <div>
                <p className="text-xs text-slate-400">Travel styles</p>
                <p className="mt-0.5 font-semibold text-navy-deep">{destination.categoryNames.join(", ")}</p>
              </div>
            ) : null}
            {destination.startingFromPrice ? (
              <div>
                <p className="text-xs text-slate-400">Starting from</p>
                <LockedPrice amount={destination.startingFromPrice} size="sm" className="mt-0.5 font-semibold" />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="shell py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-12">
            {destination.packages.length > 0 ? (
              <section>
                <SectionHeading eyebrow="Popular packages" title={`Ready-to-shape ${destination.name} itineraries`} />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {destination.packages.map((p) => (
                    <PackageCard key={p.id} pkg={p} />
                  ))}
                </div>
              </section>
            ) : null}

            {destination.highlights.length > 0 ? (
              <section>
                <SectionHeading eyebrow="Things to do" title={`Highlights of ${destination.name}`} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {destination.highlights.map((h) => (
                    <div key={h.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <h3 className="font-display text-sm text-navy-deep">{h.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{h.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {destination.activities.length > 0 ? (
              <section>
                <h2 className="font-display text-lg text-navy-deep">Activities we can add</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {destination.activities.map((a) => (
                    <span key={a.id} className="rounded-full border border-slate-200 px-3.5 py-2 text-sm text-slate-600">
                      {a.label}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {destination.faqItems.length > 0 ? (
              <section>
                <h2 className="font-display text-lg text-navy-deep">Frequently asked</h2>
                <div className="mt-4 flex flex-col divide-y divide-slate-100">
                  {destination.faqItems.map((f) => (
                    <details key={f.id} className="group py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                        {f.question}
                        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" strokeWidth={2} />
                      </summary>
                      <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            {destination.hotelSuggestions.length > 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="font-display text-base text-navy-deep">Where you could stay</h3>
                <div className="mt-4 flex flex-col divide-y divide-slate-100">
                  {destination.hotelSuggestions.map((h) => (
                    <div key={h.id} className="py-3 text-sm">
                      <p className="font-semibold text-slate-800">{h.name ?? h.descriptor ?? `${h.starRating}★ stay in ${h.area}`}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Star className="h-3 w-3 fill-accent text-accent" strokeWidth={0} />
                        {h.starRating}★ · {h.area}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl bg-brand p-6 text-white">
              <h3 className="font-display text-base">Travel guide</h3>
              <p className="mt-2 text-sm text-white/80">
                Visa rules for Indian passport holders vary by season and change often — our team reconfirms current requirements before every booking.
              </p>
              <Link
                href="/visa-guide"
                className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold text-navy-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
              >
                Read travel guides
              </Link>
            </div>
          </div>
        </div>

        {destination.similarDestinations.length > 0 ? (
          <section className="mt-16">
            <SectionHeading eyebrow="Similar destinations" title="You may also like" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {destination.similarDestinations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
