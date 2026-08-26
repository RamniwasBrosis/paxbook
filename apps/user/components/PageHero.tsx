import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

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
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-brand to-navy-deep py-16 text-white sm:py-20">
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-scrim absolute inset-0" />
        </>
      ) : null}
      <div className="shell relative">
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow ? <p className="eyebrow on-dark-muted mt-4">{eyebrow}</p> : null}
        <h1 className="display-xl on-dark mt-3">{title}</h1>
        {subtitle ? <p className="on-dark-muted mt-4 max-w-xl text-sm sm:text-base">{subtitle}</p> : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
