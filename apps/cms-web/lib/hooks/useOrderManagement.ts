import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  orderService,
  type OrderFilters,
  type CreateOrderData,
  type UpdateOrderData,
  type Order,
} from "@shopflow/api";
import { useCurrentBranch } from "./useAuthEnhanced";

// Query keys for order management
export const ORDER_QUERY_KEYS = {
  ALL: "orders",
  LIST: "orders-list",
  DETAIL: "order-detail",
  STATS: "order-stats",
  TODAY: "orders-today",
  PENDING: "orders-pending",
  RECENT: "orders-recent",
} as const;

// Enhanced order filters with better typing
export interface EnhancedOrderFilters extends OrderFilters {
  status?: "pending" | "processing" | "completed" | "cancelled";
  paymentMethod?: "cash" | "card" | "bank_transfer" | "e_wallet";
  today?: boolean;
  thisWeek?: boolean;
  thisMonth?: boolean;
}

// Pagination parameters
export interface OrderPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Order summary for dashboard
export interface OrderSummary {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  averageOrderValue: number;
  topPaymentMethod: string;
  recentOrders: Order[];
}

// Get all orders with enhanced filtering
export function useOrders(
  filters: EnhancedOrderFilters & OrderPaginationParams = {}
) {
  const currentBranch = useCurrentBranch();

  // Auto-apply branch filter for non-admin users
  const finalFilters = {
    ...filters,
    branchId: filters.branchId || currentBranch?.id,
  };

  // Apply date filters
  if (filters.today) {
    const today = new Date().toISOString().split("T")[0];
    finalFilters.dateFrom = today;
    finalFilters.dateTo = today;
  } else if (filters.thisWeek) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    finalFilters.dateFrom = startOfWeek.toISOString().split("T")[0];
  } else if (filters.thisMonth) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    finalFilters.dateFrom = startOfMonth.toISOString().split("T")[0];
  }

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.LIST, finalFilters],
    queryFn: async () => {
      const response = await orderService.getAll(finalFilters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch orders");
      }
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Get order by ID with details
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.DETAIL, orderId],
    queryFn: async () => {
      const response = await orderService.getById(orderId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch order");
      }
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get order statistics
export function useOrderStats(branchId?: string) {
  const currentBranch = useCurrentBranch();
  const effectiveBranchId = branchId || currentBranch?.id;

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.STATS, effectiveBranchId],
    queryFn: async () => {
      const response = await orderService.getStats(effectiveBranchId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch order statistics");
      }
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// Get today's orders
export function useTodayOrders() {
  const currentBranch = useCurrentBranch();

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.TODAY, currentBranch?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const response = await orderService.getAll({
        branchId: currentBranch?.id,
        dateFrom: today,
        dateTo: today,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch today's orders");
      }
      return response.data || [];
    },
    enabled: !!currentBranch?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// Get pending orders
export function usePendingOrders() {
  const currentBranch = useCurrentBranch();

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.PENDING, currentBranch?.id],
    queryFn: async () => {
      const response = await orderService.getAll({
        branchId: currentBranch?.id,
        status: "pending",
        sortBy: "created_at",
        sortOrder: "asc", // Oldest first for processing
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch pending orders");
      }
      return response.data || [];
    },
    enabled: !!currentBranch?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refresh every minute
  });
}

// Get recent orders
export function useRecentOrders(limit = 10) {
  const currentBranch = useCurrentBranch();

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.RECENT, currentBranch?.id, limit],
    queryFn: async () => {
      const response = await orderService.getAll({
        branchId: currentBranch?.id,
        limit,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch recent orders");
      }
      return response.data || [];
    },
    enabled: !!currentBranch?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Order summary for dashboard
export function useOrderSummary() {
  const orderStats = useOrderStats();
  const todayOrders = useTodayOrders();
  const pendingOrders = usePendingOrders();
  const recentOrders = useRecentOrders(5);

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.ALL, "summary"],
    queryFn: async (): Promise<OrderSummary> => {
      const stats = orderStats.data;
      const today = todayOrders.data || [];
      const pending = pendingOrders.data || [];
      const recent = recentOrders.data || [];

      return {
        totalOrders: stats?.totalOrders || 0,
        todayOrders: today.length,
        pendingOrders: pending.length,
        totalRevenue: stats?.totalRevenue || 0,
        todayRevenue: stats?.todayRevenue || 0,
        averageOrderValue: stats?.averageOrderValue || 0,
        topPaymentMethod: stats?.topPaymentMethod || "cash",
        recentOrders: recent,
      };
    },
    enabled: !!(
      orderStats.data &&
      todayOrders.data &&
      pendingOrders.data &&
      recentOrders.data
    ),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentBranch = useCurrentBranch();

  return useMutation({
    mutationFn: async (orderData: Omit<CreateOrderData, "branch_id">) => {
      const completeOrderData: CreateOrderData = {
        ...orderData,
        branch_id: currentBranch?.id,
      };

      const response = await orderService.create(completeOrderData);
      if (!response.success) {
        throw new Error(response.error || "Failed to create order");
      }
      return response.data;
    },
    onSuccess: (order) => {
      // Invalidate and refetch order-related queries
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.STATS] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.TODAY] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.RECENT] });

      // Also invalidate product queries as stock might have changed
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "สำเร็จ",
        description: `สร้างคำสั่งซื้อ ${order?.order_number} เรียบร้อยแล้ว`,
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

