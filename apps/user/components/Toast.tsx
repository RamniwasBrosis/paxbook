"use client";

import * as React from "react";

/** Minimal, dependency-free toast: fixed at the bottom of the viewport, auto-dismisses. */
export function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="rounded-full bg-navy-deep px-5 py-2.5 text-sm font-semibold text-white shadow-premium">{message}</div>
    </div>
  );
}

/** Local hook: call show(message) to display a toast for a few seconds. */
export function useToast(durationMs = 2500) {
  const [state, setState] = React.useState<{ message: string; show: boolean }>({ message: "", show: false });
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  const show = React.useCallback(
    (message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState({ message, show: true });
      timerRef.current = setTimeout(() => setState((s) => ({ ...s, show: false })), durationMs);
    },
    [durationMs],
  );

  return { toast: state, show };
}
