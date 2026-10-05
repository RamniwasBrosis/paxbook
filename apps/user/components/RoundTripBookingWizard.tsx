"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Loader2, Plane, AlertTriangle, ShieldCheck } from "lucide-react";
import type { FlightPassengerInputDto, FlightPriceCheckDto, FlightSeatLookupResultDto, SearchFlightRequestDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";
import { FlightLoader } from "@/components/FlightLoader";
import { AirlineLogo } from "@/components/AirlineLogo";
import { FlightStepper } from "@/components/FlightStepper";
import { TravellerCountEditor, takeCarriedPassengers } from "@/components/TravellerCountEditor";
import { SeatMapPicker, type SeatMapPassenger } from "@/components/SeatMapPicker";
import { sumSsrChoice, sumSeatChoice, cleanSsrChoice, type PassengerSsrChoice } from "@/components/FlightSsr";
import { FlightTripDetails } from "@/components/FlightTripDetails";
import { FlightImportantInfo } from "@/components/FlightImportantInfo";
import { FlightAddOns } from "@/components/FlightAddOns";
import { FlightCouponBox, useFlightCoupon } from "@/components/FlightCouponBox";
import { TravellerBasicFields, FIELD_INPUT } from "@/components/TravellerBasicFields";
import { formatDateTimeLong, getClientTenantHeader, isoToDdMmYyyy , isDobOptional } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const STORAGE_KEY = "pb_round_trip_pax";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface LegSelection {
  flightId: string;
  refId: string;
  context: SearchFlightRequestDto;
}
interface RoundTripSelection {
  onward: LegSelection;
  return: LegSelection;
}

interface PassengerForm {
  title: string;
  fName: string;
  lName: string;
  pType: "A" | "C" | "I";
  gender: "M" | "F";
  dobIso: string;
  documentId: string;
}

export function RoundTripBookingWizard({ isLoggedIn: initiallyLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [selection, setSelection] = React.useState<RoundTripSelection | null>(null);
  const [loadedSelection, setLoadedSelection] = React.useState(false);

  React.useEffect(() => {
    const raw = sessionStorage.getItem("pb_round_trip_fare");
    if (raw) {
      try {
        setSelection(JSON.parse(raw));
      } catch {
        setSelection(null);
      }
    }
    setLoadedSelection(true);
  }, []);

  const [onwardPrice, setOnwardPrice] = React.useState<FlightPriceCheckDto | null>(null);
  const [returnPrice, setReturnPrice] = React.useState<FlightPriceCheckDto | null>(null);
  const [loadingPrice, setLoadingPrice] = React.useState(true);
  const [priceError, setPriceError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selection) return;
    setLoadingPrice(true);
    const fetchLeg = (leg: LegSelection) =>
      fetch(`${API_BASE_URL}/public/flights/price-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
        body: JSON.stringify({ flightID: Number(leg.flightId), refID: leg.refId }),
      }).then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Could not verify this fare.");
        return json.data as FlightPriceCheckDto;
      });

    Promise.all([fetchLeg(selection.onward), fetchLeg(selection.return)])
      .then(([onward, ret]) => {
        setOnwardPrice(onward);
        setReturnPrice(ret);
      })
      .catch((err) => setPriceError(err instanceof Error ? err.message : "Could not verify fares."))
      .finally(() => setLoadingPrice(false));
  }, [selection]);

  const [step, setStep] = React.useState<"passengers" | "seats" | "review">("passengers");
  const [passengers, setPassengers] = React.useState<PassengerForm[]>([]);
  const [ssrChoices, setSsrChoices] = React.useState<Record<number, PassengerSsrChoice>>({});
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [panNo, setPanNo] = React.useState("");
  const [wantsWebCheckin, setWantsWebCheckin] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [onwardSeatMap, setOnwardSeatMap] = React.useState<FlightSeatLookupResultDto | null>(null);
  const [returnSeatMap, setReturnSeatMap] = React.useState<FlightSeatLookupResultDto | null>(null);
  const [loadingSeats, setLoadingSeats] = React.useState(false);
  const [seatMandatoryButUnavailable, setSeatMandatoryButUnavailable] = React.useState(false);
  const [seatDirection, setSeatDirection] = React.useState<"onward" | "return">("onward");

  const [isLoggedIn, setIsLoggedIn] = React.useState(initiallyLoggedIn);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [tripId, setTripId] = React.useState<string | null>(null);
  const [payError, setPayError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selection) return;
    const saved = sessionStorage.getItem(STORAGE_KEY);
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
        // fall through
      }
    }
    const { adt, chd, inf } = selection.onward.context;
    const slots: PassengerForm[] = [
      ...Array.from({ length: adt }, () => ({ pType: "A" as const })),
      ...Array.from({ length: chd }, () => ({ pType: "C" as const })),
      ...Array.from({ length: inf }, () => ({ pType: "I" as const })),
    ].map((slot) => ({ title: "Mr", fName: "", lName: "", pType: slot.pType, gender: "M" as const, dobIso: "", documentId: "" }));
    setPassengers(takeCarriedPassengers(slots));
  }, [selection]);

  React.useEffect(() => {
    if (passengers.length === 0) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ passengers, mobile, email, panNo, ssrChoices, wantsWebCheckin }));
  }, [passengers, mobile, email, panNo, ssrChoices, wantsWebCheckin]);

  function updatePassenger(idx: number, patch: Partial<PassengerForm>) {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function updatePassengerSsr(idx: number, next: PassengerSsrChoice) {
    setSsrChoices((prev) => ({ ...prev, [idx]: next }));
  }

  function assignSeat(passengerIdx: number, direction: "onward" | "return", seatId: string | undefined) {
    setSsrChoices((prev) => {
      const next = { ...prev };
      // A seat can only ever belong to one passenger per leg — clear it from whoever else had it.
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

  const onwardValidation = onwardPrice?.option.validation;
  const returnValidation = returnPrice?.option.validation;
  const docMandatory = Boolean(onwardValidation?.docMandatory || returnValidation?.docMandatory);
  const panMandatory = Boolean(onwardValidation?.panMandatory || returnValidation?.panMandatory);
  // Baggage/meal are real, selectable options now (see SsrPicker below) and seats have their own
  // step — this only blocks when a seat map turned out to be genuinely unavailable for a fare that
  // requires one (set once the seat-map fetch settles, mirrors the one-way wizard).
  const unsupportedMandatory = seatMandatoryButUnavailable;

  function validatePassengers(): string | null {
    for (const [idx, p] of passengers.entries()) {
      if (!p.fName.trim() || !p.lName.trim()) return `Enter the full name for passenger ${idx + 1}.`;
      if (!p.dobIso && !(selection && isDobOptional(p.pType, selection.onward.context))) return `Enter date of birth for passenger ${idx + 1}.`;
      if (docMandatory && !p.documentId.trim()) return `Enter the ID proof number for passenger ${idx + 1} (required for this fare).`;
    }
    if (!/^\d{10,15}$/.test(mobile.replace(/\D/g, ""))) return "Enter a valid mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (panMandatory && !panNo.trim()) return "PAN number is required for this fare.";
    return null;
  }

  function seatMapHasAnySeats(map: FlightSeatLookupResultDto | null): boolean {
    if (!map) return false;
    const flatten = (segs: FlightSeatLookupResultDto["onward"] | undefined) => (segs ?? []).flatMap((s) => s.seatMap);
    return flatten(map.onward).length > 0;
  }

  // Seat selection needs real passenger names for both legs, so it can only run after the passenger
  // form validates — fetches both legs' seat maps in parallel, one call each (each leg is its own
  // one-way FTD lookup, so only ever populates the "onward" side of the response).
  async function goToSeatsOrReview(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePassengers();
    setFormError(err);
    if (err) return;
    if (!selection) return;

    setLoadingSeats(true);
    setSeatMandatoryButUnavailable(false);
    try {
      const fetchSeats = (leg: LegSelection) =>
        fetch(`${API_BASE_URL}/public/flights/seats`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getClientTenantHeader() },
          body: JSON.stringify({
            flightID: Number(leg.flightId),
            refID: leg.refId,
            passengers: passengers.map((p) => ({ title: p.title, fName: p.fName.trim(), lName: p.lName.trim(), pType: p.pType })),
          }),
        }).then(async (res) => {
          const json = await res.json();
          if (!json.success) throw new Error(json.error?.message ?? "Could not load seat availability.");
          return json.data as FlightSeatLookupResultDto;
        });

      const [onwardMap, returnMap] = await Promise.all([fetchSeats(selection.onward), fetchSeats(selection.return)]);
      setOnwardSeatMap(onwardMap);
      setReturnSeatMap(returnMap);

      const onwardHasSeats = seatMapHasAnySeats(onwardMap);
      const returnHasSeats = seatMapHasAnySeats(returnMap);
      const onwardBlocked = onwardValidation?.seatMandatory && !onwardHasSeats;
      const returnBlocked = returnValidation?.seatMandatory && !returnHasSeats;
      if (onwardBlocked || returnBlocked) {
        setSeatMandatoryButUnavailable(true);
        return;
      }
      if (!onwardHasSeats && !returnHasSeats) {
        setStep("review");
        return;
      }
      setSeatDirection(onwardHasSeats ? "onward" : "return");
      setStep("seats");
    } catch {
      setOnwardSeatMap(null);
      setReturnSeatMap(null);
      if (onwardValidation?.seatMandatory || returnValidation?.seatMandatory) {
        setSeatMandatoryButUnavailable(true);
      } else {
        setStep("review");
      }
    } finally {
      setLoadingSeats(false);
    }
  }

  async function handleConfirmAndPay() {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    if (!selection) return;
    setPayError(null);
    setBusy(true);
    try {
      let currentTripId = tripId;
      if (!currentTripId) {
        const passengerPayload: FlightPassengerInputDto[] = passengers.map((p, idx) => ({
          title: p.title,
          fName: p.fName.trim(),
          lName: p.lName.trim(),
          pType: p.pType,
          gender: p.gender,
          dob: p.dobIso ? isoToDdMmYyyy(p.dobIso) : "",
          ...(p.documentId ? { documentId: p.documentId } : {}),
          ...(cleanSsrChoice(ssrChoices[idx]) ? { ssr: cleanSsrChoice(ssrChoices[idx]) } : {}),
        }));
        const res = await fetch("/api/customer/flight-bookings/round-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            onward: { flightID: Number(selection.onward.flightId), refID: selection.onward.refId, searchContext: selection.onward.context },
            return: { flightID: Number(selection.return.flightId), refID: selection.return.refId, searchContext: selection.return.context },
            passengers: passengerPayload,
            mobile,
            email,
            ...(panNo ? { firstPaxPanNo: panNo } : {}),
            // Only ever sent true when both legs' own price-check confirmed web check-in is
            // available (see bothLegsSupportWebCheckin) — the checkbox itself is hidden otherwise,
            // so this can't request something the backend would reject.
            webCheckin: Boolean(wantsWebCheckin && onwardPrice?.ssr?.webCheckinEnabled && returnPrice?.ssr?.webCheckinEnabled),
            ...(couponCode ? { couponCode } : {}),
          }),
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json?.error?.message ?? "Could not create your booking.");
        currentTripId = json.data.tripId as string;
        setTripId(currentTripId);
        sessionStorage.removeItem(STORAGE_KEY);
      }

      const orderRes = await fetch(`/api/customer/flight-trips/${currentTripId}/payment/order`, { method: "POST" });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || orderJson.success === false) throw new Error(orderJson?.error?.message ?? "Could not start payment.");
      const order = orderJson.data as { orderId: string; amount: number; currency: string; keyId: string | null; mock: boolean };

      if (order.mock || !order.keyId || !window.Razorpay) {
        await verifyPayment(currentTripId, { devConfirm: true });
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: "Paxbook Flights",
        description: `${selection.onward.context.depCity} ⇄ ${selection.onward.context.arrCity} round trip`,
        prefill: { email, contact: mobile },
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          void verifyPayment(currentTripId!, {
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

  async function verifyPayment(currentTripId: string, payload: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/customer/flight-trips/${currentTripId}/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json?.error?.message ?? "Payment could not be verified.");
      router.push(`/account/flight-bookings/trip/${currentTripId}?justBooked=1`);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment could not be verified.");
      setBusy(false);
    }
  }

  // Mirrors the add-on totals computed below the early returns; needed up here because hooks can't
  // run conditionally.
  const preMergedSsr =
    onwardPrice && returnPrice
      ? { onward: onwardPrice.ssr?.onward ?? { baggage: [], meals: [] }, return: returnPrice.ssr?.onward, webCheckinEnabled: false, webCheckinAmount: 0 }
      : null;
  const preSeatMap: FlightSeatLookupResultDto | null =
    onwardSeatMap || returnSeatMap ? { onward: onwardSeatMap?.onward ?? [], return: returnSeatMap?.onward } : null;
  const grossTotal =
    onwardPrice && returnPrice
      ? onwardPrice.option.fare.total +
        returnPrice.option.fare.total +
        Object.values(ssrChoices).reduce((sum, choice) => sum + sumSsrChoice(choice, preMergedSsr), 0) +
        sumSeatChoice(ssrChoices, preSeatMap) +
        (wantsWebCheckin && onwardPrice.ssr?.webCheckinEnabled && returnPrice.ssr?.webCheckinEnabled
          ? (onwardPrice.ssr?.webCheckinAmount ?? 0) + (returnPrice.ssr?.webCheckinAmount ?? 0)
          : 0)
      : 0;
  const coupon = useFlightCoupon(grossTotal);
  const couponCode = coupon.applied?.code;
  // The draft trip freezes travellers, add-ons and the coupon; any change after it was created needs a new one.
  React.useEffect(() => {
    setTripId(null);
  }, [passengers, ssrChoices, wantsWebCheckin, couponCode, mobile, email, panNo]);

  if (!loadedSelection) {
    return (
      <div className="flat-card">
        <FlightLoader message="Loading your trip…" />
      </div>
    );
  }

  if (!selection) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-slate-500">Your flight selection was lost. Please search again.</p>
        <Link href="/flights" className="mt-3 inline-block font-semibold text-brand hover:underline">
          Start a new search
        </Link>
      </div>
    );
  }

  if (loadingPrice) {
    return (
      <div className="flat-card">
        <FlightLoader message="Locking in your fares…" />
      </div>
    );
  }

  if (priceError || !onwardPrice || !returnPrice) {
    return (
      <div className="flat-card p-8 text-center">
        <p className="text-red-600">{priceError ?? "These fares are no longer available."}</p>
        <Link href="/flights" className="mt-3 inline-block font-semibold text-brand hover:underline">
          Start a new search
        </Link>
      </div>
    );
  }

  // Each leg's own price-check is a genuine one-way lookup, so its ssr/seat data only ever populates
  // the "onward" side of the response — merge both legs into one synthetic object so the existing
  // (unmodified) SsrPicker/sumSsrChoice/sumSeatChoice from the one-way wizard render correctly
  // labeled "Departure"/"Return" sections and sum both legs' choices in one call.
  const mergedSsr = {
    onward: onwardPrice.ssr?.onward ?? { baggage: [], meals: [] },
    return: returnPrice.ssr?.onward,
    webCheckinEnabled: false,
    webCheckinAmount: 0,
  };
  const mergedSeatMap: FlightSeatLookupResultDto | null =
    onwardSeatMap || returnSeatMap ? { onward: onwardSeatMap?.onward ?? [], return: returnSeatMap?.onward } : null;
  const ssrAddOnTotal = Object.values(ssrChoices).reduce((sum, choice) => sum + sumSsrChoice(choice, mergedSsr), 0);
  const seatAddOnTotal = sumSeatChoice(ssrChoices, mergedSeatMap);
  // Only offered when BOTH legs' own fare supports it — a single shared checkbox covering the whole
  // trip, since a customer can't reasonably add web check-in to just one direction (and the backend
  // would reject a request where one leg doesn't support it, so this is never even attempted).
  const bothLegsSupportWebCheckin = Boolean(onwardPrice.ssr?.webCheckinEnabled && returnPrice.ssr?.webCheckinEnabled);
  const webCheckinTotal = wantsWebCheckin && bothLegsSupportWebCheckin ? (onwardPrice.ssr?.webCheckinAmount ?? 0) + (returnPrice.ssr?.webCheckinAmount ?? 0) : 0;
  const discount = coupon.applied?.discount ?? 0;
  const combinedTotal = Math.max(
    0,
    Math.round((onwardPrice.option.fare.total + returnPrice.option.fare.total + ssrAddOnTotal + seatAddOnTotal + webCheckinTotal - discount) * 100) / 100,
  );
  const stepperSteps = ["Passenger details", "Select seats", "Review & pay"];
  const activeStepIndex = step === "passengers" ? 0 : step === "seats" ? 1 : 2;
  const seatPassengers: SeatMapPassenger[] = passengers
    .map((p, idx) => ({ index: idx, label: p.fName.trim() || `Passenger ${idx + 1}`, pType: p.pType }))
    .filter((p): p is SeatMapPassenger => p.pType !== "I");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        {step === "passengers" ? (
          <Link href="/flights/round-trip/fare" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
            ← Back
          </Link>
        ) : null}
        <FlightStepper steps={stepperSteps} activeIndex={activeStepIndex} />

        {unsupportedMandatory ? (
          <div className="flat-card flex items-start gap-3 border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
            <div>
              <p className="font-bold text-navy-deep">One of these fares requires a seat selection we couldn&apos;t retrieve</p>
              <p className="mt-1 text-sm text-slate-600">Please go back and try different fares, or contact our travel desk to complete this booking manually.</p>
              <Link href="/flights/round-trip/fare" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                ← Choose different fares
              </Link>
            </div>
          </div>
        ) : step === "passengers" ? (
          <form onSubmit={goToSeatsOrReview} noValidate className="flex flex-col gap-5">
            <section aria-labelledby="trip-summary-title" className="flex flex-col gap-4">
              <h2 id="trip-summary-title" className="font-display text-2xl font-extrabold text-navy-deep">
                Trip summary
              </h2>
              <FlightTripDetails legs={onwardPrice.option.legs} fare={onwardPrice.option.fare} fareRulesFlightId={onwardPrice.option.id} />
              <FlightTripDetails legs={returnPrice.option.legs} fare={returnPrice.option.fare} fareRulesFlightId={returnPrice.option.id} />
            </section>

            <FlightImportantInfo />

            <section aria-labelledby="traveller-details-title" className="flex flex-col gap-4">
              <h2 id="traveller-details-title" className="font-display text-2xl font-extrabold text-navy-deep">
                Traveller details
              </h2>
              <p className="-mt-2 text-sm text-ink-muted">Enter names exactly as on the government ID the traveller will carry.</p>
              <TravellerCountEditor
                // Each leg was searched as a one-way; rebuild the original round-trip search so a count change re-runs it.
                context={{ ...selection.onward.context, tripType: 1, reDate: selection.return.context.onDate }}
                passengersToCarry={passengers}
              />
              {passengers.map((p, idx) => (
                <PassengerFieldset
                  key={idx}
                  index={idx}
                  passenger={p}
                  dobOptional={isDobOptional(p.pType, selection.onward.context)}
                  docMandatory={docMandatory}
                  onChange={(patch) => updatePassenger(idx, patch)}
                />
              ))}
            </section>

            <FlightAddOns passengers={passengers} ssr={mergedSsr} choices={ssrChoices} onChange={updatePassengerSsr} />

            <div className="flat-card p-5">
              <p className="mb-3 font-display text-lg font-bold text-navy-deep">Contact details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input required type="tel" placeholder="Mobile number" aria-label="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                <input required type="email" placeholder="Email address" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20" />
                <input
                  required={panMandatory}
                  placeholder={panMandatory ? "PAN number (required for this fare)" : "PAN number (optional)"} aria-label={panMandatory ? "PAN number (required for this fare)" : "PAN number (optional)"}
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 sm:col-span-2"
                />
              </div>
              {bothLegsSupportWebCheckin ? (
                <label className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-navy-deep has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-soft/40">
                  <input type="checkbox" checked={wantsWebCheckin} onChange={(e) => setWantsWebCheckin(e.target.checked)} />
                  Add web check-in for both flights (+₹{((onwardPrice.ssr?.webCheckinAmount ?? 0) + (returnPrice.ssr?.webCheckinAmount ?? 0)).toLocaleString("en-IN")})
                </label>
              ) : null}
            </div>

            <FlightCouponBox coupon={coupon} className="lg:hidden" />

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
              <p className="mb-4 text-xs text-slate-500">Optional for most passengers — tap a passenger, then tap a seat to assign it.</p>
              <div className="mb-4 flex gap-2">
                {(["onward", "return"] as const).map((dir) =>
                  seatMapHasAnySeats(dir === "onward" ? onwardSeatMap : returnSeatMap) ? (
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
                  ) : null,
                )}
              </div>
              {(seatDirection === "onward" ? onwardSeatMap : returnSeatMap) ? (
                <SeatMapPicker
                  segments={(seatDirection === "onward" ? onwardSeatMap : returnSeatMap)?.onward ?? []}
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
              <p className="mb-3 font-display text-lg font-bold text-navy-deep">Passengers</p>
              <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
                {passengers.map((p, idx) => {
                  const onwardSeat = ssrChoices[idx]?.onward?.seatId;
                  const returnSeat = ssrChoices[idx]?.return?.seatId;
                  return (
                    <li key={idx}>
                      {p.title} {p.fName} {p.lName} <span className="text-xs text-slate-400">({p.pType === "A" ? "Adult" : p.pType === "C" ? "Child" : "Infant"})</span>
                      {onwardSeat || returnSeat ? (
                        <span className="ml-1 text-xs text-slate-400">
                          · Seats: {[onwardSeat, returnSeat].filter(Boolean).join(" / ")}
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
              {seatMapHasAnySeats(onwardSeatMap) || seatMapHasAnySeats(returnSeatMap) ? (
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
                Confirm &amp; pay ₹{combinedTotal.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-fit flex-col gap-5">
      <aside className="flat-card overflow-hidden">
        <div className="bg-navy-deep px-5 py-4 text-white">
          <p className="script-eyebrow text-2xl !text-accent">Trip summary</p>
          <p className="mt-1 flex items-center gap-2 font-display text-xl font-extrabold">
            <Plane className="h-5 w-5 text-accent" strokeWidth={2.25} /> Round trip
          </p>
        </div>
        <div className="p-5">
        <TripLegSummary label="Departure" option={onwardPrice.option} />
        <TripLegSummary label="Return" option={returnPrice.option} />
        <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Departure fare</span>
            <span>₹{onwardPrice.option.fare.total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Return fare</span>
            <span>₹{returnPrice.option.fare.total.toLocaleString("en-IN")}</span>
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
          {webCheckinTotal > 0 ? (
            <div className="flex justify-between text-slate-500">
              <span>Web check-in</span>
              <span>₹{webCheckinTotal.toLocaleString("en-IN")}</span>
            </div>
          ) : null}
          {discount > 0 ? (
            <div className="flex justify-between font-semibold text-emerald-700">
              <span>Coupon {coupon.applied?.code}</span>
              <span>−₹{discount.toLocaleString("en-IN")}</span>
            </div>
          ) : null}
          <div className="mt-3 flex items-baseline justify-between rounded-2xl bg-cream px-4 py-3 font-bold text-navy-deep">
            <span>Total</span>
            <span className="font-display text-2xl font-extrabold">₹{combinedTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
        </div>
      </aside>
      <FlightCouponBox coupon={coupon} className="hidden lg:block" />
      </div>

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

function TripLegSummary({ label, option }: { label: string; option: FlightPriceCheckDto["option"] }) {
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  if (!firstLeg || !lastLeg) return null;
  return (
    <div className="mb-2 flex items-start gap-2 text-sm">
      <AirlineLogo code={firstLeg.airlineCode} size={24} className="mt-0.5" />
      <div>
        <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
        <p className="font-semibold text-navy-deep">
          {firstLeg.depCode} → {lastLeg.arrCode}
        </p>
        <p className="text-xs text-slate-500">{formatDateTimeLong(firstLeg.depDateTime)}</p>
        <p className="text-xs text-slate-400">
          {firstLeg.airlineName} {firstLeg.flightNo}
        </p>
      </div>
    </div>
  );
}

function PassengerFieldset({
  index,
  passenger,
  dobOptional,
  docMandatory,
  onChange,
}: {
  index: number;
  passenger: PassengerForm;
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
