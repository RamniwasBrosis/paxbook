import type { VendorCategoryType, VendorStatus } from "./vendor.js";

export interface VendorProfileDto {
  id: string;
  name: string;
  email: string | null;
  categoryType: VendorCategoryType;
  contactInfo: string | null;
  status: VendorStatus;
}

export interface UpdateVendorProfileDto {
  contactInfo?: string;
}

export interface ChangeVendorPasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateVendorContractDocumentDto {
  storageKey: string;
}

export type VendorAssignmentType = "HOTEL" | "ACTIVITY";

export interface VendorAssignmentDto {
  type: VendorAssignmentType;
  packageId: string;
  packageTitle: string;
  packageSlug: string;
  destinationName: string;
  detail: string;
}
