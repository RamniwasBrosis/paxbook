"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useVendor,
  useUpdateVendor,
  useAddVendorContract,
  useDeleteVendorContract,
  useVendorPayments,
  useCreateVendorPayment,
  useMarkVendorPaymentPaid,
  useUploadFile,
  useBookings,
  useProvisionVendorPortalAccess,
  useResetVendorPortalPassword,
  useCategories,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { VendorCategoryType, VendorStatus } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CheckboxGroup, Input, Select } from "@paxbook/ui";

const CATEGORY_OPTIONS: VendorCategoryType[] = ["HOTEL", "TRANSPORT", "GUIDE", "ACTIVITY"];

export default function InventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.VENDORS_READ);
  const canWrite = hasPermission(PERMISSIONS.VENDORS_WRITE);
  const vendorQuery = useVendor(params.id);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>vendors.read</code>.</p>
      </Card>
    );
  }

  if (vendorQuery.isLoading || !vendorQuery.data) {
    return <p className="text-sm text-slate-500">Loading vendor…</p>;
  }

  const vendor = vendorQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/inventory" className="text-xs text-slate-500 hover:underline">
          ← All inventory
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{vendor.name}</h1>
          <Badge tone={vendor.status === "ACTIVE" ? "success" : "neutral"}>{vendor.status}</Badge>
        </div>
      </div>

      <BasicInfoCard vendorId={vendor.id} initial={vendor} canWrite={canWrite} />
      <PortalAccessCard vendorId={vendor.id} email={vendor.email} canWrite={canWrite} />
      <ContractsCard vendorId={vendor.id} contracts={vendor.contracts} canWrite={canWrite} />
      <PaymentsCard vendorId={vendor.id} canWrite={canWrite} />
    </div>
  );
}

