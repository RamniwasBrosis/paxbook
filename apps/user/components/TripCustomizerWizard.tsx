"use client";

import * as React from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  Check,
  Clock,
  Coffee,
  Compass,
  Crown,
  Heart,
  Luggage,
  MapPin,
  PartyPopper,
  Pencil,
  Phone,
  PiggyBank,
  Plane,
  Mail,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  User,
  Users,
  Users2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { PublicDestinationDetailDto } from "@paxbook/types";
import { WizardHero } from "@/components/WizardHero";
import { CustomizeSteps, CUSTOMIZE_STEPS, type CustomizeStepName } from "@/components/CustomizeSteps";
import { Button } from "@/components/Button";
import { Inclusions } from "@/components/Inclusions";
import { ArchOption, WizardStep } from "@/components/wizard/ArchOption";
import { CityPicker } from "@/components/wizard/CityPicker";
import { CITIES, TRAVELLER_TYPES } from "@/lib/trip-wizard-constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

const TRAVELLER_ICON: Record<string, LucideIcon> = { Solo: User, Couple: Heart, Family: Users, Friends: PartyPopper, Group: Users2 };
const DEFAULT_COUNT: Record<string, number> = { Solo: 1, Couple: 2, Family: 4, Friends: 4, Group: 8 };

