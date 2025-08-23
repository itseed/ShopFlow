// Enhanced Category management types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string; // For hierarchical categories
  parent?: Category; // For populated queries
  children?: Category[]; // For nested structure
  display_order: number;
  is_active: boolean;
  image_url?: string; // URL to category image
  icon?: string; // Icon name for UI
  path?: string; // Materialized path for hierarchy (e.g., '/electronics/phones/')
  level: number; // Hierarchy level (0 for root categories)
  created_at?: string;
  updated_at?: string;
}

export type CategoryStatus = "active" | "inactive";

// For backward compatibility
export interface CategoryWithStatus extends Category {
  status: CategoryStatus;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  image_url?: string;
  icon?: string;
  parent_id?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CategoryWithProductCount extends Category {
  product_count: number;
  total_product_value?: number; // Total value of products in this category
  active_product_count?: number; // Only active products
}

export interface CategorySelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
  level: number; // For indentation in nested display
  path?: string;
  icon?: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
  full_path: string; // Complete category path for breadcrumbs
  product_count?: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

// Category analytics and statistics
export interface CategoryAnalytics {
  category_id: string;
  category_name: string;
  total_products: number;
  active_products: number;
  total_sales: number;
  total_revenue: number;
  avg_product_price: number;
  top_selling_products: {
    product_id: string;
    product_name: string;
    sales_count: number;
    revenue: number;
  }[];
  growth_rate: number; // Month-over-month growth
  inventory_value: number;
}

export interface CategoryHierarchy {
  root_categories: CategoryTree[];
  flat_categories: Category[];
  max_depth: number;
}

export interface CategoryFilters {
  search?: string;
  parent_id?: string | null; // null for root categories
  is_active?: boolean;
  has_products?: boolean;
  min_level?: number;
  max_level?: number;
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  path: string;
  level: number;
}
