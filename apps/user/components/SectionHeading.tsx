import { cn } from "@/lib/cn";

/**
 * Design 2 section title: handwritten gold eyebrow, heavy Sora headline, optional gradient
 * `highlight` (a word or phrase inside `title`, e.g. "Days?"), optional centred layout with the
 * two-tone rule underneath. `tone="dark"` is for titles sitting on navy bands.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  highlight,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  const centered = align === "center";
  const idx = highlight ? title.indexOf(highlight) : -1;

  return (
    <div className={cn("mb-10", centered && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? <p className={cn("script-eyebrow mb-2 text-[1.7rem] sm:text-3xl", tone === "dark" && "!text-accent")}>{eyebrow}</p> : null}
      <h2
        className={cn(
          "font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]",
          tone === "dark" ? "text-white" : "text-navy-deep",
        )}
      >
        {idx >= 0 ? (
          <>
            {title.slice(0, idx)}
            <span className="text-gradient">{highlight}</span>
            {title.slice(idx + highlight!.length)}
          </>
        ) : (
          title
        )}
      </h2>
      {centered ? <span aria-hidden="true" className="title-rule mt-4" /> : null}
      {subtitle ? (
        <p className={cn("mt-3 max-w-2xl text-base sm:text-lg", centered && "mx-auto", tone === "dark" ? "text-white/75" : "text-ink-muted")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
