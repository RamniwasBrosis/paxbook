import { Luggage, Headphones, ShieldCheck, Handshake, Hotel, ShieldPlus, UserRound, Settings, Flag, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { PublicStatsDto } from "@paxbook/types";

interface WhyChooseItem {
  icon?: string;
  title: string;
  description: string;
}

const ICONS: Record<string, LucideIcon> = {
  luggage: Luggage,
  headphones: Headphones,
  shield: ShieldCheck,
  "shield-check": ShieldCheck,
  handshake: Handshake,
  hotel: Hotel,
  "shield-plus": ShieldPlus,
  "user-round": UserRound,
  settings: Settings,
  flag: Flag,
};

// One colour per card, cycling — soft circle behind the icon, solid underline under the title.
const PALETTE = [
  { soft: "bg-green-50", ink: "text-green-600", bar: "bg-green-600" },
  { soft: "bg-violet-50", ink: "text-violet-600", bar: "bg-violet-600" },
  { soft: "bg-emerald-50", ink: "text-emerald-700", bar: "bg-emerald-700" },
  { soft: "bg-orange-50", ink: "text-orange-600", bar: "bg-orange-500" },
  { soft: "bg-blue-50", ink: "text-blue-600", bar: "bg-blue-600" },
  { soft: "bg-purple-50", ink: "text-purple-600", bar: "bg-purple-600" },
  { soft: "bg-teal-50", ink: "text-teal-600", bar: "bg-teal-600" },
  { soft: "bg-amber-50", ink: "text-amber-600", bar: "bg-amber-500" },
  { soft: "bg-indigo-50", ink: "text-indigo-600", bar: "bg-indigo-600" },
];

function iconFor(name: string | undefined): LucideIcon {
  if (!name) return Sparkles;
  return ICONS[name] ?? Sparkles;
}

export function WhyChooseBlock({
  configJson,
  stats,
  siteName = "Us",
}: {
  configJson: Record<string, unknown>;
  stats?: PublicStatsDto;
  siteName?: string;
}) {
  const title = typeof configJson.title === "string" ? configJson.title : null;
  const items = Array.isArray(configJson.items) ? (configJson.items as WhyChooseItem[]) : [];

  if (items.length === 0) return null;

  return (
    <section className="py-20 lg:py-24">
      <div className="shell">
        <div className="mb-12 text-center">
          <h2 className="font-display font-extrabold tracking-tight text-navy-deep">
            <span className="block text-3xl sm:text-[2.75rem]">Why Choose</span>
            <span className="text-gradient mt-1 block text-5xl leading-tight sm:text-7xl">{siteName}?</span>
          </h2>
          <span aria-hidden="true" className="title-rule mt-5" />
          {title ? <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">{title}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {items.map((item, i) => {
            const Icon = iconFor(item.icon);
            const c = PALETTE[i % PALETTE.length]!;
            return (
              <div
                key={i}
                className="flex flex-col items-start gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
              >
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full sm:h-24 sm:w-24 ${c.soft}`}>
                  <Icon className={`h-7 w-7 sm:h-10 sm:w-10 ${c.ink}`} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="font-display text-[0.95rem] font-bold leading-snug text-navy-deep sm:text-xl">{item.title}</h3>
                  <span aria-hidden="true" className={`mt-2 block h-[3px] w-8 rounded-full ${c.bar}`} />
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted sm:text-sm">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {stats?.averageRating ? (
          <div className="mx-auto mt-10 flex w-fit items-center justify-center gap-2 rounded-full bg-mist px-5 py-3 text-sm font-bold text-navy-deep">
            <Star className="h-4 w-4 text-accent" strokeWidth={0} fill="currentColor" />
            {stats.averageRating}/5 <span className="font-medium text-ink-muted">· {stats.reviewCount}+ reviews</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
