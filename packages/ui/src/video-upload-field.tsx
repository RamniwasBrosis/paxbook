import * as React from "react";

export interface VideoUploadFieldProps {
  label?: string;
  videoUrl?: string | null;
  isUploading?: boolean;
  onFileSelected: (file: File, durationSeconds: number | null) => void;
  onClear?: () => void;
}

/**
 * Deliberately dumb — it has no knowledge of the upload endpoint. The parent
 * page owns the actual `useUploadVideo()` mutation (from @paxbook/api-client)
 * and passes the resulting preview URL / loading state back in, keeping
 * @paxbook/ui free of data-fetching dependencies. Reads the selected file's
 * duration client-side (via a throwaway <video> + objectURL) before handing
 * the file back to the parent, so the caller can persist it alongside the
 * upload without any server-side video processing.
 */
export function VideoUploadField({ label, videoUrl, isUploading, onFileSelected, onClear }: VideoUploadFieldProps) {
  const inputId = React.useId();

  function handleFile(file: File) {
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const duration = Number.isFinite(probe.duration) ? Math.round(probe.duration) : null;
      URL.revokeObjectURL(objectUrl);
      onFileSelected(file, duration);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      onFileSelected(file, null);
    };
    probe.src = objectUrl;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <div className="flex items-start gap-3">
        {videoUrl ? (
          <video src={videoUrl} controls muted className="h-24 w-40 rounded-md border border-slate-200 object-cover" />
        ) : (
          <div className="flex h-24 w-40 items-center justify-center rounded-md border border-dashed border-slate-300 text-[10px] text-slate-400">
            No video
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input
            id={inputId}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
            className="text-xs text-slate-500 file:mr-2 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-50"
          />
          {isUploading ? <p className="text-xs text-slate-400">Uploading…</p> : null}
          {videoUrl && onClear ? (
            <button type="button" onClick={onClear} className="w-fit text-xs text-red-600 hover:underline">
              Remove video
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
