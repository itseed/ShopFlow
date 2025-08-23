// Enhanced Supplier Types
export interface Supplier {
  id: string;
  supplier_code?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit: number;
  current_balance: number;
  status: SupplierStatus;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type SupplierStatus = "active" | "inactive" | "suspended";

export interface SupplierFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  status?: SupplierStatus;
  rating?: number;
  notes?: string;
}

export interface SupplierStats {
  total_purchase_orders: number;
  total_amount_purchased: number;
  avg_purchase_amount: number;
  last_purchase_date?: string;
  product_count: number;
  status: SupplierStatus;
  rating?: number;
}

export interface SupplierWithStats extends Supplier {
  product_count?: number;
  purchase_order_count?: number;
  total_purchased?: number;
  avg_purchase_amount?: number;
  last_purchase_date?: string;
}

// Supplier search and filter types
export interface SupplierFilters {
  status?: SupplierStatus;
  city?: string;
  country?: string;
  min_rating?: number;
  max_rating?: number;
  has_credit_limit?: boolean;
  search?: string; // Search in name, contact_person, email, phone
}

export interface SupplierSummary {
  total_suppliers: number;
  active_suppliers: number;
  inactive_suppliers: number;
  suspended_suppliers: number;
  avg_rating: number;
  total_credit_extended: number;
  top_suppliers: TopSupplier[];
}

export interface TopSupplier {
  id: string;
  name: string;
  total_purchased: number;
  product_count: number;
  rating?: number;
  last_purchase_date?: string;
}
