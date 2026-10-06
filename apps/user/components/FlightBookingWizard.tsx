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
  FlightOptionDto,
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
import { TravellerCountEditor, takeCarriedPassengers } from "@/components/TravellerCountEditor";
import { SeatMapPicker, type SeatMapPassenger } from "@/components/SeatMapPicker";
import { cleanSsrChoice, sumSeatChoice, sumSsrChoice, type PassengerSsrChoice } from "@/components/FlightSsr";
import { FlightTripDetails } from "@/components/FlightTripDetails";
import { FareSummary } from "@/components/FareSummary";
import { StickySidebar } from "@/components/StickySidebar";
import { FareUpgradeCards, FareUpgradeSection, useFareOptions } from "@/components/FareUpgradeSection";
import { FlightImportantInfo } from "@/components/FlightImportantInfo";
import { FlightAddOns } from "@/components/FlightAddOns";
import { FlightCouponBox, useFlightCoupon } from "@/components/FlightCouponBox";
import { TravellerBasicFields, FIELD_INPUT } from "@/components/TravellerBasicFields";
import { formatBaggage, formatDateTimeLong, formatMinutes, getClientTenantHeader, isoToDdMmYyyy, searchContextFromParams , isDobOptional } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

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

export function FlightBookingWizard({ isLoggedIn: initiallyLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get("flightId");
  const refId = params.get("refId");
  // The search-level flight id the fares were listed for; its sibling fares feed "upgrade your fare".
  const fareOf = params.get("fareOf");
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
  const [wantsWebCheckin, setWantsWebCheckin] = React.useState(false);
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
        setWantsWebCheckin(parsed.wantsWebCheckin ?? false);
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
    setPassengers(takeCarriedPassengers(slots));
    setSsrChoices({});
  }, [searchContext, flightId, refId]);

  // Persist in-progress entries so a login-modal round trip (or accidental refresh) doesn't lose typed data.
  React.useEffect(() => {
    if (!flightId || !refId || passengers.length === 0) return;
    window.sessionStorage.setItem(storageKey(flightId, refId), JSON.stringify({ passengers, mobile, email, panNo, ssrChoices, wantsWebCheckin }));
  }, [passengers, mobile, email, panNo, ssrChoices, wantsWebCheckin, flightId, refId]);

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
      if (!p.dobIso && !(searchContext && isDobOptional(p.pType, searchContext))) return `Enter date of birth for passenger ${idx + 1}.`;
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
              dob: p.dobIso ? isoToDdMmYyyy(p.dobIso) : "",
              ...(p.ppNo ? { ppNo: p.ppNo, ppIss: p.ppIss, ppExp: p.ppExp, ppNat: p.ppNat } : {}),
              ...(p.documentId ? { documentId: p.documentId } : {}),
              ...(cleanSsrChoice(ssrChoices[idx]) ? { ssr: cleanSsrChoice(ssrChoices[idx]) } : {}),
            }),
          ),
          mobile,
          email,
          ...(panNo ? { firstPaxPanNo: panNo } : {}),
          webCheckin: wantsWebCheckin,
          ...(wantsGst ? { gst } : {}),
          searchContext,
          ...(couponCode ? { couponCode } : {}),
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

  const fareOptions = useFareOptions(fareOf, refId);

  /** Swaps to another fare of the same flight, keeping typed travellers and contact details; add-ons
   * are priced per fare, so they start over. */
  function switchFare(next: FlightOptionDto) {
    if (!refId) return;
    try {
      window.sessionStorage.setItem(storageKey(next.id, refId), JSON.stringify({ passengers, mobile, email, panNo, ssrChoices: {}, wantsWebCheckin: false }));
    } catch {
      // storage blocked: the new fare still loads, details just need retyping
    }
    const q = new URLSearchParams(params);
    q.set("flightId", next.id);
    setSeatMap(null);
    router.replace(`/flights/passengers?${q.toString()}`, { scroll: false });
  }

  const grossTotal = priceCheck
    ? priceCheck.option.fare.total +
      Object.values(ssrChoices).reduce((sum, choice) => sum + sumSsrChoice(choice, priceCheck.ssr), 0) +
      sumSeatChoice(ssrChoices, seatMap) +
      (wantsWebCheckin && priceCheck.ssr?.webCheckinEnabled ? priceCheck.ssr.webCheckinAmount : 0)
    : 0;
  const coupon = useFlightCoupon(grossTotal);
  const couponCode = coupon.applied?.code;
  // The draft booking freezes travellers, add-ons and the coupon; changing any of them after it was
  // created must create a fresh one, or payment would be for the old details.
  React.useEffect(() => {
    setBookingId(null);
  }, [passengers, ssrChoices, wantsWebCheckin, couponCode, mobile, email, panNo, wantsGst, gst]);

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
  const webCheckinTotal = wantsWebCheckin && ssr?.webCheckinEnabled ? ssr.webCheckinAmount : 0;
  const discount = coupon.applied?.discount ?? 0;
  const displayTotal = Math.max(0, Math.round((option.fare.total + ssrAddOnTotal + seatAddOnTotal + webCheckinTotal - discount) * 100) / 100);
  const stepperSteps = ["Passenger details", "Select seats", "Review & pay"];
  const activeStepIndex = step === "passengers" ? 0 : step === "seats" ? 1 : 2;
  const seatPassengers: SeatMapPassenger[] = passengers
    .map((p, idx) => ({ index: idx, label: `${p.fName.trim() || `Passenger ${idx + 1}`}`, pType: p.pType }))
    .filter((p): p is SeatMapPassenger => p.pType !== "I");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Header spans both columns so the sidebar starts level with the first card on the left. */}
      <div className="lg:col-span-2">
        {step === "passengers" ? (
          <Link
            href={`/flights/fare?flightId=${fareOf ?? flightId}&${new URLSearchParams(Array.from(params.entries()).filter(([k]) => k !== "flightId" && k !== "fareOf")).toString()}`}
            className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-brand-blue hover:text-navy-deep"
          >
            ← Back
          </Link>
        ) : null}
        <FlightStepper steps={stepperSteps} activeIndex={activeStepIndex} />
      </div>
      <div className="min-w-0">

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
          <form onSubmit={goToSeatsOrReview} noValidate className="flex flex-col gap-5">
            <section aria-labelledby="trip-summary-title" className="flex flex-col gap-4">
              <h2 id="trip-summary-title" className="font-display text-2xl font-extrabold text-navy-deep">
                Trip summary
              </h2>
              <FlightTripDetails legs={option.legs} fare={option.fare} fareRulesFlightId={option.id} />
              {option.returnLegs?.length ? <FlightTripDetails legs={option.returnLegs} fare={option.returnFare ?? option.fare} fareRulesFlightId={option.id} /> : null}
            </section>

            <FareUpgradeSection show={fareOptions.length > 1}>
              <FareUpgradeCards options={fareOptions} currentId={option.id} currentTotal={option.fare.total} onChoose={switchFare} />
            </FareUpgradeSection>

            <FlightImportantInfo />

            <section aria-labelledby="traveller-details-title" className="flex flex-col gap-4">
              <h2 id="traveller-details-title" className="font-display text-2xl font-extrabold text-navy-deep">
                Traveller details
              </h2>
              <p className="-mt-2 text-sm text-ink-muted">Enter names exactly as on the government ID the traveller will carry.</p>
              <TravellerCountEditor context={searchContext} passengersToCarry={passengers} />
              {passengers.map((p, idx) => (
                <PassengerFieldset
                  key={idx}
                  index={idx}
                  passenger={p}
                  international={searchContext.serType === 2}
                  dobOptional={isDobOptional(p.pType, searchContext)}
                  docMandatory={Boolean(validation?.docMandatory)}
                  onChange={(patch) => updatePassenger(idx, patch)}
                />
              ))}
            </section>


            <div className="flat-card p-5">
              <p className="mb-1 font-display text-lg font-bold text-navy-deep">Contact details</p>
              <p className="mb-4 text-sm text-ink-muted">Your e-ticket and updates are sent here.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  type="tel"
                  placeholder="Mobile number" aria-label="Mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address" aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
                <input
                  required={Boolean(validation?.panMandatory)}
                  placeholder={validation?.panMandatory ? "PAN number (required for this fare)" : "PAN number (optional)"} aria-label={validation?.panMandatory ? "PAN number (required for this fare)" : "PAN number (optional)"}
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 sm:col-span-2"
                />
              </div>
              {ssr?.webCheckinEnabled ? (
                <label className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy-deep has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                  <input type="checkbox" checked={wantsWebCheckin} onChange={(e) => setWantsWebCheckin(e.target.checked)} />
                  Add web check-in for all passengers (+₹{ssr.webCheckinAmount.toLocaleString("en-IN")})
                </label>
              ) : null}
              <label className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy-deep has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                <input type="checkbox" checked={wantsGst} onChange={(e) => setWantsGst(e.target.checked)} />
                Add GST details for a business invoice
              </label>
              {wantsGst ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input placeholder="GSTIN" aria-label="GSTIN" value={gst.number} onChange={(e) => setGst((g) => ({ ...g, number: e.target.value }))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  <input placeholder="Company name" aria-label="Company name" value={gst.company} onChange={(e) => setGst((g) => ({ ...g, company: e.target.value }))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  <input placeholder="Company email" aria-label="Company email" value={gst.email} onChange={(e) => setGst((g) => ({ ...g, email: e.target.value }))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  <input placeholder="Company mobile" aria-label="Company mobile" value={gst.mobile} onChange={(e) => setGst((g) => ({ ...g, mobile: e.target.value }))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                  <input placeholder="Company address" aria-label="Company address" value={gst.address} onChange={(e) => setGst((g) => ({ ...g, address: e.target.value }))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 sm:col-span-2" />
                </div>
              ) : null}
            </div>

            <FlightAddOns passengers={passengers} ssr={ssr} choices={ssrChoices} onChange={updatePassengerSsr} />

            <FlightCouponBox coupon={coupon} className="lg:hidden" />
            <div className="flex items-baseline justify-between rounded-2xl bg-cream px-4 py-3 text-navy-deep lg:hidden">
              <span className="font-bold">Total{discount > 0 ? <span className="ml-1.5 text-xs font-semibold text-emerald-700">after ₹{discount.toLocaleString("en-IN")} off</span> : null}</span>
              <span className="font-display text-xl font-extrabold">₹{displayTotal.toLocaleString("en-IN")}</span>
            </div>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <button
              type="submit"
              disabled={loadingSeats}
              className="flex h-12 items-center gap-2 self-start rounded-full bg-accent px-9 text-base font-extrabold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
            >
              {loadingSeats ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue
            </button>
          </form>
        ) : step === "seats" ? (
          <div className="flex flex-col gap-4">
            <div className="flat-card p-3 sm:p-5">
              <p className="mb-1 font-display text-lg font-bold text-navy-deep">Choose your seats</p>
              <p className="mb-4 text-sm text-ink-muted">Optional for most passengers — tap a passenger, then tap a seat to assign it.</p>
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
                className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-base font-extrabold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark"
              >
                Continue to review
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flat-card p-5">
              <p className="mb-3 font-display text-lg font-bold text-navy-deep">Review passengers</p>
              <ul className="flex flex-col divide-y divide-slate-100 text-[0.95rem] text-navy-deep">
                {passengers.map((p, idx) => {
                  const onwardSeat = ssrChoices[idx]?.onward?.seatId;
                  const returnSeat = ssrChoices[idx]?.return?.seatId;
                  return (
                    <li key={idx} className="py-2.5 first:pt-0">
                      <span className="font-semibold">{p.title} {p.fName} {p.lName}</span> <span className="text-xs text-slate-400">({p.pType === "A" ? "Adult" : p.pType === "C" ? "Child" : "Infant"})</span>
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

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" strokeWidth={2} /> Secure payment via Razorpay
              </span>
              <span>E-ticket on email right after confirmation</span>
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
                className="flex h-12 items-center gap-2 rounded-full bg-accent px-8 text-base font-extrabold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm &amp; pay ₹{displayTotal.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        )}
      </div>

      <StickySidebar>
      <aside className="flat-card overflow-hidden">
        <div className="bg-navy-deep px-5 py-4 text-white">
          <p className="script-eyebrow text-2xl !text-accent">Trip summary</p>
          <p className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold">
            {option.legs[0]?.depCode} <Plane className="h-5 w-5 text-accent" strokeWidth={2.25} /> {option.legs[option.legs.length - 1]?.arrCode}
          </p>
        </div>
        <div className="p-5">
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
          <p className="mt-1">Baggage: {option.fare.baggageCheckIn ? formatBaggage(option.fare.baggageCheckIn) : "As per airline"} check-in, {formatBaggage(option.fare.baggageCabin)} cabin</p>
        </div>

        <div className="mt-4">
          <FareSummary
            base={option.fare.base}
            taxes={option.fare.total - option.fare.base}
            extras={[
              { label: "Extra baggage & meals", amount: ssrAddOnTotal },
              { label: "Seats", amount: seatAddOnTotal },
              { label: "Web check-in", amount: webCheckinTotal },
            ]}
            discount={coupon.applied ? { code: coupon.applied.code, amount: discount } : null}
            total={displayTotal}
            travellers={searchContext.adt + searchContext.chd + searchContext.inf}
          />
        </div>
        </div>
      </aside>
      <FlightCouponBox coupon={coupon} className="hidden lg:block" />
      </StickySidebar>

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
  dobOptional,
  docMandatory,
  onChange,
}: {
  index: number;
  passenger: PassengerForm;
  international: boolean;
  dobOptional: boolean;
  docMandatory: boolean;
  onChange: (patch: Partial<PassengerForm>) => void;
}) {
  const typeLabel = passenger.pType === "A" ? "Adult" : passenger.pType === "C" ? "Child" : "Infant";
  return (
    <fieldset className="flat-card overflow-hidden">
      <legend className="sr-only">
        Passenger {index + 1} · {typeLabel}
      </legend>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-mist px-5 py-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-deep font-display text-sm font-extrabold text-white">{index + 1}</span>
        <p className="font-display text-base font-bold text-navy-deep">Passenger {index + 1}</p>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-blue">{typeLabel}</span>
      </div>
      <div className="p-5">
        <TravellerBasicFields index={index} passenger={passenger} dobOptional={dobOptional} onChange={onChange} />
        {international ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Passport no.</span>
              <input placeholder="Passport no." value={passenger.ppNo} onChange={(e) => onChange({ ppNo: e.target.value })} className={FIELD_INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Issuing country</span>
              <input placeholder="Issuing country" value={passenger.ppIss} onChange={(e) => onChange({ ppIss: e.target.value })} className={FIELD_INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Passport expiry</span>
              <input type="date" value={passenger.ppExp ? passenger.ppExp : ""} onChange={(e) => onChange({ ppExp: e.target.value })} className={FIELD_INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Nationality</span>
              <input placeholder="Nationality" value={passenger.ppNat} onChange={(e) => onChange({ ppNat: e.target.value })} className={FIELD_INPUT} />
            </label>
          </div>
        ) : null}
        {docMandatory ? (
          <label className="mt-4 flex flex-col gap-1.5 sm:max-w-xs">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">ID proof number (required for this fare)</span>
            <input required placeholder="ID proof number" value={passenger.documentId} onChange={(e) => onChange({ documentId: e.target.value })} className={FIELD_INPUT} />
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}
