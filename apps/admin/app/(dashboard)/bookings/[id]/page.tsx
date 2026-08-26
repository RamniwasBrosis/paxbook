"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useBooking,
  useCustomer,
  usePackages,
  useConsultants,
  useUpdateBooking,
  useUpdateBookingStatus,
  useSyncBookingTravelers,
  useUploadBookingVoucher,
  useUploadFile,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { BookingDetailDto, BookingStatus, PaymentStatus } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@paxbook/ui";

const STATUS_TONE = { DRAFT: "neutral", CONFIRMED: "info", COMPLETED: "success", CANCELLED: "danger" } as const;
const STATUS_OPTIONS: BookingStatus[] = ["DRAFT", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.BOOKINGS_READ);
  const canWrite = hasPermission(PERMISSIONS.BOOKINGS_WRITE);

  const bookingQuery = useBooking(params.id);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>bookings.read</code>.</p>
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
        <Link href="/bookings" className="text-xs text-slate-500 hover:underline">
          ← All bookings
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{booking.customerName}</h1>
          <Badge tone={STATUS_TONE[booking.status]}>{booking.status}</Badge>
        </div>
        <p className="text-sm text-slate-500">{booking.packageTitle}</p>
      </div>

      <StatusCard booking={booking} canWrite={canWrite} />
      <DetailsCard booking={booking} canWrite={canWrite} />
      <TravelersCard booking={booking} canWrite={canWrite} />
      <VoucherCard booking={booking} canWrite={canWrite} />
    </div>
  );
}

function StatusCard({ booking, canWrite }: { booking: BookingDetailDto; canWrite: boolean }) {
  const updateStatus = useUpdateBookingStatus();
  const [toStatus, setToStatus] = React.useState<BookingStatus>(booking.status);
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateStatus.mutateAsync({ id: booking.id, payload: { toStatus, note: note || undefined } });
      setNote("");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update status.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {canWrite ? (
          <form className="flex flex-wrap items-end gap-3" onSubmit={handleSubmit}>
            <Select label="New status" value={toStatus} onChange={(e) => setToStatus(e.target.value as BookingStatus)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Input label="Note (optional)" className="min-w-[240px]" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit" isLoading={updateStatus.isPending}>
              Update status
            </Button>
          </form>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500">History</span>
          {booking.statusHistory.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
              <span>
                {entry.fromStatus ? `${entry.fromStatus} → ` : ""}
                <strong>{entry.toStatus}</strong>
                {entry.note ? <span className="ml-2 text-slate-500">— {entry.note}</span> : null}
              </span>
              <span className="text-xs text-slate-400">
                {entry.changedByName ?? "System"} · {new Date(entry.changedAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailsCard({ booking, canWrite }: { booking: BookingDetailDto; canWrite: boolean }) {
  const packagesQuery = usePackages();
  const consultantsQuery = useConsultants();
  const updateBooking = useUpdateBooking();

  const [form, setForm] = React.useState({
    packageId: booking.packageId,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    paymentStatus: booking.paymentStatus,
    travelStartDate: booking.travelStartDate?.slice(0, 10) ?? "",
    travelEndDate: booking.travelEndDate?.slice(0, 10) ?? "",
    consultantId: booking.consultantId ?? "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        payload: {
          customerId: booking.customerId,
          packageId: form.packageId,
          totalAmount: Number(form.totalAmount),
          currency: form.currency,
          paymentStatus: form.paymentStatus,
          travelStartDate: form.travelStartDate || undefined,
          travelEndDate: form.travelEndDate || undefined,
          consultantId: form.consultantId,
        },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save booking.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
          <Select label="Package" disabled={!canWrite} value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}>
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
            disabled={!canWrite}
            value={form.totalAmount}
            onChange={(e) => setForm((f) => ({ ...f, totalAmount: Number(e.target.value) }))}
          />
          <Input label="Currency" disabled={!canWrite} value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          <Select
            label="Payment status"
            disabled={!canWrite}
            value={form.paymentStatus}
            onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value as PaymentStatus }))}
          >
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </Select>
          <Select label="Consultant" disabled={!canWrite} value={form.consultantId} onChange={(e) => setForm((f) => ({ ...f, consultantId: e.target.value }))}>
            <option value="">Unassigned</option>
            {consultantsQuery.data?.map((c) => (
              <option key={c.adminUserId} value={c.adminUserId}>
                {c.adminUserName}
              </option>
            ))}
          </Select>
          <Input
            label="Travel start"
            type="date"
            disabled={!canWrite}
            value={form.travelStartDate}
            onChange={(e) => setForm((f) => ({ ...f, travelStartDate: e.target.value }))}
          />
          <Input
            label="Travel end"
            type="date"
            disabled={!canWrite}
            value={form.travelEndDate}
            onChange={(e) => setForm((f) => ({ ...f, travelEndDate: e.target.value }))}
          />
          {canWrite ? (
            <div className="sm:col-span-3">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              {saved ? <p className="mb-2 text-sm text-emerald-600">Saved.</p> : null}
              <Button type="submit" isLoading={updateBooking.isPending}>
                Save details
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function TravelersCard({ booking, canWrite }: { booking: BookingDetailDto; canWrite: boolean }) {
  const customerQuery = useCustomer(booking.customerId);
  const syncTravelers = useSyncBookingTravelers();
  const [selected, setSelected] = React.useState<string[]>(booking.travelers.map((t) => t.id));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelected(booking.travelers.map((t) => t.id));
  }, [booking.travelers]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    setError(null);
    try {
      await syncTravelers.mutateAsync({ id: booking.id, payload: { travelerIds: selected } });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not update travelers.");
    }
  }

  const availableTravelers = customerQuery.data?.travelers ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travelers on this booking</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {availableTravelers.length === 0 ? (
          <p className="text-sm text-slate-400">
            This customer has no traveler profiles yet — add some from the{" "}
            <Link href={`/customers/${booking.customerId}`} className="underline">
              customer page
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {availableTravelers.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 text-sm text-slate-600">
                <input type="checkbox" disabled={!canWrite} checked={selected.includes(t.id)} onChange={() => toggle(t.id)} />
                {t.name}
              </label>
            ))}
          </div>
        )}
        {canWrite && availableTravelers.length > 0 ? (
          <div>
            {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
            <Button type="button" onClick={handleSave} isLoading={syncTravelers.isPending}>
              Save travelers
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function VoucherCard({ booking, canWrite }: { booking: BookingDetailDto; canWrite: boolean }) {
  const uploadFile = useUploadFile();
  const uploadVoucher = useUploadBookingVoucher();
  const [error, setError] = React.useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setError(null);
    try {
      const uploaded = await uploadFile.mutateAsync(file);
      await uploadVoucher.mutateAsync({ id: booking.id, payload: { storageKey: uploaded.key } });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not upload voucher.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voucher</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {booking.voucher ? (
          <a href={booking.voucher.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-700 hover:underline">
            View current voucher (generated {new Date(booking.voucher.generatedAt).toLocaleString()})
          </a>
        ) : (
          <p className="text-sm text-slate-400">No voucher uploaded yet.</p>
        )}
        {canWrite ? (
          <div>
            <input
              type="file"
              disabled={uploadFile.isPending || uploadVoucher.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
                e.target.value = "";
              }}
              className="text-xs text-slate-500"
            />
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
