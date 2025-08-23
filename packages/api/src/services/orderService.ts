import { supabase } from "../supabase";
import { Order, OrderStatus } from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Order-specific filter types
export interface OrderFilters extends BaseFilters {
  branchId?: string;
  status?: OrderStatus;
  paymentMethod?: string;
  customerPhone?: string;
  orderNumber?: string;
  minTotal?: number;
  maxTotal?: number;
}

// Order creation data
export interface CreateOrderData {
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  tax?: number;
  total: number;
  payment_method?: "cash" | "card" | "bank_transfer" | "e_wallet";
  status?: OrderStatus;
  branch_id?: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Order update data
export interface UpdateOrderData {
  customer_name?: string;
  customer_phone?: string;
  status?: OrderStatus;
  payment_method?: "cash" | "card" | "bank_transfer" | "e_wallet";
}

// Order statistics
export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  averageOrderValue: number;
  topPaymentMethod: string;
}

class OrderService {
  private tableName = "orders";
  private itemsTableName = "order_items";

  // Get all orders with filters and pagination
  async getAll(
    filters: OrderFilters & PaginationParams = {}
  ): Promise<ApiResponse<Order[]>> {
    try {
      let query = supabase.from(this.tableName).select(`
        *,
        branch:branches(id, name),
        items:order_items(
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          product:products(id, name, images)
        )
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      if (filters.paymentMethod) {
        query = query.eq("payment_method", filters.paymentMethod);
      }

      if (filters.customerPhone) {
        query = query.eq("customer_phone", filters.customerPhone);
      }

      if (filters.orderNumber) {
        query = query.ilike("order_number", `%${filters.orderNumber}%`);
      }

      if (filters.minTotal !== undefined) {
        query = query.gte("total", filters.minTotal);
      }

      if (filters.maxTotal !== undefined) {
        query = query.lte("total", filters.maxTotal);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      if (filters.limit) {
        const from = (filters.page || 0) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get order by ID
  async getById(id: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          branch:branches(id, name, address, phone),
          items:order_items(
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price,
            product:products(id, name, images, sku)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Order not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new order with items
  async create(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    try {
      // Start transaction by creating order first
      const { data: order, error: orderError } = await supabase
        .from(this.tableName)
        .insert({
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          subtotal: orderData.subtotal,
          tax: orderData.tax || 0,
          total: orderData.total,
          payment_method: orderData.payment_method || "cash",
          status: orderData.status || "completed",
          branch_id: orderData.branch_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        return createErrorResponse(handleSupabaseError(orderError));
      }

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        const itemsWithOrderId = orderData.items.map((item) => ({
          ...item,
          order_id: order.id,
        }));

        const { error: itemsError } = await supabase
          .from(this.itemsTableName)
          .insert(itemsWithOrderId);

        if (itemsError) {
          // Rollback order creation
          await supabase.from(this.tableName).delete().eq("id", order.id);
          return createErrorResponse(handleSupabaseError(itemsError));
        }
      }

      // Return the complete order with items
      return await this.getById(order.id);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update order
  async update(
    id: string,
    updateData: UpdateOrderData
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Order not found");
      }

      return await this.getById(id);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Delete order (soft delete by updating status)
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Order cancelled successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get order count
  async count(filters: OrderFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { count, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(count || 0);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get order statistics
  async getStats(branchId?: string): Promise<ApiResponse<OrderStats>> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Build base query
      let baseQuery = supabase.from(this.tableName).select("*");
      let todayQuery = supabase
        .from(this.tableName)
        .select("*")
        .gte("created_at", today);

      if (branchId) {
        baseQuery = baseQuery.eq("branch_id", branchId);
        todayQuery = todayQuery.eq("branch_id", branchId);
      }

      // Get all orders and today's orders
      const [allOrdersResponse, todayOrdersResponse] = await Promise.all([
        baseQuery,
        todayQuery,
      ]);

      if (allOrdersResponse.error) {
        return createErrorResponse(
          handleSupabaseError(allOrdersResponse.error)
        );
      }

      if (todayOrdersResponse.error) {
        return createErrorResponse(
          handleSupabaseError(todayOrdersResponse.error)
        );
      }

      const allOrders = allOrdersResponse.data || [];
      const todayOrders = todayOrdersResponse.data || [];

      // Calculate statistics
      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const todayRevenue = todayOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const averageOrderValue =
        allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

      // Find most popular payment method
      const paymentMethods = allOrders.reduce((acc, order) => {
        acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPaymentMethod =
        Object.entries(paymentMethods).sort(
          ([, a], [, b]) => (b as number) - (a as number)
        )[0]?.[0] || "cash";

      const stats: OrderStats = {
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        totalRevenue,
        todayRevenue,
        averageOrderValue,
        topPaymentMethod,
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get orders by date range
  async getOrdersByDateRange(
    startDate: string,
    endDate: string,
    branchId?: string
  ): Promise<ApiResponse<Order[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(
          `
          *,
          branch:branches(id, name),
          items:order_items(*)
        `
        )
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const orderService = new OrderService();
