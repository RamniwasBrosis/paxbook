import Link from "next/link";
import { ShieldCheck, Headset, Star, Plane } from "lucide-react";
import type { DestinationDto, PublicStatsDto } from "@paxbook/types";
import { PlanTripButton } from "@/components/PlanTripButton";
import { HomeSearchTabs } from "@/components/HomeSearchTabs";

/**
 * Design 2 (paxbook.in pattern) homepage hero: cream band, handwritten eyebrow, headline with a
 * gradient brand word, trust lines, and the photo standing in an arch on a dashed flight path.
 * The search card below overlaps the band's bottom edge.
 */
export function ClassicHero({
  backgroundImageUrl,
  stats,
  destinations = [],
}: {
  backgroundImageUrl?: string | null;
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
            <svg viewBox="0 0 560 480" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
              <path
                d="M 30 440 C 90 260, 200 170, 330 160 S 520 100, 540 24"
                fill="none"
                stroke="#1b3f8f"
                strokeWidth="2"
                strokeDasharray="7 8"
                opacity="0.5"
              />
              <circle cx="30" cy="440" r="7" fill="#f5b73d" />
              <circle cx="540" cy="24" r="7" fill="#db2777" />
            </svg>
            <div className="arch absolute left-1/2 top-6 h-[88%] w-[72%] -translate-x-1/2 overflow-hidden rounded-b-[1.75rem] border-8 border-white bg-mist shadow-float">
              {backgroundImageUrl ? <img src={backgroundImageUrl} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="absolute right-0 top-16 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-float sm:flex">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100">
                <Plane className="h-5 w-5 text-violet-700" strokeWidth={2} />
              </span>
              <span className="flex flex-col leading-tight">
                <strong className="text-sm text-navy-deep">Flights, stays &amp; visas</strong>
                <span className="text-xs text-ink-muted">One booking, one expert</span>
              </span>
            </div>
            {stats?.averageRating ? (
              <div className="absolute bottom-8 left-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-float">
                <span className="flex gap-0.5 text-accent" aria-label={`Rated ${stats.averageRating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                  ))}
                </span>
                <span className="text-sm font-bold text-navy-deep">
                  {stats.averageRating}/5 <span className="font-medium text-ink-muted">· {stats.reviewCount}+ reviews</span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-14 max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <HomeSearchTabs destinations={destinations} />
      </div>
    </>
  );
}
