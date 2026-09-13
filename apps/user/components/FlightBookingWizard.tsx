"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plane, ShieldCheck, ShieldOff, AlertTriangle } from "lucide-react";
import type {
  CreateFlightBookingRequestDto,
  FlightBaggageOptionDto,
  FlightMealOptionDto,
  FlightPassengerInputDto,
  FlightPassengerSsrInputDto,
  FlightPriceCheckDto,
  FlightSeatLookupResultDto,
  FlightSeatOptionDto,
  FlightSsrDto,
} from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";
import { FlightLoader } from "@/components/FlightLoader";
import { AirlineLogo } from "@/components/AirlineLogo";
import { FlightStepper } from "@/components/FlightStepper";
import { SeatMapPicker, type SeatMapPassenger } from "@/components/SeatMapPicker";
import { formatDateTimeLong, formatMinutes, getClientTenantHeader, isoToDdMmYyyy, searchContextFromParams } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Mstr"];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface PassengerForm {
  title: string;
  fName: string;
  lName: string;
  pType: "A" | "C" | "I";
  gender: "M" | "F";
  dobIso: string;
  ppNo: string;
  ppIss: string;
  ppExp: string;
  ppNat: string;
  documentId: string;
}

interface PaymentOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

function storageKey(flightId: string, refId: string) {
  return `pb_flight_pax_${flightId}_${refId}`;
}

interface SsrLegChoice {
  baggageId?: string;
  mealIds?: string[];
  seatId?: string;
}
interface PassengerSsrChoice {
  onward?: SsrLegChoice;
  return?: SsrLegChoice;
}

/** Sums the real amounts of a passenger's chosen options against the SSR list actually quoted —
 * display-only; the server independently re-validates and recomputes this from scratch on submit. */
function sumSsrChoice(choice: PassengerSsrChoice | undefined, ssr: FlightSsrDto | null): number {
  if (!choice || !ssr) return 0;
  const addLeg = (leg: SsrLegChoice | undefined, legSsr: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] } | undefined) => {
    if (!leg || !legSsr) return 0;
    let sum = 0;
    if (leg.baggageId) sum += legSsr.baggage.find((b) => b.id === leg.baggageId)?.amount ?? 0;
    for (const mealId of leg.mealIds ?? []) sum += legSsr.meals.find((m) => m.id === mealId)?.amount ?? 0;
    return sum;
  };
  return addLeg(choice.onward, ssr.onward) + addLeg(choice.return, ssr.return);
}

/** Seat prices live in the separately-fetched seat map, not FlightSsrDto — sums against whichever
 * seat maps were actually loaded (undefined for a fare with no seat map, e.g. skipped seat step). */
function sumSeatChoice(choices: Record<number, PassengerSsrChoice>, seatMap: FlightSeatLookupResultDto | null): number {
  if (!seatMap) return 0;
  const flatten = (maps: typeof seatMap.onward | undefined) => (maps ?? []).flatMap((m) => m.seatMap);
  const onwardSeats = flatten(seatMap.onward);
  const returnSeats = flatten(seatMap.return);
  let sum = 0;
  for (const choice of Object.values(choices)) {
    if (choice.onward?.seatId) sum += onwardSeats.find((s) => s.seatID === choice.onward!.seatId)?.seatAmt ?? 0;
    if (choice.return?.seatId) sum += returnSeats.find((s) => s.seatID === choice.return!.seatId)?.seatAmt ?? 0;
  }
  return sum;
}

/** Drops empty legs so the create-booking payload only ever carries a passenger's real selections. */
function cleanSsrChoice(choice: PassengerSsrChoice | undefined): FlightPassengerSsrInputDto | undefined {
  if (!choice) return undefined;
  const cleanLeg = (leg: SsrLegChoice | undefined) => {
    if (!leg) return undefined;
    const mealIds = (leg.mealIds ?? []).filter(Boolean);
    if (!leg.baggageId && !leg.seatId && mealIds.length === 0) return undefined;
    return { ...(leg.baggageId ? { baggageId: leg.baggageId } : {}), ...(mealIds.length ? { mealIds } : {}), ...(leg.seatId ? { seatId: leg.seatId } : {}) };
  };
  const onward = cleanLeg(choice.onward);
  const returnLeg = cleanLeg(choice.return);
  if (!onward && !returnLeg) return undefined;
  return { ...(onward ? { onward } : {}), ...(returnLeg ? { return: returnLeg } : {}) };
}

