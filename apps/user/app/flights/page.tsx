import type { Metadata } from "next";
import { Plane, ShieldCheck, Headset, BadgePercent } from "lucide-react";
import { FlightSearchForm } from "@/components/FlightSearchForm";

export const metadata: Metadata = { title: "Flight Booking — Search & Book Flights" };

export default function FlightsLandingPage() {
  return (
    <div>
      <div className="relative bg-navy-deep">
        <div className="hero-scrim absolute inset-0" />
        <div className="shell relative py-14 sm:py-20">
          <p className="eyebrow on-dark-muted flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" strokeWidth={2.5} /> Flight Booking
          </p>
          <h1 className="display-xl on-dark mt-2 max-w-2xl text-3xl sm:text-4xl">Search, compare and book flights in minutes</h1>
          <p className="on-dark-muted mt-3 max-w-xl text-sm sm:text-base">
            Live fares across airlines, transparent baggage &amp; fare rules, and instant PNR confirmation.
          </p>
        </div>
      </div>

      <div className="shell -mt-8 pb-12 sm:-mt-10">
        <div className="mx-auto max-w-4xl">
          <FlightSearchForm />
        </div>
      </div>

      <div className="shell pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
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
      <Icon className="mx-auto h-6 w-6 text-brand" strokeWidth={1.75} />
      <p className="mt-2 font-bold text-navy-deep">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}
