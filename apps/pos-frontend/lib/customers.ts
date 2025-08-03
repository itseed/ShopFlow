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

  // Required fields
  if (!data.name?.trim()) {
    errors.name = "กรุณาระบุชื่อลูกค้า";
  } else if (data.name.length < 2) {
    errors.name = "ชื่อลูกค้าต้องมีอย่างน้อย 2 ตัวอักษร";
  } else if (data.name.length > 100) {
    errors.name = "ชื่อลูกค้าต้องไม่เกิน 100 ตัวอักษร";
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

  // Age validation (if date of birth provided)
  if (data.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(data.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) {
      errors.dateOfBirth = "วันเกิดไม่สามารถเป็นวันในอนาคตได้";
    } else if (age > 150) {
      errors.dateOfBirth = "วันเกิดไม่ถูกต้อง";
    }
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
    filtered = filtered.filter((customer) =>
      customer.name.toLowerCase().includes(searchLower) ||
      customer.customerNumber.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(filters.searchTerm) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  }

  // Membership type filter
  if (filters.membershipType !== "all") {
    if (filters.membershipType === "none") {
      filtered = filtered.filter((customer) => !customer.membership);
    } else {
      filtered = filtered.filter(
        (customer) => customer.membership?.membershipType.id === filters.membershipType
      );
    }
  }

  // Active status filter
  if (filters.isActive !== "all") {
    const isActiveValue = filters.isActive === "true";
    filtered = filtered.filter((customer) => customer.isActive === isActiveValue);
  }

  // Gender filter
  if (filters.gender !== "all") {
    filtered = filtered.filter((customer) => customer.gender === filters.gender);
  }

  // Age range filter
  if (filters.ageRange) {
    const today = new Date();
    filtered = filtered.filter((customer) => {
      if (!customer.dateOfBirth) return true;
      
      const age = today.getFullYear() - customer.dateOfBirth.getFullYear();
      return age >= filters.ageRange[0] && age <= filters.ageRange[1];
    });
  }

  // Total spent range filter
  if (filters.totalSpentRange) {
    filtered = filtered.filter((customer) => {
      const totalSpent = customer.membership?.totalSpent || 0;
      return totalSpent >= filters.totalSpentRange[0] && totalSpent <= filters.totalSpentRange[1];
    });
  }

  // Registration date range filter
  if (filters.registrationDateRange !== "all") {
    const dateRange = getDateRange(filters.registrationDateRange);
    filtered = filtered.filter((customer) => {
      const createdAt = new Date(customer.createdAt);
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
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "customerNumber":
        aValue = a.customerNumber;
        bValue = b.customerNumber;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "totalSpent":
        aValue = a.membership?.totalSpent || 0;
        bValue = b.membership?.totalSpent || 0;
        break;
      case "lastPurchase":
        // Would need to implement based on actual data structure
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
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
    const numberPart = parseInt(customer.customerNumber.replace(/^C/, "")) || 0;
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
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const membersCount = customers.filter((c) => c.membership).length;
  
  const totalRevenue = customers.reduce(
    (sum, c) => sum + (c.membership?.totalSpent || 0),
    0
  );
  
  const averageSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Gender distribution
  const genderStats = customers.reduce((acc, customer) => {
    const gender = customer.gender || "unknown";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Age distribution
  const ageStats = customers.reduce((acc, customer) => {
    if (!customer.dateOfBirth) {
      acc.unknown = (acc.unknown || 0) + 1;
      return acc;
    }

    const age = calculateAge(customer.dateOfBirth);
    if (age < 18) acc.under18 = (acc.under18 || 0) + 1;
    else if (age < 30) acc.age18to29 = (acc.age18to29 || 0) + 1;
    else if (age < 50) acc.age30to49 = (acc.age30to49 || 0) + 1;
    else if (age < 65) acc.age50to64 = (acc.age50to64 || 0) + 1;
    else acc.age65plus = (acc.age65plus || 0) + 1;

    return acc;
  }, {} as Record<string, number>);

  // Membership distribution
  const membershipStats = customers.reduce((acc, customer) => {
    const membershipType = customer.membership?.membershipType.name || "none";
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

  const rows = customers.map((customer) => [
    customer.customerNumber,
    customer.name,
    customer.phone || "",
    customer.email || "",
    customer.address || "",
    customer.dateOfBirth ? customer.dateOfBirth.toLocaleDateString("th-TH") : "",
    customer.gender === "male" ? "ชาย" : customer.gender === "female" ? "หญิง" : customer.gender || "",
    customer.membership?.membershipType.name || "",
    customer.membership?.membershipNumber || "",
    customer.membership?.points?.toString() || "0",
    customer.membership?.totalSpent?.toString() || "0",
    customer.isActive ? "ใช้งาน" : "ไม่ใช้งาน",
    customer.createdAt.toLocaleDateString("th-TH"),
    customer.notes || "",
  ]);

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