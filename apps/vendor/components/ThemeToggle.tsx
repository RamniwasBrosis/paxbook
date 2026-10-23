"use client";

import * as React from "react";
import { THEME_KEY } from "@/lib/theme";

/** Sun/moon switch between the dark (default) and light theme; remembered per browser. */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    if (next === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode: still switches for this visit */
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "Light theme" : "Dark theme";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${label.toLowerCase()}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        )}
      </svg>
      {label}
    </button>
  );
}
