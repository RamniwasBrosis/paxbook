"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useBookings,
  usePayments,
  useCreatePayment,
  useUpdatePaymentStatus,
  useInvoices,
  useCreateInvoice,
  useUploadFile,
  useEmiPlan,
  useSaveEmiPlan,
  useRefunds,
  useCreateRefund,
  useUpdateRefundStatus,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { BookingSummaryDto, EmiInstallmentDto, InvoiceDto, PaymentDto, RefundDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input, Select } from "@paxbook/ui";

const TABS = ["Payments", "Invoices", "EMI Plans", "Refunds"] as const;
type Tab = (typeof TABS)[number];

function bookingLabel(b: BookingSummaryDto) {
  return `${b.customerName} — ${b.packageTitle} — ${b.currency} ${b.totalAmount.toLocaleString("en-IN")}`;
}

export default function FinancePage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FINANCE_READ);
  const canWrite = hasPermission(PERMISSIONS.FINANCE_WRITE);
  const [tab, setTab] = React.useState<Tab>("Payments");
  const bookingsQuery = useBookings();

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>finance.read</code>.</p>
      </Card>
    );
  }

  const bookings = bookingsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-500">Payments, invoices, EMI plans, and refunds.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={"px-3 py-2 text-sm font-medium " + (tab === t ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Payments" ? <PaymentsTab canWrite={canWrite} bookings={bookings} /> : null}
      {tab === "Invoices" ? <InvoicesTab canWrite={canWrite} bookings={bookings} /> : null}
      {tab === "EMI Plans" ? <EmiPlansTab canWrite={canWrite} bookings={bookings} /> : null}
      {tab === "Refunds" ? <RefundsTab canWrite={canWrite} bookings={bookings} /> : null}
    </div>
  );
}

