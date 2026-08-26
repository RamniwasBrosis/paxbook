"use client";

import { useState } from "react";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import type { DestinationDto, PublicDestinationDetailDto } from "@paxbook/types";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

const VIBES = ["Honeymoon", "Family", "Adventure", "Luxury", "Budget", "Seasonal"];
const DURATIONS = [
  { label: "2 – 3 Days", note: "Quick Getaway", days: 3 },
  { label: "4 – 6 Days", note: "Short & Sweet", days: 5 },
  { label: "7 – 10 Days", note: "More to Explore", days: 8 },
  { label: "10 – 15 Days", note: "The Ultimate Journey", days: 12 },
];
const TRAVELLERS = ["Solo", "Couple", "Family", "Friends / Group"];
const BUDGETS = ["Under ₹50K", "₹50K – ₹1.5L", "₹1.5L – ₹2.5L", "Luxury, no cap"];

type Step = "vibe" | "destination" | "duration" | "travellers" | "budget" | "result";

interface Answers {
  vibe: string;
  destinationSlug: string;
  destinationName: string;
  durationLabel: string;
  durationDays: number;
  travellers: string;
  budget: string;
}

function Bubble({ children, mine = false }: { children: React.ReactNode; mine?: boolean }) {
  return (
    <p
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
        mine ? "ml-auto bg-brand text-white" : "bg-mist text-slate-700"
      }`}
    >
      {children}
    </p>
  );
}

function Chips({ options, onPick }: { options: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onPick(opt)}
          className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function AiPlannerMock({ destinations }: { destinations: DestinationDto[] }) {
  const [step, setStep] = useState<Step>("vibe");
  const [answers, setAnswers] = useState<Answers>({
    vibe: "",
    destinationSlug: "",
    destinationName: "",
    durationLabel: "",
    durationDays: 0,
    travellers: "",
    budget: "",
  });
  const [detail, setDetail] = useState<PublicDestinationDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  const shownDestinations = (
    answers.vibe ? destinations.filter((d) => d.categoryNames?.includes(answers.vibe)) : destinations
  ).slice(0, 8);
  const fallbackDestinations = shownDestinations.length > 0 ? shownDestinations : destinations.slice(0, 8);

  function pickVibe(v: string) {
    setAnswers((a) => ({ ...a, vibe: v }));
    setStep("destination");
  }

  function pickDestination(d: DestinationDto) {
    setAnswers((a) => ({ ...a, destinationSlug: d.slug, destinationName: d.name }));
    setStep("duration");
  }

  function pickDuration(dur: (typeof DURATIONS)[number]) {
    setAnswers((a) => ({ ...a, durationLabel: dur.label, durationDays: dur.days }));
    setStep("travellers");
  }

  function pickTravellers(t: string) {
    setAnswers((a) => ({ ...a, travellers: t }));
    setStep("budget");
  }

  async function pickBudget(b: string) {
    const finalAnswers = { ...answers, budget: b };
    setAnswers(finalAnswers);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/public/destinations/${finalAnswers.destinationSlug}`);
      const json = await res.json();
      if (json.success) setDetail(json.data as PublicDestinationDetailDto);
    } catch {
      // real itinerary unavailable — the result panel falls back to a generic CTA below
    }
    setLoading(false);
    setStep("result");

    // Fire-and-forget: a completed planner session is a real lead, so it shows up in CRM
    // even if the traveller never clicks through to "Talk to an expert".
    fetch(`${API_BASE_URL}/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "AI Trip Planner visitor",
        source: "AI Trip Planner",
        destinationInterest: finalAnswers.destinationName,
        message: `Vibe: ${finalAnswers.vibe} · Duration: ${finalAnswers.durationLabel} · Travellers: ${finalAnswers.travellers} · Budget: ${finalAnswers.budget}`,
      }),
    }).catch(() => {});
  }

  function reset() {
    setAnswers({ vibe: "", destinationSlug: "", destinationName: "", durationLabel: "", durationDays: 0, travellers: "", budget: "" });
    setDetail(null);
    setStep("vibe");
  }

  const itineraryDays = detail
    ? Array.from({ length: Math.min(answers.durationDays, Math.max(detail.highlights.length, 1)) }, (_, i) => {
        if (i === 0) return { title: `Arrival in ${detail.name}`, text: "Airport pick-up and an easy first evening to settle in." };
        const h = detail.highlights[(i - 1) % Math.max(detail.highlights.length, 1)];
        return h ? { title: h.title, text: h.description } : { title: `Explore ${detail.name}`, text: "Guided sightseeing and local experiences." };
      })
    : [];

  return (
    <section id="ai-planner" className="shell py-16 lg:py-20">
      <SectionHeading
        eyebrow="AI Trip Planner"
        title="Tell us your dream trip. We'll build the plan."
        subtitle="Answer five quick questions and see a real day-by-day draft, built from our actual destination content. Your travel expert refines it from there."
      />

      <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-premium">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-mist px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy-deep">Paxbook AI Trip Planner</p>
              <p className="truncate text-xs text-slate-400">Real destination content · draft, not a booking</p>
            </div>
          </div>
          {step !== "vibe" ? (
            <button type="button" onClick={reset} className="shrink-0 text-slate-400 hover:text-brand" aria-label="Start over">
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>

        <div className="space-y-3 p-4">
          <Bubble>Hi! I&apos;m the Paxbook trip planner. Let&apos;s shape your trip in five quick questions.</Bubble>

          <Bubble>What kind of trip are you in the mood for?</Bubble>
          {answers.vibe ? <Bubble mine>{answers.vibe}</Bubble> : null}
          {step === "vibe" ? <Chips options={VIBES} onPick={pickVibe} /> : null}

          {step === "destination" || answers.destinationName ? (
            <>
              <Bubble>Where would you like to go?</Bubble>
              {answers.destinationName ? <Bubble mine>{answers.destinationName}</Bubble> : null}
              {step === "destination" ? (
                <div className="flex flex-wrap gap-2">
                  {fallbackDestinations.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => pickDestination(d)}
                      className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {step === "duration" || answers.durationLabel ? (
            <>
              <Bubble>How long do you want to escape?</Bubble>
              {answers.durationLabel ? <Bubble mine>{answers.durationLabel}</Bubble> : null}
              {step === "duration" ? (
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.label}
                      type="button"
                      onClick={() => pickDuration(dur)}
                      className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
                    >
                      {dur.label} <span className="text-slate-400">· {dur.note}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {step === "travellers" || answers.travellers ? (
            <>
              <Bubble>Who&apos;s coming along?</Bubble>
              {answers.travellers ? <Bubble mine>{answers.travellers}</Bubble> : null}
              {step === "travellers" ? <Chips options={TRAVELLERS} onPick={pickTravellers} /> : null}
            </>
          ) : null}

          {step === "budget" || answers.budget ? (
            <>
              <Bubble>What budget should we plan around, per person?</Bubble>
              {answers.budget ? <Bubble mine>{answers.budget}</Bubble> : null}
              {step === "budget" ? <Chips options={BUDGETS} onPick={pickBudget} /> : null}
            </>
          ) : null}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              Drafting your itinerary...
            </div>
          ) : null}

          {step === "result" && detail ? (
            <div className="rounded-2xl border border-accent/40 bg-mist/60 p-5">
              <h3 className="font-display text-lg text-navy-deep">
                {answers.durationDays}-day {detail.name} plan for {answers.travellers.toLowerCase()}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Built from real Paxbook content for {detail.name} — your travel expert fine-tunes pace, stays and pricing next.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {itineraryDays.map((day, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[0.65rem] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy-deep">{day.title}</p>
                      <p className="text-sm text-slate-500">{day.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={`/destinations/${detail.slug}`} variant="gold" size="sm">
                  See real {detail.name} packages
                </Button>
                <Button href="/contact" variant="outline" size="sm">
                  Talk to an expert
                </Button>
              </div>
            </div>
          ) : null}

          {step === "result" && !detail && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-mist/60 p-6 text-center">
              <p className="text-sm text-slate-500">Couldn&apos;t load that destination&apos;s content right now.</p>
              <Button href="/contact" variant="outline" size="sm" className="mt-3">
                Talk to an expert instead
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
