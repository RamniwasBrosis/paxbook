export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface AdminDirectoryEntryDto {
  id: string;
  name: string;
  email: string;
}

export interface LeadSummaryDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  destinationInterest: string | null;
  customerId: string | null;
  assignedConsultantId: string | null;
  assignedConsultantName: string | null;
  /** Populated when the lead came from the step-based "customize your trip" wizard. */
  travellerType: string | null;
  interests: string[];
  tripDuration: string | null;
  departureCity: string | null;
  departureDate: string | null;
  packageId: string | null;
  packageTitle: string | null;
  createdAt: string;
}

export interface LeadFollowUpDto {
  id: string;
  scheduledAt: string;
  completedAt: string | null;
  notes: string | null;
  method: string | null;
}

export interface LeadDetailDto extends LeadSummaryDto {
  followUps: LeadFollowUpDto[];
}

export interface SaveLeadDto {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  destinationInterest?: string;
  customerId?: string;
  assignedConsultantId?: string;
  travellerType?: string;
  interests?: string[];
  tripDuration?: string;
  departureCity?: string;
  departureDate?: string;
  packageId?: string;
}

export interface UpdateLeadStatusDto {
  status: LeadStatus;
}

export interface SaveLeadFollowUpDto {
  scheduledAt: string;
  completedAt?: string;
  notes?: string;
  method?: string;
}

export interface ConsultantDto {
  id: string;
  adminUserId: string;
  adminUserName: string;
  adminUserEmail: string;
  targetRevenue: number | null;
  activeLeadCount: number;
}

export interface SaveConsultantDto {
  adminUserId: string;
  targetRevenue?: number;
}

export interface UpdateConsultantDto {
  targetRevenue?: number;
}

export interface TaskDto {
  id: string;
  assignedToId: string;
  assignedToName: string;
  title: string;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}

export interface SaveTaskDto {
  assignedToId: string;
  title: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
