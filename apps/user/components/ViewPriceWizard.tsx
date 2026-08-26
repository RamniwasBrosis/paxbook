"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, MapPin, MessageCircle, PartyPopper } from "lucide-react";
import type { PublicPackageDetailDto } from "@paxbook/types";
import { CustomizeSteps } from "@/components/CustomizeSteps";
import { Button } from "@/components/Button";
import { CITIES, TRAVELLER_TYPES } from "@/lib/trip-wizard-constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

const VIEW_PRICE_STEPS = ["Destination", "Departure City", "Departure Date", "Travelling With", "Expert Assistance", "Mobile Number"] as const;
type ViewPriceStepName = (typeof VIEW_PRICE_STEPS)[number];

type Step = "destination" | "city" | "date" | "travellers" | "expert" | "mobile" | "done";
const STEP_ORDER: Step[] = ["destination", "city", "date", "travellers", "expert", "mobile"];
const STEP_TO_HEADER: Record<Step, ViewPriceStepName | undefined> = {
  destination: "Destination",
  city: "Departure City",
  date: "Departure Date",
  travellers: "Travelling With",
  expert: "Expert Assistance",
  mobile: "Mobile Number",
  done: undefined,
};

function getTenantSlugFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)pb_tenant_slug=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function ChipButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
        selected ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600 hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

export function ViewPriceWizard({ pkg }: { pkg: PublicPackageDetailDto }) {
  const [step, setStep] = React.useState<Step>("destination");
  const [departureCity, setDepartureCity] = React.useState("");
  const [departureDate, setDepartureDate] = React.useState("");
  const [travellerType, setTravellerType] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function goNext() {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[idx + 1] ?? "done");
  }
  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]!);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const slug = getTenantSlugFromCookie();
      const res = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(slug ? { "X-Tenant-Slug": slug } : {}) },
        body: JSON.stringify({
          name,
          phone,
          source: "View Price",
          destinationInterest: pkg.destinationName,
          departureCity: departureCity || undefined,
          departureDate: departureDate || undefined,
          travellerType: travellerType || undefined,
          packageId: pkg.id,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Something went wrong.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const headerStep = STEP_TO_HEADER[step];

  return (
    <div>
      {headerStep ? <CustomizeSteps steps={VIEW_PRICE_STEPS} current={headerStep} /> : null}

      <div className="relative flex min-h-[14rem] items-end bg-navy-deep">
        {pkg.galleryImages[0]?.imageUrl ? (
          <img src={pkg.galleryImages[0].imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        ) : null}
        <div className="hero-scrim absolute inset-0" />
        <div className="shell relative pb-8 pt-16">
          <p className="eyebrow on-dark-muted">Get a price for</p>
          <h1 className="display-xl on-dark mt-1 text-3xl sm:text-4xl">{pkg.title}</h1>
        </div>
      </div>

      <div className="shell py-10">
        <div className="mx-auto max-w-xl">
          {step === "destination" ? (
            <div className="flat-card p-6 sm:p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-brand" strokeWidth={1.75} />
              <h2 className="mt-3 font-display text-xl text-navy-deep">Your destination</h2>
              <p className="mt-2 text-2xl font-extrabold text-navy-deep">{pkg.destinationName}</p>
              <p className="mt-1 text-sm text-slate-500">{pkg.title}</p>
              <div className="mt-8 flex justify-center">
                <Button onClick={goNext} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "city" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Choose your departure city</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <ChipButton key={c} selected={departureCity === c} onClick={() => setDepartureCity(c)}>
                    {c}
                  </ChipButton>
                ))}
              </div>
              <input
                placeholder="Other city"
                value={CITIES.includes(departureCity) ? "" : departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button onClick={goNext} disabled={!departureCity} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "date" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Choose your departure date</h2>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button onClick={goNext} disabled={!departureDate} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "travellers" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Who are you travelling with?</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {TRAVELLER_TYPES.map((t) => (
                  <ChipButton key={t} selected={travellerType === t} onClick={() => setTravellerType(t)}>
                    {t}
                  </ChipButton>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button onClick={goNext} disabled={!travellerType} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "expert" ? (
            <div className="flat-card p-6 sm:p-8 text-center">
              <h2 className="font-display text-xl text-navy-deep">
                Your Sooper Hit Holidays starts with an expert who speaks your language.
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Our travel experts will fine-tune {pkg.title} for your dates, budget, and group — just save your itinerary and we&apos;ll take it from there.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button onClick={goNext} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
                <a
                  href="https://wa.me/917300047077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2.5} /> Talk to an expert now
                </a>
              </div>
              <button type="button" onClick={goBack} className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand mx-auto">
                <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
              </button>
            </div>
          ) : null}

          {step === "mobile" ? (
            <form onSubmit={handleSubmit} className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Enter your mobile number to save this itinerary</h2>
              <p className="mt-1 text-sm text-slate-500">A Paxbook expert will call you with pricing and availability.</p>
              <div className="mt-5 flex flex-col gap-3">
                <input
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                />
                <input
                  required
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button type="submit" disabled={busy} variant="gold" size="md">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save itinerary
                </Button>
              </div>
            </form>
          ) : null}

          {step === "done" ? (
            <div className="flat-card p-8 text-center">
              <PartyPopper className="mx-auto h-10 w-10 text-accent" strokeWidth={1.75} />
              <h2 className="mt-3 font-display text-xl text-navy-deep">Thanks, {name.split(" ")[0]}!</h2>
              <p className="mt-2 text-sm text-slate-500">
                A Paxbook travel expert will call you on {phone} shortly with pricing for {pkg.title}.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href={`/packages/${pkg.slug}`} variant="gold" size="md">
                  <MapPin className="h-4 w-4" strokeWidth={2.5} /> Back to {pkg.title}
                </Button>
                <Button href="/packages" variant="outline" size="md">
                  Browse packages
                </Button>
              </div>
            </div>
          ) : null}

          {step !== "done" ? (
            <p className="mt-4 text-center text-xs text-slate-400">
              Not the right trip?{" "}
              <Link href="/packages" className="font-semibold text-brand hover:underline">
                Browse other packages
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
