"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useAdminFlightBooking, useAdminCancelFlightBooking, useAdminRefundFlightBooking } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { FlightBookingStatus } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

const STATUS_TONE: Record<FlightBookingStatus, "neutral" | "info" | "success" | "danger" | "warning"> = {
  DRAFT: "neutral",
  PENDING_PAYMENT: "warning",
  PENDING_CONFIRMATION: "info",
  CONFIRMED: "success",
  FAILED: "danger",
  CANCELLATION_PENDING: "warning",
  CANCELLED: "neutral",
};
const PAYMENT_TONE = { PENDING: "warning", PARTIAL: "info", PAID: "success", REFUNDED: "neutral" } as const;
const CANCELLABLE_STATUSES = new Set<FlightBookingStatus>(["CONFIRMED", "PENDING_CONFIRMATION"]);
const REFUNDABLE_STATUSES = new Set<FlightBookingStatus>(["CANCELLED", "CANCELLATION_PENDING"]);

const CAN_MODES = [
  { value: 5, label: "Customer cancel" },
  { value: 2, label: "Missed flight / no-show" },
  { value: 7, label: "Flight was cancelled (by airline)" },
  { value: 8, label: "Time changed" },
  { value: 6, label: "Already cancelled" },
];

export default function FlightBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const canWrite = hasPermission(PERMISSIONS.FLIGHTS_WRITE);
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
          <Field label="Customer email" value={booking.customerEmail ?? "—"} />
          <Field label="Created" value={new Date(booking.createdAt).toLocaleString("en-IN")} />
          {booking.errorMessage ? <Field label="Error" value={booking.errorMessage} className="text-red-600 sm:col-span-3" /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <Field label="Provider fare (real cost)" value={booking.providerFareAmount != null ? `${booking.currency} ${booking.providerFareAmount.toLocaleString("en-IN")}` : "—"} />
          <Field label="Customer paid" value={`${booking.currency} ${booking.totalAmount.toLocaleString("en-IN")}`} />
          <Field
            label="Your margin"
            value={booking.providerFareAmount != null ? `${booking.currency} ${(booking.totalAmount - booking.providerFareAmount).toLocaleString("en-IN")}` : "—"}
            className={booking.providerFareAmount != null && booking.totalAmount - booking.providerFareAmount < 0 ? "text-red-600" : "text-emerald-600"}
          />
        </CardContent>
      </Card>

      {(booking.cancellationReason || CANCELLABLE_STATUSES.has(booking.status) || REFUNDABLE_STATUSES.has(booking.status)) && canWrite ? (
        <CancellationCard booking={booking} />
      ) : null}

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
                <th className="px-5 py-2 font-medium">ID proof</th>
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
                  <td className="px-5 py-3">{p.documentId ?? p.ppNo ?? "—"}</td>
                  <td className="px-5 py-3">{p.pnr ?? "—"}</td>
                  <td className="px-5 py-3">{p.ticketNo ?? "—"}</td>
                </tr>
              ))}
              {booking.passengers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
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

function CancellationCard({ booking }: { booking: NonNullable<ReturnType<typeof useAdminFlightBooking>["data"]> }) {
  const cancel = useAdminCancelFlightBooking();
  const refund = useAdminRefundFlightBooking();

  const [reason, setReason] = React.useState("");
  const [canMode, setCanMode] = React.useState(5);
  const [cancelError, setCancelError] = React.useState<string | null>(null);

  const [refundAmount, setRefundAmount] = React.useState(booking.totalAmount);
  const [refundNote, setRefundNote] = React.useState("");
  const [refundError, setRefundError] = React.useState<string | null>(null);

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    setCancelError(null);
    try {
      await cancel.mutateAsync({ id: booking.id, reason, canMode });
      setReason("");
    } catch (err) {
      setCancelError(err instanceof ApiRequestError ? err.message : "Could not cancel this booking.");
    }
  }

  async function handleRefund(e: React.FormEvent) {
    e.preventDefault();
    setRefundError(null);
    try {
      await refund.mutateAsync({ id: booking.id, amount: refundAmount, note: refundNote || undefined });
      setRefundNote("");
    } catch (err) {
      setRefundError(err instanceof ApiRequestError ? err.message : "Could not process this refund.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancellation &amp; refund</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-sm">
        {booking.cancellationReason ? (
          <div className="rounded-lg bg-mist p-3">
            <Field label="Cancellation reason" value={booking.cancellationReason} />
            <Field label="Provider status" value={booking.cancellationStatus ?? "—"} className="mt-2" />
            {booking.refundedAt ? (
              <>
                <Field label="Refunded" value={`${booking.currency} ${booking.refundAmount?.toLocaleString("en-IN")} on ${new Date(booking.refundedAt).toLocaleString("en-IN")}`} className="mt-2 text-emerald-700" />
                <Field label="Refund reference" value={booking.refundReference ?? "—"} className="mt-2" />
              </>
            ) : null}
          </div>
        ) : null}

        {CANCELLABLE_STATUSES.has(booking.status) ? (
          <form onSubmit={handleCancel} className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Cancel this booking</p>
            <p className="text-xs text-slate-500">
              This calls the airline&apos;s cancellation API immediately for every passenger and cannot be undone. It does not refund the customer — do that
              separately below once cancellation is confirmed.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Reason
                <select value={canMode} onChange={(e) => setCanMode(Number(e.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {CAN_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Internal note (sent to airline)" required value={reason} onChange={(e) => setReason(e.target.value)} className="min-w-[240px] flex-1" />
              <Button type="submit" variant="danger" isLoading={cancel.isPending}>
                Cancel booking
              </Button>
            </div>
            {cancelError ? <p className="text-sm text-red-600">{cancelError}</p> : null}
          </form>
        ) : null}

        {REFUNDABLE_STATUSES.has(booking.status) && booking.paymentStatus === "PAID" ? (
          <form onSubmit={handleRefund} className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Process refund to customer</p>
            <p className="text-xs text-slate-500">
              The airline&apos;s cancellation API doesn&apos;t report a refund amount — check the fare rules / cancellation policy for this flight, decide the
              amount, and issue it here via Razorpay.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <Input
                label={`Refund amount (${booking.currency})`}
                type="number"
                step="0.01"
                min={1}
                max={booking.totalAmount}
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="max-w-[180px]"
              />
              <Input label="Note (optional)" value={refundNote} onChange={(e) => setRefundNote(e.target.value)} className="min-w-[240px] flex-1" />
              <Button type="submit" isLoading={refund.isPending}>
                Issue refund
              </Button>
            </div>
            {refundError ? <p className="text-sm text-red-600">{refundError}</p> : null}
          </form>
        ) : null}
      </CardContent>
    </Card>
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
