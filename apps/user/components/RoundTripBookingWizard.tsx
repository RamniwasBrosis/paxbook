"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Loader2, Plane, AlertTriangle } from "lucide-react";
import type { FlightPassengerInputDto, FlightPriceCheckDto, SearchFlightRequestDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";
import { FlightLoader } from "@/components/FlightLoader";
import { formatDateTimeLong, getClientTenantHeader, isoToDdMmYyyy } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Mstr"];
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

  const [step, setStep] = React.useState<"passengers" | "review">("passengers");
  const [passengers, setPassengers] = React.useState<PassengerForm[]>([]);
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [panNo, setPanNo] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

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
    setPassengers(slots);
  }, [selection]);

  React.useEffect(() => {
    if (passengers.length === 0) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ passengers, mobile, email, panNo }));
  }, [passengers, mobile, email, panNo]);

  function updatePassenger(idx: number, patch: Partial<PassengerForm>) {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  const onwardValidation = onwardPrice?.option.validation;
  const returnValidation = returnPrice?.option.validation;
  const docMandatory = Boolean(onwardValidation?.docMandatory || returnValidation?.docMandatory);
  const panMandatory = Boolean(onwardValidation?.panMandatory || returnValidation?.panMandatory);
  const unsupportedMandatory = Boolean(
    onwardValidation?.seatMandatory || onwardValidation?.mealMandatory || onwardValidation?.baggageMandatory ||
    returnValidation?.seatMandatory || returnValidation?.mealMandatory || returnValidation?.baggageMandatory,
  );

  function validatePassengers(): string | null {
    for (const [idx, p] of passengers.entries()) {
      if (!p.fName.trim() || !p.lName.trim()) return `Enter the full name for passenger ${idx + 1}.`;
      if (!p.dobIso) return `Enter date of birth for passenger ${idx + 1}.`;
      if (docMandatory && !p.documentId.trim()) return `Enter the ID proof number for passenger ${idx + 1} (required for this fare).`;
    }
    if (!/^\d{10,15}$/.test(mobile.replace(/\D/g, ""))) return "Enter a valid mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (panMandatory && !panNo.trim()) return "PAN number is required for this fare.";
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
    if (!selection) return;
    setPayError(null);
    setBusy(true);
    try {
      let currentTripId = tripId;
      if (!currentTripId) {
        const passengerPayload: FlightPassengerInputDto[] = passengers.map((p) => ({
          title: p.title,
          fName: p.fName.trim(),
          lName: p.lName.trim(),
          pType: p.pType,
          gender: p.gender,
          dob: isoToDdMmYyyy(p.dobIso),
          ...(p.documentId ? { documentId: p.documentId } : {}),
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
      router.push(`/account/flight-bookings/trip/${currentTripId}`);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment could not be verified.");
      setBusy(false);
    }
  }

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

  const combinedTotal = onwardPrice.option.fare.total + returnPrice.option.fare.total;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        {step === "passengers" ? (
          <Link href="/flights/round-trip/fare" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand">
            ← Change fares
          </Link>
        ) : null}
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
          <span className={step === "passengers" ? "text-brand" : ""}>1. Passenger details</span>
          <span>›</span>
          <span className={step === "review" ? "text-brand" : ""}>2. Review &amp; pay</span>
        </div>

        {unsupportedMandatory ? (
          <div className="flat-card flex items-start gap-3 border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
            <div>
              <p className="font-bold text-navy-deep">One of these fares needs a seat, meal, or baggage selection we don&apos;t support online yet</p>
              <p className="mt-1 text-sm text-slate-600">Please go back and choose different fares, or contact our travel desk to complete this booking manually.</p>
              <Link href="/flights/round-trip/fare" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                ← Choose different fares
              </Link>
            </div>
          </div>
        ) : step === "passengers" ? (
          <form onSubmit={goToReview} className="flex flex-col gap-4">
            {passengers.map((p, idx) => (
              <PassengerFieldset key={idx} index={idx} passenger={p} docMandatory={docMandatory} onChange={(patch) => updatePassenger(idx, patch)} />
            ))}

            <div className="flat-card p-5">
              <p className="mb-3 text-sm font-bold text-navy-deep">Contact details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input required type="tel" placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <input required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <input
                  required={panMandatory}
                  placeholder={panMandatory ? "PAN number (required for this fare)" : "PAN number (optional)"}
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-2"
                />
              </div>
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
                Confirm &amp; pay ₹{combinedTotal.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="flat-card h-fit p-5 lg:sticky lg:top-24">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
          <Plane className="h-3.5 w-3.5" /> Trip summary
        </p>
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
          <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 font-bold text-navy-deep">
            <span>Total</span>
            <span>₹{combinedTotal.toLocaleString("en-IN")}</span>
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

function TripLegSummary({ label, option }: { label: string; option: FlightPriceCheckDto["option"] }) {
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  if (!firstLeg || !lastLeg) return null;
  return (
    <div className="mb-2 text-sm">
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="font-semibold text-navy-deep">
        {firstLeg.depCode} → {lastLeg.arrCode}
      </p>
      <p className="text-xs text-slate-500">{formatDateTimeLong(firstLeg.depDateTime)}</p>
      <p className="text-xs text-slate-400">
        {firstLeg.airlineName} {firstLeg.flightNo}
      </p>
    </div>
  );
}

function PassengerFieldset({
  index,
  passenger,
  docMandatory,
  onChange,
}: {
  index: number;
  passenger: PassengerForm;
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
