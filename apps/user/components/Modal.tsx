"use client";

import * as React from "react";
import { X } from "lucide-react";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} overflow-hidden rounded-3xl bg-white shadow-2xl`}>
        <div className="bg-brand px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="font-display text-xl text-white">
                {title}
              </h2>
              {subtitle ? <p className="mt-1 text-sm text-white/70">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-7 pt-6">{children}</div>
      </div>
    </div>
  );
}
