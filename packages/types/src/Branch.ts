// Enhanced Branch management types
export interface Branch {
  id: string;
  name: string;
  code: string; // Branch code for order numbering
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active: boolean;
  business_hours?: BusinessHours; // Store opening hours
  settings?: BranchSettings; // Branch-specific settings
  created_at?: string;
  updated_at?: string;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  holidays?: DayHours;
}

export interface DayHours {
  open?: string; // Format: "HH:mm" (24-hour)
  close?: string; // Format: "HH:mm" (24-hour)
  is_closed?: boolean;
  break_start?: string;
  break_end?: string;
}

export interface BranchSettings {
  currency?: string;
  timezone?: string;
  tax_rate?: number;
  receipt_template?: string;
  auto_backup?: boolean;
  notification_preferences?: {
    low_stock_alerts?: boolean;
    daily_reports?: boolean;
    order_notifications?: boolean;
  };
  pos_settings?: {
    allow_discounts?: boolean;
    require_customer_info?: boolean;
    print_receipt_automatically?: boolean;
  };
}

export interface BranchFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active?: boolean;
  business_hours?: BusinessHours;
  settings?: BranchSettings;
}

export interface BranchWithStats extends Branch {
  user_count?: number;
  order_count?: number;
  total_revenue?: number;
  today_orders?: number;
  today_revenue?: number;
  product_count?: number;
  low_stock_count?: number;
  performance_score?: number;
}

export interface BranchSelectOption {
  value: string;
  label: string;
  code?: string;
  isDisabled?: boolean;
}

// Branch analytics and performance
export interface BranchPerformance {
  branch_id: string;
  branch_name: string;
  branch_code: string;
  period: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  customer_count: number;
  growth_rate: number; // Month-over-month
  performance_rating: "excellent" | "good" | "average" | "poor";
  top_products: {
    product_id: string;
    product_name: string;
    sales_count: number;
    revenue: number;
  }[];
  staff_performance: {
    user_id: string;
    user_name: string;
    orders_handled: number;
    revenue_generated: number;
  }[];
}

export interface BranchComparison {
  period: string;
  branches: {
    branch_id: string;
    branch_name: string;
    orders: number;
    revenue: number;
    growth: number;
    market_share: number;
  }[];
}

export interface BranchFilters {
  search?: string;
  is_active?: boolean;
  has_manager?: boolean;
  min_revenue?: number;
  max_revenue?: number;
}
