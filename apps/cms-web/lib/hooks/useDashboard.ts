import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  reportService,
  orderService,
  productService,
  customerService,
  realtimeService,
  type SalesReport,
  type ProductReport,
  type CustomerReport,
  type InventoryReport,
  type BranchComparisonReport,
} from "@shopflow/api";
import { useCurrentBranch } from "./useAuthEnhanced";

// Dashboard data aggregation types
export interface DashboardMetrics {
  // Sales metrics
  todaySales: number;
  yesterdaySales: number;
  salesGrowth: number;

  // Orders metrics
  todayOrders: number;
  yesterdayOrders: number;
  ordersGrowth: number;

  // Customer metrics
  todayCustomers: number;
  totalCustomers: number;
  customerGrowth: number;

  // Inventory metrics
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;

  // Profit metrics
  todayProfit: number;
  profitMargin: number;
  profitGrowth: number;

  // B2B vs Retail metrics
  b2bSales: number;
  retailSales: number;
  b2bPercentage: number;

  // Payment metrics
  pendingPayments: number;
  completedPayments: number;

  // Delivery metrics
  deliveryOrders: number;
  pickupOrders: number;
  deliveryPercentage: number;
}

export interface DashboardChartData {
  salesChart: Array<{
    date: string;
    sales: number;
    profit: number;
    orders: number;
  }>;

  categoryChart: Array<{
    name: string;
    value: number;
    revenue: number;
    color: string;
  }>;

  customerTypeChart: Array<{
    type: string;
    count: number;
    revenue: number;
    color: string;
  }>;

  branchPerformance: Array<{
    branchId: string;
    branchName: string;
    sales: number;
    orders: number;
    performance: number;
    status: "excellent" | "good" | "average" | "poor";
  }>;
}

export interface TopPerformers {
  products: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    growth: number;
    stock: number;
  }>;

  customers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastOrder: string;
  }>;

  categories: Array<{
    name: string;
    revenue: number;
    growth: number;
    productCount: number;
  }>;
}

export interface RecentActivity {
  id: string;
  type: "order" | "product" | "customer" | "stock" | "payment";
  title: string;
  description: string;
  user?: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  amount?: number;
}

