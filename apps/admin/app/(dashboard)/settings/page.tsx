import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@paxbook/ui";
import { SETTINGS_NAV_ITEMS } from "../nav-config";

export default function SettingsIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SETTINGS_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <CardHeader className="p-0">
                <CardTitle>{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2 text-sm text-slate-500">Manage {item.label.toLowerCase()}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
