import type { PublicStatsDto } from "@paxbook/types";
import { MapPin, Package, PlaneTakeoff, Star } from "lucide-react";

export function TrustStatsBar({ stats }: { stats: PublicStatsDto }) {
  const items = [
    { icon: MapPin, label: "Destinations", value: `${stats.destinationCount}+`, hue: "bg-brand" },
    { icon: Package, label: "Curated Packages", value: `${stats.packageCount}+`, hue: "bg-brand-blue" },
    { icon: PlaneTakeoff, label: "Trips Booked", value: `${stats.tripsBookedCount}+`, hue: "bg-brand" },
    {
      icon: Star,
      label: stats.reviewCount > 0 ? `${stats.reviewCount} reviews` : "Reviews",
      value: stats.averageRating ? `${stats.averageRating}/5` : "New",
      hue: "bg-accent",
    },
  ];

  return (
    <div className="relative z-10 mx-auto -mt-10 mb-6 max-w-6xl px-4 sm:-mt-14 sm:mb-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 rounded-2xl bg-white p-6 shadow-premium sm:grid-cols-4 sm:p-8">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-center sm:flex-col sm:text-center">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm sm:mb-1 ${item.hue}`}>
              <item.icon className="h-6 w-6" strokeWidth={2} />
            </span>
            <div className="text-left sm:text-center">
              <p className="font-display text-xl tracking-tight text-slate-900 sm:text-2xl">{item.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
