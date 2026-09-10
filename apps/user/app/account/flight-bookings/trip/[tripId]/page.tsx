import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Plane, Ticket, XCircle } from "lucide-react";
import type { FlightBookingDto, FlightLegDto, FlightTripDto } from "@paxbook/types";
import { customerFetch, CustomerApiError } from "@/lib/customer-api";
import { formatDateTimeLong, formatMinutes } from "@/lib/flights";

export const metadata: Metadata = { title: "Round Trip Booking" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Awaiting payment",
  PENDING_PAYMENT: "Awaiting payment",
  PENDING_CONFIRMATION: "Confirming with airline",
  CONFIRMED: "Confirmed",
  FAILED: "Booking failed",
  CANCELLATION_PENDING: "Cancellation in progress",
  CANCELLED: "Cancelled",
};

export default async function FlightTripDetailPage({ params }: { params: { tripId: string } }) {
  let trip: FlightTripDto;
  try {
    trip = await customerFetch<FlightTripDto>(`/customer/flight-trips/${params.tripId}`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div>
      <Link href="/account/flight-bookings" className="text-sm font-medium text-slate-500 hover:text-brand">
        ← Back to my flight bookings
      </Link>

      <div className="mt-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Plane className="h-6 w-6 text-brand" strokeWidth={1.75} />
          {trip.onward.depCity} ⇄ {trip.onward.arrCity}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Round trip · {trip.currency} {trip.totalAmount.toLocaleString("en-IN")} total</p>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <LegSection title="Departure" booking={trip.onward} />
        <LegSection title="Return" booking={trip.return} />
      </div>
    </div>
  );
}

function LegSection({ title, booking }: { title: string; booking: FlightBookingDto }) {
  const canCancel = booking.status === "CONFIRMED" || booking.status === "PENDING_CONFIRMATION";
  return (
    <section className="rounded-2xl border border-slate-100 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">{title}</p>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            {booking.depCity} → {booking.arrCity}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {booking.status === "CONFIRMED" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
            {booking.status === "FAILED" || booking.status === "CANCELLED" ? <XCircle className="h-4 w-4 text-red-500" /> : null}
            {STATUS_LABEL[booking.status] ?? booking.status} · Payment: {booking.paymentStatus}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {booking.pnr ? (
            <div className="flat-card flex items-center gap-2 px-4 py-2.5">
              <Ticket className="h-4 w-4 text-brand" strokeWidth={1.75} />
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">PNR</p>
                <p className="font-bold text-navy-deep">{booking.pnr}</p>
              </div>
            </div>
          ) : null}
          <Link href={`/account/flight-bookings/${booking.id}`} className="text-sm font-semibold text-brand hover:underline">
            View / {canCancel ? "cancel" : "manage"} this leg →
          </Link>
        </div>
      </div>

      {booking.errorMessage ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{booking.errorMessage}</p> : null}

      {booking.legs.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {booking.legs.map((leg, idx) => (
            <FlightLegRow key={idx} leg={leg} />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="text-slate-500">Fare for this leg</span>
        <span className="font-bold text-navy-deep">
          {booking.currency} {booking.totalAmount.toLocaleString("en-IN")}
        </span>
      </div>
    </section>
  );
}

function FlightLegRow({ leg }: { leg: FlightLegDto }) {
  return (
    <div className="rounded-xl bg-mist p-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-navy-deep">
          {leg.airlineName} {leg.airlineCode}-{leg.flightNo}
        </p>
        <p className="text-slate-500">{formatMinutes(leg.durationMinutes)}</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <p className="font-bold text-navy-deep">{leg.depCode}</p>
          <p className="text-slate-500">{leg.depAirportName}</p>
          {leg.depTerminal ? <p className="text-xs text-slate-400">Terminal {leg.depTerminal}</p> : null}
          <p className="mt-1 text-slate-700">{formatDateTimeLong(leg.depDateTime)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-navy-deep">{leg.arrCode}</p>
          <p className="text-slate-500">{leg.arrAirportName}</p>
          {leg.arrTerminal ? <p className="text-xs text-slate-400">Terminal {leg.arrTerminal}</p> : null}
          <p className="mt-1 text-slate-700">{formatDateTimeLong(leg.arrDateTime)}</p>
        </div>
      </div>
    </div>
  );
}
