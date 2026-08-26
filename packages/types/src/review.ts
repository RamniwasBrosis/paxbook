export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewDto {
  id: string;
  packageId: string;
  packageTitle: string;
  customerId: string | null;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface SaveReviewDto {
  packageId: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  status?: ReviewStatus;
}

export interface ModerateReviewDto {
  status: "APPROVED" | "REJECTED";
}
