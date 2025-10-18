// Dashboard and Analytics Types

export interface DashboardSummary {
  // Sales Metrics
  todaySales: number;
  todayOrders: number;
  salesGrowth: number;
  orderGrowth: number;

  // Product Metrics
  totalProducts: number;
  lowStockCount: number;
  outOfStockProducts: number;
  featuredProducts: number;
  topSellingProduct: string;

  // Business Metrics
  totalCustomers?: number;
  totalSuppliers?: number;
  totalCategories?: number;
  totalBranches?: number;

  // Financial Metrics
  monthlyRevenue?: number;
  monthlyProfit?: number;
  profitMargin?: number;

  // Additional Metrics
  pendingOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
}

export interface SalesMetrics {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  growth_rate: number;
  top_products: TopProduct[];
  sales_by_category: CategorySales[];
  sales_trend: SalesTrendPoint[];
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  profit?: number;
}

export interface CategorySales {
  category_id: string;
  category_name: string;
  total_sales: number;
  total_revenue: number;
  product_count: number;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
}

export interface InventoryMetrics {
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_inventory_value: number;
  avg_stock_level: number;
  stock_turnover_rate?: number;
}

export interface CustomerMetrics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  avg_customer_value: number;
  customer_retention_rate?: number;
  top_customers: TopCustomer[];
}

// Import from existing files to avoid duplicates
import type { TopCustomer } from "./Customer";
import type { BranchPerformance } from "./Branch";

// Re-export for convenience
export type { TopCustomer, BranchPerformance };

export interface RevenueBreakdown {
  cash: number;
  card: number;
  bank_transfer: number;
  e_wallet: number;
  credit: number;
  other: number;
}

export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  branch_id?: string;
  category_id?: string;
  period?: "today" | "week" | "month" | "quarter" | "year" | "custom";
}
