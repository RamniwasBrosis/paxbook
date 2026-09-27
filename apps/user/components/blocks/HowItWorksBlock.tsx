import { SectionHeading } from "@/components/SectionHeading";

interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

const STEP_TINTS = ["bg-blue-50", "bg-green-50", "bg-orange-50", "bg-violet-50"];

export function HowItWorksBlock({ configJson }: { configJson: Record<string, unknown> }) {
  const eyebrow = typeof configJson.eyebrow === "string" ? configJson.eyebrow : undefined;
  const title = typeof configJson.title === "string" ? configJson.title : "How it works";
  const steps = Array.isArray(configJson.steps) ? (configJson.steps as HowItWorksStep[]) : [];

  if (steps.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="shell">
        <SectionHeading eyebrow={eyebrow} title={title} align="center" />
        <ol className={`grid grid-cols-1 gap-5 ${steps.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          {steps.map((s, i) => (
            <li key={s.step} className={`relative flex flex-col gap-3 rounded-3xl p-6 ${STEP_TINTS[i % STEP_TINTS.length]}`}>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-deep font-display text-2xl font-extrabold text-white">{s.step}</span>
              <h3 className="font-display text-lg font-bold text-navy-deep">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