export function FlightBookingWizard({ isLoggedIn: initiallyLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get("flightId");
  const refId = params.get("refId");
  const searchContext = React.useMemo(() => searchContextFromParams(params), [params]);

  const [priceCheck, setPriceCheck] = React.useState<FlightPriceCheckDto | null>(null);
  const [loadingPrice, setLoadingPrice] = React.useState(true);
  const [priceError, setPriceError] = React.useState<string | null>(null);

  const [step, setStep] = React.useState<"passengers" | "seats" | "review">("passengers");
  const [passengers, setPassengers] = React.useState<PassengerForm[]>([]);
  const [ssrChoices, setSsrChoices] = React.useState<Record<number, PassengerSsrChoice>>({});
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [panNo, setPanNo] = React.useState("");
  const [wantsGst, setWantsGst] = React.useState(false);
  const [gst, setGst] = React.useState({ number: "", email: "", mobile: "", address: "", company: "" });
  const [formError, setFormError] = React.useState<string | null>(null);

  const [seatMap, setSeatMap] = React.useState<FlightSeatLookupResultDto | null>(null);
  const [loadingSeats, setLoadingSeats] = React.useState(false);
  const [seatMandatoryButUnavailable, setSeatMandatoryButUnavailable] = React.useState(false);
  const [seatDirection, setSeatDirection] = React.useState<"onward" | "return">("onward");

  const [isLoggedIn, setIsLoggedIn] = React.useState(initiallyLoggedIn);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [payError, setPayError] = React.useState<string | null>(null);

  // Load fare + baggage/meal breakdown (this also freezes the price we display; the server re-verifies again at booking time).
  React.useEffect(() => {
    if (!flightId || !refId) {
      setPriceError("Missing flight details. Please search again.");
      setLoadingPrice(false);
      return;
    }
    setLoadingPrice(true);
    fetch(`${API_BASE_URL}/public/flights/price-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
      body: JSON.stringify({ flightID: Number(flightId), refID: refId }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Could not verify this fare.");
        setPriceCheck(json.data as FlightPriceCheckDto);
      })
      .catch((err) => setPriceError(err instanceof Error ? err.message : "Could not verify this fare."))
      .finally(() => setLoadingPrice(false));
  }, [flightId, refId]);

  // Build passenger slots from the pax mix, restoring any in-progress entry from this browser.
  React.useEffect(() => {
    if (!searchContext || !flightId || !refId) return;
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(storageKey(flightId, refId)) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPassengers(parsed.passengers);
        setMobile(parsed.mobile ?? "");
        setEmail(parsed.email ?? "");
        setPanNo(parsed.panNo ?? "");
        setSsrChoices(parsed.ssrChoices ?? {});
        return;
      } catch {
        // fall through to fresh slots
      }
    }
    const slots: PassengerForm[] = [
      ...Array.from({ length: searchContext.adt }, () => ({ pType: "A" as const })),
      ...Array.from({ length: searchContext.chd }, () => ({ pType: "C" as const })),
      ...Array.from({ length: searchContext.inf }, () => ({ pType: "I" as const })),
    ].map((slot) => ({ title: "Mr", fName: "", lName: "", pType: slot.pType, gender: "M" as const, dobIso: "", ppNo: "", ppIss: "", ppExp: "", ppNat: "", documentId: "" }));
    setPassengers(slots);
    setSsrChoices({});
  }, [searchContext, flightId, refId]);

  // Persist in-progress entries so a login-modal round trip (or accidental refresh) doesn't lose typed data.
  React.useEffect(() => {
    if (!flightId || !refId || passengers.length === 0) return;
    window.sessionStorage.setItem(storageKey(flightId, refId), JSON.stringify({ passengers, mobile, email, panNo, ssrChoices }));
  }, [passengers, mobile, email, panNo, ssrChoices, flightId, refId]);

  function updatePassenger(idx: number, patch: Partial<PassengerForm>) {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function updatePassengerSsr(idx: number, next: PassengerSsrChoice) {
    setSsrChoices((prev) => ({ ...prev, [idx]: next }));
  }

  const validation = priceCheck?.option.validation;
  const hasReturn = Boolean(priceCheck?.option.returnLegs);
  // Resolved only after a seat-map fetch attempt settles (see goToSeatsOrReview) — replaces the old
  // blanket "seat selection isn't supported yet" block now that it actually is.
  const unsupportedMandatory = seatMandatoryButUnavailable;

  function validatePassengers(): string | null {
    for (const [idx, p] of passengers.entries()) {
      if (!p.fName.trim() || !p.lName.trim()) return `Enter the full name for passenger ${idx + 1}.`;
      if (!p.dobIso) return `Enter date of birth for passenger ${idx + 1}.`;
      if (validation?.docMandatory && !p.documentId.trim()) return `Enter the ID proof number for passenger ${idx + 1} (required for this fare).`;
    }
    if (!/^\d{10,15}$/.test(mobile.replace(/\D/g, ""))) return "Enter a valid mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (validation?.panMandatory && !panNo.trim()) return "PAN number is required for this fare.";
    if (wantsGst && (!gst.number || !gst.email || !gst.mobile || !gst.address || !gst.company)) return "Fill in all GST details, or turn off GST billing.";
    return null;
  }

  function seatMapHasAnySeats(map: FlightSeatLookupResultDto | null): boolean {
    if (!map) return false;
    const flatten = (segs: FlightSeatLookupResultDto["onward"] | undefined) => (segs ?? []).flatMap((s) => s.seatMap);
    return flatten(map.onward).length > 0 || flatten(map.return).length > 0;
  }

  // Seat selection needs a fresh lookup with real passenger names, so it can only happen after the
  // passenger form validates — unlike baggage/meal, which are already in hand from price-check.
  async function goToSeatsOrReview(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePassengers();
    setFormError(err);
    if (err) return;
    if (!flightId || !refId) return;

    setLoadingSeats(true);
    setSeatMandatoryButUnavailable(false);
    try {
      const res = await fetch(`${API_BASE_URL}/public/flights/seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
        body: JSON.stringify({
          flightID: Number(flightId),
          refID: refId,
          passengers: passengers.map((p) => ({ title: p.title, fName: p.fName.trim(), lName: p.lName.trim(), pType: p.pType })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Could not load seat availability.");
      const map = json.data as FlightSeatLookupResultDto;
      setSeatMap(map);
      if (!seatMapHasAnySeats(map)) {
        if (validation?.seatMandatory) {
          setSeatMandatoryButUnavailable(true);
        } else {
          setStep("review");
        }
        return;
      }
      setSeatDirection("onward");
      setStep("seats");
    } catch {
      setSeatMap(null);
      if (validation?.seatMandatory) {
        setSeatMandatoryButUnavailable(true);
      } else {
        setStep("review");
      }
    } finally {
      setLoadingSeats(false);
    }
  }

  function assignSeat(passengerIdx: number, direction: "onward" | "return", seatId: string | undefined) {
    setSsrChoices((prev) => {
      const next = { ...prev };
      // A seat can only ever belong to one passenger per direction — clear it from whoever else had it.
      for (const key of Object.keys(next)) {
        const i = Number(key);
        if (i === passengerIdx) continue;
        const legChoice = next[i]?.[direction];
        if (legChoice?.seatId === seatId && seatId) {
          next[i] = { ...next[i], [direction]: { ...legChoice, seatId: undefined } };
        }
      }
      const legChoice = next[passengerIdx]?.[direction] ?? {};
      next[passengerIdx] = { ...next[passengerIdx], [direction]: { ...legChoice, seatId } };
      return next;
    });
  }

  async function handleConfirmAndPay() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    if (!flightId || !refId || !searchContext) return;
    setPayError(null);
    setBusy(true);
    try {
      let currentBookingId = bookingId;
      if (!currentBookingId) {
        const payload: CreateFlightBookingRequestDto = {
          flightID: Number(flightId),
          refID: refId,
          passengers: passengers.map(
            (p, idx): FlightPassengerInputDto => ({
              title: p.title,
              fName: p.fName.trim(),
              lName: p.lName.trim(),
              pType: p.pType,
              gender: p.gender,
              dob: isoToDdMmYyyy(p.dobIso),
              ...(p.ppNo ? { ppNo: p.ppNo, ppIss: p.ppIss, ppExp: p.ppExp, ppNat: p.ppNat } : {}),
              ...(p.documentId ? { documentId: p.documentId } : {}),
              ...(cleanSsrChoice(ssrChoices[idx]) ? { ssr: cleanSsrChoice(ssrChoices[idx]) } : {}),
            }),
          ),
          mobile,
          email,
          ...(panNo ? { firstPaxPanNo: panNo } : {}),
          webCheckin: false,
          ...(wantsGst ? { gst } : {}),
          searchContext,
        };
        const bookingRes = await fetch("/api/customer/flight-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const bookingJson = await bookingRes.json();
        if (!bookingRes.ok || bookingJson.success === false) throw new Error(bookingJson?.error?.message ?? "Could not create your booking.");
        currentBookingId = bookingJson.data.id as string;
        setBookingId(currentBookingId);
        if (flightId && refId) window.sessionStorage.removeItem(storageKey(flightId, refId));
      }

      const orderRes = await fetch(`/api/customer/flight-bookings/${currentBookingId}/payment/order`, { method: "POST" });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || orderJson.success === false) throw new Error(orderJson?.error?.message ?? "Could not start payment.");
      const order = orderJson.data as PaymentOrder;

      if (order.mock || !order.keyId || !window.Razorpay) {
        await verifyPayment(currentBookingId, order.paymentId, { devConfirm: true });
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: "Paxbook Flights",
        description: `${searchContext.depCity} → ${searchContext.arrCity}`,
        prefill: { email, contact: mobile },
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          void verifyPayment(currentBookingId!, order.paymentId, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
      });
      rzp.open();
      setBusy(false);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  async function verifyPayment(id: string, paymentId: string, payload: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/customer/flight-bookings/${id}/payment/${paymentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json?.error?.message ?? "Payment could not be verified.");
      router.push(`/account/flight-bookings/${id}?justBooked=1`);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment could not be verified.");
      setBusy(false);
    }
  }

  if (!flightId || !refId || !searchContext) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-slate-500">This booking link looks incomplete.</p>
        <Link href="/flights" className="mt-3 inline-block font-semibold text-brand hover:underline">
          Start a new search
        </Link>
      </div>
    );
  }

  if (loadingPrice) {
    return (
      <div className="flat-card">
        <FlightLoader message="Locking in your fare…" />
      </div>
    );
  }

  if (priceError || !priceCheck) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-red-600">{priceError ?? "This fare is no longer available."}</p>
        <Link href="/flights" className="mt-3 inline-block font-semibold text-brand hover:underline">
          Start a new search
        </Link>
      </div>
    );
  }

  const { option, ssr } = priceCheck;
  const ssrAddOnTotal = Object.values(ssrChoices).reduce((sum, choice) => sum + sumSsrChoice(choice, ssr), 0);
  const seatAddOnTotal = sumSeatChoice(ssrChoices, seatMap);
  const displayTotal = option.fare.total + ssrAddOnTotal + seatAddOnTotal;
  const stepperSteps = ["Passenger details", "Select seats", "Review & pay"];
  const activeStepIndex = step === "passengers" ? 0 : step === "seats" ? 1 : 2;
  const seatPassengers: SeatMapPassenger[] = passengers
    .map((p, idx) => ({ index: idx, label: `${p.fName.trim() || `Passenger ${idx + 1}`}`, pType: p.pType }))
    .filter((p): p is SeatMapPassenger => p.pType !== "I");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        {step === "passengers" ? (
          <Link
            href={`/flights/fare?flightId=${flightId}&refId=${encodeURIComponent(refId)}&${new URLSearchParams(Array.from(params.entries()).filter(([k]) => k !== "flightId")).toString()}`}
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand"
          >
            ← Change fare
          </Link>
        ) : null}
        <FlightStepper steps={stepperSteps} activeIndex={activeStepIndex} />

        {unsupportedMandatory ? (
          <div className="flat-card flex items-start gap-3 border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
            <div>
              <p className="font-bold text-navy-deep">This fare requires a seat selection we couldn&apos;t retrieve</p>
              <p className="mt-1 text-sm text-slate-600">Please go back and try a different fare, or contact our travel desk to complete this booking manually.</p>
              <Link href={`/flights/fare?flightId=${flightId}&refId=${encodeURIComponent(refId)}&${new URLSearchParams(Array.from(params.entries()).filter(([k]) => k !== "flightId")).toString()}`} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                ← Choose a different fare
              </Link>
            </div>
          </div>
        ) : step === "passengers" ? (
          <form onSubmit={goToSeatsOrReview} className="flex flex-col gap-4">
            {passengers.map((p, idx) => (
              <PassengerFieldset
                key={idx}
                index={idx}
                passenger={p}
                international={searchContext.serType === 2}
                docMandatory={Boolean(validation?.docMandatory)}
                onChange={(patch) => updatePassenger(idx, patch)}
                ssr={ssr}
                ssrChoice={ssrChoices[idx]}
                onSsrChange={(next) => updatePassengerSsr(idx, next)}
              />
            ))}

            <div className="flat-card p-5">
              <p className="mb-3 text-sm font-bold text-navy-deep">Contact details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  type="tel"
                  placeholder="Mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  required={Boolean(validation?.panMandatory)}
                  placeholder={validation?.panMandatory ? "PAN number (required for this fare)" : "PAN number (optional)"}
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-2"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={wantsGst} onChange={(e) => setWantsGst(e.target.checked)} />
                Add GST details for a business invoice
              </label>
              {wantsGst ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input placeholder="GSTIN" value={gst.number} onChange={(e) => setGst((g) => ({ ...g, number: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                  <input placeholder="Company name" value={gst.company} onChange={(e) => setGst((g) => ({ ...g, company: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                  <input placeholder="Company email" value={gst.email} onChange={(e) => setGst((g) => ({ ...g, email: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                  <input placeholder="Company mobile" value={gst.mobile} onChange={(e) => setGst((g) => ({ ...g, mobile: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                  <input placeholder="Company address" value={gst.address} onChange={(e) => setGst((g) => ({ ...g, address: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-2" />
                </div>
              ) : null}
            </div>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <button
              type="submit"
              disabled={loadingSeats}
              className="flex items-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
            >
              {loadingSeats ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue
            </button>
          </form>
        ) : step === "seats" ? (
          <div className="flex flex-col gap-4">
            <div className="flat-card p-5">
              <p className="mb-1 text-sm font-bold text-navy-deep">Choose your seats</p>
              <p className="mb-4 text-xs text-slate-500">Optional for most passengers — tap a passenger, then tap a seat to assign it.</p>
              {hasReturn && seatMap ? (
                <div className="mb-4 flex gap-2">
                  {(["onward", "return"] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setSeatDirection(dir)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                        seatDirection === dir ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600 hover:border-brand"
                      }`}
                    >
                      {dir === "onward" ? "Departure" : "Return"}
                    </button>
                  ))}
                </div>
              ) : null}
              {seatMap ? (
                <SeatMapPicker
                  segments={(seatDirection === "onward" ? seatMap.onward : seatMap.return) ?? []}
                  passengers={seatPassengers}
                  assigned={Object.fromEntries(seatPassengers.map((p) => [p.index, ssrChoices[p.index]?.[seatDirection]?.seatId]))}
                  onAssign={(passengerIdx, seatId) => assignSeat(passengerIdx, seatDirection, seatId)}
                />
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setStep("passengers")} className="text-sm font-semibold text-slate-500 hover:text-brand">
                ← Edit passengers
              </button>
              <button
                type="button"
                onClick={() => setStep("review")}
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
              >
                Continue to review
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flat-card p-5">
              <p className="mb-3 text-sm font-bold text-navy-deep">Passengers</p>
              <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
                {passengers.map((p, idx) => {
                  const onwardSeat = ssrChoices[idx]?.onward?.seatId;
                  const returnSeat = ssrChoices[idx]?.return?.seatId;
                  return (
                    <li key={idx}>
                      {p.title} {p.fName} {p.lName} <span className="text-xs text-slate-400">({p.pType === "A" ? "Adult" : p.pType === "C" ? "Child" : "Infant"})</span>
                      {onwardSeat || returnSeat ? (
                        <span className="ml-1 text-xs text-slate-400">
                          · Seat{hasReturn ? "s" : ""}: {[onwardSeat, returnSeat].filter(Boolean).join(" / ")}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-sm text-slate-600">
                Contact: {mobile} · {email}
              </p>
            </div>

            {payError ? <p className="text-sm text-red-600">{payError}</p> : null}

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setStep("passengers")} className="text-sm font-semibold text-slate-500 hover:text-brand">
                ← Edit passengers
              </button>
              {seatMapHasAnySeats(seatMap) ? (
                <button type="button" onClick={() => setStep("seats")} className="text-sm font-semibold text-slate-500 hover:text-brand">
                  ← Edit seats
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={busy}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm &amp; pay ₹{displayTotal.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="flat-card h-fit p-5 lg:sticky lg:top-24">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
          <Plane className="h-3.5 w-3.5" /> Trip summary
        </p>
        {option.legs.map((leg, idx) => (
          <div key={idx} className="mb-2 flex items-start gap-2 text-sm">
            <AirlineLogo code={leg.airlineCode} size={24} className="mt-0.5" />
            <div>
              <p className="font-semibold text-navy-deep">
                {leg.depCode} → {leg.arrCode}
              </p>
              <p className="text-xs text-slate-500">{formatDateTimeLong(leg.depDateTime)}</p>
              <p className="text-xs text-slate-400">
                {leg.airlineName} {leg.flightNo} · {formatMinutes(leg.durationMinutes)}
              </p>
            </div>
          </div>
        ))}

        <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <p className="flex items-center gap-1.5">
            {option.fare.refundable ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> : <ShieldOff className="h-3.5 w-3.5 text-slate-400" />}
            {option.fare.refundable ? "Refundable fare" : "Non-refundable fare"}
          </p>
          <p className="mt-1">Baggage: {option.fare.baggageCheckIn || "As per airline"} check-in, {option.fare.baggageCabin || "—"} cabin</p>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Base fare</span>
            <span>₹{option.fare.base.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Taxes &amp; fees</span>
            <span>₹{option.fare.tax.toLocaleString("en-IN")}</span>
          </div>
          {ssrAddOnTotal > 0 ? (
            <div className="flex justify-between text-slate-500">
              <span>Extras (baggage/meals)</span>
              <span>₹{ssrAddOnTotal.toLocaleString("en-IN")}</span>
            </div>
          ) : null}
          {seatAddOnTotal > 0 ? (
            <div className="flex justify-between text-slate-500">
              <span>Seats</span>
              <span>₹{seatAddOnTotal.toLocaleString("en-IN")}</span>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 font-bold text-navy-deep">
            <span>Total</span>
            <span>₹{displayTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </aside>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Log in to complete your booking" subtitle="Your passenger details are saved — you won't need to re-enter them.">
        <LoginForm
          nextPath={typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/flights"}
          embedded
          onSuccess={() => {
            setIsLoggedIn(true);
            setLoginOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function PassengerFieldset({
  index,
  passenger,
  international,
  docMandatory,
  onChange,
  ssr,
  ssrChoice,
  onSsrChange,
}: {
  index: number;
  passenger: PassengerForm;
  international: boolean;
  docMandatory: boolean;
  onChange: (patch: Partial<PassengerForm>) => void;
  ssr: FlightSsrDto | null;
  ssrChoice: PassengerSsrChoice | undefined;
  onSsrChange: (next: PassengerSsrChoice) => void;
}) {
  const typeLabel = passenger.pType === "A" ? "Adult" : passenger.pType === "C" ? "Child" : "Infant";
  return (
    <div className="flat-card p-5">
      <p className="mb-3 text-sm font-bold text-navy-deep">
        Passenger {index + 1} · {typeLabel}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select value={passenger.title} onChange={(e) => onChange({ title: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand">
          {TITLES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input required placeholder="First name" value={passenger.fName} onChange={(e) => onChange({ fName: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-1" />
        <input required placeholder="Last name" value={passenger.lName} onChange={(e) => onChange({ lName: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
        <select value={passenger.gender} onChange={(e) => onChange({ gender: e.target.value as "M" | "F" })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand">
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
        <label className="col-span-2 sm:col-span-2">
          <span className="mb-1 block text-xs text-slate-400">Date of birth</span>
          <input required type="date" value={passenger.dobIso} onChange={(e) => onChange({ dobIso: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
        </label>
      </div>
      {international ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input placeholder="Passport no." value={passenger.ppNo} onChange={(e) => onChange({ ppNo: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          <input placeholder="Issuing country" value={passenger.ppIss} onChange={(e) => onChange({ ppIss: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          <label>
            <span className="mb-1 block text-xs text-slate-400">Passport expiry</span>
            <input type="date" value={passenger.ppExp ? passenger.ppExp : ""} onChange={(e) => onChange({ ppExp: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <input placeholder="Nationality" value={passenger.ppNat} onChange={(e) => onChange({ ppNat: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
      ) : null}
      {docMandatory ? (
        <div className="mt-3">
          <input
            required
            placeholder="ID proof number (required for this fare)"
            value={passenger.documentId}
            onChange={(e) => onChange({ documentId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand sm:max-w-xs"
          />
        </div>
      ) : null}
      {ssr && passenger.pType !== "I" ? <SsrPicker ssr={ssr} pType={passenger.pType} choice={ssrChoice} onChange={onSsrChange} /> : null}
    </div>
  );
}

const SSR_PAX_TYPE_LABEL: Record<"A" | "C", "Adult" | "Child"> = { A: "Adult", C: "Child" };

function ssrOptionMatchesPax(optionPaxType: "Adult" | "Child" | "All", pType: "A" | "C"): boolean {
  return optionPaxType === "All" || optionPaxType === SSR_PAX_TYPE_LABEL[pType];
}

/** Real, selectable baggage/meal add-ons for one passenger — "None" plus one radio per option,
 * grouped by leg direction and (for meals) by legRef, since a connecting flight's segments can each
 * offer different meals. Rendered inside each passenger's own card since FTD prices these per
 * passenger, per direction, not once for the whole booking. */
function SsrPicker({
  ssr,
  pType,
  choice,
  onChange,
}: {
  ssr: FlightSsrDto;
  pType: "A" | "C";
  choice: PassengerSsrChoice | undefined;
  onChange: (next: PassengerSsrChoice) => void;
}) {
  function setBaggage(direction: "onward" | "return", baggageId: string | undefined) {
    const legChoice = choice?.[direction] ?? {};
    onChange({ ...choice, [direction]: { ...legChoice, baggageId } });
  }

  function setMeal(direction: "onward" | "return", legMeals: FlightMealOptionDto[], mealId: string | undefined) {
    const legChoice = choice?.[direction] ?? {};
    const otherIds = (legChoice.mealIds ?? []).filter((id) => !legMeals.some((m) => m.id === id));
    onChange({ ...choice, [direction]: { ...legChoice, mealIds: mealId ? [...otherIds, mealId] : otherIds } });
  }

  function renderLeg(direction: "onward" | "return", legSsr: { baggage: FlightBaggageOptionDto[]; meals: FlightMealOptionDto[] } | undefined, label: string) {
    if (!legSsr) return null;
    const baggageOptions = legSsr.baggage.filter((b) => ssrOptionMatchesPax(b.paxType, pType));
    const mealsByLegRef = new Map<number, FlightMealOptionDto[]>();
    legSsr.meals
      .filter((m) => ssrOptionMatchesPax(m.paxType, pType))
      .forEach((m) => mealsByLegRef.set(m.legRef, [...(mealsByLegRef.get(m.legRef) ?? []), m]));
    if (baggageOptions.length === 0 && mealsByLegRef.size === 0) return null;

    const legChoice = choice?.[direction];

    return (
      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-400">{label} extras</p>
        {baggageOptions.length > 0 ? (
          <div className="mb-2">
            <p className="mb-1 text-xs font-semibold text-slate-500">Extra baggage</p>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="radio" checked={!legChoice?.baggageId} onChange={() => setBaggage(direction, undefined)} className="accent-brand" />
                None
              </label>
              {baggageOptions.map((b) => (
                <label key={b.id} className="flex items-center justify-between gap-2 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <input type="radio" checked={legChoice?.baggageId === b.id} onChange={() => setBaggage(direction, b.id)} className="accent-brand" />
                    {b.description}
                  </span>
                  <span className="font-semibold text-navy-deep">+₹{b.amount.toLocaleString("en-IN")}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {Array.from(mealsByLegRef.entries()).map(([legRef, meals]) => {
          const chosenMealId = legChoice?.mealIds?.find((id) => meals.some((m) => m.id === id));
          return (
            <div key={legRef} className="mb-2 last:mb-0">
              <p className="mb-1 text-xs font-semibold text-slate-500">Meal{mealsByLegRef.size > 1 ? ` (segment ${legRef})` : ""}</p>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="radio" checked={!chosenMealId} onChange={() => setMeal(direction, meals, undefined)} className="accent-brand" />
                  None
                </label>
                {meals.map((m) => (
                  <label key={m.id} className="flex items-center justify-between gap-2 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <input type="radio" checked={chosenMealId === m.id} onChange={() => setMeal(direction, meals, m.id)} className="accent-brand" />
                      {m.description}
                    </span>
                    <span className="font-semibold text-navy-deep">+₹{m.amount.toLocaleString("en-IN")}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {renderLeg("onward", ssr.onward, ssr.return ? "Departure" : "Flight")}
      {ssr.return ? renderLeg("return", ssr.return, "Return") : null}
    </>
  );
}
