"use client";

import { useRoles } from "@paxbook/api-client";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@paxbook/ui";

export default function RolesPage() {
  const rolesQuery = useRoles();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Roles &amp; Permissions</h1>
        <p className="text-sm text-slate-500">
          Seeded system roles and their permission matrix. A custom role editor arrives alongside deeper module
          coverage in a later checkpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rolesQuery.data?.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{role.name}</CardTitle>
              {role.isSystem ? <Badge tone="info">system</Badge> : null}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {role.permissionKeys.map((key) => (
                  <Badge key={key} tone="neutral">
                    {key}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
