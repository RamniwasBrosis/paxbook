export interface CustomerProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface UpdateCustomerProfileDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface WishlistItemDto {
  id: string;
  packageId: string;
  packageTitle: string;
  packageSlug: string;
  packageCoverImageUrl: string | null;
  basePrice: number;
  createdAt: string;
}

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateBookingRequestDto {
  packageId: string;
  travelStartDate?: string;
  travelEndDate?: string;
  travelerCount?: number;
  notes?: string;
}

export type CancellationRequestStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export interface CancellationRequestDto {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  reason: string | null;
  status: CancellationRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface CreateCancellationRequestDto {
  reason?: string;
}

export interface ResolveCancellationRequestDto {
  status: "APPROVED" | "REJECTED";
  resolutionNote?: string;
}

export interface PaymentOrderDto {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

export interface VerifyPaymentDto {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  devConfirm?: boolean;
}

export interface SubmitCustomerReviewDto {
  packageId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface BookingInvoiceViewDto {
  invoiceNumber: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  packageTitle: string;
  amount: number;
  currency: string;
  issuedAt: string;
  fileUrl: string | null;
}

export interface BookingVoucherViewDto {
  bookingId: string;
  customerName: string;
  packageTitle: string;
  travelStartDate: string | null;
  travelEndDate: string | null;
  travelers: { name: string; passportNumber: string | null }[];
  generatedAt: string;
  fileUrl: string | null;
}
