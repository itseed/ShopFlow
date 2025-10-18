/**
 * Report Service - Analytics and Reporting
 * Consolidates: reportService, analyticsService
 * Phase 1: Foundation Refactor
 */

import { supabase } from "../supabase";
import type { Database } from "@shopflow/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];

/**
 * Sales Reports
 */
export const sales = {
  /**
   * Get daily sales report
   */
  async daily(params: {
    branchId?: string;
    date?: string;
  }) {
    const date = params.date || new Date().toISOString().split("T")[0];
    const startDate = `${date}T00:00:00`;
    const endDate = `${date}T23:59:59`;

    let query = supabase
      .from("orders")
      .select("id, total_amount, payment_status, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (params.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const orders = data as Order[];
    const completed = orders.filter((o) => o.payment_status === "paid");

    return {
      date,
      totalOrders: orders.length,
      completedOrders: completed.length,
      totalRevenue: completed.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      averageOrderValue:
        completed.length > 0
          ? completed.reduce((sum, o) => sum + (o.total_amount || 0), 0) /
            completed.length
          : 0,
    };
  },

  /**
   * Get sales report by date range
   */
  async byDateRange(params: {
    branchId?: string;
    startDate: string;
    endDate: string;
  }) {
    let query = supabase
      .from("orders")
      .select("id, total_amount, payment_status, created_at")
      .gte("created_at", params.startDate)
      .lte("created_at", params.endDate);

    if (params.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    const { data, error } = await query.order("created_at");
    if (error) throw error;

    const orders = data as Order[];
    const completed = orders.filter((o) => o.payment_status === "paid");

    // Group by date
    const dailySales = new Map<string, { revenue: number; orders: number }>();

    completed.forEach((order) => {
      const date = order.created_at?.split("T")[0] || "";
      const current = dailySales.get(date) || { revenue: 0, orders: 0 };
      dailySales.set(date, {
        revenue: current.revenue + (order.total_amount || 0),
        orders: current.orders + 1,
      });
    });

    return {
      totalOrders: orders.length,
      completedOrders: completed.length,
      totalRevenue: completed.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      averageOrderValue:
        completed.length > 0
          ? completed.reduce((sum, o) => sum + (o.total_amount || 0), 0) /
            completed.length
          : 0,
      dailyBreakdown: Array.from(dailySales.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      })),
    };
  },

  /**
   * Get sales by product
   */
  async byProduct(params: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let orderQuery = supabase.from("orders").select("id, created_at");

    if (params.branchId) {
      orderQuery = orderQuery.eq("branch_id", params.branchId);
    }

    if (params.startDate) {
      orderQuery = orderQuery.gte("created_at", params.startDate);
    }

    if (params.endDate) {
      orderQuery = orderQuery.lte("created_at", params.endDate);
    }

    const { data: orders, error: orderError } = await orderQuery;
    if (orderError) throw orderError;

    const orderIds = orders?.map((o) => o.id) || [];

    if (orderIds.length === 0) {
      return [];
    }

    const { data: items, error: itemError } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price, products(name, sku)")
      .in("order_id", orderIds);

    if (itemError) throw itemError;

    // Aggregate by product
    const productStats = new Map<
      string,
      {
        product_id: string;
        name: string;
        sku: string;
        quantity: number;
        revenue: number;
      }
    >();

    items?.forEach((item: any) => {
      const current = productStats.get(item.product_id) || {
        product_id: item.product_id,
        name: item.products?.name || "Unknown",
        sku: item.products?.sku || "",
        quantity: 0,
        revenue: 0,
      };

      productStats.set(item.product_id, {
        ...current,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.quantity * item.unit_price,
      });
    });

    const result = Array.from(productStats.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    return params.limit ? result.slice(0, params.limit) : result;
  },

  /**
   * Get sales by customer
   */
  async byCustomer(params: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = supabase
      .from("orders")
      .select("customer_id, total_amount, customers(name, phone)")
      .not("customer_id", "is", null)
      .eq("payment_status", "paid");

    if (params.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params.startDate) {
      query = query.gte("created_at", params.startDate);
    }

    if (params.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate by customer
    const customerStats = new Map<
      string,
      {
        customer_id: string;
        name: string;
        phone: string;
        orders: number;
        revenue: number;
      }
    >();

    data?.forEach((order: any) => {
      const current = customerStats.get(order.customer_id) || {
        customer_id: order.customer_id,
        name: order.customers?.name || "Unknown",
        phone: order.customers?.phone || "",
        orders: 0,
        revenue: 0,
      };

      customerStats.set(order.customer_id, {
        ...current,
        orders: current.orders + 1,
        revenue: current.revenue + (order.total_amount || 0),
      });
    });

    const result = Array.from(customerStats.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    return params.limit ? result.slice(0, params.limit) : result;
  },
};

/**
 * Inventory Reports
 */
export const inventory = {
  /**
   * Get current stock levels
   */
  async stockLevels(branchId?: string) {
    let query = supabase
      .from("products")
      .select("id, name, sku, stock_quantity, unit, categories(name)");

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query.order("stock_quantity");
    if (error) throw error;

    return data;
  },

  /**
   * Get low stock report
   */
  async lowStock(params: {
    branchId?: string;
    threshold?: number;
  }) {
    const threshold = params.threshold || 10;

    let query = supabase
      .from("products")
      .select("id, name, sku, stock_quantity, unit, categories(name)")
      .lte("stock_quantity", threshold)
      .gt("stock_quantity", 0);

    if (params.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    const { data, error } = await query.order("stock_quantity");
    if (error) throw error;

    return data;
  },

  /**
   * Get out of stock report
   */
  async outOfStock(branchId?: string) {
    let query = supabase
      .from("products")
      .select("id, name, sku, unit, categories(name)")
      .eq("stock_quantity", 0);

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query.order("name");
    if (error) throw error;

    return data;
  },

  /**
   * Get inventory movements report
   */
  async movements(params: {
    branchId?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
    movementType?: string;
  }) {
    let query = supabase
      .from("inventory_movements")
      .select("*, products(name, sku)");

    if (params.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params.productId) {
      query = query.eq("product_id", params.productId);
    }

    if (params.movementType) {
      query = query.eq("movement_type", params.movementType);
    }

    if (params.startDate) {
      query = query.gte("created_at", params.startDate);
    }

    if (params.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;

    return data;
  },

  /**
   * Get inventory value report
   */
  async value(branchId?: string) {
    let query = supabase
      .from("products")
      .select("id, name, sku, stock_quantity, price");

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const products = data as Product[];

    const totalValue = products.reduce(
      (sum, p) => sum + (p.stock_quantity || 0) * (p.price || 0),
      0
    );

    const totalItems = products.reduce(
      (sum, p) => sum + (p.stock_quantity || 0),
      0
    );

    return {
      totalValue,
      totalItems,
      totalProducts: products.length,
      products: products.map((p) => ({
        ...p,
        totalValue: (p.stock_quantity || 0) * (p.price || 0),
      })),
    };
  },
};

/**
 * Dashboard Analytics
 */
export const dashboard = {
  /**
   * Get dashboard overview
   */
  async overview(params: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const startDate =
      params.startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = params.endDate || new Date().toISOString();

    // Get sales data
    const salesData = await sales.byDateRange({
      branchId: params.branchId,
      startDate,
      endDate,
    });

    // Get inventory data
    let productsQuery = supabase
      .from("products")
      .select("stock_quantity", { count: "exact" });

    if (params.branchId) {
      productsQuery = productsQuery.eq("branch_id", params.branchId);
    }

    const { count: totalProducts, error: productsError } =
      await productsQuery;
    if (productsError) throw productsError;

    // Get low stock count
    let lowStockQuery = supabase
      .from("products")
      .select("id", { count: "exact" })
      .lte("stock_quantity", 10)
      .gt("stock_quantity", 0);

    if (params.branchId) {
      lowStockQuery = lowStockQuery.eq("branch_id", params.branchId);
    }

    const { count: lowStockCount, error: lowStockError } =
      await lowStockQuery;
    if (lowStockError) throw lowStockError;

    // Get customers count
    const { count: totalCustomers, error: customersError } = await supabase
      .from("customers")
      .select("id", { count: "exact" });
    if (customersError) throw customersError;

    return {
      sales: {
        totalOrders: salesData.totalOrders,
        totalRevenue: salesData.totalRevenue,
        averageOrderValue: salesData.averageOrderValue,
        dailyBreakdown: salesData.dailyBreakdown,
      },
      inventory: {
        totalProducts: totalProducts || 0,
        lowStockCount: lowStockCount || 0,
      },
      customers: {
        totalCustomers: totalCustomers || 0,
      },
    };
  },

  /**
   * Get trends analysis
   */
  async trends(params: {
    branchId?: string;
    days?: number;
  }) {
    const days = params.days || 7;
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();
    const endDate = new Date().toISOString();

    let query = supabase
      .from("orders")
      .select("id, total_amount, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .eq("payment_status", "paid");

    if (params.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    const { data, error } = await query.order("created_at");
    if (error) throw error;

    // Group by date
    const dailyData = new Map<string, { orders: number; revenue: number }>();

    data?.forEach((order: any) => {
      const date = order.created_at?.split("T")[0] || "";
      const current = dailyData.get(date) || { orders: 0, revenue: 0 };
      dailyData.set(date, {
        orders: current.orders + 1,
        revenue: current.revenue + (order.total_amount || 0),
      });
    });

    return Array.from(dailyData.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  },
};

/**
 * Report Service - Main Export
 */
export const reportService = {
  sales,
  inventory,
  dashboard,
};

export default reportService;
