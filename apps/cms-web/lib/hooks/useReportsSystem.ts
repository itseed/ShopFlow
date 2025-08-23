import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  reportService,
  orderService,
  productService,
  type ReportFilters,
} from "@shopflow/api";
import { useCurrentBranch } from "./useAuthEnhanced";
import {
  exportSalesReportCSV,
  exportProductReportCSV,
  exportInventoryReportCSV,
  exportBranchComparisonCSV,
  exportSummaryReports,
} from "../utils/csvExport";

// Enhanced report query keys
export const REPORTS_QUERY_KEYS = {
  SALES: "sales-reports",
  PRODUCTS: "product-reports",
  INVENTORY: "inventory-reports",
  BRANCH_COMPARISON: "branch-comparison-reports",
  DASHBOARD_SUMMARY: "dashboard-summary",
  CUSTOM: "custom-reports",
  EXPORTS: "report-exports",
  CUSTOMERS: "customer-reports",
  PROFIT_LOSS: "profit-loss-reports",
} as const;

// Export formats
export type ExportFormat = "csv" | "excel" | "pdf" | "json";

// Date range presets
export interface DateRangePreset {
  label: string;
  startDate: string;
  endDate: string;
}

// Enhanced report filters
export interface EnhancedReportFilters extends ReportFilters {
  preset?:
    | "today"
    | "yesterday"
    | "thisWeek"
    | "lastWeek"
    | "thisMonth"
    | "lastMonth"
    | "thisYear"
    | "custom";
  groupBy?: "day" | "week" | "month" | "year";
  compareWith?: "previousPeriod" | "previousYear";
}

// Report export request
export interface ReportExportRequest {
  reportType: string;
  filters: EnhancedReportFilters;
  format: ExportFormat;
  includeCharts?: boolean;
  fileName?: string;
}

// Dashboard summary data
export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

// Utility function to get date range from preset
export function getDateRangeFromPreset(preset: string): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return {
        startDate: today.toISOString(),
        endDate: new Date(
          today.getTime() + 24 * 60 * 60 * 1000 - 1
        ).toISOString(),
      };

    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        startDate: yesterday.toISOString(),
        endDate: new Date(
          yesterday.getTime() + 24 * 60 * 60 * 1000 - 1
        ).toISOString(),
      };

    case "thisWeek":
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        startDate: startOfWeek.toISOString(),
        endDate: now.toISOString(),
      };

    case "lastWeek":
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return {
        startDate: startOfLastWeek.toISOString(),
        endDate: endOfLastWeek.toISOString(),
      };

    case "thisMonth":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: startOfMonth.toISOString(),
        endDate: now.toISOString(),
      };

    case "lastMonth":
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: startOfLastMonth.toISOString(),
        endDate: endOfLastMonth.toISOString(),
      };

    case "thisYear":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: startOfYear.toISOString(),
        endDate: now.toISOString(),
      };

    default:
      return {
        startDate: new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: now.toISOString(),
      };
  }
}

