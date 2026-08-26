"use client";

import * as React from "react";
import Link from "next/link";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useLeads,
  useCreateLead,
  useUpdateLeadStatus,
  useAdminDirectory,
  useConsultants,
  useCreateConsultant,
  useUpdateConsultant,
  useDeleteConsultant,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { ConsultantDto, LeadStatus, LeadSummaryDto, TaskDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Input, Select } from "@paxbook/ui";

const TABS = ["Leads", "Consultants", "Tasks"] as const;
type Tab = (typeof TABS)[number];

const LEAD_STATUS_TONE = { NEW: "info", CONTACTED: "warning", QUALIFIED: "warning", CONVERTED: "success", LOST: "danger" } as const;
const PIPELINE_STAGES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export default function CrmPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.CRM_READ);
  const canWrite = hasPermission(PERMISSIONS.CRM_WRITE);
  const [tab, setTab] = React.useState<Tab>("Leads");

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>crm.read</code>.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">CRM</h1>
        <p className="text-sm text-slate-500">Leads, follow-ups, consultants, and tasks.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={"px-3 py-2 text-sm font-medium " + (tab === t ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Leads" ? <LeadsTab canWrite={canWrite} /> : null}
      {tab === "Consultants" ? <ConsultantsTab canWrite={canWrite} /> : null}
      {tab === "Tasks" ? <TasksTab canWrite={canWrite} /> : null}
    </div>
  );
}

