import * as React from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { destinations } from "@/data/paxbook";

type SiteUIContextValue = {
  demo: (feature?: string) => void;
  openPlanner: (prefill?: string) => void;
  openAuth: () => void;
  openBooking: (tripTitle?: string) => void;
};

const SiteUIContext = React.createContext<SiteUIContextValue | null>(null);

export function useSiteUI() {
  const ctx = React.useContext(SiteUIContext);
  if (!ctx) throw new Error("useSiteUI must be used inside SiteUIProvider");
  return ctx;
}

export function SiteUIProvider({ children }: { children: React.ReactNode }) {
  const [plannerOpen, setPlannerOpen] = React.useState(false);
  const [plannerPrefill, setPlannerPrefill] = React.useState("");
  const [authOpen, setAuthOpen] = React.useState(false);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [bookingTrip, setBookingTrip] = React.useState("Your Paxbook trip");

  const value = React.useMemo<SiteUIContextValue>(
    () => ({
      demo: (feature) =>
        toast("Demo preview", {
          description: feature
            ? `${feature} will be connected during development.`
            : "This feature will be connected during development.",
        }),
      openPlanner: (prefill) => {
        setPlannerPrefill(prefill ?? "");
        setPlannerOpen(true);
      },
      openAuth: () => setAuthOpen(true),
      openBooking: (tripTitle) => {
        setBookingTrip(tripTitle ?? "Your Paxbook trip");
        setBookingOpen(true);
      },
    }),
    [],
  );

  return (
    <SiteUIContext.Provider value={value}>
      {children}
      <PlanTripDialog open={plannerOpen} onOpenChange={setPlannerOpen} prefill={plannerPrefill} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <BookingFlowDialog open={bookingOpen} onOpenChange={setBookingOpen} trip={bookingTrip} />
    </SiteUIContext.Provider>
  );
}

/* ---------------------------------- Plan my trip ---------------------------------- */

