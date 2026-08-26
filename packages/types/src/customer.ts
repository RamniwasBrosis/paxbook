export interface TravelerDto {
  id: string;
  name: string;
  dob: string | null;
  passportNumber: string | null;
  nationality: string | null;
}

export interface SaveTravelerDto {
  name: string;
  dob?: string;
  passportNumber?: string;
  nationality?: string;
}

export interface CustomerDocumentDto {
  id: string;
  travelerId: string | null;
  docType: string;
  storageKey: string;
  fileUrl: string;
  verifiedAt: string | null;
  createdAt: string;
}

export interface SaveCustomerDocumentDto {
  travelerId?: string;
  docType: string;
  storageKey: string;
}

export interface CustomerSummaryDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  travelerCount: number;
  bookingCount: number;
  createdAt: string;
}

export interface CustomerDetailDto extends CustomerSummaryDto {
  travelers: TravelerDto[];
  documents: CustomerDocumentDto[];
}

export interface SaveCustomerDto {
  name: string;
  email: string;
  phone?: string;
}
