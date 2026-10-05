"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useFlightImportantInfo, useSaveFlightImportantInfo, useResetFlightImportantInfo } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

interface DraftSection {
  title: string;
  /** One point per line, as the admin types it. */
  pointsText: string;
}

/** Editor for the "Important information" block customers see on the flight booking page. */
export default function FlightBookingInfoPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.FLIGHTS_READ);
  const canWrite = hasPermission(PERMISSIONS.FLIGHTS_WRITE);
  const infoQuery = useFlightImportantInfo();
  const save = useSaveFlightImportantInfo();
  const reset = useResetFlightImportantInfo();

  const [sections, setSections] = React.useState<DraftSection[] | null>(null);
  const [message, setMessage] = React.useState<{ tone: "ok" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (infoQuery.data) setSections(infoQuery.data.map((s) => ({ title: s.title, pointsText: s.points.join("\n") })));
  }, [infoQuery.data]);

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

  function update(i: number, patch: Partial<DraftSection>) {
    setSections((prev) => prev!.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function move(i: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev!];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await save.mutateAsync(
        (sections ?? []).map((s) => ({ title: s.title, points: s.pointsText.split("\n").map((p) => p.trim()).filter(Boolean) })),
      );
      setMessage({ tone: "ok", text: "Saved. Customers see this on the flight booking page now." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof ApiRequestError ? err.message : "Could not save." });
    }
  }

  async function handleReset() {
    if (!confirm("Replace everything with the default text?")) return;
    setMessage(null);
    try {
      await reset.mutateAsync();
      setMessage({ tone: "ok", text: "Back to the default text." });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof ApiRequestError ? err.message : "Could not reset." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/flights" className="text-sm font-medium text-brand hover:underline">
          ← Flight bookings
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Flight booking page: important information</h1>
        <p className="text-sm text-slate-500">
          Shown to customers above the traveller details on every flight booking. Coupons for the &ldquo;Coupons and offers&rdquo; box are managed in{" "}
          <Link href="/offers" className="text-brand hover:underline">
            Offers &amp; Coupons
          </Link>
          .
        </p>
      </div>

      {!sections ? (
        <Card className="p-6 text-sm text-slate-500">Loading…</Card>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {sections.map((s, i) => (
            <Card key={i}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Section {i + 1}</CardTitle>
                {canWrite ? (
                  <div className="flex items-center gap-3 text-xs">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-500 hover:underline disabled:opacity-30">
                      Move up
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-slate-500 hover:underline disabled:opacity-30">
                      Move down
                    </button>
                    <button type="button" onClick={() => setSections((prev) => prev!.filter((_, idx) => idx !== i))} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Input id={`info-heading-${i}`} label="Heading" value={s.title} disabled={!canWrite} maxLength={200} onChange={(e) => update(i, { title: e.target.value })} />
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                  Points (one per line)
                  <textarea
                    value={s.pointsText}
                    disabled={!canWrite}
                    rows={4}
                    onChange={(e) => update(i, { pointsText: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </label>
              </CardContent>
            </Card>
          ))}

          {canWrite ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={() => setSections((prev) => [...(prev ?? []), { title: "", pointsText: "" }])} disabled={sections.length >= 20}>
                Add section
              </Button>
              <Button type="submit" isLoading={save.isPending}>
                Save
              </Button>
              <button type="button" onClick={handleReset} className="text-sm text-slate-500 hover:underline">
                Reset to default text
              </button>
            </div>
          ) : null}
          {message ? <p className={`text-sm ${message.tone === "ok" ? "text-green-700" : "text-red-600"}`}>{message.text}</p> : null}
        </form>
      )}
    </div>
  );
}
