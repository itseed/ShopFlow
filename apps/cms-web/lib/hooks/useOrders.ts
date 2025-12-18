import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { orderService } from "@shopflow/api/services/orderService";
import type { Order } from "@shopflow/types";
import { QUERY_KEYS } from "./queryKeys";

// Order Hooks
export function useOrders(filters?: { customerId?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS, filters],
    queryFn: async () => {
      const response = await orderService.getAll(filters);
      // orderService.getAll returns { data, count } directly, not ApiResponse
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER, id],
    queryFn: async () => {
      const response = await orderService.getById(id);
      // orderService.getById returns Order directly, not ApiResponse
      return response;
    },
    enabled: !!id,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Order> }) => {
      const response = await orderService.update(id, data as any);
      // orderService.update returns Order directly, not ApiResponse
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.ORDER, data.id],
        });
      }
      toast({
        title: "สำเร็จ",
        description: "แก้ไขคำสั่งซื้อเรียบร้อยแล้ว",
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

export function useOrderStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_STATS],
    queryFn: async () => {
      const response = await orderService.getStats();
      // orderService.getStats returns stats directly, not ApiResponse
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