function LeadsPipelineBoard({ leads, canWrite }: { leads: LeadSummaryDto[]; canWrite: boolean }) {
  const updateStatus = useUpdateLeadStatus();
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overStage, setOverStage] = React.useState<LeadStatus | null>(null);

  async function moveTo(leadId: string, status: LeadStatus) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === status) return;
    try {
      await updateStatus.mutateAsync({ id: leadId, payload: { status } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not move lead.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-5">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              if (!canWrite) return;
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setOverStage(null);
              if (dragId) moveTo(dragId, stage);
              setDragId(null);
            }}
            className={`min-w-[220px] rounded-lg border p-2 ${overStage === stage ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-slate-50/40"}`}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <Badge tone={LEAD_STATUS_TONE[stage]}>{stage}</Badge>
              <span className="text-xs text-slate-400">{stageLeads.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable={canWrite}
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`rounded-md border border-slate-200 bg-white p-2.5 text-sm shadow-sm ${canWrite ? "cursor-grab active:cursor-grabbing" : ""}`}
                >
                  <Link href={`/crm/leads/${lead.id}`} className="font-medium text-slate-900 hover:underline">
                    {lead.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">{lead.destinationInterest ?? lead.email ?? lead.phone ?? "—"}</p>
                  <p className="mt-1 text-[0.68rem] text-slate-400">{lead.assignedConsultantName ?? "Unassigned"}</p>
                </div>
              ))}
              {stageLeads.length === 0 ? <p className="px-1 py-2 text-xs text-slate-400">No leads</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadsTab({ canWrite }: { canWrite: boolean }) {
  const leadsQuery = useLeads();
  const createLead = useCreateLead();
  const [view, setView] = React.useState<"board" | "list">("board");

  const [form, setForm] = React.useState({ name: "", email: "", phone: "", source: "", destinationInterest: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createLead.mutateAsync({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        source: form.source || undefined,
        destinationInterest: form.destinationInterest || undefined,
      });
      setForm({ name: "", email: "", phone: "", source: "", destinationInterest: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create lead.");
    }
  }

  return (
    <>
      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setView("board")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === "board" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Pipeline board
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
        >
          List
        </button>
      </div>

      {view === "board" ? (
        <LeadsPipelineBoard leads={leadsQuery.data ?? []} canWrite={canWrite} />
      ) : (
        <DataTable
          columns={[
            {
              header: "Name",
              cell: (l: LeadSummaryDto) => (
                <Link href={`/crm/leads/${l.id}`} className="text-slate-900 hover:underline">
                  {l.name}
                </Link>
              ),
            },
            { header: "Contact", cell: (l: LeadSummaryDto) => l.email ?? l.phone ?? "—" },
            { header: "Interest", cell: (l: LeadSummaryDto) => l.destinationInterest ?? "—" },
            { header: "Consultant", cell: (l: LeadSummaryDto) => l.assignedConsultantName ?? "Unassigned" },
            { header: "Status", cell: (l: LeadSummaryDto) => <Badge tone={LEAD_STATUS_TONE[l.status]}>{l.status}</Badge> },
          ]}
          rows={leadsQuery.data ?? []}
          rowKey={(l) => l.id}
          isLoading={leadsQuery.isLoading}
          emptyMessage="No leads yet."
        />
      )}

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Add a lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
              <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <Input label="Source" placeholder="e.g. Website, Referral" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
              <Input
                label="Destination interest"
                value={form.destinationInterest}
                onChange={(e) => setForm((f) => ({ ...f, destinationInterest: e.target.value }))}
              />
              <div className="sm:col-span-3">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createLead.isPending}>
                  Add lead
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function ConsultantsTab({ canWrite }: { canWrite: boolean }) {
  const consultantsQuery = useConsultants();
  const adminsQuery = useAdminDirectory();
  const createConsultant = useCreateConsultant();
  const updateConsultant = useUpdateConsultant();
  const deleteConsultant = useDeleteConsultant();

  const [adminUserId, setAdminUserId] = React.useState("");
  const [targetRevenue, setTargetRevenue] = React.useState<number | "">("");
  const [error, setError] = React.useState<string | null>(null);

  const existingAdminIds = new Set((consultantsQuery.data ?? []).map((c) => c.adminUserId));
  const eligibleAdmins = (adminsQuery.data ?? []).filter((a) => !existingAdminIds.has(a.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createConsultant.mutateAsync({ adminUserId, targetRevenue: targetRevenue === "" ? undefined : Number(targetRevenue) });
      setAdminUserId("");
      setTargetRevenue("");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add consultant.");
    }
  }

  async function handleTargetChange(consultant: ConsultantDto, value: string) {
    try {
      await updateConsultant.mutateAsync({ id: consultant.id, payload: { targetRevenue: value === "" ? undefined : Number(value) } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update target revenue.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this consultant profile?")) return;
    try {
      await deleteConsultant.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not remove consultant.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Name", cell: (c: ConsultantDto) => c.adminUserName },
          { header: "Email", cell: (c: ConsultantDto) => c.adminUserEmail },
          { header: "Active leads", cell: (c: ConsultantDto) => c.activeLeadCount },
          {
            header: "Target revenue",
            cell: (c: ConsultantDto) =>
              canWrite ? (
                <input
                  type="number"
                  defaultValue={c.targetRevenue ?? ""}
                  onBlur={(e) => handleTargetChange(c, e.target.value)}
                  className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              ) : (
                c.targetRevenue ?? "—"
              ),
          },
          ...(canWrite
            ? [{ header: "", cell: (c: ConsultantDto) => <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-600 hover:underline">Remove</button> }]
            : []),
        ]}
        rows={consultantsQuery.data ?? []}
        rowKey={(c) => c.id}
        isLoading={consultantsQuery.isLoading}
        emptyMessage="No consultants yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Promote an admin user to consultant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
              <Select label="Admin user" required value={adminUserId} onChange={(e) => setAdminUserId(e.target.value)}>
                <option value="" disabled>
                  Select…
                </option>
                {eligibleAdmins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </Select>
              <Input
                label="Target revenue (optional)"
                type="number"
                min={0}
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <div className="flex items-end">
                {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createConsultant.isPending}>
                  Add consultant
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function TasksTab({ canWrite }: { canWrite: boolean }) {
  const tasksQuery = useTasks();
  const adminsQuery = useAdminDirectory();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const empty = { id: null as string | null, assignedToId: "", title: "", dueDate: "", priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" };
  const [form, setForm] = React.useState(empty);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { assignedToId: form.assignedToId, title: form.title, dueDate: form.dueDate || undefined, priority: form.priority };
    try {
      if (form.id) await updateTask.mutateAsync({ id: form.id, payload: { ...payload, status: tasksQuery.data?.find((t) => t.id === form.id)?.status } });
      else await createTask.mutateAsync(payload);
      setForm(empty);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save task.");
    }
  }

  async function handleStatusChange(task: TaskDto, status: "OPEN" | "IN_PROGRESS" | "DONE") {
    try {
      await updateTask.mutateAsync({ id: task.id, payload: { assignedToId: task.assignedToId, title: task.title, dueDate: task.dueDate ?? undefined, priority: task.priority, status } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update task status.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask.mutateAsync(id);
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not delete task.");
    }
  }

  return (
    <>
      <DataTable
        columns={[
          { header: "Title", cell: (t: TaskDto) => t.title },
          { header: "Assigned to", cell: (t: TaskDto) => t.assignedToName },
          { header: "Due", cell: (t: TaskDto) => (t.dueDate ? t.dueDate.slice(0, 10) : "—") },
          { header: "Priority", cell: (t: TaskDto) => <Badge tone={t.priority === "HIGH" ? "danger" : t.priority === "MEDIUM" ? "warning" : "neutral"}>{t.priority}</Badge> },
          {
            header: "Status",
            cell: (t: TaskDto) =>
              canWrite ? (
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t, e.target.value as "OPEN" | "IN_PROGRESS" | "DONE")}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Done</option>
                </select>
              ) : (
                <Badge tone={t.status === "DONE" ? "success" : "neutral"}>{t.status}</Badge>
              ),
          },
          ...(canWrite
            ? [{ header: "", cell: (t: TaskDto) => <button type="button" onClick={() => handleDelete(t.id)} className="text-xs text-red-600 hover:underline">Delete</button> }]
            : []),
        ]}
        rows={tasksQuery.data ?? []}
        rowKey={(t) => t.id}
        isLoading={tasksQuery.isLoading}
        emptyMessage="No tasks yet."
      />

      {canWrite ? (
        <Card>
          <CardHeader>
            <CardTitle>Add a task</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
              <Input label="Title" required className="sm:col-span-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Select label="Assigned to" required value={form.assignedToId} onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}>
                <option value="" disabled>
                  Select…
                </option>
                {adminsQuery.data?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              <Select label="Priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" }))}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
              <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              <div className="sm:col-span-4">
                {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
                <Button type="submit" isLoading={createTask.isPending}>
                  Add task
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
