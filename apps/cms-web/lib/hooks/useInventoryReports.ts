import { useQuery } from "@tanstack/react-query";
import {
  ReportService,
  InventoryReportData,
  InventoryStats,
  StockMovement,
  CategoryData,
} from "../services/reportService";

interface UseInventoryReportOptions {
  branch_id?: string;
  category_id?: string;
  search?: string;
  status?: string;
  enabled?: boolean;
}

/**
 * Hook for fetching inventory report data
 */
export function useInventoryReport(options: UseInventoryReportOptions = {}) {
  return useQuery({
    queryKey: ["inventory-report", options],
    queryFn: () => ReportService.getInventoryReport(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: options.enabled !== false,
  });
}

/**
 * Hook for fetching inventory statistics
 */
export function useInventoryStats(branch_id?: string) {
  return useQuery({
    queryKey: ["inventory-stats", branch_id],
    queryFn: () => ReportService.getInventoryStats(branch_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching stock movement data
 */
export function useStockMovement(days = 7) {
  return useQuery({
    queryKey: ["stock-movement", days],
    queryFn: () => ReportService.getStockMovement(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching category breakdown data
 */
export function useCategoryData() {
  return useQuery({
    queryKey: ["category-data"],
    queryFn: () => ReportService.getCategoryData(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching all inventory report data at once
 */
export function useInventoryReportComplete(
  options: UseInventoryReportOptions = {}
) {
  const inventoryQuery = useInventoryReport(options);
  const statsQuery = useInventoryStats(options.branch_id);
  const movementQuery = useStockMovement();
  const categoryQuery = useCategoryData();

  return {
    inventory: inventoryQuery,
    stats: statsQuery,
    movement: movementQuery,
    categories: categoryQuery,
    isLoading:
      inventoryQuery.isLoading ||
      statsQuery.isLoading ||
      movementQuery.isLoading ||
      categoryQuery.isLoading,
    isError:
      inventoryQuery.isError ||
      statsQuery.isError ||
      movementQuery.isError ||
      categoryQuery.isError,
    error:
      inventoryQuery.error ||
      statsQuery.error ||
      movementQuery.error ||
      categoryQuery.error,
    refetchAll: () => {
      inventoryQuery.refetch();
      statsQuery.refetch();
      movementQuery.refetch();
      categoryQuery.refetch();
    },
  };
}
