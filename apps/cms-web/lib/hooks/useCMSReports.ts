import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  reportService,
  orderService,
  userService,
  branchService,
  type ReportFilters,
} from "@shopflow/api";

// Query Keys
export const CMS_QUERY_KEYS = {
  SALES_REPORT: "cms-sales-report",
  PRODUCT_REPORT: "cms-product-report",
  INVENTORY_REPORT: "cms-inventory-report",
  BRANCH_COMPARISON: "cms-branch-comparison",
  DASHBOARD_SUMMARY: "cms-dashboard-summary",
  ORDER_STATS: "cms-order-stats",
  USER_STATS: "cms-user-stats",
  BRANCH_STATS: "cms-branch-stats",
  DAILY_SALES: "cms-daily-sales",
  POPULAR_PRODUCTS: "cms-popular-products",
  RECENT_ORDERS: "cms-recent-orders",
} as const;

// Sales Report Hooks
export function useSalesReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.SALES_REPORT, filters],
    queryFn: async () => {
      const response = await reportService.getSalesReport(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch sales report");
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
}

// Product Performance Report
export function useProductReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.PRODUCT_REPORT, filters],
    queryFn: async () => {
      const response = await reportService.getProductReport(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch product report");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Enhanced Inventory Report (using existing hook but with alias)
export { useInventoryReport } from "./useInventoryReports";

// Branch Comparison Report
export function useBranchComparisonReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.BRANCH_COMPARISON, filters],
    queryFn: async () => {
      const response = await reportService.getBranchComparisonReport(filters);
      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch branch comparison report"
        );
      }
      return response.data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Dashboard Summary
