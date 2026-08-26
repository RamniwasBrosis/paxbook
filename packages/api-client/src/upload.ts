import { useMutation } from "@tanstack/react-query";
import { apiUpload } from "@paxbook/auth-client";
import type { UploadResultDto } from "@paxbook/types";

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => apiUpload<UploadResultDto>("/uploads", file),
  });
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: (file: File) => apiUpload<UploadResultDto>("/uploads/video", file),
  });
}
