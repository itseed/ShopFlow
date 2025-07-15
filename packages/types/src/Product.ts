// Enhanced Product types for CMS
export interface Product {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock: number;
  min_stock?: number;
  category_id?: string;
  category?: Category; // For populated queries
  status: ProductStatus;
  images?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export type ProductStatus = "active" | "inactive" | "out_of_stock";

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
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  stock: number;
  min_stock?: number;
  category_id?: string;
  status: ProductStatus;
  images?: File[] | string[]; // File[] for form, string[] for display
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  status?: ProductStatus;
  min_price?: number;
  max_price?: number;
  low_stock?: boolean; // For filtering products with stock <= min_stock
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
    discount_price?: number;
    stock?: number;
    status?: ProductStatus;
    category_id?: string;
  };
}

// For quick inline editing
export interface QuickEditData {
  id: string;
  field: "price" | "discount_price" | "stock" | "status";
  value: number | string;
}

// Category reference (will be defined in Category.ts)
interface Category {
  id: string;
  name: string;
}
