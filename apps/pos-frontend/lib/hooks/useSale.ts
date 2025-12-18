import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { productService } from "@shopflow/api/services/productService";
import { orderService } from "@shopflow/api/services/orderService";
import type { ProductFilters } from "@shopflow/api/services/productService";
import type { CreateOrderData, Product } from "@shopflow/types";

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
      const response = await productService.getAll(filters || {});
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch products");
      }
      return (response.data || []) as Product[];
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
      return (response.data || []) as Product[];
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
      if (!response.success || !response.data) {
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
      // Convert CreateOrderData to orderService.create format
      const orderData = {
        order: {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          payment_method: data.payment_method,
          branch_id: data.branch_id,
        },
        items: data.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
          subtotal: (item.unit_price || 0) * item.quantity,
        })),
      };
      const response = await orderService.create(orderData);
      // orderService.create returns { order, items, payment }
      return response.order;
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