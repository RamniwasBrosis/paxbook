import type { Metadata } from "next";
import type { PublicHomepageDto, PublicStatsDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { getBranding } from "@/lib/branding";
import { ClassicHero } from "@/components/templates/classic/Hero";
import { ModernHero } from "@/components/templates/modern/Hero";
import { HomepageBlockRenderer } from "@/components/HomepageBlockRenderer";
import { SectionHeading } from "@/components/SectionHeading";
import { VideoTestimonialCard } from "@/components/VideoTestimonialCard";
import { DestinationCard } from "@/components/DestinationCard";
import { ReviewStars } from "@/components/ReviewStars";
import { ScrollCarousel } from "@/components/ScrollCarousel";
import { PlanTripButton } from "@/components/PlanTripButton";
import { WhosComingAlongSection, type PersonaConfig } from "@/components/WhosComingAlongSection";
import { TripsLovingSection } from "@/components/TripsLovingSection";
import { PackagesByStyleSection } from "@/components/PackagesByStyleSection";
import { PackagesByDurationSection } from "@/components/PackagesByDurationSection";
import { ChooseDestinationSection } from "@/components/ChooseDestinationSection";
import { AiPlannerMock } from "@/components/AiPlannerMock";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";

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
  const whoComingAlongBlock = home.homepageBlocks.find((b) => b.type === "who_coming_along");
  const personas = whoComingAlongBlock ? (whoComingAlongBlock.configJson.items as PersonaConfig[]) : undefined;
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

      <WhosComingAlongSection destinations={home.featuredDestinations} personas={personas} />

      <PromoBannerStrip banners={home.banners} />

      <TripsLovingSection packages={home.recentPackages} />

      <ChooseDestinationSection destinations={home.featuredDestinations} priceByDestinationId={priceByDestinationId} />

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

      <PackagesByDurationSection destinations={home.featuredDestinations} />

      <HomepageBlockRenderer blocks={home.homepageBlocks} stats={stats} />

      <AiPlannerMock destinations={home.featuredDestinations} />

      {home.featuredTestimonials.length > 0 ? (
        <section className="shell py-16 lg:py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Stories of our travellers" title="Real trips, real travellers" />
            {stats.averageRating ? (
              <span className="mb-10 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-mist-strong px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
                <ReviewStars rating={Math.round(stats.averageRating)} />
                {stats.averageRating}/5 · {stats.reviewCount}+ reviews
              </span>
            ) : null}
          </div>
          <ScrollCarousel>
            {home.featuredTestimonials.map((t) => (
              <VideoTestimonialCard key={t.id} testimonial={t} />
            ))}
          </ScrollCarousel>
        </section>
      ) : null}

      <section className="bg-navy-deep py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white sm:text-[2.6rem]">Your Next Adventure Starts Here.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">Tell us where you want to go. We&apos;ll help you plan the journey.</p>
          <div className="mt-8">
            <PlanTripButton
              destinations={home.featuredDestinations}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
            >
              Plan My Trip
            </PlanTripButton>
          </div>
          <a href="https://wa.me/917300047077" className="mt-6 inline-block text-xs font-semibold text-accent underline-offset-4 hover:underline">
            Prefer WhatsApp? Chat with a travel expert
          </a>
        </div>
      </section>
    </div>
  );
}
