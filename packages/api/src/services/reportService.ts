import { supabase } from "../supabase";
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Report data types
export interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topPaymentMethod: string;
  growth?: number;
}

export interface ProductReport {
  productId: string;
  productName: string;
  sku?: string;
  category?: string;
  quantitySold: number;
  revenue: number;
  averagePrice: number;
  profitMargin?: number;
  stockLevel: number;
  salesTrend: "up" | "down" | "stable";
}

export interface CustomerReport {
  date: string;
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  customerRetentionRate: number;
  averageOrdersPerCustomer: number;
}

export interface InventoryReport {
  productId: string;
  productName: string;
  sku?: string;
  category?: string;
  currentStock: number;
  minStock: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockValue: number;
  lastRestocked?: string;
  stockTurnover?: number;
}

export interface ProfitLossReport {
  period: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossProfitMargin: number;
  expenses: number;
  netProfit: number;
  netProfitMargin: number;
}

export interface BranchComparisonReport {
  branchId: string;
  branchName: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingProduct: string;
  staffCount: number;
  performance: "excellent" | "good" | "average" | "poor";
}

// Filter types for reports
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  categoryId?: string;
  productId?: string;
  groupBy?: "day" | "week" | "month" | "year";
  limit?: number;
}

class ReportService {
  // Sales Reports
  async getSalesReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<SalesReport[]>> {
    try {
      let query = supabase.from("orders").select(`
          id,
          total,
          payment_method,
          created_at,
          branch_id
        `);

      // Apply filters
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      query = query.order("created_at", { ascending: true });

      const { data: orders, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      // Group orders by date based on groupBy parameter
      const groupBy = filters.groupBy || "day";
      const salesData = new Map<
        string,
        {
          totalSales: number;
          totalOrders: number;
          paymentMethods: Record<string, number>;
        }
      >();

      orders?.forEach((order) => {
        const date = new Date(order.created_at);
        let key: string;

        switch (groupBy) {
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            key = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            break;
          case "year":
            key = date.getFullYear().toString();
            break;
          default: // day
            key = date.toISOString().split("T")[0];
        }

        if (!salesData.has(key)) {
          salesData.set(key, {
            totalSales: 0,
            totalOrders: 0,
            paymentMethods: {},
          });
        }

        const dayData = salesData.get(key)!;
        dayData.totalSales += order.total;
        dayData.totalOrders += 1;
        dayData.paymentMethods[order.payment_method] =
          (dayData.paymentMethods[order.payment_method] || 0) + 1;
      });

      // Convert to report format
      const reports: SalesReport[] = Array.from(salesData.entries()).map(
        ([date, data]) => {
          const topPaymentMethod =
            Object.entries(data.paymentMethods).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "cash";

          return {
            date,
            totalSales: data.totalSales,
            totalOrders: data.totalOrders,
            averageOrderValue:
              data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0,
            topPaymentMethod,
          };
        }
      );

      return createSuccessResponse(reports);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Product Performance Report
  async getProductReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<ProductReport[]>> {
    try {
      let itemsQuery = supabase.from("order_items").select(`
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          order:orders!inner(created_at, branch_id)
        `);

      // Get product details separately to avoid complex joins
      const [itemsResponse, productsResponse] = await Promise.all([
        itemsQuery,
        supabase.from("products").select(`
          id,
          name,
          sku,
          stock,
          category:categories(name)
        `),
      ]);

      if (itemsResponse.error) {
        return createErrorResponse(handleSupabaseError(itemsResponse.error));
      }

      if (productsResponse.error) {
        return createErrorResponse(handleSupabaseError(productsResponse.error));
      }

      const orderItems = itemsResponse.data || [];
      const products = productsResponse.data || [];
      const productsMap = new Map(products.map((p) => [p.id, p]));

      // Group by product
      const productData = new Map<
        string,
        {
          productName: string;
          sku?: string;
          category?: string;
          quantitySold: number;
          revenue: number;
          prices: number[];
          stockLevel: number;
        }
      >();

      orderItems?.forEach((item) => {
        const productKey = item.product_id || item.product_name;
        const product = item.product_id
          ? productsMap.get(item.product_id)
          : null;

        if (!productData.has(productKey)) {
          productData.set(productKey, {
            productName: item.product_name,
            sku: product?.sku,
            category: (product?.category as any)?.name,
            quantitySold: 0,
            revenue: 0,
            prices: [],
            stockLevel: product?.stock || 0,
          });
        }

        const productEntry = productData.get(productKey)!;
        productEntry.quantitySold += item.quantity;
        productEntry.revenue += item.total_price;
        productEntry.prices.push(item.unit_price);
      });

      // Convert to report format
      const reports: ProductReport[] = Array.from(productData.entries())
        .map(([productId, data]) => {
          const averagePrice =
            data.prices.length > 0
              ? data.prices.reduce((sum, price) => sum + price, 0) /
                data.prices.length
              : 0;

          return {
            productId,
            productName: data.productName,
            sku: data.sku,
            category: data.category,
            quantitySold: data.quantitySold,
            revenue: data.revenue,
            averagePrice,
            stockLevel: data.stockLevel,
            salesTrend: "stable" as const, // TODO: Calculate based on historical data
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      return createSuccessResponse(reports);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Inventory Report
  async getInventoryReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<InventoryReport[]>> {
    try {
      let query = supabase.from("products").select(`
          id,
          name,
          sku,
          stock,
          min_stock,
          price,
          updated_at,
          category:categories!inner(name)
        `);

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.productId) {
        query = query.eq("id", filters.productId);
      }

      query = query.order("name");

      const { data: products, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      const reports: InventoryReport[] =
        products?.map((product) => {
          let stockStatus: "in_stock" | "low_stock" | "out_of_stock";

          if (product.stock === 0) {
            stockStatus = "out_of_stock";
          } else if (product.stock <= product.min_stock) {
            stockStatus = "low_stock";
          } else {
            stockStatus = "in_stock";
          }

          return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            category: (product.category as any)?.name,
            currentStock: product.stock,
            minStock: product.min_stock,
            stockStatus,
            stockValue: product.stock * product.price,
            lastRestocked: product.updated_at,
          };
        }) || [];

      return createSuccessResponse(reports);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Branch Comparison Report
  async getBranchComparisonReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<BranchComparisonReport[]>> {
    try {
      // Get all branches
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, name")
        .eq("is_active", true);

      if (branchError) {
        return createErrorResponse(handleSupabaseError(branchError));
      }

      // Get orders with items for each branch
      let ordersQuery = supabase.from("orders").select(`
          id,
          total,
          branch_id,
          items:order_items(product_name, quantity, total_price)
        `);

      if (filters.startDate) {
        ordersQuery = ordersQuery.gte("created_at", filters.startDate);
      }

      if (filters.endDate) {
        ordersQuery = ordersQuery.lte("created_at", filters.endDate);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) {
        return createErrorResponse(handleSupabaseError(ordersError));
      }

      // Get staff count per branch
      const { data: staff, error: staffError } = await supabase
        .from("user_profiles")
        .select("branch_id")
        .eq("is_active", true);

      if (staffError) {
        return createErrorResponse(handleSupabaseError(staffError));
      }

      // Process data for each branch
      const branchData = new Map<
        string,
        {
          name: string;
          totalSales: number;
          totalOrders: number;
          staffCount: number;
          productSales: Map<string, number>;
        }
      >();

      // Initialize branch data
      branches?.forEach((branch) => {
        branchData.set(branch.id, {
          name: branch.name,
          totalSales: 0,
          totalOrders: 0,
          staffCount: 0,
          productSales: new Map(),
        });
      });

      // Process orders
      orders?.forEach((order) => {
        if (order.branch_id && branchData.has(order.branch_id)) {
          const branch = branchData.get(order.branch_id)!;
          branch.totalSales += order.total;
          branch.totalOrders += 1;

          // Track product sales
          order.items?.forEach((item) => {
            const current = branch.productSales.get(item.product_name) || 0;
            branch.productSales.set(item.product_name, current + item.quantity);
          });
        }
      });

      // Process staff counts
      staff?.forEach((member) => {
        if (member.branch_id && branchData.has(member.branch_id)) {
          branchData.get(member.branch_id)!.staffCount += 1;
        }
      });

      // Convert to report format
      const reports: BranchComparisonReport[] = Array.from(branchData.entries())
        .map(([branchId, data]) => {
          const averageOrderValue =
            data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0;

          // Get top selling product
          const topProduct =
            Array.from(data.productSales.entries()).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "No sales";

          // Simple performance calculation
          let performance: "excellent" | "good" | "average" | "poor";
          if (averageOrderValue >= 500) performance = "excellent";
          else if (averageOrderValue >= 300) performance = "good";
          else if (averageOrderValue >= 100) performance = "average";
          else performance = "poor";

          return {
            branchId,
            branchName: data.name,
            totalSales: data.totalSales,
            totalOrders: data.totalOrders,
            averageOrderValue,
            topSellingProduct: topProduct,
            staffCount: data.staffCount,
            performance,
          };
        })
        .sort((a, b) => b.totalSales - a.totalSales);

      return createSuccessResponse(reports);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Dashboard Summary
  async getDashboardSummary(branchId?: string): Promise<
    ApiResponse<{
      todaySales: number;
      todayOrders: number;
      totalProducts: number;
      lowStockCount: number;
      topSellingProduct: string;
      salesGrowth: number;
      orderGrowth: number;
    }>
  > {
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Build queries with optional branch filter
      let todayOrdersQuery = supabase
        .from("orders")
        .select("total")
        .gte("created_at", today);

      let yesterdayOrdersQuery = supabase
        .from("orders")
        .select("total")
        .gte("created_at", yesterday)
        .lt("created_at", today);

      if (branchId) {
        todayOrdersQuery = todayOrdersQuery.eq("branch_id", branchId);
        yesterdayOrdersQuery = yesterdayOrdersQuery.eq("branch_id", branchId);
      }

      // Execute queries
      const [
        todayOrders,
        yesterdayOrders,
        products,
        lowStockProducts,
        topProducts,
      ] = await Promise.all([
        todayOrdersQuery,
        yesterdayOrdersQuery,
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .filter("stock", "lte", "min_stock"),
        supabase
          .from("order_items")
          .select(
            `
          product_name,
          quantity,
          order:orders!inner(created_at${branchId ? ", branch_id" : ""})
        `
          )
          .gte("order.created_at", today),
      ]);

      // Calculate metrics
      const todaySales =
        todayOrders.data?.reduce((sum, order) => sum + order.total, 0) || 0;
      const todayOrderCount = todayOrders.data?.length || 0;

      const yesterdaySales =
        yesterdayOrders.data?.reduce((sum, order) => sum + order.total, 0) || 0;
      const yesterdayOrderCount = yesterdayOrders.data?.length || 0;

      const salesGrowth =
        yesterdaySales > 0
          ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
          : 0;
      const orderGrowth =
        yesterdayOrderCount > 0
          ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) *
            100
          : 0;

      // Find top selling product today
      const productSales = new Map<string, number>();
      topProducts.data?.forEach((item) => {
        const current = productSales.get(item.product_name) || 0;
        productSales.set(item.product_name, current + item.quantity);
      });

      const topSellingProduct =
        Array.from(productSales.entries()).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "No sales today";

      const summary = {
        todaySales,
        todayOrders: todayOrderCount,
        totalProducts: products.count || 0,
        lowStockCount: lowStockProducts.count || 0,
        topSellingProduct,
        salesGrowth: Math.round(salesGrowth * 100) / 100,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
      };

      return createSuccessResponse(summary);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Export data to CSV format
  async exportReport(
    reportType: "sales" | "products" | "inventory" | "branches",
    filters: ReportFilters = {}
  ): Promise<ApiResponse<string>> {
    try {
      let data: any[];
      let headers: string[];

      switch (reportType) {
        case "sales":
          const salesResponse = await this.getSalesReport(filters);
          if (!salesResponse.success)
            return createErrorResponse(
              salesResponse.error || "Failed to get sales report"
            );
          data = salesResponse.data!;
          headers = [
            "Date",
            "Total Sales",
            "Total Orders",
            "Average Order Value",
            "Top Payment Method",
          ];
          break;

        case "products":
          const productsResponse = await this.getProductReport(filters);
          if (!productsResponse.success)
            return createErrorResponse(
              productsResponse.error || "Failed to get products report"
            );
          data = productsResponse.data!;
          headers = [
            "Product Name",
            "SKU",
            "Category",
            "Quantity Sold",
            "Revenue",
            "Average Price",
            "Stock Level",
          ];
          break;

        case "inventory":
          const inventoryResponse = await this.getInventoryReport(filters);
          if (!inventoryResponse.success)
            return createErrorResponse(
              inventoryResponse.error || "Failed to get inventory report"
            );
          data = inventoryResponse.data!;
          headers = [
            "Product Name",
            "SKU",
            "Category",
            "Current Stock",
            "Min Stock",
            "Status",
            "Stock Value",
          ];
          break;

        case "branches":
          const branchesResponse = await this.getBranchComparisonReport(
            filters
          );
          if (!branchesResponse.success)
            return createErrorResponse(
              branchesResponse.error || "Failed to get branches report"
            );
          data = branchesResponse.data!;
          headers = [
            "Branch Name",
            "Total Sales",
            "Total Orders",
            "Average Order Value",
            "Top Product",
            "Staff Count",
            "Performance",
          ];
          break;

        default:
          return createErrorResponse("Invalid report type");
      }

      // Convert to CSV
      const csvHeaders = headers.join(",");
      const csvRows = data.map((row) => {
        return headers
          .map((header) => {
            const key = header.toLowerCase().replace(/\s+/g, "");
            const value = row[key] || "";
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",");
      });

      const csv = [csvHeaders, ...csvRows].join("\n");

      return createSuccessResponse(csv);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const reportService = new ReportService();
