"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function AddTravelerForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", dob: "", passportNumber: "", nationality: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-brand hover:underline">
        + Add traveler
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/profile/travelers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          dob: form.dob || undefined,
          passportNumber: form.passportNumber || undefined,
          nationality: form.nationality || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "Could not add traveler.");
      }
      setForm({ name: "", dob: "", passportNumber: "", nationality: "" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add traveler.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3">
      <input
        required
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      <input
        placeholder="Nationality"
        value={form.nationality}
        onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        placeholder="Passport number"
        value={form.passportNumber}
        onChange={(e) => setForm((f) => ({ ...f, passportNumber: e.target.value }))}
        className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      {error ? <p className="col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="col-span-2 flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Saving…" : "Save traveler"}
        </button>
      </div>
    </form>
  );
}
