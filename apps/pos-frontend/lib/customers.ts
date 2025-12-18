import { Customer, CustomerFormData, CustomerStats, CustomerTransaction, CustomerActivity } from "@shopflow/types";
import { CustomerFilters } from "../components/customers/CustomerSearch";

export interface CustomerValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface CustomerSearchFilters extends CustomerFilters {
  branch?: string;
  tags?: string[];
}

export interface PaginatedCustomers {
  customers: Customer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Validate customer form data
 */
export const validateCustomerData = (data: CustomerFormData): CustomerValidationResult => {
  const errors: Record<string, string> = {};

  // Required fields - must have either first_name or company_name
  const hasName = (data.first_name?.trim() || data.company_name?.trim());
  if (!hasName) {
    errors.first_name = "กรุณาระบุชื่อลูกค้าหรือชื่อบริษัท";
  } else if (data.first_name && data.first_name.length < 2) {
    errors.first_name = "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
  } else if (data.first_name && data.first_name.length > 100) {
    errors.first_name = "ชื่อต้องไม่เกิน 100 ตัวอักษร";
  } else if (data.company_name && data.company_name.length < 2) {
    errors.company_name = "ชื่อบริษัทต้องมีอย่างน้อย 2 ตัวอักษร";
  } else if (data.company_name && data.company_name.length > 100) {
    errors.company_name = "ชื่อบริษัทต้องไม่เกิน 100 ตัวอักษร";
  }

  // Phone validation
  if (data.phone) {
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    } else if (data.phone.replace(/[^0-9]/g, "").length < 9) {
      errors.phone = "เบอร์โทรต้องมีอย่างน้อย 9 หลัก";
    }
  }

  // Email validation
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    } else if (data.email.length > 100) {
      errors.email = "อีเมลต้องไม่เกิน 100 ตัวอักษร";
    }
  }

  // Customer type validation
  if (!data.customer_type) {
    errors.customer_type = "กรุณาเลือกประเภทลูกค้า";
  }

  // Address validation
  if (data.address && data.address.length > 500) {
    errors.address = "ที่อยู่ต้องไม่เกิน 500 ตัวอักษร";
  }

  // Notes validation
  if (data.notes && data.notes.length > 1000) {
    errors.notes = "หมายเหตุต้องไม่เกิน 1000 ตัวอักษร";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Filter customers based on search criteria
 */
export const filterCustomers = (
  customers: Customer[],
  filters: CustomerSearchFilters
): Customer[] => {
  let filtered = [...customers];

  // Search term filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((customer) => {
      const name = customer.company_name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
      return name.toLowerCase().includes(searchLower) ||
        (customer.customer_code && customer.customer_code.toLowerCase().includes(searchLower)) ||
        customer.phone?.includes(filters.searchTerm) ||
        customer.email?.toLowerCase().includes(searchLower);
    });
  }

  // Membership type filter - using loyalty_points as proxy
  if (filters.membershipType !== "all") {
    if (filters.membershipType === "none") {
      filtered = filtered.filter((customer) => !customer.loyalty_points || customer.loyalty_points === 0);
    } else {
      // Filter by loyalty points thresholds (simplified)
      filtered = filtered.filter((customer) => {
        const points = customer.loyalty_points || 0;
        // Basic membership tiers based on points
        if (filters.membershipType === "bronze") return points > 0 && points < 500;
        if (filters.membershipType === "silver") return points >= 500 && points < 2000;
        if (filters.membershipType === "gold") return points >= 2000;
        return true;
      });
    }
  }

  // Active status filter
  if (filters.isActive !== "all") {
    const isActiveValue = filters.isActive === "true";
    filtered = filtered.filter((customer) => customer.status === (isActiveValue ? "active" : "inactive"));
  }

  // Gender filter - removed as not in Customer type
  // if (filters.gender !== "all") {
  //   filtered = filtered.filter((customer) => customer.gender === filters.gender);
  // }

  // Age range filter - removed as dateOfBirth not in Customer type
  // if (filters.ageRange) {
  //   const today = new Date();
  //   filtered = filtered.filter((customer) => {
  //     if (!customer.dateOfBirth) return true;
  //     const age = today.getFullYear() - customer.dateOfBirth.getFullYear();
  //     return age >= filters.ageRange[0] && age <= filters.ageRange[1];
  //   });
  // }

  // Total spent range filter
  if (filters.totalSpentRange) {
    filtered = filtered.filter((customer) => {
      const totalSpent = customer.total_spent || 0;
      return totalSpent >= filters.totalSpentRange[0] && totalSpent <= filters.totalSpentRange[1];
    });
  }

  // Registration date range filter
  if (filters.registrationDateRange !== "all") {
    const dateRange = getDateRange(filters.registrationDateRange);
    filtered = filtered.filter((customer) => {
      const createdAt = new Date(customer.created_at);
      return createdAt >= dateRange.start && createdAt <= dateRange.end;
    });
  }

  return filtered;
};

/**
 * Sort customers based on criteria
 */
