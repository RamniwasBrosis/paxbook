import type { Metadata } from "next";
import type { PublicHomepageDto, PublicStatsDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { getBranding } from "@/lib/branding";
import { ClassicHero } from "@/components/templates/classic/Hero";
import { ModernHero } from "@/components/templates/modern/Hero";
import { HomepageBlockRenderer } from "@/components/HomepageBlockRenderer";
import { SectionHeading } from "@/components/SectionHeading";
import { DestinationCard } from "@/components/DestinationCard";
import { ReviewStars } from "@/components/ReviewStars";
import { ScrollCarousel } from "@/components/ScrollCarousel";
import { PlanTripButton } from "@/components/PlanTripButton";
import { WhosComingAlongSection, type PersonaConfig, type TravelerTypeConfig } from "@/components/WhosComingAlongSection";
import { TripsLovingSection } from "@/components/TripsLovingSection";
import { PackagesByStyleSection } from "@/components/PackagesByStyleSection";
import { PackagesByDurationSection } from "@/components/PackagesByDurationSection";
import { ChooseDestinationSection } from "@/components/ChooseDestinationSection";
import { AiPlannerMock } from "@/components/AiPlannerMock";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";
import { PromotionalPosters } from "@/components/PromotionalPosters";
import { FlightHelpSection } from "@/components/FlightHelpSection";
import { ReviewCard } from "@/components/ReviewCard";

export const metadata: Metadata = {
  title: "Paxbook — Travel, Explore, Experience",
};

export default async function HomePage() {
  const [home, branding, stats] = await Promise.all([
    publicFetch<PublicHomepageDto>("/public/homepage"),
    getBranding(),
    publicFetch<PublicStatsDto>("/public/stats"),
  ]);

  const heroImageUrl = "/hero.jpg";
  const personas = home.homepageBlocks.find((b) => b.type === "who_coming_along")?.configJson.items as PersonaConfig[] | undefined;
  const travelerTypes = home.homepageBlocks.find((b) => b.type === "traveler_types")?.configJson.items as TravelerTypeConfig[] | undefined;
  const priceByDestinationId = Object.fromEntries(
    home.recentPackages.reduce((map, p) => {
      const current = map.get(p.destinationId);
      if (!current || p.basePrice < current) map.set(p.destinationId, p.basePrice);
      return map;
    }, new Map<string, number>()),
  );

  return (
    <div>
      {branding.templateSlug === "modern" ? (
        <ModernHero backgroundImageUrl={heroImageUrl} stats={stats} destinations={home.featuredDestinations} />
      ) : (
        <ClassicHero backgroundImageUrl={heroImageUrl} stats={stats} destinations={home.featuredDestinations} />
      )}

      <HomepageBlockRenderer blocks={home.homepageBlocks} stats={stats} siteName={branding.siteName} types={["why_choose"]} />

      <WhosComingAlongSection personas={personas} travelerTypes={travelerTypes} />

      <PromoBannerStrip banners={home.banners} />

      <ChooseDestinationSection destinations={home.featuredDestinations} priceByDestinationId={priceByDestinationId} />

      <PackagesByDurationSection destinations={home.featuredDestinations} packages={home.recentPackages} />

      <TripsLovingSection packages={home.recentPackages} />

      {home.visaFreeDestinations.length > 0 ? (
        <section className="shell py-16 lg:py-20">
          <SectionHeading
            eyebrow="Low paperwork, high reward"
            title="Visa-Free Escapes"
            subtitle="Destinations that are usually quick to enter for Indian passport holders. Rules change often — our team reconfirms before every booking."
          />
          <ScrollCarousel>
            {home.visaFreeDestinations.map((d) => (
              <div key={d.id} className="w-64 shrink-0 snap-start sm:w-72">
                <DestinationCard destination={d} startingPrice={priceByDestinationId[d.id]} />
              </div>
            ))}
          </ScrollCarousel>
        </section>
      ) : null}

      <PackagesByStyleSection packages={home.recentPackages} />

      <FlightHelpSection />

      <HomepageBlockRenderer blocks={home.homepageBlocks} stats={stats} types={["how_it_works"]} />

      {branding.aiPlannerEnabled ? <AiPlannerMock destinations={home.featuredDestinations} /> : null}

      {home.featuredTestimonials.length > 0 ? (
        <section className="py-16 lg:py-20">
          <div className="shell">
            <SectionHeading eyebrow="Words From the Road" title="Real trips, real travellers." align="center" />
            {stats.averageRating ? (
              <p className="-mt-4 mb-8 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted">
                <ReviewStars rating={Math.round(stats.averageRating)} />
                {stats.averageRating}/5 · {stats.reviewCount}+ reviews
              </p>
            ) : null}
            <ScrollCarousel>
              {home.featuredTestimonials.map((t) => (
                <ReviewCard key={t.id} testimonial={t} />
              ))}
            </ScrollCarousel>
          </div>
        </section>
      ) : null}

      <section className="shell pb-20 pt-4">
        <div className="grid items-center gap-8 rounded-[2rem] bg-navy-deep px-6 py-12 text-white sm:px-12 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:px-16 lg:py-14">
          <div>
            <p className="script-eyebrow text-3xl !text-accent">Your Journey, Your Way</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
              Not sure where to go? Talk to a Paxbook expert.
            </h2>
            <p className="mt-4 max-w-xl text-white/80">Tell us your dates and budget, and we&apos;ll craft a 100% customised plan for you.</p>
          </div>
          <div className="flex flex-col gap-3">
            <PlanTripButton
              destinations={home.featuredDestinations}
              className="inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-extrabold text-navy-deep transition-colors hover:bg-accent-dark"
            >
              Plan My Trip
            </PlanTripButton>
            <a
              href="tel:+917300047077"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white/60 px-8 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Call 7300047077
            </a>
            <a href="https://wa.me/917300047077" className="text-center text-sm font-semibold text-accent underline-offset-4 hover:underline">
              Prefer WhatsApp? Chat with a travel expert
            </a>
          </div>
        </div>
      </section>

      <PromotionalPosters posters={home.banners.filter((b) => b.placement === "homepage_bottom")} />
    </div>
  );
}
