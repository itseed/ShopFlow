import { supabase } from "../supabase";
import { Category, CategoryStatus } from "@shopflow/types";
import {
  ApiResponse,
  BaseFilters,
  PaginationParams,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

// Category-specific filter types
export interface CategoryFilters extends BaseFilters {
  status?: CategoryStatus;
  parentId?: string | null;
  hasProducts?: boolean;
}

// Category creation/update data types
export interface CreateCategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  display_order?: number;
  status?: CategoryStatus;
  image?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id?: never; // Prevent ID from being updated
}

class CategoryService {
  private tableName = "categories";

  // Get all categories with filters and pagination
  async getAll(
    filters: CategoryFilters & PaginationParams = {}
  ): Promise<ApiResponse<Category[]>> {
    try {
      let query = supabase.from(this.tableName).select(`
        *,
        parent:parent_id(id, name),
        children:categories!parent_id(id, name, status),
        product_count:products(count)
      `);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.parentId) {
        query = query.eq("parent_id", filters.parentId);
      } else if (filters.parentId === null) {
        query = query.is("parent_id", null);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "display_order";
      const sortOrder = filters.sortOrder || "asc";
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

  // Get category by ID
  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          parent:parent_id(id, name),
          children:categories!parent_id(id, name, status),
          product_count:products(count)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Category not found");
      }

      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Create new category
  async create(
    categoryData: CreateCategoryData
  ): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...categoryData,
          status: categoryData.status || "active",
          display_order: categoryData.display_order || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          parent:parent_id(id, name),
          children:categories!parent_id(id, name, status),
          product_count:products(count)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data, "Category created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update category
  async update(
    id: string,
    updateData: UpdateCategoryData
  ): Promise<ApiResponse<Category>> {
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
          parent:parent_id(id, name),
          children:categories!parent_id(id, name, status),
          product_count:products(count)
        `
        )
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      if (!data) {
        return createErrorResponse("Category not found");
      }

      return createSuccessResponse(data, "Category updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Delete category
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      // Check if category has products
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id)
        .limit(1);

      if (productError) {
        return createErrorResponse(handleSupabaseError(productError));
      }

      if (products && products.length > 0) {
        return createErrorResponse(
          "Cannot delete category that contains products"
        );
      }

      // Check if category has subcategories
      const { data: subcategories, error: subcatError } = await supabase
        .from(this.tableName)
        .select("id")
        .eq("parent_id", id)
        .limit(1);

      if (subcatError) {
        return createErrorResponse(handleSupabaseError(subcatError));
      }

      if (subcategories && subcategories.length > 0) {
        return createErrorResponse(
          "Cannot delete category that has subcategories"
        );
      }

      // Delete the category
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(null, "Category deleted successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get root categories (no parent)
  async getRootCategories(): Promise<ApiResponse<Category[]>> {
    return this.getAll({ parentId: null });
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    try {
      // Get all categories
      const response = await this.getAll();
      if (!response.success || !response.data) {
        return response;
      }

      const categories = response.data;

      // Build tree structure
      const categoryMap = new Map<
        string,
        Category & { children: Category[] }
      >();
      const rootCategories: (Category & { children: Category[] })[] = [];

      // First pass: create map and add children array
      categories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Second pass: build tree
      categories.forEach((cat) => {
        const categoryWithChildren = categoryMap.get(cat.id)!;

        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      return createSuccessResponse(rootCategories);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get categories with product count
  async getCategoriesWithProductCount(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(
          `
          *,
          product_count:products(count)
        `
        )
        .order("display_order", { ascending: true });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Update display order
  async updateDisplayOrder(
    categories: Array<{ id: string; display_order: number }>
  ): Promise<ApiResponse<void>> {
    try {
      const updatePromises = categories.map(({ id, display_order }) =>
        supabase
          .from(this.tableName)
          .update({
            display_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
      );

      const results = await Promise.all(updatePromises);
      const failed = results.filter((result) => result.error);

      if (failed.length > 0) {
        return createErrorResponse(
          `Failed to update ${failed.length} categories`
        );
      }

      return createSuccessResponse(null, "Display order updated successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get subcategories of a parent category
  async getSubcategories(parentId: string): Promise<ApiResponse<Category[]>> {
    return this.getAll({ parentId });
  }

  // Get category count with filters
  async count(filters: CategoryFilters = {}): Promise<ApiResponse<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("id", { count: "exact", head: true });

      // Apply same filters as getAll
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.parentId) {
        query = query.eq("parent_id", filters.parentId);
      } else if (filters.parentId === null) {
        query = query.is("parent_id", null);
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
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
