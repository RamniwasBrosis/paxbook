import Link from "next/link";
import { Phone, Sparkles, Menu } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { readSession } from "@/lib/session";
import { DestinationsMegaMenu } from "../DestinationsMegaMenu";
import { MobileNavMenu } from "../MobileNavMenu";
import { HeaderShell } from "../HeaderShell";
import { HeaderActions } from "../HeaderActions";

const NAV_LINKS = [
  { href: "/flights", label: "Flights" },
  { href: "/packages", label: "Holiday Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/visa-guide", label: "Visa" },
  { href: "/blog", label: "Travel Guides" },
];

export function ClassicHeader({
  siteName,
  logoUrl,
  destinations,
  googleEnabled,
}: {
  siteName: string;
  logoUrl: string | null;
  destinations: DestinationDto[];
  googleEnabled?: boolean;
}) {
  const session = readSession();

  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Link href="/" className="flex shrink-0 items-center rounded-md bg-white/95 px-2 py-1 backdrop-blur-sm">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-9 w-auto lg:h-10" />
          ) : (
            <span className="text-lg font-extrabold tracking-tight text-brand">{siteName}</span>
          )}
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <DestinationsMegaMenu
            destinations={destinations}
            triggerClassName="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-accent"
          />
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/ai-planner"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-navy-deep shadow-sm transition-transform hover:scale-105"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            AI Trip Planner
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="tel:+917300047077"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-accent 2xl:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            +91 73000 47077
          </a>
          <Link
            href="/contact"
            className="hidden items-center justify-center rounded-full border border-white/50 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 md:inline-flex"
          >
            Talk to Expert
          </Link>
          <HeaderActions
            destinations={destinations}
            session={session ? { name: session.customer.name } : null}
            planTripButtonClassName="hidden items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark sm:inline-flex"
            loginButtonClassName="hidden h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 hover:text-accent sm:inline-flex"
            googleEnabled={googleEnabled}
          />
          <MobileNavMenu
            destinations={destinations}
            navLinks={NAV_LINKS}
            session={session ? { name: session.customer.name } : null}
          >
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15 hover:text-accent lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </MobileNavMenu>
        </div>
      </div>
    </HeaderShell>
  );
}
