import Link from "next/link";
import { Plane, Globe, Ticket, type LucideIcon } from "lucide-react";

const STEPS: Array<{ n: number; title: string; text: string; icon: LucideIcon }> = [
  { n: 1, title: "Book your flight", text: "Share your travel details and our booking expert will help you book the best flight.", icon: Plane },
  { n: 2, title: "Web check-in support", text: "We assist you with a hassle-free web check-in before you fly.", icon: Globe },
  { n: 3, title: "Get your boarding pass", text: "Get your boarding pass on time and travel stress-free.", icon: Ticket },
];

/** Design 2 "Booking made easy" band (paxbook.in): three numbered flight-support steps. */
export function FlightHelpSection() {
  return (
    <section className="bg-mist py-20 lg:py-24">
      <div className="shell">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-navy-deep sm:text-[2.5rem]">
            Our 24×7 booking experts are happy to help you book your perfect flight
          </h2>
          <p className="mt-4 font-display text-xl font-bold text-accent-ink sm:text-2xl">Now booking is easier than ever</p>
        </div>

        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white p-7">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy-deep font-display text-2xl font-extrabold text-white">{s.n}</span>
                <h3 className="font-display text-lg font-extrabold uppercase tracking-wide text-navy-deep">{s.title}</h3>
              </div>
              <p className="text-[0.95rem] leading-relaxed text-ink-muted">{s.text}</p>
              <s.icon className="mt-auto h-8 w-8 text-brand-blue/70" strokeWidth={1.5} aria-hidden="true" />
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/flights"
            className="inline-flex h-12 items-center rounded-full bg-navy-deep px-7 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Search flights
          </Link>
          <a
            href="tel:+917300047077"
            className="inline-flex h-12 items-center rounded-full bg-accent px-7 text-base font-extrabold text-navy-deep transition-colors hover:bg-accent-dark"
          >
            Call 7300047077
          </a>
        </div>
      </div>
    </section>
  );
}
