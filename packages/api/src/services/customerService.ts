import { supabase } from "../supabase";
import {
  Customer,
  CustomerFormData,
  CustomerFilter,
  CustomerStats,
  CustomerWithStats,
} from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Customer-specific filter types
export interface CustomerFilters extends BaseFilters {
  isActive?: boolean;
  membershipType?: string;
  hasPhone?: boolean;
  hasEmail?: boolean;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  joinedAfter?: string;
  joinedBefore?: string;
}

// Customer creation data
export interface CreateCustomerData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  notes?: string;
  isActive?: boolean;
}

// Customer update data
export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  notes?: string;
  isActive?: boolean;
}

class CustomerService {
  private tableName = "customers";

  // Generate customer number
  private generateCustomerNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `CU${timestamp}${random}`;
  }

  // Get all customers with filters and pagination
  async getAll(
    filters: CustomerFilters & PaginationParams = {}
  ): Promise<ApiResponse<CustomerWithStats[]>> {
    try {
      let query = supabase.from(this.tableName).select(`
        *,
        orders!inner(
          id,
          total,
          created_at
        )
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%,customer_number.ilike.%${filters.search}%`
        );
      }

      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }

      if (filters.membershipType) {
        query = query.eq("membership_type", filters.membershipType);
      }

      if (filters.hasPhone !== undefined) {
        if (filters.hasPhone) {
          query = query.not("phone", "is", null);
        } else {
          query = query.is("phone", null);
        }
      }

      if (filters.hasEmail !== undefined) {
        if (filters.hasEmail) {
          query = query.not("email", "is", null);
        } else {
          query = query.is("email", null);
        }
      }

      if (filters.joinedAfter) {
        query = query.gte("created_at", filters.joinedAfter);
      }

      if (filters.joinedBefore) {
        query = query.lte("created_at", filters.joinedBefore);
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

      // Transform data to include customer stats
      const customersWithStats: CustomerWithStats[] = (data || []).map(
        (customer) => {
          const orders = customer.orders || [];
          const totalOrders = orders.length;
          const totalSpent = orders.reduce(
            (sum: number, order: any) => sum + (order.total || 0),
            0
          );
          const lastOrderDate =
            orders.length > 0
              ? orders.sort(
                  (a: any, b: any) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )[0].created_at
              : undefined;

          return {
            id: customer.id,
            customer_code: customer.customer_number,
            first_name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            country: "Thailand", // Default value
            customer_type: "individual", // Default value
            status: customer.is_active ? "active" : "inactive",
            credit_limit: 0, // Default value
            current_balance: 0, // Default value
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
            loyalty_points: 0, // Default value
            created_at: customer.created_at,
            updated_at: customer.updated_at,
            order_count: totalOrders,
            last_order_amount: 0, // Default value
            avg_order_value: totalOrders > 0 ? totalSpent / totalOrders : 0,
          };
        }
      );

      return createSuccessResponse(customersWithStats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get customer by ID
  async getById(id: string): Promise<ApiResponse<CustomerWithStats>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          orders(
            id,
            total,
            created_at,
            status
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Customer not found");
      }

      // Transform data to include customer stats
      const orders = data.orders || [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce(
        (sum: number, order: any) => sum + (order.total || 0),
        0
      );
      const lastOrderDate =
        orders.length > 0
          ? orders.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0].created_at
          : undefined;

      const customerWithStats: CustomerWithStats = {
        id: data.id,
        customer_code: data.customer_number,
        first_name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        country: "Thailand", // Default value
        customer_type: "individual", // Default value
        status: data.is_active ? "active" : "inactive",
        credit_limit: 0, // Default value
        current_balance: 0, // Default value
        total_orders: totalOrders,
        total_spent: totalSpent,
        last_order_date: lastOrderDate,
        loyalty_points: 0, // Default value
        created_at: data.created_at,
        updated_at: data.updated_at,
        order_count: totalOrders,
        last_order_amount: 0, // Default value
        avg_order_value: totalOrders > 0 ? totalSpent / totalOrders : 0,
      };

      return createSuccessResponse(customerWithStats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new customer
  async create(
    customerData: CreateCustomerData
  ): Promise<ApiResponse<Customer>> {
    try {
      const customerNumber = this.generateCustomerNumber();

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          customer_number: customerNumber,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          date_of_birth: customerData.dateOfBirth,
          gender: customerData.gender,
          notes: customerData.notes,
          is_active: customerData.isActive !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      const customer: Customer = {
        id: data.id,
        customer_code: data.customer_number,
        first_name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        country: "Thailand", // Default value
        customer_type: "individual", // Default value
        status: data.is_active ? "active" : "inactive",
        credit_limit: 0, // Default value
        current_balance: 0, // Default value
        total_orders: 0, // Default value
        total_spent: 0, // Default value
        loyalty_points: 0, // Default value
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return createSuccessResponse(customer, "Customer created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update customer
  async update(
    id: string,
    updateData: UpdateCustomerData
  ): Promise<ApiResponse<Customer>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          name: updateData.name,
          phone: updateData.phone,
          email: updateData.email,
          address: updateData.address,
          date_of_birth: updateData.dateOfBirth,
          gender: updateData.gender,
          notes: updateData.notes,
          is_active: updateData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Customer not found");
      }

      const customer: Customer = {
        id: data.id,
        customer_code: data.customer_number,
        first_name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        country: "Thailand", // Default value
        customer_type: "individual", // Default value
        status: data.is_active ? "active" : "inactive",
        credit_limit: 0, // Default value
        current_balance: 0, // Default value
        total_orders: 0, // Default value
        total_spent: 0, // Default value
        loyalty_points: 0, // Default value
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return createSuccessResponse(customer, "Customer updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Deactivate customer (soft delete)
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Customer deactivated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get customer count
  async count(filters: CustomerFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }

      if (filters.membershipType) {
        query = query.eq("membership_type", filters.membershipType);
      }

      if (filters.hasPhone !== undefined) {
        if (filters.hasPhone) {
          query = query.not("phone", "is", null);
        } else {
          query = query.is("phone", null);
        }
      }

      if (filters.hasEmail !== undefined) {
        if (filters.hasEmail) {
          query = query.not("email", "is", null);
        } else {
          query = query.is("email", null);
        }
      }

      if (filters.joinedAfter) {
        query = query.gte("created_at", filters.joinedAfter);
      }

      if (filters.joinedBefore) {
        query = query.lte("created_at", filters.joinedBefore);
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

  // Get customer statistics
  async getStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      newThisMonth: number;
      totalRevenue: number;
      averageOrderValue: number;
    }>
  > {
    try {
      // Get total and active customers
      const [totalResult, activeResult, inactiveResult] = await Promise.all([
        this.count(),
        this.count({ isActive: true }),
        this.count({ isActive: false }),
      ]);

      if (
        !totalResult.success ||
        !activeResult.success ||
        !inactiveResult.success
      ) {
        return createErrorResponse("Failed to fetch customer statistics");
      }

      // Get new customers this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const newThisMonthResult = await this.count({
        joinedAfter: startOfMonth.toISOString(),
      });

      if (!newThisMonthResult.success) {
        return createErrorResponse("Failed to fetch new customers count");
      }

      // Get revenue statistics from orders
      const { data: orderStats, error: orderError } = await supabase
        .from("orders")
        .select("total")
        .eq("status", "completed");

      if (orderError) {
        return createErrorResponse(handleSupabaseError(orderError));
      }

      const totalRevenue = (orderStats || []).reduce(
        (sum, order) => sum + (order.total || 0),
        0
      );
      const averageOrderValue =
        orderStats && orderStats.length > 0
          ? totalRevenue / orderStats.length
          : 0;

      const stats = {
        total: totalResult.data || 0,
        active: activeResult.data || 0,
        inactive: inactiveResult.data || 0,
        newThisMonth: newThisMonthResult.data || 0,
        totalRevenue,
        averageOrderValue,
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Search customers by name, phone, or email
  async search(query: string, limit = 10): Promise<ApiResponse<Customer[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .or(
          `name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`
        )
        .eq("is_active", true)
        .limit(limit)
        .order("name");

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      const customers: Customer[] = (data || []).map((item) => ({
        id: item.id,
        customer_code: item.customer_number,
        first_name: item.name,
        phone: item.phone,
        email: item.email,
        address: item.address,
        country: "Thailand", // Default value
        customer_type: "individual", // Default value
        status: item.is_active ? "active" : "inactive",
        credit_limit: 0, // Default value
        current_balance: 0, // Default value
        total_orders: 0, // Default value
        total_spent: 0, // Default value
        loyalty_points: 0, // Default value
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      return createSuccessResponse(customers);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get top customers by spending
  async getTopCustomers(limit = 10): Promise<ApiResponse<CustomerWithStats[]>> {
    try {
      const result = await this.getAll({
        sortBy: "totalSpent",
        sortOrder: "desc",
        limit,
        isActive: true,
      });

      return result;
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const customerService = new CustomerService();
