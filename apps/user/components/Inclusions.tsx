import { Plane, Hotel, Car, Ticket } from "lucide-react";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { key: "Flights", icon: Plane, chip: "bg-blue-50 text-blue-700" },
  { key: "Hotels", icon: Hotel, chip: "bg-violet-50 text-violet-700" },
  { key: "Transfers", icon: Car, chip: "bg-orange-50 text-orange-700" },
  { key: "Activities", icon: Ticket, chip: "bg-green-50 text-green-700" },
] as const;

/**
 * `variant="chips"` (Design 2, package detail): only what's included, as coloured pills.
 * Default: compact inline row that also shows what's missing, struck through (list rows).
 */
export function Inclusions({ inclusions, className, variant = "inline" }: { inclusions: string[]; className?: string; variant?: "inline" | "chips" }) {
  if (variant === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {CATEGORIES.filter(({ key }) => inclusions.includes(key)).map(({ key, icon: Icon, chip }) => (
          <span key={key} className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold", chip)}>
            <Icon className="h-4 w-4" strokeWidth={2} />
            {key}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-3 text-xs", className)}>
      {CATEGORIES.map(({ key, icon: Icon }) => {
        const active = inclusions.includes(key);
        return (
          <span
            key={key}
            className={cn(
              "flex items-center gap-1",
              active ? "font-semibold text-slate-600" : "text-slate-300 line-through",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            {key}
          </span>
        );
      })}
    </div>
  );
}
