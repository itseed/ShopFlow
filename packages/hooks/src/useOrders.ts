/**
 * Order Hooks - Orders, Payments, and Customers
 * Consolidates: useOrders, useCustomers, usePayments
 * Phase 1: Foundation Refactor
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@shopflow/api";

/**
 * Order Hooks
 */

// Get all orders with filters
export function useOrders(params?: {
  branchId?: string;
  customerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.orders.getAll(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Get order by ID
export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.orders.getById(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: {
      order: any;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
      }>;
      payment?: {
        amount: number;
        payment_method: string;
        status?: string;
      };
    }) => orderService.orders.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.orders.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
    },
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.orders.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
    },
  });
}

// Get order statistics
export function useOrderStats(params?: {
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["orders", "stats", params],
    queryFn: () => orderService.orders.getStats(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Customer Hooks
 */

// Get all customers
export function useCustomers(params?: {
  search?: string;
  hasLoyalty?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => orderService.customers.getAll(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Get customer by ID
export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => orderService.customers.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get customer by phone
export function useCustomerByPhone(phone: string | undefined) {
  return useQuery({
    queryKey: ["customer", "phone", phone],
    queryFn: () => orderService.customers.getByPhone(phone!),
    enabled: !!phone && phone.length >= 9,
    staleTime: 5 * 60 * 1000,
  });
}

// Search customers
export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: ["customers", "search", query],
    queryFn: () => orderService.customers.search(query),
    enabled: query.length >= 3,
    staleTime: 2 * 60 * 1000,
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customer: any) => orderService.customers.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      orderService.customers.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", data.id] });
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Get customer purchase history
export function useCustomerPurchaseHistory(
  customerId: string | undefined,
  params?: {
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: ["customer", customerId, "purchases", params],
    queryFn: () =>
      orderService.customers.getPurchaseHistory(customerId!, params),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

// Get customer statistics
export function useCustomerStats(customerId: string | undefined) {
  return useQuery({
    queryKey: ["customer", customerId, "stats"],
    queryFn: () => orderService.customers.getStats(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Payment Hooks
 */

// Get payment by ID
export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => orderService.payments.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get payments by order
export function usePaymentsByOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["payments", "order", orderId],
    queryFn: () => orderService.payments.getByOrder(orderId!),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
}

// Process payment mutation
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData: {
      order_id: string;
      amount: number;
      payment_method: "cash" | "card" | "qr" | "transfer";
      transaction_id?: string;
      notes?: string;
    }) => orderService.payments.process(paymentData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({
        queryKey: ["order", data.order_id],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Refund payment mutation
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      amount,
      reason,
    }: {
      paymentId: string;
      amount?: number;
      reason?: string;
    }) => orderService.payments.refund(paymentId, amount, reason),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({
        queryKey: ["order", data.order_id],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// Get payment history
export function usePaymentHistory(params?: {
  branchId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["payments", "history", params],
    queryFn: () => orderService.payments.getHistory(params),
    staleTime: 5 * 60 * 1000,
  });
}

