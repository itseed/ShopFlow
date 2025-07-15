// Enhanced Order types for B2B Wholesale CMS
export interface Order {
  id: string;
  order_number: string;

  // Customer Information
  customer_type: CustomerType;
  customer_id?: string; // For registered customers
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  shop_name?: string; // ชื่อร้านค้า
  shop_type?: ShopType;
  branch_name?: string; // สาขาของลูกค้า (ถ้ามี)

  // Order Details
  subtotal: number;
  discount_amount: number;
  tax: number;
  delivery_fee: number;
  total: number;

  // Payment & Delivery
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_method: DeliveryMethod;
  delivery_address?: string;
  delivery_date?: string;

  // Status & Tracking
  status: OrderStatus;
  priority: OrderPriority;
  notes?: string;
  internal_notes?: string; // บันทึกภายใน

  // Relations
  items: OrderItem[];
  created_by?: string;
  sales_rep?: string; // พนักงานขาย
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // Stored at time of order
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product; // For populated queries (optional)
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled"
  | "refunded";
export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "e_wallet"
  | "credit"
  | "cheque";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "partial"
  | "overdue"
  | "refunded";
export type DeliveryMethod = "pickup" | "delivery" | "express" | "scheduled";
export type CustomerType =
  | "registered"
  | "walk_in"
  | "phone_order"
  | "repeat_customer";
export type ShopType =
  | "convenience_store"
  | "grocery_store"
  | "mini_mart"
  | "supermarket"
  | "restaurant"
  | "other";
export type OrderPriority = "low" | "normal" | "high" | "urgent";

export interface OrderFilters {
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  customer_type?: CustomerType;
  shop_type?: ShopType;
  delivery_method?: DeliveryMethod;
  priority?: OrderPriority;
  date_from?: string;
  date_to?: string;
  customer_name?: string;
  shop_name?: string;
  order_number?: string;
  sales_rep?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OrderSummary {
  total_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
}

export interface OrderStatusUpdate {
  order_id: string;
  status: OrderStatus;
  notes?: string;
}

// For creating new orders (from POS)
export interface CreateOrderData {
  customer_name?: string;
  customer_phone?: string;
  payment_method: PaymentMethod;
  branch_id?: string;
  items: CreateOrderItem[];
}

export interface CreateOrderItem {
  product_id: string;
  quantity: number;
  unit_price?: number; // Will use current product price if not provided
}

// Dashboard/reporting types
export interface DailySalesData {
  date: string;
  orders_count: number;
  total_revenue: number;
}

export interface TopSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

// References
import { Product } from "./Product";

interface Branch {
  id: string;
  name: string;
}
