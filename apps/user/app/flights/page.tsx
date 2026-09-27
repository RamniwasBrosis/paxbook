import type { Metadata } from "next";
import Link from "next/link";
import { Plane, ShieldCheck, Headset, BadgePercent, ArrowRight } from "lucide-react";
import type { BannerDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { SectionHeading } from "@/components/SectionHeading";
import { FlightHelpSection } from "@/components/FlightHelpSection";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";

export const metadata: Metadata = { title: "Flight Booking — Search & Book Flights" };

const POPULAR_ROUTES: { from: string; fromCity: string; to: string; toCity: string }[] = [
  { from: "DEL", fromCity: "Delhi", to: "BOM", toCity: "Mumbai" },
  { from: "BOM", fromCity: "Mumbai", to: "BLR", toCity: "Bengaluru" },
  { from: "DEL", fromCity: "Delhi", to: "BLR", toCity: "Bengaluru" },
  { from: "DEL", fromCity: "Delhi", to: "GOI", toCity: "Goa" },
  { from: "DEL", fromCity: "Delhi", to: "HYD", toCity: "Hyderabad" },
  { from: "BOM", fromCity: "Mumbai", to: "GOI", toCity: "Goa" },
  { from: "DEL", fromCity: "Delhi", to: "CCU", toCity: "Kolkata" },
  { from: "MAA", fromCity: "Chennai", to: "BLR", toCity: "Bengaluru" },
];

function defaultDepartureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export default async function FlightsLandingPage() {
  const onDate = defaultDepartureDate();
  const banners = await publicFetch<BannerDto[]>("/public/banners?placement=flights_page").catch(() => [] as BannerDto[]);

  return (
    <div>
      <section className="relative overflow-x-clip bg-cream pb-10 pt-10 sm:pb-14 sm:pt-12">
        <svg viewBox="0 0 600 200" className="pointer-events-none absolute right-0 top-6 hidden h-44 w-auto opacity-60 lg:block" aria-hidden="true">
          <path d="M 10 180 C 120 60, 300 40, 440 90 S 580 60, 595 12" fill="none" stroke="#1b3f8f" strokeWidth="2" strokeDasharray="7 8" />
          <circle cx="10" cy="180" r="6" fill="#f5b73d" />
        </svg>
        <div className="shell relative">
          <p className="script-eyebrow flex items-center gap-2 text-3xl">
            <Plane className="h-6 w-6 text-accent-ink" strokeWidth={2} /> Flight booking
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-deep sm:text-5xl">
            Search, compare and book flights in <span className="text-gradient">minutes.</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink-muted sm:text-lg">
            Live fares across airlines, transparent baggage &amp; fare rules, and instant PNR confirmation.
          </p>

          <div className="mx-auto mt-7 max-w-4xl sm:mt-9">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      <PromoBannerStrip banners={banners} />

      <div className="shell pb-6 pt-8">
        <p className="script-eyebrow text-3xl">Popular routes</p>
        <div className="rail mt-3">
          {POPULAR_ROUTES.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/flights/results?tripType=0&serType=1&depCity=${r.from}&arrCity=${r.to}&onDate=${onDate}&adt=1&chd=0&inf=0&cabin=E&fareType=A`}
              className="flat-card group w-44 shrink-0 overflow-hidden sm:w-52"
            >
              <div className="flex h-20 items-center justify-center bg-gradient-to-br from-brand to-navy-deep">
                <Plane className="h-7 w-7 text-white/90 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={1.5} />
              </div>
              <div className="p-3">
                <p className="flex items-center gap-1 text-sm font-bold text-navy-deep">
                  {r.fromCity} <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" strokeWidth={2.5} /> {r.toCity}
                </p>
                <p className="text-xs text-slate-400">
                  {r.from} - {r.to}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="shell pb-16 pt-10">
        <SectionHeading eyebrow="Why book with Paxbook" title="A smoother way to fly" align="center" />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          <Feature icon={ShieldCheck} tint="bg-green-50 text-green-600" title="Secure booking" desc="Your payment is protected and your fare is locked in before you pay." />
          <Feature icon={Headset} tint="bg-violet-50 text-violet-600" title="Real support" desc="Our travel desk can help with reschedules, cancellations and special requests." />
          <Feature icon={BadgePercent} tint="bg-orange-50 text-orange-600" title="Transparent pricing" desc="Base fare, taxes and baggage shown upfront — no surprises at checkout." />
        </div>
      </div>

      <FlightHelpSection />
    </div>
  );
}

function Feature({ icon: Icon, tint, title, desc }: { icon: typeof ShieldCheck; tint: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-soft">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${tint}`}>
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <p className="mt-4 font-display text-lg font-bold text-navy-deep">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </div>
  );
}
