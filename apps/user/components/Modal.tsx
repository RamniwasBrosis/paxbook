"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Rendered through a portal on <body>: a modal opened from inside a card used to get trapped in it,
 * because the card's hover transform makes `position: fixed` relative to the card instead of the
 * screen (the fare-rules popup showed clipped, with its close button cut off). The header with the
 * close button never scrolls away; only the body scrolls.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-3xl`}>
        <div className="shrink-0 bg-navy-deep px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="font-display text-xl font-bold text-white">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-sm text-white/75">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
