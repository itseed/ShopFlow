import { useState, useCallback, useMemo } from "react";
import { useToast } from "@chakra-ui/react";
import { 
  ReportGenerator, 
  ReportExporter, 
  ReportScheduler,
  ReportUtils,
  ReportData,
  ExportOptions 
} from "../lib/reports";

export interface UseReportsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: string;
  customer?: string;
  product?: string;
}

export const useReports = (options: UseReportsOptions = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportData[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const toast = useToast();

  // Generate sales report
  const generateSalesReport = useCallback(async (
    data: any[], 
    period: string,
    reportFilters?: ReportFilters
  ) => {
    setIsGenerating(true);
    try {
      // Apply filters if provided
      let filteredData = data;
      if (reportFilters) {
        if (reportFilters.startDate && reportFilters.endDate) {
          filteredData = ReportUtils.filterByDateRange(
            filteredData, 
            "date", 
            reportFilters.startDate, 
            reportFilters.endDate
          );
        }
        if (reportFilters.category) {
          filteredData = filteredData.filter(item => item.category === reportFilters.category);
        }
        if (reportFilters.customer) {
          filteredData = filteredData.filter(item => item.customerId === reportFilters.customer);
        }
      }

      // Validate data
      const validation = ReportUtils.validateReportData(filteredData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const report = ReportGenerator.generateSalesReport(filteredData, period);
      setCurrentReport(report);
      setReportHistory(prev => [report, ...prev.slice(0, 9)]); // Keep last 10 reports
      
      toast({
        title: "สร้างรายงานสำเร็จ",
        description: `สร้างรายงานยอดขาย${ReportUtils.formatReportPeriod(period)}`,
        status: "success",
        duration: 3000,
      });
      
      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างรายงาน";
      toast({
        title: "สร้างรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // Generate inventory report
  const generateInventoryReport = useCallback(async (
    data: any[], 
    period: string,
    reportFilters?: ReportFilters
  ) => {
    setIsGenerating(true);
    try {
      let filteredData = data;
      if (reportFilters) {
        if (reportFilters.category) {
          filteredData = filteredData.filter(item => item.category === reportFilters.category);
        }
        if (reportFilters.status) {
          filteredData = filteredData.filter(item => item.stockLevel === reportFilters.status);
        }
      }

      const validation = ReportUtils.validateReportData(filteredData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const report = ReportGenerator.generateInventoryReport(filteredData, period);
      setCurrentReport(report);
      setReportHistory(prev => [report, ...prev.slice(0, 9)]);
      
      toast({
        title: "สร้างรายงานสำเร็จ",
        description: `สร้างรายงานสินค้าคงคลัง${ReportUtils.formatReportPeriod(period)}`,
        status: "success",
        duration: 3000,
      });
      
      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างรายงาน";
      toast({
        title: "สร้างรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // Generate financial report
  const generateFinancialReport = useCallback(async (
    data: any[], 
    period: string,
    reportFilters?: ReportFilters
  ) => {
    setIsGenerating(true);
    try {
      let filteredData = data;
      if (reportFilters?.startDate && reportFilters?.endDate) {
        filteredData = ReportUtils.filterByDateRange(
          filteredData, 
          "date", 
          reportFilters.startDate, 
          reportFilters.endDate
        );
      }

      const validation = ReportUtils.validateReportData(filteredData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const report = ReportGenerator.generateFinancialReport(filteredData, period);
      setCurrentReport(report);
      setReportHistory(prev => [report, ...prev.slice(0, 9)]);
      
      toast({
        title: "สร้างรายงานสำเร็จ",
        description: `สร้างรายงานการเงิน${ReportUtils.formatReportPeriod(period)}`,
        status: "success",
        duration: 3000,
      });
      
      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างรายงาน";
      toast({
        title: "สร้างรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // Generate customer report
  const generateCustomerReport = useCallback(async (
    data: any[], 
    period: string,
    reportFilters?: ReportFilters
  ) => {
    setIsGenerating(true);
    try {
      let filteredData = data;
      if (reportFilters?.startDate && reportFilters?.endDate) {
        filteredData = ReportUtils.filterByDateRange(
          filteredData, 
          "registeredDate", 
          reportFilters.startDate, 
          reportFilters.endDate
        );
      }

      const validation = ReportUtils.validateReportData(filteredData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const report = ReportGenerator.generateCustomerReport(filteredData, period);
      setCurrentReport(report);
      setReportHistory(prev => [report, ...prev.slice(0, 9)]);
      
      toast({
        title: "สร้างรายงานสำเร็จ",
        description: `สร้างรายงานลูกค้า${ReportUtils.formatReportPeriod(period)}`,
        status: "success",
        duration: 3000,
      });
      
      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างรายงาน";
      toast({
        title: "สร้างรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // Export report
  const exportReport = useCallback(async (
    report: ReportData | null, 
    exportOptions: ExportOptions
  ) => {
    if (!report) {
      toast({
        title: "ไม่สามารถส่งออกได้",
        description: "ไม่มีรายงานสำหรับส่งออก",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsExporting(true);
    try {
      switch (exportOptions.format) {
        case "csv":
          await ReportExporter.exportToCSV(report, exportOptions);
          break;
        case "json":
          await ReportExporter.exportToJSON(report, exportOptions);
          break;
        case "pdf":
          await ReportExporter.exportToPDF(report, exportOptions);
          break;
        default:
          throw new Error("รูปแบบการส่งออกไม่ถูกต้อง");
      }
      
      toast({
        title: "ส่งออกรายงานสำเร็จ",
        description: `ส่งออกรายงานเป็น ${exportOptions.format.toUpperCase()} แล้ว`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งออกรายงาน";
      toast({
        title: "ส่งออกรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  // Print report
  const printReport = useCallback(async (report: ReportData | null) => {
    if (!report) {
      toast({
        title: "ไม่สามารถพิมพ์ได้",
        description: "ไม่มีรายงานสำหรับพิมพ์",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await ReportExporter.print(report);
      toast({
        title: "เปิดหน้าต่างพิมพ์แล้ว",
        description: "กรุณาเลือกเครื่องพิมพ์และตั้งค่าการพิมพ์",
        status: "info",
        duration: 3000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการพิมพ์รายงาน";
      toast({
        title: "พิมพ์รายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
    }
  }, [toast]);

  // Schedule report
  const scheduleReport = useCallback((
    reportType: string,
    frequency: "daily" | "weekly" | "monthly",
    callback: () => void
  ) => {
    try {
      const scheduleId = ReportScheduler.scheduleReport(reportType, frequency, callback);
      
      // Update local schedules state
      const updatedSchedules = ReportScheduler.getScheduledReports();
      setSchedules(updatedSchedules);
      
      toast({
        title: "กำหนดตารางรายงานสำเร็จ",
        description: `ตั้งเวลารายงาน${reportType}แบบ${frequency}แล้ว`,
        status: "success",
        duration: 3000,
      });
      
      return scheduleId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการกำหนดตารางรายงาน";
      toast({
        title: "กำหนดตารางรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      throw error;
    }
  }, [toast]);

  // Cancel scheduled report
  const cancelScheduledReport = useCallback((scheduleId: string) => {
    try {
      ReportScheduler.cancelScheduledReport(scheduleId);
      
      // Update local schedules state
      const updatedSchedules = ReportScheduler.getScheduledReports();
      setSchedules(updatedSchedules);
      
      toast({
        title: "ยกเลิกตารางรายงานสำเร็จ",
        description: "ยกเลิกการกำหนดตารางรายงานแล้ว",
        status: "success",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการยกเลิกตารางรายงาน";
      toast({
        title: "ยกเลิกตารางรายงานไม่สำเร็จ",
        description: message,
        status: "error",
        duration: 5000,
      });
      return false;
    }
  }, [toast]);

  // Clear report history
  const clearReportHistory = useCallback(() => {
    setReportHistory([]);
    setCurrentReport(null);
    toast({
      title: "ล้างประวัติรายงานแล้ว",
      status: "info",
      duration: 2000,
    });
  }, [toast]);

  // Computed values
  const reportStats = useMemo(() => {
    return {
      totalReports: reportHistory.length,
      salesReports: reportHistory.filter(r => r.title.includes("ยอดขาย")).length,
      inventoryReports: reportHistory.filter(r => r.title.includes("สินค้าคงคลัง")).length,
      financialReports: reportHistory.filter(r => r.title.includes("การเงิน")).length,
      customerReports: reportHistory.filter(r => r.title.includes("ลูกค้า")).length,
    };
  }, [reportHistory]);

  return {
    // State
    isGenerating,
    isExporting,
    currentReport,
    reportHistory,
    filters,
    schedules,
    reportStats,
    
    // Actions
    generateSalesReport,
    generateInventoryReport,
    generateFinancialReport,
    generateCustomerReport,
    exportReport,
    printReport,
    scheduleReport,
    cancelScheduledReport,
    clearReportHistory,
    setFilters,
    setCurrentReport,
    
    // Utilities
    formatReportPeriod: ReportUtils.formatReportPeriod,
    validateReportData: ReportUtils.validateReportData,
    aggregateData: ReportUtils.aggregateData,
    filterByDateRange: ReportUtils.filterByDateRange,
    sortByField: ReportUtils.sortByField,
  };
};