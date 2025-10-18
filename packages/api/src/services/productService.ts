import { supabase } from "../supabase";
import { Product, ProductStatus, LowStockProduct } from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";
import { stockMovementService } from "./stockMovementService";

// Product-specific filter types
export interface ProductFilters extends BaseFilters {
  categoryId?: string;
  supplierId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  brand?: string;
  isFeatured?: boolean;
}

// Product creation/update data types
export interface CreateProductData {
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  cost_price?: number;
  discount_price?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  weight?: number;
  category_id?: string;
  supplier_id?: string;
  brand?: string;
  status?: ProductStatus;
  images?: string[];
  tags?: string[];
  meta_data?: Record<string, any>;
  is_featured?: boolean;
  is_trackable?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id?: never; // Prevent ID from being updated
}

// Stock update data
export interface StockUpdateData {
  quantity: number;
  type: "set" | "add" | "subtract";
  reason?: string;
  user_id: string;
  reference_id?: string;
  reference_number?: string;
  branch_id?: string;
}

class ProductService {
  private tableName = "products";
  private lowStockViewName = "low_stock_products";

  // Get all products with filters and pagination
  async getAll(
    filters: ProductFilters & PaginationParams = {}
  ): Promise<ApiResponse<Product[] | LowStockProduct[]>> {
    try {
      const from = filters.lowStock ? this.lowStockViewName : this.tableName;
      let query;

      if (filters.lowStock) {
        query = supabase.from(from).select("*");
      } else {
        query = supabase.from(from).select(
          `
        *,
        category:categories(id, name, description),
        supplier:suppliers(id, name, contact_person, email, phone)
      `
        );
      }

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.supplierId) {
        query = query.eq("supplier_id", filters.supplierId);
      }

      if (filters.brand) {
        query = query.ilike("brand", `%${filters.brand}%`);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq("is_featured", filters.isFeatured);
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
          category:categories(id, name, description),
          supplier:suppliers(id, name, contact_person, email, phone)
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
          category:categories(id, name, description),
          supplier:suppliers(id, name, contact_person, email, phone)
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
          category:categories(id, name, description),
          supplier:suppliers(id, name, contact_person, email, phone)
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
      const { data, error } = await supabase.rpc("update_stock", {
        product_id_param: id,
        quantity_change_param:
          stockData.type === "subtract" ? -stockData.quantity : stockData.quantity,
        movement_type_param: stockData.type,
        reason_param: stockData.reason,
        user_id_param: stockData.user_id,
        reference_id_param: stockData.reference_id,
        reference_number_param: stockData.reference_number,
        branch_id_param: stockData.branch_id,
      });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (data.error) {
        return createErrorResponse(data.error);
      }

      return createSuccessResponse(data.product, "Stock updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get products by category
  async getByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
    return this.getAll({ categoryId }) as Promise<ApiResponse<Product[]>>;
  }

  // Get low stock products
  async getLowStock(): Promise<ApiResponse<LowStockProduct[]>> {
    return this.getAll({ lowStock: true }) as Promise<
      ApiResponse<LowStockProduct[]>
    >;
  }

  // Search products by barcode
  async getByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          category:categories(id, name, description),
          supplier:suppliers(id, name, contact_person, email, phone)
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

  // Get count with filters
  async count(filters: ProductFilters = {}): Promise<ApiResponse<number>> {
    try {
      // For low stock filter, use the dedicated function
      if (filters.lowStock) {
        const { data, error } = await supabase.rpc("get_low_stock_count");
        if (error) {
          return createErrorResponse(handleSupabaseError(error));
        }
        return createSuccessResponse(data || 0);
      }

      // For other filters, use efficient count query
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

      if (filters.supplierId) {
        query = query.eq("supplier_id", filters.supplierId);
      }

      if (filters.brand) {
        query = query.ilike("brand", `%${filters.brand}%`);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq("is_featured", filters.isFeatured);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.inStock) {
        query = query.gt("stock", 0);
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

  // Get products by supplier
  async getBySupplier(supplierId: string): Promise<ApiResponse<Product[]>> {
    return this.getAll({ supplierId }) as Promise<ApiResponse<Product[]>>;
  }

  // Get featured products
  async getFeatured(limit?: number): Promise<ApiResponse<Product[]>> {
    return this.getAll({ isFeatured: true }) as Promise<ApiResponse<Product[]>>;
  }

  // Get products by brand
  async getByBrand(
    brand: string,
    limit?: number
  ): Promise<ApiResponse<Product[]>> {
    return this.getAll({ brand, limit }) as Promise<ApiResponse<Product[]>>;
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