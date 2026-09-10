"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useFlightPricingSetting,
  useUpdateFlightPricingSetting,
  useFlightRoutePricingRules,
  useCreateFlightRoutePricingRule,
  useUpdateFlightRoutePricingRule,
  useDeleteFlightRoutePricingRule,
  useAdminFlightSearch,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { FlightOptionDto, FlightRoutePricingRuleDto, SaveFlightRoutePricingRuleDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

const SAMPLE_FARE = 5000;
const TODAY = new Date().toISOString().slice(0, 10);
const CABIN_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Any cabin" },
  { value: "E", label: "Economy" },
  { value: "P", label: "Premium Economy" },
  { value: "B", label: "Business" },
  { value: "F", label: "First" },
];
const CABIN_LABEL: Record<string, string> = { E: "Economy", P: "Premium Economy", B: "Business", F: "First" };

function previewPrice(providerFare: number, marginPercent: number, marginFlat: number): number {
  return Math.round((providerFare * (1 + marginPercent / 100) + marginFlat) * 100) / 100;
}

function toYyyymmdd(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

export default function FlightPricingPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const canWrite = hasPermission(PERMISSIONS.FLIGHTS_WRITE);

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
      <div>
        <Link href="/flights" className="text-xs text-slate-500 hover:underline">
          ← All flight bookings
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Flight pricing</h1>
        <p className="text-sm text-slate-500">
          The provider&apos;s fare is your real cost. Set a margin here to decide what customers actually pay — a positive number is your profit, a negative
          number is a discount. Rules apply most-specific first: an exact flight, then its route, then the default below.
        </p>
      </div>

      <GlobalMarginCard canWrite={canWrite} />
      <LiveFlightOverrideCard canWrite={canWrite} />
      <RoutePricingCard canWrite={canWrite} />
    </div>
  );
}

function GlobalMarginCard({ canWrite }: { canWrite: boolean }) {
  const settingQuery = useFlightPricingSetting();
  const updateSetting = useUpdateFlightPricingSetting();
  const [marginPercent, setMarginPercent] = React.useState(0);
  const [marginFlat, setMarginFlat] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (settingQuery.data) {
      setMarginPercent(settingQuery.data.marginPercent);
      setMarginFlat(settingQuery.data.marginFlat);
    }
  }, [settingQuery.data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateSetting.mutateAsync({ marginPercent, marginFlat });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save pricing settings.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default margin (applies to every route unless overridden below)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <Input
            label="Margin %"
            type="number"
            step="0.1"
            disabled={!canWrite}
            value={marginPercent}
            onChange={(e) => setMarginPercent(Number(e.target.value))}
            className="max-w-[140px]"
          />
          <Input
            label="Flat amount (₹)"
            type="number"
            step="1"
            disabled={!canWrite}
            value={marginFlat}
            onChange={(e) => setMarginFlat(Number(e.target.value))}
            className="max-w-[160px]"
          />
          {canWrite ? (
            <Button type="submit" isLoading={updateSetting.isPending}>
              Save
            </Button>
          ) : null}
          {saved ? <span className="text-sm text-emerald-600">Saved.</span> : null}
        </form>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <div className="mt-4 rounded-lg bg-mist p-3 text-sm text-slate-600">
          Example: a flight the provider prices at <strong>₹{SAMPLE_FARE.toLocaleString("en-IN")}</strong> would show to customers as{" "}
          <strong>₹{previewPrice(SAMPLE_FARE, marginPercent, marginFlat).toLocaleString("en-IN")}</strong>
          {marginPercent !== 0 || marginFlat !== 0 ? (
            <>
              {" "}
              (your margin: ₹{(previewPrice(SAMPLE_FARE, marginPercent, marginFlat) - SAMPLE_FARE).toLocaleString("en-IN")})
            </>
          ) : null}
          .
        </div>
      </CardContent>
    </Card>
  );
}

