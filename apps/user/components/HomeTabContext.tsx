"use client";

import * as React from "react";

export type HomeTab = "holidays" | "flights" | "visa";

const Ctx = React.createContext<{ tab: HomeTab; setTab: (t: HomeTab) => void } | null>(null);

/** Shares the homepage search tab with the sections below it, so they can react to it. */
export function HomeTabProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = React.useState<HomeTab>("holidays");
  const value = React.useMemo(() => ({ tab, setTab }), [tab]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The current tab; works without a provider too (then it is local state). */
export function useHomeTab(): [HomeTab, (t: HomeTab) => void] {
  const ctx = React.useContext(Ctx);
  const [local, setLocal] = React.useState<HomeTab>("holidays");
  return ctx ? [ctx.tab, ctx.setTab] : [local, setLocal];
}

/**
 * A homepage section that is hidden while the Flights tab is chosen: flight shoppers see only the
 * search and the flight help section; every other tab shows the whole page.
 */
export function HideOnFlightsTab({ children }: { children: React.ReactNode }) {
  const [tab] = useHomeTab();
  return tab === "flights" ? null : <>{children}</>;
}
