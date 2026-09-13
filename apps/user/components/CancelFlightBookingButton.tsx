"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import type { FlightCancellationEstimateDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";

export function CancelFlightBookingButton({
  bookingId,
  refundable,
  totalAmount,
  currency,
}: {
  bookingId: string;
  refundable?: boolean | null;
  totalAmount?: number;
  currency?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [estimate, setEstimate] = React.useState<FlightCancellationEstimateDto | null>(null);
  const [loadingEstimate, setLoadingEstimate] = React.useState(false);

  // Fetch a real, provider-backed estimate once the modal opens — never blocks the actual cancel
  // action if it fails or comes back unavailable; the qualitative fallback below always still works.
  React.useEffect(() => {
    if (!open) {
      setEstimate(null);
      return;
    }
    let cancelled = false;
    setLoadingEstimate(true);
    fetch(`/api/customer/flight-bookings/${bookingId}/cancellation-estimate`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.success !== false) setEstimate(json.data as FlightCancellationEstimateDto);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingEstimate(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, bookingId]);

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
        {loadingEstimate ? (
          <p className="mt-3 text-sm text-slate-400">Checking the airline&apos;s cancellation policy…</p>
        ) : estimate?.available ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            Estimated refund: {currency} {estimate.estimatedRefundAmount?.toLocaleString("en-IN")}. {estimate.note}
          </p>
        ) : refundable === true ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            This fare is refundable. You paid {currency} {totalAmount?.toLocaleString("en-IN")} — your eligible refund (after any airline cancellation
            charge) will be calculated and processed to your original payment method.
          </p>
        ) : refundable === false ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            This fare is non-refundable. Airline cancellation charges are likely to apply — any partial refund will be confirmed by our team after
            cancellation.
          </p>
        ) : null}
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
