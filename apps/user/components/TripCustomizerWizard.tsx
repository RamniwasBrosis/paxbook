"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MapPin, Loader2, PartyPopper } from "lucide-react";
import type { PublicDestinationDetailDto } from "@paxbook/types";
import { CustomizeSteps, CUSTOMIZE_STEPS, type CustomizeStepName } from "@/components/CustomizeSteps";
import { Button } from "@/components/Button";
import { Inclusions } from "@/components/Inclusions";
import { CITIES, TRAVELLER_TYPES } from "@/lib/trip-wizard-constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

const INTERESTS = ["Beach & Relaxation", "Adventure & Trekking", "Culture & Heritage", "Food & Nightlife", "Nature & Wildlife", "Shopping", "Photography", "Wellness & Spa"];
const DURATIONS = [
  { label: "2 – 3 Days", note: "Quick Getaway" },
  { label: "4 – 6 Days", note: "Short & Sweet" },
  { label: "7 – 10 Days", note: "More to Explore" },
  { label: "10 – 15 Days", note: "The Ultimate Journey" },
];

type Step = "travellers" | "interests" | "duration" | "city" | "date" | "review" | "mobile" | "done";
const STEP_ORDER: Step[] = ["travellers", "interests", "duration", "city", "date", "review", "mobile"];
const STEP_TO_HEADER: Partial<Record<Step, CustomizeStepName>> = {
  travellers: "Travellers",
  interests: "Interests",
  duration: "Duration",
  city: "Departure City",
  date: "Departure Date",
};

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

