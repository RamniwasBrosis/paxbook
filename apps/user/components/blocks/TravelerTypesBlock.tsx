import Link from "next/link";
import { Heart, Users, PartyPopper, Users2, Briefcase, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

interface TravelerTypeItem {
  label: string;
  category: string;
  color?: string;
}

const COLOR_CLASSES: Record<string, string> = {
  rose: "border-accent/40 bg-accent/15 text-accent-dark hover:border-accent/60",
  emerald: "border-brand-blue/25 bg-brand-blue-soft text-brand-blue hover:border-brand-blue/50",
  amber: "border-accent/40 bg-accent/15 text-accent-dark hover:border-accent/60",
  blue: "border-brand/20 bg-mist-strong text-brand hover:border-brand/40",
  violet: "border-brand-blue/25 bg-brand-blue-soft text-brand-blue hover:border-brand-blue/50",
};
const DEFAULT_COLOR = "border-slate-200 bg-mist text-slate-700 hover:border-slate-300";

const ICONS: Record<string, LucideIcon> = {
  Couple: Heart,
  Family: Users,
  Friends: PartyPopper,
  Group: Users2,
  Corporate: Briefcase,
};

export function TravelerTypesBlock({ configJson }: { configJson: Record<string, unknown> }) {
  const title = typeof configJson.title === "string" ? configJson.title : "Are you a?";
  const items = Array.isArray(configJson.items) ? (configJson.items as TravelerTypeItem[]) : [];

  if (items.length === 0) return null;

  return (
    <section className="bg-mist py-16 lg:py-20">
      <div className="shell">
        <SectionHeading title={title} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => {
            const Icon = ICONS[item.label] ?? Users;
            return (
              <Link
                key={item.label}
                href={`/destinations?category=${encodeURIComponent(item.category)}`}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-8 text-center font-display text-lg shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${COLOR_CLASSES[item.color ?? ""] ?? DEFAULT_COLOR}`}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
