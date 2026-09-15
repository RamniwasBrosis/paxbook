"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Modal } from "@/components/Modal";

export function RequestDateChangeButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [newDate, setNewDate] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const minDate = new Date().toISOString().slice(0, 10);

  async function submit() {
    if (!newDate) {
      setError("Please pick the date you'd like to travel instead.");
      return;
    }
    if (remarks.trim().length < 3) {
      setError("Please tell us briefly why you'd like to change the date.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/customer/flight-bookings/${bookingId}/date-change-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTravelDate: newDate, remarks }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        setError(json?.error?.message ?? "Could not submit this request. Please try again or contact support.");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
        <CalendarClock className="h-3.5 w-3.5" strokeWidth={2} />
        Request date change
      </button>

      <Modal open={open} onClose={() => (busy ? undefined : setOpen(false))} title="Request a date change" subtitle="We'll submit this to the airline and confirm the fare difference with you.">
        <p className="text-sm text-slate-600">
          This submits a real request to the airline for a new travel date on the same flight number — it does not change your booking instantly. Our
          team will confirm any fare difference and get back to you to complete the change.
        </p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          New travel date
          <input
            type="date"
            min={minDate}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Reason for the change
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            placeholder="e.g. Trip dates changed"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} disabled={busy} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
            Never mind
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </Modal>
    </>
  );
}
