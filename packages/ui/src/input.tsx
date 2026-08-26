"use client";

import * as React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10.5 7 10.5 7a17.3 17.3 0 0 1-2.86 3.94M6.2 6.2C3.24 8.1 1.5 12 1.5 12s3.5 7 10.5 7a10.9 10.9 0 0 0 5.03-1.22M1 1l22 22" />
      <path d="M9.17 9.17a3 3 0 0 0 4.24 4.24" />
    </svg>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const inputId = id ?? props.name;
    const [reveal, setReveal] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && reveal ? "text" : type}
            className={clsx(
              "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors",
              "focus:border-brand focus:ring-1 focus:ring-brand",
              error ? "border-red-400" : "border-slate-300",
              isPassword ? "pr-9" : "",
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              tabIndex={-1}
              aria-label={reveal ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-400 hover:text-slate-600"
            >
              {reveal ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);
Input.displayName = "Input";
