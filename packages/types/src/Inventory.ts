// Inventory Management Types

// Stock Movement Types
export interface StockMovement {
  id: string;
  product_id: string;
  product?: Product; // For populated queries
  movement_type: StockMovementType;
  quantity_change: number; // Positive for increase, negative for decrease
  quantity_before: number;
  quantity_after: number;
  unit_cost?: number;
  total_value?: number;

  // Reference information
  reference_type?: ReferenceType;
  reference_id?: string; // Can reference orders, purchase_orders, etc.
  reference_number?: string; // Human-readable reference

  // Additional details
  reason?: string;
  notes?: string;

  // Location & Staff
  branch_id?: string;
  branch?: Branch; // For populated queries
  created_by: string;
  created_by_user?: User; // For populated queries
  created_at: string;
}

export type StockMovementType =
  | "sale"
  | "purchase"
  | "adjustment"
  | "return"
  | "transfer"
  | "waste"
  | "initial";

export type ReferenceType =
  | "order"
  | "purchase_order"
  | "adjustment"
  | "transfer";

export interface StockMovementFilters {
  product_id?: string;
  movement_type?: StockMovementType;
  reference_type?: ReferenceType;
  branch_id?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  min_quantity?: number;
  max_quantity?: number;
  search?: string; // Search in product name, reference number, notes
}

export interface CreateStockMovement {
  product_id: string;
  movement_type: StockMovementType;
  quantity_change: number;
  unit_cost?: number;
  reference_type?: ReferenceType;
  reference_id?: string;
  reference_number?: string;
  reason?: string;
  notes?: string;
  branch_id?: string;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier?: Supplier; // For populated queries
  branch_id?: string;
  branch?: Branch; // For populated queries

  status: PurchaseOrderStatus;

  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;

  order_date: string;
  expected_date?: string;
  received_date?: string;

  notes?: string;
  items: PurchaseOrderItem[];

  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_user?: User; // For populated queries
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product?: Product; // For populated queries

  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;

  notes?: string;
  created_at?: string;
}

export type PurchaseOrderStatus =
  | "draft"
  | "sent"
  | "confirmed"
  | "partial"
  | "completed"
  | "cancelled";

export interface PurchaseOrderFormData {
  supplier_id: string;
  branch_id?: string;
  expected_date?: string;
  notes?: string;
  items: CreatePurchaseOrderItem[];
}

export interface CreatePurchaseOrderItem {
  product_id: string;
  quantity_ordered: number;
  unit_cost: number;
  notes?: string;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplier_id?: string;
  branch_id?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  po_number?: string;
  search?: string; // Search in PO number, supplier name, notes
}

export interface UpdatePurchaseOrderStatus {
  purchase_order_id: string;
  status: PurchaseOrderStatus;
  notes?: string;
  received_date?: string;
}

export interface ReceivePurchaseOrderItem {
  purchase_order_item_id: string;
  quantity_received: number;
  actual_unit_cost?: number; // If different from ordered cost
  notes?: string;
}

// Inventory Summary and Analytics
export interface InventorySummary {
  total_products: number;
  total_inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_stock_movements_today: number;
  pending_purchase_orders: number;
  inventory_turnover_rate: number;
}

export interface ProductInventoryStatus {
  product_id: string;
  product_name: string;
  sku?: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  stock_status: "healthy" | "low" | "critical" | "out_of_stock";
  days_of_supply?: number;
  reorder_point?: number;
  suggested_order_quantity?: number;
  last_movement_date?: string;
  last_purchase_date?: string;
  supplier_name?: string;
  category_name?: string;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  shortage: number;
  category_name?: string;
  supplier_name?: string;
  last_restocked?: string;
  suggested_order_quantity?: number;
}

export interface InventoryAdjustment {
  id: string;
  adjustment_number: string;
  branch_id?: string;
  branch?: Branch;
  reason: AdjustmentReason;
  notes?: string;
  items: InventoryAdjustmentItem[];
  total_adjustment_value: number;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_by_user?: User;
  approved_by?: string;
  approved_by_user?: User;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

export interface InventoryAdjustmentItem {
  id: string;
  adjustment_id: string;
  product_id: string;
  product?: Product;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  unit_cost?: number;
  adjustment_value: number;
  reason?: string;
  notes?: string;
}

export type AdjustmentReason =
  | "physical_count"
  | "damage"
  | "expiry"
  | "theft"
  | "correction"
  | "other";

export interface CreateInventoryAdjustment {
  branch_id?: string;
  reason: AdjustmentReason;
  notes?: string;
  items: CreateInventoryAdjustmentItem[];
}

export interface CreateInventoryAdjustmentItem {
  product_id: string;
  quantity_after: number;
  unit_cost?: number;
  reason?: string;
  notes?: string;
}

// Inventory Reports
export interface InventoryValueReport {
  categories: {
    category_id: string;
    category_name: string;
    total_value: number;
    product_count: number;
    percentage: number;
  }[];
  total_inventory_value: number;
  by_branch?: {
    branch_id: string;
    branch_name: string;
    total_value: number;
    percentage: number;
  }[];
}

export interface StockMovementReport {
  period: string;
  movements: {
    date: string;
    movement_type: StockMovementType;
    total_movements: number;
    total_value: number;
  }[];
  summary: {
    total_in: number;
    total_out: number;
    net_change: number;
    value_in: number;
    value_out: number;
    net_value_change: number;
  };
}

// Reference types (to be imported from their respective files)
interface Product {
  id: string;
  name: string;
  sku?: string;
}

interface Supplier {
  id: string;
  name: string;
  supplier_code?: string;
}

interface Branch {
  id: string;
  name: string;
}

interface User {
  id: string;
  display_name: string;
}