export const sortCustomers = (
  customers: Customer[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Customer[] => {
  const sorted = [...customers];

  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "name": {
        const aName = a.company_name || `${a.first_name || ""} ${a.last_name || ""}`.trim();
        const bName = b.company_name || `${b.first_name || ""} ${b.last_name || ""}`.trim();
        aValue = aName.toLowerCase();
        bValue = bName.toLowerCase();
        break;
      }
      case "customerNumber":
        aValue = a.customer_code || "";
        bValue = b.customer_code || "";
        break;
      case "createdAt":
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case "totalSpent":
        aValue = a.total_spent || 0;
        bValue = b.total_spent || 0;
        break;
      case "lastPurchase":
        // Would need to implement based on actual data structure
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default: {
        const aName = a.company_name || `${a.first_name || ""} ${a.last_name || ""}`.trim();
        const bName = b.company_name || `${b.first_name || ""} ${b.last_name || ""}`.trim();
        aValue = aName.toLowerCase();
        bValue = bName.toLowerCase();
        break;
      }
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
 * Process customers with filters and sorting
 */
export const processCustomers = (
  customers: Customer[],
  filters: CustomerSearchFilters
): Customer[] => {
  const filtered = filterCustomers(customers, filters);
  const sorted = sortCustomers(filtered, filters.sortBy, filters.sortOrder);
  return sorted;
};

/**
 * Paginate customers
 */
export const paginateCustomers = (
  customers: Customer[],
  page: number,
  pageSize: number
): PaginatedCustomers => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = customers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(customers.length / pageSize);

  return {
    customers: paginatedCustomers,
    totalCount: customers.length,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Generate customer number
 */
export const generateCustomerNumber = (existingCustomers: Customer[]): string => {
  const maxNumber = existingCustomers.reduce((max, customer) => {
    if (!customer.customer_code) return max;
    const numberPart = parseInt(customer.customer_code.replace(/^C/, "")) || 0;
    return Math.max(max, numberPart);
  }, 0);

  return `C${String(maxNumber + 1).padStart(3, "0")}`;
};

/**
 * Calculate customer age
 */
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Get customer statistics
 */
export const getCustomerSummaryStats = (customers: Customer[]) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const membersCount = customers.filter((c) => (c.loyalty_points || 0) > 0).length;
  
  const totalRevenue = customers.reduce(
    (sum, c) => sum + (c.total_spent || 0),
    0
  );
  
  const averageSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Gender distribution - removed as gender not in Customer type
  const genderStats: Record<string, number> = {
    unknown: customers.length, // All unknown as gender not available
  };

  // Age distribution - removed as dateOfBirth not in Customer type
  const ageStats: Record<string, number> = {
    unknown: customers.length, // All unknown as dateOfBirth not available
  };

  // Membership distribution - using loyalty_points as proxy
  const membershipStats = customers.reduce((acc, customer) => {
    const points = customer.loyalty_points || 0;
    let membershipType = "none";
    if (points >= 2000) membershipType = "gold";
    else if (points >= 500) membershipType = "silver";
    else if (points > 0) membershipType = "bronze";
    acc[membershipType] = (acc[membershipType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers: totalCustomers - activeCustomers,
    membersCount,
    nonMembersCount: totalCustomers - membersCount,
    totalRevenue,
    averageSpending,
    membershipPercentage: totalCustomers > 0 ? (membersCount / totalCustomers) * 100 : 0,
    genderStats,
    ageStats,
    membershipStats,
  };
};

/**
 * Export customer data to CSV
 */
export const exportCustomersToCSV = (customers: Customer[]): string => {
  const headers = [
    "รหัสลูกค้า",
    "ชื่อ",
    "โทรศัพท์",
    "อีเมล",
    "ที่อยู่",
    "วันเกิด",
    "เพศ",
    "ประเภทสมาชิก",
    "เลขสมาชิก",
    "แต้มสะสม",
    "ยอดซื้อรวม",
    "สถานะ",
    "วันที่ลงทะเบียน",
    "หมายเหตุ",
  ];

  const rows = customers.map((customer) => {
    const name = customer.company_name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
    const points = customer.loyalty_points || 0;
    let membershipType = "none";
    if (points >= 2000) membershipType = "gold";
    else if (points >= 500) membershipType = "silver";
    else if (points > 0) membershipType = "bronze";
    return [
      customer.customer_code || "",
      name,
      customer.phone || "",
      customer.email || "",
      customer.address || "",
      "", // dateOfBirth not in Customer type
      "", // gender not in Customer type
      membershipType,
      "", // membershipNumber not in Customer type
      points.toString(),
      (customer.total_spent || 0).toString(),
      customer.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน",
      new Date(customer.created_at).toLocaleDateString("th-TH"),
      customer.notes || "",
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};

/**
 * Download customers CSV
 */
export const downloadCustomersCSV = (customers: Customer[], filename = "customers.csv") => {
  const csvContent = exportCustomersToCSV(customers);
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
 * Get date range helper
 */
const getDateRange = (range: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
      };
    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: monthStart, end: monthEnd };
    case "last_month":
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      return { start: lastMonthStart, end: lastMonthEnd };
    case "quarter":
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
      const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0, 23, 59, 59, 999);
      return { start: quarterStart, end: quarterEnd };
    case "year":
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start: yearStart, end: yearEnd };
    default:
      return {
        start: new Date(2000, 0, 1),
        end: new Date(2099, 11, 31),
      };
  }
};

/**
 * Default customer filters
 */
export const defaultCustomerFilters: CustomerSearchFilters = {
  searchTerm: "",
  membershipType: "all",
  isActive: "all",
  gender: "all",
  ageRange: [18, 80],
  totalSpentRange: [0, 100000],
  registrationDateRange: "all",
  sortBy: "name",
  sortOrder: "asc",
};