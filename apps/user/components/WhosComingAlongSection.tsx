import Link from "next/link";
import { Heart, Users, PartyPopper, Users2, Briefcase, User, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

export interface PersonaConfig {
  label: string;
  tagline: string;
  category: string;
  imageUrl: string | null;
}

export interface TravelerTypeConfig {
  label: string;
  category: string;
  color?: string;
}

// Ring + underline colour per CMS colour name (traveler_types block).
const RING: Record<string, { ring: string; bar: string; soft: string; ink: string }> = {
  rose: { ring: "border-rose-500", bar: "bg-rose-500", soft: "bg-rose-50", ink: "text-rose-600" },
  emerald: { ring: "border-teal-500", bar: "bg-teal-500", soft: "bg-teal-50", ink: "text-teal-600" },
  amber: { ring: "border-amber-500", bar: "bg-amber-500", soft: "bg-amber-50", ink: "text-amber-600" },
  blue: { ring: "border-blue-500", bar: "bg-blue-500", soft: "bg-blue-50", ink: "text-blue-600" },
  violet: { ring: "border-violet-500", bar: "bg-violet-500", soft: "bg-violet-50", ink: "text-violet-600" },
};
const RING_CYCLE = ["rose", "emerald", "amber", "blue", "violet"];

const ICONS: Record<string, LucideIcon> = {
  Couple: Heart,
  Family: Users,
  Friends: PartyPopper,
  Group: Users2,
  Corporate: Briefcase,
  Solo: User,
};

// "Couples" persona ↔ "Couple" traveller type: match on the category, not the display label.
function norm(s: string) {
  return s.toLowerCase().replace(/s$/, "");
}

/**
 * Design 2 "Are you a?" row: round photo frames with a coloured ring per traveller type.
 * Types (labels, order, colours) come from the CMS `traveler_types` block; photos come from the
 * `who_coming_along` personas with the same category. A type with no photo shows its icon.
 */
export function WhosComingAlongSection({ personas, travelerTypes }: { personas?: PersonaConfig[]; travelerTypes?: TravelerTypeConfig[] }) {
  const photoByCategory = new Map((personas ?? []).filter((p) => p.imageUrl).map((p) => [norm(p.category), p.imageUrl as string]));

  const items =
    travelerTypes && travelerTypes.length > 0
      ? travelerTypes.map((t, i) => ({ label: t.label, category: t.category, color: t.color ?? RING_CYCLE[i % RING_CYCLE.length] ?? "blue", imageUrl: photoByCategory.get(norm(t.category)) ?? null }))
      : (personas ?? []).map((p, i) => ({ label: p.label, category: p.category, color: RING_CYCLE[i % RING_CYCLE.length] ?? "blue", imageUrl: p.imageUrl }));

  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="shell">
        <SectionHeading title="Are you a?" align="center" />
        <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
          {items.map((item) => {
            const c = RING[item.color] ?? RING.blue!;
            const Icon = ICONS[item.label] ?? ICONS[item.category] ?? Users;
            return (
              <Link
                key={item.label}
                href={`/destinations?category=${encodeURIComponent(item.category)}`}
                className="group flex w-36 shrink-0 flex-col items-center gap-4 sm:w-auto"
              >
                <span
                  className={`block aspect-[5/6] w-full max-w-[13rem] rounded-full border-4 p-1.5 shadow-card transition-transform duration-300 group-hover:-translate-y-1.5 ${c.ring}`}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={`${item.label} travellers`} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className={`grid h-full w-full place-items-center rounded-full ${c.soft}`}>
                      <Icon className={`h-12 w-12 ${c.ink}`} strokeWidth={1.5} />
                    </span>
                  )}
                </span>
                <span className="font-display text-base font-extrabold uppercase tracking-[0.14em] text-navy-deep sm:text-lg">{item.label}</span>
                <span aria-hidden="true" className={`-mt-2 h-1 w-11 rounded-full ${c.bar}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
