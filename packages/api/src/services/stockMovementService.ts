import { supabase } from "../supabase";
import {
  StockMovement,
  CreateStockMovement,
  StockMovementFilters,
  StockMovementType,
  ReferenceType,
} from "@shopflow/types";

export class StockMovementService {
  /**
   * Get all stock movements with optional filtering
   */
  async getStockMovements(filters: StockMovementFilters = {}) {
    try {
      let query = supabase
        .from("stock_movements")
        .select(
          `
          *,
          product:products(id, name, sku, category:categories(name)),
          branch:branches(id, name),
          created_by_user:user_profiles!stock_movements_created_by_fkey(id, display_name)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.product_id) {
        query = query.eq("product_id", filters.product_id);
      }

      if (filters.movement_type) {
        query = query.eq("movement_type", filters.movement_type);
      }

      if (filters.reference_type) {
        query = query.eq("reference_type", filters.reference_type);
      }

      if (filters.branch_id) {
        query = query.eq("branch_id", filters.branch_id);
      }

      if (filters.created_by) {
        query = query.eq("created_by", filters.created_by);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      if (filters.min_quantity) {
        query = query.gte("quantity_change", filters.min_quantity);
      }

      if (filters.max_quantity) {
        query = query.lte("quantity_change", filters.max_quantity);
      }

      if (filters.search) {
        query = query.or(
          `products.name.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as StockMovement[];
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      throw error;
    }
  }

  /**
   * Get stock movements for a specific product
   */
  async getProductStockMovements(productId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(
          `
          *,
          branch:branches(id, name),
          created_by_user:user_profiles!stock_movements_created_by_fkey(id, display_name)
        `
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as StockMovement[];
    } catch (error) {
      console.error("Error fetching product stock movements:", error);
      throw error;
    }
  }

  /**
   * Create a new stock movement
   */
  async createStockMovement(movementData: CreateStockMovement, userId: string) {
    try {
      // First, get the current stock to calculate before/after quantities
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", movementData.product_id)
        .single();

      if (productError) throw productError;
      if (!product) throw new Error("Product not found");

      const quantityBefore = product.stock;
      const quantityAfter = quantityBefore + movementData.quantity_change;

      // Validate that stock won't go negative (except for adjustments)
      if (quantityAfter < 0 && movementData.movement_type !== "adjustment") {
        throw new Error("Insufficient stock for this movement");
      }

      // Calculate total value if unit cost is provided
      const totalValue = movementData.unit_cost
        ? Math.abs(movementData.quantity_change) * movementData.unit_cost
        : null;

      // Create the stock movement record
      const { data: movement, error: movementError } = await supabase
        .from("stock_movements")
        .insert([
          {
            ...movementData,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            total_value: totalValue,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (movementError) throw movementError;

      // Update the product stock
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: quantityAfter })
        .eq("id", movementData.product_id);

      if (updateError) throw updateError;

      return movement as StockMovement;
    } catch (error) {
      console.error("Error creating stock movement:", error);
      throw error;
    }
  }

  /**
   * Get stock movement summary by type for a date range
   */
  async getStockMovementSummary(
    dateFrom?: string,
    dateTo?: string,
    branchId?: string
  ) {
    try {
      let query = supabase
        .from("stock_movements")
        .select("movement_type, quantity_change, total_value");

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("created_at", dateTo);
      }

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by movement type
      const summary = data.reduce((acc: any, movement) => {
        const type = movement.movement_type;
        if (!acc[type]) {
          acc[type] = {
            movement_type: type,
            total_movements: 0,
            total_quantity_in: 0,
            total_quantity_out: 0,
            total_value: 0,
          };
        }

        acc[type].total_movements++;

        if (movement.quantity_change > 0) {
          acc[type].total_quantity_in += movement.quantity_change;
        } else {
          acc[type].total_quantity_out += Math.abs(movement.quantity_change);
        }

        if (movement.total_value) {
          acc[type].total_value += movement.total_value;
        }

        return acc;
      }, {});

      return Object.values(summary);
    } catch (error) {
      console.error("Error fetching stock movement summary:", error);
      throw error;
    }
  }

  /**
   * Get low stock products (stock <= min_stock)
   */
  async getLowStockProducts(branchId?: string) {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          id, name, sku, stock, min_stock,
          category:categories(name),
          supplier:suppliers(name)
        `
        )
        .lte("stock", "min_stock");

      if (branchId) {
        // If branch-specific inventory is implemented later
        // query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order("stock", { ascending: true });
      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      throw error;
    }
  }

  /**
   * Get out of stock products
   */
  async getOutOfStockProducts(branchId?: string) {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          id, name, sku, stock, min_stock,
          category:categories(name),
          supplier:suppliers(name)
        `
        )
        .eq("stock", 0);

      if (branchId) {
        // If branch-specific inventory is implemented later
        // query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching out of stock products:", error);
      throw error;
    }
  }

