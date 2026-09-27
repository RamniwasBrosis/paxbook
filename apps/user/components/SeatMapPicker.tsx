"use client";

import * as React from "react";
import { Armchair } from "lucide-react";
import type { FlightSeatLookupResultDto, FlightSeatMapDto, FlightSeatOptionDto } from "@paxbook/types";

export interface SeatMapPassenger {
  index: number;
  label: string;
  pType: "A" | "C";
}

/** A shared cabin grid, not independent per-passenger lists (unlike baggage/meal) — two passengers
 * can never hold the same seat, so this owns its own "which passenger am I assigning" state and lets
 * the caller (FlightBookingWizard) just persist whatever gets assigned. Infants are excluded before
 * this component ever sees them — FTD doesn't offer them a seat. */
export function SeatMapPicker({
  segments,
  passengers,
  assigned,
  onAssign,
}: {
  segments: FlightSeatMapDto[];
  passengers: SeatMapPassenger[];
  /** passengerIndex -> currently assigned seatID for this direction */
  assigned: Record<number, string | undefined>;
  onAssign: (passengerIndex: number, seatId: string | undefined) => void;
}) {
  const [activePassenger, setActivePassenger] = React.useState<number>(passengers[0]?.index ?? 0);

  const seatToPassenger = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const [idxStr, seatId] of Object.entries(assigned)) {
      if (seatId) map.set(seatId, Number(idxStr));
    }
    return map;
  }, [assigned]);

  function pickNextUnassigned(fromIndex: number): number {
    const order = passengers.map((p) => p.index);
    const start = order.indexOf(fromIndex);
    for (let step = 1; step <= order.length; step++) {
      const candidate = order[(start + step) % order.length];
      if (candidate !== undefined && !assigned[candidate]) return candidate;
    }
    return fromIndex;
  }

  function handleSeatClick(seat: FlightSeatOptionDto) {
    if (!seat.isBooked) return; // taken
    const holder = seatToPassenger.get(seat.seatID);
    if (holder !== undefined && holder !== activePassenger) return; // someone else already has it
    const activePType = passengers.find((p) => p.index === activePassenger)?.pType;
    if (activePType && !seatEligible(seat, activePType)) return;

    if (holder === activePassenger) {
      onAssign(activePassenger, undefined); // toggle off
      return;
    }
    onAssign(activePassenger, seat.seatID);
    setActivePassenger(pickNextUnassigned(activePassenger));
  }

  return (
    <div>
      {passengers.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {passengers.map((p) => (
            <button
              key={p.index}
              type="button"
              onClick={() => setActivePassenger(p.index)}
              aria-pressed={activePassenger === p.index}
              className={`h-10 rounded-full border-2 px-4 text-sm font-bold transition-colors ${
                activePassenger === p.index ? "border-navy-deep bg-navy-deep text-white" : "border-slate-200 text-navy-deep hover:border-brand-blue"
              }`}
            >
              {p.label}
              {assigned[p.index] ? ` · ${assigned[p.index]}` : ""}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {segments.map((segment, segIdx) => (
          <div key={segIdx}>
            {segments.length > 1 ? <p className="mb-2 font-display text-sm font-bold text-navy-deep">Flight segment {segIdx + 1}</p> : null}
            <SeatGrid seats={segment.seatMap} seatToPassenger={seatToPassenger} activePassenger={activePassenger} activePType={passengers.find((p) => p.index === activePassenger)?.pType} onSeatClick={handleSeatClick} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-ink-muted">
        <Legend swatchClass="border-green-500 bg-green-50" label="Available" />
        <Legend swatchClass="border-navy-deep bg-navy-deep" label="Selected" />
        <Legend swatchClass="border-slate-200 bg-slate-100" label="Taken / not for this passenger" />
      </div>
    </div>
  );
}

function seatEligible(seat: FlightSeatOptionDto, pType: "A" | "C"): boolean {
  if (seat.paxType === "All") return true;
  return (seat.paxType === "Adult" && pType === "A") || (seat.paxType === "Child" && pType === "C");
}

function Legend({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-5 w-5 rounded-t-lg rounded-b border-2 ${swatchClass}`} />
      {label}
    </span>
  );
}

function SeatGrid({
  seats,
  seatToPassenger,
  activePassenger,
  activePType,
  onSeatClick,
}: {
  seats: FlightSeatOptionDto[];
  seatToPassenger: Map<string, number>;
  activePassenger: number;
  activePType: "A" | "C" | undefined;
  onSeatClick: (seat: FlightSeatOptionDto) => void;
}) {
  const rows = React.useMemo(() => {
    const byRow = new Map<number, FlightSeatOptionDto[]>();
    for (const s of seats) {
      const list = byRow.get(s.row) ?? [];
      list.push(s);
      byRow.set(s.row, list);
    }
    for (const list of byRow.values()) list.sort((a, b) => a.col.localeCompare(b.col));
    return Array.from(byRow.entries()).sort((a, b) => a[0] - b[0]);
  }, [seats]);

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">No seat map available for this flight.</p>;
  }

  // Column letters from the widest row, with an aisle gap wherever FTD marks one.
  const header = rows.reduce<FlightSeatOptionDto[]>((widest, [, r]) => (r.length > widest.length ? r : widest), []);
  const wingRow = Math.max(1, Math.round(rows.length * 0.4));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative mx-auto w-fit px-1 sm:px-24">
        {/* Nose + cockpit windows */}
        <svg viewBox="0 0 200 120" preserveAspectRatio="none" className="block h-28 w-full" aria-hidden="true">
          <path d="M2 120 C2 55 55 4 100 4 C145 4 198 55 198 120 Z" fill="#f4f7fd" stroke="#dbe3f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d="M64 58 L84 50 L86 64 L66 70 Z M88 49 L99 47 L99 62 L90 63 Z M101 47 L112 49 L110 63 L101 62 Z M116 50 L136 58 L134 70 L114 64 Z" fill="#1b3f8f" opacity="0.85" />
        </svg>

        <div className="relative -mt-px border-x-2 border-[#dbe3f1] bg-mist/60 px-2 pb-6 pt-1 sm:px-5">
          <p className="mb-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.25em] text-ink-muted">Front</p>

          {/* column letters */}
          <div className="mb-2 flex items-center gap-1 sm:gap-2" aria-hidden="true">
            <span className="hidden w-3 sm:block" />
            <span className="w-5 sm:w-6" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              {header.map((seat) => (
                <React.Fragment key={seat.seatID}>
                  <span className="w-8 text-center text-xs font-extrabold text-ink-muted sm:w-10">{seat.seatName.replace(/^\d+/, "") || seat.col}</span>
                  {seat.isAisle ? <span className="w-3 sm:w-5" /> : null}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
      {rows.map(([row, seatsInRow], rowIdx) => (
        <div key={row} className="relative flex items-center gap-1 sm:gap-2">
          {rowIdx === wingRow ? (
            <>
              <svg viewBox="0 0 120 110" className="pointer-events-none absolute right-full top-0 mr-6 hidden h-28 w-28 sm:block" aria-hidden="true">
                <path d="M120 10 L120 60 L8 104 L0 96 Z" fill="#e8eefb" stroke="#dbe3f1" strokeWidth="2" />
              </svg>
              <svg viewBox="0 0 120 110" className="pointer-events-none absolute left-full top-0 ml-6 hidden h-28 w-28 -scale-x-100 sm:block" aria-hidden="true">
                <path d="M120 10 L120 60 L8 104 L0 96 Z" fill="#e8eefb" stroke="#dbe3f1" strokeWidth="2" />
              </svg>
            </>
          ) : null}
          <span aria-hidden="true" className="hidden h-3 w-3 shrink-0 rounded-full bg-sky-200/80 ring-1 ring-sky-300 sm:block" />
          <span className="w-5 shrink-0 text-right text-xs font-bold text-ink-muted sm:w-6">{row}</span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {seatsInRow.map((seat) => {
              const holder = seatToPassenger.get(seat.seatID);
              const isSelected = holder === activePassenger;
              const isHeldByOther = holder !== undefined && !isSelected;
              const eligible = activePType ? seatEligible(seat, activePType) : true;
              const disabled = !seat.isBooked || isHeldByOther || !eligible;
              return (
                <React.Fragment key={seat.seatID}>
                  <button
                    type="button"
                    title={`${seat.seatName} · ₹${seat.seatAmt.toLocaleString("en-IN")}`}
                    aria-label={`Seat ${seat.seatName}${disabled ? ", unavailable" : `, ₹${seat.seatAmt.toLocaleString("en-IN")}`}`}
                    aria-pressed={isSelected}
                    disabled={disabled}
                    onClick={() => onSeatClick(seat)}
                    className={`flex h-8 w-8 items-center justify-center rounded-t-lg rounded-b-md border-2 text-[10px] font-extrabold transition-colors sm:h-10 sm:w-10 sm:rounded-t-xl ${
                      isSelected
                        ? "border-navy-deep bg-navy-deep text-accent"
                        : disabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                          : "border-green-500 bg-green-50 text-green-800 hover:bg-green-100"
                    }`}
                  >
                    {isSelected || !disabled ? seat.seatName.replace(/^\d+/, "") || <Armchair className="h-4 w-4" strokeWidth={2} /> : <Armchair className="h-4 w-4" strokeWidth={2} />}
                  </button>
                  {seat.isAisle ? <span className="w-3 sm:w-5" /> : null}
                </React.Fragment>
              );
            })}
          </div>
          <span aria-hidden="true" className="hidden h-3 w-3 shrink-0 rounded-full bg-sky-200/80 ring-1 ring-sky-300 sm:block" />
        </div>
      ))}
          </div>
        </div>

        {/* Tail */}
        <svg viewBox="0 0 200 110" preserveAspectRatio="none" className="-mt-px block h-24 w-full" aria-hidden="true">
          <path d="M2 0 L198 0 C198 40 130 96 100 106 C70 96 2 40 2 0 Z" fill="#f4f7fd" stroke="#dbe3f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d="M70 60 L130 60 L100 104 Z" fill="#e8eefb" />
        </svg>
      </div>
    </div>
  );
}
