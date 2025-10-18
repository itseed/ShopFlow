/**
 * Core Service - Products, Categories, and Inventory Management
 * Consolidates: productService, categoryService, inventoryService
 * Phase 1: Foundation Refactor
 */

import { supabase } from "../supabase";
import type { Database } from "@shopflow/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

type InventoryMovement =
  Database["public"]["Tables"]["inventory_movements"]["Row"];

/**
 * Product Management
 */
export const products = {
  /**
   * Get all products with optional filters
   */
  async getAll(params?: {
    branchId?: string;
    categoryId?: string;
    search?: string;
    inStock?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from("products")
      .select("*, categories(id, name)", { count: "exact" });

    if (params?.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params?.categoryId) {
      query = query.eq("category_id", params.categoryId);
    }

    if (params?.search) {
      query = query.or(
        `name.ilike.%${params.search}%,sku.ilike.%${params.search}%`
      );
    }

    if (params?.inStock) {
      query = query.gt("stock_quantity", 0);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(
        params.offset,
        params.offset + (params.limit || 10) - 1
      );
    }

    query = query.order("name");

    const { data, error, count } = await query;

    if (error) throw error;

    return { data: data as Product[], count };
  },

  /**
   * Get product by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(id, name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Product;
  },

  /**
   * Get product by SKU
   */
  async getBySku(sku: string, branchId?: string) {
    let query = supabase
      .from("products")
      .select("*, categories(id, name)")
      .eq("sku", sku);

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data as Product;
  },

  /**
   * Create new product
   */
  async create(product: ProductInsert) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  /**
   * Update product
   */
  async update(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  /**
   * Delete product
   */
  async delete(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get low stock products
   */
  async getLowStock(branchId?: string, threshold: number = 10) {
    let query = supabase
      .from("products")
      .select("*, categories(id, name)")
      .lte("stock_quantity", threshold)
      .gt("stock_quantity", 0);

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query.order("stock_quantity");

    if (error) throw error;
    return data as Product[];
  },

  /**
   * Get out of stock products
   */
  async getOutOfStock(branchId?: string) {
    let query = supabase
      .from("products")
      .select("*, categories(id, name)")
      .eq("stock_quantity", 0);

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;
    return data as Product[];
  },
};

/**
 * Category Management
 */
export const categories = {
  /**
   * Get all categories
   */
  async getAll(params?: { branchId?: string; parentId?: string | null }) {
    let query = supabase.from("categories").select("*");

    if (params?.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params?.parentId !== undefined) {
      if (params.parentId === null) {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", params.parentId);
      }
    }

    query = query.order("name");

    const { data, error } = await query;

    if (error) throw error;
    return data as Category[];
  },

  /**
   * Get category by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Category;
  },

  /**
   * Create new category
   */
  async create(category: CategoryInsert) {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  /**
   * Update category
   */
  async update(id: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  /**
   * Delete category
   */
  async delete(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get category tree (with children)
   */
  async getTree(branchId?: string) {
    // Get all categories
    let query = supabase.from("categories").select("*");

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;

    // Build tree structure
    const categories = data as Category[];
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    // Initialize map
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build tree
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  },
};

/**
 * Inventory Management
 */
export const inventory = {
  /**
   * Get stock levels for products
   */
  async getStockLevels(params?: { branchId?: string; productIds?: string[] }) {
    let query = supabase
      .from("products")
      .select("id, name, sku, stock_quantity, unit, categories(name)");

    if (params?.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params?.productIds && params.productIds.length > 0) {
      query = query.in("id", params.productIds);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;
    return data;
  },

  /**
   * Update stock quantity
   */
  async updateStock(params: {
    productId: string;
    branchId: string;
    quantity: number;
    movementType:
      | "sale"
      | "purchase"
      | "adjustment_in"
      | "adjustment_out"
      | "transfer_in"
      | "transfer_out"
      | "return";
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    userId?: string;
  }) {
    const {
      productId,
      branchId,
      quantity,
      movementType,
      referenceType,
      referenceId,
      notes,
      userId,
    } = params;

    // Get current stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single();

    if (productError) throw productError;

    // Calculate new stock
    const isPositive = [
      "purchase",
      "adjustment_in",
      "transfer_in",
      "return",
    ].includes(movementType);
    const newStock = isPositive
      ? product.stock_quantity + quantity
      : product.stock_quantity - quantity;

    // Update product stock
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_quantity: Math.max(0, newStock) })
      .eq("id", productId);

    if (updateError) throw updateError;

    // Record movement
    const { data: movement, error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        product_id: productId,
        branch_id: branchId,
        quantity: quantity,
        movement_type: movementType,
        reference_type: referenceType,
        reference_id: referenceId,
        notes: notes,
        created_by: userId,
      })
      .select()
      .single();

    if (movementError) throw movementError;

    return {
      oldStock: product.stock_quantity,
      newStock: Math.max(0, newStock),
      movement: movement as InventoryMovement,
    };
  },

  /**
   * Get inventory movements history
   */
  async getMovements(params?: {
    productId?: string;
    branchId?: string;
    movementType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = supabase
      .from("inventory_movements")
      .select("*, products(name, sku)");

    if (params?.productId) {
      query = query.eq("product_id", params.productId);
    }

    if (params?.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    if (params?.movementType) {
      query = query.eq("movement_type", params.movementType);
    }

    if (params?.startDate) {
      query = query.gte("created_at", params.startDate);
    }

    if (params?.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data as InventoryMovement[];
  },

  /**
   * Get low stock products view
   */
  async getLowStockView(branchId?: string) {
    // This uses the low_stock_view created in migration
    let query = supabase.from("low_stock_view").select("*");

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
};

/**
 * Core Service - Main Export
 */
export const coreService = {
  products,
  categories,
  inventory,
};

export default coreService;
