"use client";

import { useAuditLog } from "@paxbook/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@paxbook/ui";

export default function AuditLogPage() {
  const auditQuery = useAuditLog(1, 25);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500">
          Every mutating admin action, recorded automatically. Opt-out per route via <code>@SkipAudit()</code>, never
          opt-in — so nothing is missed by omission.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity ({auditQuery.data?.meta.total ?? 0} total)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-2 font-medium">When</th>
                <th className="px-5 py-2 font-medium">Actor</th>
                <th className="px-5 py-2 font-medium">Action</th>
                <th className="px-5 py-2 font-medium">Entity</th>
              </tr>
            </thead>
            <tbody>
              {auditQuery.data?.data.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-50 last:border-0 align-top">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">{entry.actorName ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs">{entry.action}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {entry.entityType} · {entry.entityId}
                  </td>
                </tr>
              ))}
              {auditQuery.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : null}
              {auditQuery.data?.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                    No activity yet — creating an admin user under Settings → Admin Users will show up here.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
