"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { Modal } from "@/components/Modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

function getTenantSlugFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)pb_tenant_slug=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function CallbackForm() {
  const [form, setForm] = React.useState({ name: "", phone: "" });
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const slug = getTenantSlugFromCookie();
      const res = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(slug ? { "X-Tenant-Slug": slug } : {}) },
        body: JSON.stringify({ name: form.name, phone: form.phone, source: "Callback Request" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-700">
        Got it! A Paxbook travel expert will call you back shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        required
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <input
        required
        type="tel"
        placeholder="Mobile number"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className="rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      {status === "error" ? <p className="text-sm text-red-600">Something went wrong — please try again.</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-navy-deep shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Request a callback"}
      </button>
    </form>
  );
}

export function CallbackRequestButton({ className }: { className: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Phone className="h-4 w-4" strokeWidth={2} />
        Request a Callback
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Request a callback" subtitle="Leave your number — a travel expert calls you back, usually within the hour.">
        <CallbackForm />
      </Modal>
    </>
  );
}
