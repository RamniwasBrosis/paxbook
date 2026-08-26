"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useAdminUsers, useCreateAdminUser, useRoles } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

export default function AdminUsersPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.USERS_READ);
  const canWrite = hasPermission(PERMISSIONS.USERS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your role doesn&apos;t include <code>users.read</code>. Log in as the seeded SuperAdmin to view this page.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin Users</h1>
        <p className="text-sm text-slate-500">Staff accounts with access to this admin panel.</p>
      </div>

      <UsersTable />
      {canWrite ? <CreateUserForm /> : null}
    </div>
  );
}

function UsersTable() {
  const usersQuery = useAdminUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All admin users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Email</th>
              <th className="px-5 py-2 font-medium">Role</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.data?.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3">{user.name}</td>
                <td className="px-5 py-3 text-slate-500">{user.email}</td>
                <td className="px-5 py-3">{user.roleName}</td>
                <td className="px-5 py-3">
                  <Badge tone={user.status === "ACTIVE" ? "success" : "warning"}>{user.status}</Badge>
                </td>
              </tr>
            ))}
            {usersQuery.isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CreateUserForm() {
  const rolesQuery = useRoles();
  const createUser = useCreateAdminUser();
  const [form, setForm] = React.useState({ name: "", email: "", password: "", roleId: "" });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await createUser.mutateAsync(form);
      setForm({ name: "", email: "", password: "", roleId: "" });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create user.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite an admin user</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Temporary password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="roleId">
              Role
            </label>
            <select
              id="roleId"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              value={form.roleId}
              onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
            >
              <option value="" disabled>
                Select a role…
              </option>
              {rolesQuery.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
            {success ? <p className="mb-3 text-sm text-emerald-600">Admin user created.</p> : null}
            <Button type="submit" isLoading={createUser.isPending}>
              Create user
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
