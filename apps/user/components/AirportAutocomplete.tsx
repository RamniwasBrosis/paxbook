"use client";

import * as React from "react";
import { Plane } from "lucide-react";
import { searchAirports, type AirportEntry } from "@/lib/airports";

export function AirportAutocomplete({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = React.useMemo(() => searchAirports(query), [query]);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(airport: AirportEntry) {
    onChange(airport.code);
    setQuery(airport.code);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[highlight];
      if (chosen) select(chosen);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative rounded-xl border border-slate-200 px-4 py-2.5">
      <span className="block text-[11px] font-semibold uppercase text-slate-400">{label}</span>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value.toUpperCase());
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        maxLength={40}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full text-lg font-bold uppercase text-navy-deep outline-none"
      />
      {open && results.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-1.5 text-left shadow-xl">
          {results.map((a, idx) => (
            <li key={a.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(a)}
                className={`flex w-full items-center gap-2.5 px-4 py-2 text-left normal-case ${idx === highlight ? "bg-mist" : ""}`}
              >
                <Plane className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-navy-deep">
                    {a.city} <span className="text-slate-400">({a.code})</span>
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {a.name} · {a.country}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
