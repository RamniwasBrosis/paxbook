"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * `overlay` (modern template): transparent over the homepage hero image, turning solid navy once
 * the user scrolls past it (or immediately on any other route, since only the homepage has a
 * full-bleed dark hero behind the header).
 * `light` (classic template): solid white bar on every route, with a soft shadow once scrolled.
 */
export function HeaderShell({ children, variant = "overlay" }: { children: React.ReactNode; variant?: "overlay" | "light" }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(variant === "overlay" ? !isHome : false);

  React.useEffect(() => {
    if (variant === "overlay" && !isHome) {
      setScrolled(true);
      return;
    }
    setScrolled(window.scrollY > 40);
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, variant]);

  if (variant === "light") {
    return (
      <header
        className={`fixed inset-x-0 top-0 z-40 w-full border-b bg-white transition-shadow duration-300 ${
          scrolled ? "border-transparent shadow-soft" : "border-slate-200/70"
        }`}
      >
        {children}
      </header>
    );
  }

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
