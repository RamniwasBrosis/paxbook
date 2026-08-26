import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";

import logo from "@/assets/paxbook-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/data/paxbook";
import { useSiteUI } from "@/components/site/site-ui";

export function Footer() {
  const { demo } = useSiteUI();

  return (
    <footer className="border-t bg-primary">
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-flex rounded-xl bg-background px-3 py-2">
            <img src={logo.url} alt="Paxbook" className="h-8 w-auto" />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-gold">{brand.tagline}</p>
          <p className="on-dark-muted mt-3 max-w-xs text-sm">{brand.promise}</p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Linkedin, Youtube].map((Icon, i) => (
              <button
                key={i}
                type="button"
                aria-label="Social profile"
                onClick={() => demo("Social links")}
                className="grid size-9 place-items-center rounded-full border border-white/25 text-gold transition-colors hover:bg-white/10"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        <FooterCol
          title="Explore"
          links={[
            { label: "Destinations", to: "/destinations" },
            { label: "Holiday Packages", to: "/packages" },
            { label: "Honeymoon", to: "/packages", search: { style: "Honeymoon" } },
            { label: "Family", to: "/packages", search: { style: "Family" } },
            { label: "Adventure", to: "/packages", search: { style: "Adventure" } },
            { label: "Luxury", to: "/packages", search: { style: "Luxury" } },
          ]}
        />

        <FooterCol
          title="Travel Resources"
          links={[
            { label: "Visa Guide", to: "/visa" },
            { label: "Travel Guides", to: "/blog" },
            { label: "AI Trip Planner", to: "/ai-planner" },
            { label: "FAQs", to: "/about" },
          ]}
        />

        <div>
          <h3 className="on-dark text-sm font-bold uppercase tracking-[0.16em]">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { label: "About Us", to: "/about" as const },
              { label: "Contact", to: "/contact" as const },
              { label: "My Account", to: "/dashboard" as const },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to as never} className="on-dark-muted transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 text-sm">
            <a href={`tel:${brand.phone}`} className="on-dark flex items-center gap-2 font-semibold">
              <Phone className="size-4 text-gold" /> {brand.phone}
            </a>
            <a href={`mailto:${brand.email}`} className="on-dark-muted flex items-center gap-2">
              <Mail className="size-4 text-gold" /> {brand.email}
            </a>
          </div>

          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              demo("Newsletter signup");
            }}
          >
            <Input
              type="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              className="border-white/25 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button type="submit" variant="gold">
              Join
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="shell flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="on-dark-muted">© {new Date().getFullYear()} Paxbook. All journeys reserved.</p>
          <div className="flex flex-wrap gap-4">
            {["Privacy Policy", "Terms & Conditions", "Cancellation Policy"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => demo(t)}
                className="on-dark-muted transition-colors hover:text-gold"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string; search?: Record<string, string> }[];
}) {
  return (
    <div>
      <h3 className="on-dark text-sm font-bold uppercase tracking-[0.16em]">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to as never}
              search={(l.search ?? {}) as never}
              className="on-dark-muted transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