export function TripCustomizerWizard({
  destination,
  initialTravellerType,
}: {
  destination: PublicDestinationDetailDto;
  initialTravellerType?: string;
}) {
  const [step, setStep] = React.useState<Step>("travellers");
  const [travellerType, setTravellerType] = React.useState(initialTravellerType ?? "");
  const [travellerCount, setTravellerCount] = React.useState(2);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState("");
  const [departureCity, setDepartureCity] = React.useState("");
  const [departureDate, setDepartureDate] = React.useState("");
  const [selectedPackageId, setSelectedPackageId] = React.useState<string | undefined>();
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
  function toggleInterest(v: string) {
    setInterests((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          source: "Trip Customizer",
          destinationInterest: destination.name,
          travellerType: travellerType || undefined,
          interests,
          tripDuration: duration || undefined,
          departureCity: departureCity || undefined,
          departureDate: departureDate || undefined,
          packageId: selectedPackageId,
          message: `Travellers: ${travellerCount}`,
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
      {headerStep ? <CustomizeSteps steps={CUSTOMIZE_STEPS} current={headerStep} /> : null}

      <div className="relative flex min-h-[14rem] items-end bg-navy-deep">
        {destination.heroImageUrl ? <img src={destination.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" /> : null}
        <div className="hero-scrim absolute inset-0" />
        <div className="shell relative pb-8 pt-16">
          <p className="eyebrow on-dark-muted">Customizing your trip to</p>
          <h1 className="display-xl on-dark mt-1 text-3xl sm:text-4xl">{destination.name}</h1>
        </div>
      </div>

      <div className="shell py-10">
        <div className="mx-auto max-w-xl">
          {step === "travellers" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Who&apos;s coming along?</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {TRAVELLER_TYPES.map((t) => (
                  <ChipButton key={t} selected={travellerType === t} onClick={() => setTravellerType(t)}>
                    {t}
                  </ChipButton>
                ))}
              </div>
              <label className="mt-6 block text-sm font-semibold text-slate-700">
                Number of travellers
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={travellerCount}
                  onChange={(e) => setTravellerCount(Number(e.target.value))}
                  className="mt-1.5 w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="mt-8 flex justify-end">
                <Button onClick={goNext} disabled={!travellerType} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "interests" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">What are you interested in?</h2>
              <p className="mt-1 text-sm text-slate-500">Pick as many as you like.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {INTERESTS.map((t) => (
                  <ChipButton key={t} selected={interests.includes(t)} onClick={() => toggleInterest(t)}>
                    {t}
                  </ChipButton>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button onClick={goNext} disabled={interests.length === 0} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "duration" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">How long do you want to escape?</h2>
              <div className="mt-5 flex flex-col gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setDuration(d.label)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      duration === d.label ? "border-brand bg-mist-strong" : "border-slate-200 hover:border-brand"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-bold text-navy-deep">{d.label}</span>
                      <span className="block text-xs text-slate-500">{d.note}</span>
                    </span>
                    {duration === d.label ? <Check className="h-5 w-5 text-brand" strokeWidth={2.5} /> : null}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button onClick={goNext} disabled={!duration} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "city" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Which city are you flying from?</h2>
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
              <h2 className="font-display text-xl text-navy-deep">When would you like to depart?</h2>
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

          {step === "review" ? (
            <div className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Review &amp; customize your trip</h2>
              <dl className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-mist p-4 text-sm">
                <div><dt className="text-xs text-slate-400">Destination</dt><dd className="font-semibold text-navy-deep">{destination.name}</dd></div>
                <div><dt className="text-xs text-slate-400">Travellers</dt><dd className="font-semibold text-navy-deep">{travellerType} · {travellerCount}</dd></div>
                <div><dt className="text-xs text-slate-400">Duration</dt><dd className="font-semibold text-navy-deep">{duration}</dd></div>
                <div><dt className="text-xs text-slate-400">From</dt><dd className="font-semibold text-navy-deep">{departureCity}</dd></div>
                <div><dt className="text-xs text-slate-400">Departure</dt><dd className="font-semibold text-navy-deep">{departureDate}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-slate-400">Interests</dt><dd className="font-semibold text-navy-deep">{interests.join(", ")}</dd></div>
              </dl>

              {destination.packages.length > 0 ? (
                <>
                  <p className="mt-6 text-sm font-semibold text-slate-700">Real packages for {destination.name} you might like — optional, pick one or skip:</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {destination.packages.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPackageId(selectedPackageId === p.id ? undefined : p.id)}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                          selectedPackageId === p.id ? "border-brand bg-mist-strong" : "border-slate-200 hover:border-brand"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-navy-deep">{p.title}</p>
                          <p className="text-xs text-slate-500">{p.durationNights}N / {p.durationDays}D</p>
                          <Inclusions inclusions={p.inclusions} className="mt-1" />
                        </div>
                        {selectedPackageId === p.id ? <Check className="h-5 w-5 shrink-0 text-brand" strokeWidth={2.5} /> : null}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
                </button>
                <Button onClick={goNext} variant="gold" size="md">
                  Continue <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === "mobile" ? (
            <form onSubmit={handleSubmit} className="flat-card p-6 sm:p-8">
              <h2 className="font-display text-xl text-navy-deep">Almost there — where should we send your itinerary?</h2>
              <p className="mt-1 text-sm text-slate-500">A Paxbook expert will call you to finalise pricing and availability.</p>
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
                  Get my itinerary
                </Button>
              </div>
            </form>
          ) : null}

          {step === "done" ? (
            <div className="flat-card p-8 text-center">
              <PartyPopper className="mx-auto h-10 w-10 text-accent" strokeWidth={1.75} />
              <h2 className="mt-3 font-display text-xl text-navy-deep">Thanks, {name.split(" ")[0]}!</h2>
              <p className="mt-2 text-sm text-slate-500">
                A Paxbook travel expert will call you on {phone} shortly with a custom {destination.name} itinerary.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href={`/destinations/${destination.slug}`} variant="gold" size="md">
                  <MapPin className="h-4 w-4" strokeWidth={2.5} /> See {destination.name}
                </Button>
                <Button href="/packages" variant="outline" size="md">
                  Browse packages
                </Button>
              </div>
            </div>
          ) : null}

          {step !== "done" ? (
            <p className="mt-4 text-center text-xs text-slate-400">
              Changed your mind about the destination?{" "}
              <Link href="/destinations" className="font-semibold text-brand hover:underline">
                Pick a different one
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
