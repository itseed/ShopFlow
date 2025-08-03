import { formatCurrency } from "./sales";

// Types for report data
export interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  data: any[];
  summary?: Record<string, any>;
}

export interface ExportOptions {
  format: "csv" | "pdf" | "excel" | "json";
  filename?: string;
  includeCharts?: boolean;
  includeHeaders?: boolean;
}

// Report generation utilities
export class ReportGenerator {
  static generateSalesReport(data: any[], period: string): ReportData {
    const summary = {
      totalRevenue: data.reduce((sum, item) => sum + (item.revenue || 0), 0),
      totalOrders: data.reduce((sum, item) => sum + (item.orders || 0), 0),
      averageOrderValue: 0,
      topProduct: "",
      totalCustomers: data.reduce((sum, item) => sum + (item.customers || 0), 0),
    };

    summary.averageOrderValue = summary.totalRevenue / (summary.totalOrders || 1);

    // Find top product if available
    const productSales = data.reduce((acc, item) => {
      if (item.products) {
        item.products.forEach((product: any) => {
          acc[product.name] = (acc[product.name] || 0) + product.quantity;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    summary.topProduct = Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b, ""
    );

    return {
      title: "รายงานยอดขาย",
      period,
      generatedAt: new Date().toISOString(),
      data,
      summary,
    };
  }

  static generateInventoryReport(data: any[], period: string): ReportData {
    const summary = {
      totalProducts: data.length,
      totalValue: data.reduce((sum, item) => sum + (item.value || 0), 0),
      lowStockItems: data.filter(item => item.stockLevel === "low").length,
      criticalItems: data.filter(item => item.stockLevel === "critical").length,
      outOfStockItems: data.filter(item => item.stockLevel === "out").length,
      averageTurnover: data.reduce((sum, item) => sum + (item.turnover || 0), 0) / (data.length || 1),
    };

    return {
      title: "รายงานสินค้าคงคลัง",
      period,
      generatedAt: new Date().toISOString(),
      data,
      summary,
    };
  }

  static generateFinancialReport(data: any[], period: string): ReportData {
    const summary = {
      totalRevenue: data.reduce((sum, item) => sum + (item.revenue || 0), 0),
      totalExpenses: data.reduce((sum, item) => sum + (item.expenses || 0), 0),
      netProfit: 0,
      profitMargin: 0,
      cashFlow: data.reduce((sum, item) => sum + (item.cashFlow || 0), 0),
    };

    summary.netProfit = summary.totalRevenue - summary.totalExpenses;
    summary.profitMargin = (summary.netProfit / (summary.totalRevenue || 1)) * 100;

    return {
      title: "รายงานการเงิน",
      period,
      generatedAt: new Date().toISOString(),
      data,
      summary,
    };
  }

  static generateCustomerReport(data: any[], period: string): ReportData {
    const summary = {
      totalCustomers: data.length,
      newCustomers: data.filter(item => item.isNew).length,
      returningCustomers: data.filter(item => !item.isNew).length,
      averageOrderValue: data.reduce((sum, item) => sum + (item.averageOrderValue || 0), 0) / (data.length || 1),
      customerLifetimeValue: data.reduce((sum, item) => sum + (item.lifetimeValue || 0), 0) / (data.length || 1),
      retentionRate: (data.filter(item => !item.isNew).length / (data.length || 1)) * 100,
    };

    return {
      title: "รายงานลูกค้า",
      period,
      generatedAt: new Date().toISOString(),
      data,
      summary,
    };
  }
}

// Export utilities
export class ReportExporter {
  static async exportToCSV(reportData: ReportData, options: ExportOptions = { format: "csv" }): Promise<void> {
    const { data, title, period, generatedAt } = reportData;
    const filename = options.filename || `${title.replace(/\s+/g, "_")}_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (!data || data.length === 0) {
      throw new Error("ไม่มีข้อมูลสำหรับส่งออก");
    }

    // Get headers from first data item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = "";
    
    // Add report info if headers are included
    if (options.includeHeaders !== false) {
      csvContent += `รายงาน: ${title}\n`;
      csvContent += `ช่วงเวลา: ${period}\n`;
      csvContent += `สร้างเมื่อ: ${new Date(generatedAt).toLocaleString("th-TH")}\n\n`;
    }
    
    // Add headers
    csvContent += headers.join(",") + "\n";
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`; // Wrap in quotes if contains comma
        }
        return value ?? "";
      });
      csvContent += values.join(",") + "\n";
    });

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async exportToJSON(reportData: ReportData, options: ExportOptions = { format: "json" }): Promise<void> {
    const filename = options.filename || `${reportData.title.replace(/\s+/g, "_")}_${reportData.period}_${new Date().toISOString().split('T')[0]}.json`;
    
    const jsonContent = JSON.stringify(reportData, null, 2);
    
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async exportToPDF(reportData: ReportData, options: ExportOptions = { format: "pdf" }): Promise<void> {
    // This would require a PDF library like jsPDF or puppeteer
    // For now, we'll create a simple HTML version and use browser's print to PDF
    const { title, period, generatedAt, data, summary } = reportData;
    const filename = options.filename || `${title.replace(/\s+/g, "_")}_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Create HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .currency { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>ช่วงเวลา: ${period}</p>
          <p>สร้างเมื่อ: ${new Date(generatedAt).toLocaleString("th-TH")}</p>
        </div>
    `;

    // Add summary if available
    if (summary) {
      htmlContent += `
        <div class="summary">
          <h3>สรุปผล</h3>
          ${Object.entries(summary).map(([key, value]) => {
            const displayValue = typeof value === "number" && key.includes("Revenue") || key.includes("Value") || key.includes("Amount") 
              ? formatCurrency(value) 
              : value;
            return `<p><strong>${this.translateKey(key)}:</strong> ${displayValue}</p>`;
          }).join("")}
        </div>
      `;
    }

    // Add data table
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      htmlContent += `
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${this.translateKey(header)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => {
                  const value = row[header];
                  const displayValue = typeof value === "number" && (header.includes("revenue") || header.includes("value") || header.includes("amount"))
                    ? formatCurrency(value)
                    : value ?? "";
                  const className = typeof value === "number" ? "currency" : "";
                  return `<td class="${className}">${displayValue}</td>`;
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    htmlContent += `
        <div class="footer">
          <p>รายงานนี้สร้างโดย ShopFlow POS System</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        newWindow.print();
      }, 100);
    }
  }

  static async print(reportData: ReportData): Promise<void> {
    // Use the same HTML generation as PDF but for direct printing
    await this.exportToPDF(reportData, { format: "pdf" });
  }

  private static translateKey(key: string): string {
    const translations: Record<string, string> = {
      // Common fields
      date: "วันที่",
      period: "ช่วงเวลา",
      revenue: "รายได้",
      orders: "คำสั่งซื้อ",
      customers: "ลูกค้า",
      profit: "กำไร",
      expenses: "ค่าใช้จ่าย",
      
      // Sales fields
      totalRevenue: "รายได้รวม",
      totalOrders: "คำสั่งซื้อรวม",
      averageOrderValue: "ค่าเฉลี่ยต่อออเดอร์",
      totalCustomers: "ลูกค้าทั้งหมด",
      topProduct: "สินค้าขายดี",
      
      // Inventory fields
      name: "ชื่อสินค้า",
      sku: "รหัสสินค้า",
      category: "หมวดหมู่",
      currentStock: "สต็อกปัจจุบัน",
      minStock: "สต็อกขั้นต่ำ",
      maxStock: "สต็อกสูงสุด",
      value: "มูลค่า",
      turnover: "อัตราหมุนเวียน",
      totalProducts: "สินค้าทั้งหมด",
      totalValue: "มูลค่ารวม",
      lowStockItems: "สินค้าสต็อกต่ำ",
      criticalItems: "สินค้าสต็อกวิกฤต",
      outOfStockItems: "สินค้าหมดสต็อก",
      
      // Financial fields
      netProfit: "กำไรสุทธิ",
      profitMargin: "อัตรากำไร",
      cashFlow: "กระแสเงินสด",
      totalExpenses: "ค่าใช้จ่ายรวม",
      
      // Customer fields
      email: "อีเมล",
      phone: "โทรศัพท์",
      totalSpent: "ยอดซื้อรวม",
      orderCount: "จำนวนคำสั่งซื้อ",
      lastVisit: "เข้าใช้ล่าสุด",
      newCustomers: "ลูกค้าใหม่",
      returningCustomers: "ลูกค้าเก่า",
      customerLifetimeValue: "มูลค่าลูกค้าตลอดชีวิต",
      retentionRate: "อัตราการกลับมา",
    };
    
    return translations[key] || key;
  }
}

