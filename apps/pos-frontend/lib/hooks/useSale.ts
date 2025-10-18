import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  productService,
  orderService,
  type ProductFilters,
  type CreateOrderData,
} from "@shopflow/api";

// Query Keys
export const QUERY_KEYS = {
  POS_PRODUCTS: "pos-products",
  POS_PRODUCT_SEARCH: "pos-product-search",
  POS_BARCODE_SEARCH: "pos-barcode-search",
} as const;

// Product Hooks
export function usePOSProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.POS_PRODUCTS, filters],
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

export function usePOSProductSearch(searchTerm: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.POS_PRODUCT_SEARCH, searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const response = await productService.getAll({ search: searchTerm });
      if (!response.success) {
        throw new Error(response.error || "Failed to search products");
      }
      return response.data || [];
    },
    enabled: !!searchTerm,
  });
}

export function usePOSBarcodeSearch(barcode: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.POS_BARCODE_SEARCH, barcode],
    queryFn: async () => {
      if (!barcode) return null;
      const response = await productService.getByBarcode(barcode);
      if (!response.success) {
        return null;
      }
      return response.data;
    },
    enabled: !!barcode,
  });
}

// Order Hooks
export function usePOSCreateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await orderService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create order");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POS_PRODUCTS] });
      toast({
        title: "สำเร็จ",
        description: "สร้างคำสั่งซื้อเรียบร้อยแล้ว",
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