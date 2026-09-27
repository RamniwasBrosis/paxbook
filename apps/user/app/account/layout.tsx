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
    <div className="bg-cream/60">
      <div className="shell grid grid-cols-1 gap-8 py-10 print:block print:gap-0 print:p-0 lg:grid-cols-[240px_1fr]">
        <aside className="flex h-fit flex-row gap-1 overflow-x-auto rounded-3xl border border-slate-100 bg-white p-2.5 shadow-soft print:hidden lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-3.5 py-3 text-sm font-semibold text-navy-deep transition-colors hover:bg-cream hover:text-brand-blue"
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