function BasicInfoCard({
  vendorId,
  initial,
  canWrite,
}: {
  vendorId: string;
  initial: { name: string; categoryType: VendorCategoryType; contactInfo: string | null; status: VendorStatus; categoryIds: string[] };
  canWrite: boolean;
}) {
  const updateVendor = useUpdateVendor();
  const categoriesQuery = useCategories();
  const [form, setForm] = React.useState({
    name: initial.name,
    categoryType: initial.categoryType,
    contactInfo: initial.contactInfo ?? "",
    status: initial.status,
    categoryIds: initial.categoryIds,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateVendor.mutateAsync({
        id: vendorId,
        payload: {
          name: form.name,
          categoryType: form.categoryType,
          contactInfo: form.contactInfo || undefined,
          status: form.status,
          categoryIds: form.categoryIds,
        },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save vendor.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic info</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
          <Input label="Name" required disabled={!canWrite} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="Category" disabled={!canWrite} value={form.categoryType} onChange={(e) => setForm((f) => ({ ...f, categoryType: e.target.value as VendorCategoryType }))}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input label="Contact info" disabled={!canWrite} value={form.contactInfo} onChange={(e) => setForm((f) => ({ ...f, contactInfo: e.target.value }))} />
          <Select label="Status" disabled={!canWrite} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VendorStatus }))}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
          <div className="sm:col-span-4">
            <CheckboxGroup
              label="Tags"
              disabled={!canWrite}
              options={categoriesQuery.data ?? []}
              selectedIds={form.categoryIds}
              onChange={(categoryIds) => setForm((f) => ({ ...f, categoryIds }))}
            />
          </div>
          {canWrite ? (
            <div className="sm:col-span-4">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              {saved ? <p className="mb-2 text-sm text-emerald-600">Saved.</p> : null}
              <Button type="submit" isLoading={updateVendor.isPending}>
                Save
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function PortalAccessCard({ vendorId, email, canWrite }: { vendorId: string; email: string | null; canWrite: boolean }) {
  const provision = useProvisionVendorPortalAccess();
  const resetPassword = useResetVendorPortalPassword();
  const [emailInput, setEmailInput] = React.useState(email ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = React.useState<string | null>(null);

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRevealedPassword(null);
    try {
      const result = await provision.mutateAsync({ id: vendorId, payload: { email: emailInput } });
      setRevealedPassword(result.temporaryPassword);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not enable portal access.");
    }
  }

  async function handleReset() {
    setError(null);
    setRevealedPassword(null);
    try {
      const result = await resetPassword.mutateAsync(vendorId);
      setRevealedPassword(result.temporaryPassword);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not reset password.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor portal access</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {revealedPassword ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-800">Share this password with the vendor now — it won&apos;t be shown again.</p>
            <p className="mt-1 font-mono text-base text-amber-900">{revealedPassword}</p>
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {email ? (
          <div className="flex items-center justify-between text-sm">
            <span>
              Portal login enabled — <span className="font-medium text-slate-900">{email}</span>
            </span>
            {canWrite ? (
              <Button type="button" variant="secondary" isLoading={resetPassword.isPending} onClick={handleReset}>
                Reset password
              </Button>
            ) : null}
          </div>
        ) : canWrite ? (
          <form className="flex flex-wrap items-end gap-3" onSubmit={handleEnable}>
            <Input label="Vendor email" type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
            <Button type="submit" isLoading={provision.isPending}>
              Enable portal login
            </Button>
          </form>
        ) : (
          <p className="text-sm text-slate-400">Portal access not enabled.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ContractsCard({
  vendorId,
  contracts,
  canWrite,
}: {
  vendorId: string;
  contracts: { id: string; startDate: string; endDate: string | null; terms: string | null; commissionRate: number | null; fileUrl: string | null }[];
  canWrite: boolean;
}) {
  const addContract = useAddVendorContract();
  const deleteContract = useDeleteVendorContract();
  const uploadFile = useUploadFile();

  const [form, setForm] = React.useState({ startDate: "", endDate: "", terms: "", commissionRate: "" as string | number, storageKey: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addContract.mutateAsync({
        vendorId,
        payload: {
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          terms: form.terms || undefined,
          commissionRate: form.commissionRate === "" ? undefined : Number(form.commissionRate),
          storageKey: form.storageKey || undefined,
        },
      });
      setForm({ startDate: "", endDate: "", terms: "", commissionRate: "", storageKey: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add contract.");
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

  async function handleDelete(id: string) {
    if (!confirm("Remove this contract?")) return;
    try {
      await deleteContract.mutateAsync({ vendorId, id });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not remove contract.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {contracts.length === 0 ? <p className="text-sm text-slate-400">No contracts yet.</p> : null}
          {contracts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-slate-900">
                  {c.startDate.slice(0, 10)} {c.endDate ? `→ ${c.endDate.slice(0, 10)}` : "(ongoing)"}
                </span>
                {c.commissionRate != null ? <span className="ml-2 text-slate-500">{c.commissionRate}% commission</span> : null}
                {c.terms ? <p className="mt-1 text-slate-500">{c.terms}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                {c.fileUrl ? (
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:underline">
                    Document
                  </a>
                ) : null}
                {canWrite ? (
                  <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {canWrite ? (
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-5" onSubmit={handleSubmit}>
            <Input label="Start date" type="date" required value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <Input label="End date" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            <Input
              label="Commission %"
              type="number"
              min={0}
              max={100}
              value={form.commissionRate}
              onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))}
            />
            <Input label="Terms" value={form.terms} onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Document</label>
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
            <div className="sm:col-span-5">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              <Button type="submit" isLoading={addContract.isPending}>
                Add contract
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PaymentsCard({ vendorId, canWrite }: { vendorId: string; canWrite: boolean }) {
  const paymentsQuery = useVendorPayments(vendorId);
  const bookingsQuery = useBookings();
  const createPayment = useCreateVendorPayment();
  const markPaid = useMarkVendorPaymentPaid();

  const [form, setForm] = React.useState({ bookingId: "", amount: 0 });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPayment.mutateAsync({ vendorId, bookingId: form.bookingId || undefined, amount: Number(form.amount) });
      setForm({ bookingId: "", amount: 0 });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not record payment.");
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      await markPaid.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not mark paid.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor payments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {(paymentsQuery.data ?? []).length === 0 ? <p className="text-sm text-slate-400">No payments yet.</p> : null}
          {(paymentsQuery.data ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
              <span>₹{p.amount.toLocaleString("en-IN")}</span>
              <div className="flex items-center gap-2">
                <Badge tone={p.status === "PAID" ? "success" : "warning"}>{p.status}</Badge>
                {canWrite && p.status === "PENDING" ? (
                  <button type="button" onClick={() => handleMarkPaid(p.id)} className="text-xs text-emerald-600 hover:underline">
                    Mark paid
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {canWrite ? (
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-3" onSubmit={handleSubmit}>
            <Select label="Booking (optional)" value={form.bookingId} onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))}>
              <option value="">None</option>
              {(bookingsQuery.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.customerName} — {b.packageTitle}
                </option>
              ))}
            </Select>
            <Input label="Amount" type="number" min={0} required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
            <div className="flex items-end">
              <Button type="submit" isLoading={createPayment.isPending}>
                Record payment
              </Button>
            </div>
            {error ? <p className="text-sm text-red-600 sm:col-span-3">{error}</p> : null}
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
