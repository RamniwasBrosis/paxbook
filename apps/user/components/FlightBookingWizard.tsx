"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plane, ShieldCheck, ShieldOff, AlertTriangle } from "lucide-react";
import type { CreateFlightBookingRequestDto, FlightPassengerInputDto, FlightPriceCheckDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";
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

export function FlightBookingWizard({ isLoggedIn: initiallyLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const flightId = params.get("flightId");
  const refId = params.get("refId");
  const searchContext = React.useMemo(() => searchContextFromParams(params), [params]);

  const [priceCheck, setPriceCheck] = React.useState<FlightPriceCheckDto | null>(null);
  const [loadingPrice, setLoadingPrice] = React.useState(true);
  const [priceError, setPriceError] = React.useState<string | null>(null);

  const [step, setStep] = React.useState<"passengers" | "review">("passengers");
  const [passengers, setPassengers] = React.useState<PassengerForm[]>([]);
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [panNo, setPanNo] = React.useState("");
  const [wantsGst, setWantsGst] = React.useState(false);
  const [gst, setGst] = React.useState({ number: "", email: "", mobile: "", address: "", company: "" });
  const [formError, setFormError] = React.useState<string | null>(null);

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
  }, [searchContext, flightId, refId]);

  // Persist in-progress entries so a login-modal round trip (or accidental refresh) doesn't lose typed data.
  React.useEffect(() => {
    if (!flightId || !refId || passengers.length === 0) return;
    window.sessionStorage.setItem(storageKey(flightId, refId), JSON.stringify({ passengers, mobile, email, panNo }));
  }, [passengers, mobile, email, panNo, flightId, refId]);

  function updatePassenger(idx: number, patch: Partial<PassengerForm>) {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  const validation = priceCheck?.option.validation;
  // Baggage/meal/seat selection isn't wired into the booking flow yet (the backend's create-booking
  // payload has no slot for it) — if the fare requires one of these to be chosen, we can't safely
  // fulfil the booking, so block here rather than risk a payment succeeding and the provider booking
  // failing (or silently ignoring a mandatory requirement) afterwards.
  const unsupportedMandatory = Boolean(validation?.seatMandatory || validation?.mealMandatory || validation?.baggageMandatory);

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

  function goToReview(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePassengers();
    setFormError(err);
    if (err) return;
    setStep("review");
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
            (p): FlightPassengerInputDto => ({
              title: p.title,
              fName: p.fName.trim(),
              lName: p.lName.trim(),
              pType: p.pType,
              gender: p.gender,
              dob: isoToDdMmYyyy(p.dobIso),
              ...(p.ppNo ? { ppNo: p.ppNo, ppIss: p.ppIss, ppExp: p.ppExp, ppNat: p.ppNat } : {}),
              ...(p.documentId ? { documentId: p.documentId } : {}),
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
      router.push(`/account/flight-bookings/${id}`);
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
      <div className="flat-card flex items-center justify-center gap-2 p-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Locking in your fare…
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
          <span className={step === "passengers" ? "text-brand" : ""}>1. Passenger details</span>
          <span>›</span>
          <span className={step === "review" ? "text-brand" : ""}>2. Review &amp; pay</span>
        </div>

        {unsupportedMandatory ? (
          <div className="flat-card flex items-start gap-3 border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
            <div>
              <p className="font-bold text-navy-deep">This fare needs a seat, meal, or baggage selection we don&apos;t support online yet</p>
              <p className="mt-1 text-sm text-slate-600">Please go back and choose a different fare, or contact our travel desk to complete this booking manually.</p>
              <Link href={`/flights/fare?flightId=${flightId}&refId=${encodeURIComponent(refId)}&${new URLSearchParams(Array.from(params.entries()).filter(([k]) => k !== "flightId")).toString()}`} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                ← Choose a different fare
              </Link>
            </div>
          </div>
        ) : step === "passengers" ? (
          <form onSubmit={goToReview} className="flex flex-col gap-4">
            {passengers.map((p, idx) => (
              <PassengerFieldset
                key={idx}
                index={idx}
                passenger={p}
                international={searchContext.serType === 2}
                docMandatory={Boolean(validation?.docMandatory)}
                onChange={(patch) => updatePassenger(idx, patch)}
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

            <button type="submit" className="self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark">
              Continue to review
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flat-card p-5">
              <p className="mb-3 text-sm font-bold text-navy-deep">Passengers</p>
              <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
                {passengers.map((p, idx) => (
                  <li key={idx}>
                    {p.title} {p.fName} {p.lName} <span className="text-xs text-slate-400">({p.pType === "A" ? "Adult" : p.pType === "C" ? "Child" : "Infant"})</span>
                  </li>
                ))}
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
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={busy}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm &amp; pay ₹{option.fare.total.toLocaleString("en-IN")}
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
          <div key={idx} className="mb-2 text-sm">
            <p className="font-semibold text-navy-deep">
              {leg.depCode} → {leg.arrCode}
            </p>
            <p className="text-xs text-slate-500">{formatDateTimeLong(leg.depDateTime)}</p>
            <p className="text-xs text-slate-400">
              {leg.airlineName} {leg.flightNo} · {formatMinutes(leg.durationMinutes)}
            </p>
          </div>
        ))}

        <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <p className="flex items-center gap-1.5">
            {option.fare.refundable ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> : <ShieldOff className="h-3.5 w-3.5 text-slate-400" />}
            {option.fare.refundable ? "Refundable fare" : "Non-refundable fare"}
          </p>
          <p className="mt-1">Baggage: {option.fare.baggageCheckIn || "As per airline"} check-in, {option.fare.baggageCabin || "—"} cabin</p>
        </div>

        {ssr && (ssr.onward.baggage.length > 0 || ssr.onward.meals.length > 0) ? (
          <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <p className="mb-1 font-semibold uppercase text-slate-400">Extras available on this flight</p>
            {ssr.onward.baggage.slice(0, 2).map((b) => (
              <p key={b.id}>
                {b.description}: ₹{b.amount.toLocaleString("en-IN")}
              </p>
            ))}
            {ssr.onward.meals.slice(0, 2).map((m) => (
              <p key={m.id}>
                {m.description}: ₹{m.amount.toLocaleString("en-IN")}
              </p>
            ))}
            <p className="mt-1 italic">To add extra baggage or meals, contact our travel desk after booking.</p>
          </div>
        ) : null}

        <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Base fare</span>
            <span>₹{option.fare.base.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Taxes &amp; fees</span>
            <span>₹{option.fare.tax.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 font-bold text-navy-deep">
            <span>Total</span>
            <span>₹{option.fare.total.toLocaleString("en-IN")}</span>
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
}: {
  index: number;
  passenger: PassengerForm;
  international: boolean;
  docMandatory: boolean;
  onChange: (patch: Partial<PassengerForm>) => void;
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
    </div>
  );
}
