"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import type { FlightBookingDto, FlightTripDto } from "@paxbook/types";
import { fetchGuest, type CheckoutKind } from "@/lib/flight-checkout";
import { FlightJourneyCard } from "@/components/FlightJourneyCard";
import { BookingConfirmedBanner } from "@/components/BookingConfirmedBanner";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Awaiting payment",
  PENDING_PAYMENT: "Awaiting payment",
  PENDING_CONFIRMATION: "Confirming with airline",
  CONFIRMED: "Confirmed",
  FAILED: "Booking failed",
  CANCELLATION_PENDING: "Cancellation in progress",
  CANCELLED: "Cancelled",
};
const TYPE_LABEL: Record<string, string> = { A: "Adult", C: "Child", I: "Infant" };

/**
 * A guest's booking (no account), opened with the secret link from checkout. Read-only: changes and
 * cancellations go through My Account after logging in with the booking's email or mobile.
 */
export function GuestBookingView({ kind, id }: { kind: CheckoutKind; id: string }) {
  const params = useSearchParams();
  const token = params.get("t");
  const [bookings, setBookings] = React.useState<FlightBookingDto[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    if (!token) {
      setError("This booking link is incomplete.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const req =
      kind === "trip"
        ? fetchGuest<FlightTripDto>("trip", id, token).then((t) => ({ list: [t.onward, t.return], total: t.totalAmount }))
        : fetchGuest<FlightBookingDto>("booking", id, token).then((b) => ({ list: [b], total: b.totalAmount }));
    req
      .then(({ list, total: sum }) => {
        setBookings(list);
        setTotal(sum);
        setError(null);
      })
      .catch(() => setError("We couldn't open this booking. Please use the link from your booking email."))
      .finally(() => setLoading(false));
  }, [kind, id, token]);

  React.useEffect(load, [load]);

  if (loading && !bookings) {
    return (
      <div className="flat-card flex items-center justify-center gap-2 p-10 text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading your booking…
      </div>
    );
  }
  if (error || !bookings) {
    return <div className="flat-card p-8 text-center text-red-600">{error}</div>;
  }

  const first = bookings[0]!;
  const allConfirmed = bookings.every((b) => b.status === "CONFIRMED");
  const anyPending = bookings.some((b) => b.status === "PENDING_CONFIRMATION");
  const pnrs = bookings.map((b) => b.pnr).filter(Boolean).join(" / ");

  return (
    <div className="flex flex-col gap-5">
      {params.get("justBooked") === "1" && allConfirmed ? <BookingConfirmedBanner pnr={pnrs || null} /> : null}

      <div className="flat-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{kind === "trip" ? "Round trip" : "Flight booking"}</p>
          <p className="mt-1 flex items-center gap-2 font-display text-2xl font-extrabold text-navy-deep">
            {allConfirmed ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : null}
            {kind === "trip"
              ? bookings.map((b) => STATUS_LABEL[b.status] ?? b.status).filter((v, i, a) => a.indexOf(v) === i).join(" · ")
              : STATUS_LABEL[first.status] ?? first.status}
          </p>
          {pnrs ? (
            <p className="mt-1 text-sm text-ink-muted">
              PNR <strong className="font-mono text-base text-navy-deep">{pnrs}</strong>
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{bookings.every((b) => b.paymentStatus === "PAID") ? "Amount paid" : "Total to pay"}</p>
          <p className="font-display text-2xl font-extrabold text-navy-deep">₹{total.toLocaleString("en-IN")}</p>
          {anyPending ? (
            <button type="button" onClick={load} className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-brand-blue hover:text-navy-deep">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh status
            </button>
          ) : null}
        </div>
      </div>

      {bookings.map((b, i) =>
        b.legs.length ? <FlightJourneyCard key={b.id} legs={b.legs} label={kind === "trip" ? (i === 0 ? "Departure" : "Return") : "Your flight"} /> : null,
      )}

      <section className="flat-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold text-navy-deep">Travellers</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm text-navy-deep">
          {first.passengers.map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2.5">
              <span className="font-semibold">
                {p.title} {p.fName} {p.lName} <span className="text-xs font-normal text-ink-muted">({TYPE_LABEL[p.pType] ?? p.pType})</span>
              </span>
              {p.ticketNo ? <span className="font-mono text-xs text-ink-muted">Ticket {p.ticketNo}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-mist px-5 py-4 text-sm text-navy-deep">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
        <p>
          Your e-ticket and updates are sent to your email. Keep this page&apos;s link to check the status again. To change or cancel, <Link href="/login" className="font-bold text-brand-blue hover:underline">log in</Link> with the
          same email (use &ldquo;Forgot password&rdquo; to set one) or your mobile number, then open My Account.
        </p>
      </div>
    </div>
  );
}
