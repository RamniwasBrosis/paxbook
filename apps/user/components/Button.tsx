import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  brand: "bg-brand text-white hover:bg-brand-dark",
  gold: "bg-accent text-navy-deep hover:bg-accent-dark",
  blue: "bg-brand-blue text-white hover:brightness-110",
  outline: "border border-slate-300 bg-white text-navy-deep hover:border-brand hover:text-brand",
  glass: "border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  ghost: "text-navy-deep hover:bg-mist",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button({ variant = "brand", size = "md", className, ...props }: ButtonAsButton | ButtonAsLink) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    const Comp: ElementType = href.startsWith("/") ? Link : "a";
    return <Comp href={href} className={classes} {...rest} />;
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}
