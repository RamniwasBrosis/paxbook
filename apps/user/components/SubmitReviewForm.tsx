"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function SubmitReviewForm({ packageId }: { packageId: string }) {
  const router = useRouter();
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  if (done) {
    return <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Thanks! Your review is awaiting moderation.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, rating, title: title || undefined, comment }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "Could not submit your review.");
      }
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-5">
      <p className="font-semibold text-slate-900">Share your experience</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-accent" : "text-slate-200"}`}>
            ★
          </button>
        ))}
      </div>
      <input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <textarea
        required
        rows={3}
        placeholder="Tell other travelers about your trip…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={busy} className="self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
