import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, Sparkles, User, X } from "lucide-react";

import logo from "@/assets/paxbook-logo.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { brand, destinations, travelStyles } from "@/data/paxbook";
import { useSiteUI } from "@/components/site/site-ui";

const navLinks = [
  { label: "Holiday Packages", to: "/packages" },
  { label: "Destinations", to: "/destinations" },
  { label: "Visa", to: "/visa" },
  { label: "Travel Guides", to: "/blog" },
] as const;

const highlightedNavLink = { label: "AI Trip Planner", to: "/ai-planner" } as const;

const mobileLinks = [
  ...navLinks,
  { label: "AI Trip Planner", to: "/ai-planner" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Header() {
  const { openPlanner, openAuth } = useSiteUI();
  const [open, setOpen] = React.useState(false);
  const [exploreOpen, setExploreOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = pathname === "/" && !scrolled;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/70 bg-background/90 backdrop-blur-xl"
      }`}
    >
      <div className="shell flex h-16 items-center gap-3 lg:h-[4.5rem]">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Paxbook home">
          <img
            src={logo.url}
            alt="Paxbook — Travel, Explore, Experience"
            className={`h-9 w-auto lg:h-10 ${overHero ? "rounded-md bg-white/92 px-2 py-1 backdrop-blur-sm" : ""}`}
          />
        </Link>


        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                overHero ? "text-white/90 hover:text-gold" : "text-foreground/80 hover:text-brand-blue"
              }`}
              onClick={() => setExploreOpen((v) => !v)}
            >
              Explore <ChevronDown className={`size-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen && (
              <div className="absolute left-0 top-full w-[34rem] pt-2">
                <div className="fade-up grid grid-cols-2 gap-6 rounded-2xl border bg-popover p-5 shadow-float">
                  <div>
                    <p className="eyebrow mb-2">By travel style</p>
                    <ul className="space-y-1">
                      {travelStyles.map((s) => (
                        <li key={s.id}>
                          <Link
                            to="/packages"
                            onClick={() => setExploreOpen(false)}
                            className="block rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-mist hover:text-brand-blue"
                          >
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Trending destinations</p>
                    <ul className="space-y-1">
                      {destinations.slice(0, 6).map((d) => (
                        <li key={d.slug}>
                          <Link
                            to="/destinations/$slug"
                            params={{ slug: d.slug }}
                            onClick={() => setExploreOpen(false)}
                            className="block rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-mist hover:text-brand-blue"
                          >
                            {d.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to as never}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                overHero ? "text-white/90 hover:text-gold" : "text-foreground/80 hover:text-brand-blue"
              }`}
              activeProps={{ className: overHero ? "text-gold" : "text-brand-blue" }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            to={highlightedNavLink.to as never}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold shadow-sm transition-transform hover:scale-105 ${
              overHero
                ? "bg-gold text-navy-deep hover:bg-gold-light"
                : "bg-gradient-to-r from-gold to-gold-light text-navy-deep hover:shadow-md"
            }`}
            activeProps={{ className: "ring-2 ring-gold ring-offset-2 ring-offset-background" }}
          >
            <Sparkles className="size-4" />
            {highlightedNavLink.label}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`tel:${brand.phone}`}
            className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold 2xl:flex ${
              overHero ? "text-white/90 hover:text-gold" : "text-foreground/80 hover:text-brand-blue"
            }`}
          >
            <Phone className="size-4 text-gold-deep" />
            {brand.phone}
          </a>
          <Button
            variant={overHero ? "glass" : "outline"}
            className="hidden rounded-full md:inline-flex"
            asChild
          >
            <Link to="/contact">Talk to Expert</Link>
          </Button>
          <Button variant="gold" onClick={() => openPlanner()} className="hidden rounded-full sm:inline-flex">
            Plan My Trip
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Login"
            onClick={openAuth}
            className={`hidden sm:inline-flex ${overHero ? "text-white hover:bg-white/15 hover:text-gold" : ""}`}
          >
            <User />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={`lg:hidden ${overHero ? "text-white hover:bg-white/15 hover:text-gold" : ""}`}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[19rem] p-0">
              <SheetTitle className="sr-only">Paxbook navigation</SheetTitle>
              <div className="flex items-center justify-between border-b px-5 py-4">
                <img src={logo.url} alt="Paxbook" className="h-8 w-auto" />
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X />
                </Button>
              </div>
              <nav className="flex flex-col px-3 py-3">
                {mobileLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to as never}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-mist"
                    activeProps={{ className: "bg-mist text-brand-blue" }}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-mist"
                >
                  My Account
                </Link>
              </nav>
              <div className="space-y-2 px-5 pb-6">
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    openPlanner();
                  }}
                >
                  Plan My Trip
                </Button>
                <Button variant="outline" className="w-full" asChild onClick={() => setOpen(false)}>
                  <Link to="/contact">Talk to Expert</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    openAuth();
                  }}
                >
                  Login / Register
                </Button>
                <a
                  href={`tel:${brand.phone}`}
                  className="flex items-center justify-center gap-2 pt-1 text-sm font-semibold text-brand-blue"
                >
                  <Phone className="size-4" /> {brand.phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
