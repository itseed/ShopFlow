/**
 * Report Hooks - Analytics and Reporting
 * Consolidates: useReports, useSalesReports, useInventoryReports
 * Phase 1: Foundation Refactor
 */

import { useQuery } from "@tanstack/react-query";
import { reportService } from "@shopflow/api";

/**
 * Sales Report Hooks
 */

// Get daily sales report
export function useDailySalesReport(params: {
  branchId?: string;
  date?: string;
}) {
  return useQuery({
    queryKey: ["reports", "sales", "daily", params],
    queryFn: () => reportService.sales.daily(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// Get sales by date range
export function useSalesReportByDateRange(params: {
  branchId?: string;
  startDate: string;
  endDate: string;
}) {
  return useQuery({
    queryKey: ["reports", "sales", "date-range", params],
    queryFn: () => reportService.sales.byDateRange(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Get sales by product
export function useSalesByProduct(params: {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["reports", "sales", "by-product", params],
    queryFn: () => reportService.sales.byProduct(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Get sales by customer
export function useSalesByCustomer(params: {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["reports", "sales", "by-customer", params],
    queryFn: () => reportService.sales.byCustomer(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Inventory Report Hooks
 */

// Get stock levels report
export function useStockLevelsReport(branchId?: string) {
  return useQuery({
    queryKey: ["reports", "inventory", "stock-levels", branchId],
    queryFn: () => reportService.inventory.stockLevels(branchId),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Get low stock report
export function useLowStockReport(params: {
  branchId?: string;
  threshold?: number;
}) {
  return useQuery({
    queryKey: ["reports", "inventory", "low-stock", params],
    queryFn: () => reportService.inventory.lowStock(params),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Get out of stock report
export function useOutOfStockReport(branchId?: string) {
  return useQuery({
    queryKey: ["reports", "inventory", "out-of-stock", branchId],
    queryFn: () => reportService.inventory.outOfStock(branchId),
    staleTime: 2 * 60 * 1000,
  });
}

// Get inventory movements report
export function useInventoryMovementsReport(params: {
  branchId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  movementType?: string;
}) {
  return useQuery({
    queryKey: ["reports", "inventory", "movements", params],
    queryFn: () => reportService.inventory.movements(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Get inventory value report
export function useInventoryValueReport(branchId?: string) {
  return useQuery({
    queryKey: ["reports", "inventory", "value", branchId],
    queryFn: () => reportService.inventory.value(branchId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Dashboard Hooks
 */

// Get dashboard overview
export function useDashboardOverview(params: {
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["dashboard", "overview", params],
    queryFn: () => reportService.dashboard.overview(params),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

// Get trends analysis
export function useTrends(params: {
  branchId?: string;
  days?: number;
}) {
  return useQuery({
    queryKey: ["dashboard", "trends", params],
    queryFn: () => reportService.dashboard.trends(params),
    staleTime: 5 * 60 * 1000,
  });
}

