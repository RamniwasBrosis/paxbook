import { Plane, Hotel, Car, Ticket } from "lucide-react";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { key: "Flights", icon: Plane },
  { key: "Hotels", icon: Hotel },
  { key: "Transfers", icon: Car },
  { key: "Activities", icon: Ticket },
] as const;

export function Inclusions({ inclusions, className }: { inclusions: string[]; className?: string }) {
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