function LiveFlightOverrideCard({ canWrite }: { canWrite: boolean }) {
  const search = useAdminFlightSearch();
  const createRule = useCreateFlightRoutePricingRule();
  const [form, setForm] = React.useState({ depCity: "", arrCity: "", onDate: "" });
  const [error, setError] = React.useState<string | null>(null);
  const [openRowId, setOpenRowId] = React.useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOpenRowId(null);
    if (!/^[A-Za-z]{3}$/.test(form.depCity) || !/^[A-Za-z]{3}$/.test(form.arrCity) || !form.onDate) {
      setError("Enter valid 3-letter airport codes and a date.");
      return;
    }
    try {
      await search.mutateAsync({
        tripType: 0,
        serType: 1,
        depCity: form.depCity.toUpperCase(),
        arrCity: form.arrCity.toUpperCase(),
        onDate: toYyyymmdd(form.onDate),
        adt: 1,
        chd: 0,
        inf: 0,
        cabin: "E",
        fareType: "A",
      });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Search failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live flights — set an override for one specific flight</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-slate-500">
          Search real flights the same way customers do, then set a margin or discount on one exact airline + flight number — it takes priority over the
          route and default margins.
        </p>
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <Input label="From (IATA)" required maxLength={3} value={form.depCity} onChange={(e) => setForm((f) => ({ ...f, depCity: e.target.value.toUpperCase() }))} className="max-w-[100px]" />
          <Input label="To (IATA)" required maxLength={3} value={form.arrCity} onChange={(e) => setForm((f) => ({ ...f, arrCity: e.target.value.toUpperCase() }))} className="max-w-[100px]" />
          <Input label="Date" type="date" required min={TODAY} value={form.onDate} onChange={(e) => setForm((f) => ({ ...f, onDate: e.target.value }))} className="max-w-[170px]" />
          <Button type="submit" isLoading={search.isPending}>
            Search live
          </Button>
        </form>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {search.data && search.data.options.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Flight</th>
                  <th className="px-4 py-2 font-medium">Route</th>
                  <th className="px-4 py-2 font-medium">Depart</th>
                  <th className="px-4 py-2 font-medium">Customer price now</th>
                  {canWrite ? <th className="px-4 py-2 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {search.data.options.map((option) => (
                  <LiveFlightRow
                    key={option.id}
                    option={option}
                    open={openRowId === option.id}
                    onToggle={() => setOpenRowId(openRowId === option.id ? null : option.id)}
                    canWrite={canWrite}
                    onSave={async (payload) => {
                      await createRule.mutateAsync(payload);
                      setOpenRowId(null);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : search.data && search.data.options.length === 0 ? (
          <p className="text-sm text-slate-400">No flights found for that search.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LiveFlightRow({
  option,
  open,
  onToggle,
  canWrite,
  onSave,
}: {
  option: FlightOptionDto;
  open: boolean;
  onToggle: () => void;
  canWrite: boolean;
  onSave: (payload: SaveFlightRoutePricingRuleDto) => Promise<unknown>;
}) {
  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  const [marginPercent, setMarginPercent] = React.useState(0);
  const [marginFlat, setMarginFlat] = React.useState(0);
  const [label, setLabel] = React.useState("");
  const [cabin, setCabin] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  if (!firstLeg || !lastLeg) return null;

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await onSave({
        depCity: firstLeg!.depCode,
        arrCity: lastLeg!.arrCode,
        airlineCode: firstLeg!.airlineCode,
        flightNo: firstLeg!.flightNo,
        cabin: cabin || undefined,
        label: label || undefined,
        marginPercent,
        marginFlat,
        isActive: true,
      });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save override.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className="border-b border-slate-50 last:border-0">
        <td className="px-4 py-2 font-semibold text-navy-deep">
          {firstLeg.airlineName} {firstLeg.airlineCode}-{firstLeg.flightNo}
        </td>
        <td className="px-4 py-2">
          {firstLeg.depCode} → {lastLeg.arrCode}
        </td>
        <td className="px-4 py-2">{new Date(firstLeg.depDateTime).toLocaleString("en-IN")}</td>
        <td className="px-4 py-2">₹{option.fare.total.toLocaleString("en-IN")}</td>
        {canWrite ? (
          <td className="px-4 py-2">
            <Button variant="secondary" onClick={onToggle}>
              {open ? "Cancel" : "Set override"}
            </Button>
          </td>
        ) : null}
      </tr>
      {open ? (
        <tr className="border-b border-slate-50 bg-mist/50 last:border-0">
          <td colSpan={5} className="px-4 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <Input label="Margin %" type="number" step="0.1" value={marginPercent} onChange={(e) => setMarginPercent(Number(e.target.value))} className="max-w-[120px]" />
              <Input label="Flat (₹)" type="number" step="1" value={marginFlat} onChange={(e) => setMarginFlat(Number(e.target.value))} className="max-w-[120px]" />
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Cabin
                <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {CABIN_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Label (optional, internal)" value={label} onChange={(e) => setLabel(e.target.value)} className="max-w-[220px]" placeholder="e.g. Diwali sale" />
              <Button onClick={handleSave} isLoading={busy}>
                Save override for {firstLeg.airlineCode}-{firstLeg.flightNo}
              </Button>
            </div>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RoutePricingCard({ canWrite }: { canWrite: boolean }) {
  const routesQuery = useFlightRoutePricingRules();
  const createRule = useCreateFlightRoutePricingRule();
  const updateRule = useUpdateFlightRoutePricingRule();
  const deleteRule = useDeleteFlightRoutePricingRule();

  const [form, setForm] = React.useState({ depCity: "", arrCity: "", cabin: "", marginPercent: 0, marginFlat: 0 });
  const [error, setError] = React.useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createRule.mutateAsync({
        depCity: form.depCity.toUpperCase(),
        arrCity: form.arrCity.toUpperCase(),
        cabin: form.cabin || undefined,
        marginPercent: form.marginPercent,
        marginFlat: form.marginFlat,
        isActive: true,
      });
      setForm({ depCity: "", arrCity: "", cabin: "", marginPercent: 0, marginFlat: 0 });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add route rule.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route &amp; flight overrides</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Route</th>
                <th className="px-4 py-2 font-medium">Flight</th>
                <th className="px-4 py-2 font-medium">Cabin</th>
                <th className="px-4 py-2 font-medium">Label</th>
                <th className="px-4 py-2 font-medium">Margin %</th>
                <th className="px-4 py-2 font-medium">Flat (₹)</th>
                <th className="px-4 py-2 font-medium">Status</th>
                {canWrite ? <th className="px-4 py-2 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {(routesQuery.data ?? []).map((route) => (
                <RouteRow key={route.id} route={route} canWrite={canWrite} onUpdate={updateRule.mutateAsync} onDelete={deleteRule.mutateAsync} />
              ))}
              {!routesQuery.isLoading && (routesQuery.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                    No overrides yet — every route uses the default margin above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {canWrite ? (
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <Input label="From (IATA)" required maxLength={3} value={form.depCity} onChange={(e) => setForm((f) => ({ ...f, depCity: e.target.value.toUpperCase() }))} className="max-w-[100px]" />
            <Input label="To (IATA)" required maxLength={3} value={form.arrCity} onChange={(e) => setForm((f) => ({ ...f, arrCity: e.target.value.toUpperCase() }))} className="max-w-[100px]" />
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Cabin
              <select value={form.cabin} onChange={(e) => setForm((f) => ({ ...f, cabin: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {CABIN_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Margin %"
              type="number"
              step="0.1"
              value={form.marginPercent}
              onChange={(e) => setForm((f) => ({ ...f, marginPercent: Number(e.target.value) }))}
              className="max-w-[120px]"
            />
            <Input
              label="Flat (₹)"
              type="number"
              step="1"
              value={form.marginFlat}
              onChange={(e) => setForm((f) => ({ ...f, marginFlat: Number(e.target.value) }))}
              className="max-w-[120px]"
            />
            <Button type="submit" isLoading={createRule.isPending}>
              Add whole-route rule
            </Button>
          </form>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function RouteRow({
  route,
  canWrite,
  onUpdate,
  onDelete,
}: {
  route: FlightRoutePricingRuleDto;
  canWrite: boolean;
  onUpdate: (args: { id: string; payload: Partial<{ marginPercent: number; marginFlat: number; isActive: boolean }> }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const [marginPercent, setMarginPercent] = React.useState(route.marginPercent);
  const [marginFlat, setMarginFlat] = React.useState(route.marginFlat);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      await onUpdate({ id: route.id, payload: { marginPercent, marginFlat } });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    try {
      await onUpdate({ id: route.id, payload: { isActive: !route.isActive } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="px-4 py-2 font-semibold text-navy-deep">
        {route.depCity} → {route.arrCity}
      </td>
      <td className="px-4 py-2 text-slate-500">{route.airlineCode && route.flightNo ? `${route.airlineCode}-${route.flightNo}` : "Any flight"}</td>
      <td className="px-4 py-2 text-slate-500">{route.cabin ? CABIN_LABEL[route.cabin] ?? route.cabin : "Any cabin"}</td>
      <td className="px-4 py-2 text-slate-500">{route.label ?? "—"}</td>
      <td className="px-4 py-2">
        {canWrite ? (
          <input
            type="number"
            step="0.1"
            value={marginPercent}
            onChange={(e) => setMarginPercent(Number(e.target.value))}
            onBlur={save}
            className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
          />
        ) : (
          route.marginPercent
        )}
      </td>
      <td className="px-4 py-2">
        {canWrite ? (
          <input
            type="number"
            step="1"
            value={marginFlat}
            onChange={(e) => setMarginFlat(Number(e.target.value))}
            onBlur={save}
            className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
          />
        ) : (
          route.marginFlat
        )}
      </td>
      <td className="px-4 py-2">
        <Badge tone={route.isActive ? "success" : "neutral"}>{route.isActive ? "Active" : "Disabled"}</Badge>
      </td>
      {canWrite ? (
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <Button variant="secondary" disabled={busy} onClick={toggleActive}>
              {route.isActive ? "Disable" : "Enable"}
            </Button>
            <Button variant="danger" disabled={busy} onClick={() => onDelete(route.id)}>
              Delete
            </Button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}
