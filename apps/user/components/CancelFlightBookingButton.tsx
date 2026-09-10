"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Modal } from "@/components/Modal";

export function CancelFlightBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function confirmCancel() {
    if (reason.trim().length < 3) {
      setError("Please tell us briefly why you're cancelling.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/customer/flight-bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        setError(json?.error?.message ?? "Could not cancel this booking. Please try again or contact support.");
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"
      >
        <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
        Cancel booking
      </button>

      <Modal open={open} onClose={() => (busy ? undefined : setOpen(false))} title="Cancel this booking?" subtitle="This cannot be undone once submitted.">
        <p className="text-sm text-slate-600">
          Cancelling contacts the airline immediately to cancel every passenger&apos;s ticket. Any refund due will be reviewed and processed by our team
          separately — you&apos;ll see it reflected here once it is.
        </p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Reason for cancellation
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            placeholder="e.g. Change of plans"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => setOpen(false)} disabled={busy} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
            Keep booking
          </button>
          <button
            type="button"
            onClick={confirmCancel}
            disabled={busy}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Cancelling…" : "Yes, cancel booking"}
          </button>
        </div>
      </Modal>
    </>
  );
}
