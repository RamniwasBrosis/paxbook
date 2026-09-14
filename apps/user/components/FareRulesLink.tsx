"use client";

import * as React from "react";
import { FileText, Loader2 } from "lucide-react";
import type { FareRulesDto } from "@paxbook/types";
import { Modal } from "@/components/Modal";
import { getClientTenantHeader } from "@/lib/flights";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/**
 * Strips the obviously dangerous bits (script/style blocks, inline event handlers, javascript: URIs)
 * from real airline-provided HTML before it's rendered. This is real, provider-sourced content (not
 * user input) so the risk is low, but it's still third-party HTML — never render it unsanitized.
 */
function sanitizeProviderHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");
}

function formatWindowBound(value: number, type: 0 | 1): string {
  const unit = type === 1 ? "day" : "hour";
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

/** A "View cancellation & fare rules" link that fetches the real terms lazily (only when opened) and
 * shows them in a modal — the structured, computable cancellation schedule when the fare has one, the
 * provider's own descriptive HTML otherwise, or a plain "not available" message. Never fabricates a
 * number here — this is the raw real terms, not the ₹ estimate shown at cancel time. */
export function FareRulesLink({ flightId }: { flightId: string }) {
  const [open, setOpen] = React.useState(false);
  const [rules, setRules] = React.useState<FareRulesDto | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleOpen() {
    setOpen(true);
    if (rules || loading) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/public/flights/fare-rules?flightID=${encodeURIComponent(flightId)}`, {
      headers: { ...getClientTenantHeader() },
    })
      .then(async (res) => {
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Could not load fare rules.");
        setRules(json.data as FareRulesDto);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load fare rules."))
      .finally(() => setLoading(false));
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand hover:underline"
      >
        <FileText className="h-3 w-3" strokeWidth={2} /> View cancellation &amp; fare rules
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Cancellation & fare rules" subtitle="The airline's own terms for this fare, as quoted by the provider." maxWidth="max-w-lg">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading real fare rules…
          </div>
        ) : error ? (
          <p className="py-6 text-sm text-red-600">{error}</p>
        ) : rules ? (
          <div className="max-h-[60vh] overflow-y-auto text-sm text-slate-700">
            {rules.kind === "structured" && rules.cancellation.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Cancellation charges</p>
                <div className="flex flex-col gap-2">
                  {rules.cancellation.map((w, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 p-2.5 text-xs">
                      <p className="font-semibold text-navy-deep">
                        {w.journeySegment} · {formatWindowBound(w.start, w.startType)} to {formatWindowBound(w.end, w.endType)} before departure
                      </p>
                      <p className="mt-0.5 text-slate-600">
                        {w.remarks || (w.amountType === 1 ? `${w.amount}% cancellation fee` : `₹${w.amount.toLocaleString("en-IN")} cancellation fee`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : rules.kind === "html" ? (
              // eslint-disable-next-line react/no-danger
              <div dangerouslySetInnerHTML={{ __html: sanitizeProviderHtml(rules.html) }} />
            ) : (
              <p className="text-slate-500">This fare&apos;s cancellation terms weren&apos;t published by the airline for this flight.</p>
            )}
            {rules.genRemarks ? (
              // eslint-disable-next-line react/no-danger
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500" dangerouslySetInnerHTML={{ __html: sanitizeProviderHtml(rules.genRemarks) }} />
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
