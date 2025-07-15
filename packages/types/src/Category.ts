// Category management types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: string; // For nested categories
  parent?: Category; // For populated queries
  children?: Category[]; // For nested structure
  display_order: number;
  status: CategoryStatus;
  created_at?: string;
  updated_at?: string;
}

export type CategoryStatus = "active" | "inactive";

export interface CategoryFormData {
  name: string;
  description?: string;
  image?: File | string;
  parent_id?: string;
  display_order?: number;
  status: CategoryStatus;
}

export interface CategoryWithProductCount extends Category {
  product_count: number;
}

export interface CategorySelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
  level?: number; // For indentation in nested display
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}
