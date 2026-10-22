"use client";

import * as React from "react";
import { Check, Loader2, MapPin, Plane, Search } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface CityOption {
  city: string;
  country: string;
  code: string;
}

/**
 * Departure city: a search box that suggests cities from the airports table as you type (debounced
 * calls to /public/flights/cities), plus the popular cities as one-tap cards.
 */
export function CityPicker({ value, onChange, popular }: { value: string; onChange: (city: string) => void; popular: string[] }) {
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<CityOption[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  React.useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setOptions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/public/flights/cities?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const json = await res.json();
        setOptions(json.success ? json.data : []);
        setActive(0);
      } catch {
        /* aborted or offline: keep the last suggestions */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  function pick(city: string) {
    onChange(city);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(options[active]!.city);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative">
        <label className="flex h-16 items-center gap-3 rounded-2xl border-2 border-brand-blue/40 bg-white px-5 shadow-soft focus-within:border-navy-deep">
          <Search className="h-5 w-5 shrink-0 text-ink-muted" />
          <span className="sr-only">Search your city</span>
          <input
            role="combobox"
            aria-expanded={open && options.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
            placeholder="Find your city"
            className="w-full bg-transparent text-lg text-navy-deep placeholder:text-ink-muted/70 focus:outline-none"
          />
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-ink-muted" /> : null}
        </label>
        {open && query.trim().length >= 2 ? (
          <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-float">
            {options.length === 0 && !loading ? <li className="px-5 py-3 text-sm text-ink-muted">No city found. Try another spelling.</li> : null}
            {options.map((o, i) => (
              <li
                key={o.city}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o.city);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-5 py-3 ${i === active ? "bg-mist" : ""}`}
              >
                <Plane className="h-4 w-4 shrink-0 text-brand-blue" />
                <span className="flex-1">
                  <span className="block font-bold text-navy-deep">{o.city}</span>
                  <span className="block text-xs text-ink-muted">{o.country}</span>
                </span>
                <span className="rounded-md bg-mist-strong px-2 py-0.5 text-xs font-bold text-navy-deep">{o.code}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {value ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-navy-deep">
          <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} /> Flying from <span className="font-extrabold">{value}</span>
        </p>
      ) : null}

      <p className="mb-3 mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Popular cities</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {popular.map((c) => {
          const selected = value === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-pressed={selected}
              className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                selected ? "border-navy-deep bg-brand-light text-navy-deep shadow-card" : "border-sand-frame bg-white text-navy-deep shadow-soft hover:border-brand-blue/50"
              }`}
            >
              <MapPin className={`h-4 w-4 ${selected ? "text-navy-deep" : "text-accent-ink"}`} />
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