// Update order mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      orderId,
      updateData,
    }: {
      orderId: string;
      updateData: UpdateOrderData;
    }) => {
      const response = await orderService.update(orderId, updateData);
      if (!response.success) {
        throw new Error(response.error || "Failed to update order");
      }
      return response.data;
    },
    onSuccess: (order, { orderId }) => {
      // Update the specific order in cache
      queryClient.setQueryData([ORDER_QUERY_KEYS.DETAIL, orderId], order);

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.STATS] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.PENDING] });

      toast({
        title: "สำเร็จ",
        description: `อัปเดตคำสั่งซื้อ ${order?.order_number} เรียบร้อยแล้ว`,
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

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await orderService.update(orderId, {
        status: "cancelled",
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to cancel order");
      }
      return response.data;
    },
    onSuccess: (order, orderId) => {
      // Update the specific order in cache
      queryClient.setQueryData([ORDER_QUERY_KEYS.DETAIL, orderId], order);

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.STATS] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.PENDING] });

      toast({
        title: "สำเร็จ",
        description: `ยกเลิกคำสั่งซื้อ ${order?.order_number} เรียบร้อยแล้ว`,
        status: "info",
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

// Process order (change status from pending to processing)
export function useProcessOrder() {
  const updateOrder = useUpdateOrder();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return updateOrder.mutateAsync({
        orderId,
        updateData: { status: "processing" },
      });
    },
  });
}

// Complete order (change status from processing to completed)
export function useCompleteOrder() {
  const updateOrder = useUpdateOrder();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return updateOrder.mutateAsync({
        orderId,
        updateData: { status: "completed" },
      });
    },
  });
}

// Bulk operations
export function useBulkUpdateOrders() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      orderIds,
      updateData,
    }: {
      orderIds: string[];
      updateData: UpdateOrderData;
    }) => {
      const updates = await Promise.allSettled(
        orderIds.map((id) => orderService.update(id, updateData))
      );

      const successful = updates.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;

      const failed = updates.length - successful;

      return { successful, failed, total: updates.length };
    },
    onSuccess: ({ successful, failed, total }) => {
      // Invalidate all order queries
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.STATS] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.PENDING] });

      if (failed > 0) {
        toast({
          title: "การอัปเดตเสร็จสิ้น",
          description: `อัปเดตสำเร็จ ${successful} รายการ ล้มเหลว ${failed} รายการ จากทั้งหมด ${total} รายการ`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "สำเร็จ",
          description: `อัปเดตคำสั่งซื้อทั้งหมด ${successful} รายการเรียบร้อยแล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
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

// Order search with debouncing
export function useOrderSearch(searchTerm: string, debounceMs = 300) {
  const currentBranch = useCurrentBranch();

  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.LIST, "search", searchTerm, currentBranch?.id],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const response = await orderService.getAll({
        search: searchTerm,
        branchId: currentBranch?.id,
        limit: 20,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to search orders");
      }
      return response.data || [];
    },
    enabled: !!searchTerm.trim() && searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
