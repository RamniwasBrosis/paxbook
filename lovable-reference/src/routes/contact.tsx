import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs, PageHero } from "@/components/site/bits";
import { useSiteUI } from "@/components/site/site-ui";
import { destinations, hero } from "@/data/paxbook";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Talk to a Travel Expert — Contact Paxbook" },
      {
        name: "description",
        content:
          "Share your destination, dates and budget and a Paxbook travel expert will call you back with a costed itinerary.",
      },
      { property: "og:title", content: "Talk to a Travel Expert — Paxbook" },
      { property: "og:description", content: "Tell us where you want to go. We'll help you plan the journey." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { demo } = useSiteUI();
  const [sent, setSent] = React.useState(false);

  return (
    <>
      <PageHero
        image={hero}
        title="Talk to a Travel Expert"
        text="Tell us where you want to go and when. We usually respond the same working day."
        trail={<Breadcrumbs trail={[{ label: "Home", to: "/" }, { label: "Contact" }]} />}
      />

      <section className="section-y">
        <div className="shell grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <form
            className="min-w-0 rounded-3xl border bg-card p-6 shadow-card sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <h2 className="text-2xl">Plan my trip</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Demo form — nothing is submitted in this prototype.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="c-name">Full name</label>
                <Input id="c-name" required placeholder="Your name" className="mt-1.5 h-11" />
              </div>
              <div>
                <label className="field-label" htmlFor="c-phone">Mobile number</label>
                <Input id="c-phone" required placeholder="10-digit mobile" className="mt-1.5 h-11" />
              </div>
              <div>
                <label className="field-label" htmlFor="c-email">Email</label>
                <Input id="c-email" type="email" placeholder="you@email.com" className="mt-1.5 h-11" />
              </div>
              <div>
                <label className="field-label" htmlFor="c-dest">Destination</label>
                <select
                  id="c-dest"
                  className="mt-1.5 h-11 w-full rounded-xl border bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Not decided yet</option>
                  {destinations.map((d) => (
                    <option key={d.slug} value={d.slug}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label" htmlFor="c-msg">Tell us about your trip</label>
              <Textarea
                id="c-msg"
                rows={4}
                placeholder="Travel dates, number of travellers, budget range, anything specific…"
                className="mt-1.5"
              />
            </div>
            <Button variant="gold" size="lg" type="submit" className="mt-6 w-full sm:w-auto">
              Request a call back
            </Button>
            {sent && (
              <p className="mt-4 rounded-xl border border-gold/50 bg-gold/15 p-3 text-sm font-semibold text-navy-deep">
                Thanks! Demo preview — enquiries will reach the Paxbook team once the backend is connected.
              </p>
            )}
          </form>

          <aside className="min-w-0 space-y-4">
            <div className="rounded-3xl border bg-primary p-6">
              <h2 className="on-dark text-xl">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-gold" />
                  <a href="tel:7300047077" className="on-dark-muted hover:text-gold">7300047077</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-gold" />
                  <a href="mailto:info@paxbook.in" className="on-dark-muted hover:text-gold">info@paxbook.in</a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="size-4 shrink-0 text-gold" />
                  <button type="button" onClick={() => demo("WhatsApp chat")} className="on-dark-muted hover:text-gold">
                    Chat on WhatsApp
                  </button>
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border bg-mist p-6">
              <h3 className="text-lg">Expert hours</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Planning desk: 9 AM – 9 PM IST, all week. Travellers on trip get 24×7 assistance on the trip helpline
                shared in the voucher.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
