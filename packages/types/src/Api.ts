// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

// Common query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface BaseFilters extends PaginationParams, SortParams {
  search?: string;
}

// Upload types
export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Dashboard data types
export interface DashboardStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  total_categories: number;
  total_orders: number;
  today_orders: number;
  total_revenue: number;
  today_revenue: number;
  total_users: number;
  active_users: number;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  category_name?: string;
}

// Form validation types
export interface FieldError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Notification types
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

// Search and filter types
export interface SearchResults<T> {
  query: string;
  results: T[];
  total: number;
  took: number; // milliseconds
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
