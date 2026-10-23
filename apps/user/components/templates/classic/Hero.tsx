import Link from "next/link";
import { ShieldCheck, Headset } from "lucide-react";
import type { DestinationDto, PublicStatsDto } from "@paxbook/types";
import { PlanTripButton } from "@/components/PlanTripButton";
import { HomeSearchTabs } from "@/components/HomeSearchTabs";
import { HeroVideo } from "@/components/HeroVideo";

/**
 * Design 2 (paxbook.in pattern) homepage hero: cream band, handwritten eyebrow, headline with a
 * gradient brand word, trust lines, and the photo standing in an arch on a dashed flight path.
 * The search card below overlaps the band's bottom edge.
 */
export function ClassicHero({
  backgroundImageUrl,
  heroVideoUrl,
  stats,
  destinations = [],
}: {
  backgroundImageUrl?: string | null;
  /** Admin-uploaded hero video; the built-in travel video when empty. */
  heroVideoUrl?: string | null;
  stats?: PublicStatsDto;
  destinations?: DestinationDto[];
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 pb-24 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:pb-28 lg:pt-16">
          <div className="fade-up">
            <p className="script-eyebrow text-3xl sm:text-4xl">Happy Traveler, Happy Memories</p>
            <h1 className="mt-4 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-navy-deep sm:text-6xl lg:text-[4.1rem]">
              Your next journey starts with <span className="text-gradient">Paxbook.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Handpicked stays, honest fares, and a dedicated expert with you from booking to boarding pass.
            </p>
            <ul className="mt-7 space-y-3 text-[0.95rem] font-semibold text-navy-deep">
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 shrink-0 text-green-600" strokeWidth={2} />
                No scam, just the faith of lakhs of happy travellers.
              </li>
              <li className="flex items-center gap-3">
                <Headset className="h-6 w-6 shrink-0 text-brand-blue" strokeWidth={2} />
                <span>
                  Talk to a travel expert now —{" "}
                  <a href="tel:+917300047077" className="font-extrabold text-accent-ink hover:underline">
                    7300047077
                  </a>
                </span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <PlanTripButton
                destinations={destinations}
                className="inline-flex h-12 items-center rounded-full bg-accent px-7 text-base font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
              >
                Plan My Trip
              </PlanTripButton>
              <Link
                href="/packages"
                className="inline-flex h-12 items-center rounded-full border-2 border-navy-deep px-7 text-base font-bold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
              >
                Explore Packages
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-[21rem] w-full max-w-[34rem] sm:h-[30rem]">
            <div className="arch absolute left-1/2 top-6 h-[88%] w-[72%] -translate-x-1/2 overflow-hidden rounded-b-[1.75rem] border-8 border-white bg-mist shadow-float">
              <HeroVideo src={heroVideoUrl || "/hero.mp4"} poster={backgroundImageUrl} />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-14 max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <HomeSearchTabs destinations={destinations} />
      </div>
    </>
  );
}
