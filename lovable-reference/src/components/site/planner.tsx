import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { destinations } from "@/data/paxbook";
import { useSiteUI } from "@/components/site/site-ui";

const suggestions = ["Bali", "Dubai", "Maldives", "Thailand", "Europe", "Rajasthan", "Kerala"];

export function HeroSearchCard() {
  const { openPlanner } = useSiteUI();
  const [query, setQuery] = React.useState("");

  return (
    <div className="rounded-3xl border border-white/50 bg-background/95 p-5 shadow-float backdrop-blur-xl sm:p-6">
      <form
        className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          openPlanner(query);
        }}
      >
        <SearchField label="Where do you want to go?" icon={<MapPin className="size-4" />}>
          <Input
            list="hero-destinations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a destination"
            className="h-11 border-0 bg-mist px-3"
          />
          <datalist id="hero-destinations">
            {destinations.map((d) => (
              <option key={d.slug} value={d.name} />
            ))}
          </datalist>
        </SearchField>
        <SearchField label="Travel dates" icon={<CalendarDays className="size-4" />}>
          <Input type="date" className="h-11 border-0 bg-mist px-3" />
        </SearchField>
        <SearchField label="Travellers" icon={<Users className="size-4" />}>
          <Input type="number" min={1} defaultValue={2} className="h-11 border-0 bg-mist px-3" />
        </SearchField>
        <SearchField label="Budget per person" icon={<Wallet className="size-4" />}>
          <select className="h-11 w-full rounded-md bg-mist px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option>Under ₹50,000</option>
            <option>₹50,000 – ₹1,50,000</option>
            <option>₹1,50,000 – ₹2,50,000</option>
            <option>₹2,50,000+</option>
          </select>
        </SearchField>
        <Button type="submit" variant="gold" size="xl" className="w-full lg:w-auto">
          <Search /> Start Planning
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Popular:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuery(s)}
            className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-brand-blue-soft hover:text-brand-blue"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}


/* --------------------- Cinematic hero search pill (home) --------------------- */

export function HeroSearchPill() {
  const { openPlanner } = useSiteUI();
  const [query, setQuery] = React.useState("");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        className="search-pill flex items-center gap-2 p-2 pl-5"
        onSubmit={(e) => {
          e.preventDefault();
          openPlanner(query);
        }}
      >
        <Search className="size-5 shrink-0 text-brand-blue" />
        <input
          list="hero-pill-destinations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries, cities"
          aria-label="Search destinations"
          className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <datalist id="hero-pill-destinations">
          {destinations.map((d) => (
            <option key={d.slug} value={d.name} />
          ))}
        </datalist>
        <Button type="submit" variant="gold" size="lg" className="shrink-0 rounded-full px-5">
          <span className="hidden sm:inline">Start Planning</span>
          <ArrowRight className="sm:hidden" />
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => openPlanner(s)}
            className="rounded-full border border-white/35 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- AI trip planner ------------------------------- */

type Msg = { from: "ai" | "user"; text: string };

const stepOrder = [
  { key: "vibe", question: "What kind of trip are you in the mood for?", options: ["Beach", "Adventure", "Honeymoon", "Family", "Luxury", "Budget"] },
  { key: "destination", question: "Great choice. Where would you like to travel?", options: ["Bali", "Maldives", "Dubai", "Thailand", "Switzerland", "Kerala"] },
  { key: "duration", question: "How long do you want to escape for?", options: ["2–3 days", "4–6 days", "7–10 days", "10–15 days"] },
  { key: "travellers", question: "Who's travelling?", options: ["Solo", "Couple", "Family with kids", "Friends group"] },
  { key: "budget", question: "And your comfortable budget per person?", options: ["Under ₹50K", "₹50K – ₹1.5L", "₹1.5L – ₹2.5L", "₹2.5L+"] },
] as const;

