"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useAdminAirports, useCreateAirport, useUpdateAirport, useDeleteAirport } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { AirportDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

export default function AirportsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const canWrite = hasPermission(PERMISSIONS.FLIGHTS_WRITE);
  const airportsQuery = useAdminAirports();
  const createAirport = useCreateAirport();
  const updateAirport = useUpdateAirport();
  const deleteAirport = useDeleteAirport();

  const [form, setForm] = React.useState({ code: "", name: "", city: "", country: "India" });
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAirport.mutateAsync({ code: form.code.toUpperCase(), name: form.name, city: form.city, country: form.country, isActive: true });
      setForm({ code: "", name: "", city: "", country: "India" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add airport.");
    }
  }

  const airports = (airportsQuery.data ?? []).filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return a.code.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/flights" className="text-xs text-slate-500 hover:underline">
          ← All flight bookings
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Airports</h1>
        <p className="text-sm text-slate-500">
          Drives the &quot;From&quot;/&quot;To&quot; search autocomplete on the customer site. Disable an airport to hide it from search without deleting
          its history; only active airports are shown to customers.
        </p>
      </div>

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Add airport</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
              <Input label="IATA code" required maxLength={3} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="max-w-[100px]" />
              <Input label="City" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="max-w-[180px]" />
              <Input label="Airport name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="min-w-[240px] flex-1" />
              <Input label="Country" required value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="max-w-[160px]" />
              <Button type="submit" isLoading={createAirport.isPending}>
                Add
              </Button>
            </form>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All airports ({airportsQuery.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input label="Search" placeholder="Code, city, or airport name" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">City</th>
                  <th className="px-4 py-2 font-medium">Airport name</th>
                  <th className="px-4 py-2 font-medium">Country</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  {canWrite ? <th className="px-4 py-2 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {airports.map((a) => (
                  <AirportRow key={a.id} airport={a} canWrite={canWrite} onUpdate={updateAirport.mutateAsync} onDelete={deleteAirport.mutateAsync} />
                ))}
                {airportsQuery.isSuccess && airports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No airports match &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AirportRow({
  airport,
  canWrite,
  onUpdate,
  onDelete,
}: {
  airport: AirportDto;
  canWrite: boolean;
  onUpdate: (args: { id: string; payload: { isActive?: boolean } }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const [busy, setBusy] = React.useState(false);

  async function toggleActive() {
    setBusy(true);
    try {
      await onUpdate({ id: airport.id, payload: { isActive: !airport.isActive } });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete(airport.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="px-4 py-2 font-semibold text-navy-deep">{airport.code}</td>
      <td className="px-4 py-2">{airport.city}</td>
      <td className="px-4 py-2 text-slate-500">{airport.name}</td>
      <td className="px-4 py-2 text-slate-500">{airport.country}</td>
      <td className="px-4 py-2">
        <Badge tone={airport.isActive ? "success" : "neutral"}>{airport.isActive ? "Active" : "Disabled"}</Badge>
      </td>
      {canWrite ? (
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <Button variant="secondary" disabled={busy} onClick={toggleActive}>
              {airport.isActive ? "Disable" : "Enable"}
            </Button>
            <Button variant="danger" disabled={busy} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}