// Sales Reports Hook
export function useSalesReports(filters: EnhancedReportFilters = {}) {
  const currentBranch = useCurrentBranch();

  // Apply date range from preset
  let finalFilters = { ...filters };
  if (filters.preset && filters.preset !== "custom") {
    const dateRange = getDateRangeFromPreset(filters.preset);
    finalFilters = {
      ...finalFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }

  // Apply branch filter for non-admin users
  if (currentBranch && !finalFilters.branchId) {
    finalFilters.branchId = currentBranch.id;
  }

  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.SALES, finalFilters],
    queryFn: async () => {
      const response = await reportService.getSalesReport(finalFilters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch sales report");
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Product Reports Hook
export function useProductReports(filters: EnhancedReportFilters = {}) {
  const currentBranch = useCurrentBranch();

  let finalFilters = { ...filters };
  if (filters.preset && filters.preset !== "custom") {
    const dateRange = getDateRangeFromPreset(filters.preset);
    finalFilters = {
      ...finalFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }

  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.PRODUCTS, finalFilters],
    queryFn: async () => {
      const response = await reportService.getProductReport(finalFilters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch product report");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Inventory Reports Hook
export function useInventoryReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.INVENTORY, filters],
    queryFn: async () => {
      const response = await reportService.getInventoryReport(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch inventory report");
      }
      return response.data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Branch Comparison Reports Hook
export function useBranchComparisonReports(
  filters: EnhancedReportFilters = {}
) {
  let finalFilters = { ...filters };
  if (filters.preset && filters.preset !== "custom") {
    const dateRange = getDateRangeFromPreset(filters.preset);
    finalFilters = {
      ...finalFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }

  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.BRANCH_COMPARISON, finalFilters],
    queryFn: async () => {
      const response = await reportService.getBranchComparisonReport(
        finalFilters
      );
      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch branch comparison report"
        );
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Dashboard Summary Hook
export function useDashboardSummary(filters: EnhancedReportFilters = {}) {
  const salesReports = useSalesReports(filters);
  const productReports = useProductReports(filters);
  const inventoryReports = useInventoryReports();

  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.DASHBOARD_SUMMARY, filters],
    queryFn: async (): Promise<DashboardSummary> => {
      // Get current period data
      const currentDateRange = filters.preset
        ? getDateRangeFromPreset(filters.preset)
        : {
            startDate:
              filters.startDate ||
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: filters.endDate || new Date().toISOString(),
          };

      // Get previous period for comparison
      const periodLength =
        new Date(currentDateRange.endDate).getTime() -
        new Date(currentDateRange.startDate).getTime();
      const previousStartDate = new Date(
        new Date(currentDateRange.startDate).getTime() - periodLength
      ).toISOString();
      const previousEndDate = currentDateRange.startDate;

      // Fetch current and previous period orders
      const [currentOrders, previousOrders, products, inventory] =
        await Promise.all([
          orderService.getAll({
            dateFrom: currentDateRange.startDate,
            dateTo: currentDateRange.endDate,
            status: "completed",
          }),
          orderService.getAll({
            dateFrom: previousStartDate,
            dateTo: previousEndDate,
            status: "completed",
          }),
          productService.getAll(),
          reportService.getInventoryReport(),
        ]);

      if (
        !currentOrders.success ||
        !previousOrders.success ||
        !products.success ||
        !inventory.success
      ) {
        throw new Error("Failed to fetch dashboard data");
      }

      const currentOrdersData = currentOrders.data || [];
      const previousOrdersData = previousOrders.data || [];
      const productsData = products.data || [];
      const inventoryData = inventory.data || [];

      // Calculate metrics
      const totalRevenue = currentOrdersData.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const totalOrders = currentOrdersData.length;
      const totalProducts = productsData.length;
      const totalCustomers = new Set(
        currentOrdersData
          .filter((order) => order.customer_phone)
          .map((order) => order.customer_phone)
      ).size;

      const previousRevenue = previousOrdersData.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const previousOrderCount = previousOrdersData.length;

      const revenueGrowth =
        previousRevenue > 0
          ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
          : 0;
      const ordersGrowth =
        previousOrderCount > 0
          ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
          : 0;

      // Calculate top products
      const productSales = new Map<
        string,
        { name: string; revenue: number; quantity: number }
      >();
      currentOrdersData.forEach((order) => {
        order.items?.forEach((item) => {
          const current = productSales.get(item.product_name) || {
            name: item.product_name,
            revenue: 0,
            quantity: 0,
          };
          current.revenue += item.total_price;
          current.quantity += item.quantity;
          productSales.set(item.product_name, current);
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Generate sales trend data
      const salesTrend: Array<{
        date: string;
        revenue: number;
        orders: number;
      }> = [];
      const startDate = new Date(currentDateRange.startDate);
      const endDate = new Date(currentDateRange.endDate);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        const dayOrders = currentOrdersData.filter(
          (order) => order.created_at && order.created_at.startsWith(dateStr)
        );

        salesTrend.push({
          date: dateStr,
          revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
          orders: dayOrders.length,
        });
      }

      // Generate recent activity
      const recentActivity = currentOrdersData
        .filter((order) => order.created_at) // Filter out orders without created_at
        .slice(0, 10)
        .map((order) => ({
          type: "order",
          description: `คำสั่งซื้อ ${
            order.order_number
          } - ฿${order.total.toLocaleString()}`,
          timestamp: order.created_at!,
        }));

      return {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth,
        ordersGrowth,
        topProducts,
        recentActivity,
        salesTrend,
      };
    },
    enabled: !!(
      salesReports.data &&
      productReports.data &&
      inventoryReports.data
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Export Reports Hook
export function useExportReport() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (exportRequest: ReportExportRequest) => {
      const { reportType, filters, format, fileName } = exportRequest;

      // Fetch report data based on type
      let reportData: any[] = [];

      switch (reportType) {
        case "sales":
          const salesResponse = await reportService.getSalesReport(filters);
          if (!salesResponse.success)
            throw new Error("Failed to fetch sales data");
          reportData = salesResponse.data || [];

          if (format === "csv") {
            exportSalesReportCSV(reportData, fileName);
            return { success: true, fileName: `${fileName}.csv` };
          }
          break;

        case "products":
          const productResponse = await reportService.getProductReport(filters);
          if (!productResponse.success)
            throw new Error("Failed to fetch product data");
          reportData = productResponse.data || [];

          if (format === "csv") {
            exportProductReportCSV(reportData, fileName);
            return { success: true, fileName: `${fileName}.csv` };
          }
          break;

        case "inventory":
          const inventoryResponse = await reportService.getInventoryReport(
            filters
          );
          if (!inventoryResponse.success)
            throw new Error("Failed to fetch inventory data");
          reportData = inventoryResponse.data || [];

          if (format === "csv") {
            exportInventoryReportCSV(reportData, fileName);
            return { success: true, fileName: `${fileName}.csv` };
          }
          break;

        case "branches":
          const branchResponse = await reportService.getBranchComparisonReport(
            filters
          );
          if (!branchResponse.success)
            throw new Error("Failed to fetch branch data");
          reportData = branchResponse.data || [];

          if (format === "csv") {
            exportBranchComparisonCSV(reportData, fileName);
            return { success: true, fileName: `${fileName}.csv` };
          }
          break;

        case "summary":
          // Export all reports as summary
          const [sales, products, inventory, branches] = await Promise.all([
            reportService.getSalesReport(filters),
            reportService.getProductReport(filters),
            reportService.getInventoryReport(filters),
            reportService.getBranchComparisonReport(filters),
          ]);

          if (format === "csv") {
            exportSummaryReports(
              sales.data || [],
              products.data || [],
              inventory.data || [],
              branches.data || []
            );
            return { success: true, fileName: "summary-reports" };
          }
          break;

        default:
          throw new Error("Unknown report type");
      }

      // For non-CSV formats, fall back to the original generation method
      return generateExport(
        reportData,
        [],
        format,
        fileName || `${reportType}-report`
      );
    },
    onSuccess: (result) => {
      toast({
        title: "สำเร็จ",
        description: `ส่งออกรายงาน ${result.fileName} เรียบร้อยแล้ว`,
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

// Generate export file
async function generateExport(
  data: any[],
  headers: string[],
  format: ExportFormat,
  fileName: string
): Promise<{ blob: Blob; fileName: string }> {
  switch (format) {
    case "csv":
      return generateCSV(data, headers, fileName);
    case "excel":
      return generateExcel(data, headers, fileName);
    case "json":
      return generateJSON(data, fileName);
    case "pdf":
      return generatePDF(data, headers, fileName);
    default:
      throw new Error("Unsupported export format");
  }
}

// Generate CSV export
function generateCSV(
  data: any[],
  headers: string[],
  fileName: string
): { blob: Blob; fileName: string } {
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = getValueByHeader(row, header);
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  return { blob, fileName: `${fileName}.csv` };
}

// Generate Excel export (simplified as CSV with .xlsx extension)
function generateExcel(
  data: any[],
  headers: string[],
  fileName: string
): { blob: Blob; fileName: string } {
  const csvContent = [
    headers.join("\t"),
    ...data.map((row) =>
      headers.map((header) => getValueByHeader(row, header)).join("\t")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "application/vnd.ms-excel",
  });
  return { blob, fileName: `${fileName}.xls` };
}

// Generate JSON export
function generateJSON(
  data: any[],
  fileName: string
): { blob: Blob; fileName: string } {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  return { blob, fileName: `${fileName}.json` };
}

// Generate PDF export (simplified text-based PDF)
function generatePDF(
  data: any[],
  headers: string[],
  fileName: string
): { blob: Blob; fileName: string } {
  let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${JSON.stringify(data).length + headers.join(" ").length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${headers.join(" | ")}) Tj
0 -20 Td
`;

  data.forEach((row) => {
    const rowText = headers
      .map((header) => getValueByHeader(row, header))
      .join(" | ");
    pdfContent += `(${rowText}) Tj\n0 -15 Td\n`;
  });

  pdfContent += `ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${pdfContent.length + 50}
%%EOF`;

  const blob = new Blob([pdfContent], { type: "application/pdf" });
  return { blob, fileName: `${fileName}.pdf` };
}

// Helper function to get value by header
function getValueByHeader(row: any, header: string): any {
  switch (header) {
    case "วันที่":
      return row.date || row.created_at || "";
    case "ยอดขาย":
      return row.totalSales || row.revenue || row.total || 0;
    case "จำนวนออเดอร์":
      return row.totalOrders || row.orderCount || 0;
    case "ค่าเฉลี่ย":
      return row.averageOrderValue || row.averagePrice || 0;
    case "สินค้า":
      return row.productName || row.name || "";
    case "SKU":
      return row.sku || "";
    case "หมวดหมู่":
      return row.category || "";
    case "จำนวนขาย":
      return row.quantitySold || row.quantity || 0;
    case "รายได้":
      return row.revenue || 0;
    case "ราคาเฉลี่ย":
      return row.averagePrice || row.price || 0;
    case "สต็อก":
      return row.stockLevel || row.currentStock || row.stock || 0;
    case "สต็อกปัจจุบัน":
      return row.currentStock || row.stock || 0;
    case "สต็อกขั้นต่ำ":
      return row.minStock || 0;
    case "สถานะ":
      return row.stockStatus || row.status || "";
    case "มูลค่า":
      return row.stockValue || 0;
    case "สาขา":
      return row.branchName || row.name || "";
    case "จำนวนพนักงาน":
      return row.staffCount || 0;
    default:
      return "";
  }
}

// Advanced filtering hook
export function useAdvancedReportFilters() {
  const [filters, setFilters] = useState<EnhancedReportFilters>({
    preset: "thisMonth",
  });

  const updateFilter = (key: keyof EnhancedReportFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ preset: "thisMonth" });
  };

  const applyPreset = (preset: EnhancedReportFilters["preset"]) => {
    if (preset === "custom") {
      setFilters((prev) => ({ ...prev, preset }));
    } else {
      const dateRange = getDateRangeFromPreset(preset!);
      setFilters((prev) => ({
        ...prev,
        preset,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
    }
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    applyPreset,
    setFilters,
  };
}

// Customer Analytics Reports Hook
export function useCustomerReports(filters: EnhancedReportFilters = {}) {
  let finalFilters = { ...filters };
  if (filters.preset && filters.preset !== "custom") {
    const dateRange = getDateRangeFromPreset(filters.preset);
    finalFilters = {
      ...finalFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }

  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.CUSTOMERS, finalFilters],
    queryFn: async () => {
      const response = await reportService.getCustomerReport(finalFilters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch customer reports");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Profit & Loss Reports Hook
export function useProfitLossReports(filters: EnhancedReportFilters = {}) {
  let finalFilters = { ...filters };
  if (filters.preset && filters.preset !== "custom") {
    const dateRange = getDateRangeFromPreset(filters.preset);
    finalFilters = {
      ...finalFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }

  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.PROFIT_LOSS, finalFilters],
    queryFn: async () => {
      const response = await reportService.getProfitLossReport(finalFilters);
      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch profit/loss reports"
        );
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
