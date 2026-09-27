import Link from "next/link";
import { Phone, Sparkles, Menu } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";
import { readSession } from "@/lib/session";
import { DestinationsMegaMenu } from "../DestinationsMegaMenu";
import { MobileNavMenu } from "../MobileNavMenu";
import { HeaderShell } from "../HeaderShell";
import { HeaderActions } from "../HeaderActions";

const NAV_LINKS = [
  { href: "/packages", label: "Holidays" },
  { href: "/flights", label: "Flights" },
  { href: "/visa-guide", label: "Visa Guide" },
  { href: "/blog", label: "Blog" },
];

const NAV_LINK_CLASS =
  "whitespace-nowrap rounded-full px-3 py-2 text-[0.95rem] font-semibold text-navy-deep transition-colors hover:text-brand-blue";

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
    <HeaderShell variant="light">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 w-auto lg:h-14" />
          ) : (
            <span className="font-display text-xl font-extrabold tracking-tight text-navy-deep">{siteName}</span>
          )}
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          <Link href="/packages" className={NAV_LINK_CLASS}>
            Holidays
          </Link>
          <DestinationsMegaMenu destinations={destinations} triggerClassName={NAV_LINK_CLASS} label="Destinations" />
          {NAV_LINKS.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className={NAV_LINK_CLASS}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/ai-planner"
            className="ml-1 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-violet-50 px-3.5 py-2 text-sm font-bold text-violet-700 transition-colors hover:bg-violet-100"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            AI Planner
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+917300047077"
            className="hidden items-center gap-2.5 text-[0.95rem] font-bold text-navy-deep transition-colors hover:text-brand-blue xl:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/20">
              <Phone className="h-4 w-4 text-accent-ink" strokeWidth={2.25} />
            </span>
            7300047077
          </a>
          <HeaderActions
            destinations={destinations}
            session={session ? { name: session.customer.name } : null}
            planTripButtonClassName="hidden h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark sm:inline-flex"
            loginButtonClassName="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-navy-deep transition-colors hover:border-brand-blue hover:text-brand-blue"
            googleEnabled={googleEnabled}
          />
          <MobileNavMenu
            destinations={destinations}
            navLinks={[...NAV_LINKS, { href: "/ai-planner", label: "AI Planner" }]}
            session={session ? { name: session.customer.name } : null}
          >
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-navy-deep hover:bg-mist lg:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>
          </MobileNavMenu>
        </div>
      </div>
    </HeaderShell>
  );
}
