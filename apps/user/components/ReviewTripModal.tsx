"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { FlightLegDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { AirlineLogo } from "@/components/AirlineLogo";
import { formatMinutes, journeyMinutes } from "@/lib/flights";

export interface ReviewJourney {
  label: string;
  legs: FlightLegDto[];
  fareType: string | null;
  /** The airports the customer searched for, to warn when the flight uses a different one. */
  searchedFrom: string;
  searchedTo: string;
}

export interface ReviewTraveller {
  title: string;
  fName: string;
  lName: string;
  pType: "A" | "C" | "I";
  gender: "M" | "F";
  dobIso: string;
  seats: string[];
}

const TYPE: Record<string, string> = { A: "Adult", C: "Child", I: "Infant" };

function time(iso: string) {
  const d = new Date(iso);
  return {
    t: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    d: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  };
}

function dob(iso: string): string {
  if (!iso) return "Not given";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * "Review trip details" (MakeMyTrip style) before payment: flights, travellers exactly as entered,
 * contact and the amount, so a typo in a name is caught before the ticket is issued. Payment (or the
 * login / guest choice) starts only from "Confirm & continue".
 */
export function ReviewTripModal({
  open,
  onClose,
  onConfirm,
  journeys,
  travellers,
  contact,
  total,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  journeys: ReviewJourney[];
  travellers: ReviewTraveller[];
  contact: { mobile: string; email: string };
  total: number;
  busy?: boolean;
}) {
  const counters: Record<string, number> = {};
  const differentAirport = journeys.some((j) => j.legs[0]?.depCode !== j.searchedFrom || j.legs[j.legs.length - 1]?.arrCode !== j.searchedTo);

  return (
    <Modal open={open} onClose={onClose} title="Review trip details" subtitle="Check everything before you pay." maxWidth="max-w-2xl">
      <div className="flex flex-col gap-5">
        <section aria-label="Flights" className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {journeys.map((j) => {
            const first = j.legs[0]!;
            const last = j.legs[j.legs.length - 1]!;
            const dep = time(first.depDateTime);
            const arr = time(last.arrDateTime);
            const stops = j.legs.length - 1;
            return (
              <div key={j.label} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-bold text-navy-deep">
                    <AirlineLogo code={first.airlineCode} size={26} />
                    {first.airlineName}
                    <span className="text-xs font-semibold text-ink-muted">{j.label}</span>
                  </p>
                  {j.fareType ? <span className="text-sm font-extrabold uppercase text-emerald-700">{j.fareType}</span> : null}
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="font-display text-xl font-extrabold text-navy-deep">
                      {dep.t} <span className="text-sm font-semibold text-ink-muted">{dep.d}</span>
                    </p>
                    <p className="text-sm font-semibold text-navy-deep">{first.depCode}</p>
                  </div>
                  <div className="w-24 text-center sm:w-36">
                    <p className="text-xs font-semibold text-ink-muted">{formatMinutes(journeyMinutes(j.legs))}</p>
                    <div className="my-1 border-t border-slate-300" />
                    <p className="text-xs font-semibold text-ink-muted">{stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""} · ${j.legs.slice(0, -1).map((l) => l.arrCode).join(", ")}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-extrabold text-navy-deep">
                      {arr.t} <span className="text-sm font-semibold text-ink-muted">{arr.d}</span>
                    </p>
                    <p className="text-sm font-semibold text-navy-deep">{last.arrCode}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {differentAirport ? (
          <p className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              The <strong>airport is different</strong> from the one you searched for. Please check before continuing.
            </span>
          </p>
        ) : null}

        <section aria-labelledby="review-travellers">
          <h3 id="review-travellers" className="font-display text-lg font-extrabold text-navy-deep">
            Travellers
          </h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {travellers.map((p, i) => {
              counters[p.pType] = (counters[p.pType] ?? 0) + 1;
              return (
                <dl key={i} className="rounded-2xl border border-slate-200 p-4 text-sm">
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-navy-deep">
                    {TYPE[p.pType]} {counters[p.pType]}
                  </p>
                  {[
                    ["First & Middle Name", `${p.title} ${p.fName}`],
                    ["Last Name", p.lName],
                    ["Gender", p.gender === "M" ? "Male" : "Female"],
                    ["D.O.B", dob(p.dobIso)],
                    ...(p.seats.length ? [["Seat", p.seats.join(" / ")]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 py-1">
                      <dt className="text-ink-muted">{k}</dt>
                      <dd className="text-right font-bold text-navy-deep">{v}</dd>
                    </div>
                  ))}
                </dl>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="review-contact" className="rounded-2xl border border-slate-200 p-4 text-sm">
          <h3 id="review-contact" className="mb-1 font-bold text-navy-deep">
            E-ticket and updates go to
          </h3>
          <p className="text-navy-deep">
            {contact.mobile} · {contact.email}
          </p>
        </section>

        <div className="sticky bottom-0 -mx-6 -mb-7 border-t border-slate-100 bg-white px-6 pb-6 pt-4">
          <p className="flex items-start gap-2 text-sm text-ink-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            Please check names, dates and flights carefully. Names can&apos;t be changed after the ticket is issued, and changes later may cost cancellation fees.
          </p>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={onClose} className="h-12 rounded-full px-6 text-sm font-bold text-navy-deep hover:bg-mist">
              Edit details
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="h-12 rounded-full bg-accent px-8 text-base font-extrabold text-navy-deep shadow-sm hover:bg-accent-dark disabled:opacity-60"
            >
              Confirm &amp; continue · ₹{total.toLocaleString("en-IN")}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