function PaymentsTab({ canWrite, bookings }: { canWrite: boolean; bookings: BookingSummaryDto[] }) {
  const paymentsQuery = usePayments();
  const createPayment = useCreatePayment();
  const updateStatus = useUpdatePaymentStatus();

  const [form, setForm] = React.useState({ bookingId: "", amount: 0, method: "", providerRef: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPayment.mutateAsync({ bookingId: form.bookingId, amount: Number(form.amount), method: form.method || undefined, providerRef: form.providerRef || undefined });
      setForm({ bookingId: "", amount: 0, method: "", providerRef: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not record payment.");
    }
  }

  async function handleStatus(payment: PaymentDto, status: "CAPTURED" | "FAILED" | "REFUNDED") {
    try {
      await updateStatus.mutateAsync({ id: payment.id, payload: { status } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update payment status.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Booking", cell: (p: PaymentDto) => `${p.bookingCustomerName} — ${p.bookingPackageTitle}` },
          { header: "Amount", cell: (p: PaymentDto) => `₹${p.amount.toLocaleString("en-IN")}` },
          { header: "Method", cell: (p: PaymentDto) => p.method ?? "—" },
          { header: "Provider ref", cell: (p: PaymentDto) => p.providerRef ?? "—" },
          {
            header: "Status",
            cell: (p: PaymentDto) => (
              <div className="flex items-center gap-2">
                <Badge tone={p.status === "CAPTURED" ? "success" : p.status === "FAILED" ? "danger" : p.status === "REFUNDED" ? "neutral" : "warning"}>{p.status}</Badge>
                {canWrite && p.status === "CREATED" ? (
                  <>
                    <button type="button" onClick={() => handleStatus(p, "CAPTURED")} className="text-xs text-emerald-600 hover:underline">
                      Capture
                    </button>
                    <button type="button" onClick={() => handleStatus(p, "FAILED")} className="text-xs text-red-600 hover:underline">
                      Fail
                    </button>
                  </>
                ) : null}
              </div>
            ),
          },
        ]}
        rows={paymentsQuery.data ?? []}
        rowKey={(p) => p.id}
        isLoading={paymentsQuery.isLoading}
        emptyMessage="No payments recorded yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Record a payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
              <Select label="Booking" required className="sm:col-span-2" value={form.bookingId} onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))}>
                <option value="" disabled>
                  Select a booking…
                </option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {bookingLabel(b)}
                  </option>
                ))}
              </Select>
              <Input label="Amount" type="number" min={0} required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
              <Input label="Method" placeholder="UPI, Card, Bank transfer" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} />
              <Input label="Provider ref (optional)" value={form.providerRef} onChange={(e) => setForm((f) => ({ ...f, providerRef: e.target.value }))} />
              <div className="sm:col-span-4">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createPayment.isPending}>
                  Record payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function InvoicesTab({ canWrite, bookings }: { canWrite: boolean; bookings: BookingSummaryDto[] }) {
  const invoicesQuery = useInvoices();
  const createInvoice = useCreateInvoice();
  const uploadFile = useUploadFile();

  const [form, setForm] = React.useState({ bookingId: "", amount: 0, storageKey: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createInvoice.mutateAsync({ bookingId: form.bookingId, amount: Number(form.amount), storageKey: form.storageKey || undefined });
      setForm({ bookingId: "", amount: 0, storageKey: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not generate invoice.");
    }
  }

  async function handleFile(file: File) {
    try {
      const uploaded = await uploadFile.mutateAsync(file);
      setForm((f) => ({ ...f, storageKey: uploaded.key }));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not upload file.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Invoice #", cell: (i: InvoiceDto) => <span className="font-mono">{i.invoiceNumber}</span> },
          { header: "Booking", cell: (i: InvoiceDto) => `${i.bookingCustomerName} — ${i.bookingPackageTitle}` },
          { header: "Amount", cell: (i: InvoiceDto) => `₹${i.amount.toLocaleString("en-IN")}` },
          { header: "Issued", cell: (i: InvoiceDto) => new Date(i.issuedAt).toLocaleDateString() },
          {
            header: "File",
            cell: (i: InvoiceDto) =>
              i.fileUrl ? (
                <a href={i.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:underline">
                  View
                </a>
              ) : (
                "—"
              ),
          },
        ]}
        rows={invoicesQuery.data ?? []}
        rowKey={(i) => i.id}
        isLoading={invoicesQuery.isLoading}
        emptyMessage="No invoices yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
              <Select label="Booking" required value={form.bookingId} onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))}>
                <option value="" disabled>
                  Select a booking…
                </option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {bookingLabel(b)}
                  </option>
                ))}
              </Select>
              <Input label="Amount" type="number" min={0} required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Invoice file (optional)</label>
                <input
                  type="file"
                  disabled={uploadFile.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                  }}
                  className="text-xs text-slate-500"
                />
              </div>
              <div className="sm:col-span-3">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createInvoice.isPending}>
                  Generate invoice
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function EmiPlansTab({ canWrite, bookings }: { canWrite: boolean; bookings: BookingSummaryDto[] }) {
  const [bookingId, setBookingId] = React.useState("");
  const emiQuery = useEmiPlan(bookingId || null);
  const saveEmiPlan = useSaveEmiPlan();

  const [schedule, setSchedule] = React.useState<EmiInstallmentDto[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSchedule(emiQuery.data?.schedule ?? []);
  }, [emiQuery.data]);

  function addInstallment() {
    setSchedule((s) => [...s, { dueDate: new Date().toISOString().slice(0, 10), amount: 0, paid: false }]);
  }
  function updateInstallment(index: number, patch: Partial<EmiInstallmentDto>) {
    setSchedule((s) => s.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function removeInstallment(index: number) {
    setSchedule((s) => s.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    try {
      await saveEmiPlan.mutateAsync({ bookingId, payload: { totalInstallments: schedule.length, schedule } });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save EMI plan.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>EMI plan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Select label="Booking" value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="max-w-md">
          <option value="">Select a booking…</option>
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>
              {bookingLabel(b)}
            </option>
          ))}
        </Select>

        {bookingId ? (
          <>
            <div className="flex flex-col gap-2">
              {schedule.map((installment, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-4">
                  <input
                    type="date"
                    disabled={!canWrite}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    value={installment.dueDate.slice(0, 10)}
                    onChange={(e) => updateInstallment(index, { dueDate: e.target.value })}
                  />
                  <input
                    type="number"
                    disabled={!canWrite}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Amount"
                    value={installment.amount}
                    onChange={(e) => updateInstallment(index, { amount: Number(e.target.value) })}
                  />
                  <label className="flex items-center gap-1.5 text-sm text-slate-600">
                    <input type="checkbox" disabled={!canWrite} checked={installment.paid ?? false} onChange={(e) => updateInstallment(index, { paid: e.target.checked })} />
                    Paid
                  </label>
                  {canWrite ? (
                    <button type="button" onClick={() => removeInstallment(index)} className="text-xs text-red-600 hover:underline">
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
              {schedule.length === 0 ? <p className="text-sm text-slate-400">No installments yet.</p> : null}
            </div>

            {canWrite ? (
              <div className="flex items-center gap-3">
                <Button type="button" variant="secondary" onClick={addInstallment}>
                  Add installment
                </Button>
                <Button type="button" onClick={handleSave} isLoading={saveEmiPlan.isPending}>
                  Save plan
                </Button>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RefundsTab({ canWrite, bookings }: { canWrite: boolean; bookings: BookingSummaryDto[] }) {
  const refundsQuery = useRefunds();
  const paymentsQuery = usePayments();
  const createRefund = useCreateRefund();
  const updateStatus = useUpdateRefundStatus();

  const [form, setForm] = React.useState({ bookingId: "", paymentId: "", amount: 0, reason: "" });
  const [error, setError] = React.useState<string | null>(null);

  const paymentsForBooking = (paymentsQuery.data ?? []).filter((p) => p.bookingId === form.bookingId && p.status === "CAPTURED");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createRefund.mutateAsync({ bookingId: form.bookingId, paymentId: form.paymentId, amount: Number(form.amount), reason: form.reason || undefined });
      setForm({ bookingId: "", paymentId: "", amount: 0, reason: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not request refund.");
    }
  }

  async function handleStatus(refund: RefundDto, status: "APPROVED" | "PROCESSED" | "REJECTED") {
    try {
      await updateStatus.mutateAsync({ id: refund.id, payload: { status } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update refund status.");
    }
  }

  const STATUS_TONE = { REQUESTED: "warning", APPROVED: "info", PROCESSED: "success", REJECTED: "danger" } as const;
  const NEXT_STATUS: Record<string, ["APPROVED" | "PROCESSED" | "REJECTED", string][]> = {
    REQUESTED: [
      ["APPROVED", "Approve"],
      ["REJECTED", "Reject"],
    ],
    APPROVED: [["PROCESSED", "Mark processed"]],
  };

  return (
    <>
      <DataTable
        columns={[
          { header: "Booking", cell: (r: RefundDto) => `${r.bookingCustomerName} — ${r.bookingPackageTitle}` },
          { header: "Amount", cell: (r: RefundDto) => `₹${r.amount.toLocaleString("en-IN")}` },
          { header: "Reason", cell: (r: RefundDto) => r.reason ?? "—" },
          {
            header: "Status",
            cell: (r: RefundDto) => (
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                {canWrite
                  ? (NEXT_STATUS[r.status] ?? []).map(([next, label]) => (
                      <button key={next} type="button" onClick={() => handleStatus(r, next)} className="text-xs text-slate-600 hover:underline">
                        {label}
                      </button>
                    ))
                  : null}
              </div>
            ),
          },
        ]}
        rows={refundsQuery.data ?? []}
        rowKey={(r) => r.id}
        isLoading={refundsQuery.isLoading}
        emptyMessage="No refund requests yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Request a refund</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
              <Select
                label="Booking"
                required
                className="sm:col-span-2"
                value={form.bookingId}
                onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value, paymentId: "" }))}
              >
                <option value="" disabled>
                  Select a booking…
                </option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {bookingLabel(b)}
                  </option>
                ))}
              </Select>
              <Select label="Payment" required value={form.paymentId} onChange={(e) => setForm((f) => ({ ...f, paymentId: e.target.value }))}>
                <option value="" disabled>
                  Select a captured payment…
                </option>
                {paymentsForBooking.map((p) => (
                  <option key={p.id} value={p.id}>
                    ₹{p.amount.toLocaleString("en-IN")} ({p.method ?? p.provider})
                  </option>
                ))}
              </Select>
              <Input label="Amount" type="number" min={0} required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
              <Input label="Reason" className="sm:col-span-4" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
              <div className="sm:col-span-4">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createRefund.isPending}>
                  Request refund
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
