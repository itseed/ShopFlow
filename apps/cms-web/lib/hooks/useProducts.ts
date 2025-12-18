import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { products as productService } from "@shopflow/api/services/coreService";
import type { Product } from "@shopflow/types";
import { QUERY_KEYS } from "./queryKeys";

// Product Hooks
export function useProducts(
  filters?: Partial<Product> & { searchQuery?: string }
) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: async () => {
      const response = await productService.getAll({
        ...filters,
        search: filters?.searchQuery,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, id],
    queryFn: async () => {
      const data = await productService.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: [QUERY_KEYS.LOW_STOCK],
    queryFn: async () => {
      const data = await productService.getLowStock();
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.FEATURED_PRODUCTS, limit],
    queryFn: async () => {
      const response = await productService.getAll({ limit });
      const data = response.data || [];
      return data.filter((p: any) => p.is_featured).slice(0, limit || 10);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const created = await productService.create(data as any);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มสินค้าเรียบร้อยแล้ว",
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

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Product>;
    }) => {
      const updated = await productService.update(id, data as any);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PRODUCT, data.id],
        });
      }
      toast({
        title: "สำเร็จ",
        description: "แก้ไขสินค้าเรียบร้อยแล้ว",
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

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await productService.delete(id);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      toast({
        title: "สำเร็จ",
        description: "ลบสินค้าเรียบร้อยแล้ว",
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

export function useProductSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "search", query, limit],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      // Use getAll with search filter instead of search method
      const response = await productService.getAll({ search: query });
      // productService.getAll returns { data, count } directly, not ApiResponse
      // Limit results client-side
      return (response.data || []).slice(0, limit);
    },
    enabled: query.length >= 2,
  });
}
