import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Plane, Ticket, XCircle } from "lucide-react";
import type { FlightBookingDto } from "@paxbook/types";
import { customerFetch, CustomerApiError } from "@/lib/customer-api";
import { FlightBookingPaymentPanel } from "@/components/FlightBookingPaymentPanel";
import { RefreshFlightStatusButton } from "@/components/RefreshFlightStatusButton";

export const metadata: Metadata = { title: "Flight Booking Details" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Awaiting payment",
  PENDING_PAYMENT: "Awaiting payment",
  PENDING_CONFIRMATION: "Confirming with airline",
  CONFIRMED: "Confirmed",
  FAILED: "Booking failed",
  CANCELLED: "Cancelled",
};

const TYPE_LABEL: Record<string, string> = { A: "Adult", C: "Child", I: "Infant" };

export default async function FlightBookingDetailPage({ params }: { params: { id: string } }) {
  let booking: FlightBookingDto;
  try {
    booking = await customerFetch<FlightBookingDto>(`/customer/flight-bookings/${params.id}`);
  } catch (err) {
    if (err instanceof CustomerApiError && err.status === 404) notFound();
    throw err;
  }

  const needsPayment = booking.status === "DRAFT" || booking.status === "PENDING_PAYMENT";

  return (
    <div>
      <Link href="/account/flight-bookings" className="text-sm font-medium text-slate-500 hover:text-brand">
        ← Back to my flight bookings
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Plane className="h-6 w-6 text-brand" strokeWidth={1.75} />
            {booking.depCity} → {booking.arrCity}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {booking.status === "CONFIRMED" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
            {booking.status === "FAILED" || booking.status === "CANCELLED" ? <XCircle className="h-4 w-4 text-red-500" /> : null}
            {STATUS_LABEL[booking.status] ?? booking.status} · Payment: {booking.paymentStatus}
            {booking.status === "PENDING_CONFIRMATION" ? <RefreshFlightStatusButton bookingId={booking.id} /> : null}
          </p>
        </div>
        {booking.pnr ? (
          <div className="flat-card flex items-center gap-2 px-4 py-2.5">
            <Ticket className="h-4 w-4 text-brand" strokeWidth={1.75} />
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">PNR</p>
              <p className="font-bold text-navy-deep">{booking.pnr}</p>
            </div>
          </div>
        ) : null}
      </div>

      {booking.errorMessage ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{booking.errorMessage}</p> : null}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900">Trip details</h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-400">Travel date</dt>
                <dd className="text-slate-900">{booking.onDate}</dd>
              </div>
              {booking.reDate ? (
                <div>
                  <dt className="text-slate-400">Return date</dt>
                  <dd className="text-slate-900">{booking.reDate}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-slate-400">Cabin</dt>
                <dd className="text-slate-900">{booking.cabin}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Passengers</dt>
                <dd className="text-slate-900">
                  {booking.adt} adult{booking.adt > 1 ? "s" : ""}
                  {booking.chd ? `, ${booking.chd} child${booking.chd > 1 ? "ren" : ""}` : ""}
                  {booking.inf ? `, ${booking.inf} infant${booking.inf > 1 ? "s" : ""}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Total amount</dt>
                <dd className="text-slate-900">
                  {booking.currency} {booking.totalAmount.toLocaleString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Booked on</dt>
                <dd className="text-slate-900">{new Date(booking.createdAt).toLocaleString("en-IN")}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900">Passengers</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">PNR</th>
                    <th className="py-2 font-medium">Ticket no.</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengers.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-4 text-slate-900">
                        {p.title} {p.fName} {p.lName}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-500">{TYPE_LABEL[p.pType] ?? p.pType}</td>
                      <td className="py-2.5 pr-4 text-slate-500">{p.pnr ?? "—"}</td>
                      <td className="py-2.5 text-slate-500">{p.ticketNo ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside>{needsPayment ? <FlightBookingPaymentPanel bookingId={booking.id} amount={booking.totalAmount} currency={booking.currency} /> : null}</aside>
      </div>
    </div>
  );
}
