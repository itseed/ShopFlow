import { supabase } from "../supabase";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Supplier interface based on enhanced database schema
export interface Supplier {
  id: string;
  supplier_code: string | null;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  tax_id: string | null;
  payment_terms: string | null;
  credit_limit: number;
  current_balance: number;
  status: "active" | "inactive" | "suspended";
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Supplier-specific filter types
export interface SupplierFilters extends BaseFilters {
  status?: "active" | "inactive" | "suspended";
  city?: string;
  country?: string;
  hasContact?: boolean;
  minRating?: number;
  maxRating?: number;
}

// Supplier creation data
export interface CreateSupplierData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  rating?: number;
  notes?: string;
  status?: "active" | "inactive" | "suspended";
}

// Supplier update data
export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id?: never; // Prevent ID from being updated
}

// Supplier with stats
export interface SupplierWithStats extends Supplier {
  productCount: number;
  totalPurchases: number;
  lastPurchaseDate?: string;
}

class SupplierService {
  private tableName = "suppliers";

  // Generate supplier code
  private generateSupplierCode(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `SUPP-${timestamp}${random}`;
  }

  // Get all suppliers with filters and pagination
  async getAll(
    filters: SupplierFilters & PaginationParams = {}
  ): Promise<ApiResponse<Supplier[]>> {
    try {
      let query = supabase.from(this.tableName).select("*");

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,email.ilike.%${filters.search}%,supplier_code.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      if (filters.country) {
        query = query.eq("country", filters.country);
      }

      if (filters.hasContact !== undefined) {
        if (filters.hasContact) {
          query = query.or("email.not.is.null,phone.not.is.null");
        } else {
          query = query.and("email.is.null,phone.is.null");
        }
      }

      if (filters.minRating !== undefined) {
        query = query.gte("rating", filters.minRating);
      }

      if (filters.maxRating !== undefined) {
        query = query.lte("rating", filters.maxRating);
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

  // Get supplier by ID
  async getById(id: string): Promise<ApiResponse<Supplier>> {
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
        return createErrorResponse("Supplier not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new supplier
  async create(
    supplierData: CreateSupplierData
  ): Promise<ApiResponse<Supplier>> {
    try {
      const supplierCode = this.generateSupplierCode();

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          supplier_code: supplierCode,
          ...supplierData,
          country: supplierData.country || "Thailand",
          status: supplierData.status || "active",
          credit_limit: supplierData.credit_limit || 0,
          current_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data, "Supplier created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update supplier
  async update(
    id: string,
    updateData: UpdateSupplierData
  ): Promise<ApiResponse<Supplier>> {
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
        return createErrorResponse("Supplier not found");
      }

      return createSuccessResponse(data, "Supplier updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Delete supplier (soft delete by setting status to inactive)
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Supplier deactivated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get supplier count
  async count(filters: SupplierFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      if (filters.country) {
        query = query.eq("country", filters.country);
      }

      if (filters.hasContact !== undefined) {
        if (filters.hasContact) {
          query = query.or("email.not.is.null,phone.not.is.null");
        } else {
          query = query.is("email", null).is("phone", null);
        }
      }

      if (filters.minRating !== undefined) {
        query = query.gte("rating", filters.minRating);
      }

      if (filters.maxRating !== undefined) {
        query = query.lte("rating", filters.maxRating);
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

  // Get supplier statistics
  async getStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      suspended: number;
      avgRating: number;
    }>
  > {
    try {
      const [totalResult, activeResult, inactiveResult, suspendedResult] =
        await Promise.all([
          this.count(),
          this.count({ status: "active" }),
          this.count({ status: "inactive" }),
          this.count({ status: "suspended" }),
        ]);

      if (
        !totalResult.success ||
        !activeResult.success ||
        !inactiveResult.success ||
        !suspendedResult.success
      ) {
        return createErrorResponse("Failed to fetch supplier statistics");
      }

      // Get average rating
      const { data: ratingData, error: ratingError } = await supabase
        .from(this.tableName)
        .select("rating")
        .not("rating", "is", null);

      if (ratingError) {
        return createErrorResponse(handleSupabaseError(ratingError));
      }

      const avgRating =
        ratingData && ratingData.length > 0
          ? ratingData.reduce((sum, item) => sum + (item.rating || 0), 0) /
            ratingData.length
          : 0;

      const stats = {
        total: totalResult.data || 0,
        active: activeResult.data || 0,
        inactive: inactiveResult.data || 0,
        suspended: suspendedResult.data || 0,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      };

      return createSuccessResponse(stats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Search suppliers by name, code, or contact
  async search(query: string, limit = 10): Promise<ApiResponse<Supplier[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .or(
          `name.ilike.%${query}%,supplier_code.ilike.%${query}%,contact_person.ilike.%${query}%`
        )
        .eq("status", "active")
        .limit(limit)
        .order("name");

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get suppliers with product statistics
  async getSuppliersWithStats(): Promise<ApiResponse<SupplierWithStats[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          products!inner(count)
        `
        )
        .eq("status", "active");

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      // Transform data to include stats
      const suppliersWithStats: SupplierWithStats[] = (data || []).map(
        (supplier) => ({
          ...supplier,
          productCount: supplier.products?.length || 0,
          totalPurchases: 0, // TODO: Calculate from purchase_orders table
          lastPurchaseDate: undefined, // TODO: Get from purchase_orders table
        })
      );

      return createSuccessResponse(suppliersWithStats);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update supplier balance
  async updateBalance(
    id: string,
    amount: number,
    type: "increase" | "decrease"
  ): Promise<ApiResponse<Supplier>> {
    try {
      // First get current balance
      const { data: currentSupplier, error: fetchError } = await supabase
        .from(this.tableName)
        .select("current_balance")
        .eq("id", id)
        .single();

      if (fetchError) {
        return createErrorResponse(handleSupabaseError(fetchError));
      }

      if (!currentSupplier) {
        return createErrorResponse("Supplier not found");
      }

      // Calculate new balance
      const newBalance =
        type === "increase"
          ? currentSupplier.current_balance + amount
          : currentSupplier.current_balance - amount;

      // Update balance
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          current_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(
        data,
        "Supplier balance updated successfully"
      );
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const supplierService = new SupplierService();
export default supplierService;
