export type VendorCategoryType = "HOTEL" | "TRANSPORT" | "GUIDE" | "ACTIVITY";
export type VendorStatus = "ACTIVE" | "INACTIVE";
export type VendorPaymentStatus = "PENDING" | "PAID";

export interface VendorDto {
  id: string;
  name: string;
  categoryType: VendorCategoryType;
  contactInfo: string | null;
  status: VendorStatus;
  email: string | null;
  categoryIds: string[];
  categoryNames: string[];
}

export interface ProvisionVendorPortalAccessDto {
  email: string;
}

export interface ProvisionPortalAccessResultDto {
  email: string;
  temporaryPassword: string;
}

export interface VendorContractDto {
  id: string;
  startDate: string;
  endDate: string | null;
  terms: string | null;
  commissionRate: number | null;
  storageKey: string | null;
  fileUrl: string | null;
}

export interface VendorDetailDto extends VendorDto {
  contracts: VendorContractDto[];
}

export interface SaveVendorDto {
  name: string;
  categoryType: VendorCategoryType;
  contactInfo?: string;
  status?: VendorStatus;
  categoryIds?: string[];
}

export interface SaveVendorContractDto {
  startDate: string;
  endDate?: string;
  terms?: string;
  commissionRate?: number;
  storageKey?: string;
}

export interface VendorPaymentDto {
  id: string;
  vendorId: string;
  vendorName: string;
  bookingId: string | null;
  amount: number;
  status: VendorPaymentStatus;
  paidAt: string | null;
}

export interface SaveVendorPaymentDto {
  vendorId: string;
  bookingId?: string;
  amount: number;
}

export interface UpdateVendorPaymentStatusDto {
  status: "PAID";
}
