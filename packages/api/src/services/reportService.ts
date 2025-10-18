import { supabase } from "../supabase";
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Enhanced Report data types with new schema fields
export interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topPaymentMethod: string;
  growth?: number;
  // Enhanced fields
  totalProfit?: number;
  profitMargin?: number;
  b2bSales?: number;
  walkInSales?: number;
  deliveryOrders?: number;
  pendingPayments?: number;
  customerTypes?: Record<string, number>;
  salesByRep?: Record<string, number>;
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
  // Enhanced fields
  totalCost?: number;
  grossProfit?: number;
  profitPerUnit?: number;
  supplier?: string;
  stockTurnover?: number;
  reorderPoint?: boolean;
  topShopTypes?: Array<{ type: string; quantity: number }>;
}

export interface CustomerReport {
  date: string;
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  customerRetentionRate: number;
  averageOrdersPerCustomer: number;
  // Enhanced fields
  b2bCustomers: number;
  walkInCustomers: number;
  phoneOrderCustomers: number;
  repeatCustomers: number;
  customerLifetimeValue: number;
  topCustomerSegments: Array<{ type: string; count: number; revenue: number }>;
  shopTypeDistribution: Record<string, number>;
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
  // Enhanced fields
  productCosts: number;
  deliveryCosts: number;
  operationalExpenses: number;
  salesCommissions: number;
  costBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  profitByCategory: Array<{ category: string; profit: number; margin: number }>;
  profitByBranch: Array<{
    branchId: string;
    branchName: string;
    profit: number;
  }>;
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
  // Enhanced fields
  totalProfit: number;
  profitMargin: number;
  customerTypes: Record<string, number>;
  deliveryVsPickup: { delivery: number; pickup: number };
  paymentMethods: Record<string, number>;
  priorityOrders: Record<string, number>;
  averageDeliveryTime?: number;
  customerSatisfaction?: number;
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
  private requestCache = new Map<string, { timestamp: number; promise: Promise<any> }>();
  private readonly CACHE_DURATION = 5000; // 5 seconds cache

  // Request deduplication helper
  private async deduplicateRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = this.requestCache.get(cacheKey);

