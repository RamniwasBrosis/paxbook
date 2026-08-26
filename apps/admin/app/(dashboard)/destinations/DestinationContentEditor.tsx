"use client";

import * as React from "react";
import {
  useDestinationHighlights,
  useCreateDestinationHighlight,
  useDeleteDestinationHighlight,
  useDestinationActivities,
  useCreateDestinationActivity,
  useDeleteDestinationActivity,
  useDestinationHotelSuggestions,
  useCreateDestinationHotelSuggestion,
  useDeleteDestinationHotelSuggestion,
} from "@paxbook/api-client";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

export function DestinationContentEditor({ destinationId, destinationName }: { destinationId: string; destinationName: string }) {
  return (
    <div className="flex flex-col gap-6">
      <HighlightsEditor destinationId={destinationId} destinationName={destinationName} />
      <ActivitiesEditor destinationId={destinationId} destinationName={destinationName} />
      <HotelSuggestionsEditor destinationId={destinationId} destinationName={destinationName} />
    </div>
  );
}

function HighlightsEditor({ destinationId, destinationName }: { destinationId: string; destinationName: string }) {
  const listQuery = useDestinationHighlights(destinationId);
  const create = useCreateDestinationHighlight(destinationId);
  const remove = useDeleteDestinationHighlight(destinationId);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description) return;
    await create.mutateAsync({ title, description, sortOrder: listQuery.data?.length ?? 0 });
    setTitle("");
    setDescription("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Highlights — &quot;Highlights of {destinationName}&quot; cards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {listQuery.data?.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-900">{h.title}</p>
                <p className="text-slate-500">{h.description}</p>
              </div>
              <button type="button" onClick={() => remove.mutateAsync(h.id)} className="shrink-0 text-xs text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
          {listQuery.data?.length === 0 ? <p className="text-sm text-slate-400">No highlights yet.</p> : null}
        </div>
        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <Input placeholder="Title (e.g. Ubud rice terraces)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="One-line description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" isLoading={create.isPending}>Add</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ActivitiesEditor({ destinationId, destinationName }: { destinationId: string; destinationName: string }) {
  const listQuery = useDestinationActivities(destinationId);
  const create = useCreateDestinationActivity(destinationId);
  const remove = useDeleteDestinationActivity(destinationId);
  const [label, setLabel] = React.useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label) return;
    await create.mutateAsync({ label, sortOrder: listQuery.data?.length ?? 0 });
    setLabel("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities we can add — pill chips for {destinationName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {listQuery.data?.map((a) => (
            <span key={a.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
              {a.label}
              <button type="button" onClick={() => remove.mutateAsync(a.id)} className="text-slate-400 hover:text-red-600">
                ×
              </button>
            </span>
          ))}
          {listQuery.data?.length === 0 ? <p className="text-sm text-slate-400">No activities yet.</p> : null}
        </div>
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <Input placeholder="e.g. Private pool villa stay" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button type="submit" isLoading={create.isPending}>Add</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function HotelSuggestionsEditor({ destinationId, destinationName }: { destinationId: string; destinationName: string }) {
  const listQuery = useDestinationHotelSuggestions(destinationId);
  const create = useCreateDestinationHotelSuggestion(destinationId);
  const remove = useDeleteDestinationHotelSuggestion(destinationId);
  const [name, setName] = React.useState("");
  const [starRating, setStarRating] = React.useState("4");
  const [area, setArea] = React.useState("");
  const [descriptor, setDescriptor] = React.useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!area) return;
    await create.mutateAsync({
      name: name || undefined,
      starRating: Number(starRating),
      area,
      descriptor: descriptor || undefined,
      sortOrder: listQuery.data?.length ?? 0,
    });
    setName("");
    setArea("");
    setDescriptor("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where you could stay — hotel suggestions for {destinationName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-slate-400">Leave &quot;Hotel name&quot; blank until you have a real confirmed property — the site shows a generic descriptor instead of inventing a name.</p>
        <div className="flex flex-col gap-2">
          {listQuery.data?.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-900">{h.name ?? h.descriptor ?? "(no name yet)"}</p>
                <p className="text-slate-500">{h.starRating}★ · {h.area}</p>
              </div>
              <button type="button" onClick={() => remove.mutateAsync(h.id)} className="shrink-0 text-xs text-red-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
          {listQuery.data?.length === 0 ? <p className="text-sm text-slate-400">No hotel suggestions yet.</p> : null}
        </div>
        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
          <Input placeholder="Hotel name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Star rating" type="number" min={1} max={5} value={starRating} onChange={(e) => setStarRating(e.target.value)} />
          <Input placeholder="Area (e.g. Ubud)" value={area} onChange={(e) => setArea(e.target.value)} />
          <Input placeholder="Descriptor (e.g. Boutique jungle-view stay)" value={descriptor} onChange={(e) => setDescriptor(e.target.value)} />
          <Button type="submit" isLoading={create.isPending}>Add</Button>
        </form>
      </CardContent>
    </Card>
  );
}
