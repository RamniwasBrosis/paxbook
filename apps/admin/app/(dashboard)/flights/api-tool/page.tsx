"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useFlightApiStatus, useAdminFlightSearch, useAdminFareDetails, useAdminPriceCheck, useAdminFareRules, useFlightApiLogs } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { FlightOptionDto, SearchFlightRequestDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@paxbook/ui";

const TRIP_TYPES = [
  { value: 0, label: "One way" },
  { value: 1, label: "Round trip" },
  { value: 2, label: "Multi-city (not yet enabled by provider)" },
];
const CABINS = [
  { value: "E", label: "Economy" },
  { value: "P", label: "Premium Economy" },
  { value: "B", label: "Business" },
  { value: "F", label: "First" },
];
const FARE_TYPES = [
  { value: "A", label: "Regular" },
  { value: "S", label: "Student" },
  { value: "C", label: "Senior Citizen" },
  { value: "D", label: "Defence" },
];

function toYyyymmdd(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function FlightApiToolPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);

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
        <h1 className="text-xl font-semibold text-slate-900">Flight API — live test tool</h1>
        <p className="text-sm text-slate-500">Exercise the connected flight provider directly and inspect every request/response.</p>
      </div>
      <StatusCard />
      <SearchTool />
      <FareRulesTool />
      <ApiLogViewer />
    </div>
  );
}

