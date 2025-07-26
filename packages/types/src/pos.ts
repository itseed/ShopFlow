// POS-specific types extending base types
import { Product, UserProfile, Branch, Category, Customer } from "./index";

// Authentication & Session Types
export interface UserSession {
  id: string;
  user_id: string;
  branch_id: string;
  pin_hash?: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface POSLoginCredentials {
  username: string;
  password: string;
  branch_code?: string;
}

export interface PinCredentials {
  pin: string;
  user_id: string;
  branch_id: string;
}

// Product & Stock Types
export interface BranchStock {
  id: string;
  branch_id: string;
  product_id: string;
  quantity: number;
  min_stock_level: number;
  updated_at: string;
}

export interface ProductWithStock extends Omit<Product, "stock"> {
  branch_stock: BranchStock;
  is_low_stock: boolean;
}

export interface StockMovement {
  id: string;
  branch_id: string;
  product_id: string;
  movement_type: "sale" | "return" | "adjustment" | "transfer";
  quantity: number;
  reference_id?: string;
  created_at: string;
  created_by: string;
}

// Cart & Order Types
export interface CartItem {
  id: string;
  product: ProductWithStock;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
}

export interface POSOrder {
  id: string;
  branch_id: string;
  customer_id?: string;
  user_id: string;
  shift_id?: string;
  status: "cart" | "held" | "completed" | "cancelled";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  created_at: string;
  completed_at?: string;
  receipt_number?: string;
}

export interface POSOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface OrderWithItems extends POSOrder {
  items: POSOrderItem[];
  customer?: Customer;
  payments: Payment[];
}

// Payment Types
export type POSPaymentMethod = "cash" | "card" | "qr" | "other";

export interface Payment {
  id: string;
  order_id: string;
  payment_method: POSPaymentMethod;
  amount: number;
  received_amount?: number;
  change_amount?: number;
  created_at: string;
}

export interface PaymentRequest {
  method: POSPaymentMethod;
  amount: number;
  received_amount?: number;
}

// Return Types
export interface Return {
  id: string;
  branch_id: string;
  original_order_id: string;
  user_id: string;
  shift_id?: string;
  reason: string;
  total_refund_amount: number;
  created_at: string;
  receipt_number: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  refund_amount: number;
  created_at: string;
  order_item?: POSOrderItem;
}

export interface ReturnWithItems extends Return {
  items: ReturnItem[];
  original_order: OrderWithItems;
  refund_payments: RefundPayment[];
}

export interface RefundPayment {
  id: string;
  return_id: string;
  payment_method: POSPaymentMethod;
  amount: number;
  created_at: string;
}

// Shift Types
export interface Shift {
  id: string;
  branch_id: string;
  user_id: string;
  shift_number: string;
  opened_at: string;
  closed_at?: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  cash_difference?: number;
  status: "open" | "closed";
  notes?: string;
}

export interface ShiftSummary {
  id: string;
  shift_id: string;
  total_sales: number;
  total_returns: number;
  cash_sales: number;
  card_sales: number;
  qr_sales: number;
  transaction_count: number;
  created_at: string;
}

export interface ShiftWithSummary extends Shift {
  summary: ShiftSummary;
  user: UserProfile;
}

// Receipt Types
export interface Receipt {
  order: OrderWithItems;
  branch: Branch;
  user: UserProfile;
  printed_at: string;
}

export interface ReturnReceipt {
  return: ReturnWithItems;
  branch: Branch;
  user: UserProfile;
  printed_at: string;
}

// POS UI State Types
export interface POSState {
  current_user: UserProfile;
  current_branch: Branch;
  current_shift?: Shift;
  cart: Cart;
  held_orders: POSOrder[];
  is_processing: boolean;
}

// Search & Filter Types
export interface ProductSearchFilters {
  category_id?: string;
  search_query?: string;
  in_stock_only?: boolean;
  low_stock_only?: boolean;
}

export interface OrderSearchFilters {
  date_from?: string;
  date_to?: string;
  receipt_number?: string;
  customer_name?: string;
  status?: POSOrder["status"];
}

// API Response Types
export interface POSApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface POSPaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Barcode Types
export interface BarcodeResult {
  code: string;
  format: string;
  product?: ProductWithStock;
}

// Print Types
export interface PrintOptions {
  copies?: number;
  printer_name?: string;
  paper_size?: "A4" | "thermal_58mm" | "thermal_80mm";
}