  /**
   * Bulk update stock levels (for inventory adjustments)
   */
  async bulkStockAdjustment(
    adjustments: Array<{
      product_id: string;
      new_quantity: number;
      reason?: string;
      notes?: string;
    }>,
    userId: string,
    branchId?: string
  ) {
    try {
      const movements = [];
      const productUpdates = [];

      for (const adjustment of adjustments) {
        // Get current stock
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", adjustment.product_id)
          .single();

        if (productError) throw productError;
        if (!product) continue;

        const quantityChange = adjustment.new_quantity - product.stock;

        if (quantityChange !== 0) {
          movements.push({
            product_id: adjustment.product_id,
            movement_type: "adjustment" as StockMovementType,
            quantity_change: quantityChange,
            quantity_before: product.stock,
            quantity_after: adjustment.new_quantity,
            reason: adjustment.reason || "Bulk inventory adjustment",
            notes: adjustment.notes,
            branch_id: branchId,
            created_by: userId,
          });

          productUpdates.push({
            id: adjustment.product_id,
            stock: adjustment.new_quantity,
          });
        }
      }

      // Insert stock movements
      if (movements.length > 0) {
        const { error: movementError } = await supabase
          .from("stock_movements")
          .insert(movements);

        if (movementError) throw movementError;
      }

      // Update product stocks
      for (const update of productUpdates) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: update.stock })
          .eq("id", update.id);

        if (updateError) throw updateError;
      }

      return {
        movements_created: movements.length,
        products_updated: productUpdates.length,
      };
    } catch (error) {
      console.error("Error performing bulk stock adjustment:", error);
      throw error;
    }
  }

  /**
   * Get inventory value summary
   */
  async getInventoryValueSummary(branchId?: string) {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          id, name, stock, cost_price, price,
          category:categories(id, name)
        `
        )
        .gt("stock", 0);

      if (branchId) {
        // If branch-specific inventory is implemented later
        // query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = data.reduce(
        (acc: any, product: any) => {
          const categoryId = product.category?.id || "uncategorized";
          const categoryName = product.category?.name || "Uncategorized";

          const costValue = (product.cost_price || 0) * product.stock;
          const retailValue = product.price * product.stock;

          if (!acc.categories[categoryId]) {
            acc.categories[categoryId] = {
              category_id: categoryId,
              category_name: categoryName,
              total_cost_value: 0,
              total_retail_value: 0,
              product_count: 0,
              total_stock: 0,
            };
          }

          acc.categories[categoryId].total_cost_value += costValue;
          acc.categories[categoryId].total_retail_value += retailValue;
          acc.categories[categoryId].product_count++;
          acc.categories[categoryId].total_stock += product.stock;

          acc.totals.total_cost_value += costValue;
          acc.totals.total_retail_value += retailValue;
          acc.totals.total_products++;
          acc.totals.total_stock += product.stock;

          return acc;
        },
        {
          categories: {},
          totals: {
            total_cost_value: 0,
            total_retail_value: 0,
            total_products: 0,
            total_stock: 0,
          },
        }
      );

      return {
        categories: Object.values(summary.categories),
        ...summary.totals,
      };
    } catch (error) {
      console.error("Error fetching inventory value summary:", error);
      throw error;
    }
  }
}

export const stockMovementService = new StockMovementService();