// Report scheduling utilities
export class ReportScheduler {
  static scheduleReport(
    reportType: string,
    frequency: "daily" | "weekly" | "monthly",
    callback: () => void
  ): string {
    // This would integrate with a job scheduler in a real implementation
    // For now, we'll just return a mock schedule ID
    const scheduleId = `schedule_${reportType}_${frequency}_${Date.now()}`;
    
    // Store in localStorage for demonstration
    const schedules = JSON.parse(localStorage.getItem("reportSchedules") || "[]");
    schedules.push({
      id: scheduleId,
      reportType,
      frequency,
      createdAt: new Date().toISOString(),
      active: true,
    });
    localStorage.setItem("reportSchedules", JSON.stringify(schedules));
    
    return scheduleId;
  }

  static getScheduledReports(): any[] {
    return JSON.parse(localStorage.getItem("reportSchedules") || "[]");
  }

  static cancelScheduledReport(scheduleId: string): boolean {
    const schedules = JSON.parse(localStorage.getItem("reportSchedules") || "[]");
    const updatedSchedules = schedules.map((schedule: any) => 
      schedule.id === scheduleId ? { ...schedule, active: false } : schedule
    );
    localStorage.setItem("reportSchedules", JSON.stringify(updatedSchedules));
    return true;
  }
}

