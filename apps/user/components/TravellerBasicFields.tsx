"use client";

import * as React from "react";

const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Mstr"];
export const FIELD_INPUT =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

export function FieldLabel({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

interface BasicPassenger {
  title: string;
  fName: string;
  lName: string;
  gender: "M" | "F";
  dobIso: string;
}

/**
 * Name, gender and date of birth for one traveller, laid out in labelled columns like MakeMyTrip.
 * The first-name field takes first and middle names together, as on the ID.
 */
export function TravellerBasicFields({
  index,
  passenger,
  dobOptional,
  onChange,
}: {
  index: number;
  passenger: BasicPassenger;
  dobOptional: boolean;
  onChange: (patch: Partial<BasicPassenger>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[7.5rem_1fr_1fr]">
        <FieldLabel label="Title">
          <select value={passenger.title} onChange={(e) => onChange({ title: e.target.value })} className={FIELD_INPUT}>
            {TITLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="First & Middle Name">
          <input required placeholder="First & Middle Name" autoComplete="given-name" value={passenger.fName} onChange={(e) => onChange({ fName: e.target.value })} className={FIELD_INPUT} />
        </FieldLabel>
        <FieldLabel label="Last Name">
          <input required placeholder="Last Name" autoComplete="family-name" value={passenger.lName} onChange={(e) => onChange({ lName: e.target.value })} className={FIELD_INPUT} />
        </FieldLabel>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <span id={`gender-${index}`} className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Gender
          </span>
          <div role="radiogroup" aria-labelledby={`gender-${index}`} className="inline-flex h-12 w-fit overflow-hidden rounded-xl border border-slate-200">
            {(["M", "F"] as const).map((g) => (
              <label
                key={g}
                className="flex cursor-pointer items-center px-6 text-sm font-extrabold uppercase tracking-wide text-ink-muted transition-colors first:border-r first:border-slate-200 has-[:checked]:bg-navy-deep has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-brand-blue"
              >
                <input type="radio" name={`gender-${index}`} value={g} checked={passenger.gender === g} onChange={() => onChange({ gender: g })} className="sr-only" />
                {g === "M" ? "Male" : "Female"}
              </label>
            ))}
          </div>
        </div>
        <FieldLabel label={`Date of Birth${dobOptional ? " (optional)" : ""}`} className="sm:w-72">
          <input required={!dobOptional} type="date" value={passenger.dobIso} onChange={(e) => onChange({ dobIso: e.target.value })} className={FIELD_INPUT} />
        </FieldLabel>
      </div>
    </div>
  );
}
