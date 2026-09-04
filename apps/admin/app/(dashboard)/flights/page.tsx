"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useAdminFlightBookings } from "@paxbook/api-client";
import type { FlightBookingDto, FlightBookingStatus } from "@paxbook/types";
import { Badge, Card, CardContent, DataTable, Select } from "@paxbook/ui";

const STATUS_TONE: Record<FlightBookingStatus, "neutral" | "info" | "success" | "danger" | "warning"> = {
  DRAFT: "neutral",
  PENDING_PAYMENT: "warning",
  PENDING_CONFIRMATION: "info",
  CONFIRMED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};
const PAYMENT_TONE = { PENDING: "warning", PARTIAL: "info", PAID: "success", REFUNDED: "neutral" } as const;
const STATUS_OPTIONS: FlightBookingStatus[] = ["DRAFT", "PENDING_PAYMENT", "PENDING_CONFIRMATION", "CONFIRMED", "FAILED", "CANCELLED"];

export default function FlightsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const [status, setStatus] = React.useState("");
  const bookingsQuery = useAdminFlightBookings(status || undefined);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Flight bookings</h1>
          <p className="text-sm text-slate-500">Bookings, passengers, fares, and provider status for the flight module.</p>
        </div>
        <Link href="/flights/api-tool" className="text-sm font-medium text-brand hover:underline">
          Flight API test tool →
        </Link>
      </div>

      <Card>
        <CardContent className="flex items-end gap-3 py-4">
          <Select label="Status" className="max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          {
            header: "Customer",
            cell: (b: FlightBookingDto) => (
              <Link href={`/flights/${b.id}`} className="text-slate-900 hover:underline">
                {b.customerName ?? "—"}
              </Link>
            ),
          },
          { header: "Route", cell: (b: FlightBookingDto) => `${b.depCity} → ${b.arrCity}${b.reDate ? " (round trip)" : ""}` },
          { header: "Travel date", cell: (b: FlightBookingDto) => b.onDate },
          { header: "PNR", cell: (b: FlightBookingDto) => b.pnr ?? "—" },
          { header: "Amount", cell: (b: FlightBookingDto) => `${b.currency} ${b.totalAmount.toLocaleString("en-IN")}` },
          { header: "Status", cell: (b: FlightBookingDto) => <Badge tone={STATUS_TONE[b.status]}>{b.status.replace(/_/g, " ")}</Badge> },
          { header: "Payment", cell: (b: FlightBookingDto) => <Badge tone={PAYMENT_TONE[b.paymentStatus]}>{b.paymentStatus}</Badge> },
        ]}
        rows={bookingsQuery.data ?? []}
        rowKey={(b) => b.id}
        isLoading={bookingsQuery.isLoading}
        emptyMessage="No flight bookings yet."
      />
    </div>
  );
}
