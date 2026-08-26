import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, Car, ChevronRight, MapPin, Plane, Star, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { inr, type Destination, type Package } from "@/data/paxbook";
import { useSiteUI } from "@/components/site/site-ui";

export function SectionHead({
  eyebrow,
  title,
  text,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end ${
        align === "center" ? "text-center sm:flex-col sm:items-center" : "sm:justify-between"
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-3xl leading-tight sm:text-[2.35rem]">{title}</h2>
        {text && <p className="mt-3 text-[0.98rem] text-muted-foreground">{text}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Stars({ rating = 5, className = "" }: { rating?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < Math.round(rating) ? "fill-gold text-gold" : "text-border"}`}
        />
      ))}
    </span>
  );
}

export function Breadcrumbs({ trail }: { trail: { label: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {trail.map((t, i) => (
        <span key={t.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3" />}
          {t.to ? (
            <Link to={t.to as never} params={(t.params ?? {}) as never} className="hover:text-brand-blue">
              {t.label}
            </Link>
          ) : (
            <span className="font-semibold text-foreground">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function DestinationCard({ d, className = "" }: { d: Destination; className?: string }) {
  return (
    <article className={`flat-card group flex flex-col overflow-hidden ${className}`}>
      <Link
        to="/destinations/$slug"
        params={{ slug: d.slug }}
        className="relative block overflow-hidden rounded-t-[1.15rem]"
      >
        <div className="aspect-4/3 overflow-hidden">
          <img
            src={d.image}
            alt={`${d.name}, ${d.country}`}
            loading="lazy"
            width={1024}
            height={768}
            className="img-zoom size-full object-cover"
          />
        </div>
        <div className="overlay-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold">
            <MapPin className="size-3" /> {d.country}
          </div>
          <h3 className="on-dark mt-0.5 text-xl">{d.name}</h3>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-xs text-muted-foreground">{d.blurb}</p>
        <div className="dashed-rule mt-3 flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Starting from</p>
            <p className="text-lg font-bold text-primary">{inr(d.fromPrice)}</p>
          </div>
          <Link
            to="/destinations/$slug"
            params={{ slug: d.slug }}
            className="inline-flex items-center gap-1 rounded-full border border-brand-blue px-3.5 py-2 text-xs font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-primary-foreground"
          >
            {d.packages} trips <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

const inclusionIcons = [
  { key: "flight", label: "Flights", Icon: Plane },
  { key: "hotel", label: "Hotels", Icon: BedDouble },
  { key: "transfer", label: "Transfers", Icon: Car },
  { key: "tour", label: "Activities", Icon: Ticket },
] as const;

export function Inclusions({ p, className = "" }: { p: Package; className?: string }) {
  const blob = [...p.inclusions, p.flights ?? ""].join(" ").toLowerCase();
  const match = (key: string) =>
    key === "hotel"
      ? /hotel|stay|resort|villa|night/.test(blob)
      : key === "transfer"
        ? /transfer|cab|car|coach|speedboat/.test(blob)
        : key === "tour"
          ? /tour|activit|experience|entrance|cruise|safari|snorkel|ski/.test(blob)
          : /flight|air/.test(blob);

  return (
    <ul className={`flex flex-wrap items-center gap-x-3.5 gap-y-2 ${className}`}>
      {inclusionIcons.map(({ key, label, Icon }) => {
        const on = match(key);
        return (
          <li
            key={key}
            className={`flex items-center gap-1.5 text-[0.72rem] font-semibold ${
              on ? "text-foreground/75" : "text-muted-foreground/45 line-through"
            }`}
          >
            <Icon className={`size-3.5 ${on ? "text-brand-blue" : ""}`} /> {label}
          </li>
        );
      })}
    </ul>
  );
}

export function PackageCard({ p, layout = "grid" }: { p: Package; layout?: "grid" | "row" }) {
  const { openPlanner } = useSiteUI();
  const image = packageImage(p);

  if (layout === "row") {
    return (
      <article className="flat-card overflow-hidden sm:grid sm:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="relative aspect-16/10 overflow-hidden sm:aspect-auto sm:h-full">
          <img
            src={image}
            alt={p.title}
            loading="lazy"
            width={1024}
            height={768}
            className="img-zoom size-full object-cover"
          />
          <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[0.7rem] font-bold text-primary shadow-card">
            {p.nights}N / {p.days}D
          </span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-brand-blue-soft px-2.5 py-1 font-semibold text-brand-blue">
              {p.hotelCategory} hotels
            </span>
            <span className="flex items-center gap-1">
              <Stars rating={p.rating} /> {p.rating} ({p.reviews})
            </span>
          </div>
          <div>
            <h3 className="text-xl leading-snug">
              <Link to="/packages/$slug" params={{ slug: p.slug }} className="hover:text-brand-blue">
                {p.title}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 text-gold-deep" /> {p.destination}
            </p>
          </div>
          <Inclusions p={p} className="dashed-rule pt-3" />
          <div className="dashed-rule mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-primary">{inr(p.fromPrice)}</p>
              <p className="text-[0.7rem] text-muted-foreground">per person · demo pricing</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => openPlanner(p.destination)}>
                Customise
              </Button>
              <Button variant="gold" className="rounded-full" asChild>
                <Link to="/packages/$slug" params={{ slug: p.slug }}>
                  View trip
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flat-card group flex w-[19rem] flex-col overflow-hidden sm:w-full">
      <Link to="/packages/$slug" params={{ slug: p.slug }} className="relative block overflow-hidden">
        <div className="aspect-16/11 overflow-hidden">
          <img
            src={image}
            alt={p.title}
            loading="lazy"
            width={1024}
            height={768}
            className="img-zoom size-full object-cover"
          />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[0.7rem] font-bold text-primary shadow-card">
          {p.nights}N / {p.days}D
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.7rem] font-bold text-navy-deep">
          {p.styles[0]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[1.05rem] font-bold leading-snug">
          <Link to="/packages/$slug" params={{ slug: p.slug }} className="hover:text-brand-blue">
            {p.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-gold-deep" /> {p.destination}
        </p>
        <Inclusions p={p} className="dashed-rule mt-3 pt-3" />
        <div className="dashed-rule mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">Starting from</p>
            <p className="text-xl font-bold text-primary">{inr(p.fromPrice)}</p>
          </div>
          <Button variant="gold" size="sm" className="rounded-full" onClick={() => openPlanner(p.destination)}>
            Customise
          </Button>
        </div>
      </div>
    </article>
  );
}

import { destinationBySlug } from "@/data/paxbook";
export function packageImage(p: Package) {
  return destinationBySlug(p.destinationSlug)?.image ?? "";
}

export function Rail({ children, label }: { children: React.ReactNode; label?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div ref={ref} className="rail" aria-label={label}>
        {children}
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="icon" aria-label="Scroll left" onClick={() => scroll(-1)}>
          <ArrowRight className="rotate-180" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Scroll right" onClick={() => scroll(1)}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export function PageHero({
  title,
  text,
  image,
  trail,
  children,
}: {
  title: string;
  text?: string;
  image: string;
  trail?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={image} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
      <div className="hero-scrim absolute inset-0" />
      <div className="shell relative py-14 sm:py-20">
        {trail && <div className="on-dark-muted mb-4 [&_a:hover]:text-gold [&_span]:!text-inherit">{trail}</div>}
        <h1 className="on-dark max-w-3xl text-4xl leading-[1.06] sm:text-5xl">{title}</h1>
        {text && <p className="on-dark-muted mt-4 max-w-2xl text-[1.02rem]">{text}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