const INTERESTS = [
  { label: "Beach & Relaxation", image: "/interests/beach.jpg" },
  { label: "Adventure & Trekking", image: "/interests/adventure.jpg" },
  { label: "Culture & Heritage", image: "/interests/culture.jpg" },
  { label: "Food & Nightlife", image: "/interests/food.jpg" },
  { label: "Nature & Wildlife", image: "/interests/nature.jpg" },
  { label: "Shopping", image: "/interests/shopping.jpg" },
  { label: "Photography", image: "/interests/photography.jpg" },
  { label: "Wellness & Spa", image: "/interests/wellness.jpg" },
];
const DURATIONS = [
  { label: "2 – 3 Days", note: "Quick Getaway", bags: 1, tone: "bg-blue-50 text-blue-600" },
  { label: "4 – 6 Days", note: "Short & Sweet", bags: 2, tone: "bg-emerald-50 text-emerald-600" },
  { label: "7 – 10 Days", note: "More to Explore", bags: 3, tone: "bg-orange-50 text-orange-600" },
  { label: "10 – 15 Days", note: "The Ultimate Journey", bags: 4, tone: "bg-violet-50 text-violet-600" },
];
const STAYS = [
  { label: "Value", stars: 3, note: "Comfortable, budget-friendly hotels", icon: PiggyBank, tone: "bg-rose-50 text-rose-500" },
  { label: "Comfort", stars: 4, note: "Well-rated hotels in great locations", icon: ThumbsUp, tone: "bg-amber-50 text-amber-600" },
  { label: "Luxury", stars: 5, note: "Premium resorts and top-end service", icon: Crown, tone: "bg-violet-50 text-violet-600" },
];
const PACES = [
  { label: "Relaxed", note: "Slow travel, plenty of free time to unwind", icon: Coffee, tone: "bg-sky-50 text-sky-600" },
  { label: "Balanced", note: "A good mix of activities and downtime", icon: Compass, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Packed", note: "Maximum activities, fast-paced every day", icon: Zap, tone: "bg-orange-50 text-orange-600" },
];

type Step = "travellers" | "interests" | "duration" | "stay" | "pace" | "city" | "date" | "review" | "mobile" | "done";
const STEP_ORDER: Step[] = ["travellers", "interests", "duration", "stay", "pace", "city", "date", "review", "mobile"];
const STEP_TO_HEADER: Partial<Record<Step, CustomizeStepName>> = {
  travellers: "Travellers",
  interests: "Interests",
  duration: "Duration",
  stay: "Stay",
  pace: "Pace",
  city: "Departure City",
  date: "Departure Date",
};

function isoIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function prettyDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
const QUICK_DATES = [
  { label: "In 2 weeks", days: 14 },
  { label: "Next month", days: 30 },
  { label: "In 2 months", days: 60 },
  { label: "In 3 months", days: 90 },
];

function Icon3({ icon: I, tone }: { icon: LucideIcon; tone: string }) {
  return (
    <span className={`grid h-28 w-28 place-items-center rounded-full sm:h-32 sm:w-32 ${tone}`}>
      <I className="h-14 w-14" strokeWidth={1.5} />
    </span>
  );
}

export function TripCustomizerWizard({
  destination,
  initialTravellerType,
  travellerImages,
  review,
  rating,
}: {
  destination: PublicDestinationDetailDto;
  initialTravellerType?: string;
  /** Photo per traveller type (Solo, Couple...) from the homepage CMS personas. */
  travellerImages?: Record<string, string>;
  review?: { name: string; content: string; imageUrl: string | null };
  rating?: { average: number; count: number };
}) {
  const initialType = TRAVELLER_TYPES.find((t) => t.toLowerCase() === initialTravellerType?.toLowerCase().replace(/s$/, "")) ?? "";
  const [step, setStep] = React.useState<Step>("travellers");
  const [travellerType, setTravellerType] = React.useState(initialType);
  const [travellerCount, setTravellerCount] = React.useState(DEFAULT_COUNT[initialType] ?? 2);
  const [interests, setInterests] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState("");
  const [stay, setStay] = React.useState("");
  const [pace, setPace] = React.useState("");
  const [departureCity, setDepartureCity] = React.useState("");
  const [departureDate, setDepartureDate] = React.useState("");
  const [selectedPackageId, setSelectedPackageId] = React.useState<string | undefined>();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  // Warm the cache for the interest photos while the visitor is still on the first step.
  React.useEffect(() => {
    for (const i of INTERESTS) new Image().src = i.image;
  }, []);

  function go(next: Step) {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function goNext() {
    go(STEP_ORDER[STEP_ORDER.indexOf(step) + 1] ?? "done");
  }
  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) go(STEP_ORDER[idx - 1]!);
  }
  function pickTraveller(t: string) {
    setTravellerType(t);
    setTravellerCount(DEFAULT_COUNT[t] ?? 2);
  }
  function toggleInterest(v: string) {
    setInterests((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  // Every contact field is required: the expert needs a name, a 10-digit mobile and an email.
  const mobileDigits = phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  const fieldErrors = {
    name: name.trim().length < 2 ? "Please enter your full name." : null,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "Please enter a valid email address." : null,
    phone: !/^[6-9]\d{9}$/.test(mobileDigits) ? "Please enter a valid 10-digit mobile number." : null,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (fieldErrors.name || fieldErrors.email || fieldErrors.phone) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: mobileDigits,
          email: email.trim(),
          source: "Trip Customizer",
          destinationInterest: destination.name,
          travellerType: travellerType || undefined,
          interests,
          tripDuration: duration || undefined,
          departureCity: departureCity || undefined,
          departureDate: departureDate || undefined,
          packageId: selectedPackageId,
          travellerCount,
          stayType: stay || undefined,
          travelPace: pace || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Something went wrong.");
      go("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const headerStep = STEP_TO_HEADER[step];
  const stayInfo = STAYS.find((s) => s.label === stay);

  const summary: { label: string; value: string; icon: LucideIcon; step: Step }[] = [
    { label: "Travellers", value: `${travellerType} · ${travellerCount}`, icon: Users, step: "travellers" },
    { label: "Duration", value: duration, icon: Clock, step: "duration" },
    { label: "Stay", value: stayInfo ? `${stayInfo.label} · ${stayInfo.stars}★ hotels` : "", icon: BedDouble, step: "stay" },
    { label: "Pace", value: pace, icon: Compass, step: "pace" },
    { label: "Flying from", value: departureCity, icon: Plane, step: "city" },
    { label: "Departure", value: prettyDate(departureDate), icon: CalendarDays, step: "date" },
  ];

  return (
    <div>
      {headerStep ? <CustomizeSteps steps={CUSTOMIZE_STEPS} current={headerStep} /> : null}

      <WizardHero eyebrow="Customizing your trip to" title={destination.name} imageUrl={destination.heroImageUrl} />

      <div ref={topRef} className="scroll-mt-32 bg-[radial-gradient(ellipse_at_top,rgb(245_183_61/0.16)_0%,rgb(var(--band-2))_45%,rgb(var(--page))_85%)]">
        <div className="shell py-12 sm:py-16">
          {step === "travellers" ? (
            <WizardStep title="Who are you travelling with?" onNext={goNext} nextDisabled={!travellerType} nextLabel="Choose your interests">
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
                {TRAVELLER_TYPES.map((t) => {
                  const I = TRAVELLER_ICON[t] ?? Users;
                  return (
                    <ArchOption
                      key={t}
                      label={t}
                      selected={travellerType === t}
                      onClick={() => pickTraveller(t)}
                      imageUrl={travellerImages?.[t]}
                      art={<Icon3 icon={I} tone="bg-brand-light text-brand-blue" />}
                    />
                  );
                })}
              </div>
              {travellerType ? (
                <div className="mx-auto mt-8 flex w-fit items-center gap-4 rounded-2xl border border-sand-frame bg-white px-5 py-3 shadow-soft">
                  <span className="text-sm font-bold text-navy-deep">Number of travellers</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Fewer travellers"
                      onClick={() => setTravellerCount((n) => Math.max(1, n - 1))}
                      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-lg font-bold text-navy-deep hover:border-navy-deep"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="w-8 text-center font-display text-xl font-extrabold text-navy-deep">
                      {travellerCount}
                    </span>
                    <button
                      type="button"
                      aria-label="More travellers"
                      onClick={() => setTravellerCount((n) => Math.min(40, n + 1))}
                      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-lg font-bold text-navy-deep hover:border-navy-deep"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : null}
              {review || rating ? (
                <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-5 rounded-3xl border border-sand-frame bg-white/80 p-5 shadow-soft sm:flex-row sm:p-6">
                  {review ? (
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent bg-brand-light font-display font-bold text-navy-deep">
                        {review.imageUrl ? <img src={review.imageUrl} alt="" className="h-full w-full object-cover" /> : review.name.charAt(0)}
                      </span>
                      <figure className="min-w-0">
                        <blockquote className="line-clamp-2 text-sm leading-relaxed text-navy-deep sm:text-base">&ldquo;{review.content}&rdquo;</blockquote>
                        <figcaption className="mt-1 text-xs font-bold text-ink-muted">— {review.name}</figcaption>
                      </figure>
                    </div>
                  ) : null}
                  {rating ? (
                    <div className="shrink-0 text-center sm:border-l sm:border-slate-200 sm:pl-6">
                      <p className="font-display text-2xl font-extrabold text-navy-deep">
                        {rating.average}/5 <span className="text-amber-500">★</span>
                      </p>
                      <p className="text-xs font-semibold text-ink-muted">{rating.count}+ reviews</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </WizardStep>
          ) : null}

          {step === "interests" ? (
            <WizardStep
              title="What's your travel vibe?"
              hint="Pick as many as you like"
              onBack={goBack}
              onNext={goNext}
              nextDisabled={interests.length === 0}
              nextLabel="Choose your trip duration"
            >
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
                {INTERESTS.map((t) => (
                  <ArchOption key={t.label} label={t.label} imageUrl={t.image} selected={interests.includes(t.label)} onClick={() => toggleInterest(t.label)} />
                ))}
              </div>
            </WizardStep>
          ) : null}

          {step === "duration" ? (
            <WizardStep title="What's the duration of your holiday?" onBack={goBack} onNext={goNext} nextDisabled={!duration} nextLabel="Choose your stay">
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {DURATIONS.map((d) => (
                  <ArchOption
                    key={d.label}
                    label={d.label}
                    note={d.note}
                    selected={duration === d.label}
                    onClick={() => setDuration(d.label)}
                    art={
                      <span className={`flex h-28 w-28 items-end justify-center gap-0.5 rounded-full pb-8 sm:h-32 sm:w-32 ${d.tone}`}>
                        {Array.from({ length: d.bags }, (_, i) => (
                          <Luggage key={i} className={i % 2 ? "h-8 w-8" : "h-10 w-10"} strokeWidth={1.6} />
                        ))}
                      </span>
                    }
                  />
                ))}
              </div>
            </WizardStep>
          ) : null}

          {step === "stay" ? (
            <WizardStep title="How do you like to stay?" onBack={goBack} onNext={goNext} nextDisabled={!stay} nextLabel="Pick your pace">
              <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">
                {STAYS.map((s) => {
                  const selected = stay === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setStay(s.label)}
                      className={`relative overflow-hidden rounded-3xl border-2 p-6 text-left transition-all hover:-translate-y-1 ${
                        selected ? "border-navy-deep bg-brand-light shadow-card" : "border-sand-frame bg-white shadow-soft hover:border-brand-blue/50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                        <span className="font-display text-2xl font-extrabold text-navy-deep">{s.label}</span>
                        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${s.tone}`}>
                          <s.icon className="h-7 w-7" strokeWidth={1.75} />
                        </span>
                      </span>
                      <span className="mt-4 flex items-center gap-2 text-base font-semibold text-navy-deep">
                        <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} /> {s.stars} <span className="text-amber-500">★</span> Hotels
                      </span>
                      <span className="mt-2 flex items-start gap-2 text-sm text-ink-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} /> {s.note}
                      </span>
                      {selected ? (
                        <span aria-hidden="true" className="absolute bottom-0 right-0 h-12 w-12 bg-navy-deep [clip-path:polygon(100%_0,100%_100%,0_100%)]">
                          <Check className="absolute bottom-1.5 right-1.5 h-4 w-4 text-white" strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </WizardStep>
          ) : null}

          {step === "pace" ? (
            <WizardStep title="What's your pace of travel?" onBack={goBack} onNext={goNext} nextDisabled={!pace} nextLabel="Choose departure city">
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 min-[480px]:grid-cols-3">
                {PACES.map((p) => (
                  <ArchOption key={p.label} label={p.label} note={p.note} selected={pace === p.label} onClick={() => setPace(p.label)} art={<Icon3 icon={p.icon} tone={p.tone} />} />
                ))}
              </div>
            </WizardStep>
          ) : null}

          {step === "city" ? (
            <WizardStep title="Which city are you flying from?" onBack={goBack} onNext={goNext} nextDisabled={!departureCity} nextLabel="Choose departure date">
              <CityPicker value={departureCity} onChange={setDepartureCity} popular={CITIES} />
            </WizardStep>
          ) : null}

          {step === "date" ? (
            <WizardStep title="When would you like to depart?" onBack={goBack} onNext={goNext} nextDisabled={!departureDate} nextLabel="Review your trip">
              <div className="mx-auto max-w-4xl">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {QUICK_DATES.map((q) => {
                    const iso = isoIn(q.days);
                    const selected = departureDate === iso;
                    return (
                      <button
                        key={q.label}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDepartureDate(iso)}
                        className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 px-3 py-5 transition-all hover:-translate-y-1 ${
                          selected ? "border-navy-deep bg-brand-light shadow-card" : "border-sand-frame bg-white shadow-soft hover:border-brand-blue/50"
                        }`}
                      >
                        <CalendarDays className="h-8 w-8 text-brand-blue" strokeWidth={1.6} />
                        <span className="font-display text-base font-bold text-navy-deep">{q.label}</span>
                        <span className="text-xs text-ink-muted">{prettyDate(iso)}</span>
                        {selected ? (
                          <span aria-hidden="true" className="absolute bottom-0 right-0 h-10 w-10 bg-navy-deep [clip-path:polygon(100%_0,100%_100%,0_100%)]">
                            <Check className="absolute bottom-1 right-1 h-3.5 w-3.5 text-white" strokeWidth={3} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <label className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-center">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Or pick an exact date</span>
                  <input
                    type="date"
                    min={isoIn(1)}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="h-14 rounded-2xl border-2 border-brand-blue/40 bg-white px-5 text-center text-lg font-semibold text-navy-deep shadow-soft focus:border-navy-deep focus:outline-none"
                  />
                </label>
              </div>
            </WizardStep>
          ) : null}

          {step === "review" ? (
            <WizardStep title="Review & customize your trip" hint="Tap any detail to change it" onBack={goBack} onNext={goNext} nextLabel="Get my itinerary">
              <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-sand-frame bg-white shadow-float">
                <div className="relative h-44 sm:h-56">
                  {destination.heroImageUrl ? <img src={destination.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-accent">
                      <MapPin className="h-4 w-4" /> Your custom holiday
                    </p>
                    <p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{destination.name}</p>
                  </div>
                </div>
                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-8">
                  {summary.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => go(s.step)}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition-colors hover:border-navy-deep"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-blue">
                        <s.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-ink-muted">{s.label}</span>
                        <span className="block truncate font-bold text-navy-deep">{s.value}</span>
                      </span>
                      <Pencil className="h-4 w-4 shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => go("interests")}
                    className="group flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition-colors hover:border-navy-deep sm:col-span-3"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-blue">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-ink-muted">Travel vibe</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {interests.map((i) => (
                          <span key={i} className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-navy-deep">
                            {i}
                          </span>
                        ))}
                      </span>
                    </span>
                    <Pencil className="h-4 w-4 shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </div>

                {destination.packages.length > 0 ? (
                  <div className="border-t border-slate-100 p-5 sm:p-8">
                    <p className="font-display text-lg font-extrabold text-navy-deep">Start from a ready package?</p>
                    <p className="text-sm text-ink-muted">Optional. Pick one and our expert will tailor it, or skip.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {destination.packages.slice(0, 4).map((p) => {
                        const selected = selectedPackageId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setSelectedPackageId(selected ? undefined : p.id)}
                            className={`relative flex overflow-hidden rounded-2xl border-2 text-left transition-colors ${
                              selected ? "border-navy-deep bg-brand-light" : "border-slate-200 hover:border-brand-blue/50"
                            }`}
                          >
                            <span className="relative w-28 shrink-0 bg-mist">
                              {p.coverImageUrl ? <img src={p.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                            </span>
                            <span className="min-w-0 flex-1 p-3">
                              <span className="block font-bold text-navy-deep">{p.title}</span>
                              <span className="block text-xs text-ink-muted">
                                {p.durationNights}N / {p.durationDays}D
                              </span>
                              <Inclusions inclusions={p.inclusions} className="mt-1" />
                            </span>
                            {selected ? (
                              <span aria-hidden="true" className="absolute bottom-0 right-0 h-10 w-10 bg-navy-deep [clip-path:polygon(100%_0,100%_100%,0_100%)]">
                                <Check className="absolute bottom-1 right-1 h-3.5 w-3.5 text-white" strokeWidth={3} />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </WizardStep>
          ) : null}

          {step === "mobile" ? (
            <form onSubmit={handleSubmit} noValidate>
              <WizardStep title="Almost there! Where should we send your itinerary?" onBack={goBack} submit busy={busy} nextLabel="Get my itinerary">
                <div className="mx-auto max-w-xl rounded-[2rem] border border-sand-frame bg-white p-6 shadow-float sm:p-8">
                  <p className="text-center text-sm text-ink-muted">A Paxbook expert will call you to finalise pricing and availability. All fields are required.</p>
                  <div className="mt-5 flex flex-col gap-3">
                    {(
                      [
                        { key: "name", icon: User, label: "Full name", type: "text", value: name, set: setName, auto: "name", mode: undefined },
                        { key: "email", icon: Mail, label: "Email address", type: "email", value: email, set: setEmail, auto: "email", mode: "email" },
                        { key: "phone", icon: Phone, label: "Mobile number", type: "tel", value: phone, set: setPhone, auto: "tel", mode: "tel" },
                      ] as const
                    ).map((f) => {
                      const err = touched ? fieldErrors[f.key] : null;
                      return (
                        <div key={f.key}>
                          <label
                            className={`flex h-14 items-center gap-3 rounded-2xl border-2 px-4 focus-within:border-navy-deep ${err ? "border-red-400" : "border-slate-200"}`}
                          >
                            <f.icon className="h-5 w-5 shrink-0 text-ink-muted" />
                            <span className="sr-only">{f.label}</span>
                            <input
                              required
                              type={f.type}
                              inputMode={f.mode}
                              autoComplete={f.auto}
                              placeholder={`${f.label} *`}
                              value={f.value}
                              aria-invalid={Boolean(err)}
                              aria-describedby={err ? `wiz-${f.key}-err` : undefined}
                              onChange={(e) => f.set(e.target.value)}
                              className="w-full bg-transparent text-base text-navy-deep focus:outline-none"
                            />
                          </label>
                          {err ? (
                            <p id={`wiz-${f.key}-err`} className="mt-1.5 pl-2 text-xs font-semibold text-red-600">
                              {err}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {error ? (
                    <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
                      {error}
                    </p>
                  ) : null}
                  <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-muted">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> No payment needed now. Your details are only used for this trip.
                  </p>
                </div>
              </WizardStep>
            </form>
          ) : null}

          {step === "done" ? (
            <div className="mx-auto max-w-xl rounded-[2rem] border border-sand-frame bg-white p-8 text-center shadow-float sm:p-10">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent/20">
                <PartyPopper className="h-10 w-10 text-accent-ink" strokeWidth={1.75} />
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-navy-deep">Thanks, {name.split(" ")[0]}!</h2>
              <p className="mt-2 text-ink-muted">
                A Paxbook travel expert will call you on <strong className="text-navy-deep">{phone}</strong> shortly with a custom {destination.name} itinerary.
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
            <p className="mt-8 text-center text-sm text-ink-muted">
              Changed your mind about the destination?{" "}
              <Link href="/destinations" className="font-bold text-navy-deep hover:underline">
                Pick a different one
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
