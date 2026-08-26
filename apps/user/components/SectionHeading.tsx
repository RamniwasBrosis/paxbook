export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10">
      {eyebrow ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-0.5 w-8 rounded-full bg-accent" />
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">{eyebrow}</p>
        </div>
      ) : null}
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-deep sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-2xl text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
