"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Matches the reference site's header: transparent over the homepage hero image,
 * turning solid navy once the user scrolls past it (or immediately on any other
 * route, since only the homepage has a full-bleed dark hero behind the header).
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(!isHome);

  React.useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    setScrolled(window.scrollY > 40);
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 w-full transition-colors duration-300 ${
        scrolled ? "bg-brand shadow-sm" : "border-b border-transparent bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
