import { Check } from "lucide-react";

/** Numbered-circle step indicator shared by the one-way and round-trip booking wizards, so both
 * always render the identical stepper even though the wizards themselves are separate components. */
export function FlightStepper({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <div className="mb-4 flex flex-wrap items-center">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="step-circle" data-state={idx < activeIndex ? "complete" : idx === activeIndex ? "active" : "pending"}>
              {idx < activeIndex ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
            </span>
            <span className={`text-sm font-semibold ${idx === activeIndex ? "text-brand" : idx < activeIndex ? "text-navy-deep" : "text-slate-400"}`}>{label}</span>
          </div>
          {idx < steps.length - 1 ? <span className="step-connector mx-3" data-complete={idx < activeIndex ? "true" : "false"} /> : null}
        </div>
      ))}
    </div>
  );
}
