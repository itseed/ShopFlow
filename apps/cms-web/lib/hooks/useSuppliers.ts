import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  supplierService,
  SupplierFilters,
  CreateSupplierData,
  UpdateSupplierData,
  Supplier,
  SupplierWithStats,
} from "@shopflow/api";

// Hook for getting all suppliers
export function useSuppliers(filters: SupplierFilters = {}) {
  const {
    data: suppliers = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", filters],
    queryFn: async () => {
      const result = await supplierService.getAll(filters);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
  });

  return {
    suppliers,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for getting supplier count
export function useSupplierCount(filters: SupplierFilters = {}) {
  const {
    data: count = 0,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["suppliers", "count", filters],
    queryFn: async () => {
      const result = await supplierService.count(filters);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
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

// Hook for getting supplier by ID
export function useSupplier(id: string) {
  const {
    data: supplier,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", id],
    queryFn: async () => {
      const result = await supplierService.getById(id);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
    enabled: !!id,
  });

  return {
    supplier,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for creating suppliers
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  const { mutateAsync: createSupplier, isPending: isCreating } = useMutation({
    mutationFn: async (supplierData: CreateSupplierData) => {
      const result = await supplierService.create(supplierData);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch suppliers queries
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    createSupplier,
    isCreating,
  };
}

// Hook for updating suppliers
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  const { mutateAsync: updateSupplier, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSupplierData;
    }) => {
      const result = await supplierService.update(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch suppliers queries
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      // Update the specific supplier in cache
      queryClient.setQueryData(["suppliers", data?.id], data);
    },
  });

  return {
    updateSupplier,
    isUpdating,
  };
}

// Hook for deleting/deactivating suppliers
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteSupplier, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const result = await supplierService.delete(id);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch suppliers queries
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    deleteSupplier,
    isDeleting,
  };
}

// Hook for supplier statistics
export function useSupplierStats() {
  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["suppliers", "stats"],
    queryFn: async () => {
      const result = await supplierService.getStats();
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
  });

  return {
    stats: stats || {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      avgRating: 0,
    },
    loading,
    error: error?.message || null,
  };
}

// Hook for searching suppliers
export function useSupplierSearch(query: string, limit = 10) {
  const {
    data: suppliers = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["suppliers", "search", query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const result = await supplierService.search(query, limit);
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
    enabled: query.length >= 2,
  });

  return {
    suppliers,
    loading,
    error: error?.message || null,
  };
}

// Hook for suppliers with statistics
export function useSuppliersWithStats() {
  const {
    data: suppliers = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suppliers", "withStats"],
    queryFn: async () => {
      const result = await supplierService.getSuppliersWithStats();
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      return result.data;
    },
  });

  return {
    suppliers,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for updating supplier balance
export function useUpdateSupplierBalance() {
  const queryClient = useQueryClient();

  const { mutateAsync: updateBalance, isPending: isUpdatingBalance } =
    useMutation({
      mutationFn: async ({
        id,
        amount,
        type,
      }: {
        id: string;
        amount: number;
        type: "increase" | "decrease";
      }) => {
        const result = await supplierService.updateBalance(id, amount, type);
        if (!result.success) {
          throw new Error(result.error || 'Unknown error occurred');
        }
        return result.data;
      },
      onSuccess: (data) => {
        // Invalidate and refetch suppliers queries
        queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        // Update the specific supplier in cache
        queryClient.setQueryData(["suppliers", data?.id], data);
      },
    });

  return {
    updateBalance,
    isUpdatingBalance,
  };
}
