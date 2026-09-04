"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plane, ArrowLeftRight, Calendar, Users, Loader2 } from "lucide-react";
import { CABIN_LABELS, FARE_TYPE_LABELS, searchContextToQuery, toYyyymmdd } from "@/lib/flights";

const TODAY = new Date().toISOString().slice(0, 10);

export function FlightSearchForm({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [tripType, setTripType] = React.useState<0 | 1>(0);
  const [serType, setServType] = React.useState<1 | 2>(1);
  const [depCity, setDepCity] = React.useState("DEL");
  const [arrCity, setArrCity] = React.useState("BOM");
  const [onDate, setOnDate] = React.useState("");
  const [reDate, setReDate] = React.useState("");
  const [adt, setAdt] = React.useState(1);
  const [chd, setChd] = React.useState(0);
  const [inf, setInf] = React.useState(0);
  const [cabin, setCabin] = React.useState("E");
  const [fareType, setFareType] = React.useState("A");
  const [paxOpen, setPaxOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function swapCities() {
    setDepCity(arrCity);
    setArrCity(depCity);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[A-Za-z]{3}$/.test(depCity) || !/^[A-Za-z]{3}$/.test(arrCity)) {
      setError("Enter valid 3-letter airport codes, e.g. DEL, BOM.");
      return;
    }
    if (!onDate) {
      setError("Choose a departure date.");
      return;
    }
    if (tripType === 1 && !reDate) {
      setError("Choose a return date for a round trip.");
      return;
    }
    setBusy(true);
    const query = searchContextToQuery({
      tripType,
      serType,
      depCity: depCity.toUpperCase(),
      arrCity: arrCity.toUpperCase(),
      onDate: toYyyymmdd(onDate),
      reDate: tripType === 1 ? toYyyymmdd(reDate) : undefined,
      adt,
      chd,
      inf,
      cabin,
      fareType,
    });
    router.push(`/flights/results?${query}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`flat-card ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={tripType === 0} onChange={() => setTripType(0)} className="accent-brand" />
            One way
          </label>
          <label className={`flex items-center gap-1.5 ${serType === 1 ? "opacity-40" : ""}`}>
            <input type="radio" checked={tripType === 1} disabled={serType === 1} onChange={() => setTripType(1)} className="accent-brand" />
            Round trip
          </label>
        </div>
        <span aria-hidden className="hidden h-4 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={serType === 1}
              onChange={() => {
                setServType(1);
                if (tripType === 1) setTripType(0);
              }}
              className="accent-brand"
            />
            Domestic
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={serType === 2} onChange={() => setServType(2)} className="accent-brand" />
            International
          </label>
        </div>
      </div>
      {serType === 1 ? <p className="mt-1 text-xs text-slate-400">Round trip booking for domestic routes is coming soon — search and book your return as a separate one-way trip for now.</p> : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label className="rounded-xl border border-slate-200 px-4 py-2.5">
          <span className="block text-[11px] font-semibold uppercase text-slate-400">From</span>
          <input
            value={depCity}
            onChange={(e) => setDepCity(e.target.value.toUpperCase())}
            maxLength={3}
            placeholder="DEL"
            className="w-full text-lg font-bold uppercase text-navy-deep outline-none"
          />
        </label>
        <button
          type="button"
          onClick={swapCities}
          aria-label="Swap cities"
          className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-slate-200 text-slate-500 hover:border-brand hover:text-brand"
        >
          <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
        </button>
        <label className="rounded-xl border border-slate-200 px-4 py-2.5">
          <span className="block text-[11px] font-semibold uppercase text-slate-400">To</span>
          <input
            value={arrCity}
            onChange={(e) => setArrCity(e.target.value.toUpperCase())}
            maxLength={3}
            placeholder="BOM"
            className="w-full text-lg font-bold uppercase text-navy-deep outline-none"
          />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="rounded-xl border border-slate-200 px-4 py-2.5">
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
            <Calendar className="h-3 w-3" strokeWidth={2.5} /> Depart
          </span>
          <input type="date" min={TODAY} required value={onDate} onChange={(e) => setOnDate(e.target.value)} className="w-full font-semibold text-navy-deep outline-none" />
        </label>
        {tripType === 1 ? (
          <label className="rounded-xl border border-slate-200 px-4 py-2.5">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
              <Calendar className="h-3 w-3" strokeWidth={2.5} /> Return
            </span>
            <input type="date" min={onDate || TODAY} required value={reDate} onChange={(e) => setReDate(e.target.value)} className="w-full font-semibold text-navy-deep outline-none" />
          </label>
        ) : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setPaxOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-left"
          >
            <span>
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
                <Users className="h-3 w-3" strokeWidth={2.5} /> Travellers &amp; class
              </span>
              <span className="block font-semibold text-navy-deep">
                {adt + chd + inf} traveller{adt + chd + inf > 1 ? "s" : ""} · {CABIN_LABELS[cabin]}
              </span>
            </span>
          </button>
          {paxOpen ? (
            <div className="absolute z-20 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
              <PaxCounter label="Adults" sub="12+ yrs" value={adt} min={1} max={9} onChange={setAdt} />
              <PaxCounter label="Children" sub="2-11 yrs" value={chd} min={0} max={9} onChange={setChd} />
              <PaxCounter label="Infants" sub="Under 2 yrs" value={inf} min={0} max={4} onChange={setInf} />
              <div className="mt-3 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Cabin class</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {Object.entries(CABIN_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCabin(value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${cabin === value ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => setPaxOpen(false)} className="mt-3 w-full rounded-full bg-brand py-2 text-sm font-bold text-white">
                Done
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase text-slate-400">Fare type</span>
        {Object.entries(FARE_TYPE_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFareType(value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${fareType === value ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plane className="h-5 w-5" strokeWidth={2.5} />}
        Search flights
      </button>
    </form>
  );
}

function PaxCounter({
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <p className="text-sm font-semibold text-navy-deep">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