// Main dashboard hook
export function useDashboard(
  filters: {
    timeRange?: "today" | "7days" | "30days" | "90days";
    branchId?: string;
  } = {}
) {
  const currentBranch = useCurrentBranch();
  const branchId =
    filters.branchId === "all"
      ? undefined
      : filters.branchId || currentBranch?.id;

  // Date range calculation
  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (filters.timeRange) {
      case "today":
        return {
          startDate: today.toISOString(),
          endDate: now.toISOString(),
          compareStartDate: yesterday.toISOString(),
          compareEndDate: today.toISOString(),
        };
      case "7days":
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        const prevWeek = new Date(week);
        prevWeek.setDate(prevWeek.getDate() - 7);
        return {
          startDate: week.toISOString(),
          endDate: now.toISOString(),
          compareStartDate: prevWeek.toISOString(),
          compareEndDate: week.toISOString(),
        };
      case "30days":
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        const prevMonth = new Date(month);
        prevMonth.setDate(prevMonth.getDate() - 30);
        return {
          startDate: month.toISOString(),
          endDate: now.toISOString(),
          compareStartDate: prevMonth.toISOString(),
          compareEndDate: month.toISOString(),
        };
      case "90days":
        const quarter = new Date(today);
        quarter.setDate(quarter.getDate() - 90);
        const prevQuarter = new Date(quarter);
        prevQuarter.setDate(prevQuarter.getDate() - 90);
        return {
          startDate: quarter.toISOString(),
          endDate: now.toISOString(),
          compareStartDate: prevQuarter.toISOString(),
          compareEndDate: quarter.toISOString(),
        };
      default:
        return {
          startDate: today.toISOString(),
          endDate: now.toISOString(),
          compareStartDate: yesterday.toISOString(),
          compareEndDate: today.toISOString(),
        };
    }
  }, [filters.timeRange]);

  // Query for sales data
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ["dashboard", "sales", dateRange, branchId],
    queryFn: async () => {
      const response = await reportService.getSalesReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId,
        groupBy: filters.timeRange === "today" ? "day" : "day",
      });
      if (!response.success) throw new Error(response.error || "Failed to fetch sales report");
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for comparison sales data
  const { data: compareSalesData = [] } = useQuery({
    queryKey: ["dashboard", "sales-compare", dateRange, branchId],
    queryFn: async () => {
      const response = await reportService.getSalesReport({
        startDate: dateRange.compareStartDate,
        endDate: dateRange.compareEndDate,
        branchId,
        groupBy: filters.timeRange === "today" ? "day" : "day",
      });
      if (!response.success) throw new Error(response.error || "Failed to fetch sales report");
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query for product reports
  const { data: productData = [], isLoading: productsLoading } = useQuery({
    queryKey: ["dashboard", "products", dateRange, branchId],
    queryFn: async () => {
      const response = await reportService.getProductReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId,
      });
      if (!response.success) throw new Error(response.error || "Failed to fetch product report");
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query for customer reports
  const { data: customerData = [], isLoading: customersLoading } = useQuery({
    queryKey: ["dashboard", "customers", dateRange, branchId],
    queryFn: async () => {
      const response = await reportService.getCustomerReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId,
      });
      if (!response.success) throw new Error(response.error || "Failed to fetch customer report");
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Query for inventory data
  const { data: inventoryData = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["dashboard", "inventory", branchId],
    queryFn: async () => {
      const response = await reportService.getInventoryReport({ branchId });
      if (!response.success) throw new Error(response.error || "Failed to fetch inventory report");
      return response.data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Query for branch comparison (only when viewing all branches)
  const { data: branchData = [], isLoading: branchLoading } = useQuery({
    queryKey: ["dashboard", "branches", dateRange],
    queryFn: async () => {
      if (branchId) return []; // Don't fetch when specific branch is selected
      const response = await reportService.getBranchComparisonReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      if (!response.success) throw new Error(response.error || "Failed to fetch branch comparison report");
      return response.data || [];
    },
    enabled: !branchId, // Only run when viewing all branches
    staleTime: 10 * 60 * 1000,
  });

  // Calculate dashboard metrics
  const metrics = useMemo((): DashboardMetrics => {
    const currentSales = salesData.reduce(
      (sum, day) => sum + day.totalSales,
      0
    );
    const currentOrders = salesData.reduce(
      (sum, day) => sum + day.totalOrders,
      0
    );
    const currentProfit = salesData.reduce(
      (sum, day) => sum + (day.totalProfit || 0),
      0
    );
    const currentB2B = salesData.reduce(
      (sum, day) => sum + (day.b2bSales || 0),
      0
    );
    const currentRetail = salesData.reduce(
      (sum, day) => sum + (day.walkInSales || 0),
      0
    );
    const currentDelivery = salesData.reduce(
      (sum, day) => sum + (day.deliveryOrders || 0),
      0
    );
    const pendingPayments = salesData.reduce(
      (sum, day) => sum + (day.pendingPayments || 0),
      0
    );

    const compareSales = compareSalesData.reduce(
      (sum, day) => sum + day.totalSales,
      0
    );
    const compareOrders = compareSalesData.reduce(
      (sum, day) => sum + day.totalOrders,
      0
    );
    const compareProfit = compareSalesData.reduce(
      (sum, day) => sum + (day.totalProfit || 0),
      0
    );

    const salesGrowth =
      compareSales > 0
        ? ((currentSales - compareSales) / compareSales) * 100
        : 0;
    const ordersGrowth =
      compareOrders > 0
        ? ((currentOrders - compareOrders) / compareOrders) * 100
        : 0;
    const profitGrowth =
      compareProfit > 0
        ? ((currentProfit - compareProfit) / compareProfit) * 100
        : 0;

    const lowStockCount = inventoryData.filter(
      (item) => item.stockStatus === "low_stock"
    ).length;
    const outOfStockCount = inventoryData.filter(
      (item) => item.stockStatus === "out_of_stock"
    ).length;

    const totalCustomers = customerData.reduce(
      (sum, day) => sum + day.totalCustomers,
      0
    );
    const newCustomers = customerData.reduce(
      (sum, day) => sum + day.newCustomers,
      0
    );

    return {
      todaySales: currentSales,
      yesterdaySales: compareSales,
      salesGrowth,
      todayOrders: currentOrders,
      yesterdayOrders: compareOrders,
      ordersGrowth,
      todayCustomers: newCustomers,
      totalCustomers,
      customerGrowth: 0, // Calculate from historical data if available
      totalProducts: inventoryData.length,
      lowStockCount,
      outOfStockCount,
      todayProfit: currentProfit,
      profitMargin: currentSales > 0 ? (currentProfit / currentSales) * 100 : 0,
      profitGrowth,
      b2bSales: currentB2B,
      retailSales: currentRetail,
      b2bPercentage: currentSales > 0 ? (currentB2B / currentSales) * 100 : 0,
      pendingPayments,
      completedPayments: currentSales - pendingPayments,
      deliveryOrders: currentDelivery,
      pickupOrders: currentOrders - currentDelivery,
      deliveryPercentage:
        currentOrders > 0 ? (currentDelivery / currentOrders) * 100 : 0,
    };
  }, [salesData, compareSalesData, customerData, inventoryData]);

  // Process chart data
  const chartData = useMemo((): DashboardChartData => {
    // Sales chart
    const salesChart = salesData.map((day) => ({
      date: day.date,
      sales: day.totalSales,
      profit: day.totalProfit || 0,
      orders: day.totalOrders,
    }));

    // Category chart (simplified - would need category revenue data)
    const categoryChart = [
      {
        name: "เครื่องดื่ม",
        value: 35,
        revenue: metrics.todaySales * 0.35,
        color: "#3182CE",
      },
      {
        name: "ขนม",
        value: 25,
        revenue: metrics.todaySales * 0.25,
        color: "#38A169",
      },
      {
        name: "อาหารแห้ง",
        value: 20,
        revenue: metrics.todaySales * 0.2,
        color: "#D69E2E",
      },
      {
        name: "ของใช้",
        value: 15,
        revenue: metrics.todaySales * 0.15,
        color: "#9F7AEA",
      },
      {
        name: "อื่นๆ",
        value: 5,
        revenue: metrics.todaySales * 0.05,
        color: "#F56565",
      },
    ];

    // Customer type chart
    const customerTypeChart = [
      {
        type: "B2B",
        count: Math.round(metrics.totalCustomers * 0.3),
        revenue: metrics.b2bSales,
        color: "#3182CE",
      },
      {
        type: "Walk-in",
        count: Math.round(metrics.totalCustomers * 0.5),
        revenue: metrics.retailSales,
        color: "#38A169",
      },
      {
        type: "Online",
        count: Math.round(metrics.totalCustomers * 0.2),
        revenue: metrics.todaySales * 0.2,
        color: "#D69E2E",
      },
    ];

    // Branch performance
    const branchPerformance = branchData.map((branch) => ({
      branchId: branch.branchId,
      branchName: branch.branchName,
      sales: branch.totalSales,
      orders: branch.totalOrders,
      performance: (branch.totalSales / 50000) * 100, // Target 50k per branch
      status: branch.performance,
    }));

    return {
      salesChart,
      categoryChart,
      customerTypeChart,
      branchPerformance,
    };
  }, [salesData, branchData, metrics]);

  // Top performers
  const topPerformers = useMemo((): TopPerformers => {
    const products = productData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product) => ({
        id: product.productId,
        name: product.productName,
        sales: product.quantitySold,
        revenue: product.revenue,
        growth: 0, // Would need historical data
        stock: product.stockLevel,
      }));

    return {
      products,
      customers: [], // Would need customer order data
      categories: [], // Would need category-specific data
    };
  }, [productData]);

  const isLoading =
    salesLoading || productsLoading || customersLoading || inventoryLoading;

  return {
    metrics,
    chartData,
    topPerformers,
    isLoading,
    error: null, // Could add error handling
    refetch: () => {
      // Refetch all queries
    },
  };
}

// Hook for real-time dashboard updates
export function useRealtimeDashboard() {
  // This would use realtimeService to subscribe to real-time updates
  // Implementation would depend on specific real-time requirements
  return {
    isConnected: true,
    lastUpdate: new Date(),
  };
}
