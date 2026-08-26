import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, FileText, Home, Plane, Receipt, RotateCcw, Ticket, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSiteUI } from "@/components/site/site-ui";
import { dashboardTrips, inr } from "@/data/paxbook";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Trips Dashboard — Paxbook" },
      {
        name: "description",
        content:
          "Track upcoming trips, booking status, travel documents, payments and vouchers in one Paxbook traveller dashboard.",
      },
      { property: "og:title", content: "My Trips Dashboard — Paxbook" },
      { property: "og:description", content: "Bookings, documents, payments and vouchers in one place." },
    ],
  }),
  component: Dashboard,
});

const nav = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "trips", label: "My Trips", icon: Plane },
  { id: "bookings", label: "Booking Details", icon: Receipt },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "voucher", label: "Travel Voucher", icon: Ticket },
  { id: "cancellation", label: "Cancellation", icon: RotateCcw },
  { id: "profile", label: "Profile", icon: User },
];

function Dashboard() {
  const { demo } = useSiteUI();
  const [tab, setTab] = React.useState("dashboard");
  const upcoming = dashboardTrips[0]!;

  const statusPill = (s: string) =>
    s === "Confirmed"
      ? "bg-brand-blue-soft text-brand-blue"
      : s === "Completed"
        ? "bg-muted text-muted-foreground"
        : "bg-gold/25 text-gold-deep";

  return (
    <section className="bg-mist">
      <div className="shell grid gap-8 py-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="h-max min-w-0 rounded-3xl border bg-card p-3 shadow-card lg:sticky lg:top-24">
          <div className="flex min-w-0 items-center gap-3 px-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              AR
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Ananya R.</p>
              <p className="truncate text-xs text-muted-foreground">Paxbook traveller</p>
            </div>
          </div>
          <nav className="mt-2 space-y-1">
            {nav.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setTab(n.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  tab === n.id ? "bg-primary text-primary-foreground" : "hover:bg-mist"
                }`}
              >
                <n.icon className="size-4 shrink-0" />
                <span className="truncate">{n.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
            <div className="relative">
              <img
                src={upcoming.image}
                alt={upcoming.destination}
                width={1024}
                height={768}
                className="h-44 w-full object-cover"
              />
              <div className="overlay-scrim absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Upcoming trip</p>
                <h1 className="on-dark text-2xl">{upcoming.title}</h1>
                <p className="on-dark-muted text-sm">
                  {upcoming.destination} · {upcoming.dates}
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-4">
              {[
                ["Booking ID", upcoming.id],
                ["Travellers", `${upcoming.travellers} adults`],
                ["Status", upcoming.status],
                ["Balance", inr(upcoming.total - upcoming.paid)],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <p className="field-label">{k}</p>
                  <p className="mt-1 truncate text-sm font-bold">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 border-t p-5">
              <Button variant="gold" onClick={() => demo("Voucher download")}>
                Download voucher
              </Button>
              <Button variant="outline" onClick={() => demo("Invoice download")}>
                Download invoice
              </Button>
              <Button variant="ghost" onClick={() => demo("Pay balance")}>
                Pay balance
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl">
              {tab === "dashboard" ? "Recent bookings" : nav.find((n) => n.id === tab)?.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo records — this section connects to live bookings during development.
            </p>
            <div className="mt-4 space-y-4">
              {dashboardTrips.map((t) => (
                <article
                  key={t.id}
                  className="grid gap-4 rounded-3xl border bg-card p-4 shadow-card sm:grid-cols-[10rem_minmax(0,1fr)]"
                >
                  <img
                    src={t.image}
                    alt={t.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-32 w-full rounded-2xl object-cover sm:h-full"
                  />
                  <div className="min-w-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg">{t.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {t.destination} · {t.nights} nights · {t.dates}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusPill(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Hotel</dt>
                        <dd className="font-semibold">{t.hotel}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Flight</dt>
                        <dd className="font-semibold">{t.flight}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Paid</dt>
                        <dd className="font-semibold">
                          {inr(t.paid)} of {inr(t.total)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Booking ID</dt>
                        <dd className="font-semibold">{t.id}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => demo("Trip details")}>
                        View trip
                      </Button>
                      <Button size="sm" variant="gold" onClick={() => demo("Voucher download")}>
                        Download voucher
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
