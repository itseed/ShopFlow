import { supabase } from "../supabase";
import { Branch } from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Branch-specific filter types
export interface BranchFilters extends BaseFilters {
  isActive?: boolean;
}

// Branch creation data
export interface CreateBranchData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

// Branch update data
export interface UpdateBranchData extends Partial<CreateBranchData> {
  id?: never; // Prevent ID from being updated
}

// Branch statistics
export interface BranchStats {
  totalBranches: number;
  activeBranches: number;
  totalStaff: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

// Branch performance data
export interface BranchPerformance {
  branchId: string;
  branchName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  staffCount: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

class BranchService {
  private tableName = "branches";

  // Get all branches with filters and pagination
  async getAll(
    filters: BranchFilters & PaginationParams = {}
  ): Promise<ApiResponse<Branch[]>> {
    try {
      let query = supabase.from(this.tableName).select("*");

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
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

  // Get branch by ID
  async getById(id: string): Promise<ApiResponse<Branch>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Branch not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new branch
  async create(branchData: CreateBranchData): Promise<ApiResponse<Branch>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...branchData,
          is_active: branchData.is_active !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data, "Branch created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update branch
  async update(
    id: string,
    updateData: UpdateBranchData
  ): Promise<ApiResponse<Branch>> {
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
        return createErrorResponse("Branch not found");
      }

      return createSuccessResponse(data, "Branch updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Deactivate branch (soft delete)
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

      return createSuccessResponse(null, "Branch deactivated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get branch count
  async count(filters: BranchFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
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

  // Get active branches only
  async getActiveBranches(): Promise<ApiResponse<Branch[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get branch statistics
  async getStats(): Promise<ApiResponse<BranchStats>> {
    try {
      // Get basic branch counts
      const [
        branchesResponse,
        staffResponse,
        productsResponse,
        ordersResponse,
      ] = await Promise.all([
        supabase
          .from(this.tableName)
          .select("*", { count: "exact", head: true }),
        supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);

      if (branchesResponse.error) {
        return createErrorResponse(handleSupabaseError(branchesResponse.error));
      }

      const activeBranchesResponse = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (activeBranchesResponse.error) {
        return createErrorResponse(
          handleSupabaseError(activeBranchesResponse.error)
        );
      }

      // Calculate total revenue
      const totalRevenue =
        ordersResponse.data?.reduce((sum, order) => sum + order.total, 0) || 0;

      const stats: BranchStats = {
        totalBranches: branchesResponse.count || 0,
        activeBranches: activeBranchesResponse.count || 0,
        totalStaff: staffResponse.count || 0,
        totalProducts: productsResponse.count || 0,
        totalOrders: ordersResponse.data?.length || 0,
        totalRevenue,
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get branch performance data
  async getBranchPerformance(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<BranchPerformance[]>> {
    try {
      // Get branches with their orders and staff
      let ordersQuery = supabase.from("orders").select(`
          id,
          total,
          branch_id,
          branch:branches(id, name),
          items:order_items(
            product_id,
            product_name,
            quantity,
            total_price
          )
        `);

      if (startDate) {
        ordersQuery = ordersQuery.gte("created_at", startDate);
      }

      if (endDate) {
        ordersQuery = ordersQuery.lte("created_at", endDate);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) {
        return createErrorResponse(handleSupabaseError(ordersError));
      }

      // Get staff count per branch
      const { data: staff, error: staffError } = await supabase
        .from("user_profiles")
        .select("branch_id")
        .eq("is_active", true);

      if (staffError) {
        return createErrorResponse(handleSupabaseError(staffError));
      }

      // Group data by branch
      const branchData = new Map<string, any>();

      // Initialize branch data
      orders?.forEach((order) => {
        if (
          order.branch &&
          typeof order.branch === "object" &&
          "id" in order.branch &&
          "name" in order.branch
        ) {
          const branchInfo = order.branch as { id: string; name: string };
          const branchId = branchInfo.id;
          if (!branchData.has(branchId)) {
            branchData.set(branchId, {
              branchId,
              branchName: branchInfo.name,
              totalOrders: 0,
              totalRevenue: 0,
              staffCount: 0,
              productSales: new Map<
                string,
                { name: string; quantity: number; revenue: number }
              >(),
            });
          }

          const branchStats = branchData.get(branchId)!;
          branchStats.totalOrders += 1;
          branchStats.totalRevenue += order.total;

          // Process order items
          order.items?.forEach((item) => {
            const productKey = item.product_id || item.product_name;
            if (!branchStats.productSales.has(productKey)) {
              branchStats.productSales.set(productKey, {
                name: item.product_name,
                quantity: 0,
                revenue: 0,
              });
            }

            const product = branchStats.productSales.get(productKey)!;
            product.quantity += item.quantity;
            product.revenue += item.total_price;
          });
        }
      });

      // Add staff counts
      staff?.forEach((member) => {
        if (member.branch_id && branchData.has(member.branch_id)) {
          branchData.get(member.branch_id).staffCount += 1;
        }
      });

      // Convert to final format
      const performance: BranchPerformance[] = Array.from(
        branchData.values()
      ).map((branch) => ({
        branchId: branch.branchId,
        branchName: branch.branchName,
        totalOrders: branch.totalOrders,
        totalRevenue: branch.totalRevenue,
        averageOrderValue:
          branch.totalOrders > 0 ? branch.totalRevenue / branch.totalOrders : 0,
        staffCount: branch.staffCount,
        topProducts: Array.from(
          branch.productSales.entries() as IterableIterator<
            [string, { name: string; quantity: number; revenue: number }]
          >
        )
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantity: data.quantity,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5), // Top 5 products
      }));

      return createSuccessResponse(performance);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get branch with staff and order summary
  async getBranchWithDetails(id: string): Promise<
    ApiResponse<
      Branch & {
        staff: any[];
        orderStats: {
          totalOrders: number;
          totalRevenue: number;
          averageOrderValue: number;
        };
      }
    >
  > {
    try {
      // Get branch details
      const branchResponse = await this.getById(id);
      if (!branchResponse.success || !branchResponse.data) {
        return createErrorResponse(branchResponse.error || "Branch not found");
      }

      const branch = branchResponse.data!;

      // Get staff for this branch
      const { data: staff, error: staffError } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          display_name,
          role,
          is_active,
          created_at
        `
        )
        .eq("branch_id", id);

      if (staffError) {
        return createErrorResponse(handleSupabaseError(staffError));
      }

      // Get order statistics for this branch
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total")
        .eq("branch_id", id);

      if (ordersError) {
        return createErrorResponse(handleSupabaseError(ordersError));
      }

      const totalRevenue =
        orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalOrders = orders?.length || 0;

      const result = {
        ...branch,
        staff: staff || [],
        orderStats: {
          totalOrders,
          totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
      };

      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const branchService = new BranchService();
