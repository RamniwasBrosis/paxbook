"use client";

import * as React from "react";
import Link from "next/link";
import { X, Phone } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";

const EXTRA_LINKS = [
  { href: "/ai-planner", label: "AI Trip Planner" },
  { href: "/pages/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function MobileNavMenu({
  destinations,
  navLinks,
  session,
  children,
}: {
  destinations: DestinationDto[];
  navLinks: { href: string; label: string }[];
  session: { name: string } | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-deep/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-white p-6 shadow-2xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <nav className="mt-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-semibold text-slate-700 hover:bg-mist hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
              {EXTRA_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-semibold text-slate-700 hover:bg-mist hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-semibold text-slate-700 hover:bg-mist hover:text-brand"
              >
                My Account
              </Link>
            </nav>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
              <Link
                href="/packages"
                onClick={() => setOpen(false)}
                className="rounded-full bg-accent px-4 py-3 text-center text-base font-bold text-navy-deep"
              >
                Plan My Trip
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-3 text-center text-base font-semibold text-slate-700"
              >
                Talk to Expert
              </Link>
              <Link
                href={session ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="text-center text-sm font-semibold text-brand"
              >
                {session ? `Hi, ${session.name.split(" ")[0]}` : "Login / Register"}
              </Link>
              <a href="tel:+917300047077" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600">
                <Phone className="h-4 w-4" strokeWidth={2} />
                +91 73000 47077
              </a>
            </div>

            {destinations.length > 0 ? (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Popular Destinations</p>
                <div className="flex flex-col gap-1">
                  {destinations.slice(0, 6).map((d) => (
                    <Link
                      key={d.id}
                      href={`/destinations/${d.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-mist hover:text-brand"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
