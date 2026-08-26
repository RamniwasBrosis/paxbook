export interface MonthlyFigureDto {
  month: string; // "YYYY-MM"
  bookings: number;
  amount: number;
}

export interface BreakdownFigureDto {
  label: string;
  bookings: number;
  amount: number;
}

export interface SalesReportDto {
  totalBookings: number;
  totalBookingValue: number;
  byMonth: MonthlyFigureDto[];
  byDestination: BreakdownFigureDto[];
  byPackage: BreakdownFigureDto[];
}

export interface RevenueMonthlyFigureDto {
  month: string;
  captured: number;
  refunded: number;
}

export interface RevenueByMethodDto {
  method: string;
  amount: number;
}

export interface RevenueReportDto {
  totalCaptured: number;
  totalRefunded: number;
  netRevenue: number;
  byMonth: RevenueMonthlyFigureDto[];
  byMethod: RevenueByMethodDto[];
}

export interface ConsultantPerformanceDto {
  consultantId: string;
  consultantName: string;
  leadsAssigned: number;
  leadsConverted: number;
  conversionRate: number;
  bookingsHandled: number;
  revenueGenerated: number;
}

export interface MarketingSourceDto {
  source: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface MarketingReportDto {
  bySource: MarketingSourceDto[];
}

export interface SatisfactionReportDto {
  averageRating: number;
  totalReviews: number;
  distribution: { rating: number; count: number }[];
}
