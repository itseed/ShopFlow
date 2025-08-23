// Enhanced User management and authentication types
export interface UserProfile {
  id: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  email?: string; // From auth.users
  phone?: string;
  role: UserRole;
  branch_id?: string;
  branch?: Branch; // For populated queries
  permissions?: UserPermissions; // Specific permissions
  is_active: boolean;
  last_login?: string;
  settings?: UserSettings; // User preferences
  created_at?: string;
  updated_at?: string;
}

export type UserRole = "admin" | "manager" | "staff" | "cashier";

export interface UserPermissions {
  // Product management
  can_manage_products?: boolean;
  can_edit_prices?: boolean;
  can_manage_categories?: boolean;

  // Order management
  can_create_orders?: boolean;
  can_edit_orders?: boolean;
  can_cancel_orders?: boolean;
  can_process_refunds?: boolean;

  // Customer management
  can_manage_customers?: boolean;
  can_view_customer_data?: boolean;

  // Inventory management
  can_adjust_inventory?: boolean;
  can_view_stock_movements?: boolean;
  can_manage_suppliers?: boolean;

  // Reports and analytics
  can_view_reports?: boolean;
  can_export_data?: boolean;
  can_view_analytics?: boolean;

  // User and branch management
  can_manage_users?: boolean;
  can_manage_branches?: boolean;
  can_manage_settings?: boolean;

  // POS specific
  can_override_prices?: boolean;
  can_apply_discounts?: boolean;
  can_void_transactions?: boolean;
}

export interface UserSettings {
  language?: string;
  timezone?: string;
  date_format?: string;
  currency_format?: string;
  theme?: "light" | "dark" | "auto";
  notifications?: {
    email_alerts?: boolean;
    push_notifications?: boolean;
    order_notifications?: boolean;
    stock_alerts?: boolean;
  };
  dashboard_preferences?: {
    default_time_range?: string;
    favorite_reports?: string[];
    widget_layout?: Record<string, any>;
  };
}

export interface UserFormData {
  display_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  branch_id?: string;
  permissions?: UserPermissions;
  is_active?: boolean;
  password?: string; // For new users
  settings?: UserSettings;
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

// Enhanced Permission types
export interface Permission {
  resource: string;
  actions: PermissionAction[];
  conditions?: PermissionCondition[]; // Additional conditions
}

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage";

export interface PermissionCondition {
  field: string;
  operator: "equals" | "not_equals" | "in" | "not_in";
  value: any;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description?: string;
  is_system_role?: boolean;
}

// User activity and session management
export interface UserSession {
  id: string;
  user_id: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  login_at: string;
  last_activity?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// User statistics and performance
export interface UserStats {
  user_id: string;
  orders_created: number;
  total_sales: number;
  avg_order_value: number;
  customer_interactions: number;
  login_frequency: number;
  performance_score?: number;
  last_activity?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  branch_id?: string;
  is_active?: boolean;
  last_login_from?: string;
  last_login_to?: string;
}

// Branch reference (will be defined in Branch.ts)
interface Branch {
  id: string;
  name: string;
}
