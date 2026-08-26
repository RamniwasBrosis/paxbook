import * as React from "react";

export interface ImageUploadFieldProps {
  label?: string;
  imageUrl?: string | null;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
  onClear?: () => void;
}

/**
 * Deliberately dumb — it has no knowledge of the upload endpoint. The parent
 * page owns the actual `useUploadFile()` mutation (from @paxbook/api-client)
 * and passes the resulting preview URL / loading state back in, keeping
 * @paxbook/ui free of data-fetching dependencies.
 */
export function ImageUploadField({ label, imageUrl, isUploading, onFileSelected, onClear }: ImageUploadFieldProps) {
  const inputId = React.useId();

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-16 w-16 rounded-md border border-slate-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-slate-300 text-[10px] text-slate-400">
            No image
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
              e.target.value = "";
            }}
            className="text-xs text-slate-500 file:mr-2 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-50"
          />
          {isUploading ? <p className="text-xs text-slate-400">Uploading…</p> : null}
          {imageUrl && onClear ? (
            <button type="button" onClick={onClear} className="w-fit text-xs text-red-600 hover:underline">
              Remove image
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