function StatusCard() {
  const statusQuery = useFlightApiStatus();
  const s = statusQuery.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4 text-sm">
        {statusQuery.isLoading ? (
          <span className="text-slate-400">Checking…</span>
        ) : (
          <>
            <Badge tone={s?.configured ? "success" : "danger"}>{s?.configured ? "Configured" : "Not configured"}</Badge>
            <span className="text-slate-600">
              Mode: <strong>{s?.mode === 1 ? "Live" : "Test"}</strong>
            </span>
            <span className="text-slate-600">
              Wallet balance: <strong>{s?.balance ?? "—"}</strong>
            </span>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SearchTool() {
  const search = useAdminFlightSearch();
  const fareDetails = useAdminFareDetails();
  const priceCheck = useAdminPriceCheck();
  const [error, setError] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<{ kind: "fare-details" | "price-check"; data: unknown } | null>(null);
  const [polling, setPolling] = React.useState(false);

  const MAX_POLL_ATTEMPTS = 8;

  const [form, setForm] = React.useState({
    tripType: 0,
    serType: 1,
    depCity: "DEL",
    arrCity: "BOM",
    onDate: "",
    reDate: "",
    adt: 1,
    chd: 0,
    inf: 0,
    cabin: "E",
    fareType: "A",
  });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetail(null);
    const payload: SearchFlightRequestDto = {
      tripType: form.tripType,
      serType: form.serType,
      depCity: form.depCity.toUpperCase(),
      arrCity: form.arrCity.toUpperCase(),
      onDate: toYyyymmdd(form.onDate),
      reDate: form.tripType === 1 && form.reDate ? toYyyymmdd(form.reDate) : undefined,
      adt: form.adt,
      chd: form.chd,
      inf: form.inf,
      cabin: form.cabin,
      fareType: form.fareType,
    };
    try {
      let data = await search.mutateAsync(payload);
      let attempt = 0;
      // Per the FTD spec, a response can come back with isComplete:false and few/no options — keep
      // re-hitting search with the returned refID until isComplete is true, up to a bounded number of tries.
      while (!data.isComplete && attempt < MAX_POLL_ATTEMPTS) {
        setPolling(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        data = await search.mutateAsync({ ...payload, refID: data.refId });
        attempt += 1;
      }
      setPolling(false);
    } catch (err) {
      setPolling(false);
      setError(err instanceof ApiRequestError ? err.message : "Search failed.");
    }
  }

  async function handleFareDetails(option: FlightOptionDto) {
    if (!search.data) return;
    setError(null);
    try {
      const data = await fareDetails.mutateAsync({ flightID: Number(option.id), refID: search.data.refId });
      setDetail({ kind: "fare-details", data });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Fare details lookup failed.");
    }
  }

  async function handlePriceCheck(option: FlightOptionDto) {
    if (!search.data) return;
    setError(null);
    try {
      const data = await priceCheck.mutateAsync({ flightID: Number(option.id), refID: search.data.refId });
      setDetail({ kind: "price-check", data });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Price check failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live search</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form className="grid grid-cols-2 gap-3 sm:grid-cols-4" onSubmit={handleSearch}>
          <Select label="Trip type" value={form.tripType} onChange={(e) => setForm((f) => ({ ...f, tripType: Number(e.target.value) }))}>
            {TRIP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select label="Service type" value={form.serType} onChange={(e) => setForm((f) => ({ ...f, serType: Number(e.target.value) }))}>
            <option value={1}>Domestic</option>
            <option value={2}>International</option>
          </Select>
          <Input label="From (IATA)" maxLength={3} value={form.depCity} onChange={(e) => setForm((f) => ({ ...f, depCity: e.target.value.toUpperCase() }))} />
          <Input label="To (IATA)" maxLength={3} value={form.arrCity} onChange={(e) => setForm((f) => ({ ...f, arrCity: e.target.value.toUpperCase() }))} />
          <Input label="Depart date" type="date" required value={form.onDate} onChange={(e) => setForm((f) => ({ ...f, onDate: e.target.value }))} />
          {form.tripType === 1 ? (
            <Input label="Return date" type="date" required value={form.reDate} onChange={(e) => setForm((f) => ({ ...f, reDate: e.target.value }))} />
          ) : null}
          <Input label="Adults" type="number" min={1} max={9} value={form.adt} onChange={(e) => setForm((f) => ({ ...f, adt: Number(e.target.value) }))} />
          <Input label="Children" type="number" min={0} value={form.chd} onChange={(e) => setForm((f) => ({ ...f, chd: Number(e.target.value) }))} />
          <Input label="Infants" type="number" min={0} max={4} value={form.inf} onChange={(e) => setForm((f) => ({ ...f, inf: Number(e.target.value) }))} />
          <Select label="Cabin" value={form.cabin} onChange={(e) => setForm((f) => ({ ...f, cabin: e.target.value }))}>
            {CABINS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select label="Fare type" value={form.fareType} onChange={(e) => setForm((f) => ({ ...f, fareType: e.target.value }))}>
            {FARE_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <div className="col-span-2 flex items-end sm:col-span-4">
            <Button type="submit" isLoading={search.isPending}>
              Search live
            </Button>
          </div>
        </form>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {search.data ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500">
              refID <code>{search.data.refId}</code> · {search.data.options.length} option(s) · {search.data.isComplete ? "complete" : "still streaming"}
              {polling ? " (auto-polling for more results…)" : ""}
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Flight</th>
                    <th className="px-4 py-2 font-medium">Route</th>
                    <th className="px-4 py-2 font-medium">Depart</th>
                    <th className="px-4 py-2 font-medium">Duration</th>
                    <th className="px-4 py-2 font-medium">Stops</th>
                    <th className="px-4 py-2 font-medium">Fare</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {search.data.options.map((o) => {
                    const firstLeg = o.legs[0];
                    const lastLeg = o.legs[o.legs.length - 1];
                    return (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-2">
                          {firstLeg?.airlineName} {firstLeg?.flightNo}
                        </td>
                        <td className="px-4 py-2">
                          {firstLeg?.depCode} → {lastLeg?.arrCode}
                        </td>
                        <td className="px-4 py-2">{firstLeg ? new Date(firstLeg.depDateTime).toLocaleString("en-IN") : "—"}</td>
                        <td className="px-4 py-2">{formatMinutes(o.durationTotalMinutes)}</td>
                        <td className="px-4 py-2">{o.stops}</td>
                        <td className="px-4 py-2">₹{o.fare.total.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <Button variant="secondary" isLoading={fareDetails.isPending} onClick={() => handleFareDetails(o)}>
                              Fare details
                            </Button>
                            <Button variant="secondary" isLoading={priceCheck.isPending} onClick={() => handlePriceCheck(o)}>
                              Price check
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {detail ? (
          <details open className="rounded-lg border border-slate-100 p-3">
            <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-500">{detail.kind} response</summary>
            <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(detail.data, null, 2)}</pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FareRulesTool() {
  const fareRules = useAdminFareRules();
  const [flightId, setFlightId] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await fareRules.mutateAsync(Number(flightId));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Fare rules lookup failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fare rules lookup</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form className="flex items-end gap-3" onSubmit={handleSubmit}>
          <Input label="Flight ID" className="max-w-xs" required value={flightId} onChange={(e) => setFlightId(e.target.value)} />
          <Button type="submit" isLoading={fareRules.isPending}>
            Fetch fare rules
          </Button>
        </form>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {fareRules.data ? <pre className="max-h-96 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(fareRules.data, null, 2)}</pre> : null}
      </CardContent>
    </Card>
  );
}

function ApiLogViewer() {
  const [endpoint, setEndpoint] = React.useState("");
  const [success, setSuccess] = React.useState<string>("");
  const logsQuery = useFlightApiLogs({
    limit: 50,
    endpoint: endpoint || undefined,
    success: success === "" ? undefined : success === "true",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent API calls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input label="Endpoint contains" className="max-w-xs" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="e.g. bookFlight" />
          <Select label="Result" className="max-w-xs" value={success} onChange={(e) => setSuccess(e.target.value)}>
            <option value="">All</option>
            <option value="true">Success only</option>
            <option value="false">Failures only</option>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          {logsQuery.isLoading ? <p className="text-sm text-slate-400">Loading…</p> : null}
          {!logsQuery.isLoading && (logsQuery.data ?? []).length === 0 ? <p className="text-sm text-slate-400">No calls logged yet.</p> : null}
          {(logsQuery.data ?? []).map((log) => (
            <details key={log.id} className="rounded-lg border border-slate-100 p-3">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm">
                <Badge tone={log.success ? "success" : "danger"}>{log.success ? "OK" : "Failed"}</Badge>
                <strong>{log.endpoint}</strong>
                <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                <span className="text-xs text-slate-400">{log.durationMs != null ? `${log.durationMs}ms` : ""}</span>
                {log.statusCode ? <span className="text-xs text-slate-400">HTTP {log.statusCode}</span> : null}
                {log.errorMessage ? <span className="text-xs text-red-500">{log.errorMessage}</span> : null}
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Request</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(log.requestBody, null, 2)}</pre>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Response</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(log.responseBody, null, 2)}</pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
