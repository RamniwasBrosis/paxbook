import { Check } from "lucide-react";

/** The overall one-way booking journey, shown on the results and fare pages before the wizard takes over. */
export const FLIGHT_JOURNEY_STEPS = ["Search", "Select flight", "Choose fare", "Traveller details", "Review & pay"];

/** Numbered-circle step indicator shared by the one-way and round-trip booking wizards, so both
 * always render the identical stepper even though the wizards themselves are separate components. */
export function FlightStepper({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <ol className="no-scrollbar mb-5 flex items-center gap-2 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft">
      {steps.map((label, idx) => {
        const done = idx < activeIndex;
        const active = idx === activeIndex;
        return (
          <li key={label} className="flex shrink-0 items-center gap-2">
            {idx > 0 ? <span aria-hidden="true" className={`h-0.5 w-4 rounded-full sm:w-8 ${done || active ? "bg-navy-deep" : "bg-slate-200"}`} /> : null}
            <span
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-4 text-sm font-bold ${
                active ? "bg-accent text-navy-deep" : done ? "bg-navy-deep text-white" : "text-ink-muted"
              }`}
            >
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${active ? "bg-navy-deep text-white" : done ? "bg-white/20" : "bg-mist"}`}>
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
