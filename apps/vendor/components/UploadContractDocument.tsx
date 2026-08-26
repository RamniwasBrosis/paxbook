"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function UploadContractDocument({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/vendor/uploads", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || uploadJson.success === false) {
        throw new Error(uploadJson?.error?.message ?? "Could not upload file.");
      }
      const patchRes = await fetch(`/api/vendor/contracts/${contractId}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageKey: uploadJson.data.key }),
      });
      const patchJson = await patchRes.json();
      if (!patchRes.ok || patchJson.success === false) {
        throw new Error(patchJson?.error?.message ?? "Could not attach document.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload document.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="cursor-pointer text-xs font-semibold text-brand hover:underline">
        {busy ? "Uploading…" : "Upload document"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={busy}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
