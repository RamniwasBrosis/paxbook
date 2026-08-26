"use client";

import * as React from "react";
import { MapPin, CalendarDays, Users, Wallet, User, Phone, ArrowRight } from "lucide-react";
import type { DestinationDto } from "@paxbook/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

function getTenantSlugFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)pb_tenant_slug=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function TripPlanForm({ destinations, compact }: { destinations: DestinationDto[]; compact?: boolean }) {
  const [form, setForm] = React.useState({
    destination: "",
    travelDate: "",
    travellers: "2",
    budget: "",
    name: "",
    phone: "",
  });
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const slug = getTenantSlugFromCookie();
      const messageParts = [
        form.travelDate ? `Travel date: ${form.travelDate}` : null,
        `Travellers: ${form.travellers}`,
        form.budget ? `Budget per person: ${form.budget}` : null,
      ].filter(Boolean);
      const res = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(slug ? { "X-Tenant-Slug": slug } : {}) },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || undefined,
          destinationInterest: form.destination || undefined,
          message: messageParts.join(" · "),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-mist p-6 text-center">
        <p className="font-display text-lg text-navy-deep">Request sent!</p>
        <p className="mt-1 text-sm text-slate-500">A Paxbook expert will reach out to you shortly with your itinerary.</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex flex-col gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
      <label className="block text-sm">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
          <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
          Destination
        </span>
        <div className="relative">
          <select
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
            className={`${inputClass} pl-3 appearance-none bg-white`}
          >
            <option value="">Bali, Dubai, Maldives…</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="block text-sm">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
          Travel dates
        </span>
        <input
          type="date"
          value={form.travelDate}
          onChange={(e) => setForm((f) => ({ ...f, travelDate: e.target.value }))}
          className={`${inputClass} pl-3`}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
          <Users className="h-3.5 w-3.5" strokeWidth={2} />
          Travellers
        </span>
        <input
          type="number"
          min={1}
          value={form.travellers}
          onChange={(e) => setForm((f) => ({ ...f, travellers: e.target.value }))}
          className={`${inputClass} pl-3`}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
          <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
          Budget per person
        </span>
        <input
          placeholder="₹50,000 – ₹1,00,000"
          value={form.budget}
          onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
          className={`${inputClass} pl-3`}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
          <User className="h-3.5 w-3.5" strokeWidth={2} />
          Your name
        </span>
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={`${inputClass} pl-3`}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
          <Phone className="h-3.5 w-3.5" strokeWidth={2} />
          Mobile
        </span>
        <input
          required
          type="tel"
          placeholder="10-digit mobile"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={`${inputClass} pl-3`}
        />
      </label>

      {status === "error" ? <p className="sm:col-span-2 text-sm text-red-600">Something went wrong — please try again.</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60 sm:col-span-2"
      >
        {status === "submitting" ? "Sending…" : "Send my request"}
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </form>
  );
}
