"use client";

import { usePathname } from "next/navigation";

/**
 * The header is `fixed`, so content needs top padding equal to its height. Only the modern
 * template floats a transparent header over a full-bleed homepage hero (`overlayOnHome`); the
 * classic template's header is solid white everywhere, so its homepage gets the offset too.
 */
export function MainWithHeaderOffset({ children, overlayOnHome = false }: { children: React.ReactNode; overlayOnHome?: boolean }) {
  const pathname = usePathname();
  const noOffset = overlayOnHome && pathname === "/";

  return <main className={noOffset ? "flex-1 print:pt-0" : "flex-1 pt-16 lg:pt-[5rem] print:pt-0"}>{children}</main>;
}