    // Return cached promise if it's still valid
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.promise;
    }

    // Create new request and cache it
    const promise = requestFn();
    this.requestCache.set(cacheKey, { timestamp: now, promise });

    // Clean up cache after request completes
    promise.finally(() => {
      setTimeout(() => {
        this.requestCache.delete(cacheKey);
      }, this.CACHE_DURATION);
    });

    return promise;
  }
  // Enhanced Sales Reports with new schema fields
  async getSalesReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<SalesReport[]>> {
    try {
      // Add caching key to prevent duplicate requests
      const cacheKey = `sales-report-${JSON.stringify(filters)}`;

      return this.deduplicateRequest(cacheKey, async () => {
        let query = supabase.from("orders").select(`
          id,
          total,
          subtotal,
          payment_method,
          payment_status,
          customer_type,
          shop_type,
          delivery_method,
          priority,
          sales_rep,
          created_at,
          branch_id,
          items:order_items(
            quantity,
            unit_price,
            total_price,
            cost_price
          )
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

      // Add strict limit to prevent large queries
      const limit = filters.limit || 100; // Reduced default limit
      query = query.limit(limit);

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
          totalProfit: number;
          customerTypes: Record<string, number>;
          deliveryMethods: Record<string, number>;
          salesByRep: Record<string, number>;
          pendingPayments: number;
          b2bSales: number;
          walkInSales: number;
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
            totalProfit: 0,
            customerTypes: {},
            deliveryMethods: {},
            salesByRep: {},
            pendingPayments: 0,
            b2bSales: 0,
            walkInSales: 0,
          });
        }

        const dayData = salesData.get(key)!;
        dayData.totalSales += order.total;
        dayData.totalOrders += 1;

        // Payment method tracking
        dayData.paymentMethods[order.payment_method] =
          (dayData.paymentMethods[order.payment_method] || 0) + 1;

        // Customer type tracking
        if (order.customer_type) {
          dayData.customerTypes[order.customer_type] =
            (dayData.customerTypes[order.customer_type] || 0) + 1;

          // B2B vs Walk-in tracking
          if (order.customer_type === "registered" || order.shop_type) {
            dayData.b2bSales += order.total;
          } else if (order.customer_type === "walk_in") {
            dayData.walkInSales += order.total;
          }
        }

        // Delivery method tracking
        if (order.delivery_method) {
          dayData.deliveryMethods[order.delivery_method] =
            (dayData.deliveryMethods[order.delivery_method] || 0) + 1;
        }

        // Sales rep tracking
        if (order.sales_rep) {
          dayData.salesByRep[order.sales_rep] =
            (dayData.salesByRep[order.sales_rep] || 0) + order.total;
        }

        // Pending payments tracking
        if (
          order.payment_status === "pending" ||
          order.payment_status === "partial"
        ) {
          dayData.pendingPayments += order.total;
        }

        // Calculate profit from order items
        if (order.items && Array.isArray(order.items)) {
          const orderProfit = order.items.reduce((profit, item) => {
            if (item.cost_price && item.total_price) {
              return (
                profit + (item.total_price - item.cost_price * item.quantity)
              );
            }
            return profit;
          }, 0);
          dayData.totalProfit += orderProfit;
        }
      });

      // Convert to report format
      const reports: SalesReport[] = Array.from(salesData.entries()).map(
        ([date, data]) => {
          const topPaymentMethod =
            Object.entries(data.paymentMethods).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "cash";

          const profitMargin =
            data.totalSales > 0
              ? (data.totalProfit / data.totalSales) * 100
              : 0;
          const deliveryOrders = data.deliveryMethods["delivery"] || 0;

          return {
            date,
            totalSales: data.totalSales,
            totalOrders: data.totalOrders,
            averageOrderValue:
              data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0,
            topPaymentMethod,
            totalProfit: data.totalProfit,
            profitMargin,
            b2bSales: data.b2bSales,
            walkInSales: data.walkInSales,
            deliveryOrders,
            pendingPayments: data.pendingPayments,
            customerTypes: data.customerTypes,
            salesByRep: data.salesByRep,
          };
        }
      );

      return createSuccessResponse(reports);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Enhanced Product Performance Report
  async getProductReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<ProductReport[]>> {
    try {
      // Get order items with enhanced schema fields
      let itemsQuery = supabase.from("order_items").select(`
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          cost_price,
          order:orders!inner(
            created_at, 
            branch_id,
            customer_type,
            shop_type
          )
        `);

      // Apply date filters to orders
      if (filters.startDate) {
        itemsQuery = itemsQuery.gte("order.created_at", filters.startDate);
      }

      if (filters.endDate) {
        itemsQuery = itemsQuery.lte("order.created_at", filters.endDate);
      }

      if (filters.branchId) {
        itemsQuery = itemsQuery.eq("order.branch_id", filters.branchId);
      }

      // Get enhanced product details with supplier information
      const [itemsResponse, productsResponse] = await Promise.all([
        itemsQuery,
        supabase.from("products").select(`
          id,
          name,
          sku,
          stock,
          min_stock,
          price,
          cost_price,
          category:categories(id, name),
          supplier:suppliers(id, name, contact_person)
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

      // Group by product with enhanced analytics
      const productData = new Map<
        string,
        {
          productName: string;
          sku?: string;
          category?: string;
          supplier?: string;
          quantitySold: number;
          revenue: number;
          totalCost: number;
          prices: number[];
          stockLevel: number;
          minStock: number;
          shopTypes: Record<string, number>;
          customerTypes: Record<string, number>;
        }
      >();

      orderItems?.forEach((item) => {
        const productKey = item.product_id || item.product_name;
        const product = item.product_id
          ? productsMap.get(item.product_id)
          : null;
        const order = item.order as any;

        if (!productData.has(productKey)) {
          productData.set(productKey, {
            productName: item.product_name,
            sku: product?.sku,
            category: Array.isArray(product?.category)
              ? product?.category[0]?.name
              : (product?.category as any)?.name,
            supplier: Array.isArray(product?.supplier)
              ? product?.supplier[0]?.name
              : (product?.supplier as any)?.name,
            quantitySold: 0,
            revenue: 0,
            totalCost: 0,
            prices: [],
            stockLevel: product?.stock || 0,
            minStock: product?.min_stock || 0,
            shopTypes: {},
            customerTypes: {},
          });
        }

        const productEntry = productData.get(productKey)!;
        productEntry.quantitySold += item.quantity;
        productEntry.revenue += item.total_price;
        productEntry.prices.push(item.unit_price);

        // Calculate cost - use item cost_price if available, otherwise product cost_price
        const itemCost = item.cost_price || product?.cost_price || 0;
        productEntry.totalCost += itemCost * item.quantity;

        // Track shop types
        if (order.shop_type) {
          productEntry.shopTypes[order.shop_type] =
            (productEntry.shopTypes[order.shop_type] || 0) + item.quantity;
        }

        // Track customer types
        if (order.customer_type) {
          productEntry.customerTypes[order.customer_type] =
            (productEntry.customerTypes[order.customer_type] || 0) +
            item.quantity;
        }
      });

      // Convert to enhanced report format
      const reports: ProductReport[] = Array.from(productData.entries())
        .map(([productId, data]) => {
          const averagePrice =
            data.prices.length > 0
              ? data.prices.reduce((sum, price) => sum + price, 0) /
                data.prices.length
              : 0;

          const grossProfit = data.revenue - data.totalCost;
          const profitMargin =
            data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0;
          const profitPerUnit =
            data.quantitySold > 0 ? grossProfit / data.quantitySold : 0;

          // Calculate stock turnover (simplified)
          const stockTurnover =
            data.stockLevel > 0 ? data.quantitySold / data.stockLevel : 0;

          // Check if reorder point reached
          const reorderPoint = data.stockLevel <= data.minStock;

          // Get top shop types
          const topShopTypes = Object.entries(data.shopTypes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([type, quantity]) => ({ type, quantity }));

          // Determine sales trend (simplified - could be enhanced with historical data)
          let salesTrend: "up" | "down" | "stable" = "stable";
          if (stockTurnover > 2) salesTrend = "up";
          else if (stockTurnover < 0.5) salesTrend = "down";

          return {
            productId,
            productName: data.productName,
            sku: data.sku,
            category: data.category,
            quantitySold: data.quantitySold,
            revenue: data.revenue,
            averagePrice,
            profitMargin,
            stockLevel: data.stockLevel,
            salesTrend,
            totalCost: data.totalCost,
            grossProfit,
            profitPerUnit,
            supplier: data.supplier,
            stockTurnover,
            reorderPoint,
            topShopTypes,
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

  // Enhanced Branch Comparison Report
  async getBranchComparisonReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<BranchComparisonReport[]>> {
    try {
      // Get all branches
      const { data: branches, error: branchError } = await supabase
        .from("branches")
        .select("id, name, address, phone")
        .eq("is_active", true);

      if (branchError) {
        return createErrorResponse(handleSupabaseError(branchError));
      }

      // Get enhanced orders with detailed analysis
      let ordersQuery = supabase.from("orders").select(`
          id,
          total,
          subtotal,
          branch_id,
          customer_type,
          payment_method,
          payment_status,
          delivery_method,
          priority,
          created_at,
          items:order_items(
            product_name, 
            quantity, 
            total_price,
            cost_price,
            unit_price
          )
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

      // Process enhanced data for each branch
      const branchData = new Map<
        string,
        {
          name: string;
          totalSales: number;
          totalOrders: number;
          totalProfit: number;
          staffCount: number;
          productSales: Map<string, number>;
          customerTypes: Record<string, number>;
          paymentMethods: Record<string, number>;
          deliveryMethods: Record<string, number>;
          priorityOrders: Record<string, number>;
          averageOrderValue: number;
          deliveryOrdersCount: number;
          pickupOrdersCount: number;
        }
      >();

      // Initialize branch data
      branches?.forEach((branch) => {
        branchData.set(branch.id, {
          name: branch.name,
          totalSales: 0,
          totalOrders: 0,
          totalProfit: 0,
          staffCount: 0,
          productSales: new Map(),
          customerTypes: {},
          paymentMethods: {},
          deliveryMethods: {},
          priorityOrders: {},
          averageOrderValue: 0,
          deliveryOrdersCount: 0,
          pickupOrdersCount: 0,
        });
      });

      // Count staff per branch
      staff?.forEach((member) => {
        if (member.branch_id && branchData.has(member.branch_id)) {
          branchData.get(member.branch_id)!.staffCount += 1;
        }
      });

      // Process orders with enhanced analytics
      orders?.forEach((order) => {
        if (order.branch_id && branchData.has(order.branch_id)) {
          const branch = branchData.get(order.branch_id)!;
          branch.totalSales += order.total;
          branch.totalOrders += 1;

          // Track customer types
          if (order.customer_type) {
            branch.customerTypes[order.customer_type] =
              (branch.customerTypes[order.customer_type] || 0) + 1;
          }

          // Track payment methods
          if (order.payment_method) {
            branch.paymentMethods[order.payment_method] =
              (branch.paymentMethods[order.payment_method] || 0) + 1;
          }

          // Track delivery methods
          if (order.delivery_method) {
            branch.deliveryMethods[order.delivery_method] =
              (branch.deliveryMethods[order.delivery_method] || 0) + 1;

            if (order.delivery_method === "delivery") {
              branch.deliveryOrdersCount += 1;
            } else if (order.delivery_method === "pickup") {
              branch.pickupOrdersCount += 1;
            }
          }

          // Track priority orders
          if (order.priority) {
            branch.priorityOrders[order.priority] =
              (branch.priorityOrders[order.priority] || 0) + 1;
          }

          // Calculate profit from order items
          if (order.items && Array.isArray(order.items)) {
            const orderProfit = order.items.reduce((profit, item) => {
              if (item.cost_price && item.total_price) {
                return (
                  profit + (item.total_price - item.cost_price * item.quantity)
                );
              }
              return profit;
            }, 0);
            branch.totalProfit += orderProfit;

            // Track product sales
            order.items.forEach((item) => {
              const current = branch.productSales.get(item.product_name) || 0;
              branch.productSales.set(
                item.product_name,
                current + item.quantity
              );
            });
          }
        }
      });

      // Convert to enhanced report format
      const reports: BranchComparisonReport[] = Array.from(branchData.entries())
        .map(([branchId, data]) => {
          const averageOrderValue =
            data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0;
          const profitMargin =
            data.totalSales > 0
              ? (data.totalProfit / data.totalSales) * 100
              : 0;

          // Get top selling product
          const topSellingProduct =
            Array.from(data.productSales.entries()).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "ไม่มีข้อมูล";

          // Determine performance based on profit margin and sales volume
          let performance: "excellent" | "good" | "average" | "poor";
          if (profitMargin > 30 && data.totalSales > 100000) {
            performance = "excellent";
          } else if (profitMargin > 20 && data.totalSales > 50000) {
            performance = "good";
          } else if (profitMargin > 10 && data.totalSales > 25000) {
            performance = "average";
          } else {
            performance = "poor";
          }

          return {
            branchId,
            branchName: data.name,
            totalSales: data.totalSales,
            totalOrders: data.totalOrders,
            averageOrderValue,
            topSellingProduct,
            staffCount: data.staffCount,
            performance,
            totalProfit: data.totalProfit,
            profitMargin,
            customerTypes: data.customerTypes,
            deliveryVsPickup: {
              delivery: data.deliveryOrdersCount,
              pickup: data.pickupOrdersCount,
            },
            paymentMethods: data.paymentMethods,
            priorityOrders: data.priorityOrders,
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
      totalSuppliers?: number;
      outOfStockProducts?: number;
      featuredProducts?: number;
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
        outOfStockProductsQuery,
        featuredProductsQuery,
        suppliersQuery,
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
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("stock", 0),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_featured", true),
        supabase.from("suppliers").select("*", { count: "exact", head: true }),
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
        totalSuppliers: suppliersQuery.count || 0,
        outOfStockProducts: outOfStockProductsQuery.count || 0,
        featuredProducts: featuredProductsQuery.count || 0,
      };

      return createSuccessResponse(summary);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Enhanced Customer Analytics Report
  async getCustomerReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<CustomerReport[]>> {
    try {
      // Get customer data with order history
      let customersQuery = supabase.from("customers").select(`
        id,
        customer_code,
        customer_type,
        company_name,
        first_name,
        last_name,
        created_at,
        orders(
          id,
          total,
          subtotal,
          customer_type,
          shop_type,
          created_at,
          items:order_items(
            quantity,
            total_price,
            cost_price
          )
        )
      `);

      // Apply date filters if needed
      if (filters.startDate) {
        customersQuery = customersQuery.gte("created_at", filters.startDate);
      }

      if (filters.endDate) {
        customersQuery = customersQuery.lte("created_at", filters.endDate);
      }

      const { data: customers, error } = await customersQuery;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      // Group by date based on groupBy parameter
      const groupBy = filters.groupBy || "day";
      const customerData = new Map<
        string,
        {
          newCustomers: number;
          returningCustomers: number;
          totalCustomers: number;
          b2bCustomers: number;
          walkInCustomers: number;
          phoneOrderCustomers: number;
          repeatCustomers: number;
          customerLifetimeValue: number;
          customerSegments: Map<string, { count: number; revenue: number }>;
          shopTypeDistribution: Record<string, number>;
          totalRevenue: number;
          totalOrders: number;
        }
      >();

      // Process customers and their order data
      customers?.forEach((customer) => {
        const customerDate = new Date(customer.created_at);
        let key: string;

        switch (groupBy) {
          case "week":
            const weekStart = new Date(customerDate);
            weekStart.setDate(customerDate.getDate() - customerDate.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            key = `${customerDate.getFullYear()}-${(customerDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            break;
          case "year":
            key = customerDate.getFullYear().toString();
            break;
          default: // day
            key = customerDate.toISOString().split("T")[0];
        }

        if (!customerData.has(key)) {
          customerData.set(key, {
            newCustomers: 0,
            returningCustomers: 0,
            totalCustomers: 0,
            b2bCustomers: 0,
            walkInCustomers: 0,
            phoneOrderCustomers: 0,
            repeatCustomers: 0,
            customerLifetimeValue: 0,
            customerSegments: new Map(),
            shopTypeDistribution: {},
            totalRevenue: 0,
            totalOrders: 0,
          });
        }

        const dayData = customerData.get(key)!;
        dayData.newCustomers += 1;
        dayData.totalCustomers += 1;

        // Calculate customer lifetime value and order patterns
        let customerOrderCount = 0;
        let customerTotalSpent = 0;

        if (customer.orders && Array.isArray(customer.orders)) {
          customerOrderCount = customer.orders.length;
          customerTotalSpent = customer.orders.reduce((total, order) => {
            dayData.totalOrders += 1;
            return total + order.total;
          }, 0);

          dayData.totalRevenue += customerTotalSpent;
          dayData.customerLifetimeValue += customerTotalSpent;

          // Classify customer types from orders
          customer.orders.forEach((order) => {
            if (order.customer_type) {
              switch (order.customer_type) {
                case "registered":
                  if (order.shop_type) {
                    dayData.b2bCustomers += 1;
                    // Track shop type distribution
                    dayData.shopTypeDistribution[order.shop_type] =
                      (dayData.shopTypeDistribution[order.shop_type] || 0) + 1;
                  }
                  break;
                case "walk_in":
                  dayData.walkInCustomers += 1;
                  break;
                case "phone_order":
                  dayData.phoneOrderCustomers += 1;
                  break;
                case "repeat_customer":
                  dayData.repeatCustomers += 1;
                  break;
              }
            }
          });
        }

        // Determine if returning customer (has more than 1 order)
        if (customerOrderCount > 1) {
          dayData.returningCustomers += 1;
          dayData.newCustomers -= 1; // Adjust new customer count
        }

        // Classify customer segment based on spend
        const segmentType = customer.customer_type || "individual";
        const segment = dayData.customerSegments.get(segmentType) || {
          count: 0,
          revenue: 0,
        };
        segment.count += 1;
        segment.revenue += customerTotalSpent;
        dayData.customerSegments.set(segmentType, segment);
      });

      // Convert to report format
      const reports: CustomerReport[] = Array.from(customerData.entries()).map(
        ([date, data]) => {
          const customerRetentionRate =
            data.totalCustomers > 0
              ? (data.returningCustomers / data.totalCustomers) * 100
              : 0;

          const averageOrdersPerCustomer =
            data.totalCustomers > 0
              ? data.totalOrders / data.totalCustomers
              : 0;

          const avgCustomerLifetimeValue =
            data.totalCustomers > 0
              ? data.customerLifetimeValue / data.totalCustomers
              : 0;

          // Convert customer segments map to array
          const topCustomerSegments = Array.from(
            data.customerSegments.entries()
          )
            .map(([type, segment]) => ({
              type,
              count: segment.count,
              revenue: segment.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue);

          return {
            date,
            newCustomers: data.newCustomers,
            returningCustomers: data.returningCustomers,
            totalCustomers: data.totalCustomers,
            customerRetentionRate,
            averageOrdersPerCustomer,
            b2bCustomers: data.b2bCustomers,
            walkInCustomers: data.walkInCustomers,
            phoneOrderCustomers: data.phoneOrderCustomers,
            repeatCustomers: data.repeatCustomers,
            customerLifetimeValue: avgCustomerLifetimeValue,
            topCustomerSegments,
            shopTypeDistribution: data.shopTypeDistribution,
          };
        }
      );

      return createSuccessResponse(reports);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Enhanced Profit & Loss Report
  async getProfitLossReport(
    filters: ReportFilters = {}
  ): Promise<ApiResponse<ProfitLossReport[]>> {
    try {
      // Get orders with detailed cost tracking
      let ordersQuery = supabase.from("orders").select(`
        id,
        total,
        subtotal,
        delivery_fee,
        created_at,
        branch_id,
        items:order_items(
          quantity,
          unit_price,
          total_price,
          cost_price
        )
      `);

      // Apply filters
      if (filters.startDate) {
        ordersQuery = ordersQuery.gte("created_at", filters.startDate);
      }

      if (filters.endDate) {
        ordersQuery = ordersQuery.lte("created_at", filters.endDate);
      }

      if (filters.branchId) {
        ordersQuery = ordersQuery.eq("branch_id", filters.branchId);
      }

      const { data: orders, error } = await ordersQuery;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      // Get product categories for profit breakdown
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name");

      if (categoriesError) {
        return createErrorResponse(handleSupabaseError(categoriesError));
      }

      // Group by time period
      const groupBy = filters.groupBy || "month";
      const profitData = new Map<
        string,
        {
          revenue: number;
          productCosts: number;
          deliveryCosts: number;
          grossProfit: number;
          categoryProfits: Map<string, { profit: number; revenue: number }>;
          branchProfits: Map<string, number>;
        }
      >();

      // Process orders
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
          default:
            key = date.toISOString().split("T")[0];
        }

        if (!profitData.has(key)) {
          profitData.set(key, {
            revenue: 0,
            productCosts: 0,
            deliveryCosts: 0,
            grossProfit: 0,
            categoryProfits: new Map(),
            branchProfits: new Map(),
          });
        }

        const periodData = profitData.get(key)!;
        periodData.revenue += order.total;
        periodData.deliveryCosts += order.delivery_fee || 0;

        // Calculate item-level profits
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (item.cost_price && item.total_price) {
              const itemCost = item.cost_price * item.quantity;
              const itemProfit = item.total_price - itemCost;

              periodData.productCosts += itemCost;
              periodData.grossProfit += itemProfit;
            }
          });
        }

        // Track branch profits
        if (order.branch_id) {
          const branchProfit =
            periodData.branchProfits.get(order.branch_id) || 0;
          const orderProfit = order.total - (order.delivery_fee || 0);
          periodData.branchProfits.set(
            order.branch_id,
            branchProfit + orderProfit
          );
        }
      });

      // Convert to report format
      const reports: ProfitLossReport[] = Array.from(profitData.entries()).map(
        ([period, data]) => {
          const grossProfitMargin =
            data.revenue > 0 ? (data.grossProfit / data.revenue) * 100 : 0;

          // Estimate operational expenses (simplified - could be from a dedicated expenses table)
          const operationalExpenses = data.revenue * 0.15; // 15% of revenue as operational costs
          const salesCommissions = data.revenue * 0.05; // 5% sales commissions

          const totalExpenses =
            operationalExpenses + salesCommissions + data.deliveryCosts;
          const netProfit = data.grossProfit - totalExpenses;
          const netProfitMargin =
            data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;

          // Cost breakdown
          const costBreakdown = [
            {
              category: "Product Costs",
              amount: data.productCosts,
              percentage:
                data.revenue > 0 ? (data.productCosts / data.revenue) * 100 : 0,
            },
            {
              category: "Delivery Costs",
              amount: data.deliveryCosts,
              percentage:
                data.revenue > 0
                  ? (data.deliveryCosts / data.revenue) * 100
                  : 0,
            },
            {
              category: "Operational Expenses",
              amount: operationalExpenses,
              percentage:
                data.revenue > 0
                  ? (operationalExpenses / data.revenue) * 100
                  : 0,
            },
            {
              category: "Sales Commissions",
              amount: salesCommissions,
              percentage:
                data.revenue > 0 ? (salesCommissions / data.revenue) * 100 : 0,
            },
          ];

          // Branch profit breakdown
          const profitByBranch = Array.from(data.branchProfits.entries()).map(
            ([branchId, profit]) => ({
              branchId,
              branchName: `Branch ${branchId}`, // Could be enhanced with actual branch names
              profit,
            })
          );

          return {
            period,
            revenue: data.revenue,
            cost: data.productCosts,
            grossProfit: data.grossProfit,
            grossProfitMargin,
            expenses: totalExpenses,
            netProfit,
            netProfitMargin,
            productCosts: data.productCosts,
            deliveryCosts: data.deliveryCosts,
            operationalExpenses,
            salesCommissions,
            costBreakdown,
            profitByCategory: [], // Could be enhanced with category-specific data
            profitByBranch,
          };
        }
      );

      return createSuccessResponse(reports);
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
