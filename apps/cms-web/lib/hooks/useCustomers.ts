import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customerService,
  CustomerFilters,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerWithStats,
  Customer,
} from "@shopflow/api";

// Hook for getting all customers
export function useCustomers(filters: CustomerFilters = {}) {
  const {
    data: customers = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const result = await customerService.getAll(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    customers,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for getting customer count
export function useCustomerCount(filters: CustomerFilters = {}) {
  const {
    data: count = 0,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["customers", "count", filters],
    queryFn: async () => {
      const result = await customerService.count(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    count,
    loading,
    error: error?.message || null,
  };
}

// Hook for getting customer by ID
export function useCustomer(id: string) {
  const {
    data: customer,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const result = await customerService.getById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });

  return {
    customer,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for creating customers
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  const { mutateAsync: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: async (customerData: CreateCustomerData) => {
      const result = await customerService.create(customerData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch customers queries
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return {
    createCustomer,
    isCreating,
  };
}

// Hook for updating customers
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  const { mutateAsync: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerData;
    }) => {
      const result = await customerService.update(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch customers queries
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Update the specific customer in cache
      queryClient.setQueryData(["customers", data.id], data);
    },
  });

  return {
    updateCustomer,
    isUpdating,
  };
}

// Hook for deleting/deactivating customers
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const result = await customerService.delete(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch customers queries
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return {
    deleteCustomer,
    isDeleting,
  };
}

// Hook for customer statistics
export function useCustomerStats() {
  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["customers", "stats"],
    queryFn: async () => {
      const result = await customerService.getStats();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    stats: stats || {
      total: 0,
      active: 0,
      inactive: 0,
      newThisMonth: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    },
    loading,
    error: error?.message || null,
  };
}

// Hook for searching customers
export function useCustomerSearch(query: string, enabled = true) {
  const {
    data: customers = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["customers", "search", query],
    queryFn: async () => {
      const result = await customerService.search(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && query.length > 0,
  });

  return {
    customers,
    loading,
    error: error?.message || null,
  };
}

// Hook for getting top customers
export function useTopCustomers(limit = 10) {
  const {
    data: customers = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["customers", "top", limit],
    queryFn: async () => {
      const result = await customerService.getTopCustomers(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    customers,
    loading,
    error: error?.message || null,
  };
}

// Hook for getting customers with enhanced filtering
export function useCustomersWithFilters() {
  const queryClient = useQueryClient();

  const getCustomers = async (filters: CustomerFilters) => {
    const result = await customerService.getAll(filters);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  };

  const searchCustomers = async (query: string) => {
    const result = await customerService.search(query);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  };

  const refreshCustomers = () => {
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  return {
    getCustomers,
    searchCustomers,
    refreshCustomers,
  };
}
