import type { TravelerDto } from "./customer.js";

export type BookingStatus = "DRAFT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";

export interface BookingSummaryDto {
  id: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageTitle: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  travelStartDate: string | null;
  travelEndDate: string | null;
  consultantId: string | null;
  consultantName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatusHistoryEntryDto {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedByName: string | null;
  changedAt: string;
  note: string | null;
}

export interface BookingVoucherDto {
  storageKey: string;
  fileUrl: string;
  generatedAt: string;
}

export interface BookingDetailDto extends BookingSummaryDto {
  travelers: TravelerDto[];
  statusHistory: BookingStatusHistoryEntryDto[];
  voucher: BookingVoucherDto | null;
}

export interface SaveBookingDto {
  customerId: string;
  packageId: string;
  totalAmount: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  travelStartDate?: string;
  travelEndDate?: string;
  consultantId?: string;
}

export interface UpdateBookingStatusDto {
  toStatus: BookingStatus;
  note?: string;
}

export interface SyncBookingTravelersDto {
  travelerIds: string[];
}

export interface SaveBookingVoucherDto {
  storageKey: string;
}
