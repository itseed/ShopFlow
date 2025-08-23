import { supabase } from "../supabase";
import { Database } from "@shopflow/types";
import { StorageService } from "./storageService";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export class ProductService {
  /**
   * Get all products with optional filtering
   */
  static async getProducts(options?: {
    categoryId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase.from("products").select(`
        *,
        categories (
          id,
          name
        )
      `);

    if (options?.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,description.ilike.%${options.search}%,sku.ilike.%${options.search}%`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Product not found");
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new product
   */
  static async createProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return true;
  }

  /**
   * Update product stock
   */
  static async updateStock(id: string, stock: number) {
    const { data, error } = await supabase
      .from("products")
      .update({
        stock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name, stock, min_stock, status")
      .single();

    if (error) {
      throw new Error(`Failed to update stock: ${error.message}`);
    }

    return data;
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock, min_stock, status")
      .filter("stock", "lte", "min_stock")
      .eq("status", "active")
      .order("stock", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Search products for POS
   */
  static async searchProductsForPOS(query: string, limit = 20) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        sku,
        name,
        price,
        discount_price,
        stock,
        images,
        categories (
          id,
          name
        )
      `
      )
      .eq("status", "active")
      .gt("stock", 0)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(limit)
      .order("name");

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data || [];
  }
}
