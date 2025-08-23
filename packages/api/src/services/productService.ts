import { supabase } from "../supabase";
import { Product, ProductStatus } from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Product-specific filter types
export interface ProductFilters extends BaseFilters {
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

// Product creation/update data types
export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  stock: number;
  low_stock_threshold?: number;
  category_id?: string;
  status?: ProductStatus;
  images?: string[];
  barcode?: string;
  tags?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id?: never; // Prevent ID from being updated
}

// Stock update data
export interface StockUpdateData {
  quantity: number;
  type: "set" | "add" | "subtract";
  reason?: string;
}

class ProductService {
  private tableName = "products";

  // Get all products with filters and pagination
  async getAll(
    filters: ProductFilters & PaginationParams = {}
  ): Promise<ApiResponse<Product[]>> {
    try {
      let query = supabase.from(this.tableName).select(`
        *,
        category:categories(id, name, description)
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice);
      }

      if (filters.inStock) {
        query = query.gt("stock", 0);
      }

      if (filters.lowStock) {
        query = query.or("stock.lte.low_stock_threshold,stock.eq.0");
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

  // Get product by ID
  async getById(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          category:categories(id, name, description)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Product not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new product
  async create(productData: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...productData,
          status: productData.status || "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          category:categories(id, name, description)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data, "Product created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update product
  async update(
    id: string,
    updateData: UpdateProductData
  ): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          category:categories(id, name, description)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Product not found");
      }

      return createSuccessResponse(data, "Product updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Delete product
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Product deleted successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update stock quantity
  async updateStock(
    id: string,
    stockData: StockUpdateData
  ): Promise<ApiResponse<Product>> {
    try {
      // First get current stock
      const { data: currentProduct, error: fetchError } = await supabase
        .from(this.tableName)
        .select("stock")
        .eq("id", id)
        .single();

      if (fetchError) {
        return createErrorResponse(handleSupabaseError(fetchError));
      }

      if (!currentProduct) {
        return createErrorResponse("Product not found");
      }

      // Calculate new stock
      let newStock: number;
      switch (stockData.type) {
        case "set":
          newStock = stockData.quantity;
          break;
        case "add":
          newStock = currentProduct.stock + stockData.quantity;
          break;
        case "subtract":
          newStock = currentProduct.stock - stockData.quantity;
          break;
        default:
          return createErrorResponse("Invalid stock update type");
      }

      // Ensure stock doesn't go negative
      if (newStock < 0) {
        return createErrorResponse("Stock quantity cannot be negative");
      }

      // Update stock
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          category:categories(id, name, description)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data, "Stock updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get products by category
  async getByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
    return this.getAll({ categoryId });
  }

  // Get low stock products
  async getLowStock(): Promise<ApiResponse<Product[]>> {
    return this.getAll({ lowStock: true });
  }

  // Search products by barcode
  async getByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          category:categories(id, name, description)
        `
        )
        .eq("barcode", barcode)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Product not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get product count with filters
  async count(filters: ProductFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("id", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.inStock) {
        query = query.gt("stock", 0);
      }

      if (filters.lowStock) {
        query = query.or("stock.lte.low_stock_threshold,stock.eq.0");
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

  // Bulk update products
  async bulkUpdate(
    updates: Array<{ id: string; data: UpdateProductData }>
  ): Promise<ApiResponse<Product[]>> {
    try {
      const updatePromises = updates.map(({ id, data }) =>
        this.update(id, data)
      );
      const results = await Promise.allSettled(updatePromises);

      const successful = results
        .filter(
          (result): result is PromiseFulfilledResult<ApiResponse<Product>> =>
            result.status === "fulfilled" &&
            result.value.success &&
            result.value.data !== null
        )
        .map((result) => result.value.data as Product);

      const failed = results.filter(
        (result) => result.status === "rejected" || !result.value.success
      ).length;

      if (failed > 0) {
        return createSuccessResponse(
          successful,
          `${successful.length} products updated, ${failed} failed`
        );
      }

      return createSuccessResponse(
        successful,
        `All ${successful.length} products updated successfully`
      );
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
