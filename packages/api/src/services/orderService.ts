/**
 * Order Service - Orders, Payments, and Customers Management
 * Consolidates: orderService, customerService, paymentService
 * Phase 1: Foundation Refactor
 */

import { supabase } from '../supabase';
import type { Database } from '@shopflow/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

/**
 * Order Management
 */
export const orders = {
  /**
   * Get all orders with optional filters
   */
  async getAll(params?: {
    branchId?: string;
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customers(id, name, phone),
        order_items(id, product_id, quantity, unit_price, subtotal),
        payments(id, amount, payment_method, status)
      `, { count: 'exact' });

    if (params?.branchId) {
      query = query.eq('branch_id', params.branchId);
    }

    if (params?.customerId) {
      query = query.eq('customer_id', params.customerId);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }

    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as Order[], count };
  },

  /**
   * Get order by ID with full details
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers(*),
        order_items(
          *,
          products(id, name, sku, unit)
        ),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Order;
  },

  /**
   * Create new order with items
   */
  async create(orderData: {
    order: OrderInsert;
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
  }) {
    const { order, items, payment } = orderData;

    // Create order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    // Create payment if provided
    let newPayment = null;
    if (payment) {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          ...payment,
          order_id: newOrder.id,
          status: payment.status || 'completed',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      newPayment = paymentData;
    }

    return {
      order: newOrder as Order,
      items: newItems as OrderItem[],
      payment: newPayment as Payment | null,
    };
  },

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  /**
   * Cancel order
   */
  async cancel(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        notes: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  /**
   * Get order statistics
   */
  async getStats(params?: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('orders')
      .select('id, total_amount, status, created_at');

    if (params?.branchId) {
      query = query.eq('branch_id', params.branchId);
    }

    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }

    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const orders = data as Order[];

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      completedOrders: orders.filter(o => o.status === 'completed').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      averageOrderValue: orders.length > 0
        ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length
        : 0,
    };
  },
};

/**
 * Customer Management
 */
export const customers = {
  /**
   * Get all customers
   */
  async getAll(params?: {
    search?: string;
    hasLoyalty?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('customers')
      .select('*, customer_loyalty_memberships(*)', { count: 'exact' });

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    if (params?.hasLoyalty !== undefined) {
      if (params.hasLoyalty) {
        query = query.not('customer_loyalty_memberships', 'is', null);
      } else {
        query = query.is('customer_loyalty_memberships', null);
      }
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    query = query.order('name');

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as Customer[], count };
  },

  /**
   * Get customer by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, customer_loyalty_memberships(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  /**
   * Get customer by phone
   */
  async getByPhone(phone: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, customer_loyalty_memberships(*)')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No customer found
      }
      throw error;
    }
    return data as Customer;
  },

  /**
   * Search customers by phone or name
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, customer_loyalty_memberships(*)')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data as Customer[];
  },

  /**
   * Create new customer
   */
  async create(customer: CustomerInsert) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  /**
   * Update customer
   */
  async update(id: string, updates: CustomerUpdate) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  /**
   * Delete customer
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get customer purchase history
   */
  async getPurchaseHistory(customerId: string, params?: {
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, sku)
        ),
        payments(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Order[];
  },

  /**
   * Get customer statistics
   */
  async getStats(customerId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .eq('customer_id', customerId)
      .eq('status', 'completed');

    if (error) throw error;

    const orders = data as Order[];

    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      averageOrderValue: orders.length > 0
        ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length
        : 0,
      lastOrderDate: orders.length > 0 ? orders[0].created_at : null,
    };
  },
};

/**
 * Payment Management
 */
export const payments = {
  /**
   * Process payment for order
   */
  async process(paymentData: {
    order_id: string;
    amount: number;
    payment_method: 'cash' | 'card' | 'qr' | 'transfer';
    transaction_id?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;

    // Update order payment status
    await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', paymentData.order_id);

    return data as Payment;
  },

  /**
   * Get payment by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Payment;
  },

  /**
   * Get payments by order
   */
  async getByOrder(orderId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Payment[];
  },

  /**
   * Refund payment
   */
  async refund(paymentId: string, amount?: number, reason?: string) {
    // Get original payment
    const { data: payment, error: getError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (getError) throw getError;

    const refundAmount = amount || payment.amount;

    // Create refund payment record
    const { data: refund, error: refundError } = await supabase
      .from('payments')
      .insert({
        order_id: payment.order_id,
        amount: -refundAmount,
        payment_method: payment.payment_method,
        status: 'refunded',
        notes: reason || 'Refund',
      })
      .select()
      .single();

    if (refundError) throw refundError;

    // Update order status if full refund
    if (refundAmount === payment.amount) {
      await supabase
        .from('orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
        })
        .eq('id', payment.order_id);
    }

    return refund as Payment;
  },

  /**
   * Get payment history
   */
  async getHistory(params?: {
    branchId?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('payments')
      .select('*, orders(id, order_number, branch_id)');

    if (params?.paymentMethod) {
      query = query.eq('payment_method', params.paymentMethod);
    }

    if (params?.startDate) {
      query = query.gte('created_at', params.startDate);
    }

    if (params?.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Filter by branch if needed
    let payments = data as Payment[];
    if (params?.branchId) {
      payments = payments.filter((p: any) => p.orders?.branch_id === params.branchId);
    }

    return payments;
  },
};

/**
 * Order Service - Main Export
 */
export const orderService = {
  orders,
  customers,
  payments,
};

export default orderService;