// Report templates
export const ReportTemplates = {
  dailySales: {
    title: "รายงานยอดขายรายวัน",
    fields: ["date", "revenue", "orders", "customers", "averageOrderValue"],
    period: "daily",
  },
  
  weeklySales: {
    title: "รายงานยอดขายรายสัปดาห์",
    fields: ["week", "revenue", "orders", "customers", "growth"],
    period: "weekly",
  },
  
  monthlyInventory: {
    title: "รายงานสินค้าคงคลังรายเดือน",
    fields: ["category", "totalItems", "totalValue", "lowStock", "turnover"],
    period: "monthly",
  },
  
  financialSummary: {
    title: "สรุปผลการเงิน",
    fields: ["period", "revenue", "expenses", "profit", "profitMargin"],
    period: "monthly",
  },
  
  customerAnalysis: {
    title: "วิเคราะห์ลูกค้า",
    fields: ["segment", "count", "averageOrderValue", "totalRevenue", "retentionRate"],
    period: "monthly",
  },
};

// Utility functions
export const ReportUtils = {
  formatReportPeriod(period: string, date?: Date): string {
    const now = date || new Date();
    
    switch (period) {
      case "today":
        return now.toLocaleDateString("th-TH", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        });
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("th-TH", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("th-TH", { month: "short", day: "numeric" })}`;
      case "month":
        return now.toLocaleDateString("th-TH", { 
          year: "numeric", 
          month: "long" 
        });
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `ไตรมาสที่ ${quarter} ปี ${now.getFullYear() + 543}`;
      case "year":
        return `ปี ${now.getFullYear() + 543}`;
      default:
        return period;
    }
  },

  validateReportData(data: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push("ข้อมูลต้องเป็น Array");
      return { isValid: false, errors };
    }
    
    if (data.length === 0) {
      errors.push("ไม่มีข้อมูลสำหรับสร้างรายงาน");
      return { isValid: false, errors };
    }
    
    // Check if all items have consistent structure
    const firstItemKeys = Object.keys(data[0]);
    const inconsistentItems = data.filter(item => {
      const itemKeys = Object.keys(item);
      return itemKeys.length !== firstItemKeys.length || 
             !firstItemKeys.every(key => itemKeys.includes(key));
    });
    
    if (inconsistentItems.length > 0) {
      errors.push(`พบข้อมูลไม่สอดคล้องกัน ${inconsistentItems.length} รายการ`);
    }
    
    return { isValid: errors.length === 0, errors };
  },

  aggregateData(data: any[], groupBy: string, aggregateFields: string[]): any[] {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy];
      if (!acc[key]) {
        acc[key] = { [groupBy]: key };
        aggregateFields.forEach(field => {
          acc[key][field] = 0;
        });
      }
      
      aggregateFields.forEach(field => {
        acc[key][field] += item[field] || 0;
      });
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  },

  filterByDateRange(data: any[], dateField: string, startDate: Date, endDate: Date): any[] {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  },

  sortByField(data: any[], field: string, order: "asc" | "desc" = "asc"): any[] {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (order === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  },
};