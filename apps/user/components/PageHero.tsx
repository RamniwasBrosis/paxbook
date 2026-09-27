import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

/**
 * Design 2 inner-page hero: warm cream band, navy headline, handwritten eyebrow. When the page
 * has a photo it stands in an arch on the right instead of sitting behind the text.
 */
export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  actions,
  imageUrl,
}: {
  breadcrumbs: Array<{ label: string; href?: string }>;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  imageUrl?: string | null;
}) {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className={`shell relative grid items-center gap-10 py-12 sm:py-16 ${imageUrl ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
        <div className="fade-up">
          <Breadcrumbs items={breadcrumbs} dark={false} />
          {eyebrow ? <p className="script-eyebrow mt-5 text-[1.7rem] sm:text-3xl">{eyebrow}</p> : null}
          <h1 className={`font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-deep sm:text-5xl ${eyebrow ? "mt-2" : "mt-5"}`}>
            {title}
          </h1>
          {subtitle ? <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">{subtitle}</p> : null}
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {imageUrl ? (
          <div className="relative hidden justify-center lg:flex">
            <svg viewBox="0 0 400 340" className="absolute -left-4 top-6 h-[85%] w-auto opacity-60" aria-hidden="true">
              <path d="M 10 320 C 80 180, 160 120, 250 110 S 380 60, 395 10" fill="none" stroke="#1b3f8f" strokeWidth="2" strokeDasharray="7 8" />
              <circle cx="10" cy="320" r="6" fill="#f5b73d" />
            </svg>
            <div className="arch relative h-80 w-72 overflow-hidden rounded-b-3xl border-[7px] border-white shadow-float">
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
