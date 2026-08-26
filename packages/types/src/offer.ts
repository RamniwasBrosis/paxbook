export type DiscountType = "FIXED" | "PERCENT";

export interface CouponDto {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  value: number;
  minBookingAmount: number | null;
  maxDiscountAmount: number | null;
  destinationId: string | null;
  destinationName: string | null;
  validFrom: string;
  validTo: string;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SaveCouponDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  destinationId?: string;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  isActive?: boolean;
}