function PlanTripDialog({
  open,
  onOpenChange,
  prefill,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prefill: string;
}) {
  const [sent, setSent] = React.useState(false);
  const [destination, setDestination] = React.useState(prefill);

  React.useEffect(() => {
    if (open) {
      setDestination(prefill);
      setSent(false);
    }
  }, [open, prefill]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
        <div className="bg-primary px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="on-dark text-xl">Plan my trip</DialogTitle>
            <DialogDescription className="on-dark-muted text-sm">
              Tell us the basics. A Paxbook expert drafts your itinerary and shares it within 24 hours.
            </DialogDescription>
          </DialogHeader>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-gold/20">
              <BadgeCheck className="size-7 text-gold-deep" />
            </div>
            <h3 className="mt-4 text-xl">Request received</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Demo preview — in the live portal this creates a lead and assigns a travel expert automatically.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="gold" onClick={() => onOpenChange(false)}>
                Done
              </Button>
              <Button variant="outline" asChild>
                <Link to="/ai-planner">Try the AI planner</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4 px-6 pb-6 pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Destination" icon={<MapPin className="size-4" />}>
                <Input
                  list="pax-destinations"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Bali, Dubai, Maldives…"
                  required
                />
                <datalist id="pax-destinations">
                  {destinations.map((d) => (
                    <option key={d.slug} value={d.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Travel dates" icon={<CalendarDays className="size-4" />}>
                <Input type="date" required />
              </Field>
              <Field label="Travellers" icon={<Users className="size-4" />}>
                <Input type="number" min={1} defaultValue={2} required />
              </Field>
              <Field label="Budget per person" icon={<Wallet className="size-4" />}>
                <Input placeholder="₹50,000 – ₹1,00,000" />
              </Field>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" icon={<Users className="size-4" />}>
                <Input placeholder="Full name" required />
              </Field>
              <Field label="Mobile" icon={<Phone className="size-4" />}>
                <Input type="tel" placeholder="10-digit mobile" required />
              </Field>
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full">
              Send my request <ArrowRight />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Prototype form — no data is stored or submitted anywhere.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

/* ---------------------------------- Auth ---------------------------------- */

export function AuthPanel({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [step, setStep] = React.useState<"form" | "otp">("form");
  const { demo } = useSiteUI();

  return (
    <div className="px-6 pb-7 pt-6">
      <div className="mb-5 flex rounded-full bg-mist-strong p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setStep("form");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              mode === m ? "bg-background text-primary shadow-card" : "text-muted-foreground"
            }`}
          >
            {m === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>

      {step === "form" ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("otp");
          }}
        >
          {mode === "register" && (
            <Field label="Full name">
              <Input placeholder="As per passport" required />
            </Field>
          )}
          <Field label="Mobile number" icon={<Phone className="size-4" />}>
            <Input type="tel" placeholder="+91 00000 00000" required />
          </Field>
          {mode === "register" && (
            <Field label="Email" icon={<Mail className="size-4" />}>
              <Input type="email" placeholder="you@email.com" required />
            </Field>
          )}
          <Button type="submit" variant="gold" size="lg" className="w-full">
            Continue with mobile
          </Button>

          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => demo("Google sign-in")}>
            Continue with Google
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => demo("Email sign-in")}>
            Continue with Email
          </Button>
          <p className="pt-1 text-center text-xs text-muted-foreground">
            By continuing you agree to Paxbook's Terms and Privacy Policy.
          </p>
        </form>
      ) : (
        <form
          className="space-y-4 text-center"
          onSubmit={(e) => {
            e.preventDefault();
            onDone?.();
            toast("Signed in", { description: "Demo session started — your dashboard is now unlocked." });
          }}
        >
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-blue-soft">
            <ShieldCheck className="size-6 text-brand-blue" />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the 4-digit code sent to your mobile. Any 4 digits work in this prototype.
          </p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Input key={i} maxLength={1} className="size-12 text-center text-lg" inputMode="numeric" />
            ))}
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full">
            Verify & continue
          </Button>
          <button
            type="button"
            className="text-xs font-semibold text-brand-blue"
            onClick={() => setStep("form")}
          >
            Change number
          </button>
        </form>
      )}
    </div>
  );
}

function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl p-0">
        <div className="bg-primary px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="on-dark text-xl">Welcome to Paxbook</DialogTitle>
            <DialogDescription className="on-dark-muted text-sm">
              Log in to unlock prices, save itineraries and track your bookings.
            </DialogDescription>
          </DialogHeader>
        </div>
        <AuthPanel onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- Booking flow ---------------------------------- */

const bookingSteps = [
  { title: "Customize package", text: "Hotels, activities and dates confirmed with your expert." },
  { title: "Login / OTP", text: "Verify your mobile to unlock final pricing." },
  { title: "Price unlock", text: "Full breakdown: stay, flights, activities and taxes." },
  { title: "Booking request", text: "Traveller details submitted for confirmation." },
  { title: "Payment", text: "Pay a part now, balance before departure." },
  { title: "Confirmation", text: "Vouchers, invoice and trip dashboard access." },
];

function BookingFlowDialog({
  open,
  onOpenChange,
  trip,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trip: string;
}) {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const done = step === bookingSteps.length - 1;
  const current = bookingSteps[step] ?? bookingSteps[0]!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-3xl p-0">
        <div className="bg-primary px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="on-dark text-xl">Booking journey — {trip}</DialogTitle>
            <DialogDescription className="on-dark-muted text-sm">
              Simulated customer journey. No payment or OTP is actually processed.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6">
          <ol className="mb-6 grid gap-2 sm:grid-cols-6">
            {bookingSteps.map((s, i) => (
              <li key={s.title} className="flex items-center gap-2 sm:flex-col sm:items-start">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    i < step
                      ? "bg-gold text-navy-deep"
                      : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-mist-strong text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className="text-[0.7rem] font-semibold leading-tight text-muted-foreground sm:text-[0.68rem]">
                  {s.title}
                </span>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border bg-mist p-5">
            <p className="eyebrow">Step {step + 1} of {bookingSteps.length}</p>
            <h3 className="mt-1 text-xl">{current.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{current.text}</p>

            {step === 2 && (
              <div className="mt-4 space-y-2 rounded-xl bg-background p-4 text-sm">
                <Row label="Stay (5 nights)" value="₹64,200" />
                <Row label="Flights (2 pax)" value="₹38,400" />
                <Row label="Activities & transfers" value="₹11,600" />
                <Row label="Taxes & fees" value="₹3,600" />
                <Separator />
                <Row label="Total" value="₹1,17,800" strong />
              </div>
            )}

            {step === 4 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Pay 30% now — ₹35,340", "Pay full — ₹1,17,800"].map((o, i) => (
                  <div
                    key={o}
                    className={`rounded-xl border bg-background p-4 text-sm font-semibold ${
                      i === 0 ? "border-gold ring-2 ring-gold/30" : ""
                    }`}
                  >
                    <CreditCard className="mb-2 size-4 text-brand-blue" />
                    {o}
                  </div>
                ))}
              </div>
            )}

            {done && (
              <div className="mt-4 rounded-xl bg-background p-4">
                <p className="text-sm font-semibold text-primary">Booking ID PXB-2026-1041 · Confirmed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vouchers and invoice would be emailed instantly and added to your dashboard.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {done ? (
              <Button variant="gold" asChild onClick={() => onOpenChange(false)}>
                <Link to="/dashboard">
                  Go to trip dashboard <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button variant="gold" onClick={() => setStep((s) => s + 1)}>
                {step === 1 ? "Verify OTP" : "Continue"} <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "font-bold text-primary" : ""}`}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function DemoBadge({ text = "Demo content" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist-strong px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
      <Sparkles className="size-3" />
      {text}
    </span>
  );
}
