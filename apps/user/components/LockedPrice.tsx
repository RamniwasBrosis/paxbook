import Link from "next/link";
import { Lock } from "lucide-react";
import { readSession } from "@/lib/session";

const SIZE_CLASSES = {
  lg: "text-2xl",
  md: "text-xl",
  sm: "text-base",
} as const;

/**
 * Server component — reads the session cookie directly, so every price call site stays a one-line swap.
 * `asLink=false` renders the blurred teaser as plain text (for use inside a card that's already one big
 * `<Link>`, where nesting another anchor would be invalid HTML) — the surrounding card's own click-through
 * still lands on a page that prompts login before showing the real number.
 */
export function LockedPrice({
  amount,
  size = "md",
  className,
  colorClassName = "text-brand",
  asLink = true,
}: {
  amount: number;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  /** Replaces (not appends to) the default `text-brand` — pass this instead of relying on class-order to win. */
  colorClassName?: string;
  asLink?: boolean;
}) {
  const session = readSession();

  if (session) {
    return <span className={`font-bold ${colorClassName} ${SIZE_CLASSES[size]} ${className ?? ""}`}>₹{amount.toLocaleString("en-IN")}</span>;
  }

  const inner = (
    <>
      <Lock className="h-[0.7em] w-[0.7em] shrink-0" strokeWidth={2.5} />
      <span className="tracking-widest blur-[3px] select-none">₹{"•".repeat(String(Math.round(amount)).length)}</span>
      {asLink ? <span className="text-xs font-semibold underline-offset-2 hover:underline">Login to view</span> : null}
    </>
  );

  if (!asLink) {
    return <span className={`inline-flex items-center gap-1.5 font-bold ${colorClassName} ${SIZE_CLASSES[size]} ${className ?? ""}`}>{inner}</span>;
  }

  return (
    <Link href="/login" className={`inline-flex items-center gap-1.5 font-bold ${colorClassName} hover:opacity-80 ${SIZE_CLASSES[size]} ${className ?? ""}`}>
      {inner}
    </Link>
  );
}
