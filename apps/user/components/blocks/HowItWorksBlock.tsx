import { SectionHeading } from "@/components/SectionHeading";

interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export function HowItWorksBlock({ configJson }: { configJson: Record<string, unknown> }) {
  const eyebrow = typeof configJson.eyebrow === "string" ? configJson.eyebrow : undefined;
  const title = typeof configJson.title === "string" ? configJson.title : "How it works";
  const steps = Array.isArray(configJson.steps) ? (configJson.steps as HowItWorksStep[]) : [];

  if (steps.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="shell">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className={`relative grid grid-cols-1 gap-10 sm:gap-8 ${steps.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-brand-blue-soft sm:block" aria-hidden="true" />
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              <span
                className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl font-display text-lg text-white shadow-md ${
                  [`bg-brand`, `bg-brand-blue`, `bg-accent`][i % 3]
                }`}
              >
                {s.step}
              </span>
              <h3 className="mt-4 font-display text-base tracking-tight text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
