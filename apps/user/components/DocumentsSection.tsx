"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Upload } from "lucide-react";
import type { CustomerDocumentDto } from "@paxbook/types";

const DOC_TYPES = ["Passport", "Visa", "ID Proof", "Photo", "Other"];

export function DocumentsSection({
  documents,
  travelers,
}: {
  documents: CustomerDocumentDto[];
  travelers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [docType, setDocType] = React.useState(DOC_TYPES[0]!);
  const [travelerId, setTravelerId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/customer-upload", { method: "POST", body: form });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) throw new Error(uploadJson.error?.message ?? "Upload failed");

      const saveRes = await fetch("/api/customer/profile/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, storageKey: uploadJson.data.key, travelerId: travelerId || undefined }),
      });
      const saveJson = await saveRes.json();
      if (!saveJson.success) throw new Error(saveJson.error?.message ?? "Could not save document");

      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(documentId: string) {
    await fetch(`/api/customer/profile/documents/${documentId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="flat-card max-w-lg p-6">
      <h2 className="font-display text-base text-navy-deep">Documents</h2>
      <p className="mt-1 text-sm text-slate-500">Upload passports, visas and IDs so they&apos;re ready when a consultant needs them.</p>

      {documents.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No documents uploaded yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-700 hover:text-brand">
                <FileText className="h-4 w-4 shrink-0" strokeWidth={2} />
                {doc.docType}
                {doc.verifiedAt ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700">Verified</span> : null}
              </a>
              <button type="button" onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-red-600" aria-label="Remove document">
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5">
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {travelers.length > 0 ? (
          <select value={travelerId} onChange={(e) => setTravelerId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Not traveler-specific</option>
            {travelers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        ) : null}
        <input
          required
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-mist-strong file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={!file || busy}
          className="flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Upload className="h-4 w-4" strokeWidth={2} />
          {busy ? "Uploading…" : "Upload document"}
        </button>
      </form>
    </section>
  );
}
