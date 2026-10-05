"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plane, Palmtree, FileCheck2 } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { FlightSearchForm } from "@/components/FlightSearchForm";

const TRAVEL_STYLES = ["Honeymoon", "Family", "Adventure", "Luxury", "Budget", "Seasonal"];

type Tab = "holidays" | "flights" | "visa";

const TABS: { id: Tab; label: string; icon: typeof Plane }[] = [
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "visa", label: "Visa", icon: FileCheck2 },
];

const FIELD = "flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-brand-blue";
const SELECT = "w-full bg-transparent text-base text-navy-deep focus:outline-none";
const SUBMIT =
  "inline-flex min-h-[3.75rem] items-center justify-center gap-2 rounded-2xl bg-accent px-9 text-base font-extrabold text-navy-deep transition-colors hover:bg-accent-dark";

/**
 * The homepage search card. The tabs switch the form in place, so the hero above stays put instead
 * of jumping to the separate /flights or /visa-guide landing pages. `#flights` / `#visa` in the URL
 * open that tab directly.
 */
export function HomeSearchTabs({ destinations }: { destinations: DestinationDto[] }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("holidays");

  React.useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (fromHash === "flights" || fromHash === "visa") setTab(fromHash);
  }, []);

  const countries = React.useMemo(() => {
    const byId = new Map<string, string>();
    for (const d of destinations) if (!byId.has(d.countryId)) byId.set(d.countryId, d.countryName);
    return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [destinations]);

  function onVisaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const country = new FormData(e.currentTarget).get("country");
    router.push(country ? `/visa-guide#visa-${country}` : "/visa-guide");
  }

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-float sm:p-6">
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label="What are you looking for?">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`home-tab-${id}`}
              aria-selected={active}
              aria-controls={`home-panel-${id}`}
              onClick={() => setTab(id)}
              className={
                active
                  ? "inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-navy-deep px-3 text-sm font-bold text-white sm:gap-2 sm:px-5"
                  : "inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 px-3 text-sm sm:gap-2 sm:px-5 font-semibold text-navy-deep transition-colors hover:border-brand-blue hover:text-brand-blue"
              }
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`home-panel-${tab}`} aria-labelledby={`home-tab-${tab}`} className="mt-4">
        {tab === "holidays" ? (
          <form action="/packages" className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
            <label className={FIELD}>
              <span className="text-xs font-bold text-ink-muted">Destination</span>
              <select name="destination" defaultValue="" className={SELECT}>
                <option value="">Where do you want to go?</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={FIELD}>
              <span className="text-xs font-bold text-ink-muted">Travel style</span>
              <select name="category" defaultValue="" className={SELECT}>
                <option value="">Any style</option>
                {TRAVEL_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={SUBMIT}>
              <Search className="h-5 w-5" strokeWidth={2.5} />
              Search
            </button>
          </form>
        ) : null}

        {tab === "flights" ? <FlightSearchForm embedded /> : null}

        {tab === "visa" ? (
          <form onSubmit={onVisaSubmit} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className={FIELD}>
              <span className="text-xs font-bold text-ink-muted">Visa for</span>
              <select name="country" defaultValue="" className={SELECT}>
                <option value="">All countries</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={SUBMIT}>
              <FileCheck2 className="h-5 w-5" strokeWidth={2.5} />
              Check visa
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
