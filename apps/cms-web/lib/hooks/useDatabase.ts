import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  productService,
  categoryService,
  orderService,
  supplierService,
  type ProductFilters,
  type CreateProductData,
  type UpdateProductData,
  type CategoryFilters,
  type CreateCategoryData,
  type UpdateCategoryData,
  type SupplierFilters,
} from "@shopflow/api";

// Query Keys
export const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  CATEGORIES: "categories",
  CATEGORY: "category",
  SUPPLIERS: "suppliers",
  SUPPLIER: "supplier",
  ORDERS: "orders",
  ORDER: "order",
  LOW_STOCK: "low-stock",
  FEATURED_PRODUCTS: "featured-products",
} as const;

// Product Hooks
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: async () => {
      const response = await productService.getAll(filters);
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

// Featured Products Hook
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Category Hooks
export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, filters],
    queryFn: async () => {
      const response = await categoryService.getAll(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch categories");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY, id],
    queryFn: async () => {
      const response = await categoryService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch category");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await categoryService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create category");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มหมวดหมู่เรียบร้อยแล้ว",
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

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryData;
    }) => {
      const response = await categoryService.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update category");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CATEGORY, data.id],
        });
      }
      toast({
        title: "สำเร็จ",
        description: "แก้ไขหมวดหมู่เรียบร้อยแล้ว",
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

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryService.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete category");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      toast({
        title: "สำเร็จ",
        description: "ลบหมวดหมู่เรียบร้อยแล้ว",
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

// Order Hooks
export function useOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER, id],
    queryFn: async () => {
      const response = await orderService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch order");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

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
