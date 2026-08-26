import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

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

export async function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="inline-flex rounded-xl bg-white px-3 py-2">
            <span className="text-lg font-extrabold tracking-tight text-brand">
              Pax<span className="text-accent">Book</span>
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Travel | Explore | Experience</p>
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Handpicked stays, honest fares, and a dedicated expert with you from booking to boarding pass.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-accent transition-colors hover:bg-white/10"
            >
              <FacebookIcon />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-accent transition-colors hover:bg-white/10"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/destinations" className="text-white/70 transition-colors hover:text-accent">Destinations</Link></li>
            <li><Link href="/packages" className="text-white/70 transition-colors hover:text-accent">Holiday Packages</Link></li>
            <li><Link href="/packages?category=Honeymoon" className="text-white/70 transition-colors hover:text-accent">Honeymoon</Link></li>
            <li><Link href="/packages?category=Family" className="text-white/70 transition-colors hover:text-accent">Family</Link></li>
            <li><Link href="/packages?category=Adventure" className="text-white/70 transition-colors hover:text-accent">Adventure</Link></li>
            <li><Link href="/packages?category=Luxury" className="text-white/70 transition-colors hover:text-accent">Luxury</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Travel Resources</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/visa-guide" className="text-white/70 transition-colors hover:text-accent">Visa Guide</Link></li>
            <li><Link href="/blog" className="text-white/70 transition-colors hover:text-accent">Travel Guides</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/account" className="text-white/70 transition-colors hover:text-accent">My Account</Link></li>
          </ul>
          <div className="mt-5 space-y-2 text-sm">
            <a href="tel:+917300047077" className="flex items-center gap-2 font-semibold text-white">
              <Phone className="h-4 w-4" strokeWidth={2} />
              +91 73000 47077
            </a>
            <a href="mailto:planners@paxbook.in" className="flex items-center gap-2 text-white/70">
              <Mail className="h-4 w-4" strokeWidth={2} />
              planners@paxbook.in
            </a>
          </div>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Paxbook. All journeys reserved.</p>
        </div>
      </div>
    </footer>
  );
}
