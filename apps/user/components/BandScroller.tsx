"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Sideways card rail for dark bands, with the heading on the left and round arrows on the right. */
export function BandScroller({ heading, children }: { heading: React.ReactNode; children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  }

  const arrow = "flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-accent hover:bg-accent hover:text-navy-deep";

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4">
        {heading}
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" aria-label="Previous packages" onClick={() => scroll(-1)} className={arrow}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="More packages" onClick={() => scroll(1)} className={arrow}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {children}
      </div>
    </>
  );
}
