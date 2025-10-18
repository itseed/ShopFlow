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
import { stockMovementService } from "./stockMovementService";
import { paymentTransactionService } from "./paymentTransactionService";

// Order-specific filter types
export interface OrderFilters extends BaseFilters {
  branchId?: string;
  customerId?: string;
  status?: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  customerType?: string;
  shopType?: string;
  deliveryMethod?: string;
  priority?: string;
  customerPhone?: string;
  orderNumber?: string;
  salesRep?: string;
  minTotal?: number;
  maxTotal?: number;
}

// Order creation data
export interface CreateOrderData {
  // Customer Information
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_type?: "registered" | "walk_in" | "phone_order" | "repeat_customer";

  // Shop Information (for B2B)
  shop_name?: string;
  shop_type?:
    | "convenience_store"
    | "grocery_store"
    | "mini_mart"
    | "supermarket"
    | "restaurant"
    | "other";

  // Order Details
  subtotal: number;
  discount_amount?: number;
  tax?: number;
  delivery_fee?: number;
  total: number;

  // Payment & Delivery
  payment_method?: "cash" | "card" | "bank_transfer" | "e_wallet" | "credit";
  payment_status?: "pending" | "paid" | "partial" | "overdue" | "refunded";
  delivery_method?: "pickup" | "delivery" | "express" | "scheduled";
  delivery_address?: string;
  delivery_date?: string;

  // Status & Tracking
  status?: OrderStatus;
  priority?: "low" | "normal" | "high" | "urgent";
  notes?: string;
  internal_notes?: string;

  // Relations
  branch_id?: string;
  sales_rep?: string;
  cashier_id?: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  product_id?: string;
  product_sku?: string;
  product_name: string;
  product_description?: string;
  variant_info?: Record<string, any>;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  total_price: number;
  cost_price?: number;
}

// Order update data
export interface UpdateOrderData {
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_type?: "registered" | "walk_in" | "phone_order" | "repeat_customer";
  shop_name?: string;
  shop_type?:
    | "convenience_store"
    | "grocery_store"
    | "mini_mart"
    | "supermarket"
    | "restaurant"
    | "other";
  discount_amount?: number;
  delivery_fee?: number;
  payment_method?: "cash" | "card" | "bank_transfer" | "e_wallet" | "credit";
  payment_status?: "pending" | "paid" | "partial" | "overdue" | "refunded";
  delivery_method?: "pickup" | "delivery" | "express" | "scheduled";
  delivery_address?: string;
  delivery_date?: string;
  status?: OrderStatus;
  priority?: "low" | "normal" | "high" | "urgent";
  notes?: string;
  internal_notes?: string;
  sales_rep?: string;
  cashier_id?: string;
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
  private requestCache = new Map<string, { timestamp: number; promise: Promise<any> }>();
  private readonly CACHE_DURATION = 5000; // 5 seconds cache

  // Request deduplication helper
  private async deduplicateRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = this.requestCache.get(cacheKey);

