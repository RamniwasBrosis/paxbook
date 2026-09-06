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
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { FlightRoutePricingRuleDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

const SAMPLE_FARE = 5000;

function previewPrice(providerFare: number, marginPercent: number, marginFlat: number): number {
  return Math.round((providerFare * (1 + marginPercent / 100) + marginFlat) * 100) / 100;
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
          number is a discount.
        </p>
      </div>

      <GlobalMarginCard canWrite={canWrite} />
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

function RoutePricingCard({ canWrite }: { canWrite: boolean }) {
  const routesQuery = useFlightRoutePricingRules();
  const createRule = useCreateFlightRoutePricingRule();
  const updateRule = useUpdateFlightRoutePricingRule();
  const deleteRule = useDeleteFlightRoutePricingRule();

  const [form, setForm] = React.useState({ depCity: "", arrCity: "", marginPercent: 0, marginFlat: 0 });
  const [error, setError] = React.useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createRule.mutateAsync({
        depCity: form.depCity.toUpperCase(),
        arrCity: form.arrCity.toUpperCase(),
        marginPercent: form.marginPercent,
        marginFlat: form.marginFlat,
        isActive: true,
      });
      setForm({ depCity: "", arrCity: "", marginPercent: 0, marginFlat: 0 });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add route rule.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route-specific overrides</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Route</th>
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
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No route-specific rules — every route uses the default margin above.
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
              Add route rule
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
