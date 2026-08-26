"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-8 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white print:hidden"
    >
      {label}
    </button>
  );
}
