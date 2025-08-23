import { supabase } from "../supabase";
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
      let query = supabase.from("categories").select("*");

      if (options?.activeOnly) {
        query = query.eq("is_active", true);
      }

      query = query.order("display_order", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
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
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from("categories")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

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

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }

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
