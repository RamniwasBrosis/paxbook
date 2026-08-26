"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function NotificationMarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleClick() {
    setBusy(true);
    await fetch(`/api/customer/notifications/${id}/read`, { method: "PATCH" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
    >
      {busy ? "…" : "Mark read"}
    </button>
  );
}
