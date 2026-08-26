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

function iconFor(name: string | undefined): LucideIcon {
  if (!name) return Sparkles;
  return ICONS[name] ?? Sparkles;
}

export function WhyChooseBlock({ configJson, stats }: { configJson: Record<string, unknown>; stats?: PublicStatsDto }) {
  const eyebrow = typeof configJson.eyebrow === "string" ? configJson.eyebrow : undefined;
  const title = typeof configJson.title === "string" ? configJson.title : "Why Choose Us?";
  const items = Array.isArray(configJson.items) ? (configJson.items as WhyChooseItem[]) : [];

  if (items.length === 0) return null;

  return (
    <section className="bg-navy-deep py-16 lg:py-20">
      <div className="shell">
        <div className="mb-10">
          {eyebrow ? (
            <div className="mb-3 flex items-center gap-2">
              <span className="h-0.5 w-8 rounded-full bg-accent" />
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
            </div>
          ) : null}
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Handpicked stays, honest fares, and a dedicated expert with you from booking to boarding pass.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = iconFor(item.icon);
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-accent/60"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-lg text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/60">{item.description}</p>
              </div>
            );
          })}
        </div>

        {stats?.averageRating ? (
          <div className="mx-auto mt-10 flex w-fit items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white">
            <Star className="h-4 w-4 text-accent" strokeWidth={0} fill="currentColor" />
            {stats.averageRating}/5 <span className="font-normal text-white/60">· {stats.reviewCount}+ reviews</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
