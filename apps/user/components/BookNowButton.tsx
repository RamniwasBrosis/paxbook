"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function BookNowButton({ packageId, packageSlug, isLoggedIn }: { packageId: string; packageSlug: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/packages/${packageSlug}`)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "Could not start your booking.");
      }
      router.push(`/account/bookings/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start your booking.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {busy ? "Starting…" : "Book this package"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
