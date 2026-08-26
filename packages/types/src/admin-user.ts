export interface RoleDto {
  id: string;
  name: string;
  isSystem: boolean;
  permissionKeys: string[];
}

export interface AdminUserDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED";
  roleId: string;
  roleName: string;
  createdAt: string;
}

export interface CreateAdminUserDto {
  email: string;
  name: string;
  phone?: string;
  roleId: string;
  password: string;
}

export interface UpdateAdminUserDto {
  name?: string;
  phone?: string;
  roleId?: string;
  status?: "ACTIVE" | "SUSPENDED";
}

export interface AuditLogEntryDto {
  id: string;
  actorAdminId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}