export function useDashboardSummary(branchId?: string) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.DASHBOARD_SUMMARY, branchId],
    queryFn: async () => {
      const response = await reportService.getDashboardSummary(branchId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard summary");
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Daily Sales Hook (specific for daily sales report)
export function useDailySalesReport(date: string, branchId?: string) {
  const startDate = date + "T00:00:00.000Z";
  const endDate = date + "T23:59:59.999Z";

  return useQuery({
    queryKey: [CMS_QUERY_KEYS.DAILY_SALES, date, branchId],
    queryFn: async () => {
      const [salesResponse, ordersResponse] = await Promise.all([
        reportService.getSalesReport({
          startDate,
          endDate,
          branchId,
          groupBy: "day",
        }),
        orderService.getOrdersByDateRange(startDate, endDate, branchId),
      ]);

      if (!salesResponse.success) {
        throw new Error(salesResponse.error || "Failed to fetch daily sales");
      }

      if (!ordersResponse.success) {
        throw new Error(ordersResponse.error || "Failed to fetch daily orders");
      }

      // Process data for hourly breakdown
      const orders = ordersResponse.data || [];
      const hourlyData = Array.from({ length: 18 }, (_, i) => {
        const hour = i + 6; // Start from 6 AM
        const hourStr = hour.toString().padStart(2, "0") + ":00";

        const hourOrders = orders.filter((order) => {
          if (!order.created_at) return false;
          const orderHour = new Date(order.created_at).getHours();
          return orderHour === hour;
        });

        return {
          hour: hourStr,
          sales: hourOrders.reduce((sum, order) => sum + order.total, 0),
          orders: hourOrders.length,
          customers: new Set(
            hourOrders.map(
              (order) =>
                order.customer_phone || order.customer_name || "anonymous"
            )
          ).size,
        };
      });

      // Calculate top products from order items
      const productSales = new Map<
        string,
        { sales: number; quantity: number; revenue: number }
      >();

      orders.forEach((order) => {
        order.items?.forEach((item) => {
          const current = productSales.get(item.product_name) || {
            sales: 0,
            quantity: 0,
            revenue: 0,
          };
          current.sales += item.total_price;
          current.quantity += item.quantity;
          current.revenue += item.total_price;
          productSales.set(item.product_name, current);
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate recent transactions
      const recentTransactions = orders
        .filter((order) => order.created_at) // Filter out orders without created_at
        .sort(
          (a, b) =>
            new Date(b.created_at!).getTime() -
            new Date(a.created_at!).getTime()
        )
        .slice(0, 10)
        .map((order) => ({
          time: new Date(order.created_at!).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          amount: order.total,
          items: order.items?.length || 0,
          cashier: "System", // TODO: Get from user profiles
        }));

      return {
        hourlyData,
        topProducts,
        recentTransactions,
        summary: salesResponse.data?.[0] || {
          date,
          totalSales: orders.reduce((sum, order) => sum + order.total, 0),
          totalOrders: orders.length,
          averageOrderValue:
            orders.length > 0
              ? orders.reduce((sum, order) => sum + order.total, 0) /
                orders.length
              : 0,
          topPaymentMethod: "cash",
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!date,
  });
}

// Popular Products Hook (specific for popular products report)
export function usePopularProductsReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.POPULAR_PRODUCTS, filters],
    queryFn: async () => {
      const response = await reportService.getProductReport(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch popular products");
      }

      const products = response.data || [];

      // Transform data for popular products page
      const transformedProducts = products.map((product, index) => ({
        id: index + 1,
        name: product.productName,
        category: product.category || "ไม่ระบุ",
        image: "/api/placeholder/60/60", // TODO: Get real product images
        sales: product.quantitySold,
        revenue: product.revenue,
        growth: Math.random() * 30 - 5, // TODO: Calculate real growth
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        views: Math.floor(Math.random() * 3000) + 1000, // Mock views
        likes: Math.floor(Math.random() * 300) + 50, // Mock likes
        stock: product.stockLevel,
        trend: product.revenue > 50000 ? "up" : "down",
      }));

      // Calculate summary stats
      const stats = [
        {
          label: "ยอดขายรวม",
          value: products
            .reduce((sum, p) => sum + p.revenue, 0)
            .toLocaleString(),
          change: 15.7, // TODO: Calculate real change
          changeType: "increase" as const,
        },
        {
          label: "จำนวนสินค้าที่ขาย",
          value: products.length.toString(),
          change: 8.2,
          changeType: "increase" as const,
        },
        {
          label: "สินค้าขายดี",
          value: products.filter((p) => p.quantitySold > 10).length.toString(),
          change: 12.4,
          changeType: "increase" as const,
        },
        {
          label: "มูลค่าสต็อก",
          value: products
            .reduce((sum, p) => sum + p.stockLevel * p.averagePrice, 0)
            .toLocaleString(),
          change: 5.1,
          changeType: "increase" as const,
        },
      ];

      return {
        products: transformedProducts,
        stats,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Recent Orders Hook
export function useRecentOrders(limit: number = 10, branchId?: string) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.RECENT_ORDERS, limit, branchId],
    queryFn: async () => {
      const response = await orderService.getAll({
        limit,
        branchId,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch recent orders");
      }

      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// Order Statistics Hook
export function useOrderStats(branchId?: string) {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.ORDER_STATS, branchId],
    queryFn: async () => {
      const response = await orderService.getStats(branchId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch order statistics");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// User Statistics Hook
export function useUserStats() {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.USER_STATS],
    queryFn: async () => {
      const [totalResponse, activeResponse] = await Promise.all([
        userService.count(),
        userService.count({ isActive: true }),
      ]);

      if (!totalResponse.success || !activeResponse.success) {
        throw new Error("Failed to fetch user statistics");
      }

      return {
        totalUsers: totalResponse.data || 0,
        activeUsers: activeResponse.data || 0,
        inactiveUsers: (totalResponse.data || 0) - (activeResponse.data || 0),
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Branch Statistics Hook
export function useBranchStats() {
  return useQuery({
    queryKey: [CMS_QUERY_KEYS.BRANCH_STATS],
    queryFn: async () => {
      const response = await branchService.getStats();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch branch statistics");
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Export Report Hook
export function useExportReport() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      reportType,
      filters,
    }: {
      reportType: "sales" | "products" | "inventory" | "branches";
      filters?: ReportFilters;
    }) => {
      const response = await reportService.exportReport(reportType, filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to export report");
      }
      return response.data;
    },
    onSuccess: (csvData) => {
      // Create and download CSV file
      const blob = new Blob([csvData || ""], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `report-${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "ส่งออกสำเร็จ",
        description: "ไฟล์รายงานถูกดาวน์โหลดเรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}
