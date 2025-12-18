import { supabase } from "../supabase";
import { products as productsApi } from "@shopflow/api";
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
    const { data, count } = await productsApi.getAll({
      categoryId: options?.categoryId,
      search: options?.search,
      limit: options?.limit,
      offset: options?.offset,
    });
    return { data: data || [], count: count || 0 };
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(id: string) {
    const data = await productsApi.getById(id);
    return data as any;
  }

  /**
   * Create a new product
   */
  static async createProduct(product: ProductInsert) {
    const data = await productsApi.create(product);
    return data as any;
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, updates: ProductUpdate) {
    const data = await productsApi.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    } as any);
    return data as any;
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string) {
    await productsApi.delete(id);
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
    const data = await productsApi.getLowStock(undefined, 10);
    return data as any[];
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
