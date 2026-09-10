import type { Metadata } from "next";
import Link from "next/link";
import { Plane, ShieldCheck, Headset, BadgePercent, ArrowRight } from "lucide-react";
import { FlightSearchForm } from "@/components/FlightSearchForm";

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

export default function FlightsLandingPage() {
  const onDate = defaultDepartureDate();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-[#132a63] to-brand pb-8 pt-8 sm:pb-12 sm:pt-10">
        <div className="flight-hero-pattern absolute inset-0" aria-hidden />
        <div className="hero-scrim absolute inset-0" aria-hidden />
        <div className="shell relative">
          <p className="eyebrow on-dark-muted flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" strokeWidth={2.5} /> Flight Booking
          </p>
          <h1 className="display-xl on-dark mt-2 max-w-2xl text-2xl sm:text-4xl">Search, compare and book flights in minutes</h1>
          <p className="on-dark-muted mt-2 max-w-xl text-sm sm:text-base">
            Live fares across airlines, transparent baggage &amp; fare rules, and instant PNR confirmation.
          </p>

          <div className="mx-auto mt-5 max-w-4xl sm:mt-7">
            <FlightSearchForm />
          </div>
        </div>
      </section>

      <div className="shell pb-6 pt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Popular routes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_ROUTES.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/flights/results?tripType=0&serType=1&depCity=${r.from}&arrCity=${r.to}&onDate=${onDate}&adt=1&chd=0&inf=0&cabin=E&fareType=A`}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-brand hover:text-brand"
            >
              {r.fromCity}
              <ArrowRight className="h-3.5 w-3.5 text-slate-300" strokeWidth={2.5} />
              {r.toCity}
            </Link>
          ))}
        </div>
      </div>

      <div className="shell pb-16 pt-4">
        <p className="eyebrow text-center">Why book with Paxbook</p>
        <h2 className="mt-1 text-center text-xl font-extrabold text-navy-deep sm:text-2xl">A smoother way to fly</h2>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature icon={ShieldCheck} title="Secure booking" desc="Your payment is protected and your fare is locked in before you pay." />
          <Feature icon={Headset} title="Real support" desc="Our travel desk can help with reschedules, cancellations and special requests." />
          <Feature icon={BadgePercent} title="Transparent pricing" desc="Base fare, taxes and baggage shown upfront — no surprises at checkout." />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof ShieldCheck; title: string; desc: string }) {
  return (
    <div className="flat-card p-5 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-mist text-brand">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="mt-3 font-bold text-navy-deep">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}
