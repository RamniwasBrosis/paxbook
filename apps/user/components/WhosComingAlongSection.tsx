import Link from "next/link";
import { ArrowRight, Sparkles, Headset, ShieldCheck, Compass, LifeBuoy } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";

interface TravelerCard {
  label: string;
  tagline: string;
  category?: string;
  imageUrl?: string | null;
}

export interface PersonaConfig {
  label: string;
  tagline: string;
  category: string;
  imageUrl: string | null;
}

const FALLBACK_CARDS: TravelerCard[] = [
  { label: "Couples", tagline: "Romantic, unhurried", category: "Couple" },
  { label: "Family", tagline: "Kid-friendly pacing", category: "Family" },
  { label: "Friends", tagline: "Nightlife & activities", category: "Friends" },
  { label: "Solo", tagline: "Safe, guided, flexible" },
];

const TRUST_BULLETS = [
  { icon: Sparkles, title: "100% Personalized Trips", description: "Every itinerary is built around your dates, pace and budget." },
  { icon: Headset, title: "Expert Travel Assistance", description: "A named travel expert from first call to your return flight." },
  { icon: ShieldCheck, title: "Handpicked Experiences", description: "Stays and activities we would send our own family to." },
  { icon: LifeBuoy, title: "24×7 On-Trip Support", description: "Someone always answers, in your timezone or ours." },
  { icon: Compass, title: "Secure Booking", description: "Clear documentation, confirmed vouchers, no hidden add-ons." },
];

const MARQUEE_WORD = "#PaxbookHolidays";

export function WhosComingAlongSection({ destinations, personas }: { destinations: DestinationDto[]; personas?: PersonaConfig[] }) {
  const usingPersonas = Boolean(personas && personas.length > 0);
  const destImages = destinations.filter((d) => d.heroImageUrl);

  const cards: TravelerCard[] = usingPersonas
    ? personas!
    : destImages.length > 0
      ? FALLBACK_CARDS.map((card, i) => ({ ...card, imageUrl: destImages[i % destImages.length]?.heroImageUrl }))
      : [];

  if (cards.length === 0) return null;

  return (
    <section className="relative z-10 -mt-12 overflow-hidden rounded-t-[2.5rem] bg-brand pb-0 pt-12 sm:-mt-16 sm:rounded-t-[3.5rem] sm:pt-16">
      <div className="shell pb-16 sm:pb-20">
        <div className="rounded-3xl border border-white/15 p-6 sm:p-10">
          <h2 className="text-center font-display text-3xl text-white sm:text-[2.35rem]">Who&apos;s coming along?</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-white/70">
            Every Paxbook itinerary is shaped around who is travelling — pace, stays and experiences included.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {cards.map((card) => {
              const href = card.category ? `/destinations?category=${encodeURIComponent(card.category)}` : "/packages";
              return (
                <Link key={card.label} href={href} className="group relative block h-64 sm:h-80">
                  {/* solid-color arrow card, sitting behind the lower half of the photo and holding the label */}
                  <div className="arrow-card absolute inset-x-0 bottom-0 h-[54%] bg-navy-deep transition-transform duration-300 group-hover:-translate-y-1.5" />

                  {/* tall arch-shaped cutout-style photo, standing up out of the arrow card */}
                  {card.imageUrl ? (
                    <div className="persona-cutout absolute inset-x-3 top-0 h-[72%] overflow-hidden shadow-float transition-transform duration-300 group-hover:-translate-y-2 sm:inset-x-5">
                      <img src={card.imageUrl} alt={card.label} className="h-full w-full object-cover object-top" />
                    </div>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 p-4 pr-6">
                    <h3 className="font-display text-lg text-white">{card.label}</h3>
                    <p className="text-xs font-semibold text-accent">{card.tagline}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[0.72rem] font-bold text-white underline decoration-accent decoration-2 underline-offset-4">
                      Start planning
                      <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TRUST_BULLETS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 transition-colors hover:border-accent/60">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20">
                  <b.icon className="h-4 w-4 text-accent" strokeWidth={2} />
                </span>
                <p className="mt-3 text-sm font-bold text-white">{b.title}</p>
                <p className="mt-1 text-xs text-white/60">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-accent py-2.5">
        <div className="flex w-max animate-marquee items-center gap-8">
          {Array.from({ length: 2 }).map((_, groupIdx) => (
            <div key={groupIdx} className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={groupIdx === 1}>
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="whitespace-nowrap text-sm font-bold uppercase tracking-wide text-navy-deep">
                  {MARQUEE_WORD}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
