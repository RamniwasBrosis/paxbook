export type DiscountType = "FIXED" | "PERCENT";
export type CouponScope = "ALL" | "PACKAGES" | "FLIGHTS";

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
  appliesTo: CouponScope;
  showOnCheckout: boolean;
  createdAt: string;
}

export interface SaveCouponDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  /** null clears the value when editing. */
  minBookingAmount?: number | null;
  maxDiscountAmount?: number | null;
  destinationId?: string;
  validFrom: string;
  validTo: string;
  usageLimit?: number | null;
  isActive?: boolean;
  appliesTo?: CouponScope;
  showOnCheckout?: boolean;
}

/** A coupon as customers see it in the flight checkout list. */
export interface PublicCouponDto {
  code: string;
  description: string | null;
  discountType: DiscountType;
  value: number;
  minBookingAmount: number | null;
  maxDiscountAmount: number | null;
  validTo: string;
}

/** Preview of what a coupon takes off a given amount; the server recomputes it when booking. */
export interface CouponQuoteDto {
  code: string;
  discount: number;
  payable: number;
  description: string | null;
}
