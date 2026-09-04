"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RefreshFlightStatusButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function refresh() {
    setBusy(true);
    try {
      await fetch(`/api/customer/flight-bookings/${bookingId}/refresh-status`, { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={refresh} disabled={busy} className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline disabled:opacity-60">
      <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} strokeWidth={2} />
      Refresh status
    </button>
  );
}
