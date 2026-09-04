import Link from "next/link";
import { LayoutGrid, Luggage, Plane, Heart, Bell, User } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/bookings", label: "My Trips", icon: Luggage },
  { href: "/account/flight-bookings", label: "My Flights", icon: Plane },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Profile", icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mist/60">
      <div className="shell grid grid-cols-1 gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="flat-card flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-mist hover:text-brand"
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          ))}
          <div className="mt-2 hidden border-t border-slate-100 pt-2 lg:block">
            <LogoutButton />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
