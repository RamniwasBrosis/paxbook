"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Scale, X } from "lucide-react";

const STORAGE_KEY = "pb_compare_packages";
const MAX_COMPARE = 3;

interface CompareItem {
  slug: string;
  title: string;
}

function readCompare(): CompareItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompareItem[]) : [];
  } catch {
    return [];
  }
}

function writeCompare(items: CompareItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pb-compare-changed"));
}

export function useCompareList() {
  const [items, setItems] = React.useState<CompareItem[]>([]);

  React.useEffect(() => {
    setItems(readCompare());
    const onChange = () => setItems(readCompare());
    window.addEventListener("pb-compare-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("pb-compare-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function toggle(item: CompareItem) {
    const current = readCompare();
    const exists = current.some((c) => c.slug === item.slug);
    const next = exists ? current.filter((c) => c.slug !== item.slug) : [...current, item].slice(0, MAX_COMPARE);
    writeCompare(next);
  }

  function isSelected(slug: string) {
    return items.some((c) => c.slug === slug);
  }

  function clear() {
    writeCompare([]);
  }

  return { items, toggle, isSelected, clear, max: MAX_COMPARE };
}

export function CompareCheckbox({ slug, title }: { slug: string; title: string }) {
  const { toggle, isSelected, items, max } = useCompareList();
  const selected = isSelected(slug);
  const disabled = !selected && items.length >= max;

  return (
    <label
      className={`flex items-center gap-1.5 text-xs font-semibold ${disabled ? "cursor-not-allowed text-slate-300" : "cursor-pointer text-slate-500 hover:text-brand"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={(e) => {
          e.stopPropagation();
          toggle({ slug, title });
        }}
        className="h-3.5 w-3.5 rounded border-slate-300 text-brand focus:ring-brand"
      />
      Compare
    </label>
  );
}

export function CompareBar() {
  const { items, toggle, clear } = useCompareList();
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[95vw] items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-lift">
      <Scale className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item) => (
          <span key={item.slug} className="flex items-center gap-1 rounded-full bg-mist-strong px-2.5 py-1 text-xs font-semibold text-brand">
            {item.title}
            <button type="button" onClick={() => toggle(item)} aria-label={`Remove ${item.title}`}>
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => router.push(`/packages/compare?slugs=${items.map((i) => i.slug).join(",")}`)}
        disabled={items.length < 2}
        className="whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-navy-deep shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Compare ({items.length})
      </button>
      <button type="button" onClick={clear} className="text-xs text-slate-400 hover:text-slate-600">
        Clear
      </button>
    </div>
  );
}
