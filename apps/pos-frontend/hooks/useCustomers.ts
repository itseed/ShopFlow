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
      customerNumber: "C001",
      name: "สมชาย ใจดี",
      email: "somchai@email.com",
      phone: "0812345678",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
      dateOfBirth: new Date("1985-05-15"),
      gender: "male",
      isActive: true,
      membership: {
        id: "1",
        customerId: "1",
        membershipType: {
          id: "1",
          name: "Gold",
          color: "yellow",
          benefits: ["ส่วนลด 10%", "แต้มสะสม x2"],
          minSpent: 50000,
          discountPercentage: 10,
          pointsMultiplier: 2,
          description: "สมาชิกระดับทอง",
          isActive: true,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
        },
        membershipNumber: "M0001",
        points: 1250,
        totalSpent: 75000,
        discountPercentage: 10,
        joinedAt: new Date("2023-01-15"),
        status: "active",
        expiresAt: new Date("2024-12-31"),
      },
      notes: "ลูกค้า VIP",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2024-01-10"),
    },
    {
      id: "2",
      customerNumber: "C002",
      name: "สมหญิง รักสวย",
      email: "somying@email.com",
      phone: "0812345679",
      isActive: true,
      membership: {
        id: "2",
        customerId: "2",
        membershipType: {
          id: "2",
          name: "Silver",
          color: "gray",
          benefits: ["ส่วนลด 5%", "แต้มสะสม x1.5"],
          minSpent: 25000,
          discountPercentage: 5,
          pointsMultiplier: 1.5,
          description: "สมาชิกระดับเงิน",
          isActive: true,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
        },
        membershipNumber: "M0002",
        points: 800,
        totalSpent: 35000,
        discountPercentage: 5,
        joinedAt: new Date("2023-03-20"),
        status: "active",
        expiresAt: new Date("2024-12-31"),
      },
      createdAt: new Date("2023-03-20"),
      updatedAt: new Date("2024-01-08"),
    },
    {
      id: "3",
      customerNumber: "C003",
      name: "อนุชา ทำงานหนัก",
      email: "anucha@email.com",
      phone: "0812345680",
      isActive: true,
      createdAt: new Date("2023-06-10"),
      updatedAt: new Date("2024-01-05"),
    },
    {
      id: "4",
      customerNumber: "C004",
      name: "วิภา ขยันเรียน",
      email: "wipha@email.com",
      phone: "0812345681",
      gender: "female",
      isActive: true,
      createdAt: new Date("2023-08-15"),
      updatedAt: new Date("2024-01-03"),
    },
    {
      id: "5",
      customerNumber: "C005",
      name: "ประยุทธ พากเพียร",
      email: "prayuth@email.com",
      phone: "0812345682",
      address: "456 ถนนพหลโยธิน กรุงเทพฯ 10400",
      dateOfBirth: new Date("1978-12-03"),
      gender: "male",
      isActive: false,
      notes: "ลูกค้าเก่า - ไม่ใช้งาน",
      createdAt: new Date("2022-11-20"),
      updatedAt: new Date("2023-12-15"),
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
        const newCustomer: Customer = {
          id: Date.now().toString(),
          customerNumber: generateCustomerNumber(customers),
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          isActive: true,
          notes: data.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
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
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          notes: data.notes,
          updatedAt: new Date(),
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
    customerId: id || "1",
    totalSpent: 75000,
    totalOrders: 25,
    averageOrderValue: 3000,
    lastPurchaseDate: new Date("2024-01-15"),
    pointsBalance: 1250,
    monthlySpending: [
      { month: "2024-01", amount: 15000, orders: 5 },
      { month: "2024-02", amount: 18000, orders: 6 },
      { month: "2024-03", amount: 12000, orders: 4 },
    ],
    favoriteProducts: [
      {
        productId: "1",
        productName: "สินค้า A",
        purchaseCount: 8,
        totalAmount: 24000,
      },
      {
        productId: "2",
        productName: "สินค้า B",
        purchaseCount: 5,
        totalAmount: 15000,
      },
    ],
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
