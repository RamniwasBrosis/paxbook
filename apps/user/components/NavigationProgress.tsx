"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";

/**
 * Feedback the moment a link is clicked: a thin bar across the top of the screen and, if the page
 * takes longer than a blink, a small "Loading" pill with a flying plane. Ends when the new URL is
 * rendered. Programmatic navigations can start it with `startNavigationProgress()`.
 */
let startExternally: (() => void) | null = null;
export function startNavigationProgress() {
  startExternally?.();
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = React.useState(false);
  const [showPill, setShowPill] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  const start = React.useCallback(() => {
    setActive(true);
    setWidth(12);
  }, []);

  React.useEffect(() => {
    startExternally = start;
    return () => {
      startExternally = null;
    };
  }, [start]);

  // Any same-site link click that goes to a different page starts the bar.
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Creep towards the end while waiting; show the pill only for slower pages.
  React.useEffect(() => {
    if (!active) return;
    const creep = setInterval(() => setWidth((w) => (w < 88 ? w + (90 - w) * 0.08 : w)), 200);
    const pill = setTimeout(() => setShowPill(true), 450);
    const giveUp = setTimeout(() => setActive(false), 20000);
    return () => {
      clearInterval(creep);
      clearTimeout(pill);
      clearTimeout(giveUp);
    };
  }, [active]);

  // The new page is on screen: finish the bar and fade out.
  React.useEffect(() => {
    if (!active) return;
    setWidth(100);
    const t = setTimeout(() => {
      setActive(false);
      setShowPill(false);
      setWidth(0);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]">
        <div
          className="h-full bg-gradient-to-r from-accent via-brand-blue to-violet-600 shadow-[0_0_10px_rgba(27,63,143,0.6)] transition-[width,opacity] duration-200 ease-out"
          style={{ width: `${width}%`, opacity: active ? 1 : 0 }}
        />
      </div>
      {active && showPill ? (
        <div role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-24 z-[200] -translate-x-1/2">
          <div className="flex items-center gap-2.5 rounded-full bg-navy-deep px-4 py-2 text-sm font-bold text-white shadow-float">
            <span className="relative block h-5 w-9 overflow-hidden">
              <Plane className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-fly text-accent" strokeWidth={2.25} />
            </span>
            Loading…
          </div>
        </div>
      ) : null}
    </>
  );
}
