"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useBookings,
  useCreateBooking,
  useCustomers,
  usePackages,
  useConsultants,
  useCancellationRequests,
  useResolveCancellationRequest,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { BookingSummaryDto, CancellationRequestDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input, Select } from "@paxbook/ui";

const STATUS_TONE = { DRAFT: "neutral", CONFIRMED: "info", COMPLETED: "success", CANCELLED: "danger" } as const;
const PAYMENT_TONE = { PENDING: "warning", PARTIAL: "info", PAID: "success", REFUNDED: "neutral" } as const;

export default function BookingsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.BOOKINGS_READ);
  const canWrite = hasPermission(PERMISSIONS.BOOKINGS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>bookings.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500">Booking status, payment status, travelers, and vouchers.</p>
      </div>
      <CancellationRequestsSection canWrite={canWrite} />
      <BookingsContent canWrite={canWrite} />
    </div>
  );
}

function CancellationRequestsSection({ canWrite }: { canWrite: boolean }) {
  const requestsQuery = useCancellationRequests();
  const resolveRequest = useResolveCancellationRequest();
  const pending = (requestsQuery.data ?? []).filter((r) => r.status === "REQUESTED");

  if (requestsQuery.isLoading || pending.length === 0) return null;

  async function handleResolve(id: string, status: "APPROVED" | "REJECTED") {
    await resolveRequest.mutateAsync({ id, payload: { status } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending cancellation requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {pending.map((r: CancellationRequestDto) => (
            <li key={r.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  <Link href={`/bookings/${r.bookingId}`} className="hover:underline">
                    {r.customerName}
                  </Link>{" "}
                  requested cancellation
                </p>
                {r.reason ? <p className="text-sm text-slate-500">Reason: {r.reason}</p> : null}
                <p className="text-xs text-slate-400">Requested {new Date(r.requestedAt).toLocaleString("en-IN")}</p>
              </div>
              {canWrite ? (
                <div className="flex gap-2">
                  <Button variant="secondary" isLoading={resolveRequest.isPending} onClick={() => handleResolve(r.id, "REJECTED")}>
                    Reject
                  </Button>
                  <Button isLoading={resolveRequest.isPending} onClick={() => handleResolve(r.id, "APPROVED")}>
                    Approve &amp; cancel booking
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BookingsContent({ canWrite }: { canWrite: boolean }) {
  const bookingsQuery = useBookings();
  const customersQuery = useCustomers();
  const packagesQuery = usePackages();
  const consultantsQuery = useConsultants();
  const createBooking = useCreateBooking();

  const [form, setForm] = React.useState({
    customerId: "",
    packageId: "",
    totalAmount: 0,
    currency: "INR",
    travelStartDate: "",
    travelEndDate: "",
    consultantId: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createBooking.mutateAsync({
        customerId: form.customerId,
        packageId: form.packageId,
        totalAmount: Number(form.totalAmount),
        currency: form.currency,
        travelStartDate: form.travelStartDate || undefined,
        travelEndDate: form.travelEndDate || undefined,
        consultantId: form.consultantId || undefined,
      });
      setForm({ customerId: "", packageId: "", totalAmount: 0, currency: "INR", travelStartDate: "", travelEndDate: "", consultantId: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create booking.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          {
            header: "Customer",
            cell: (b: BookingSummaryDto) => (
              <Link href={`/bookings/${b.id}`} className="text-slate-900 hover:underline">
                {b.customerName}
              </Link>
            ),
          },
          { header: "Package", cell: (b: BookingSummaryDto) => b.packageTitle },
          { header: "Consultant", cell: (b: BookingSummaryDto) => b.consultantName ?? "—" },
          { header: "Amount", cell: (b: BookingSummaryDto) => `${b.currency} ${b.totalAmount.toLocaleString("en-IN")}` },
          { header: "Status", cell: (b: BookingSummaryDto) => <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge> },
          { header: "Payment", cell: (b: BookingSummaryDto) => <Badge tone={PAYMENT_TONE[b.paymentStatus]}>{b.paymentStatus}</Badge> },
        ]}
        rows={bookingsQuery.data ?? []}
        rowKey={(b) => b.id}
        isLoading={bookingsQuery.isLoading}
        emptyMessage="No bookings yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Create booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
              <Select label="Customer" required value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}>
                <option value="" disabled>
                  Select a customer…
                </option>
                {customersQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </Select>
              <Select label="Package" required value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}>
                <option value="" disabled>
                  Select a package…
                </option>
                {packagesQuery.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
              <Input
                label="Total amount"
                type="number"
                min={0}
                required
                value={form.totalAmount}
                onChange={(e) => setForm((f) => ({ ...f, totalAmount: Number(e.target.value) }))}
              />
              <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
              <Input label="Travel start" type="date" value={form.travelStartDate} onChange={(e) => setForm((f) => ({ ...f, travelStartDate: e.target.value }))} />
              <Input label="Travel end" type="date" value={form.travelEndDate} onChange={(e) => setForm((f) => ({ ...f, travelEndDate: e.target.value }))} />
              <Select label="Consultant (optional)" value={form.consultantId} onChange={(e) => setForm((f) => ({ ...f, consultantId: e.target.value }))}>
                <option value="">Unassigned</option>
                {consultantsQuery.data?.map((c) => (
                  <option key={c.adminUserId} value={c.adminUserId}>
                    {c.adminUserName}
                  </option>
                ))}
              </Select>
              <div className="sm:col-span-3">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createBooking.isPending}>
                  Create booking
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
