import { SalesTransaction } from "@shopflow/types";

export interface OrderFilters {
  searchTerm: string;
  status: string;
  dateRange: string;
  paymentMethod: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get date range based on filter selection
 */
export const getDateRange = (range: string): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
      };
    
    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return {
        start: monthStart,
        end: monthEnd,
      };
    
    case "last_month":
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      return {
        start: lastMonthStart,
        end: lastMonthEnd,
      };
    
    case "year":
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        start: yearStart,
        end: yearEnd,
      };
    
    default: // "all"
      return {
        start: new Date(2000, 0, 1), // Far past date
        end: new Date(2099, 11, 31), // Far future date
      };
  }
};

/**
 * Filter orders based on search criteria
 */
export const filterOrders = (orders: SalesTransaction[], filters: OrderFilters): SalesTransaction[] => {
  let filtered = [...orders];

  // Search term filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((order) => 
      order.transactionNumber.toLowerCase().includes(searchLower) ||
      order.receipt?.receiptNumber?.toLowerCase().includes(searchLower) ||
      order.customer?.name?.toLowerCase().includes(searchLower) ||
      order.customer?.phone?.includes(filters.searchTerm) ||
      order.cashier.name.toLowerCase().includes(searchLower) ||
      order.branch.name.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filters.status !== "all") {
    filtered = filtered.filter((order) => order.status === filters.status);
  }

  // Payment method filter
  if (filters.paymentMethod !== "all") {
    filtered = filtered.filter((order) =>
      order.payments.some((payment) => payment.type === filters.paymentMethod)
    );
  }

  // Date range filter
  if (filters.dateRange !== "all") {
    const dateRange = getDateRange(filters.dateRange);
    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }

  return filtered;
};

/**
 * Sort orders based on criteria
 */
export const sortOrders = (orders: SalesTransaction[], sortBy: string, sortOrder: "asc" | "desc"): SalesTransaction[] => {
  const sorted = [...orders];

  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "transactionNumber":
        aValue = a.transactionNumber;
        bValue = b.transactionNumber;
        break;
      case "customerName":
        aValue = a.customer?.name || "";
        bValue = b.customer?.name || "";
        break;
      case "total":
        aValue = a.cart.total;
        bValue = b.cart.total;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "paymentMethod":
        aValue = a.payments[0]?.type || "";
        bValue = b.payments[0]?.type || "";
        break;
      case "completedAt":
        aValue = a.completedAt || a.createdAt;
        bValue = b.completedAt || b.createdAt;
        break;
      case "createdAt":
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
    }

    // Handle date objects
    if (aValue instanceof Date && bValue instanceof Date) {
      aValue = aValue.getTime();
      bValue = bValue.getTime();
    }

    // Handle string comparisons
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return sorted;
};

/**
 * Apply filters and sorting to orders
 */
export const processOrders = (orders: SalesTransaction[], filters: OrderFilters): SalesTransaction[] => {
  const filtered = filterOrders(orders, filters);
  const sorted = sortOrders(filtered, filters.sortBy, filters.sortOrder);
  return sorted;
};

/**
 * Get order statistics
 */
export const getOrderStats = (orders: SalesTransaction[]) => {
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.cart.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
  
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentMethodCounts = orders.reduce((acc, order) => {
    const paymentType = order.payments[0]?.type || "unknown";
    acc[paymentType] = (acc[paymentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalOrders,
    totalAmount,
    averageOrderValue,
    completedOrders: statusCounts.completed || 0,
    pendingOrders: statusCounts.pending || 0,
    cancelledOrders: statusCounts.cancelled || 0,
    refundedOrders: statusCounts.refunded || 0,
    cashPayments: paymentMethodCounts.cash || 0,
    cardPayments: paymentMethodCounts.card || 0,
    digitalPayments: paymentMethodCounts.digital || 0,
    qrPayments: paymentMethodCounts.qr || 0,
  };
};

/**
 * Paginate orders
 */
export const paginateOrders = (orders: SalesTransaction[], currentPage: number, perPage: number) => {
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(orders.length / perPage);

  return {
    orders: paginatedOrders,
    totalPages,
    currentPage,
    perPage,
    totalItems: orders.length,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Generate order search suggestions
 */
export const getOrderSearchSuggestions = (orders: SalesTransaction[], searchTerm: string, maxSuggestions = 10) => {
  if (!searchTerm) return [];

  const searchLower = searchTerm.toLowerCase();
  const suggestions = new Set<string>();

  orders.forEach((order) => {
    // Transaction numbers
    if (order.transactionNumber.toLowerCase().includes(searchLower)) {
      suggestions.add(order.transactionNumber);
    }

    // Receipt numbers
    if (order.receipt?.receiptNumber?.toLowerCase().includes(searchLower)) {
      suggestions.add(order.receipt.receiptNumber);
    }

    // Customer names
    if (order.customer?.name?.toLowerCase().includes(searchLower)) {
      suggestions.add(order.customer.name);
    }

    // Customer phones
    if (order.customer?.phone?.includes(searchTerm)) {
      suggestions.add(order.customer.phone);
    }
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
};

/**
 * Export orders to CSV
 */
export const exportOrdersToCSV = (orders: SalesTransaction[]): string => {
  const headers = [
    "เลขที่คำสั่ง",
    "เลขที่ใบเสร็จ",
    "วันที่",
    "ลูกค้า",
    "โทรศัพท์",
    "พนักงาน",
    "สาขา",
    "สถานะ",
    "วิธีชำระ",
    "ยอดรวมก่อนภาษี",
    "ส่วนลด",
    "ภาษี",
    "ยอดสุทธิ",
    "จำนวนรายการ",
  ];

  const rows = orders.map((order) => [
    order.transactionNumber,
    order.receipt?.receiptNumber || "",
    order.createdAt.toLocaleString("th-TH"),
    order.customer?.name || "",
    order.customer?.phone || "",
    order.cashier.name,
    order.branch.name,
    order.status,
    order.payments[0]?.type || "",
    order.cart.subtotal.toFixed(2),
    order.cart.discountAmount.toFixed(2),
    order.cart.taxAmount.toFixed(2),
    order.cart.total.toFixed(2),
    order.cart.itemCount.toString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadOrdersCSV = (orders: SalesTransaction[], filename = "orders.csv") => {
  const csvContent = exportOrdersToCSV(orders);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Default filter values
 */
export const defaultOrderFilters: OrderFilters = {
  searchTerm: "",
  status: "all",
  dateRange: "today",
  paymentMethod: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};