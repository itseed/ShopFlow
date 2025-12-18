import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { supplierService } from "@shopflow/api/services/supplierService";
import type {
  SupplierFilters,
  CreateSupplierData,
  UpdateSupplierData,
} from "@shopflow/api/services/supplierService";
import { QUERY_KEYS } from "./queryKeys";

// Supplier Hooks
export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, filters],
    queryFn: async () => {
      const response = await supplierService.getAll(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch suppliers");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER, id],
    queryFn: async () => {
      const response = await supplierService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch supplier");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateSupplierData) => {
      const response = await supplierService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create supplier");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มซัพพลายเออร์เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSupplierData;
    }) => {
      const response = await supplierService.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update supplier");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.SUPPLIER, data.id],
        });
      }
      toast({
        title: "สำเร็จ",
        description: "แก้ไขซัพพลายเออร์เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await supplierService.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete supplier");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
      toast({
        title: "สำเร็จ",
        description: "ลบซัพพลายเออร์เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}

export function useSupplierSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, "search", query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const response = await supplierService.search(query, limit);
      if (!response.success) {
        throw new Error(response.error || "Failed to search suppliers");
      }
      return response.data || [];
    },
    enabled: query.length >= 2,
  });
}
