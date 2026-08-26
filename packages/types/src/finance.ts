export type PaymentRecordStatus = "CREATED" | "CAPTURED" | "FAILED" | "REFUNDED";
export type RefundStatus = "REQUESTED" | "APPROVED" | "PROCESSED" | "REJECTED";

export interface PaymentDto {
  id: string;
  bookingId: string;
  bookingCustomerName: string;
  bookingPackageTitle: string;
  provider: string;
  providerRef: string | null;
  amount: number;
  status: PaymentRecordStatus;
  method: string | null;
  capturedAt: string | null;
  createdAt: string;
}

export interface SavePaymentDto {
  bookingId: string;
  provider?: string;
  providerRef?: string;
  amount: number;
  method?: string;
}

export interface UpdatePaymentStatusDto {
  status: "CAPTURED" | "FAILED" | "REFUNDED";
}

export interface InvoiceDto {
  id: string;
  bookingId: string;
  bookingCustomerName: string;
  bookingPackageTitle: string;
  invoiceNumber: string;
  storageKey: string | null;
  fileUrl: string | null;
  amount: number;
  issuedAt: string;
}

export interface SaveInvoiceDto {
  bookingId: string;
  amount: number;
  storageKey?: string;
}

export interface EmiInstallmentDto {
  dueDate: string;
  amount: number;
  paid?: boolean;
}

export interface EmiPlanDto {
  id: string;
  bookingId: string;
  totalInstallments: number;
  schedule: EmiInstallmentDto[];
}

export interface SaveEmiPlanDto {
  totalInstallments: number;
  schedule: EmiInstallmentDto[];
}

export interface RefundDto {
  id: string;
  bookingId: string;
  bookingCustomerName: string;
  bookingPackageTitle: string;
  paymentId: string;
  amount: number;
  reason: string | null;
  status: RefundStatus;
  processedAt: string | null;
}

export interface SaveRefundDto {
  bookingId: string;
  paymentId: string;
  amount: number;
  reason?: string;
}

export interface UpdateRefundStatusDto {
  status: "APPROVED" | "PROCESSED" | "REJECTED";
}
