"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useSession } from "@paxbook/api-client";
import { Badge, Button } from "@paxbook/ui";
import { NAV_ITEMS, SETTINGS_NAV_ITEMS, PLATFORM_NAV_ITEMS } from "./nav-config";

function NavLink({ href, label, locked }: { href: string; label: string; locked?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {label}
      {locked ? (
        <Badge tone="neutral" className="ml-2">
          soon
        </Badge>
      ) : null}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, isLoading, hasPermission, logout } = useSession();

  React.useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/login");
    }
  }, [isLoading, admin, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading your session…
      </div>
    );
  }

  if (!admin) {
    return null; // redirecting to /login
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-none flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <img src="/logo.jpg" alt="Paxbook" className="h-8 w-auto" />
          <p className="mt-2 text-xs text-slate-500">{admin.roleName}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} locked={Boolean(item.checkpoint)} />
          ))}

          <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Settings</p>
          {SETTINGS_NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}

          {admin.isPlatformOwner ? (
            <>
              <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Platform</p>
              {PLATFORM_NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </>
          ) : null}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <p className="truncate px-3 text-xs text-slate-500">{admin.email}</p>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
