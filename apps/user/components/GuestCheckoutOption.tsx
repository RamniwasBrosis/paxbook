"use client";

import { UserRound } from "lucide-react";

/** "Continue as guest" under the login form in the booking modal: pay now without an account. */
export function GuestCheckoutOption({ email, onContinue }: { email: string; onContinue: () => void }) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={onContinue}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-navy-deep text-base font-extrabold text-navy-deep transition-colors hover:bg-navy-deep hover:text-white"
      >
        <UserRound className="h-5 w-5" strokeWidth={2.25} />
        Continue as guest
      </button>
      <p className="mt-2 text-center text-xs leading-relaxed text-ink-muted">
        No account needed. Your e-ticket goes to {email ? <strong className="text-navy-deep">{email}</strong> : "your email"}. To manage the booking later, log in with that
        email or mobile.
      </p>
    </div>
  );
}
