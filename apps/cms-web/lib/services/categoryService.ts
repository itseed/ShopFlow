import { supabase } from "../supabase";
import { categories as categoriesApi } from "@shopflow/api";
import { Database } from "@shopflow/types";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(options?: {
    activeOnly?: boolean;
    includeProductCount?: boolean;
  }) {
    if (options?.includeProductCount) {
      let query = supabase.from("categories").select(`
          *,
          products (count)
        `);

      if (options?.activeOnly) {
        query = query.eq("is_active", true);
      }

      query = query.order("display_order", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
    } else {
      const data = await categoriesApi.getAll();
      const filtered = options?.activeOnly
        ? (data || []).filter((c: any) => c.is_active)
        : data || [];
      return filtered.sort((a: any, b: any) =>
        (a.display_order ?? 0) - (b.display_order ?? 0)
      );
    }
  }

  /**
   * Get a single category by ID
   */
  static async getCategory(id: string) {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        products (
          id,
          name,
          status,
          stock
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Category not found");
      }
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new category
   */
  static async createCategory(category: CategoryInsert) {
    const data = await categoriesApi.create(category);
    return data;
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, updates: CategoryUpdate) {
    const data = await categoriesApi.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    } as any);
    return data;
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string) {
    // First check if category has products
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      throw new Error(`Failed to check category usage: ${countError.message}`);
    }

    if (count && count > 0) {
      throw new Error("Cannot delete category that contains products");
    }

    await categoriesApi.delete(id);
    return true;
  }

  /**
   * Update category display order
   */
  static async updateDisplayOrder(
    categories: { id: string; display_order: number }[]
  ) {
    const updates = categories.map(({ id, display_order }) =>
      supabase
        .from("categories")
        .update({
          display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
    );

    const results = await Promise.all(updates);

    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      throw new Error(
        `Failed to update display order: ${errors[0].error?.message}`
      );
    }

    return true;
  }
}
