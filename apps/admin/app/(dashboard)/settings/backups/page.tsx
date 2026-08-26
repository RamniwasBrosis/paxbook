"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useRunBackup } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@paxbook/ui";

export default function BackupsSettingsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.SETTINGS_READ);
  const canWrite = hasPermission(PERMISSIONS.SETTINGS_WRITE);
  const runBackup = useRunBackup();
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your role doesn&apos;t include <code>settings.read</code>.
        </p>
      </Card>
    );
  }

  async function handleRunNow() {
    setError(null);
    setResult(null);
    try {
      const res = await runBackup.mutateAsync();
      setResult(res.skipped ? `Skipped: ${res.skipped}` : `Backup saved: ${res.file}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Backup failed.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Backups</h1>
        <p className="text-sm text-slate-500">The database is backed up automatically every night. You can also trigger one on demand.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated backups</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            A full database dump runs every night at 2:00 AM server time. The last 14 dumps are kept; older ones are removed automatically.
          </p>
          {canWrite ? (
            <div>
              <Button onClick={handleRunNow} isLoading={runBackup.isPending}>
                Run backup now
              </Button>
              {result ? <p className="mt-2 text-sm text-emerald-600">{result}</p> : null}
              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
