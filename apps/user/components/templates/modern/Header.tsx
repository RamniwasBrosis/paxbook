import Link from "next/link";
import { User, Phone, Sparkles, Menu } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { readSession } from "@/lib/session";
import { DestinationsMegaMenu } from "../DestinationsMegaMenu";
import { MobileNavMenu } from "../MobileNavMenu";

const NAV_LINKS = [
  { href: "/flights", label: "Flights" },
  { href: "/packages", label: "Holiday Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/visa-guide", label: "Visa" },
  { href: "/blog", label: "Travel Guides" },
];

export function ModernHeader({
  siteName,
  logoUrl,
  destinations,
}: {
  siteName: string;
  logoUrl: string | null;
  destinations: DestinationDto[];
  googleEnabled?: boolean;
}) {
  const session = readSession();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-brand via-accent to-brand" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-11 w-auto" />
          ) : (
            <span className="text-lg font-bold uppercase tracking-widest text-slate-900">{siteName}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 p-1 lg:flex">
          <DestinationsMegaMenu
            destinations={destinations}
            triggerClassName="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand hover:text-white"
          />
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#ai-planner"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-navy-deep transition-transform hover:scale-105"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            AI Trip Planner
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+917300047077"
            className="hidden items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-brand xl:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            +91 73000 47077
          </a>
          <Link
            href="/packages"
            className="hidden items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-brand md:flex"
          >
            Talk to Expert
          </Link>
          <Link
            href={session ? "/account" : "/login"}
            className="hidden items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-brand sm:flex"
          >
            <User className="h-4 w-4" strokeWidth={2} />
            {session ? `Hi, ${session.customer.name.split(" ")[0]}` : "Login"}
          </Link>
          <Link
            href="/packages"
            className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-dark hover:shadow-md sm:inline-block"
          >
            Plan My Trip
          </Link>
          <MobileNavMenu
            destinations={destinations}
            navLinks={NAV_LINKS}
            session={session ? { name: session.customer.name } : null}
          >
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </MobileNavMenu>
        </div>
      </div>
    </header>
  );
}
