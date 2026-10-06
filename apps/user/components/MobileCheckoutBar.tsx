"use client";

import { Loader2 } from "lucide-react";

/**
 * Phones only: the total and the next-step button pinned to the bottom of the screen, so the
 * customer never has to scroll to find them. On the form step the button submits that form (by id).
 */
export function MobileCheckoutBar({
  total,
  note,
  label,
  formId,
  onClick,
  busy,
}: {
  total: number;
  note?: string;
  label: string;
  formId?: string;
  onClick?: () => void;
  busy?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(18,42,99,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <p className="font-display text-xl font-extrabold text-navy-deep">₹{total.toLocaleString("en-IN")}</p>
          <p className="truncate text-[11px] text-ink-muted">{note ?? "Total incl. taxes"}</p>
        </div>
        <button
          type={formId ? "submit" : "button"}
          form={formId}
          onClick={onClick}
          disabled={busy}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-accent px-7 text-base font-extrabold text-navy-deep shadow-sm disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {label}
        </button>
      </div>
    </div>
  );
}
