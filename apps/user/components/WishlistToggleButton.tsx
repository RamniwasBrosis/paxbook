"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "./Toast";

export function WishlistToggleButton({ packageId, packageSlug, isLoggedIn, initiallySaved }: { packageId: string; packageSlug: string; isLoggedIn: boolean; initiallySaved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initiallySaved);
  const [busy, setBusy] = React.useState(false);
  const { toast, show } = useToast();

  async function toggle() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/packages/${packageSlug}`)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    const willBeSaved = !saved;
    try {
      const res = await fetch(`/api/customer/wishlist/${packageId}`, { method: willBeSaved ? "POST" : "DELETE" });
      if (!res.ok) throw new Error("Request failed");
      setSaved(willBeSaved);
      if (willBeSaved) show("Trip added to your wishlist successfully!");
      router.refresh();
    } catch {
      show("Could not update your wishlist. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          saved ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-600 hover:border-brand hover:text-brand"
        }`}
      >
        {saved ? "♥ Saved" : "♡ Save for later"}
      </button>
      <Toast message={toast.message} show={toast.show} />
    </>
  );
}
