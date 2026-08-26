import "./globals.css";
import Link from "next/link";
import { readSession } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = {
  title: { default: "Paxbook Vendor Portal", template: "%s | Paxbook Vendor" },
  description: "Paxbook Platform — Vendor Portal.",
};

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contracts", label: "Contracts" },
  { href: "/payments", label: "Payments" },
  { href: "/assignments", label: "Assignments" },
  { href: "/profile", label: "Profile" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = readSession();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
        {session ? (
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <Link href="/dashboard" className="text-lg font-bold text-brand">
                Paxbook <span className="font-normal text-slate-400">Vendor</span>
              </Link>
              <nav className="hidden items-center gap-6 sm:flex">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 hover:text-brand">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-slate-500 sm:inline">{session.vendor.name}</span>
                <LogoutButton />
              </div>
            </div>
            <nav className="flex gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-slate-600 hover:text-brand">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
        ) : null}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
