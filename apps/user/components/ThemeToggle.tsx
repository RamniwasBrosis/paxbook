"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme";


/** Sun/moon switch between the dark (default) and light theme; the choice is remembered per browser. */
export function ThemeToggle({ className }: { className?: string }) {
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
      /* private mode: the switch still works for this visit */
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className={className}>
      {theme === "dark" ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
    </button>
  );
}
