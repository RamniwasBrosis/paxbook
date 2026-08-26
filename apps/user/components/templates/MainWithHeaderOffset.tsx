"use client";

import { usePathname } from "next/navigation";

/**
 * The header is `fixed` so the transparent homepage variant can float over the hero
 * image. Every other route needs top padding equal to the header's height so content
 * doesn't render underneath it — the homepage intentionally gets none.
 */
export function MainWithHeaderOffset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return <main className={isHome ? "flex-1" : "flex-1 pt-16 lg:pt-[4.5rem]"}>{children}</main>;
}
