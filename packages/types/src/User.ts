// User management and authentication types
export interface UserProfile {
  id: string;
  display_name: string;
  email?: string; // From auth.users
  role: UserRole;
  branch_id?: string;
  branch?: Branch; // For populated queries
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = "admin" | "staff";

export interface UserFormData {
  display_name: string;
  email: string;
  role: UserRole;
  branch_id?: string;
  is_active?: boolean;
  password?: string; // For new users
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

// Permission types
export interface Permission {
  resource: string;
  actions: PermissionAction[];
}

export type PermissionAction = "create" | "read" | "update" | "delete";

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Branch reference (will be defined in Branch.ts)
interface Branch {
  id: string;
  name: string;
}
