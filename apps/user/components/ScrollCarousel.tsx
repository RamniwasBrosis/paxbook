"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollCarousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div ref={trackRef} className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition-colors hover:border-brand hover:text-brand sm:flex"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition-colors hover:border-brand hover:text-brand sm:flex"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}
