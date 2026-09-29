import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getBranding } from "@/lib/branding";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.3c-.27-.04-1.2-.11-2.28-.11-2.26 0-3.8 1.38-3.8 3.9V10.5H8v3h2.42V21h3.08Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Holidays",
    links: [
      { href: "/packages", label: "All packages" },
      { href: "/destinations", label: "Destinations" },
      { href: "/packages?category=Honeymoon", label: "Honeymoon" },
      { href: "/packages?category=Family", label: "Family trips" },
      { href: "/packages?category=Adventure", label: "Adventure" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/flights", label: "Flights" },
      { href: "/visa-guide", label: "Visa Guide" },
      { href: "/blog", label: "Travel Guides" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/account", label: "My account" },
      { href: "/account/bookings", label: "My bookings" },
    ],
  },
];

export async function Footer() {
  const branding = await getBranding();
  const columns = COLUMNS.map((col) =>
    col.title === "Services" && branding.aiPlannerEnabled ? { ...col, links: [...col.links, { href: "/ai-planner", label: "AI Planner" }] } : col,
  );
  return (
    <footer className="bg-cream">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex rounded-2xl bg-white px-3.5 py-2.5 shadow-soft">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.siteName} className="h-12 w-auto" />
            ) : (
              <span className="font-display text-xl font-extrabold tracking-tight text-navy-deep">{branding.siteName}</span>
            )}
          </Link>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-muted">
            Handpicked stays, honest fares, and a dedicated expert with you from booking to boarding pass.
          </p>
          <div className="mt-5 space-y-2.5">
            <a href="tel:+917300047077" className="flex items-center gap-2.5 font-display text-xl font-extrabold text-navy-deep hover:text-brand-blue">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/25">
                <Phone className="h-4 w-4 text-accent-ink" strokeWidth={2.25} />
              </span>
              7300047077
            </a>
            <a href="mailto:planners@paxbook.in" className="flex items-center gap-2.5 text-sm font-semibold text-ink-muted hover:text-brand-blue">
              <Mail className="h-4 w-4" strokeWidth={2} />
              planners@paxbook.in
            </a>
          </div>
          <div className="mt-5 flex gap-2">
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy-deep shadow-soft transition-colors hover:bg-navy-deep hover:text-white"
            >
              <FacebookIcon />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy-deep shadow-soft transition-colors hover:bg-navy-deep hover:text-white"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-display text-base font-bold text-navy-deep">{col.title}</h3>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink-muted transition-colors hover:text-brand-blue">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="script-eyebrow text-2xl">Travel dates, not spam</p>
            <p className="mt-1 font-display text-lg font-bold text-navy-deep">Get new journeys and offers in your inbox.</p>
          </div>
          <div className="w-full sm:max-w-md [&>form]:mt-0">
            <NewsletterForm tone="light" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <div className="mt-10 flex flex-col gap-2 border-t border-[#e3dcc6] py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Paxbook. All journeys reserved.</p>
          <p>Travel · Explore · Experience</p>
        </div>
      </div>
    </footer>
  );
}
