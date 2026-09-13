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
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activePassenger === p.index ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600 hover:border-brand"
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
            {segments.length > 1 ? <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Flight segment {segIdx + 1}</p> : null}
            <SeatGrid seats={segment.seatMap} seatToPassenger={seatToPassenger} activePassenger={activePassenger} activePType={passengers.find((p) => p.index === activePassenger)?.pType} onSeatClick={handleSeatClick} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <Legend swatchClass="border-brand bg-brand/10" label="Available" />
        <Legend swatchClass="border-brand bg-brand text-white" label="Selected" />
        <Legend swatchClass="border-slate-200 bg-slate-100 text-slate-300" label="Taken / not for this passenger" />
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
      <span className={`inline-block h-4 w-4 rounded border ${swatchClass}`} />
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

  return (
    <div className="flex flex-col gap-1.5 overflow-x-auto pb-1">
      {rows.map(([row, seatsInRow]) => (
        <div key={row} className="flex items-center gap-1.5">
          <span className="w-6 shrink-0 text-xs text-slate-400">{row}</span>
          <div className="flex items-center gap-1.5">
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
                    disabled={disabled}
                    onClick={() => onSeatClick(seat)}
                    className={`flex h-8 w-8 items-center justify-center rounded border text-[10px] font-semibold transition-colors ${
                      isSelected
                        ? "border-brand bg-brand text-white"
                        : disabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                          : "border-brand bg-brand/10 text-brand hover:bg-brand/20"
                    }`}
                  >
                    <Armchair className="h-4 w-4" strokeWidth={2} />
                  </button>
                  {seat.isAisle ? <span className="w-3" /> : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
