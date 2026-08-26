import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { PublicPackageDetailDto, WishlistItemDto } from "@paxbook/types";
import { publicFetchOrNull } from "@/lib/api";
import { readSession } from "@/lib/session";
import { customerFetchOrNull } from "@/lib/customer-api";
import { SectionHeading } from "@/components/SectionHeading";
import { PackageCard } from "@/components/PackageCard";
import { ReviewStars } from "@/components/ReviewStars";
import { InquiryForm } from "@/components/InquiryForm";
import { BookNowButton } from "@/components/BookNowButton";
import { WishlistToggleButton } from "@/components/WishlistToggleButton";
import { SubmitReviewForm } from "@/components/SubmitReviewForm";
import { PageHero } from "@/components/PageHero";
import { Inclusions } from "@/components/Inclusions";
import { LockedPrice } from "@/components/LockedPrice";
import { Button } from "@/components/Button";
import { ItineraryDayList } from "@/components/ItineraryDayList";

const RouteMap = dynamic(() => import("@/components/RouteMap").then((m) => m.RouteMap), { ssr: false });

async function getPackage(slug: string) {
  return publicFetchOrNull<PublicPackageDetailDto>(`/public/packages/${slug}`);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pkg = await getPackage(params.slug);
  if (!pkg) return {};
  return {
    title: pkg.seo?.title ?? `${pkg.title} — ${pkg.durationDays}D/${pkg.durationNights}N`,
    description: pkg.seo?.description ?? `${pkg.title} holiday package to ${pkg.destinationName}, starting from ₹${pkg.basePrice.toLocaleString("en-IN")}.`,
    alternates: pkg.seo?.canonicalUrl ? { canonical: pkg.seo.canonicalUrl } : undefined,
    openGraph: pkg.seo?.ogImageUrl ? { images: [pkg.seo.ogImageUrl] } : pkg.coverImageUrl ? { images: [pkg.coverImageUrl] } : undefined,
  };
}

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pkg = await getPackage(params.slug);
  if (!pkg) notFound();

  const session = readSession();
  const wishlist = session ? await customerFetchOrNull<WishlistItemDto[]>("/customer/wishlist") : null;
  const isSaved = Boolean(wishlist?.some((w) => w.packageId === pkg.id));

  const avgRating = pkg.reviews.length > 0 ? Math.round((pkg.reviews.reduce((s, r) => s + r.rating, 0) / pkg.reviews.length) * 10) / 10 : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.seo?.description ?? undefined,
    touristType: pkg.destinationName,
    offers: { "@type": "Offer", price: pkg.basePrice, priceCurrency: "INR" },
    ...(avgRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: pkg.reviews.length } } : {}),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        breadcrumbs={[{ label: "Holiday Packages", href: "/packages" }, { label: pkg.title }]}
        eyebrow={`${pkg.durationNights}N / ${pkg.durationDays}D · ${pkg.destinationName}`}
        title={pkg.title}
        imageUrl={pkg.coverImageUrl}
        actions={
          avgRating ? (
            <span className="flex items-center gap-1 on-dark-muted text-sm">
              <ReviewStars rating={Math.round(avgRating)} /> {avgRating} · {pkg.reviews.length} reviews
            </span>
          ) : undefined
        }
      />

      <div className="shell py-10">
        {pkg.galleryImages.length > 0 ? (
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pkg.galleryImages.map((g) => (
              <img key={g.id} src={g.imageUrl} alt={pkg.title} className="h-40 w-full rounded-xl object-cover" />
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-10">
            <div className="rounded-2xl border border-slate-100 bg-mist p-4">
              <Inclusions inclusions={pkg.inclusions} className="text-sm font-semibold" />
            </div>

            {pkg.itineraryDays.length > 0 ? (
              <section>
                <SectionHeading eyebrow="Plan of action" title="Day-wise Itinerary" />
                <ItineraryDayList itineraryDays={pkg.itineraryDays} hotels={pkg.hotels} flights={pkg.flights} />
              </section>
            ) : null}

            {pkg.hotels.length > 0 || pkg.flights.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pkg.hotels.length > 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="font-display text-sm text-navy-deep">Hotels</h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {pkg.hotels.map((h) => (
                        <div key={h.id} className="text-sm">
                          <span className="font-medium text-slate-800">{h.cityName}</span>
                          <span className="text-slate-500"> · {h.roomType ?? "Standard room"} {h.mealPlan ? `· ${h.mealPlan}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {pkg.flights.length > 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="font-display text-sm text-navy-deep">Flights</h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {pkg.flights.map((f) => (
                        <div key={f.id} className="text-sm">
                          <span className="font-medium text-slate-800">{f.sector}</span>
                          <span className="text-slate-500"> · {f.isIncluded ? "Included" : "Add-on"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {pkg.routeMapPoints.length > 0 ? (
              <section>
                <h2 className="font-display text-lg text-navy-deep">Route</h2>
                <div className="mt-3">
                  <RouteMap points={pkg.routeMapPoints} />
                </div>
              </section>
            ) : null}

            {pkg.faqItems.length > 0 ? (
              <section>
                <h2 className="font-display text-lg text-navy-deep">FAQs</h2>
                <div className="mt-4 flex flex-col divide-y divide-slate-100">
                  {pkg.faqItems.map((f) => (
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

            <section>
              <h2 className="font-display text-lg text-navy-deep">Reviews</h2>
              {pkg.reviews.length > 0 ? (
                <div className="mt-4 flex flex-col gap-4">
                  {pkg.reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <ReviewStars rating={r.rating} />
                      {r.title ? <p className="mt-2 font-semibold text-slate-900">{r.title}</p> : null}
                      <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                      <p className="mt-3 text-xs font-medium text-slate-400">{r.authorName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No reviews yet — be the first to share your experience.</p>
              )}
              {session ? (
                <div className="mt-4">
                  <SubmitReviewForm packageId={pkg.id} />
                </div>
              ) : null}
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium">
              <p className="text-xs text-slate-400">Starting from</p>
              <LockedPrice amount={pkg.basePrice} size="lg" className="font-display text-3xl" />
              <p className="text-xs text-slate-400">per person, twin sharing</p>

              {pkg.pricingTiers.length > 0 ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                  {pkg.pricingTiers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{t.name}</span>
                      <LockedPrice amount={t.basePrice} size="sm" asLink={false} />
                    </div>
                  ))}
                </div>
              ) : null}

              {pkg.seasonalRates.length > 0 ? (
                <p className="mt-4 text-xs text-slate-400">Prices may vary by travel date — ask your consultant for seasonal rates.</p>
              ) : null}

              <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5">
                <Button href={`/packages/${pkg.slug}/view-price`} variant="gold" size="md" className="w-full">
                  View Price
                </Button>
                <BookNowButton packageId={pkg.id} packageSlug={pkg.slug} isLoggedIn={Boolean(session)} />
                <WishlistToggleButton packageId={pkg.id} packageSlug={pkg.slug} isLoggedIn={Boolean(session)} initiallySaved={isSaved} />
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
                >
                  Talk to Expert
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-brand p-6 text-white">
              <h3 className="font-display text-base">Enquire about this package</h3>
              <div className="mt-3">
                <InquiryForm destinationInterest={pkg.destinationName} compact />
              </div>
            </div>
          </aside>
        </div>

        {pkg.similarPackages.length > 0 ? (
          <section className="mt-16">
            <SectionHeading eyebrow="Similar packages" title="Other trips in this style" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pkg.similarPackages.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
