"use client";

import * as React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/** Browser-side — can't use next/headers here, so the tenant slug (if the ?tenant= demo cookie is set) is read straight off document.cookie. */
function getTenantSlugFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)pb_tenant_slug=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function postLead(body: unknown): Promise<void> {
  const slug = getTenantSlugFromCookie();
  const res = await fetch(`${API_BASE_URL}/public/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(slug ? { "X-Tenant-Slug": slug } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error.message);
  }
}

export function InquiryForm({ destinationInterest, compact }: { destinationInterest?: string; compact?: boolean }) {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await postLead({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        destinationInterest,
        message: form.message || undefined,
      });
      setStatus("done");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-700">
        Thanks! One of our travel consultants will reach out to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "flex flex-col gap-3" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
      <input
        required
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <input
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className={compact ? "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" : "sm:col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"}
      />
      <textarea
        placeholder="Tell us about your trip…"
        rows={3}
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        className={compact ? "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" : "sm:col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"}
      />
      {status === "error" ? <p className={compact ? "text-sm text-red-600" : "sm:col-span-2 text-sm text-red-600"}>Something went wrong — please try again.</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className={(compact ? "" : "sm:col-span-2 ") + "rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"}
      >
        {status === "submitting" ? "Sending…" : "Request a callback"}
      </button>
    </form>
  );
}
