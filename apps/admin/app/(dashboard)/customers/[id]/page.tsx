"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useCustomer,
  useUpdateCustomer,
  useAddTraveler,
  useUpdateTraveler,
  useDeleteTraveler,
  useAddCustomerDocument,
  useDeleteCustomerDocument,
  useUploadFile,
  useBookings,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { TravelerDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.CUSTOMERS_READ);
  const canWrite = hasPermission(PERMISSIONS.CUSTOMERS_WRITE);

  const customerQuery = useCustomer(params.id);
  const bookingsQuery = useBookings();

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>customers.read</code>.</p>
      </Card>
    );
  }

  if (customerQuery.isLoading || !customerQuery.data) {
    return <p className="text-sm text-slate-500">Loading customer…</p>;
  }

  const customer = customerQuery.data;
  const customerBookings = (bookingsQuery.data ?? []).filter((b) => b.customerId === customer.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/customers" className="text-xs text-slate-500 hover:underline">
          ← All customers
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{customer.name}</h1>
        <p className="text-sm text-slate-500">{customer.email}</p>
      </div>

      <BasicInfoCard customerId={customer.id} initial={customer} canWrite={canWrite} />
      <TravelersCard customerId={customer.id} travelers={customer.travelers} canWrite={canWrite} />
      <DocumentsCard customerId={customer.id} documents={customer.documents} travelers={customer.travelers} canWrite={canWrite} />

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {customerBookings.length === 0 ? <p className="text-sm text-slate-400">No bookings yet.</p> : null}
          {customerBookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              <span>{b.packageTitle}</span>
              <span className="flex items-center gap-2">
                <Badge tone={b.status === "CONFIRMED" || b.status === "COMPLETED" ? "success" : b.status === "CANCELLED" ? "danger" : "neutral"}>{b.status}</Badge>
                <span className="text-slate-500">₹{b.totalAmount.toLocaleString("en-IN")}</span>
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function BasicInfoCard({ customerId, initial, canWrite }: { customerId: string; initial: { name: string; email: string; phone: string | null }; canWrite: boolean }) {
  const updateCustomer = useUpdateCustomer();
  const [form, setForm] = React.useState({ name: initial.name, email: initial.email, phone: initial.phone ?? "" });
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateCustomer.mutateAsync({ id: customerId, payload: { name: form.name, email: form.email, phone: form.phone || undefined } });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save customer.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic info</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="Name" required disabled={!canWrite} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" required disabled={!canWrite} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Phone" disabled={!canWrite} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          {canWrite ? (
            <div className="sm:col-span-3">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              {saved ? <p className="mb-2 text-sm text-emerald-600">Saved.</p> : null}
              <Button type="submit" isLoading={updateCustomer.isPending}>
                Save
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function TravelersCard({ customerId, travelers, canWrite }: { customerId: string; travelers: TravelerDto[]; canWrite: boolean }) {
  const addTraveler = useAddTraveler();
  const updateTraveler = useUpdateTraveler();
  const deleteTraveler = useDeleteTraveler();

  const empty = { id: null as string | null, name: "", dob: "", passportNumber: "", nationality: "" };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      dob: form.dob || undefined,
      passportNumber: form.passportNumber || undefined,
      nationality: form.nationality || undefined,
    };
    try {
      if (form.id) {
        await updateTraveler.mutateAsync({ customerId, travelerId: form.id, payload });
      } else {
        await addTraveler.mutateAsync({ customerId, payload });
      }
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save traveler.");
    }
  }

  async function handleDelete(travelerId: string) {
    if (!confirm("Remove this traveler?")) return;
    try {
      await deleteTraveler.mutateAsync({ customerId, travelerId });
      if (form.id === travelerId) setForm(empty);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not remove traveler.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travelers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {travelers.length === 0 ? <p className="text-sm text-slate-400">No travelers yet.</p> : null}
          {travelers.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-slate-900">{t.name}</span>
                <span className="ml-2 text-slate-500">
                  {t.nationality ?? ""} {t.passportNumber ? `· ${t.passportNumber}` : ""}
                </span>
              </div>
              {canWrite ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ id: t.id, name: t.name, dob: t.dob?.slice(0, 10) ?? "", passportNumber: t.passportNumber ?? "", nationality: t.nationality ?? "" })
                    }
                    className="text-xs text-slate-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {canWrite ? (
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-5" onSubmit={handleSubmit}>
            <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="DOB" type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
            <Input label="Passport #" value={form.passportNumber} onChange={(e) => setForm((f) => ({ ...f, passportNumber: e.target.value }))} />
            <Input label="Nationality" value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} />
            <div className="flex items-end gap-2">
              <Button type="submit" isLoading={addTraveler.isPending || updateTraveler.isPending}>
                {form.id ? "Save" : "Add"}
              </Button>
              {form.id ? (
                <button type="button" onClick={() => setForm(empty)} className="text-xs text-slate-500 hover:underline">
                  Cancel
                </button>
              ) : null}
            </div>
            {error ? <p className="text-sm text-red-600 sm:col-span-5">{error}</p> : null}
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DocumentsCard({
  customerId,
  documents,
  travelers,
  canWrite,
}: {
  customerId: string;
  documents: { id: string; travelerId: string | null; docType: string; fileUrl: string }[];
  travelers: TravelerDto[];
  canWrite: boolean;
}) {
  const addDocument = useAddCustomerDocument();
  const deleteDocument = useDeleteCustomerDocument();
  const uploadFile = useUploadFile();

  const [docType, setDocType] = React.useState("");
  const [travelerId, setTravelerId] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setError(null);
    if (!docType) {
      setError("Enter a document type before uploading.");
      return;
    }
    try {
      const uploaded = await uploadFile.mutateAsync(file);
      await addDocument.mutateAsync({ customerId, payload: { docType, storageKey: uploaded.key, travelerId: travelerId || undefined } });
      setDocType("");
      setTravelerId("");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not upload document.");
    }
  }

  async function handleDelete(documentId: string) {
    if (!confirm("Remove this document?")) return;
    try {
      await deleteDocument.mutateAsync({ customerId, documentId });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not remove document.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {documents.length === 0 ? <p className="text-sm text-slate-400">No documents yet.</p> : null}
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">
                {d.docType}
              </a>
              {canWrite ? (
                <button type="button" onClick={() => handleDelete(d.id)} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {canWrite ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Document type" placeholder="e.g. Passport" value={docType} onChange={(e) => setDocType(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Traveler (optional)</label>
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={travelerId}
                onChange={(e) => setTravelerId(e.target.value)}
              >
                <option value="">Customer-level</option>
                {travelers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">File</label>
              <input
                type="file"
                disabled={uploadFile.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelected(file);
                  e.target.value = "";
                }}
                className="text-xs text-slate-500"
              />
            </div>
            {error ? <p className="text-sm text-red-600 sm:col-span-3">{error}</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
