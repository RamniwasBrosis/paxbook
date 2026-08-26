import { Check } from "lucide-react";

export const CUSTOMIZE_STEPS = ["Destination", "Travellers", "Interests", "Duration", "Departure City", "Departure Date"] as const;
export type CustomizeStepName = (typeof CUSTOMIZE_STEPS)[number];

export function CustomizeSteps<T extends string>({ steps, current }: { steps: readonly T[]; current: T }) {
  const currentIndex = steps.indexOf(current);

  return (
    <div className="sticky top-[var(--header-h,4rem)] z-30 border-b border-white/10 bg-navy-deep">
      <div className="shell no-scrollbar flex items-center gap-1 overflow-x-auto py-3 sm:gap-2">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <div key={step} className="flex shrink-0 items-center gap-1 sm:gap-2">
              {i > 0 ? <span className="text-white/20">·</span> : null}
              <span
                className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold sm:text-sm ${
                  isActive ? "text-accent" : isDone ? "text-white" : "text-white/40"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : null}
                {step}
              </span>
              {isActive ? <span className="hidden h-0.5 w-6 rounded-full bg-accent sm:block" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