    // Return cached promise if it's still valid
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.promise;
    }

    // Create new request and cache it
    const promise = requestFn();
    this.requestCache.set(cacheKey, { timestamp: now, promise });

    // Clean up cache after request completes
    promise.finally(() => {
      setTimeout(() => {
        this.requestCache.delete(cacheKey);
      }, this.CACHE_DURATION);
    });

    return promise;
  }
  private itemsTableName = "order_items";
  private statsViewName = "daily_sales_summary";

  // Get all orders with filters and pagination
  async getAll(
    filters: OrderFilters & PaginationParams = {}
  ): Promise<ApiResponse<Order[]>> {
    try {
      // Add caching key to prevent duplicate requests
      const cacheKey = `orders-${JSON.stringify(filters)}`;
      
      return this.deduplicateRequest(cacheKey, async () => {
        let query = supabase.from(this.tableName).select(`
        *,
        customer:customers(id, customer_code, first_name, last_name, company_name, phone, email),
        branch:branches(id, name, address, phone),
        items:order_items(
          id,
          product_id,
          product_sku,
          product_name,
          product_description,
          variant_info,
          quantity,
          unit_price,
          discount_amount,
          total_price,
          cost_price,
          product:products(id, name, images, sku)
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

      if (filters.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }

      if (filters.paymentMethod) {
        query = query.eq("payment_method", filters.paymentMethod);
      }

      if (filters.paymentStatus) {
        query = query.eq("payment_status", filters.paymentStatus);
      }

      if (filters.customerType) {
        query = query.eq("customer_type", filters.customerType);
      }

      if (filters.shopType) {
        query = query.eq("shop_type", filters.shopType);
      }

      if (filters.deliveryMethod) {
        query = query.eq("delivery_method", filters.deliveryMethod);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.salesRep) {
        query = query.eq("sales_rep", filters.salesRep);
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

        // Apply pagination - add strict default limit to prevent large queries
        const limit = filters.limit || 100; // Reduced default limit
      if (limit) {
        const from = (filters.page || 0) * limit;
        const to = from + limit - 1;
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
          customer:customers(id, customer_code, first_name, last_name, company_name, phone, email),
          branch:branches(id, name, address, phone),
          items:order_items(
            id,
            product_id,
            product_sku,
            product_name,
            product_description,
            variant_info,
            quantity,
            unit_price,
            discount_amount,
            total_price,
            cost_price,
            created_at,
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
          customer_id: orderData.customer_id,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_email: orderData.customer_email,
          customer_type: orderData.customer_type || "walk_in",
          shop_name: orderData.shop_name,
          shop_type: orderData.shop_type,
          subtotal: orderData.subtotal,
          discount_amount: orderData.discount_amount || 0,
          tax: orderData.tax || 0,
          delivery_fee: orderData.delivery_fee || 0,
          total: orderData.total,
          payment_method: orderData.payment_method || "cash",
          payment_status: orderData.payment_status || "paid",
          delivery_method: orderData.delivery_method || "pickup",
          delivery_address: orderData.delivery_address,
          delivery_date: orderData.delivery_date,
          status: orderData.status || "completed",
          priority: orderData.priority || "normal",
          notes: orderData.notes,
          internal_notes: orderData.internal_notes,
          branch_id: orderData.branch_id,
          sales_rep: orderData.sales_rep,
          cashier_id: orderData.cashier_id,
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
          order_id: order.id,
          product_id: item.product_id,
          product_sku: item.product_sku,
          product_name: item.product_name,
          product_description: item.product_description,
          variant_info: item.variant_info,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          total_price: item.total_price,
          cost_price: item.cost_price,
          created_at: new Date().toISOString(),
        }));

        const { error: itemsError } = await supabase
          .from(this.itemsTableName)
          .insert(itemsWithOrderId);

        if (itemsError) {
          // Rollback order creation
          await supabase.from(this.tableName).delete().eq("id", order.id);
          return createErrorResponse(handleSupabaseError(itemsError));
        }

        // Create stock movements for each order item
        for (const item of orderData.items) {
          if (item.product_id) {
            // Get current product stock to calculate before/after quantities
            const { data: productData } = await supabase
              .from("products")
              .select("stock_quantity")
              .eq("id", item.product_id)
              .single();

            const quantityBefore = productData?.stock_quantity || 0;
            const quantityAfter = quantityBefore - item.quantity;

            await stockMovementService.createStockMovement({
              product_id: item.product_id,
              movement_type: "sale",
              quantity_change: -item.quantity,
              quantity_before: quantityBefore,
              quantity_after: quantityAfter,
              reference_type: "order",
              reference_id: order.id,
              reference_number: order.order_number,
              branch_id: order.branch_id,
              created_by: order.cashier_id || order.sales_rep,
            });
          }
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

  // Update order status with notes
  async updateStatus(
    id: string,
    status: OrderStatus,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.internal_notes = notes;
      }

      const { error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return await this.getById(id);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update payment status
  async updatePaymentStatus(
    id: string,
    paymentStatus: "pending" | "paid" | "partial" | "overdue" | "refunded",
    paymentMethod: "cash" | "card" | "bank_transfer" | "e_wallet" | "credit",
    amount: number,
    userId: string,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase.rpc(
        "update_order_payment_status",
        {
          order_id_param: id,
          payment_status_param: paymentStatus,
          payment_method_param: paymentMethod,
          amount_param: amount,
          user_id_param: userId,
          notes_param: notes,
        }
      );

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (data.error) {
        return createErrorResponse(data.error);
      }

      return createSuccessResponse(
        data.order,
        "Payment status updated successfully"
      );
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Find or create customer and create order
  async createWithCustomer(
    orderData: CreateOrderData & {
      autoCreateCustomer?: boolean;
    }
  ): Promise<ApiResponse<Order>> {
    try {
      // If customer info provided but no customer_id, try to find or create customer
      if (
        orderData.autoCreateCustomer &&
        orderData.customer_phone &&
        !orderData.customer_id
      ) {
        // Try to find existing customer by phone
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("phone", orderData.customer_phone)
          .single();

        if (existingCustomer) {
          orderData.customer_id = existingCustomer.id;
        } else if (orderData.customer_name) {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              first_name: orderData.customer_name,
              phone: orderData.customer_phone,
              email: orderData.customer_email,
              company_name: orderData.shop_name,
              customer_type: orderData.shop_name ? "business" : "individual",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (!customerError && newCustomer) {
            orderData.customer_id = newCustomer.id;
          }
        }
      }

      return await this.create(orderData);
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
      let query = supabase.from(this.statsViewName).select("*");

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      const today = new Date().toISOString().split("T")[0];
      const todayStats = data?.find((d: any) => d.sale_date === today);

      const totalOrders =
        data?.reduce((sum: number, d: any) => sum + d.order_count, 0) || 0;
      const totalRevenue =
        data?.reduce((sum: number, d: any) => sum + d.total_sales, 0) || 0;

      const stats: OrderStats = {
        totalOrders,
        todayOrders: todayStats?.order_count || 0,
        totalRevenue,
        todayRevenue: todayStats?.total_sales || 0,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        topPaymentMethod: "cash", // This is not available in the view, so we hardcode it for now
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get orders by customer
  async getByCustomer(
    customerId: string,
    filters: OrderFilters & PaginationParams = {}
  ): Promise<ApiResponse<Order[]>> {
    return this.getAll({ ...filters, customerId });
  }

  // Get orders by date range
  async getByDateRange(
    startDate: string,
    endDate: string,
    branchId?: string
  ): Promise<ApiResponse<Order[]>> {
    return this.getAll({
      dateFrom: startDate,
      dateTo: endDate,
      branchId,
    });
  }

  // Get pending orders
  async getPendingOrders(branchId?: string): Promise<ApiResponse<Order[]>> {
    return this.getAll({
      status: "pending",
      branchId,
      sortBy: "created_at",
      sortOrder: "asc",
    });
  }

  // Get today's orders
  async getTodaysOrders(branchId?: string): Promise<ApiResponse<Order[]>> {
    const today = new Date().toISOString().split("T")[0];
    return this.getByDateRange(today, today, branchId);
  }

  // Calculate order profit
  async calculateOrderProfit(orderId: string): Promise<
    ApiResponse<{
      revenue: number;
      cost: number;
      profit: number;
      profitMargin: number;
    }>
  > {
    try {
      const orderResult = await this.getById(orderId);
      if (!orderResult.success || !orderResult.data) {
        return createErrorResponse("Order not found");
      }

      const order = orderResult.data;
      let totalCost = 0;
      let totalRevenue = order.total;

      for (const item of order.items) {
        if (item.cost_price) {
          totalCost += item.cost_price * item.quantity;
        }
      }

      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      return createSuccessResponse({
        revenue: totalRevenue,
        cost: totalCost,
        profit,
        profitMargin,
      });
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
