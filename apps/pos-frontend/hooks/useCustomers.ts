import { useState, useEffect, useCallback } from "react";
import {
  Customer,
  CustomerFormData,
  CustomerStats,
  CustomerTransaction,
  CustomerActivity,
} from "@shopflow/types";
import {
  validateCustomerData,
  filterCustomers,
  processCustomers,
  paginateCustomers,
  generateCustomerNumber,
  getCustomerSummaryStats,
  defaultCustomerFilters,
  type CustomerValidationResult,
  type CustomerSearchFilters,
  type PaginatedCustomers,
} from "../lib/customers";

interface UseCustomersOptions {
  initialFilters?: Partial<CustomerSearchFilters>;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseCustomersReturn {
  // Data
  customers: Customer[];
  filteredCustomers: Customer[];
  paginatedResult: PaginatedCustomers;
  stats: ReturnType<typeof getCustomerSummaryStats>;

  // State
  loading: boolean;
  error: string | null;
  filters: CustomerSearchFilters;
  currentPage: number;

  // Actions
  loadCustomers: () => Promise<void>;
  searchCustomers: (filters: CustomerSearchFilters) => void;
  setFilters: (filters: CustomerSearchFilters) => void;
  setPage: (page: number) => void;
  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, data: CustomerFormData) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomer: (id: string) => Promise<Customer | null>;
  validateCustomer: (data: CustomerFormData) => CustomerValidationResult;
  refreshCustomers: () => Promise<void>;
}

export const useCustomers = (
  options: UseCustomersOptions = {}
): UseCustomersReturn => {
  const { initialFilters = {}, pageSize = 20, autoLoad = true } = options;

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CustomerSearchFilters>({
    ...defaultCustomerFilters,
    ...initialFilters,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for development
  const mockCustomers: Customer[] = [
    {
      id: "1",
      customer_code: "C001",
      first_name: "สมชาย",
      last_name: "ใจดี",
      email: "somchai@email.com",
      phone: "0812345678",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
      city: "กรุงเทพฯ",
      postal_code: "10110",
      country: "TH",
      customer_type: "vip",
      status: "active",
      credit_limit: 0,
      current_balance: 0,
      total_orders: 15,
      total_spent: 75000,
      loyalty_points: 1250,
      notes: "ลูกค้า VIP",
      created_at: "2023-01-15T00:00:00Z",
      updated_at: "2024-01-10T00:00:00Z",
    },
    {
      id: "2",
      customer_code: "C002",
      first_name: "สมหญิง",
      last_name: "รักสวย",
      email: "somying@email.com",
      phone: "0812345679",
      city: "กรุงเทพฯ",
      postal_code: "10110",
      country: "TH",
      customer_type: "regular",
      status: "active",
      credit_limit: 0,
      current_balance: 0,
      total_orders: 8,
      total_spent: 35000,
      loyalty_points: 800,
      created_at: "2023-03-20T00:00:00Z",
      updated_at: "2024-01-08T00:00:00Z",
    },
    {
      id: "3",
      customer_code: "C003",
      first_name: "อนุชา",
      last_name: "ทำงานหนัก",
      email: "anucha@email.com",
      phone: "0812345680",
      city: "กรุงเทพฯ",
      postal_code: "10110",
      country: "TH",
      customer_type: "individual",
      status: "active",
      credit_limit: 0,
      current_balance: 0,
      total_orders: 5,
      total_spent: 12000,
      loyalty_points: 240,
      created_at: "2023-06-10T00:00:00Z",
      updated_at: "2024-01-05T00:00:00Z",
    },
    {
      id: "4",
      customer_code: "C004",
      first_name: "วิภา",
      last_name: "ขยันเรียน",
      email: "wipha@email.com",
      phone: "0812345681",
      city: "กรุงเทพฯ",
      postal_code: "10110",
      country: "TH",
      customer_type: "individual",
      status: "active",
      credit_limit: 0,
      current_balance: 0,
      total_orders: 3,
      total_spent: 8000,
      loyalty_points: 160,
      created_at: "2023-08-15T00:00:00Z",
      updated_at: "2024-01-03T00:00:00Z",
    },
    {
      id: "5",
      customer_code: "C005",
      first_name: "ประยุทธ",
      last_name: "พากเพียร",
      email: "prayuth@email.com",
      phone: "0812345682",
      address: "456 ถนนพหลโยธิน กรุงเทพฯ 10400",
      city: "กรุงเทพฯ",
      postal_code: "10400",
      country: "TH",
      customer_type: "individual",
      status: "inactive",
      credit_limit: 0,
      current_balance: 0,
      total_orders: 0,
      total_spent: 0,
      loyalty_points: 0,
      notes: "ลูกค้าเก่า - ไม่ใช้งาน",
      created_at: "2022-11-20T00:00:00Z",
      updated_at: "2023-12-15T00:00:00Z",
    },
  ];

  // Computed values
  const paginatedResult = paginateCustomers(
    filteredCustomers,
    currentPage,
    pageSize
  );
  const stats = getCustomerSummaryStats(customers);

  // Effects
  useEffect(() => {
    if (autoLoad) {
      loadCustomers();
    }
  }, [autoLoad]);

  useEffect(() => {
    applyFilters();
  }, [customers, filters]);

  // Actions
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCustomers(mockCustomers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    const processed = processCustomers(customers, filters);
    setFilteredCustomers(processed);
    // Reset to first page when filters change
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [customers, filters, currentPage]);

  const searchCustomers = useCallback((newFilters: CustomerSearchFilters) => {
    setFiltersState(newFilters);
  }, []);

  const setFilters = useCallback((newFilters: CustomerSearchFilters) => {
    setFiltersState(newFilters);
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const createCustomer = useCallback(
    async (data: CustomerFormData): Promise<Customer> => {
      setLoading(true);
      setError(null);
      try {
        // Validate data
        const validation = validateCustomerData(data);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors)[0]);
        }

        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 10% chance of error
            if (Math.random() < 0.1) {
              reject(new Error("เกิดข้อผิดพลาดในการสร้างลูกค้า"));
            } else {
              resolve(true);
            }
          }, 1000);
        });

        // Create new customer
        const customerCode = generateCustomerNumber(customers);
        const newCustomer: Customer = {
          id: Date.now().toString(),
          customer_code: customerCode,
          first_name: data.first_name,
          last_name: data.last_name,
          company_name: data.company_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country || "TH",
          customer_type: data.customer_type,
          status: data.status || "active",
          credit_limit: data.credit_limit || 0,
          current_balance: 0,
          total_orders: 0,
          total_spent: 0,
          loyalty_points: 0,
          notes: data.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add to customers list
        setCustomers((prev) => [newCustomer, ...prev]);

        return newCustomer;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างลูกค้า";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [customers]
  );

  const updateCustomer = useCallback(
    async (id: string, data: CustomerFormData): Promise<Customer> => {
      setLoading(true);
      setError(null);
      try {
        // Validate data
        const validation = validateCustomerData(data);
        if (!validation.isValid) {
          throw new Error(Object.values(validation.errors)[0]);
        }

        // Find existing customer
        const existingCustomer = customers.find((c) => c.id === id);
        if (!existingCustomer) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 5% chance of error
            if (Math.random() < 0.05) {
              reject(new Error("เกิดข้อผิดพลาดในการอัปเดตลูกค้า"));
            } else {
              resolve(true);
            }
          }, 800);
        });

        // Update customer
        const updatedCustomer: Customer = {
          ...existingCustomer,
          first_name: data.first_name,
          last_name: data.last_name,
          company_name: data.company_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country || existingCustomer.country,
          customer_type: data.customer_type || existingCustomer.customer_type,
          status: data.status || existingCustomer.status,
          credit_limit: data.credit_limit ?? existingCustomer.credit_limit,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        };

        // Update customers list
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === id ? updatedCustomer : customer
          )
        );

        return updatedCustomer;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการอัปเดตลูกค้า";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [customers]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // Find existing customer
        const existingCustomer = customers.find((c) => c.id === id);
        if (!existingCustomer) {
          throw new Error("ไม่พบข้อมูลลูกค้า");
        }

        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 3% chance of error
            if (Math.random() < 0.03) {
              reject(new Error("เกิดข้อผิดพลาดในการลบลูกค้า"));
            } else {
              resolve(true);
            }
          }, 500);
        });

        // Remove from customers list
        setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบลูกค้า";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [customers]
  );

  const getCustomer = useCallback(
    async (id: string): Promise<Customer | null> => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const customer = customers.find((c) => c.id === id);
        return customer || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [customers]
  );

  const validateCustomer = useCallback(
    (data: CustomerFormData): CustomerValidationResult => {
      return validateCustomerData(data);
    },
    []
  );

  const refreshCustomers = useCallback(async () => {
    await loadCustomers();
  }, [loadCustomers]);

  return {
    // Data
    customers,
    filteredCustomers,
    paginatedResult,
    stats,

    // State
    loading,
    error,
    filters,
    currentPage,

    // Actions
    loadCustomers,
    searchCustomers,
    setFilters,
    setPage,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    validateCustomer,
    refreshCustomers,
  };
};

