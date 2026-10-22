import * as React from "react";
import { Check } from "lucide-react";

/**
 * One choice in the trip customizer (Pickyourtrail style): an arched card with a thumbnail photo
 * (or an illustration slot), a label and an optional note. Selected cards get the navy border, a
 * tinted fill and a check in the bottom-right corner.
 */
export function ArchOption({
  selected,
  onClick,
  label,
  note,
  imageUrl,
  art,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  note?: string;
  imageUrl?: string | null;
  /** Shown in the arch when there is no photo (icons for durations, pace...). */
  art?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex flex-col items-center overflow-hidden rounded-b-3xl rounded-t-[999px] border-2 p-2.5 pb-5 text-center transition-all duration-300 hover:-translate-y-1 ${
        selected ? "border-navy-deep bg-brand-light shadow-card" : "border-sand-frame bg-white shadow-soft hover:border-brand-blue/50"
      } ${className ?? ""}`}
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-b-2xl rounded-t-[999px] bg-mist">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="grid h-full w-full place-items-center">{art}</span>
        )}
      </span>
      <span className="mt-4 px-1 font-display text-base font-bold leading-snug text-navy-deep sm:text-lg">{label}</span>
      {note ? <span className="mt-1 px-2 text-sm leading-snug text-ink-muted">{note}</span> : null}
      {selected ? (
        <span aria-hidden="true" className="absolute bottom-0 right-0 h-12 w-12 bg-navy-deep [clip-path:polygon(100%_0,100%_100%,0_100%)]">
          <Check className="absolute bottom-1.5 right-1.5 h-4 w-4 text-white" strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}

/** Centered step layout: big question, optional hint, the options, then Back / Continue. */
export function WizardStep({
  title,
  hint,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  busy,
  submit,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  busy?: boolean;
  /** Continue submits the surrounding form instead of calling onNext. */
  submit?: boolean;
}) {
  return (
    <section>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-deep sm:text-4xl">{title}</h2>
        {hint ? <p className="mt-3 text-base font-semibold text-accent-ink">{hint}</p> : null}
      </div>
      <div className="mt-10">{children}</div>
      <div className="mt-10 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-sm font-bold text-ink-muted hover:text-navy-deep">
            ← Back
          </button>
        ) : null}
        {onNext || submit ? (
          <button
            type={submit ? "submit" : "button"}
            onClick={submit ? undefined : onNext}
            disabled={nextDisabled || busy}
            className="inline-flex h-14 min-w-[16rem] items-center justify-center gap-2 rounded-2xl bg-navy-deep px-8 text-base font-bold text-white shadow-card transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
            {nextLabel} <span aria-hidden="true">›</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

