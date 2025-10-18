import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  productService,
  type ProductFilters,
  type CreateProductData,
  type UpdateProductData,
} from "@shopflow/api";
import { QUERY_KEYS } from "./queryKeys";

// Product Hooks
export function useProducts(
  filters?: ProductFilters & { searchQuery?: string }
) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: async () => {
      const response = await productService.getAll({
        ...filters,
        search: filters?.searchQuery,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch products");
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, id],
    queryFn: async () => {
      const response = await productService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch product");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: [QUERY_KEYS.LOW_STOCK],
    queryFn: async () => {
      const response = await productService.getLowStock();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch low stock products");
      }
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedProducts(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.FEATURED_PRODUCTS, limit],
    queryFn: async () => {
      const response = await productService.getFeatured(limit);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch featured products");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const response = await productService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create product");
      }
      return response.data;
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
      data: UpdateProductData;
    }) => {
      const response = await productService.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update product");
      }
      return response.data;
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
      const response = await productService.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete product");
      }
      return response.data;
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
      if (!response.success) {
        throw new Error(response.error || "Failed to search products");
      }
      // Limit results client-side
      return (response.data || []).slice(0, limit);
    },
    enabled: query.length >= 2,
  });
}
