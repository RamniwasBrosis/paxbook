"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export async function postAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json?.error?.message ?? (res.status === 429 ? "Too many tries. Please wait a minute." : "Something went wrong."));
  return json.data as T;
}

export const AUTH_INPUT =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-navy-deep outline-none placeholder:text-ink-muted focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";
export const AUTH_PRIMARY =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-4 text-base font-extrabold text-navy-deep shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-60";

export function AuthField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export interface CaptchaValue {
  captchaId: string;
  captchaAnswer: string;
}

/**
 * The security code box. Each code works once, so the parent bumps `reloadKey` after every attempt
 * to fetch a fresh one.
 */
export function CaptchaField({ reloadKey, onChange }: { reloadKey: number; onChange: (v: CaptchaValue) => void }) {
  const [image, setImage] = React.useState<string | null>(null);
  const [captchaId, setCaptchaId] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setError(false);
    setAnswer("");
    fetch("/api/auth/captcha", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error();
        setImage(j.data.image);
        setCaptchaId(j.data.captchaId);
        onChange({ captchaId: j.data.captchaId, captchaAnswer: "" });
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(load, [load, reloadKey]);

  return (
    <AuthField label="Security code" required>
      <div className="flex items-center gap-2">
        <span className="grid h-12 w-[9.5rem] shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-mist">
          {image ? <img src={image} alt="Security code: type the characters shown" className="h-full w-full object-contain" /> : <span className="text-xs text-ink-muted">{error ? "Couldn't load" : "Loading…"}</span>}
        </span>
        <button type="button" onClick={load} aria-label="Show a new security code" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-brand-blue hover:bg-mist">
          <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
        </button>
        <input
          required
          value={answer}
          onChange={(e) => {
            const v = e.target.value.toUpperCase();
            setAnswer(v);
            onChange({ captchaId, captchaAnswer: v });
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={8}
          placeholder="Type the code"
          aria-label="Security code"
          className={`${AUTH_INPUT} min-w-0 uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal`}
        />
      </div>
    </AuthField>
  );
}

export function TermsCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-ink-muted">
      <input type="checkbox" required checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue" />
      <span>
        I agree to Paxbook&apos;s{" "}
        <Link href="/pages/terms-and-conditions" target="_blank" className="font-semibold text-brand-blue hover:underline">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link href="/pages/privacy-policy" target="_blank" className="font-semibold text-brand-blue hover:underline">
          Privacy Policy
        </Link>
        .<span className="ml-0.5 text-red-600" aria-hidden="true">*</span>
      </span>
    </label>
  );
}

/** A 6-digit code input with a "Resend code" link that counts down until resending is allowed. */
export function OtpCodeField({
  label,
  sentTo,
  value,
  onChange,
  resendAvailableAt,
  onResend,
  devOtp,
}: {
  label: string;
  sentTo: string;
  value: string;
  onChange: (v: string) => void;
  resendAvailableAt: string | null;
  onResend: () => Promise<void>;
  devOtp?: string | null;
}) {
  const [now, setNow] = React.useState(() => Date.now());
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const wait = resendAvailableAt ? Math.max(0, Math.ceil((new Date(resendAvailableAt).getTime() - now) / 1000)) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <AuthField label={label} required>
        <input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit code"
          className={`${AUTH_INPUT} text-center font-mono text-lg tracking-[0.5em] placeholder:font-sans placeholder:text-base placeholder:tracking-normal`}
        />
      </AuthField>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <span>
          Sent to <strong className="text-navy-deep">{sentTo}</strong>
        </span>
        {wait > 0 ? (
          <span>Resend code in {wait}s</span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onResend();
              } finally {
                setBusy(false);
              }
            }}
            className="font-bold text-brand-blue hover:underline disabled:opacity-50"
          >
            {busy ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>
      {devOtp && typeof window !== "undefined" && window.location.hostname === "localhost" ? <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800">Test server only, code: <span className="font-mono font-bold">{devOtp}</span></p> : null}
    </div>
  );
}
