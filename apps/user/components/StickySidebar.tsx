"use client";

import * as React from "react";

const HEADER_OFFSET = 96;
const BOTTOM_GAP = 16;

/**
 * Booking sidebar that scrolls along with the page and then stays put, without ever hiding
 * anything: when it is shorter than the screen it sticks below the header; when it is taller, its
 * sticky top goes negative, so it scrolls until its last line is visible and sticks from there.
 */
export function StickySidebar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [top, setTop] = React.useState(HEADER_OFFSET);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setTop(Math.min(HEADER_OFFSET, window.innerHeight - el.offsetHeight - BOTTOM_GAP));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} style={{ "--sidebar-top": `${top}px` } as React.CSSProperties} className={`flex min-w-0 flex-col gap-5 lg:sticky lg:top-[var(--sidebar-top)] ${className}`}>
      {children}
    </div>
  );
}
