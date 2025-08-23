// Enhanced Product types for CMS
export interface Product {
  id: string;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  cost_price?: number;
  discount_price?: number;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string; // Unit of measurement (default: 'pcs')
  weight?: number; // For shipping calculations
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  category_id?: string;
  category?: Category; // For populated queries
  supplier_id?: string;
  supplier?: Supplier; // For populated queries
  brand?: string;
  status: ProductStatus;
  images?: string[];
  tags?: string[]; // Searchable tags
  meta_data?: Record<string, any>; // Additional product data
  is_featured?: boolean;
  is_trackable?: boolean; // Whether to track stock
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export type ProductStatus =
  | "active"
  | "inactive"
  | "out_of_stock"
  | "discontinued";

// Product Variant Types
export interface ProductVariantOption {
  id: string;
  name: string;
  value: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductVariantType {
  id: string;
  name: string; // e.g., "สี", "ขนาด"
  display_name: string; // e.g., "Color", "Size"
  sort_order: number;
  is_active: boolean;
  options: ProductVariantOption[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_combinations: {
    // Key-value pairs of variant type to option
    [variant_type_id: string]: string; // variant_option_id
  };
  sku?: string;
  price_adjustment: number; // Add/subtract from base price
  stock: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductWithVariants extends Product {
  variant_types?: ProductVariantType[];
  variants?: ProductVariant[];
  has_variants: boolean;
}

export interface ProductFormData {
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  cost_price?: number;
  discount_price?: number;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  category_id?: string;
  supplier_id?: string;
  brand?: string;
  status: ProductStatus;
  images?: File[] | string[]; // File[] for form, string[] for display
  tags?: string[];
  meta_data?: Record<string, any>;
  is_featured?: boolean;
  is_trackable?: boolean;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  supplier_id?: string;
  brand?: string;
  status?: ProductStatus;
  min_price?: number;
  max_price?: number;
  min_cost_price?: number;
  max_cost_price?: number;
  low_stock?: boolean; // For filtering products with stock <= min_stock
  out_of_stock?: boolean;
  is_featured?: boolean;
  is_trackable?: boolean;
  tags?: string[];
  unit?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BulkUpdateData {
  product_ids: string[];
  updates: {
    price?: number;
    cost_price?: number;
    discount_price?: number;
    stock?: number;
    min_stock?: number;
    max_stock?: number;
    status?: ProductStatus;
    category_id?: string;
    supplier_id?: string;
    brand?: string;
    unit?: string;
    is_featured?: boolean;
    is_trackable?: boolean;
    tags?: string[];
  };
}

// For quick inline editing
export interface QuickEditData {
  id: string;
  field:
    | "price"
    | "cost_price"
    | "discount_price"
    | "stock"
    | "min_stock"
    | "max_stock"
    | "status"
    | "brand"
    | "unit";
  value: number | string | boolean;
}

// Enhanced product statistics and analytics
export interface ProductStats {
  total_sold: number;
  total_revenue: number;
  total_profit: number;
  avg_sale_price: number;
  profit_margin: number;
  last_sale_date?: string;
  inventory_value: number;
  days_in_stock: number;
  velocity: number; // Sales per day
}

export interface ProductWithStats extends Product {
  stats?: ProductStats;
}

export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  sales_count: number;
  revenue: number;
  profit: number;
  profit_margin: number;
  inventory_turns: number;
  last_sold_date?: string;
  trend: "up" | "down" | "stable";
}

// Category reference (will be defined in Category.ts)
interface Category {
  id: string;
  name: string;
}

// Supplier reference (will be defined in Supplier.ts)
interface Supplier {
  id: string;
  name: string;
  supplier_code?: string;
}