// Hook for single customer operations
export const useCustomer = (id?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock customer stats
  const mockStats: CustomerStats = {
    total_orders: 25,
    total_spent: 75000,
    avg_order_value: 3000,
    last_order_date: "2024-01-15T00:00:00Z",
    loyalty_points: 1250,
    status: "active",
    // favoriteProducts removed as not in CustomerStats interface
  };

  // Mock transactions
  const mockTransactions: CustomerTransaction[] = [
    {
      id: "1",
      customerId: id || "1",
      type: "purchase",
      amount: 3500,
      description: "ซื้อสินค้า - ใบเสร็จ #INV001",
      pointsEarned: 35,
      createdAt: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "2",
      customerId: id || "1",
      type: "points_redeem",
      amount: -500,
      description: "ใช้แต้มแลกส่วนลด",
      pointsRedeemed: 100,
      createdAt: new Date("2024-01-10T14:20:00"),
    },
  ];

  // Mock activities
  const mockActivities: CustomerActivity[] = [
    {
      id: "1",
      customerId: id || "1",
      type: "purchase",
      title: "ซื้อสินค้า",
      description: "ซื้อสินค้า 3 รายการ มูลค่า 3,500 บาท",
      createdAt: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "2",
      customerId: id || "1",
      type: "membership_upgrade",
      title: "อัปเดตสมาชิก",
      description: "เลื่อนเป็นสมาชิก Gold",
      createdAt: new Date("2024-01-01T09:00:00"),
    },
  ];

  const loadCustomer = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find customer from mock data
      const customers = useCustomers({ autoLoad: false }).customers;
      const foundCustomer = customers.find((c) => c.id === id);

      if (!foundCustomer) {
        throw new Error("ไม่พบข้อมูลลูกค้า");
      }

      setCustomer(foundCustomer);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id, loadCustomer]);

  return {
    customer,
    stats: mockStats,
    transactions: mockTransactions,
    activities: mockActivities,
    loading,
    error,
    loadCustomer,
  };
};

export default useCustomers;
