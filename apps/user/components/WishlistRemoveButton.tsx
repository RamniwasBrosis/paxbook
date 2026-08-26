"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function WishlistRemoveButton({ packageId }: { packageId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleRemove() {
    setBusy(true);
    await fetch(`/api/customer/wishlist/${packageId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={busy}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-60"
    >
      {busy ? "Removing…" : "Remove"}
    </button>
  );
}
