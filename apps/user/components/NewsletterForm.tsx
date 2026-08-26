"use client";

import * as React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

function getTenantSlugFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)pb_tenant_slug=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const slug = getTenantSlugFromCookie();
      const res = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(slug ? { "X-Tenant-Slug": slug } : {}) },
        body: JSON.stringify({ name: "Newsletter Subscriber", email, message: "Subscribed via footer newsletter form." }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="mt-5 text-sm font-semibold text-accent">Thanks — we'll be in touch!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        aria-label="Email address"
        className="h-10 w-full rounded-full border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-10 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-navy-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-dark disabled:opacity-60"
      >
        Join
      </button>
    </form>
  );
}
