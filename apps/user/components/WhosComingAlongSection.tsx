import Link from "next/link";
import { ArrowRight, Heart, Users, PartyPopper, Users2, Briefcase, User, type LucideIcon } from "lucide-react";
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

// Accent per CMS colour name (traveler_types block): icon chip, hover ring and underline.
const RING: Record<string, { chip: string; ring: string; bar: string; glow: string }> = {
  rose: { chip: "bg-rose-500", ring: "group-hover:ring-rose-400", bar: "bg-rose-400", glow: "from-rose-900/85" },
  emerald: { chip: "bg-teal-500", ring: "group-hover:ring-teal-400", bar: "bg-teal-400", glow: "from-teal-900/85" },
  amber: { chip: "bg-amber-500", ring: "group-hover:ring-amber-400", bar: "bg-amber-400", glow: "from-amber-900/85" },
  blue: { chip: "bg-blue-500", ring: "group-hover:ring-blue-400", bar: "bg-blue-400", glow: "from-blue-950/85" },
  violet: { chip: "bg-violet-500", ring: "group-hover:ring-violet-400", bar: "bg-violet-400", glow: "from-violet-950/85" },
};
const RING_CYCLE = ["rose", "emerald", "amber", "blue", "violet"];

// Used when the CMS has no photo or tagline for a type, so every card looks finished.
const FALLBACK_PHOTO: Record<string, string> = { group: "/personas/group.jpg", corporate: "/personas/corporate.jpg" };
const FALLBACK_TAGLINE: Record<string, string> = {
  couple: "Romantic, unhurried",
  family: "Kid-friendly pacing",
  friend: "Nightlife & activities",
  group: "Fun trips, one easy plan",
  corporate: "Offsites, MICE & incentives",
  solo: "Safe, guided, flexible",
};

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
 * "Are you a?" row: tall photo cards with a coloured icon chip, tagline and "Explore trips" per
 * traveller type. Types (labels, order, colours) come from the CMS `traveler_types` block; photos and
 * taglines from the `who_coming_along` personas with the same category, with built-in fallbacks.
 */
export function WhosComingAlongSection({ personas, travelerTypes }: { personas?: PersonaConfig[]; travelerTypes?: TravelerTypeConfig[] }) {
  const photoByCategory = new Map((personas ?? []).filter((p) => p.imageUrl).map((p) => [norm(p.category), p.imageUrl as string]));
  const taglineByCategory = new Map((personas ?? []).filter((p) => p.tagline).map((p) => [norm(p.category), p.tagline]));

  const items =
    travelerTypes && travelerTypes.length > 0
      ? travelerTypes.map((t, i) => ({ label: t.label, category: t.category, color: t.color ?? RING_CYCLE[i % RING_CYCLE.length] ?? "blue", imageUrl: photoByCategory.get(norm(t.category)) ?? null }))
      : (personas ?? []).map((p, i) => ({ label: p.label, category: p.category, color: RING_CYCLE[i % RING_CYCLE.length] ?? "blue", imageUrl: p.imageUrl }));

  if (items.length === 0) return null;
  const cards = items.map((item) => {
    const key = norm(item.category);
    return { ...item, imageUrl: item.imageUrl ?? FALLBACK_PHOTO[key] ?? null, tagline: taglineByCategory.get(key) ?? FALLBACK_TAGLINE[key] ?? "" };
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-mist to-white py-16 lg:py-20">
      <div className="shell">
        <SectionHeading eyebrow="Travel your way" title="Are you a?" subtitle="Pick who's travelling and we'll show trips planned just for you." align="center" />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {cards.map((item) => {
            const c = RING[item.color] ?? RING.blue!;
            const Icon = ICONS[item.label] ?? ICONS[item.category] ?? Users;
            return (
              <Link
                key={item.label}
                href={`/destinations?category=${encodeURIComponent(item.category)}`}
                className={`group block aspect-[3/4] w-52 shrink-0 snap-start rounded-[1.9rem] border border-slate-200 bg-white p-2 shadow-card ring-4 ring-transparent transition-all duration-300 hover:-translate-y-2 hover:shadow-float sm:w-auto ${c.ring}`}
              >
                {/* The white frame (p-2) keeps the photo inset from the card edge on every side. */}
                <span className="relative block h-full w-full overflow-hidden rounded-[1.4rem] bg-navy-deep">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : null}
                  <span aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t ${c.glow} via-black/10 to-transparent`} />
                  <span className={`absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl text-white shadow-lg ${c.chip}`}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex flex-col p-4 text-white">
                    <span className="font-display text-lg font-extrabold uppercase tracking-[0.1em] sm:text-xl">{item.label}</span>
                    <span aria-hidden="true" className={`mt-2 h-1 w-10 rounded-full transition-all duration-300 group-hover:w-16 ${c.bar}`} />
                    {item.tagline ? <span className="mt-2 text-sm text-white/85">{item.tagline}</span> : null}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                      Explore trips <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
