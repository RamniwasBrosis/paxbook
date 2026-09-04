"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useAdminFlightBooking } from "@paxbook/api-client";
import type { FlightBookingStatus } from "@paxbook/types";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@paxbook/ui";

const STATUS_TONE: Record<FlightBookingStatus, "neutral" | "info" | "success" | "danger" | "warning"> = {
  DRAFT: "neutral",
  PENDING_PAYMENT: "warning",
  PENDING_CONFIRMATION: "info",
  CONFIRMED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};
const PAYMENT_TONE = { PENDING: "warning", PARTIAL: "info", PAID: "success", REFUNDED: "neutral" } as const;

export default function FlightBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const bookingQuery = useAdminFlightBooking(params.id);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your role doesn&apos;t include <code>flights.read</code>.
        </p>
      </Card>
    );
  }

  if (bookingQuery.isLoading || !bookingQuery.data) {
    return <p className="text-sm text-slate-500">Loading booking…</p>;
  }

  const booking = bookingQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/flights" className="text-xs text-slate-500 hover:underline">
          ← All flight bookings
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{booking.customerName ?? "Flight booking"}</h1>
          <Badge tone={STATUS_TONE[booking.status]}>{booking.status.replace(/_/g, " ")}</Badge>
          <Badge tone={PAYMENT_TONE[booking.paymentStatus]}>{booking.paymentStatus}</Badge>
        </div>
        <p className="text-sm text-slate-500">
          {booking.depCity} → {booking.arrCity} · {booking.onDate}
          {booking.reDate ? ` – ${booking.reDate} (round trip)` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <Field label="Client ID" value={booking.clientId} />
          <Field label="Provider ref ID" value={booking.refId ?? "—"} />
          <Field label="PNR" value={booking.pnr ?? "—"} />
          <Field label="Provider status" value={booking.providerStatus ?? "—"} />
          <Field label="Cabin" value={booking.cabin} />
          <Field label="Passengers" value={`${booking.adt} adult(s), ${booking.chd} child(ren), ${booking.inf} infant(s)`} />
          <Field label="Amount" value={`${booking.currency} ${booking.totalAmount.toLocaleString("en-IN")}`} />
          <Field label="Customer email" value={booking.customerEmail ?? "—"} />
          <Field label="Created" value={new Date(booking.createdAt).toLocaleString("en-IN")} />
          {booking.errorMessage ? <Field label="Error" value={booking.errorMessage} className="text-red-600 sm:col-span-3" /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passengers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-2 font-medium">Name</th>
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium">Gender</th>
                <th className="px-5 py-2 font-medium">DOB</th>
                <th className="px-5 py-2 font-medium">PNR</th>
                <th className="px-5 py-2 font-medium">Ticket no.</th>
              </tr>
            </thead>
            <tbody>
              {booking.passengers.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    {p.title} {p.fName} {p.lName}
                  </td>
                  <td className="px-5 py-3">{p.pType}</td>
                  <td className="px-5 py-3">{p.gender}</td>
                  <td className="px-5 py-3">{p.dob}</td>
                  <td className="px-5 py-3">{p.pnr ?? "—"}</td>
                  <td className="px-5 py-3">{p.ticketNo ?? "—"}</td>
                </tr>
              ))}
              {booking.passengers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    No passengers on this booking.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="text-slate-900">{value}</p>
    </div>
  );
}
