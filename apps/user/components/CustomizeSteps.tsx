import { Check } from "lucide-react";

export const CUSTOMIZE_STEPS = ["Destination", "Travellers", "Interests", "Duration", "Departure City", "Departure Date"] as const;
export type CustomizeStepName = (typeof CUSTOMIZE_STEPS)[number];

export function CustomizeSteps<T extends string>({ steps, current }: { steps: readonly T[]; current: T }) {
  const currentIndex = steps.indexOf(current);

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur lg:top-20">
      <ol className="shell no-scrollbar flex items-center gap-2 overflow-x-auto py-3">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <li key={step} className="flex shrink-0 items-center gap-2">
              {i > 0 ? <span aria-hidden="true" className={`h-0.5 w-5 rounded-full ${isDone || isActive ? "bg-navy-deep" : "bg-slate-200"}`} /> : null}
              <span
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-bold sm:text-sm ${
                  isActive ? "bg-accent text-navy-deep" : isDone ? "bg-navy-deep text-white" : "bg-mist text-ink-muted"
                }`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[0.7rem] ${
                    isActive ? "bg-navy-deep text-white" : isDone ? "bg-white/20 text-white" : "bg-white text-ink-muted"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
