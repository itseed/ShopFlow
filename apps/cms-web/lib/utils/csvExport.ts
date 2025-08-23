// CSV Export Utility for Reports System
// Handles proper CSV formatting, encoding, and download

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  includeTimestamp?: boolean;
  encoding?: "utf-8" | "utf-8-bom";
}

export interface CSVData {
  [key: string]: any;
}

/**
 * Convert array of objects to CSV format
 */
export function arrayToCSV(
  data: CSVData[],
  options: CSVExportOptions = {}
): string {
  if (!data || data.length === 0) {
    return "";
  }

  const { headers } = options;

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders
    .map((header) => escapeCSVField(header))
    .join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header];
        return escapeCSVField(formatCSVValue(value));
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string): string {
  if (field === null || field === undefined) {
    return "";
  }

  const stringField = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n") ||
    stringField.includes("\r")
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Format value for CSV export
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("th-TH");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Download CSV file
 */
export function downloadCSV(
  data: CSVData[],
  options: CSVExportOptions = {}
): void {
  const {
    filename = "export",
    includeTimestamp = true,
    encoding = "utf-8-bom",
  } = options;

  // Generate CSV content
  const csvContent = arrayToCSV(data, options);

  // Add BOM for UTF-8 to ensure proper display in Excel
  const BOM = encoding === "utf-8-bom" ? "\uFEFF" : "";
  const finalContent = BOM + csvContent;

  // Create blob
  const blob = new Blob([finalContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Generate filename with timestamp
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split("T")[0]}`
    : "";
  const finalFilename = `${filename}${timestamp}.csv`;

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = finalFilename;
  link.style.display = "none";

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Convert sales report data to CSV format
 */
export function exportSalesReportCSV(
  salesData: any[],
  filename = "sales-report"
): void {
  const headers = [
    "วันที่",
    "ยอดขาย (บาท)",
    "จำนวนออเดอร์",
    "ค่าเฉลี่ยต่อออเดอร์ (บาท)",
    "การเติบโต (%)",
  ];

  const csvData = salesData.map((item) => ({
    วันที่: new Date(item.date).toLocaleDateString("th-TH"),
    "ยอดขาย (บาท)": item.totalSales || 0,
    จำนวนออเดอร์: item.totalOrders || 0,
    "ค่าเฉลี่ยต่อออเดอร์ (บาท)": item.averageOrderValue || 0,
    "การเติบโต (%)": item.growth || 0,
  }));

  downloadCSV(csvData, { filename, headers });
}

/**
 * Convert product report data to CSV format
 */
export function exportProductReportCSV(
  productData: any[],
  filename = "product-report"
): void {
  const headers = [
    "รหัสสินค้า",
    "ชื่อสินค้า",
    "หมวดหมู่",
    "จำนวนขาย",
    "รายได้ (บาท)",
    "ราคาเฉลี่ย (บาท)",
    "สต็อกคงเหลือ",
    "สถานะสต็อก",
  ];

  const csvData = productData.map((item) => ({
    รหัสสินค้า: item.sku || "",
    ชื่อสินค้า: item.productName || "",
    หมวดหมู่: item.category || "",
    จำนวนขาย: item.quantitySold || 0,
    "รายได้ (บาท)": item.revenue || 0,
    "ราคาเฉลี่ย (บาท)": item.averagePrice || 0,
    สต็อกคงเหลือ: item.stockLevel || 0,
    สถานะสต็อก: getStockStatusText(item.stockLevel, item.minStock),
  }));

  downloadCSV(csvData, { filename, headers });
}

/**
 * Convert inventory report data to CSV format
 */
export function exportInventoryReportCSV(
  inventoryData: any[],
  filename = "inventory-report"
): void {
  const headers = [
    "รหัสสินค้า",
    "ชื่อสินค้า",
    "หมวดหมู่",
    "สต็อกปัจจุบัน",
    "สต็อกขั้นต่ำ",
    "สถานะ",
    "มูลค่าสต็อก (บาท)",
    "วันที่อัปเดตล่าสุด",
  ];

  const csvData = inventoryData.map((item) => ({
    รหัสสินค้า: item.sku || "",
    ชื่อสินค้า: item.productName || "",
    หมวดหมู่: item.category || "",
    สต็อกปัจจุบัน: item.currentStock || 0,
    สต็อกขั้นต่ำ: item.minStock || 0,
    สถานะ: getInventoryStatusText(item.stockStatus),
    "มูลค่าสต็อก (บาท)": item.stockValue || 0,
    วันที่อัปเดตล่าสุด: item.lastRestocked
      ? new Date(item.lastRestocked).toLocaleDateString("th-TH")
      : "",
  }));

  downloadCSV(csvData, { filename, headers });
}

/**
 * Convert branch comparison data to CSV format
 */
export function exportBranchComparisonCSV(
  branchData: any[],
  filename = "branch-comparison"
): void {
  const headers = [
    "ชื่อสาขา",
    "ยอดขาย (บาท)",
    "จำนวนออเดอร์",
    "ค่าเฉลี่ยต่อออเดอร์ (บาท)",
    "จำนวนพนักงาน",
    "ประสิทธิภาพ",
  ];

  const csvData = branchData.map((item) => ({
    ชื่อสาขา: item.branchName || "",
    "ยอดขาย (บาท)": item.totalSales || 0,
    จำนวนออเดอร์: item.totalOrders || 0,
    "ค่าเฉลี่ยต่อออเดอร์ (บาท)": item.averageOrderValue || 0,
    จำนวนพนักงาน: item.staffCount || 0,
    ประสิทธิภาพ: calculateBranchPerformance(item),
  }));

  downloadCSV(csvData, { filename, headers });
}

/**
 * Export order data to CSV
 */
export function exportOrdersCSV(
  ordersData: any[],
  filename = "orders-export"
): void {
  const headers = [
    "เลขที่ออเดอร์",
    "วันที่สั่ง",
    "ชื่อลูกค้า",
    "เบอร์โทร",
    "ยอดรวม (บาท)",
    "วิธีการชำระ",
    "สถานะ",
    "สาขา",
    "จำนวนรายการ",
  ];

  const csvData = ordersData.map((order) => ({
    เลขที่ออเดอร์: order.order_number || "",
    วันที่สั่ง: order.created_at
      ? new Date(order.created_at).toLocaleDateString("th-TH")
      : "-",
    ชื่อลูกค้า: order.customer_name || "ลูกค้าทั่วไป",
    เบอร์โทร: order.customer_phone || "",
    "ยอดรวม (บาท)": order.total || 0,
    วิธีการชำระ: getPaymentMethodText(order.payment_method),
    สถานะ: getOrderStatusText(order.status),
    สาขา: order.branch?.name || "",
    จำนวนรายการ: order.items?.length || 0,
  }));

  downloadCSV(csvData, { filename, headers });
}

// Helper functions
function getStockStatusText(currentStock: number, minStock: number): string {
  if (currentStock === 0) return "หมด";
  if (currentStock <= minStock) return "ต่ำ";
  return "ปกติ";
}

function getInventoryStatusText(status: string): string {
  switch (status) {
    case "in_stock":
      return "มีสต็อก";
    case "low_stock":
      return "สต็อกต่ำ";
    case "out_of_stock":
      return "หมดสต็อก";
    default:
      return status;
  }
}

function getPaymentMethodText(method: string): string {
  switch (method) {
    case "cash":
      return "เงินสด";
    case "card":
      return "บัตรเครดิต";
    case "bank_transfer":
      return "โอนเงิน";
    case "e_wallet":
      return "กระเป๋าเงินอิเล็กทรอนิกส์";
    default:
      return method;
  }
}

function getOrderStatusText(status: string): string {
  switch (status) {
    case "pending":
      return "รอดำเนินการ";
    case "processing":
      return "กำลังดำเนินการ";
    case "completed":
      return "เสร็จสิ้น";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
}

function calculateBranchPerformance(branch: any): string {
  const efficiency = branch.averageOrderValue / branch.staffCount;
  if (efficiency > 2000) return "ยอดเยี่ยม";
  if (efficiency > 1500) return "ดี";
  if (efficiency > 1000) return "ปานกลาง";
  return "ต้องปรับปรุง";
}

/**
 * Create a summary report with multiple sheets (exported as separate files)
 */
export function exportSummaryReports(
  salesData: any[],
  productData: any[],
  inventoryData: any[],
  branchData: any[]
): void {
  const timestamp = new Date().toISOString().split("T")[0];

  // Export each report with consistent naming
  exportSalesReportCSV(salesData, `sales-summary-${timestamp}`);

  setTimeout(() => {
    exportProductReportCSV(productData, `product-summary-${timestamp}`);
  }, 500);

  setTimeout(() => {
    exportInventoryReportCSV(inventoryData, `inventory-summary-${timestamp}`);
  }, 1000);

  setTimeout(() => {
    exportBranchComparisonCSV(branchData, `branch-summary-${timestamp}`);
  }, 1500);
}
