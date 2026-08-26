"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMISSIONS } from "@paxbook/config";
import {
  useSession,
  useLead,
  useUpdateLead,
  useUpdateLeadStatus,
  useAdminDirectory,
  useAddLeadFollowUp,
  useUpdateLeadFollowUp,
  useDeleteLeadFollowUp,
} from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { LeadDetailDto, LeadFollowUpDto, LeadStatus } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from "@paxbook/ui";

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
const STATUS_TONE = { NEW: "info", CONTACTED: "warning", QUALIFIED: "warning", CONVERTED: "success", LOST: "danger" } as const;

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.CRM_READ);
  const canWrite = hasPermission(PERMISSIONS.CRM_WRITE);
  const leadQuery = useLead(params.id);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">Your role doesn&apos;t include <code>crm.read</code>.</p>
      </Card>
    );
  }

  if (leadQuery.isLoading || !leadQuery.data) {
    return <p className="text-sm text-slate-500">Loading lead…</p>;
  }

  const lead = leadQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/crm" className="text-xs text-slate-500 hover:underline">
          ← CRM
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">{lead.name}</h1>
          <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
        </div>
      </div>

      <DetailsCard lead={lead} canWrite={canWrite} />
      <TripPreferencesCard lead={lead} />
      <FollowUpsCard lead={lead} canWrite={canWrite} />
    </div>
  );
}

function DetailsCard({ lead, canWrite }: { lead: LeadDetailDto; canWrite: boolean }) {
  const updateLead = useUpdateLead();
  const updateStatus = useUpdateLeadStatus();
  const adminsQuery = useAdminDirectory();

  const [form, setForm] = React.useState({
    name: lead.name,
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    source: lead.source ?? "",
    destinationInterest: lead.destinationInterest ?? "",
    assignedConsultantId: lead.assignedConsultantId ?? "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        payload: {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          source: form.source || undefined,
          destinationInterest: form.destinationInterest || undefined,
          assignedConsultantId: form.assignedConsultantId,
        },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save lead.");
    }
  }

  async function handleStatusChange(status: LeadStatus) {
    try {
      await updateStatus.mutateAsync({ id: lead.id, payload: { status } });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not update status.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {canWrite ? (
          <Select label="Status" value={lead.status} onChange={(e) => handleStatusChange(e.target.value as LeadStatus)} className="w-48">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        ) : null}

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
          <Input label="Name" required disabled={!canWrite} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" disabled={!canWrite} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Phone" disabled={!canWrite} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Source" disabled={!canWrite} value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
          <Input
            label="Destination interest"
            disabled={!canWrite}
            value={form.destinationInterest}
            onChange={(e) => setForm((f) => ({ ...f, destinationInterest: e.target.value }))}
          />
          <Select label="Consultant" disabled={!canWrite} value={form.assignedConsultantId} onChange={(e) => setForm((f) => ({ ...f, assignedConsultantId: e.target.value }))}>
            <option value="">Unassigned</option>
            {adminsQuery.data?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          {canWrite ? (
            <div className="sm:col-span-3">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              {saved ? <p className="mb-2 text-sm text-emerald-600">Saved.</p> : null}
              <Button type="submit" isLoading={updateLead.isPending}>
                Save
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

function TripPreferencesCard({ lead }: { lead: LeadDetailDto }) {
  const hasAny =
    lead.travellerType || lead.interests.length > 0 || lead.tripDuration || lead.departureCity || lead.departureDate || lead.packageId;
  if (!hasAny) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-slate-500">Collected from the customer&apos;s step-by-step trip customizer.</p>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {lead.travellerType ? (
            <div>
              <dt className="text-xs text-slate-400">Traveller type</dt>
              <dd className="text-sm font-medium text-slate-900">{lead.travellerType}</dd>
            </div>
          ) : null}
          {lead.tripDuration ? (
            <div>
              <dt className="text-xs text-slate-400">Duration</dt>
              <dd className="text-sm font-medium text-slate-900">{lead.tripDuration}</dd>
            </div>
          ) : null}
          {lead.departureCity ? (
            <div>
              <dt className="text-xs text-slate-400">Departure city</dt>
              <dd className="text-sm font-medium text-slate-900">{lead.departureCity}</dd>
            </div>
          ) : null}
          {lead.departureDate ? (
            <div>
              <dt className="text-xs text-slate-400">Departure date</dt>
              <dd className="text-sm font-medium text-slate-900">{new Date(lead.departureDate).toLocaleDateString()}</dd>
            </div>
          ) : null}
          {lead.packageTitle ? (
            <div>
              <dt className="text-xs text-slate-400">Selected package</dt>
              <dd className="text-sm font-medium text-slate-900">{lead.packageTitle}</dd>
            </div>
          ) : null}
          {lead.interests.length > 0 ? (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs text-slate-400">Interests</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {lead.interests.map((i) => (
                  <span key={i} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {i}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

function FollowUpsCard({ lead, canWrite }: { lead: LeadDetailDto; canWrite: boolean }) {
  const addFollowUp = useAddLeadFollowUp();
  const updateFollowUp = useUpdateLeadFollowUp();
  const deleteFollowUp = useDeleteLeadFollowUp();

  const [form, setForm] = React.useState({ scheduledAt: "", method: "", notes: "" });
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addFollowUp.mutateAsync({ leadId: lead.id, payload: { scheduledAt: form.scheduledAt, method: form.method || undefined, notes: form.notes || undefined } });
      setForm({ scheduledAt: "", method: "", notes: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add follow-up.");
    }
  }

  async function handleMarkComplete(followUp: LeadFollowUpDto) {
    try {
      await updateFollowUp.mutateAsync({
        leadId: lead.id,
        id: followUp.id,
        payload: { scheduledAt: followUp.scheduledAt, completedAt: new Date().toISOString(), notes: followUp.notes ?? undefined, method: followUp.method ?? undefined },
      });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not mark complete.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this follow-up?")) return;
    try {
      await deleteFollowUp.mutateAsync({ leadId: lead.id, id });
    } catch (err) {
      alert(err instanceof ApiRequestError ? err.message : "Could not remove follow-up.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-ups</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {lead.followUps.length === 0 ? <p className="text-sm text-slate-400">No follow-ups yet.</p> : null}
          {lead.followUps.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-slate-900">{new Date(f.scheduledAt).toLocaleString()}</span>
                {f.method ? <span className="ml-2 text-slate-500">via {f.method}</span> : null}
                {f.notes ? <p className="mt-1 text-slate-500">{f.notes}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                {f.completedAt ? (
                  <Badge tone="success">Done</Badge>
                ) : canWrite ? (
                  <button type="button" onClick={() => handleMarkComplete(f)} className="text-xs text-emerald-600 hover:underline">
                    Mark complete
                  </button>
                ) : null}
                {canWrite ? (
                  <button type="button" onClick={() => handleDelete(f.id)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {canWrite ? (
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-4" onSubmit={handleSubmit}>
            <Input label="Scheduled at" type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} />
            <Input label="Method" placeholder="Call, Email, WhatsApp" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} />
            <Input label="Notes" className="sm:col-span-2" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <div className="sm:col-span-4">
              {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
              <Button type="submit" isLoading={addFollowUp.isPending}>
                Add follow-up
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
