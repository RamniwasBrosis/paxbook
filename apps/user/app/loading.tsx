import { Plane } from "lucide-react";

/** Shown while a page's data is being prepared on the server (any route without its own loading UI). */
export default function Loading() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 px-4" role="status" aria-live="polite">
      <div className="relative h-16 w-72 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-0 top-1/2 h-0.5 w-[200%] -translate-y-1/2 animate-runway bg-[repeating-linear-gradient(90deg,theme(colors.slate.200)_0px,theme(colors.slate.200)_16px,transparent_16px,transparent_32px)]"
        />
        <Plane aria-hidden className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-fly text-brand-blue" strokeWidth={1.75} />
      </div>
      <p className="font-display text-lg font-bold text-navy-deep">Taking you there…</p>
    </div>
  );
}