export function AiTripPlanner({ compact = false }: { compact?: boolean }) {
  const { openBooking, demo } = useSiteUI();
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = React.useState(0);
  const [messages, setMessages] = React.useState<Msg[]>([
    { from: "ai", text: "Hi! I'm the Paxbook trip planner. Tell me your dream trip and I'll draft a plan." },
    { from: "ai", text: stepOrder[0].question },
  ]);
  const [built, setBuilt] = React.useState(false);
  const scroller = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, built]);

  const step = stepOrder[stepIndex];

  const answer = (value: string) => {
    if (!step) return;
    const next = { ...answers, [step.key]: value };
    setAnswers(next);
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setMessages((m) => [
      ...m,
      { from: "user", text: value },
      ...(nextIndex < stepOrder.length
        ? [{ from: "ai" as const, text: stepOrder[nextIndex]!.question }]
        : [{ from: "ai" as const, text: "Perfect. I have everything I need — shall I build your itinerary?" }]),
    ]);
  };

  const destinationName = answers['destination'] ?? "Bali";
  const dest = destinations.find((d) => d.name === destinationName) ?? destinations[0]!;

  const itinerary = [
    { day: "Day 1", title: `Arrive in ${dest.name}`, text: "Private transfer, check-in and an easy first evening." },
    { day: "Day 2", title: "Signature highlight", text: dest.thingsToDo[0]?.text ?? "Guided highlight of the region." },
    { day: "Day 3", title: "Experience day", text: dest.thingsToDo[1]?.text ?? "Curated local experience with your guide." },
    { day: "Day 4", title: "Free & flexible", text: "Spa, shopping or an optional add-on excursion." },
    { day: "Day 5", title: "Departure", text: "Breakfast, checkout and an airport transfer." },
  ];

  return (
    <div className={`grid gap-6 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"}`}>
      <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <div className="flex items-center gap-3 border-b bg-mist px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary">
            <Sparkles className="size-4 text-gold" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Paxbook AI Trip Planner</p>
            <p className="truncate text-xs text-muted-foreground">Simulated assistant · demo experience</p>
          </div>
        </div>

        <div ref={scroller} className="max-h-[22rem] space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.from === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-mist text-foreground"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t px-5 py-4">
          {step ? (
            <>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Quick options</p>
              <div className="flex flex-wrap gap-2">
                {step.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => answer(o)}
                    className="rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors hover:border-gold hover:bg-gold/10"
                  >
                    {o}
                  </button>
                ))}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem("free") as HTMLInputElement;
                  if (input.value.trim()) {
                    answer(input.value.trim());
                    input.value = "";
                  }
                }}
              >
                <Input name="free" placeholder="Or type your own answer…" className="h-10" />
                <Button type="submit" variant="outline" size="icon" aria-label="Send">
                  <Send />
                </Button>
              </form>
            </>
          ) : (
            <Button variant="gold" size="lg" className="w-full" onClick={() => setBuilt(true)}>
              Create My Trip <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
        {built ? (
          <div className="fade-up">
            <div className="relative">
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                width={1024}
                height={768}
                className="h-40 w-full object-cover"
              />
              <div className="overlay-scrim absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-widest text-gold">Suggested itinerary</p>
                <h3 className="on-dark text-2xl">
                  {answers['vibe'] ?? "Custom"} trip to {dest.name}
                </h3>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2 text-xs">
                {[answers['duration'] ?? "5 days", answers['travellers'] ?? "Couple", answers['budget'] ?? "₹50K – ₹1.5L", dest.bestTime].map(
                  (t) => (
                    <span key={t} className="rounded-full bg-mist-strong px-3 py-1 font-semibold">
                      {t}
                    </span>
                  ),
                )}
              </div>
              <ol className="space-y-3">
                {itinerary.map((d) => (
                  <li key={d.day} className="flex gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-[0.7rem] font-bold text-brand-blue">
                      {d.day.replace("Day ", "D")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{d.title}</p>
                      <p className="text-sm text-muted-foreground">{d.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button variant="gold" onClick={() => openBooking(`${dest.name} custom trip`)}>
                  Continue to booking
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/destinations/$slug" params={{ slug: dest.slug }}>
                    Explore {dest.name}
                  </Link>
                </Button>
                <Button variant="ghost" onClick={() => demo("Itinerary PDF export")}>
                  Email this plan
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-[20rem] place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-blue-soft">
                <Sparkles className="size-6 text-brand-blue" />
              </div>
              <h3 className="mt-4 text-xl">Your itinerary appears here</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Answer a few quick questions and Paxbook drafts a day-by-day plan you can hand straight to an expert.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
