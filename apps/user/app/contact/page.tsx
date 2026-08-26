import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { publicFetch } from "@/lib/api";
import { TripPlanForm } from "@/components/TripPlanForm";
import { PageHero } from "@/components/PageHero";
import { CallbackRequestButton } from "@/components/CallbackRequestButton";

export const metadata: Metadata = { title: "Talk to an Expert" };

export default async function ContactPage() {
  const destinations = await publicFetch<DestinationDto[]>("/public/destinations").catch(() => [] as DestinationDto[]);

  return (
    <div>
      <PageHero
        breadcrumbs={[{ label: "Contact" }]}
        eyebrow="We're here to help"
        title="Talk to an Expert"
        subtitle="Tell us where you want to go — a real Paxbook travel expert will get back to you."
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium sm:p-8">
            <h2 className="font-display text-xl text-navy-deep">Plan my trip</h2>
            <p className="mt-1 text-sm text-slate-500">Share the basics and a Paxbook expert drafts your itinerary and shares it with you.</p>
            <div className="mt-6">
              <TripPlanForm destinations={destinations} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-brand p-6 text-white">
              <h3 className="font-display text-lg">Reach us directly</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <a href="tel:+917300047077" className="flex items-center gap-2 font-semibold hover:text-accent">
                  <Phone className="h-4 w-4" strokeWidth={2} />
                  +91 73000 47077
                </a>
                <a href="mailto:planners@paxbook.in" className="flex items-center gap-2 text-white/80 hover:text-accent">
                  <Mail className="h-4 w-4" strokeWidth={2} />
                  planners@paxbook.in
                </a>
                <a href="https://wa.me/917300047077" className="flex items-center gap-2 text-white/80 hover:text-accent">
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  Chat on WhatsApp
                </a>
              </div>
              <CallbackRequestButton className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark" />
            </div>
            <div className="rounded-3xl bg-mist p-6">
              <h3 className="font-display text-lg text-navy-deep">Expert hours</h3>
              <p className="mt-2 text-sm text-slate-500">
                Planning desk: 9 AM – 9 PM IST, all week. Travellers on trip get 24×7 assistance on the trip helpline shared in the voucher.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
